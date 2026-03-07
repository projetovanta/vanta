-- Mesas / Camarotes
CREATE TABLE IF NOT EXISTS mesas (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id     UUID        NOT NULL REFERENCES eventos_admin(id) ON DELETE CASCADE,
  label         TEXT        NOT NULL DEFAULT '',
  x             REAL        NOT NULL DEFAULT 50,
  y             REAL        NOT NULL DEFAULT 50,
  capacidade    INT         NOT NULL DEFAULT 4,
  valor         NUMERIC(10,2) NOT NULL DEFAULT 0,
  status        TEXT        NOT NULL DEFAULT 'DISPONIVEL',
  reservado_por UUID        REFERENCES profiles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE mesas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mesas_select" ON mesas FOR SELECT USING (true);
CREATE POLICY "mesas_admin"  ON mesas FOR ALL USING (auth.uid() IS NOT NULL);

-- Índice
CREATE INDEX IF NOT EXISTS idx_mesas_evento ON mesas(evento_id);

-- Colunas na tabela eventos_admin
ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS planta_mesas TEXT;
ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS mesas_ativo BOOLEAN DEFAULT false;
