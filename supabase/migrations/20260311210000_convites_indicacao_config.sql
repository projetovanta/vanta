-- Fase 2: Convites de indicação — config por tier
-- Adiciona colunas de quantidade de convites por tier na clube_config

ALTER TABLE clube_config
  ADD COLUMN IF NOT EXISTS convites_lista    INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS convites_presenca INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS convites_social   INTEGER NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS convites_creator  INTEGER NOT NULL DEFAULT 7,
  ADD COLUMN IF NOT EXISTS convites_black    INTEGER NOT NULL DEFAULT 10;
