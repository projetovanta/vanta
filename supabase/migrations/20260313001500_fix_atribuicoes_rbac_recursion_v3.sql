-- ══════════════════════════════════════════════════════════════════════════════
-- FIX: Recursão infinita em atribuicoes_rbac SELECT policy
-- A policy "atrib_rbac_v2_select" faz EXISTS na própria tabela → 42P17.
-- Solução: function SECURITY DEFINER que bypassa RLS para verificar tenancy.
-- ══════════════════════════════════════════════════════════════════════════════

-- ── 1. Function SECURITY DEFINER para verificar se user pertence ao tenant ──
CREATE OR REPLACE FUNCTION user_shares_tenant(
  p_user_id UUID,
  p_tenant_type TEXT,
  p_tenant_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM atribuicoes_rbac
    WHERE user_id = p_user_id
      AND ativo = true
      AND tenant_type = p_tenant_type
      AND tenant_id = p_tenant_id
  );
$$;

GRANT EXECUTE ON FUNCTION user_shares_tenant(UUID, TEXT, UUID) TO authenticated;

-- ── 2. Recriar policy SELECT sem auto-referência ────────────────────────────
DROP POLICY IF EXISTS "atrib_rbac_v2_select" ON atribuicoes_rbac;

CREATE POLICY "atrib_rbac_v2_select"
  ON atribuicoes_rbac FOR SELECT TO authenticated
  USING (
    -- Master vê tudo
    is_masteradm()
    -- Cargo plataforma GERIR_COMUNIDADES vê tudo
    OR has_plataforma_permission('GERIR_COMUNIDADES')
    -- Próprias atribuições
    OR user_id = auth.uid()
    -- Atribuições do mesmo tenant (via SECURITY DEFINER, sem recursão)
    OR user_shares_tenant(auth.uid(), tenant_type, tenant_id)
    -- Criador/dono da comunidade vê equipe
    OR (
      tenant_type = 'COMUNIDADE'
      AND EXISTS (
        SELECT 1 FROM comunidades
        WHERE id = atribuicoes_rbac.tenant_id
          AND (created_by = auth.uid() OR dono_id = auth.uid())
      )
    )
    -- Produtor do evento vê equipe
    OR (
      tenant_type = 'EVENTO'
      AND is_produtor_evento(tenant_id)
    )
  );
