-- ══════════════════════════════════════════════════════════════════════════════
-- MV4 — Global Passport (aprovação por cidade/comunidade)
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS passport_aprovacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  comunidade_id UUID NOT NULL REFERENCES comunidades(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'APROVADO', 'REJEITADO')),
  solicitado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolvido_em TIMESTAMPTZ,
  resolvido_por UUID,
  UNIQUE (user_id, comunidade_id)
);

-- Comunidade de origem (onde membro foi aprovado pela primeira vez)
ALTER TABLE membros_clube ADD COLUMN IF NOT EXISTS comunidade_origem UUID REFERENCES comunidades(id);

-- RLS
ALTER TABLE passport_aprovacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "passport_select" ON passport_aprovacoes FOR SELECT USING (true);
CREATE POLICY "passport_all" ON passport_aprovacoes FOR ALL USING (auth.uid() IS NOT NULL);
