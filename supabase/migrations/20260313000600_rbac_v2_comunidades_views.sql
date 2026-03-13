-- ══════════════════════════════════════════════════════════════════════════════
-- RBAC V2 — Views pública e admin para comunidades
-- Banco = fonte da verdade. Dados sensíveis (CNPJ, taxas) só pra quem tem acesso.
-- ══════════════════════════════════════════════════════════════════════════════

-- ── 1. View pública (qualquer autenticado) ─────────────────────────────────
CREATE OR REPLACE VIEW comunidades_publico AS
SELECT
  id, nome, descricao, cidade, estado, endereco, foto, foto_capa,
  coords, capacidade_max, ativa, slug, tipo_comunidade,
  tier_minimo_mais_vanta, horario_funcionamento, horario_overrides,
  evento_privado_ativo, evento_privado_texto, evento_privado_fotos,
  evento_privado_formatos, evento_privado_atracoes, evento_privado_faixas_capacidade,
  created_at, updated_at
FROM comunidades;

-- ── 2. View admin (só quem tem acesso à comunidade) ────────────────────────
-- Inclui CNPJ, razão social, taxas, config financeira
CREATE OR REPLACE VIEW comunidades_admin AS
SELECT *
FROM comunidades
WHERE
  is_masteradm()
  OR has_plataforma_permission('GERIR_COMUNIDADES')
  OR EXISTS (
    SELECT 1 FROM atribuicoes_rbac
    WHERE user_id = auth.uid()
      AND tenant_type = 'COMUNIDADE'
      AND tenant_id = comunidades.id
      AND ativo = true
  )
  OR created_by = auth.uid()
  OR dono_id = auth.uid();

-- ── 3. Grants ──────────────────────────────────────────────────────────────
GRANT SELECT ON comunidades_publico TO authenticated;
GRANT SELECT ON comunidades_admin TO authenticated;
