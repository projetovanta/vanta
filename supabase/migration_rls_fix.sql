-- ============================================================
-- VANTA — Migration: Fix RLS vulnerabilidades críticas
-- Execute no SQL Editor do Supabase Dashboard.
-- ============================================================

-- ══════════════════════════════════════════════════════════════
-- 1. PROFILES: restringir UPDATE (qualquer autenticado → só próprio + master)
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "profiles: master atualiza curadoria" ON profiles;
DROP POLICY IF EXISTS "profiles: atualização própria" ON profiles;
DROP POLICY IF EXISTS "profiles: masteradm atualiza tudo" ON profiles;
DROP POLICY IF EXISTS "profiles: usuário atualiza próprio" ON profiles;

-- Próprio perfil
CREATE POLICY "profiles: usuário atualiza próprio"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Masteradm atualiza qualquer (curadoria, tags, notas, etc.)
CREATE POLICY "profiles: masteradm atualiza tudo"
  ON profiles FOR UPDATE
  USING (is_masteradm())
  WITH CHECK (is_masteradm());

-- ══════════════════════════════════════════════════════════════
-- 2. TICKETS_CAIXA: remover INSERT aberto (toda inserção vem via RPC SECURITY DEFINER)
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "tickets: inserção via RPC" ON tickets_caixa;
-- Sem policy de INSERT = só RPCs SECURITY DEFINER conseguem inserir

-- ══════════════════════════════════════════════════════════════
-- 3. TRANSACTIONS: remover INSERT aberto (toda inserção vem via RPC)
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "transactions: inserção via RPC" ON transactions;

-- ══════════════════════════════════════════════════════════════
-- 4. VENDAS_LOG: remover INSERT aberto (toda inserção vem via RPC)
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "vendas_log: inserção via RPC" ON vendas_log;

-- ══════════════════════════════════════════════════════════════
-- 5. QUEIMAR_INGRESSO: adicionar verificação de permissão do operador
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION queimar_ingresso(
  p_ticket_id   UUID,
  p_event_id    UUID,
  p_operador_id UUID DEFAULT NULL
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_ticket tickets_caixa%ROWTYPE;
BEGIN
  -- Verifica permissão: equipe do evento (PORTARIA, CAIXA, SOCIO) ou masteradm
  IF NOT EXISTS (
    SELECT 1 FROM equipe_evento
    WHERE evento_id = p_event_id AND membro_id = auth.uid()
      AND papel IN ('PORTARIA', 'CAIXA', 'SOCIO')
  ) AND NOT is_masteradm() THEN
    RETURN jsonb_build_object('resultado', 'SEM_PERMISSAO');
  END IF;

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

-- ══════════════════════════════════════════════════════════════
-- 6. RPCs: taxa calculada server-side (não aceitar do cliente)
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION processar_compra_checkout(
  p_evento_id    UUID,
  p_lote_id      UUID,
  p_variacao_id  UUID,
  p_email        TEXT,
  p_valor_unit   NUMERIC,
  p_quantidade   INTEGER DEFAULT 1,
  p_comprador_id UUID    DEFAULT NULL,
  p_taxa         NUMERIC DEFAULT 0.05  -- ignorado, calculado abaixo
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_ticket_id   UUID;
  v_total_bruto NUMERIC;
  v_tickets     JSONB := '[]'::JSONB;
  v_taxa        NUMERIC;
  i             INTEGER;
BEGIN
  -- Taxa calculada server-side: evento → comunidade → padrão 0.05
  SELECT COALESCE(e.vanta_fee_percent, c.vanta_fee_percent, 0.05)
  INTO v_taxa
  FROM eventos_admin e
  LEFT JOIN comunidades c ON c.id = e.comunidade_id
  WHERE e.id = p_evento_id;

  IF v_taxa IS NULL THEN v_taxa := 0.05; END IF;

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
            ROUND(p_valor_unit * (1 - v_taxa), 2), v_taxa, 'CONCLUIDO', 'VENDA_CHECKOUT');

    UPDATE variacoes_ingresso SET vendidos = vendidos + 1 WHERE id = p_variacao_id;

    INSERT INTO vendas_log (evento_id, variacao_id, variacao_label, valor)
    SELECT p_evento_id, p_variacao_id, CONCAT(area, ' · ', genero), p_valor_unit
    FROM variacoes_ingresso WHERE id = p_variacao_id;

    v_tickets := v_tickets || jsonb_build_object('ticketId', v_ticket_id);
  END LOOP;

  RETURN jsonb_build_object(
    'ok', true, 'tickets', v_tickets,
    'totalBruto', v_total_bruto,
    'totalLiquido', ROUND(v_total_bruto * (1 - v_taxa), 2),
    'taxaAplicada', v_taxa
  );
END;
$$;

CREATE OR REPLACE FUNCTION processar_venda_caixa(
  p_evento_id    UUID,
  p_lote_id      UUID,
  p_variacao_id  UUID,
  p_email        TEXT,
  p_valor_unit   NUMERIC,
  p_taxa         NUMERIC DEFAULT 0.05  -- ignorado, calculado abaixo
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_ticket_id UUID;
  v_var       variacoes_ingresso%ROWTYPE;
  v_taxa      NUMERIC;
BEGIN
  -- Taxa calculada server-side
  SELECT COALESCE(e.vanta_fee_percent, c.vanta_fee_percent, 0.05)
  INTO v_taxa
  FROM eventos_admin e
  LEFT JOIN comunidades c ON c.id = e.comunidade_id
  WHERE e.id = p_evento_id;

  IF v_taxa IS NULL THEN v_taxa := 0.05; END IF;

  -- Verifica disponibilidade
  SELECT * INTO v_var FROM variacoes_ingresso WHERE id = p_variacao_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'erro', 'Variação não encontrada.');
  END IF;
  IF v_var.vendidos >= v_var.limite THEN
    RETURN jsonb_build_object('ok', false, 'erro', 'Ingresso esgotado.');
  END IF;

  -- Verifica que o operador tem papel CAIXA no evento
  IF NOT EXISTS (
    SELECT 1 FROM equipe_evento
    WHERE evento_id = p_evento_id AND membro_id = auth.uid() AND papel = 'CAIXA'
  ) AND NOT is_masteradm() THEN
    RETURN jsonb_build_object('ok', false, 'erro', 'Sem permissão de caixa para este evento.');
  END IF;

  -- Verifica que o caixa está ativo
  IF NOT EXISTS (
    SELECT 1 FROM eventos_admin WHERE id = p_evento_id AND caixa_ativo = true
  ) THEN
    RETURN jsonb_build_object('ok', false, 'erro', 'Caixa não está ativo para este evento.');
  END IF;

  -- Cria ticket
  INSERT INTO tickets_caixa (evento_id, lote_id, variacao_id, email, valor, status, criado_por)
  VALUES (p_evento_id, p_lote_id, p_variacao_id, p_email, p_valor_unit, 'DISPONIVEL', auth.uid())
  RETURNING id INTO v_ticket_id;

  -- Transação
  INSERT INTO transactions (evento_id, ticket_id, email, valor_bruto, valor_liquido, taxa_aplicada, status, tipo)
  VALUES (
    p_evento_id, v_ticket_id, p_email,
    p_valor_unit, ROUND(p_valor_unit * (1 - v_taxa), 2),
    v_taxa, 'CONCLUIDO', 'VENDA_CAIXA'
  );

  UPDATE variacoes_ingresso SET vendidos = vendidos + 1 WHERE id = p_variacao_id;

  INSERT INTO vendas_log (evento_id, variacao_id, variacao_label, valor)
  VALUES (p_evento_id, p_variacao_id, CONCAT(v_var.area, ' · ', v_var.genero), p_valor_unit);

  RETURN jsonb_build_object(
    'ok', true,
    'ticketId', v_ticket_id,
    'valorLiquido', ROUND(p_valor_unit * (1 - v_taxa), 2),
    'taxaAplicada', v_taxa
  );
END;
$$;

-- ══════════════════════════════════════════════════════════════
-- 7. AUDIT_LOGS: permitir INSERT por qualquer autenticado (fire-and-forget do frontend)
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "audit_logs: somente masteradm" ON audit_logs;

-- Master lê tudo
CREATE POLICY "audit_logs: masteradm lê tudo"
  ON audit_logs FOR SELECT
  USING (is_masteradm());

-- Qualquer autenticado insere (log de auditoria)
CREATE POLICY "audit_logs: autenticado insere"
  ON audit_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id::text = auth.uid()::text);

