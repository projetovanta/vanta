-- Reviews de eventos (avaliações pós-evento)
CREATE TABLE IF NOT EXISTS reviews_evento (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id  UUID        NOT NULL REFERENCES eventos_admin(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating     SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comentario TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(evento_id, user_id)
);

-- RLS
ALTER TABLE reviews_evento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_select_all" ON reviews_evento FOR SELECT USING (true);
CREATE POLICY "reviews_insert_own" ON reviews_evento FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_update_own" ON reviews_evento FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "reviews_delete_own" ON reviews_evento FOR DELETE USING (auth.uid() = user_id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_reviews_evento_id ON reviews_evento(evento_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews_evento(user_id);
