-- ══════════════════════════════════════════════════════════════════════════════
-- RBAC V2 — Fase 1.2: Funções helper novas
-- has_plataforma_permission, has_comunidade_access, has_comunidade_write_access
-- ══════════════════════════════════════════════════════════════════════════════

-- ── 1. has_plataforma_permission ───────────────────────────────────────────
-- Verifica se auth.uid() tem cargo de plataforma com a permissão especificada
CREATE OR REPLACE FUNCTION has_plataforma_permission(p_permissao TEXT)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM atribuicoes_plataforma ap
    JOIN cargos_plataforma cp ON cp.id = ap.cargo_id
    WHERE ap.user_id = auth.uid()
      AND ap.ativo = true
      AND cp.ativo = true
      AND p_permissao = ANY(cp.permissoes)
  );
$$;

-- ── 2. has_comunidade_access ───────────────────────────────────────────────
-- Verifica se auth.uid() tem acesso a uma comunidade (master, cargo plataforma,
-- RBAC na comunidade, ou criador)
CREATE OR REPLACE FUNCTION has_comunidade_access(p_comunidade_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    -- Master tem acesso total
    is_masteradm()
    -- Cargo de plataforma com GERIR_COMUNIDADES
    OR has_plataforma_permission('GERIR_COMUNIDADES')
    -- Atribuição RBAC na comunidade (GERENTE)
    OR EXISTS (
      SELECT 1 FROM atribuicoes_rbac
      WHERE user_id = auth.uid()
        AND tenant_type = 'COMUNIDADE'
        AND tenant_id = p_comunidade_id
        AND ativo = true
    )
    -- Criador da comunidade
    OR EXISTS (
      SELECT 1 FROM comunidades
      WHERE id = p_comunidade_id
        AND (created_by = auth.uid() OR dono_id = auth.uid())
    );
$$;

-- ── 3. has_comunidade_write_access ─────────────────────────────────────────
-- Verifica se auth.uid() pode ATRIBUIR cargos em um tenant (comunidade ou evento)
-- Master, gerente da comunidade, sócio do evento
CREATE OR REPLACE FUNCTION has_comunidade_write_access(p_tenant_type TEXT, p_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    -- Master pode tudo
    is_masteradm()
    -- Cargo de plataforma com GERIR_COMUNIDADES
    OR has_plataforma_permission('GERIR_COMUNIDADES')
    -- Se tenant é COMUNIDADE: gerente da comunidade ou criador
    OR (
      p_tenant_type = 'COMUNIDADE'
      AND (
        EXISTS (
          SELECT 1 FROM atribuicoes_rbac
          WHERE user_id = auth.uid()
            AND tenant_type = 'COMUNIDADE'
            AND tenant_id = p_tenant_id
            AND cargo = 'GERENTE'
            AND ativo = true
        )
        OR EXISTS (
          SELECT 1 FROM comunidades
          WHERE id = p_tenant_id
            AND (created_by = auth.uid() OR dono_id = auth.uid())
        )
      )
    )
    -- Se tenant é EVENTO: sócio/gerente do evento ou produtor
    OR (
      p_tenant_type = 'EVENTO'
      AND (
        EXISTS (
          SELECT 1 FROM atribuicoes_rbac
          WHERE user_id = auth.uid()
            AND tenant_type = 'EVENTO'
            AND tenant_id = p_tenant_id
            AND cargo IN ('SOCIO', 'GER_PORTARIA_LISTA', 'GER_PORTARIA_ANTECIPADO')
            AND ativo = true
        )
        OR is_produtor_evento(p_tenant_id)
      )
    );
$$;

-- ── 4. Grants ──────────────────────────────────────────────────────────────
GRANT EXECUTE ON FUNCTION has_plataforma_permission(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION has_comunidade_access(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION has_comunidade_write_access(TEXT, UUID) TO authenticated;
