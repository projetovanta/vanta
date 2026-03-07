-- ══════════════════════════════════════════════════════════════════════════════
-- Lotes MV por Tier — 1 lote por tier por evento (em vez de 1 lote por evento)
-- Novos campos: tier_id, acompanhantes, tipo_acesso
-- ══════════════════════════════════════════════════════════════════════════════

-- ── 1. Remover constraint UNIQUE(evento_id) ────────────────────────────────
-- A constraint pode ter sido criada como index ou como constraint real
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'lotes_mais_vanta_evento_id_key'
    AND conrelid = 'lotes_mais_vanta'::regclass
  ) THEN
    ALTER TABLE lotes_mais_vanta DROP CONSTRAINT lotes_mais_vanta_evento_id_key;
  END IF;
END $$;

-- Também tentar dropar como index (pode ter sido criado via CREATE UNIQUE INDEX)
DROP INDEX IF EXISTS lotes_mais_vanta_evento_id_key;

-- ── 2. Novos campos ───────────────────────────────────────────────────────
ALTER TABLE lotes_mais_vanta ADD COLUMN IF NOT EXISTS tier_id TEXT;
ALTER TABLE lotes_mais_vanta ADD COLUMN IF NOT EXISTS acompanhantes INT DEFAULT 0;
ALTER TABLE lotes_mais_vanta ADD COLUMN IF NOT EXISTS tipo_acesso TEXT DEFAULT 'Pista';

-- ── 3. UNIQUE: 1 lote por tier por evento ─────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS lotes_mv_evento_tier_uniq
  ON lotes_mais_vanta(evento_id, tier_id) WHERE tier_id IS NOT NULL;
