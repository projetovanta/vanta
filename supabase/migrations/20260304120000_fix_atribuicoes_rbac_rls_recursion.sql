-- ══════════════════════════════════════════════════════════════════════════════
-- FIX: Remove recursive RLS policies on atribuicoes_rbac
-- ══════════════════════════════════════════════════════════════════════════════
--
-- Problema: as policies "atrib_rbac: socio lê equipe do tenant" e
-- "atrib_rbac: socio gerencia evento" fazem sub-SELECT na própria tabela,
-- causando recursão infinita (42P17).
--
-- Solução: dropar as 2 policies recursivas e garantir que as 3 policies
-- simples originais (auth.uid() IS NOT NULL) existam.
-- Guards de permissão são aplicados no app layer (rbacService).
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Dropar policies recursivas
DROP POLICY IF EXISTS "atrib_rbac: socio lê equipe do tenant" ON atribuicoes_rbac;
DROP POLICY IF EXISTS "atrib_rbac: socio gerencia evento" ON atribuicoes_rbac;

-- 2. Recriar policies simples (idempotente)
DROP POLICY IF EXISTS "atribuicoes_rbac: leitura autenticado" ON atribuicoes_rbac;
CREATE POLICY "atribuicoes_rbac: leitura autenticado"
  ON atribuicoes_rbac FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "atribuicoes_rbac: inserção autenticado" ON atribuicoes_rbac;
CREATE POLICY "atribuicoes_rbac: inserção autenticado"
  ON atribuicoes_rbac FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "atribuicoes_rbac: atualização autenticado" ON atribuicoes_rbac;
CREATE POLICY "atribuicoes_rbac: atualização autenticado"
  ON atribuicoes_rbac FOR UPDATE
  USING (auth.uid() IS NOT NULL);
