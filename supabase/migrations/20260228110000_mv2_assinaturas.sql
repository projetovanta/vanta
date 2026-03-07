-- ══════════════════════════════════════════════════════════════════════════════
-- MV2 — Assinaturas MAIS VANTA (faturamento SaaS para venues)
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS assinaturas_mais_vanta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comunidade_id UUID NOT NULL REFERENCES comunidades(id) ON DELETE CASCADE,
  plano TEXT NOT NULL CHECK (plano IN ('BASICO', 'PRO', 'ENTERPRISE')),
  status TEXT NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'ATIVA', 'CANCELADA', 'EXPIRADA')),
  stripe_customer_id TEXT,            -- PLACEHOLDER: preenchido quando Stripe for configurado
  stripe_subscription_id TEXT,        -- PLACEHOLDER
  valor_mensal NUMERIC(10,2) NOT NULL DEFAULT 0,
  inicio TIMESTAMPTZ,
  fim TIMESTAMPTZ,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  criado_por UUID NOT NULL REFERENCES profiles(id),
  UNIQUE (comunidade_id)
);

-- RLS
ALTER TABLE assinaturas_mais_vanta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assinaturas_mv_select" ON assinaturas_mais_vanta FOR SELECT USING (true);
CREATE POLICY "assinaturas_mv_all" ON assinaturas_mais_vanta FOR ALL USING (auth.uid() IS NOT NULL);
