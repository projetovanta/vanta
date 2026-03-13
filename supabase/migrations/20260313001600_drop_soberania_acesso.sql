-- Remover sistema de soberania de acesso
-- Master tem acesso total a todos os eventos, não precisa solicitar permissão.

-- Remover policies
DROP POLICY IF EXISTS "soberania_acesso: user insere proprio" ON soberania_acesso;
DROP POLICY IF EXISTS "soberania_acesso: socio decide" ON soberania_acesso;
DROP POLICY IF EXISTS "admin_all_soberania_acesso" ON soberania_acesso;

-- Dropar tabela
DROP TABLE IF EXISTS soberania_acesso;
