-- Impede pedido duplo simétrico: só 1 row por par de usuários (A→B ou B→A, nunca ambos)
CREATE UNIQUE INDEX idx_friendships_pair
  ON friendships (LEAST(requester_id, addressee_id), GREATEST(requester_id, addressee_id));
