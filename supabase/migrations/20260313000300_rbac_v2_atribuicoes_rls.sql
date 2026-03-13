-- ══════════════════════════════════════════════════════════════════════════════
-- RBAC V2 — Fase 1.3: Reescrever RLS de atribuicoes_rbac
-- SELECT: autenticado, INSERT/UPDATE: master ou write_access, DELETE: bloqueado
-- ══════════════════════════════════════════════════════════════════════════════

-- ── 1. Drop ALL existing policies ──────────────────────────────────────────
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'atribuicoes_rbac'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON atribuicoes_rbac', pol.policyname);
  END LOOP;
END $$;

-- ── 2. Novas policies ─────────────────────────────────────────────────────

-- SELECT: qualquer autenticado (necessário para UI de equipe, helpers, etc.)
CREATE POLICY "atrib_rbac_v2_select"
  ON atribuicoes_rbac FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

-- INSERT: master, cargo plataforma GERIR_COMUNIDADES, ou quem tem write_access no tenant
CREATE POLICY "atrib_rbac_v2_insert"
  ON atribuicoes_rbac FOR INSERT TO authenticated
  WITH CHECK (
    is_masteradm()
    OR has_plataforma_permission('GERIR_COMUNIDADES')
    OR has_comunidade_write_access(tenant_type, tenant_id)
  );

-- UPDATE: mesma regra do INSERT (para desativar via ativo=false)
CREATE POLICY "atrib_rbac_v2_update"
  ON atribuicoes_rbac FOR UPDATE TO authenticated
  USING (
    is_masteradm()
    OR has_plataforma_permission('GERIR_COMUNIDADES')
    OR has_comunidade_write_access(tenant_type, tenant_id)
  );

-- DELETE: bloqueado para todos (soft delete via ativo=false)
-- Nenhuma policy de DELETE = ninguém pode deletar via RLS
-- Master pode usar service_role se necessário
