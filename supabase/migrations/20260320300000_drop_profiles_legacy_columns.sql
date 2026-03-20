-- Migration: Dropar colunas legadas duplicadas do profiles
-- Contexto: migration 20260313090000 renomeou colunas mas NÃO dropou as antigas
-- Resultado: 7 colunas duplicadas (full_name/nome, foto/avatar_url, etc.)
--
-- Dados residuais verificados (2026-03-20):
--   full_name: 3 de 4 rows (mas `nome` já tem dados corretos em todos)
--   foto: 1 row (conta master, foto imgur antiga — avatar_url já atualizado)
--   foto_perfil: 0 rows
--   birth_date: 0 rows
--   nascimento: 0 rows
--   city: 1 row (conta master, "São Paulo" desatualizado — cidade já é "Rio de Janeiro")
--   state: 1 row (conta master, "SP" desatualizado — estado já é "RJ")

-- 1. Garantir que nenhum `nome` vazio perca dados do full_name
UPDATE profiles
SET nome = full_name
WHERE (nome IS NULL OR nome = '') AND full_name IS NOT NULL AND full_name != '';

-- 2. Dropar as 7 colunas legadas
ALTER TABLE profiles DROP COLUMN IF EXISTS full_name;
ALTER TABLE profiles DROP COLUMN IF EXISTS foto;
ALTER TABLE profiles DROP COLUMN IF EXISTS foto_perfil;
ALTER TABLE profiles DROP COLUMN IF EXISTS birth_date;
ALTER TABLE profiles DROP COLUMN IF EXISTS nascimento;
ALTER TABLE profiles DROP COLUMN IF EXISTS city;
ALTER TABLE profiles DROP COLUMN IF EXISTS state;
