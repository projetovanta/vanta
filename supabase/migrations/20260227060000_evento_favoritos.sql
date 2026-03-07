-- Evento Favoritos — salvar eventos para ver depois
CREATE TABLE IF NOT EXISTS evento_favoritos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  evento_id UUID NOT NULL REFERENCES eventos_admin(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, evento_id)
);

-- RLS
ALTER TABLE evento_favoritos ENABLE ROW LEVEL SECURITY;

-- Autenticado pode ler (contagem pública + verificar se favoritou)
CREATE POLICY "read_favoritos"
  ON evento_favoritos FOR SELECT
  USING (auth.role() = 'authenticated');

-- Usuário só pode favoritar como si mesmo
CREATE POLICY "insert_favorito"
  ON evento_favoritos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuário só pode desfavoritar o próprio
CREATE POLICY "delete_favorito"
  ON evento_favoritos FOR DELETE
  USING (auth.uid() = user_id);
