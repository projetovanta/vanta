-- ══════════════════════════════════════════════════════════════════════════════
-- Fix: UNIQUE constraint em atribuicoes_rbac
-- ══════════════════════════════════════════════════════════════════════════════
--
-- O rbacService.atribuir() usa upsert com onConflict: 'user_id,tenant_type,tenant_id,cargo'
-- Sem esta constraint, o upsert falha silenciosamente (PostgreSQL exige UNIQUE para ON CONFLICT).
-- Isso causava: tabela atribuicoes_rbac vazia → ninguém com cargo → "Sem atribuições ativas".
-- ══════════════════════════════════════════════════════════════════════════════

-- Limpar duplicatas antes de criar constraint (manter apenas a mais recente por grupo)
DELETE FROM atribuicoes_rbac a
USING atribuicoes_rbac b
WHERE a.user_id = b.user_id
  AND a.tenant_type = b.tenant_type
  AND a.tenant_id = b.tenant_id
  AND a.cargo = b.cargo
  AND a.id < b.id;

-- Criar constraint UNIQUE
ALTER TABLE atribuicoes_rbac
  ADD CONSTRAINT atribuicoes_rbac_user_tenant_cargo_unique
  UNIQUE (user_id, tenant_type, tenant_id, cargo);
