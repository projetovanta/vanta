-- ============================================================
-- Migração: tiers MAIS VANTA → lowercase
-- ============================================================
-- O banco tinha IDs e CHECK constraints em MAIÚSCULO (DESCONTO, CONVIDADO, etc.)
-- O frontend usa minúsculo (desconto, convidado, etc.)
-- Esta migration alinha o banco com o código.
-- ============================================================

BEGIN;

-- ── 1. Dropar CHECK constraints existentes ────────────────────

ALTER TABLE membros_clube DROP CONSTRAINT IF EXISTS membros_clube_tier_check;
ALTER TABLE solicitacoes_clube DROP CONSTRAINT IF EXISTS solicitacoes_clube_tier_atribuido_check;
ALTER TABLE mais_vanta_lotes_evento DROP CONSTRAINT IF EXISTS mais_vanta_lotes_evento_tier_minimo_check;
ALTER TABLE comunidades DROP CONSTRAINT IF EXISTS comunidades_tier_minimo_mais_vanta_check;

-- ── 2. Atualizar dados existentes para lowercase ──────────────

-- tiers_mais_vanta (tabela de definição dos tiers)
UPDATE tiers_mais_vanta SET id = lower(id) WHERE id <> lower(id);

-- membros_clube.tier
UPDATE membros_clube SET tier = lower(tier) WHERE tier <> lower(tier);

-- solicitacoes_clube.tier_atribuido e tier_pre_atribuido
UPDATE solicitacoes_clube SET tier_atribuido = lower(tier_atribuido) WHERE tier_atribuido IS NOT NULL AND tier_atribuido <> lower(tier_atribuido);
UPDATE solicitacoes_clube SET tier_pre_atribuido = lower(tier_pre_atribuido) WHERE tier_pre_atribuido IS NOT NULL AND tier_pre_atribuido <> lower(tier_pre_atribuido);

-- mais_vanta_lotes_evento.tier_minimo
UPDATE mais_vanta_lotes_evento SET tier_minimo = lower(tier_minimo) WHERE tier_minimo <> lower(tier_minimo);

-- comunidades.tier_minimo_mais_vanta (BRONZE → desconto)
UPDATE comunidades SET tier_minimo_mais_vanta = 'desconto' WHERE tier_minimo_mais_vanta IS NOT NULL;

-- convites_mais_vanta.tier (texto livre, sem constraint)
UPDATE convites_mais_vanta SET tier = lower(tier) WHERE tier IS NOT NULL AND tier <> lower(tier);

-- ── 3. Recriar CHECK constraints com valores lowercase ────────

ALTER TABLE membros_clube ADD CONSTRAINT membros_clube_tier_check
  CHECK (tier IN ('desconto','convidado','presenca','creator','vanta_black'));

ALTER TABLE solicitacoes_clube ADD CONSTRAINT solicitacoes_clube_tier_atribuido_check
  CHECK (tier_atribuido IS NULL OR tier_atribuido IN ('desconto','convidado','presenca','creator','vanta_black'));

ALTER TABLE mais_vanta_lotes_evento ADD CONSTRAINT mais_vanta_lotes_evento_tier_minimo_check
  CHECK (tier_minimo IN ('desconto','convidado','presenca','creator','vanta_black'));

ALTER TABLE comunidades ADD CONSTRAINT comunidades_tier_minimo_mais_vanta_check
  CHECK (tier_minimo_mais_vanta IS NULL OR tier_minimo_mais_vanta IN ('desconto','convidado','presenca','creator','vanta_black'));

COMMIT;
