-- Relatórios: campos novos para listas
-- genero na regra (M/F/U) — convidado herda da regra
-- checked_in_por_nome — nome do porteiro que fez check-in

ALTER TABLE regras_lista
  ADD COLUMN IF NOT EXISTS genero TEXT NOT NULL DEFAULT 'U';

ALTER TABLE convidados_lista
  ADD COLUMN IF NOT EXISTS checked_in_por_nome TEXT;
