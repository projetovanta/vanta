-- Community Follows — seguir comunidades
CREATE TABLE IF NOT EXISTS community_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  comunidade_id UUID NOT NULL REFERENCES comunidades(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, comunidade_id)
);

-- RLS
ALTER TABLE community_follows ENABLE ROW LEVEL SECURITY;

-- Qualquer autenticado pode ver follows (contagem pública + verificar se segue)
CREATE POLICY "Authenticated can read follows"
  ON community_follows FOR SELECT
  USING (auth.role() = 'authenticated');

-- Usuário só pode inserir follow próprio
CREATE POLICY "Users can follow"
  ON community_follows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuário só pode remover follow próprio
CREATE POLICY "Users can unfollow"
  ON community_follows FOR DELETE
  USING (auth.uid() = user_id);
