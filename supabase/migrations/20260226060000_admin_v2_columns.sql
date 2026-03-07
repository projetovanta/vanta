-- ══════════════════════════════════════════════════════════════════════════════
-- VANTA V2 — Phase 2B.1: Adiciona colunas V2 à tabela atribuicoes_rbac
-- ══════════════════════════════════════════════════════════════════════════════
--
-- Discriminação de linhas:
--   scope IS NULL  → linha legada (AtribuicaoRBAC)
--   scope IS NOT NULL → linha V2 nativa (AdminAssignment)
--
-- Nenhuma linha existente é alterada — todas têm scope=NULL por default.
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. scope: 'platform' | 'community' | 'event' | NULL (legado)
ALTER TABLE atribuicoes_rbac
  ADD COLUMN IF NOT EXISTS scope TEXT DEFAULT NULL
  CHECK (scope IS NULL OR scope IN ('platform', 'community', 'event'));

-- 2. community_id: referência explícita à comunidade (V2 resolve sem lookup)
ALTER TABLE atribuicoes_rbac
  ADD COLUMN IF NOT EXISTS community_id UUID DEFAULT NULL
  REFERENCES comunidades(id) ON DELETE SET NULL;

-- 3. inherited_from_community: true quando o assignment foi herdado da comunidade
ALTER TABLE atribuicoes_rbac
  ADD COLUMN IF NOT EXISTS inherited_from_community BOOLEAN NOT NULL DEFAULT false;

-- 4. recruited_to_event: true quando o staff foi recrutado explicitamente para o evento
ALTER TABLE atribuicoes_rbac
  ADD COLUMN IF NOT EXISTS recruited_to_event BOOLEAN NOT NULL DEFAULT false;
