-- ══════════════════════════════════════════════════════════════════════════════
-- Tabela: mesas — Mesas/camarotes de eventos
-- Storage buckets: selfies, eventos
-- ══════════════════════════════════════════════════════════════════════════════

-- ── Tabela mesas ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mesas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id uuid NOT NULL,
  label text NOT NULL DEFAULT '',
  x numeric NOT NULL DEFAULT 50,
  y numeric NOT NULL DEFAULT 50,
  capacidade int NOT NULL DEFAULT 4,
  valor numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'DISPONIVEL'
    CHECK (status IN ('DISPONIVEL', 'RESERVADA', 'OCUPADA', 'BLOQUEADA')),
  reservado_por uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_mesas_evento_id ON mesas(evento_id);
CREATE INDEX IF NOT EXISTS idx_mesas_status ON mesas(status);

-- RLS
ALTER TABLE mesas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mesas: leitura autenticado" ON mesas;
CREATE POLICY "mesas: leitura autenticado"
  ON mesas FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "mesas: inserção autenticado" ON mesas;
CREATE POLICY "mesas: inserção autenticado"
  ON mesas FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "mesas: atualização autenticado" ON mesas;
CREATE POLICY "mesas: atualização autenticado"
  ON mesas FOR UPDATE
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "mesas: exclusão autenticado" ON mesas;
CREATE POLICY "mesas: exclusão autenticado"
  ON mesas FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- ── Storage bucket: selfies ──────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('selfies', 'selfies', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "selfies: upload autenticado" ON storage.objects;
CREATE POLICY "selfies: upload autenticado"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'selfies' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "selfies: leitura publica" ON storage.objects;
CREATE POLICY "selfies: leitura publica"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'selfies');

DROP POLICY IF EXISTS "selfies: update autenticado" ON storage.objects;
CREATE POLICY "selfies: update autenticado"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'selfies' AND auth.uid() IS NOT NULL);

-- ── Storage bucket: eventos ──────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('eventos', 'eventos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "eventos: upload autenticado" ON storage.objects;
CREATE POLICY "eventos: upload autenticado"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'eventos' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "eventos: leitura publica" ON storage.objects;
CREATE POLICY "eventos: leitura publica"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'eventos');

DROP POLICY IF EXISTS "eventos: update autenticado" ON storage.objects;
CREATE POLICY "eventos: update autenticado"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'eventos' AND auth.uid() IS NOT NULL);