-- ══════════════════════════════════════════════════════════════
-- 8. EVENTOS_ADMIN: permitir INSERT por produtores autenticados
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "eventos_admin: produtor insere" ON eventos_admin;
CREATE POLICY "eventos_admin: produtor insere"
  ON eventos_admin FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

-- ══════════════════════════════════════════════════════════════
-- 9. ATRIBUICOES_RBAC: sócio pode ler equipe do seu evento/comunidade
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "atrib_rbac: socio lê equipe do tenant" ON atribuicoes_rbac;
CREATE POLICY "atrib_rbac: socio lê equipe do tenant"
  ON atribuicoes_rbac FOR SELECT
  USING (
    -- Sócio de evento vê membros do mesmo evento
    (tenant_type = 'EVENTO' AND EXISTS (
      SELECT 1 FROM atribuicoes_rbac a2
      WHERE a2.user_id = auth.uid() AND a2.tenant_type = 'EVENTO'
        AND a2.tenant_id = atribuicoes_rbac.tenant_id
        AND a2.cargo IN ('SOCIO', 'GERENTE') AND a2.ativo = true
    ))
    OR
    -- Sócio de comunidade vê membros da mesma comunidade
    (tenant_type = 'COMUNIDADE' AND EXISTS (
      SELECT 1 FROM atribuicoes_rbac a2
      WHERE a2.user_id = auth.uid() AND a2.tenant_type = 'COMUNIDADE'
        AND a2.tenant_id = atribuicoes_rbac.tenant_id
        AND a2.cargo IN ('SOCIO', 'GERENTE') AND a2.ativo = true
    ))
  );

-- Sócio pode UPDATE (revogar) atribuições do seu evento
DROP POLICY IF EXISTS "atrib_rbac: socio gerencia evento" ON atribuicoes_rbac;
CREATE POLICY "atrib_rbac: socio gerencia evento"
  ON atribuicoes_rbac FOR UPDATE
  USING (
    tenant_type = 'EVENTO' AND EXISTS (
      SELECT 1 FROM atribuicoes_rbac a2
      WHERE a2.user_id = auth.uid() AND a2.tenant_type = 'EVENTO'
        AND a2.tenant_id = atribuicoes_rbac.tenant_id
        AND a2.cargo IN ('SOCIO', 'GERENTE') AND a2.ativo = true
    )
  );

-- ══════════════════════════════════════════════════════════════
-- FIM
-- ══════════════════════════════════════════════════════════════
