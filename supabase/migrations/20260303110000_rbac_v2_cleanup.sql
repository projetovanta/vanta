-- ══════════════════════════════════════════════════════════════════════════════
-- RBAC V2 Cleanup — Fonte única: CargoUnificado + CARGO_PERMISSOES
-- ══════════════════════════════════════════════════════════════════════════════
-- 1. HOST → SOCIO (cargo legado eliminado)
-- 2. Drop colunas V2 (scope, community_id, inherited_from_community, recruited_to_event)
-- 3. Atualiza permissões das rows existentes para casar com CARGO_PERMISSOES
-- 4. Recria RLS policies sem HOST/PRODUTOR
-- ══════════════════════════════════════════════════════════════════════════════

-- ── 1. HOST → SOCIO ─────────────────────────────────────────────────────────
UPDATE atribuicoes_rbac SET cargo = 'SOCIO', updated_at = now()
WHERE cargo = 'HOST';

-- ── 2. Drop colunas V2 ─────────────────────────────────────────────────────
ALTER TABLE atribuicoes_rbac DROP COLUMN IF EXISTS scope;
ALTER TABLE atribuicoes_rbac DROP COLUMN IF EXISTS community_id;
ALTER TABLE atribuicoes_rbac DROP COLUMN IF EXISTS inherited_from_community;
ALTER TABLE atribuicoes_rbac DROP COLUMN IF EXISTS recruited_to_event;

-- ── 3. Alinhar permissões existentes com CARGO_PERMISSOES ──────────────────
-- GERENTE e SOCIO: 5 permissões
UPDATE atribuicoes_rbac
SET permissoes = ARRAY['VER_FINANCEIRO','GERIR_EQUIPE','GERIR_LISTAS','VENDER_PORTA','VALIDAR_ENTRADA'],
    updated_at = now()
WHERE cargo IN ('GERENTE', 'SOCIO') AND ativo = true;

-- PROMOTER: 2 permissões
UPDATE atribuicoes_rbac
SET permissoes = ARRAY['GERIR_LISTAS','INSERIR_LISTA'],
    updated_at = now()
WHERE cargo = 'PROMOTER' AND ativo = true;

-- GER_PORTARIA_LISTA: 2 permissões
UPDATE atribuicoes_rbac
SET permissoes = ARRAY['VALIDAR_ENTRADA','GERIR_EQUIPE'],
    updated_at = now()
WHERE cargo = 'GER_PORTARIA_LISTA' AND ativo = true;

-- PORTARIA_LISTA: 1 permissão
UPDATE atribuicoes_rbac
SET permissoes = ARRAY['VALIDAR_ENTRADA'],
    updated_at = now()
WHERE cargo = 'PORTARIA_LISTA' AND ativo = true;

-- GER_PORTARIA_ANTECIPADO: 2 permissões
UPDATE atribuicoes_rbac
SET permissoes = ARRAY['VALIDAR_ENTRADA','GERIR_EQUIPE'],
    updated_at = now()
WHERE cargo = 'GER_PORTARIA_ANTECIPADO' AND ativo = true;

-- PORTARIA_ANTECIPADO: 1 permissão
UPDATE atribuicoes_rbac
SET permissoes = ARRAY['VALIDAR_ENTRADA'],
    updated_at = now()
WHERE cargo = 'PORTARIA_ANTECIPADO' AND ativo = true;

-- CAIXA: 1 permissão
UPDATE atribuicoes_rbac
SET permissoes = ARRAY['VENDER_PORTA'],
    updated_at = now()
WHERE cargo = 'CAIXA' AND ativo = true;

-- ── 4. Recriar RLS policies sem HOST/PRODUTOR ──────────────────────────────

-- Policy: sócio lê equipe do tenant (comunidade)
DROP POLICY IF EXISTS "atrib_rbac: socio lê equipe do tenant" ON atribuicoes_rbac;
CREATE POLICY "atrib_rbac: socio lê equipe do tenant"
  ON atribuicoes_rbac FOR SELECT
  USING (
    (tenant_type = 'EVENTO' AND EXISTS (
      SELECT 1 FROM atribuicoes_rbac a2
      WHERE a2.user_id = auth.uid() AND a2.tenant_type = 'EVENTO'
        AND a2.tenant_id = atribuicoes_rbac.tenant_id
        AND a2.cargo IN ('SOCIO', 'GERENTE') AND a2.ativo = true
    ))
    OR
    (tenant_type = 'COMUNIDADE' AND EXISTS (
      SELECT 1 FROM atribuicoes_rbac a2
      WHERE a2.user_id = auth.uid() AND a2.tenant_type = 'COMUNIDADE'
        AND a2.tenant_id = atribuicoes_rbac.tenant_id
        AND a2.cargo IN ('SOCIO', 'GERENTE') AND a2.ativo = true
    ))
  );

-- Policy: sócio gerencia evento
DROP POLICY IF EXISTS "atrib_rbac: socio gerencia evento" ON atribuicoes_rbac;
CREATE POLICY "atrib_rbac: socio gerencia evento"
  ON atribuicoes_rbac FOR UPDATE
  USING (
    tenant_type = 'EVENTO' AND EXISTS (
      SELECT 1 FROM atribuicoes_rbac a2
      WHERE a2.user_id = auth.uid() AND a2.tenant_type = 'EVENTO'
        AND a2.tenant_id = atribuicoes_rbac.tenant_id
        AND a2.cargo IN ('SOCIO', 'GERENTE') AND a2.ativo = true
    )
  );

-- Policy: produtor atualiza cargos_customizados (comunidades)
DROP POLICY IF EXISTS "comunidades: produtor atualiza cargos_customizados" ON comunidades;
CREATE POLICY "comunidades: produtor atualiza cargos_customizados"
  ON comunidades FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM cargos
    WHERE cargos.comunidade_id = comunidades.id
      AND cargos.membro_id = auth.uid()
      AND cargos.tipo IN ('GERENTE', 'SOCIO')
  ));

-- Policy: produtor da comunidade lê eventos
DROP POLICY IF EXISTS "eventos_admin: produtor da comunidade" ON eventos_admin;
CREATE POLICY "eventos_admin: produtor da comunidade"
  ON eventos_admin FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM cargos
    WHERE cargos.comunidade_id = eventos_admin.comunidade_id
      AND cargos.membro_id = auth.uid()
      AND cargos.tipo IN ('GERENTE', 'SOCIO')
  ));
