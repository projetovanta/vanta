-- ══════════════════════════════════════════════════════════════════════════════
-- RBAC V2 — Fase 1.1: Tabelas cargos_plataforma + atribuicoes_plataforma
-- Cargos do "prédio" — master cria cargos com permissões dinâmicas
-- ══════════════════════════════════════════════════════════════════════════════

-- ── 1. Tabela de cargos de plataforma ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS cargos_plataforma (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT,
  permissoes TEXT[] NOT NULL DEFAULT '{}',
  criado_por UUID NOT NULL REFERENCES profiles(id),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ativo BOOLEAN NOT NULL DEFAULT true
);

-- Permissões válidas de plataforma (documentação inline):
-- GERIR_MAIS_VANTA, GERIR_COMUNIDADES, VER_ANALYTICS, GERIR_FINANCEIRO_GLOBAL, GERIR_INDICACOES

COMMENT ON TABLE cargos_plataforma IS 'Cargos dinâmicos de plataforma (prédio). Criados pelo master.';
COMMENT ON COLUMN cargos_plataforma.permissoes IS 'Array de permissões: GERIR_MAIS_VANTA, GERIR_COMUNIDADES, VER_ANALYTICS, GERIR_FINANCEIRO_GLOBAL, GERIR_INDICACOES';

-- ── 2. Tabela de atribuições de plataforma ─────────────────────────────────
CREATE TABLE IF NOT EXISTS atribuicoes_plataforma (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  cargo_id UUID NOT NULL REFERENCES cargos_plataforma(id),
  atribuido_por UUID NOT NULL REFERENCES profiles(id),
  atribuido_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  ativo BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(user_id, cargo_id)
);

COMMENT ON TABLE atribuicoes_plataforma IS 'Vincula usuários a cargos de plataforma (prédio).';

-- ── 3. Índices ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_atrib_plat_user ON atribuicoes_plataforma(user_id);
CREATE INDEX IF NOT EXISTS idx_atrib_plat_cargo ON atribuicoes_plataforma(cargo_id);
CREATE INDEX IF NOT EXISTS idx_cargos_plat_ativo ON cargos_plataforma(ativo) WHERE ativo = true;

-- ── 4. RLS ─────────────────────────────────────────────────────────────────
ALTER TABLE cargos_plataforma ENABLE ROW LEVEL SECURITY;
ALTER TABLE atribuicoes_plataforma ENABLE ROW LEVEL SECURITY;

-- cargos_plataforma: qualquer autenticado lê, apenas master escreve
CREATE POLICY "cargos_plat_select"
  ON cargos_plataforma FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "cargos_plat_write"
  ON cargos_plataforma FOR ALL TO authenticated
  USING (is_masteradm()) WITH CHECK (is_masteradm());

-- atribuicoes_plataforma: autenticado lê (necessário para helpers), master escreve
CREATE POLICY "atrib_plat_select"
  ON atribuicoes_plataforma FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "atrib_plat_write"
  ON atribuicoes_plataforma FOR ALL TO authenticated
  USING (is_masteradm()) WITH CHECK (is_masteradm());

-- ── 5. Grants ──────────────────────────────────────────────────────────────
GRANT SELECT ON cargos_plataforma TO authenticated;
GRANT SELECT ON atribuicoes_plataforma TO authenticated;
GRANT ALL ON cargos_plataforma TO authenticated;
GRANT ALL ON atribuicoes_plataforma TO authenticated;

-- ── 6. updated_at trigger ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_cargos_plataforma_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cargos_plataforma_updated ON cargos_plataforma;
CREATE TRIGGER trg_cargos_plataforma_updated
  BEFORE UPDATE ON cargos_plataforma
  FOR EACH ROW EXECUTE FUNCTION update_cargos_plataforma_updated_at();
