-- ══════════════════════════════════════════════════════════════════════════════
-- RBAC V2 — Restringir SELECT de atribuicoes_rbac
-- Cada usuário só vê atribuições dos seus próprios tenants + as suas próprias.
-- Master vê tudo.
-- ══════════════════════════════════════════════════════════════════════════════

-- ── 1. Drop policy SELECT aberta ──────────────────────────────────────────
DROP POLICY IF EXISTS "atrib_rbac_v2_select" ON atribuicoes_rbac;

-- ── 2. Nova policy SELECT restrita ─────────────────────────────────────────
-- Usuário vê:
--   a) Suas próprias atribuições
--   b) Atribuições de tenants onde ele é GERENTE/SOCIO/master
--   c) Master vê tudo
CREATE POLICY "atrib_rbac_v2_select"
  ON atribuicoes_rbac FOR SELECT TO authenticated
  USING (
    -- Master vê tudo
    is_masteradm()
    -- Cargo plataforma GERIR_COMUNIDADES vê tudo
    OR has_plataforma_permission('GERIR_COMUNIDADES')
    -- Próprias atribuições
    OR user_id = auth.uid()
    -- Atribuições do mesmo tenant onde o usuário tem cargo
    OR EXISTS (
      SELECT 1 FROM atribuicoes_rbac my
      WHERE my.user_id = auth.uid()
        AND my.ativo = true
        AND my.tenant_type = atribuicoes_rbac.tenant_type
        AND my.tenant_id = atribuicoes_rbac.tenant_id
    )
    -- Criador/dono da comunidade vê equipe da comunidade
    OR (
      tenant_type = 'COMUNIDADE'
      AND EXISTS (
        SELECT 1 FROM comunidades
        WHERE id = atribuicoes_rbac.tenant_id
          AND (created_by = auth.uid() OR dono_id = auth.uid())
      )
    )
    -- Produtor do evento vê equipe do evento
    OR (
      tenant_type = 'EVENTO'
      AND is_produtor_evento(tenant_id)
    )
  );
