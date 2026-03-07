-- ============================================================
-- VANTA — Migration v5 → v7
-- Aplica apenas o que está faltando no banco existente.
-- Seguro de rodar múltiplas vezes (IF NOT EXISTS em tudo).
-- Execute no SQL Editor do Supabase Dashboard.
-- ============================================================


-- ── 1. comunidades — colunas financeiras ────────────────────

ALTER TABLE comunidades
  ADD COLUMN IF NOT EXISTS vanta_fee_percent  NUMERIC(5,4),
  ADD COLUMN IF NOT EXISTS vanta_fee_fixed    NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vanta_fee_mode     TEXT NOT NULL DEFAULT 'ABSORVER'
    CHECK (vanta_fee_mode IN ('ABSORVER', 'REPASSAR'));


-- ── 2. eventos_admin — colunas financeiras ──────────────────

ALTER TABLE eventos_admin
  ADD COLUMN IF NOT EXISTS vanta_fee_percent  NUMERIC(5,4),
  ADD COLUMN IF NOT EXISTS vanta_fee_fixed    NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vanta_fee_mode     TEXT NOT NULL DEFAULT 'ABSORVER'
    CHECK (vanta_fee_mode IN ('ABSORVER', 'REPASSAR'));


-- ── 3. tickets_caixa — titular, CPF, selfie ─────────────────

ALTER TABLE tickets_caixa
  ADD COLUMN IF NOT EXISTS nome_titular TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS cpf          TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS selfie_url   TEXT;


-- ── 4. vendas_log — produtor_id ─────────────────────────────

ALTER TABLE vendas_log
  ADD COLUMN IF NOT EXISTS produtor_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_vendas_log_produtor ON vendas_log(produtor_id);


-- ── 5. regras_lista — hora_corte ────────────────────────────

ALTER TABLE regras_lista
  ADD COLUMN IF NOT EXISTS hora_corte TEXT;
  -- formato 'HH:MM' — regra expira a partir deste horário (Efeito Abóbora)


-- ── 6. atribuicoes_rbac — tabela nova ───────────────────────

CREATE TABLE IF NOT EXISTS atribuicoes_rbac (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tenant_type   TEXT        NOT NULL CHECK (tenant_type IN ('COMUNIDADE', 'EVENTO')),
  tenant_id     UUID        NOT NULL,
  cargo         TEXT        NOT NULL,
  permissoes    TEXT[]      NOT NULL DEFAULT '{}',
  atribuido_por UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  atribuido_em  TIMESTAMPTZ NOT NULL DEFAULT now(),
  ativo         BOOLEAN     NOT NULL DEFAULT true,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, tenant_type, tenant_id, cargo)
);

CREATE INDEX IF NOT EXISTS idx_atrib_user   ON atribuicoes_rbac(user_id);
CREATE INDEX IF NOT EXISTS idx_atrib_tenant ON atribuicoes_rbac(tenant_type, tenant_id);

DROP TRIGGER IF EXISTS atrib_updated_at ON atribuicoes_rbac;
CREATE TRIGGER atrib_updated_at
  BEFORE UPDATE ON atribuicoes_rbac
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE atribuicoes_rbac ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "atrib_rbac: leitura própria ou masteradm" ON atribuicoes_rbac;
CREATE POLICY "atrib_rbac: leitura própria ou masteradm"
  ON atribuicoes_rbac FOR SELECT
  USING (user_id = auth.uid() OR is_masteradm());

DROP POLICY IF EXISTS "atrib_rbac: masteradm escreve" ON atribuicoes_rbac;
CREATE POLICY "atrib_rbac: masteradm escreve"
  ON atribuicoes_rbac FOR ALL USING (is_masteradm());

DROP POLICY IF EXISTS "atrib_rbac: socio atribui em seu evento" ON atribuicoes_rbac;
CREATE POLICY "atrib_rbac: socio atribui em seu evento"
  ON atribuicoes_rbac FOR INSERT
  WITH CHECK (
    (tenant_type = 'EVENTO' AND is_produtor_evento(tenant_id))
    OR is_masteradm()
  );


