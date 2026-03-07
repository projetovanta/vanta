-- ══════════════════════════════════════════════════════════
-- Migration: rodada_negociacao em eventos_admin
-- Contagem de rodadas de negociação sócio (máx 3)
-- ══════════════════════════════════════════════════════════

ALTER TABLE eventos_admin
  ADD COLUMN IF NOT EXISTS rodada_negociacao SMALLINT DEFAULT NULL;

-- Constraint: máximo 3 rodadas (idempotente)
DO $$ BEGIN
  ALTER TABLE eventos_admin
    ADD CONSTRAINT chk_rodada_negociacao CHECK (rodada_negociacao IS NULL OR (rodada_negociacao >= 1 AND rodada_negociacao <= 3));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Eventos COM_SOCIO existentes sem rodada → seta 1
UPDATE eventos_admin
  SET rodada_negociacao = 1
  WHERE tipo_fluxo = 'COM_SOCIO' AND rodada_negociacao IS NULL;
