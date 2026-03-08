-- ══════════════════════════════════════════════════════════════════════════════
-- MAIS VANTA v2 — Deals Marketplace + Curadoria + Parceiros + Cidades
-- Date: 2026-03-08
-- ══════════════════════════════════════════════════════════════════════════════

-- ── 1. CURADORIA v2 — novos campos internos no membros_clube ─────────────────
ALTER TABLE membros_clube ADD COLUMN IF NOT EXISTS categoria TEXT
  CHECK (categoria IS NULL OR categoria IN ('LIFESTYLE', 'INFLUENCER', 'CREATOR', 'VIP'));

ALTER TABLE membros_clube ADD COLUMN IF NOT EXISTS alcance TEXT
  CHECK (alcance IS NULL OR alcance IN ('NANO', 'MICRO', 'MACRO', 'MEGA'));

ALTER TABLE membros_clube ADD COLUMN IF NOT EXISTS genero TEXT
  CHECK (genero IS NULL OR genero IN ('M', 'F', 'NB'));

ALTER TABLE membros_clube ADD COLUMN IF NOT EXISTS cidade_base TEXT;

ALTER TABLE membros_clube ADD COLUMN IF NOT EXISTS interesses TEXT[] DEFAULT '{}';

ALTER TABLE membros_clube ADD COLUMN IF NOT EXISTS nota_engajamento NUMERIC(5,2);

ALTER TABLE membros_clube ADD COLUMN IF NOT EXISTS castigo_motivo TEXT;

-- ── 2. CIDADES MAIS VANTA — master cria cidades do programa ─────────────────
CREATE TABLE IF NOT EXISTS cidades_mais_vanta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  estado TEXT,
  pais TEXT NOT NULL DEFAULT 'BR',
  ativo BOOLEAN NOT NULL DEFAULT true,
  gerente_id UUID REFERENCES profiles(id),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  criado_por UUID NOT NULL
);

ALTER TABLE cidades_mais_vanta ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cidades_mv_read" ON cidades_mais_vanta FOR SELECT USING (true);
CREATE POLICY "cidades_mv_write" ON cidades_mais_vanta FOR ALL
  USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- ── 3. PARCEIROS MAIS VANTA — venues externos ──────────────────────────────
CREATE TABLE IF NOT EXISTS parceiros_mais_vanta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('RESTAURANTE', 'BAR', 'CLUB', 'GYM', 'SALAO', 'HOTEL', 'LOJA', 'OUTRO')),
  descricao TEXT,
  foto_url TEXT,
  endereco TEXT,
  cidade_id UUID NOT NULL REFERENCES cidades_mais_vanta(id),
  instagram_handle TEXT,
  contato_nome TEXT,
  contato_telefone TEXT,
  contato_email TEXT,

  -- Plano do parceiro
  plano TEXT NOT NULL DEFAULT 'STARTER' CHECK (plano IN ('STARTER', 'PRO', 'ELITE')),
  plano_inicio TIMESTAMPTZ,
  plano_fim TIMESTAMPTZ,
  resgates_mes_limite INT NOT NULL DEFAULT 5,
  resgates_mes_usados INT NOT NULL DEFAULT 0,
  trial_ativo BOOLEAN NOT NULL DEFAULT false,

  -- Acesso ao painel
  user_id UUID REFERENCES profiles(id),

  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  criado_por UUID NOT NULL
);

ALTER TABLE parceiros_mais_vanta ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parceiros_mv_read" ON parceiros_mais_vanta FOR SELECT USING (true);
CREATE POLICY "parceiros_mv_write" ON parceiros_mais_vanta FOR ALL
  USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- ── 4. DEALS MAIS VANTA — ofertas dos parceiros ────────────────────────────
CREATE TABLE IF NOT EXISTS deals_mais_vanta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parceiro_id UUID NOT NULL REFERENCES parceiros_mais_vanta(id) ON DELETE CASCADE,
  cidade_id UUID NOT NULL REFERENCES cidades_mais_vanta(id),

  titulo TEXT NOT NULL,
  descricao TEXT,
  foto_url TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('BARTER', 'DESCONTO')),

  -- Barter
  obrigacao_barter TEXT,

  -- Desconto
  desconto_percentual NUMERIC(5,2),
  desconto_valor NUMERIC(10,2),

  -- Filtros de membro (curadoria interna)
  filtro_genero TEXT CHECK (filtro_genero IS NULL OR filtro_genero IN ('M', 'F', 'NB')),
  filtro_alcance TEXT[] DEFAULT '{}',
  filtro_categoria TEXT[] DEFAULT '{}',

  -- Limites
  vagas INT NOT NULL DEFAULT 5,
  vagas_preenchidas INT NOT NULL DEFAULT 0,

  -- Vigência
  inicio TIMESTAMPTZ NOT NULL DEFAULT now(),
  fim TIMESTAMPTZ,

  status TEXT NOT NULL DEFAULT 'ATIVO' CHECK (status IN ('RASCUNHO', 'ATIVO', 'PAUSADO', 'ENCERRADO', 'EXPIRADO')),

  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE deals_mais_vanta ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deals_mv_read" ON deals_mais_vanta FOR SELECT USING (true);
CREATE POLICY "deals_mv_write" ON deals_mais_vanta FOR ALL
  USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- ── 5. RESGATES MAIS VANTA — aplicações + seleções ─────────────────────────