-- ── 7. soberania_acesso — tabela nova ───────────────────────

CREATE TABLE IF NOT EXISTS soberania_acesso (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id      UUID        NOT NULL REFERENCES eventos_admin(id) ON DELETE CASCADE,
  solicitante_id UUID        NOT NULL REFERENCES profiles(id)      ON DELETE CASCADE,
  status         TEXT        NOT NULL DEFAULT 'PENDENTE'
                             CHECK (status IN ('PENDENTE', 'AUTORIZADO', 'NEGADO')),
  solicitado_em  TIMESTAMPTZ NOT NULL DEFAULT now(),
  decidido_em    TIMESTAMPTZ,
  UNIQUE (evento_id, solicitante_id)
);

CREATE INDEX IF NOT EXISTS idx_soberania_evento      ON soberania_acesso(evento_id);
CREATE INDEX IF NOT EXISTS idx_soberania_solicitante ON soberania_acesso(solicitante_id);

ALTER TABLE soberania_acesso ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "soberania_acesso: leitura própria ou masteradm" ON soberania_acesso;
CREATE POLICY "soberania_acesso: leitura própria ou masteradm"
  ON soberania_acesso FOR SELECT
  USING (solicitante_id = auth.uid() OR is_masteradm() OR is_produtor_evento(evento_id));

DROP POLICY IF EXISTS "soberania_acesso: inserir própria" ON soberania_acesso;
CREATE POLICY "soberania_acesso: inserir própria"
  ON soberania_acesso FOR INSERT WITH CHECK (solicitante_id = auth.uid());

DROP POLICY IF EXISTS "soberania_acesso: socio decide" ON soberania_acesso;
CREATE POLICY "soberania_acesso: socio decide"
  ON soberania_acesso FOR UPDATE
  USING (is_produtor_evento(evento_id) OR is_masteradm());


-- ── 8. RPCs ─────────────────────────────────────────────────

