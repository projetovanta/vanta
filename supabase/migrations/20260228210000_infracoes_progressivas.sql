-- ══════════════════════════════════════════════════════════════════════════════
-- Sistema de Infrações Progressivo — substitui "castigo" fixo de 30 dias
-- Tabela: infracoes_mais_vanta (histórico)
-- ALTER: membros_clube (bloqueio progressivo), clube_config (config infrações)
-- ══════════════════════════════════════════════════════════════════════════════

-- ── 1. Tabela de histórico de infrações ────────────────────────────────────
CREATE TABLE infracoes_mais_vanta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('NO_SHOW', 'NAO_POSTOU')),
  evento_id UUID,
  evento_nome TEXT,
  criado_em TIMESTAMPTZ DEFAULT now(),
  criado_por UUID
);

ALTER TABLE infracoes_mais_vanta ENABLE ROW LEVEL SECURITY;
CREATE POLICY "infracoes_read" ON infracoes_mais_vanta
  FOR SELECT USING (auth.uid() = user_id OR is_masteradm());
CREATE POLICY "infracoes_write" ON infracoes_mais_vanta
  FOR ALL USING (is_masteradm()) WITH CHECK (is_masteradm());

-- ── 2. Novos campos em membros_clube ───────────────────────────────────────
ALTER TABLE membros_clube ADD COLUMN IF NOT EXISTS bloqueio_nivel INT DEFAULT 0;
ALTER TABLE membros_clube ADD COLUMN IF NOT EXISTS bloqueio_ate TIMESTAMPTZ;
ALTER TABLE membros_clube ADD COLUMN IF NOT EXISTS banido_permanente BOOLEAN DEFAULT false;
ALTER TABLE membros_clube ADD COLUMN IF NOT EXISTS banido_em TIMESTAMPTZ;

-- ── 3. Novos campos em clube_config ────────────────────────────────────────
ALTER TABLE clube_config ADD COLUMN IF NOT EXISTS infracoes_limite INT DEFAULT 3;
ALTER TABLE clube_config ADD COLUMN IF NOT EXISTS bloqueio1_dias INT DEFAULT 30;
ALTER TABLE clube_config ADD COLUMN IF NOT EXISTS bloqueio2_dias INT DEFAULT 60;
