-- ══════════════════════════════════════════════════════════════════════════════
-- VANTA V2 — Fase 6.1: RLS em atribuicoes_rbac
-- ══════════════════════════════════════════════════════════════════════════════
--
-- Contexto operacional:
--   O app usa anon key (não service_role). Todas as queries passam por RLS.
--   refresh() faz SELECT * WHERE ativo = true para popular cache de TODOS os users.
--   addAssignment/atribuir fazem upsert para o user autenticado ou para outros
--   (ex: admin recruta staff). Guards de permissão são aplicados no app layer.
--
-- Estratégia de policies:
--   SELECT  — qualquer user autenticado pode ler (admin precisa ver toda a equipe)
--   INSERT  — qualquer user autenticado pode inserir (guards no app layer)
--   UPDATE  — qualquer user autenticado pode atualizar (guards no app layer)
--   DELETE  — bloqueado (app usa soft delete via ativo=false, não DELETE real)
--
-- Racional:
--   A granularidade de "quem pode recrutar quem" é controlada pelo hasPermission()
--   e pelos guards de permissoes.ts no app. RLS aqui protege contra acesso
--   não-autenticado (anônimo) e bloqueia DELETE acidental.
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Habilitar RLS
ALTER TABLE atribuicoes_rbac ENABLE ROW LEVEL SECURITY;

-- 2. SELECT — qualquer usuário autenticado pode ler todas as atribuições
--    (necessário para refresh(), listagem de equipe, elegíveis, etc.)
DROP POLICY IF EXISTS "atribuicoes_rbac: leitura autenticado" ON atribuicoes_rbac;
CREATE POLICY "atribuicoes_rbac: leitura autenticado"
  ON atribuicoes_rbac FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 3. INSERT — qualquer usuário autenticado pode inserir
--    (guards de recrutar_staff/gerenciar_equipe no app layer)
DROP POLICY IF EXISTS "atribuicoes_rbac: inserção autenticado" ON atribuicoes_rbac;
CREATE POLICY "atribuicoes_rbac: inserção autenticado"
  ON atribuicoes_rbac FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 4. UPDATE — qualquer usuário autenticado pode atualizar
--    (usado por revogar/soft-delete e addAssignment upsert)
DROP POLICY IF EXISTS "atribuicoes_rbac: atualização autenticado" ON atribuicoes_rbac;
CREATE POLICY "atribuicoes_rbac: atualização autenticado"
  ON atribuicoes_rbac FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- 5. DELETE — bloqueado para todos
--    O app nunca faz DELETE real; usa soft delete (ativo = false).
--    Nenhuma policy de DELETE = operação negada por padrão com RLS ativo.
