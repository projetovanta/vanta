-- ══════════════════════════════════════════════════════════════════════════════
-- Cleanup: remover todas as contas de desenvolvimento
-- Mantém SOMENTE: louresrp@gmail.com (e3216883-ef8f-4c10-8962-de9f547d74e3)
-- ══════════════════════════════════════════════════════════════════════════════

-- IDs das contas a deletar (18 contas dev/test)
-- Ordem: limpar tabelas com RESTRICT antes, depois auth.users (cascade cuida do resto)

-- 1. Limpar solicitacoes_saque (ON DELETE RESTRICT em produtor_id)
DELETE FROM solicitacoes_saque
WHERE produtor_id IN (
  '48421a2b-8c59-42b1-bf1a-a8079bb5b35d',
  'ecee77b5-9edf-4339-99f1-968cd9c5c34b',
  'fc5e489d-5836-4f64-b726-ecf7cedfcf5c',
  '22057ad6-d8cf-4049-96d1-56c24e478d73',
  '7c55104e-b742-42d6-bba2-a19c856cf4fe',
  '784cf236-cf72-49a5-b1dc-531b08a5343e',
  'deea9896-9a51-4636-b788-be1faf4318b3',
  '83b6bb7e-97f5-4721-8e11-aac8c1c0326c',
  '476bbe82-fd48-426d-9096-a6dd30c4933d',
  '706a43ed-4c82-43c1-ad0e-8dec30d3d143',
  'cd73e0af-94e4-4f78-aea5-2a6e2ec06d0a',
  '943bb63a-af58-466d-892d-79968af1e041',
  '6becf6d0-3767-4c3c-841c-9efd31c86a3d',
  '35d50c58-3d91-491c-8164-f3c11e55d42a',
  '5be50601-f99a-4b87-990e-04ca2759c300',
  '6ee39bfb-0251-484d-87b6-4ef46bac740a',
  '35e6a2fe-9e23-4ec6-8864-db7901c11228',
  '9cfc9b88-4258-4c29-bbd4-d9734fcd9f4c'
);

-- 2. Deletar auth.users (CASCADE limpa profiles → equipe_evento, atribuicoes_rbac, etc.)
DELETE FROM auth.users
WHERE id IN (
  '48421a2b-8c59-42b1-bf1a-a8079bb5b35d',
  'ecee77b5-9edf-4339-99f1-968cd9c5c34b',
  'fc5e489d-5836-4f64-b726-ecf7cedfcf5c',
  '22057ad6-d8cf-4049-96d1-56c24e478d73',
  '7c55104e-b742-42d6-bba2-a19c856cf4fe',
  '784cf236-cf72-49a5-b1dc-531b08a5343e',
  'deea9896-9a51-4636-b788-be1faf4318b3',
  '83b6bb7e-97f5-4721-8e11-aac8c1c0326c',
  '476bbe82-fd48-426d-9096-a6dd30c4933d',
  '706a43ed-4c82-43c1-ad0e-8dec30d3d143',
  'cd73e0af-94e4-4f78-aea5-2a6e2ec06d0a',
  '943bb63a-af58-466d-892d-79968af1e041',
  '6becf6d0-3767-4c3c-841c-9efd31c86a3d',
  '35d50c58-3d91-491c-8164-f3c11e55d42a',
  '5be50601-f99a-4b87-990e-04ca2759c300',
  '6ee39bfb-0251-484d-87b6-4ef46bac740a',
  '35e6a2fe-9e23-4ec6-8864-db7901c11228',
  '9cfc9b88-4258-4c29-bbd4-d9734fcd9f4c'
);

-- 3. Evento demo (Bosque Domingo seed) — created_by ficou NULL (ON DELETE SET NULL)
--    Deletar o evento demo e seus dados (lotes, variações, tickets, listas, etc. cascadeiam)
DELETE FROM eventos_admin WHERE id = 'a0a0a0a0-0001-4000-8000-000000000001';
