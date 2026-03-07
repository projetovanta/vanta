-- Equipe do evento Bosque Domingo (necessário para RLS)
INSERT INTO equipe_evento (evento_id, membro_id, papel, liberar_lista)
VALUES
  ('a0a0a0a0-0001-4000-8000-000000000001', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', 'GERENTE', true),
  ('a0a0a0a0-0001-4000-8000-000000000001', '6ee39bfb-0251-484d-87b6-4ef46bac740a', 'GERENTE', true),
  ('a0a0a0a0-0001-4000-8000-000000000001', 'deea9896-9a51-4636-b788-be1faf4318b3', 'PORTARIA_LISTA', true)
ON CONFLICT (evento_id, membro_id, papel) DO NOTHING;
