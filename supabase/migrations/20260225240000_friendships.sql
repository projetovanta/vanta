-- Tabela de amizades entre membros (friendships)
-- Modelo: PENDING = pedido enviado. ACCEPTED = amigos. DELETE row = cancelar/recusar/remover.

CREATE TABLE friendships (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (requester_id, addressee_id)
);

CREATE INDEX idx_friendships_requester ON friendships(requester_id);
CREATE INDEX idx_friendships_addressee ON friendships(addressee_id);

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Cada usuário só vê suas próprias amizades
CREATE POLICY "select own" ON friendships FOR SELECT
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- Só pode criar pedido onde é o requester
CREATE POLICY "insert" ON friendships FOR INSERT
  WITH CHECK (requester_id = auth.uid());

-- Só o addressee pode aceitar (UPDATE status → ACCEPTED)
CREATE POLICY "addressee updates" ON friendships FOR UPDATE
  USING (addressee_id = auth.uid());

-- Ambos podem deletar (cancelar/recusar/remover)
CREATE POLICY "delete own" ON friendships FOR DELETE
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- Habilita Realtime para a tabela
ALTER PUBLICATION supabase_realtime ADD TABLE friendships;
