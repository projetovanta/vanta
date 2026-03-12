-- Fix ERRO 4: 7 policies usam cargos 'MASTER'/'DONO' que não existem em atribuicoes_rbac
-- Master acessa via profiles.role = 'vanta_masteradm' (OR), cargos corrigidos para GERENTE/SOCIO

-- ============================================================
-- eventos_privados (2 policies)
-- ============================================================
DROP POLICY IF EXISTS eventos_privados_admin_select ON eventos_privados;
CREATE POLICY eventos_privados_admin_select ON eventos_privados
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'vanta_masteradm')
    OR
    EXISTS (
      SELECT 1 FROM atribuicoes_rbac ar
      WHERE ar.user_id = auth.uid()
        AND ar.tenant_type = 'COMUNIDADE'
        AND ar.tenant_id = eventos_privados.comunidade_id
        AND ar.cargo IN ('GERENTE', 'SOCIO')
        AND ar.ativo = true
    )
  );

DROP POLICY IF EXISTS eventos_privados_admin_update ON eventos_privados;
CREATE POLICY eventos_privados_admin_update ON eventos_privados
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'vanta_masteradm')
    OR
    EXISTS (
      SELECT 1 FROM atribuicoes_rbac ar
      WHERE ar.user_id = auth.uid()
        AND ar.tenant_type = 'COMUNIDADE'
        AND ar.tenant_id = eventos_privados.comunidade_id
        AND ar.cargo IN ('GERENTE', 'SOCIO')
        AND ar.ativo = true
    )
  );

-- ============================================================
-- comemoracoes (2 policies)
-- ============================================================
DROP POLICY IF EXISTS comemoracoes_admin_select ON comemoracoes;
CREATE POLICY comemoracoes_admin_select ON comemoracoes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'vanta_masteradm')
    OR
    EXISTS (
      SELECT 1 FROM atribuicoes_rbac ar
      WHERE ar.user_id = auth.uid()
        AND ar.tenant_type = 'COMUNIDADE'
        AND ar.tenant_id = comemoracoes.comunidade_id
        AND ar.cargo IN ('GERENTE', 'SOCIO')
        AND ar.ativo = true
    )
  );

DROP POLICY IF EXISTS comemoracoes_admin_update ON comemoracoes;
CREATE POLICY comemoracoes_admin_update ON comemoracoes
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'vanta_masteradm')
    OR
    EXISTS (
      SELECT 1 FROM atribuicoes_rbac ar
      WHERE ar.user_id = auth.uid()
        AND ar.tenant_type = 'COMUNIDADE'
        AND ar.tenant_id = comemoracoes.comunidade_id
        AND ar.cargo IN ('GERENTE', 'SOCIO')
        AND ar.ativo = true
    )
  );

-- ============================================================
-- comemoracoes_config (1 policy)
-- ============================================================
DROP POLICY IF EXISTS comemoracoes_config_admin ON comemoracoes_config;
CREATE POLICY comemoracoes_config_admin ON comemoracoes_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'vanta_masteradm')
    OR
    EXISTS (
      SELECT 1 FROM atribuicoes_rbac ar
      WHERE ar.user_id = auth.uid()
        AND ar.tenant_type = 'COMUNIDADE'
        AND ar.tenant_id = comemoracoes_config.comunidade_id
        AND ar.cargo IN ('GERENTE', 'SOCIO')
        AND ar.ativo = true
    )
  );

-- ============================================================
-- comemoracoes_faixas (1 policy)
-- ============================================================
DROP POLICY IF EXISTS comemoracoes_faixas_admin ON comemoracoes_faixas;
CREATE POLICY comemoracoes_faixas_admin ON comemoracoes_faixas
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'vanta_masteradm')
    OR
    EXISTS (
      SELECT 1 FROM comemoracoes_config cc
      JOIN atribuicoes_rbac ar ON ar.tenant_id = cc.comunidade_id
      WHERE cc.id = comemoracoes_faixas.config_id
        AND ar.user_id = auth.uid()
        AND ar.tenant_type = 'COMUNIDADE'
        AND ar.cargo IN ('GERENTE', 'SOCIO')
        AND ar.ativo = true
    )
  );

-- ============================================================
-- comemoracoes_cortesias (1 policy)
-- ============================================================
DROP POLICY IF EXISTS comemoracoes_cortesias_admin ON comemoracoes_cortesias;
CREATE POLICY comemoracoes_cortesias_admin ON comemoracoes_cortesias
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'vanta_masteradm')
    OR
    EXISTS (
      SELECT 1 FROM comemoracoes c
      JOIN atribuicoes_rbac ar ON ar.tenant_id = c.comunidade_id
      WHERE c.id = comemoracoes_cortesias.comemoracao_id
        AND ar.user_id = auth.uid()
        AND ar.tenant_type = 'COMUNIDADE'
        AND ar.cargo IN ('GERENTE', 'SOCIO')
        AND ar.ativo = true
    )
  );