CREATE TABLE IF NOT EXISTS resgates_mais_vanta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals_mais_vanta(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parceiro_id UUID NOT NULL REFERENCES parceiros_mais_vanta(id),

  status TEXT NOT NULL DEFAULT 'APLICADO'
    CHECK (status IN ('APLICADO', 'SELECIONADO', 'RECUSADO', 'CHECK_IN', 'PENDENTE_POST', 'CONCLUIDO', 'NO_SHOW', 'EXPIRADO', 'CANCELADO')),

  -- QR VIP
  qr_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),

  -- Tracking
  aplicado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  selecionado_em TIMESTAMPTZ,
  selecionado_por UUID,
  checkin_em TIMESTAMPTZ,
  post_url TEXT,
  post_verificado BOOLEAN NOT NULL DEFAULT false,
  post_verificado_em TIMESTAMPTZ,
  concluido_em TIMESTAMPTZ,

  -- Regra: 1 deal ativo por vez (enforced via trigger)
  UNIQUE (deal_id, user_id)
);

ALTER TABLE resgates_mais_vanta ENABLE ROW LEVEL SECURITY;
CREATE POLICY "resgates_mv_read" ON resgates_mais_vanta FOR SELECT
  USING (auth.uid() = user_id OR is_masteradm());
CREATE POLICY "resgates_mv_write" ON resgates_mais_vanta FOR ALL
  USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- ── 6. TRIGGER — Regra 1 deal ativo por vez ────────────────────────────────
CREATE OR REPLACE FUNCTION check_deal_ativo_unico()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'APLICADO' THEN
    IF EXISTS (
      SELECT 1 FROM resgates_mais_vanta
      WHERE user_id = NEW.user_id
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND status IN ('APLICADO', 'SELECIONADO', 'CHECK_IN', 'PENDENTE_POST')
    ) THEN
      RAISE EXCEPTION 'Membro já possui um deal ativo. Conclua ou cancele antes de aplicar para outro.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_deal_ativo_unico ON resgates_mais_vanta;
CREATE TRIGGER trg_deal_ativo_unico
  BEFORE INSERT OR UPDATE ON resgates_mais_vanta
  FOR EACH ROW EXECUTE FUNCTION check_deal_ativo_unico();

-- ── 7. TRIGGER — Incrementar vagas_preenchidas ao selecionar ────────────────
CREATE OR REPLACE FUNCTION update_vagas_deal()
RETURNS TRIGGER AS $$
BEGIN
  -- Selecionado: incrementa
  IF NEW.status = 'SELECIONADO' AND (OLD IS NULL OR OLD.status != 'SELECIONADO') THEN
    UPDATE deals_mais_vanta SET vagas_preenchidas = vagas_preenchidas + 1 WHERE id = NEW.deal_id;
  END IF;
  -- Cancelado/Recusado/Expirado: decrementa (se estava selecionado)
  IF NEW.status IN ('CANCELADO', 'RECUSADO', 'EXPIRADO', 'NO_SHOW')
     AND OLD IS NOT NULL AND OLD.status = 'SELECIONADO' THEN
    UPDATE deals_mais_vanta SET vagas_preenchidas = GREATEST(vagas_preenchidas - 1, 0) WHERE id = NEW.deal_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_vagas_deal ON resgates_mais_vanta;
CREATE TRIGGER trg_update_vagas_deal
  AFTER INSERT OR UPDATE ON resgates_mais_vanta
  FOR EACH ROW EXECUTE FUNCTION update_vagas_deal();

-- ── 8. TRIGGER — Incrementar resgates_mes_usados do parceiro ao concluir ────
CREATE OR REPLACE FUNCTION update_resgates_parceiro()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'CONCLUIDO' AND (OLD IS NULL OR OLD.status != 'CONCLUIDO') THEN
    UPDATE parceiros_mais_vanta SET resgates_mes_usados = resgates_mes_usados + 1 WHERE id = NEW.parceiro_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_resgates_parceiro ON resgates_mais_vanta;
CREATE TRIGGER trg_update_resgates_parceiro
  AFTER INSERT OR UPDATE ON resgates_mais_vanta
  FOR EACH ROW EXECUTE FUNCTION update_resgates_parceiro();

-- ── 9. ÍNDICES ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_deals_mv_cidade ON deals_mais_vanta(cidade_id);
CREATE INDEX IF NOT EXISTS idx_deals_mv_parceiro ON deals_mais_vanta(parceiro_id);
CREATE INDEX IF NOT EXISTS idx_deals_mv_status ON deals_mais_vanta(status);
CREATE INDEX IF NOT EXISTS idx_resgates_mv_user ON resgates_mais_vanta(user_id);
CREATE INDEX IF NOT EXISTS idx_resgates_mv_deal ON resgates_mais_vanta(deal_id);
CREATE INDEX IF NOT EXISTS idx_resgates_mv_status ON resgates_mais_vanta(status);
CREATE INDEX IF NOT EXISTS idx_parceiros_mv_cidade ON parceiros_mais_vanta(cidade_id);
CREATE INDEX IF NOT EXISTS idx_membros_clube_alcance ON membros_clube(alcance);
CREATE INDEX IF NOT EXISTS idx_membros_clube_categoria ON membros_clube(categoria);