-- queimar_ingresso
CREATE OR REPLACE FUNCTION queimar_ingresso(
  p_ticket_id   UUID,
  p_event_id    UUID,
  p_operador_id UUID DEFAULT NULL
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_ticket tickets_caixa%ROWTYPE;
BEGIN
  SELECT * INTO v_ticket FROM tickets_caixa WHERE id = p_ticket_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('resultado', 'INVALIDO');
  END IF;
  IF v_ticket.evento_id <> p_event_id THEN
    RETURN jsonb_build_object('resultado', 'EVENTO_INCORRETO');
  END IF;
  IF v_ticket.status = 'USADO' THEN
    RETURN jsonb_build_object('resultado', 'JA_UTILIZADO', 'usado_em', v_ticket.usado_em);
  END IF;
  UPDATE tickets_caixa
  SET status = 'USADO', usado_em = now(), usado_por = COALESCE(p_operador_id, auth.uid())
  WHERE id = p_ticket_id;
  RETURN jsonb_build_object('resultado', 'VALIDO');
END;
$$;


-- processar_compra_checkout
CREATE OR REPLACE FUNCTION processar_compra_checkout(
  p_evento_id    UUID,
  p_lote_id      UUID,
  p_variacao_id  UUID,
  p_email        TEXT,
  p_valor_unit   NUMERIC,
  p_quantidade   INTEGER DEFAULT 1,
  p_comprador_id UUID    DEFAULT NULL,
  p_taxa         NUMERIC DEFAULT 0.05
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_ticket_id   UUID;
  v_total_bruto NUMERIC;
  v_tickets     JSONB := '[]'::JSONB;
  i             INTEGER;
BEGIN
  v_total_bruto := p_valor_unit * p_quantidade;
  IF EXISTS (SELECT 1 FROM variacoes_ingresso WHERE id = p_variacao_id AND vendidos >= limite) THEN
    RETURN jsonb_build_object('ok', false, 'erro', 'Ingresso esgotado.');
  END IF;
  FOR i IN 1..p_quantidade LOOP
    INSERT INTO tickets_caixa (evento_id, lote_id, variacao_id, email, owner_id, valor, status)
    VALUES (p_evento_id, p_lote_id, p_variacao_id, p_email, p_comprador_id, p_valor_unit, 'DISPONIVEL')
    RETURNING id INTO v_ticket_id;
    INSERT INTO transactions (evento_id, ticket_id, comprador_id, email, valor_bruto, valor_liquido, taxa_aplicada, status, tipo)
    VALUES (p_evento_id, v_ticket_id, p_comprador_id, p_email, p_valor_unit,
            ROUND(p_valor_unit * (1 - p_taxa), 2), p_taxa, 'CONCLUIDO', 'VENDA_CHECKOUT');
    UPDATE variacoes_ingresso SET vendidos = vendidos + 1 WHERE id = p_variacao_id;
    INSERT INTO vendas_log (evento_id, variacao_id, variacao_label, valor)
    SELECT p_evento_id, p_variacao_id, CONCAT(area, ' · ', genero), p_valor_unit
    FROM variacoes_ingresso WHERE id = p_variacao_id;
    v_tickets := v_tickets || jsonb_build_object('ticketId', v_ticket_id);
  END LOOP;
  RETURN jsonb_build_object(
    'ok', true, 'tickets', v_tickets,
    'totalBruto', v_total_bruto,
    'totalLiquido', ROUND(v_total_bruto * (1 - p_taxa), 2),
    'taxaAplicada', p_taxa
  );
END;
$$;


-- processar_venda_caixa
CREATE OR REPLACE FUNCTION processar_venda_caixa(
  p_evento_id    UUID,
  p_lote_id      UUID,
  p_variacao_id  UUID,
  p_email        TEXT,
  p_valor_unit   NUMERIC,
  p_taxa         NUMERIC DEFAULT 0.05
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_ticket_id UUID;
  v_var       variacoes_ingresso%ROWTYPE;
BEGIN
  SELECT * INTO v_var FROM variacoes_ingresso WHERE id = p_variacao_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'erro', 'Variação não encontrada.');
  END IF;
  IF v_var.vendidos >= v_var.limite THEN
    RETURN jsonb_build_object('ok', false, 'erro', 'Ingresso esgotado.');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM equipe_evento
    WHERE evento_id = p_evento_id AND membro_id = auth.uid() AND papel = 'CAIXA'
  ) AND NOT is_masteradm() THEN
    RETURN jsonb_build_object('ok', false, 'erro', 'Sem permissão de caixa para este evento.');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM eventos_admin WHERE id = p_evento_id AND caixa_ativo = true
  ) THEN
    RETURN jsonb_build_object('ok', false, 'erro', 'Caixa não está ativo para este evento.');
  END IF;
  INSERT INTO tickets_caixa (evento_id, lote_id, variacao_id, email, valor, status, criado_por)
  VALUES (p_evento_id, p_lote_id, p_variacao_id, p_email, p_valor_unit, 'DISPONIVEL', auth.uid())
  RETURNING id INTO v_ticket_id;
  INSERT INTO transactions (evento_id, ticket_id, email, valor_bruto, valor_liquido, taxa_aplicada, status, tipo)
  VALUES (p_evento_id, v_ticket_id, p_email, p_valor_unit,
          ROUND(p_valor_unit * (1 - p_taxa), 2), p_taxa, 'CONCLUIDO', 'VENDA_CAIXA');
  UPDATE variacoes_ingresso SET vendidos = vendidos + 1 WHERE id = p_variacao_id;
  INSERT INTO vendas_log (evento_id, variacao_id, variacao_label, valor)
  VALUES (p_evento_id, p_variacao_id, CONCAT(v_var.area, ' · ', v_var.genero), p_valor_unit);
  RETURN jsonb_build_object(
    'ok', true,
    'ticketId', v_ticket_id,
    'valorLiquido', ROUND(p_valor_unit * (1 - p_taxa), 2),
    'taxaAplicada', p_taxa
  );
END;
$$;


-- ── 9. Realtime — tabelas novas ─────────────────────────────

DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE tickets_caixa;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE solicitacoes_saque;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE vendas_log;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE convidados_lista;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE atribuicoes_rbac;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
