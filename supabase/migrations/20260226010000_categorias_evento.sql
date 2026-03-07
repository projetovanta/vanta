-- Tabela de categorias dinâmicas para eventos
CREATE TABLE IF NOT EXISTS categorias_evento (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL UNIQUE,
  ativo BOOLEAN DEFAULT true,
  ordem INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed: 15 categorias padrão
INSERT INTO categorias_evento (label, ordem) VALUES
  ('Festa', 0),
  ('Show', 1),
  ('Balada', 2),
  ('Funk', 3),
  ('Sertanejo', 4),
  ('Pagode', 5),
  ('Samba', 6),
  ('Rock', 7),
  ('Eletrônica', 8),
  ('Hip-Hop', 9),
  ('Pop', 10),
  ('Forró', 11),
  ('Open Bar', 12),
  ('Day Party', 13),
  ('Festival', 14)
ON CONFLICT (label) DO NOTHING;

-- RLS
ALTER TABLE categorias_evento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON categorias_evento
  FOR SELECT USING (true);

CREATE POLICY "master_write" ON categorias_evento
  FOR ALL USING (true);

-- Coluna categoria em eventos_admin
ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS categoria TEXT;
