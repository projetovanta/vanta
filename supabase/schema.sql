-- ============================================================
-- VANTA — Schema Completo v5
-- ============================================================
-- ATENÇÃO: recria todas as tabelas VANTA do zero.
-- Seguro para DEV. Não apaga auth.users nem a tabela profiles
-- (apenas adiciona colunas extras ao profiles do Supabase Auth).
-- Execute no SQL Editor do Supabase Dashboard.
--
-- Mudanças v4 → v5:
--   + listas_evento.teto_global_total (cap global da lista)
--   + tabela cotas_promoter (quotas individuais por promoter/regra)
--   + comunidades.cargos_customizados JSONB (funções customizadas)
--   + RPC processar_venda_caixa (tipo = VENDA_CAIXA)
--   + índice idx_listas_evento em listas_evento(evento_id)
--   + índice GIN em convidados_lista.nome (busca por nome na portaria)
--
-- Mudanças v5 → v6 (financeiro multi-tenant):
--   + comunidades.vanta_fee_percent NUMERIC(5,4)  — taxa % negociada por boate
--   + comunidades.vanta_fee_fixed   NUMERIC(10,2) — taxa fixa por ingresso
--   + eventos_admin.vanta_fee_percent NUMERIC(5,4)  — taxa % por evento (sobrescreve comunidade)
--   + eventos_admin.vanta_fee_fixed   NUMERIC(10,2) — taxa fixa por evento
-- ============================================================


-- ── 0. Extensões ────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";


-- ── RESET: Drop em ordem reversa de dependência ──────────────
-- Necessário quando o schema existente tem tipos incompatíveis.
-- Seguro em DEV — tabelas são recriadas logo abaixo.

DROP TABLE IF EXISTS vendas_log         CASCADE;
DROP TABLE IF EXISTS audit_logs         CASCADE;
DROP TABLE IF EXISTS convidados_lista   CASCADE;
DROP TABLE IF EXISTS cotas_promoter     CASCADE;
DROP TABLE IF EXISTS regras_lista       CASCADE;
DROP TABLE IF EXISTS listas_evento      CASCADE;
DROP TABLE IF EXISTS solicitacoes_saque CASCADE;
DROP TABLE IF EXISTS transactions       CASCADE;
DROP TABLE IF EXISTS tickets_caixa      CASCADE;
DROP TABLE IF EXISTS variacoes_ingresso CASCADE;
DROP TABLE IF EXISTS lotes              CASCADE;
DROP TABLE IF EXISTS equipe_evento      CASCADE;
DROP TABLE IF EXISTS eventos_admin      CASCADE;
DROP TABLE IF EXISTS cargos             CASCADE;
DROP TABLE IF EXISTS comunidades        CASCADE;
DROP TABLE IF EXISTS niveis_prestigio   CASCADE;


-- ── 1. ENUM Types (idempotente) ─────────────────────────────

DO $$ BEGIN
  CREATE TYPE conta_vanta AS ENUM (
    'vanta_guest', 'vanta_member', 'vanta_masteradm',
    'vanta_gerente', 'vanta_socio',
    'vanta_ger_portaria_lista', 'vanta_portaria_lista',
    'vanta_ger_portaria_antecipado', 'vanta_portaria_antecipado',
    'vanta_caixa', 'vanta_promoter'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE membro_status AS ENUM ('PENDENTE', 'APROVADO', 'REJEITADO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE tipo_cargo AS ENUM ('GERENTE', 'SOCIO', 'PROMOTER', 'PORTARIA_LISTA', 'PORTARIA_ANTECIPADO', 'GER_PORTARIA_LISTA', 'GER_PORTARIA_ANTECIPADO', 'CAIXA');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE papel_equipe AS ENUM ('SOCIO', 'PROMOTER', 'GERENTE', 'PORTARIA_LISTA', 'PORTARIA_ANTECIPADO', 'GER_PORTARIA_LISTA', 'GER_PORTARIA_ANTECIPADO', 'CAIXA');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE area_ingresso AS ENUM ('VIP', 'PISTA', 'CAMAROTE', 'BACKSTAGE', 'OUTRO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE genero_ingresso AS ENUM ('MASCULINO', 'FEMININO', 'UNISEX');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE ticket_status AS ENUM ('DISPONIVEL', 'USADO', 'CANCELADO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE transaction_status AS ENUM ('PENDENTE', 'CONCLUIDO', 'ESTORNADO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE transaction_tipo AS ENUM ('VENDA_CAIXA', 'VENDA_CHECKOUT', 'CORTESIA');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE saque_status AS ENUM ('PENDENTE', 'CONCLUIDO', 'ESTORNADO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE pix_tipo AS ENUM ('CPF', 'CNPJ', 'EMAIL', 'TELEFONE', 'CHAVE_ALEATORIA');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ── 2. Helper: updated_at ────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- ── 3. PROFILES (gerenciada pelo Supabase Auth) ───────────────
-- Apenas adiciona colunas VANTA — nunca recria nem dropa.

-- Corrige tipo de prestigio_id se veio como integer de schema antigo
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles'
      AND column_name = 'prestigio_id' AND data_type != 'uuid'
  ) THEN
    ALTER TABLE profiles DROP COLUMN prestigio_id;
  END IF;
END $$;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name          TEXT        NOT NULL DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS foto               TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS instagram          TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city               TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS state              TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_date         DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role               TEXT        NOT NULL DEFAULT 'vanta_guest';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status             TEXT        NOT NULL DEFAULT 'PENDENTE';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS biometria_url      TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS biometria_captured BOOLEAN     NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS prestigio_id       UUID;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tags_curadoria     TEXT[]      NOT NULL DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS curadoria_concluida BOOLEAN    NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notas_admin        TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at         TIMESTAMPTZ NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Trigger: cria profile automaticamente no signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ── 4. NIVEIS_PRESTIGIO ───────────────────────────────────────

CREATE TABLE niveis_prestigio (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nome       TEXT        NOT NULL,
  cor        TEXT        NOT NULL DEFAULT '#FFD300',
  icone      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FK profiles → niveis_prestigio (idempotente)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS fk_profiles_prestigio;
DO $$ BEGIN
  ALTER TABLE profiles ADD CONSTRAINT fk_profiles_prestigio
    FOREIGN KEY (prestigio_id) REFERENCES niveis_prestigio(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ── 5. COMUNIDADES ────────────────────────────────────────────

CREATE TABLE comunidades (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nome                 TEXT        NOT NULL,
  descricao            TEXT        NOT NULL DEFAULT '',
  cidade               TEXT        NOT NULL DEFAULT '',
  estado               TEXT,
  endereco             TEXT,
  foto                 TEXT,
  foto_capa            TEXT,
  coords               JSONB,
  capacidade_max       INTEGER,
  ativa                BOOLEAN     NOT NULL DEFAULT true,
  -- Funções customizadas criadas pelo sócio (DefinicaoCargoCustom[])
  -- Estrutura: [{ id, nome, permissoes: ['VER_FINANCEIRO', ...] }]
  cargos_customizados  JSONB       NOT NULL DEFAULT '[]'::jsonb,
  -- Taxas negociadas por comunidade (NULL = usa VANTA_FEE padrão 5%)
  vanta_fee_percent    NUMERIC(5,4),                            -- ex: 0.0400 = 4%
  vanta_fee_fixed      NUMERIC(10,2) NOT NULL DEFAULT 0,        -- ex: 2.50 = R$2,50/ingresso
  -- Modo gateway: ABSORVER (organizador paga gateway) | REPASSAR (cliente paga gateway)
  gateway_fee_mode     TEXT NOT NULL DEFAULT 'ABSORVER' CHECK (gateway_fee_mode IN ('ABSORVER', 'REPASSAR')),
  created_by           UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS comunidades_updated_at ON comunidades;
CREATE TRIGGER comunidades_updated_at
  BEFORE UPDATE ON comunidades
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ── 6. CARGOS ─────────────────────────────────────────────────

CREATE TABLE cargos (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  membro_id     UUID        NOT NULL REFERENCES profiles(id)    ON DELETE CASCADE,
  comunidade_id UUID        NOT NULL REFERENCES comunidades(id) ON DELETE CASCADE,
  tipo          TEXT        NOT NULL,
  atribuido_por UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  atribuido_em  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cargos_membro     ON cargos(membro_id);
CREATE INDEX idx_cargos_comunidade ON cargos(comunidade_id);


-- ── 6b. ATRIBUICOES_RBAC (RBAC Multi-Tenant) ──────────────────
-- Substitui cargos + equipe_evento como fonte da verdade de permissões.
-- cargos e equipe_evento mantidos como legado para migração gradual.

CREATE TABLE atribuicoes_rbac (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tenant_type   TEXT        NOT NULL CHECK (tenant_type IN ('COMUNIDADE', 'EVENTO')),
  tenant_id     UUID        NOT NULL,
  cargo         TEXT        NOT NULL,
  permissoes    TEXT[]      NOT NULL DEFAULT '{}',
  atribuido_por UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  atribuido_em  TIMESTAMPTZ NOT NULL DEFAULT now(),
  ativo         BOOLEAN     NOT NULL DEFAULT true,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, tenant_type, tenant_id, cargo)
);

CREATE INDEX idx_atrib_user   ON atribuicoes_rbac(user_id);
CREATE INDEX idx_atrib_tenant ON atribuicoes_rbac(tenant_type, tenant_id);

DROP TRIGGER IF EXISTS atrib_updated_at ON atribuicoes_rbac;
CREATE TRIGGER atrib_updated_at
  BEFORE UPDATE ON atribuicoes_rbac
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ── 7. EVENTOS_ADMIN ──────────────────────────────────────────

CREATE TABLE eventos_admin (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  comunidade_id  UUID        REFERENCES comunidades(id) ON DELETE SET NULL,
  nome           TEXT        NOT NULL,
  descricao      TEXT        NOT NULL DEFAULT '',
  data_inicio    TIMESTAMPTZ NOT NULL,
  data_fim       TIMESTAMPTZ,
  local          TEXT        NOT NULL DEFAULT '',
  endereco       TEXT,
  cidade         TEXT,
  foto           TEXT,
  coords         JSONB,
  publicado      BOOLEAN     NOT NULL DEFAULT false,
  caixa_ativo    BOOLEAN     NOT NULL DEFAULT false,
  taxa_override  NUMERIC(5,4),                             -- @deprecated alias de compatibilidade
  -- Taxas negociadas por evento (NULL = herda da comunidade ou VANTA_FEE padrão)
  vanta_fee_percent  NUMERIC(5,4),                         -- ex: 0.0300 = 3%
  vanta_fee_fixed    NUMERIC(10,2) NOT NULL DEFAULT 0,      -- ex: 1.00 = R$1,00/ingresso
  -- Modo gateway: ABSORVER (organizador paga gateway) | REPASSAR (cliente paga gateway)
  gateway_fee_mode   TEXT NOT NULL DEFAULT 'ABSORVER' CHECK (gateway_fee_mode IN ('ABSORVER', 'REPASSAR')),
  created_by     UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_eventos_admin_publicado  ON eventos_admin(publicado, data_inicio);
CREATE INDEX idx_eventos_admin_comunidade ON eventos_admin(comunidade_id);

DROP TRIGGER IF EXISTS eventos_admin_updated_at ON eventos_admin;
CREATE TRIGGER eventos_admin_updated_at
  BEFORE UPDATE ON eventos_admin
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ── 8. EQUIPE_EVENTO ──────────────────────────────────────────

CREATE TABLE equipe_evento (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id     UUID        NOT NULL REFERENCES eventos_admin(id) ON DELETE CASCADE,
  membro_id     UUID        NOT NULL REFERENCES profiles(id)      ON DELETE CASCADE,
  papel         TEXT        NOT NULL,
  liberar_lista BOOLEAN     NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (evento_id, membro_id, papel)
);

CREATE INDEX idx_equipe_evento_evento ON equipe_evento(evento_id);
CREATE INDEX idx_equipe_evento_membro ON equipe_evento(membro_id);


-- ── 9. LOTES ──────────────────────────────────────────────────

CREATE TABLE lotes (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id      UUID        NOT NULL REFERENCES eventos_admin(id) ON DELETE CASCADE,
  nome           TEXT        NOT NULL,
  data_validade  TIMESTAMPTZ,
  ativo          BOOLEAN     NOT NULL DEFAULT true,
  ordem          INTEGER     NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lotes_evento ON lotes(evento_id);


-- ── 10. VARIACOES_INGRESSO ────────────────────────────────────

CREATE TABLE variacoes_ingresso (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  lote_id     UUID          NOT NULL REFERENCES lotes(id) ON DELETE CASCADE,
  area        TEXT          NOT NULL DEFAULT 'PISTA',
  area_custom TEXT,
  genero      TEXT          NOT NULL DEFAULT 'UNISEX',
  valor       NUMERIC(10,2) NOT NULL DEFAULT 0,
  limite      INTEGER       NOT NULL DEFAULT 100,
  vendidos    INTEGER       NOT NULL DEFAULT 0 CHECK (vendidos >= 0),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_variacoes_lote ON variacoes_ingresso(lote_id);


-- ── 11. TICKETS_CAIXA ─────────────────────────────────────────

CREATE TABLE tickets_caixa (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id   UUID          NOT NULL REFERENCES eventos_admin(id)      ON DELETE RESTRICT,
  lote_id     UUID          REFERENCES lotes(id)                       ON DELETE SET NULL,
  variacao_id UUID          REFERENCES variacoes_ingresso(id)          ON DELETE SET NULL,
  email       TEXT          NOT NULL,
  owner_id    UUID          REFERENCES profiles(id)                    ON DELETE SET NULL,
  valor       NUMERIC(10,2) NOT NULL DEFAULT 0,
  status      TEXT          NOT NULL DEFAULT 'DISPONIVEL',
  usado_em    TIMESTAMPTZ,
  usado_por   UUID          REFERENCES profiles(id) ON DELETE SET NULL,
  criado_por  UUID          REFERENCES profiles(id) ON DELETE SET NULL,
  criado_em   TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_tickets_evento ON tickets_caixa(evento_id);
CREATE INDEX idx_tickets_owner  ON tickets_caixa(owner_id);
CREATE INDEX idx_tickets_status ON tickets_caixa(status);


-- ── 12. TRANSACTIONS ──────────────────────────────────────────

CREATE TABLE transactions (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id     UUID          NOT NULL REFERENCES eventos_admin(id) ON DELETE RESTRICT,
  ticket_id     UUID          REFERENCES tickets_caixa(id)          ON DELETE SET NULL,
  comprador_id  UUID          REFERENCES profiles(id)               ON DELETE SET NULL,
  email         TEXT          NOT NULL,
  valor_bruto   NUMERIC(10,2) NOT NULL,
  valor_liquido NUMERIC(10,2) NOT NULL,
  taxa_aplicada NUMERIC(5,4)  NOT NULL DEFAULT 0.05,
  status        TEXT          NOT NULL DEFAULT 'PENDENTE',
  tipo          TEXT          NOT NULL DEFAULT 'VENDA_CHECKOUT',
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_evento    ON transactions(evento_id);
CREATE INDEX idx_transactions_comprador ON transactions(comprador_id);
CREATE INDEX idx_transactions_status    ON transactions(status);


-- ── 13. SOLICITACOES_SAQUE ────────────────────────────────────

CREATE TABLE solicitacoes_saque (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  produtor_id     UUID          NOT NULL REFERENCES profiles(id)     ON DELETE RESTRICT,
  evento_id       UUID          NOT NULL REFERENCES eventos_admin(id) ON DELETE RESTRICT,
  valor           NUMERIC(10,2) NOT NULL,
  valor_liquido   NUMERIC(10,2) NOT NULL,
  valor_taxa      NUMERIC(10,2) NOT NULL,
  pix_tipo        TEXT          NOT NULL DEFAULT 'CPF',
  pix_chave       TEXT          NOT NULL,
  status          TEXT          NOT NULL DEFAULT 'PENDENTE',
  solicitado_em   TIMESTAMPTZ   NOT NULL DEFAULT now(),
  processado_em   TIMESTAMPTZ,
  processado_por  UUID          REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX idx_saques_produtor ON solicitacoes_saque(produtor_id);
CREATE INDEX idx_saques_status   ON solicitacoes_saque(status);


-- ── 14. LISTAS_EVENTO ─────────────────────────────────────────

CREATE TABLE listas_evento (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id         UUID        NOT NULL REFERENCES eventos_admin(id) ON DELETE CASCADE,
  -- Cap global: total máximo de convidados somando todas as regras
  teto_global_total INTEGER     NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice de busca por evento (query getMinhasListas)
CREATE INDEX idx_listas_evento ON listas_evento(evento_id);


-- ── 15. REGRAS_LISTA ──────────────────────────────────────────

CREATE TABLE regras_lista (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  lista_id    UUID          NOT NULL REFERENCES listas_evento(id) ON DELETE CASCADE,
  label       TEXT          NOT NULL,
  teto_global INTEGER       NOT NULL DEFAULT 0,
  saldo_banco INTEGER       NOT NULL DEFAULT 0,
  cor         TEXT,
  valor       NUMERIC(10,2),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_regras_lista ON regras_lista(lista_id);


-- ── 16. COTAS_PROMOTER ────────────────────────────────────────
-- Quotas individuais de cada promoter por regra de lista.
-- alocado = total distribuído ao promoter
-- usado   = nomes já inseridos por esse promoter nessa regra

CREATE TABLE cotas_promoter (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  lista_id    UUID        NOT NULL REFERENCES listas_evento(id) ON DELETE CASCADE,
  regra_id    UUID        NOT NULL REFERENCES regras_lista(id)  ON DELETE CASCADE,
  promoter_id UUID        NOT NULL REFERENCES profiles(id)      ON DELETE CASCADE,
  alocado     INTEGER     NOT NULL DEFAULT 0 CHECK (alocado >= 0),
  usado       INTEGER     NOT NULL DEFAULT 0 CHECK (usado >= 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (lista_id, regra_id, promoter_id)
);

CREATE INDEX idx_cotas_lista     ON cotas_promoter(lista_id);
CREATE INDEX idx_cotas_promoter  ON cotas_promoter(promoter_id);


-- ── 17. CONVIDADOS_LISTA ──────────────────────────────────────

CREATE TABLE convidados_lista (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  lista_id       UUID        NOT NULL REFERENCES listas_evento(id) ON DELETE CASCADE,
  regra_id       UUID        NOT NULL REFERENCES regras_lista(id)  ON DELETE RESTRICT,
  nome           TEXT        NOT NULL,
  telefone       TEXT,
  inserido_por   UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  checked_in     BOOLEAN     NOT NULL DEFAULT false,
  checked_in_em  TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_convidados_lista ON convidados_lista(lista_id);
-- Índice GIN para busca por nome (portaria/scanner — usa pg_trgm)
CREATE INDEX idx_convidados_nome_trgm ON convidados_lista USING gin(nome gin_trgm_ops);


-- ── 18. AUDIT_LOGS ────────────────────────────────────────────

CREATE TABLE audit_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  action      TEXT        NOT NULL,
  entity_type TEXT        NOT NULL,
  entity_id   TEXT,
  old_value   JSONB,
  new_value   JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_user   ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);


-- ── 19. VENDAS_LOG ────────────────────────────────────────────

CREATE TABLE vendas_log (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id       UUID          NOT NULL REFERENCES eventos_admin(id)     ON DELETE CASCADE,
  variacao_id     UUID          REFERENCES variacoes_ingresso(id)          ON DELETE SET NULL,
  variacao_label  TEXT          NOT NULL,
  valor           NUMERIC(10,2) NOT NULL,
  ts              TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_vendas_log_evento ON vendas_log(evento_id, ts DESC);


-- ════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════

ALTER TABLE niveis_prestigio     ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunidades          ENABLE ROW LEVEL SECURITY;
ALTER TABLE cargos               ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_admin        ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipe_evento        ENABLE ROW LEVEL SECURITY;
ALTER TABLE lotes                ENABLE ROW LEVEL SECURITY;
ALTER TABLE variacoes_ingresso   ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets_caixa        ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitacoes_saque   ENABLE ROW LEVEL SECURITY;
ALTER TABLE listas_evento        ENABLE ROW LEVEL SECURITY;
ALTER TABLE regras_lista         ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotas_promoter       ENABLE ROW LEVEL SECURITY;
ALTER TABLE convidados_lista     ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas_log           ENABLE ROW LEVEL SECURITY;


-- ── Helper Functions ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION is_masteradm()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'vanta_masteradm'
  );
$$;

CREATE OR REPLACE FUNCTION is_produtor_evento(p_evento_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM equipe_evento
    WHERE evento_id = p_evento_id
      AND membro_id = auth.uid()
      AND papel IN ('SOCIO', 'PROMOTER')
  );
$$;


-- ── Policies: profiles ────────────────────────────────────────

-- Leitura pública: qualquer autenticado pode buscar perfis (nome, email, etc.)
DROP POLICY IF EXISTS "profiles: leitura própria" ON profiles;
DROP POLICY IF EXISTS "profiles: leitura pública" ON profiles;
CREATE POLICY "profiles: leitura pública"
  ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles: atualização própria" ON profiles;
CREATE POLICY "profiles: atualização própria"
  ON profiles FOR UPDATE USING (id = auth.uid());

DROP POLICY IF EXISTS "profiles: masteradm atualiza tudo" ON profiles;
CREATE POLICY "profiles: masteradm atualiza tudo"
  ON profiles FOR UPDATE USING (is_masteradm());

DROP POLICY IF EXISTS "profiles: insert via trigger" ON profiles;
CREATE POLICY "profiles: insert via trigger"
  ON profiles FOR INSERT WITH CHECK (id = auth.uid());


-- ── Policies: niveis_prestigio ────────────────────────────────

DROP POLICY IF EXISTS "niveis_prestigio: leitura autenticada" ON niveis_prestigio;
DROP POLICY IF EXISTS "niveis_prestigio: somente masteradm" ON niveis_prestigio;
CREATE POLICY "niveis_prestigio: somente masteradm"
  ON niveis_prestigio FOR ALL USING (is_masteradm());

DROP POLICY IF EXISTS "niveis_prestigio: escrita masteradm" ON niveis_prestigio;


-- ── Policies: comunidades ─────────────────────────────────────

DROP POLICY IF EXISTS "comunidades: leitura autenticada" ON comunidades;
CREATE POLICY "comunidades: leitura autenticada"
  ON comunidades FOR SELECT USING (auth.uid() IS NOT NULL AND ativa = true);

DROP POLICY IF EXISTS "comunidades: masteradm escreve" ON comunidades;
CREATE POLICY "comunidades: masteradm escreve"
  ON comunidades FOR ALL USING (is_masteradm());

DROP POLICY IF EXISTS "comunidades: produtor lê suas" ON comunidades;
CREATE POLICY "comunidades: produtor lê suas"
  ON comunidades FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM cargos
    WHERE cargos.comunidade_id = comunidades.id AND cargos.membro_id = auth.uid()
  ));

DROP POLICY IF EXISTS "comunidades: produtor atualiza cargos_customizados" ON comunidades;
CREATE POLICY "comunidades: produtor atualiza cargos_customizados"
  ON comunidades FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM cargos
    WHERE cargos.comunidade_id = comunidades.id
      AND cargos.membro_id = auth.uid()
      AND cargos.tipo IN ('GERENTE', 'SOCIO')
  ));


-- ── Policies: cargos ──────────────────────────────────────────

DROP POLICY IF EXISTS "cargos: leitura própria ou masteradm" ON cargos;
CREATE POLICY "cargos: leitura própria ou masteradm"
  ON cargos FOR SELECT USING (membro_id = auth.uid() OR is_masteradm());

DROP POLICY IF EXISTS "cargos: masteradm escreve" ON cargos;
CREATE POLICY "cargos: masteradm escreve"
  ON cargos FOR ALL USING (is_masteradm());


-- ── Policies: eventos_admin ───────────────────────────────────

DROP POLICY IF EXISTS "eventos_admin: leitura publicados" ON eventos_admin;
CREATE POLICY "eventos_admin: leitura publicados"
  ON eventos_admin FOR SELECT USING (publicado = true AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "eventos_admin: equipe lê seus eventos" ON eventos_admin;
CREATE POLICY "eventos_admin: equipe lê seus eventos"
  ON eventos_admin FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM equipe_evento
    WHERE equipe_evento.evento_id = eventos_admin.id AND equipe_evento.membro_id = auth.uid()
  ));

DROP POLICY IF EXISTS "eventos_admin: produtor da comunidade" ON eventos_admin;
CREATE POLICY "eventos_admin: produtor da comunidade"
  ON eventos_admin FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM cargos
    WHERE cargos.comunidade_id = eventos_admin.comunidade_id
      AND cargos.membro_id = auth.uid()
      AND cargos.tipo IN ('GERENTE', 'SOCIO')
  ));

DROP POLICY IF EXISTS "eventos_admin: masteradm escreve" ON eventos_admin;
CREATE POLICY "eventos_admin: masteradm escreve"
  ON eventos_admin FOR ALL USING (is_masteradm());

DROP POLICY IF EXISTS "eventos_admin: produtor escreve seus eventos" ON eventos_admin;
CREATE POLICY "eventos_admin: produtor escreve seus eventos"
  ON eventos_admin FOR UPDATE
  USING (created_by = auth.uid() OR is_produtor_evento(id));


-- ── Policies: equipe_evento ───────────────────────────────────

DROP POLICY IF EXISTS "equipe_evento: leitura por membro ou sócio" ON equipe_evento;
CREATE POLICY "equipe_evento: leitura por membro ou sócio"
  ON equipe_evento FOR SELECT
  USING (membro_id = auth.uid() OR is_produtor_evento(evento_id) OR is_masteradm());

DROP POLICY IF EXISTS "equipe_evento: socio escreve" ON equipe_evento;
CREATE POLICY "equipe_evento: socio escreve"
  ON equipe_evento FOR ALL USING (is_produtor_evento(evento_id) OR is_masteradm());


-- ── Policies: lotes ───────────────────────────────────────────

DROP POLICY IF EXISTS "lotes: leitura por equipe ou público" ON lotes;
CREATE POLICY "lotes: leitura por equipe ou público"
  ON lotes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM eventos_admin e WHERE e.id = lotes.evento_id AND (
      e.publicado = true OR is_masteradm()
      OR EXISTS (SELECT 1 FROM equipe_evento ee WHERE ee.evento_id = e.id AND ee.membro_id = auth.uid())
    )
  ));

DROP POLICY IF EXISTS "lotes: escrita produtor ou masteradm" ON lotes;
CREATE POLICY "lotes: escrita produtor ou masteradm"
  ON lotes FOR ALL USING (is_produtor_evento(evento_id) OR is_masteradm());


-- ── Policies: variacoes_ingresso ──────────────────────────────

DROP POLICY IF EXISTS "variacoes: leitura por equipe ou público" ON variacoes_ingresso;
CREATE POLICY "variacoes: leitura por equipe ou público"
  ON variacoes_ingresso FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM lotes l JOIN eventos_admin e ON e.id = l.evento_id
    WHERE l.id = variacoes_ingresso.lote_id AND (
      e.publicado = true OR is_masteradm()
      OR EXISTS (SELECT 1 FROM equipe_evento ee WHERE ee.evento_id = e.id AND ee.membro_id = auth.uid())
    )
  ));

DROP POLICY IF EXISTS "variacoes: escrita produtor ou masteradm" ON variacoes_ingresso;
CREATE POLICY "variacoes: escrita produtor ou masteradm"
  ON variacoes_ingresso FOR ALL
  USING (EXISTS (
    SELECT 1 FROM lotes l WHERE l.id = variacoes_ingresso.lote_id
      AND (is_produtor_evento(l.evento_id) OR is_masteradm())
  ));


-- ── Policies: tickets_caixa ───────────────────────────────────

DROP POLICY IF EXISTS "tickets: leitura própria" ON tickets_caixa;
CREATE POLICY "tickets: leitura própria"
  ON tickets_caixa FOR SELECT USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "tickets: leitura por equipe" ON tickets_caixa;
CREATE POLICY "tickets: leitura por equipe"
  ON tickets_caixa FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM equipe_evento
    WHERE equipe_evento.evento_id = tickets_caixa.evento_id AND equipe_evento.membro_id = auth.uid()
  ) OR is_masteradm());

-- INSERT removido: toda inserção via RPCs SECURITY DEFINER

DROP POLICY IF EXISTS "tickets: atualização por equipe" ON tickets_caixa;
CREATE POLICY "tickets: atualização por equipe"
  ON tickets_caixa FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM equipe_evento
    WHERE equipe_evento.evento_id = tickets_caixa.evento_id AND equipe_evento.membro_id = auth.uid()
  ) OR is_masteradm());


-- ── Policies: transactions ────────────────────────────────────

DROP POLICY IF EXISTS "transactions: leitura própria" ON transactions;
CREATE POLICY "transactions: leitura própria"
  ON transactions FOR SELECT USING (comprador_id = auth.uid() OR is_masteradm());

DROP POLICY IF EXISTS "transactions: produtor lê seu evento" ON transactions;
CREATE POLICY "transactions: produtor lê seu evento"
  ON transactions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM equipe_evento
    WHERE equipe_evento.evento_id = transactions.evento_id
      AND equipe_evento.membro_id = auth.uid()
      AND equipe_evento.papel IN ('SOCIO', 'PROMOTER')
  ));

-- INSERT removido: toda inserção via RPCs SECURITY DEFINER


-- ── Policies: solicitacoes_saque ──────────────────────────────

DROP POLICY IF EXISTS "saques: produtor lê e cria os seus" ON solicitacoes_saque;
CREATE POLICY "saques: produtor lê e cria os seus"
  ON solicitacoes_saque FOR SELECT USING (produtor_id = auth.uid() OR is_masteradm());

DROP POLICY IF EXISTS "saques: produtor insere os seus" ON solicitacoes_saque;
CREATE POLICY "saques: produtor insere os seus"
  ON solicitacoes_saque FOR INSERT WITH CHECK (produtor_id = auth.uid());

DROP POLICY IF EXISTS "saques: masteradm atualiza" ON solicitacoes_saque;
CREATE POLICY "saques: masteradm atualiza"
  ON solicitacoes_saque FOR UPDATE USING (is_masteradm());


-- ── Policies: listas_evento ───────────────────────────────────

DROP POLICY IF EXISTS "listas: leitura por equipe" ON listas_evento;
CREATE POLICY "listas: leitura por equipe"
  ON listas_evento FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM equipe_evento
    WHERE equipe_evento.evento_id = listas_evento.evento_id AND equipe_evento.membro_id = auth.uid()
  ) OR is_masteradm());

DROP POLICY IF EXISTS "listas: escrita sócio ou masteradm" ON listas_evento;
CREATE POLICY "listas: escrita sócio ou masteradm"
  ON listas_evento FOR ALL USING (is_produtor_evento(evento_id) OR is_masteradm());


-- ── Policies: regras_lista ────────────────────────────────────

DROP POLICY IF EXISTS "regras: leitura por equipe" ON regras_lista;
CREATE POLICY "regras: leitura por equipe"
  ON regras_lista FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM listas_evento l JOIN equipe_evento ee ON ee.evento_id = l.evento_id
    WHERE l.id = regras_lista.lista_id AND ee.membro_id = auth.uid()
  ) OR is_masteradm());

DROP POLICY IF EXISTS "regras: escrita sócio ou masteradm" ON regras_lista;
CREATE POLICY "regras: escrita sócio ou masteradm"
  ON regras_lista FOR ALL
  USING (EXISTS (
    SELECT 1 FROM listas_evento l WHERE l.id = regras_lista.lista_id
      AND (is_produtor_evento(l.evento_id) OR is_masteradm())
  ));


-- ── Policies: cotas_promoter ──────────────────────────────────

DROP POLICY IF EXISTS "cotas: leitura por equipe" ON cotas_promoter;
CREATE POLICY "cotas: leitura por equipe"
  ON cotas_promoter FOR SELECT
  USING (
    promoter_id = auth.uid()
    OR is_masteradm()
    OR EXISTS (
      SELECT 1 FROM listas_evento l JOIN equipe_evento ee ON ee.evento_id = l.evento_id
      WHERE l.id = cotas_promoter.lista_id
        AND ee.membro_id = auth.uid()
        AND ee.papel IN ('SOCIO', 'PROMOTER')
    )
  );

DROP POLICY IF EXISTS "cotas: escrita sócio ou masteradm" ON cotas_promoter;
CREATE POLICY "cotas: escrita sócio ou masteradm"
  ON cotas_promoter FOR ALL
  USING (EXISTS (
    SELECT 1 FROM listas_evento l WHERE l.id = cotas_promoter.lista_id
      AND (is_produtor_evento(l.evento_id) OR is_masteradm())
  ));


-- ── Policies: convidados_lista ────────────────────────────────

DROP POLICY IF EXISTS "convidados: leitura por equipe" ON convidados_lista;
CREATE POLICY "convidados: leitura por equipe"
  ON convidados_lista FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM listas_evento l JOIN equipe_evento ee ON ee.evento_id = l.evento_id
    WHERE l.id = convidados_lista.lista_id AND ee.membro_id = auth.uid()
  ) OR is_masteradm());

DROP POLICY IF EXISTS "convidados: escrita por equipe" ON convidados_lista;
CREATE POLICY "convidados: escrita por equipe"
  ON convidados_lista FOR ALL
  USING (EXISTS (
    SELECT 1 FROM listas_evento l JOIN equipe_evento ee ON ee.evento_id = l.evento_id
    WHERE l.id = convidados_lista.lista_id
      AND ee.membro_id = auth.uid() AND ee.liberar_lista = true
  ) OR is_masteradm());


-- ── Policies: audit_logs ──────────────────────────────────────

DROP POLICY IF EXISTS "audit_logs: masteradm lê tudo" ON audit_logs;
CREATE POLICY "audit_logs: masteradm lê tudo"
  ON audit_logs FOR SELECT USING (is_masteradm());

DROP POLICY IF EXISTS "audit_logs: autenticado insere" ON audit_logs;
CREATE POLICY "audit_logs: autenticado insere"
  ON audit_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id::text = auth.uid()::text);


-- ── Policies: vendas_log ──────────────────────────────────────

DROP POLICY IF EXISTS "vendas_log: produtor ou masteradm" ON vendas_log;
CREATE POLICY "vendas_log: produtor ou masteradm"
  ON vendas_log FOR SELECT USING (is_produtor_evento(evento_id) OR is_masteradm());

-- INSERT removido: toda inserção via RPCs SECURITY DEFINER


-- ════════════════════════════════════════════════════════════
-- RPCs (Funções Atômicas — SECURITY DEFINER)
-- ════════════════════════════════════════════════════════════

-- ── queimar_ingresso ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION queimar_ingresso(
  p_ticket_id   UUID,
  p_event_id    UUID,
  p_operador_id UUID DEFAULT NULL
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_ticket tickets_caixa%ROWTYPE;
BEGIN
  -- Verifica permissão: equipe (PORTARIA, CAIXA, SOCIO) ou masteradm
  IF NOT EXISTS (
    SELECT 1 FROM equipe_evento
    WHERE evento_id = p_event_id AND membro_id = auth.uid()
      AND papel IN ('PORTARIA', 'CAIXA', 'SOCIO')
  ) AND NOT is_masteradm() THEN
    RETURN jsonb_build_object('resultado', 'SEM_PERMISSAO');
  END IF;

  SELECT * INTO v_ticket FROM tickets_caixa WHERE id = p_ticket_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('resultado', 'INVALIDO');
  END IF;

  IF v_ticket.evento_id <> p_event_id THEN
    RETURN jsonb_build_object('resultado', 'EVENTO_INCORRETO');
  END IF;

  IF v_ticket.status = 'USADO' THEN
    RETURN jsonb_build_object('resultado', 'JA_UTILIZADO', 'usado_em', v_ticket.usado_em);
  END IF;

  UPDATE tickets_caixa
  SET status = 'USADO', usado_em = now(), usado_por = COALESCE(p_operador_id, auth.uid())
  WHERE id = p_ticket_id;

  RETURN jsonb_build_object('resultado', 'VALIDO');
END;
$$;


-- ── processar_compra_checkout ─────────────────────────────────
-- Venda pública via checkout web (tipo = VENDA_CHECKOUT)
CREATE OR REPLACE FUNCTION processar_compra_checkout(
  p_evento_id    UUID,
  p_lote_id      UUID,
  p_variacao_id  UUID,
  p_email        TEXT,
  p_valor_unit   NUMERIC,
  p_quantidade   INTEGER DEFAULT 1,
  p_comprador_id UUID    DEFAULT NULL,
  p_taxa         NUMERIC DEFAULT 0.05  -- ignorado, calculado server-side
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_ticket_id   UUID;
  v_total_bruto NUMERIC;
  v_tickets     JSONB := '[]'::JSONB;
  v_taxa        NUMERIC;
  i             INTEGER;
BEGIN
  -- Taxa calculada server-side: evento → comunidade → padrão 0.05
  SELECT COALESCE(e.vanta_fee_percent, c.vanta_fee_percent, 0.05)
  INTO v_taxa
  FROM eventos_admin e
  LEFT JOIN comunidades c ON c.id = e.comunidade_id
  WHERE e.id = p_evento_id;
  IF v_taxa IS NULL THEN v_taxa := 0.05; END IF;

  v_total_bruto := p_valor_unit * p_quantidade;

  IF EXISTS (SELECT 1 FROM variacoes_ingresso WHERE id = p_variacao_id AND vendidos >= limite) THEN
    RETURN jsonb_build_object('ok', false, 'erro', 'Ingresso esgotado.');
  END IF;

  FOR i IN 1..p_quantidade LOOP
    INSERT INTO tickets_caixa (evento_id, lote_id, variacao_id, email, owner_id, valor, status)
    VALUES (p_evento_id, p_lote_id, p_variacao_id, p_email, p_comprador_id, p_valor_unit, 'DISPONIVEL')
    RETURNING id INTO v_ticket_id;

    INSERT INTO transactions (evento_id, ticket_id, comprador_id, email, valor_bruto, valor_liquido, taxa_aplicada, status, tipo)
    VALUES (p_evento_id, v_ticket_id, p_comprador_id, p_email, p_valor_unit,
            ROUND(p_valor_unit * (1 - v_taxa), 2), v_taxa, 'CONCLUIDO', 'VENDA_CHECKOUT');

    UPDATE variacoes_ingresso SET vendidos = vendidos + 1 WHERE id = p_variacao_id;

    INSERT INTO vendas_log (evento_id, variacao_id, variacao_label, valor)
    SELECT p_evento_id, p_variacao_id, CONCAT(area, ' · ', genero), p_valor_unit
    FROM variacoes_ingresso WHERE id = p_variacao_id;

    v_tickets := v_tickets || jsonb_build_object('ticketId', v_ticket_id);
  END LOOP;

  RETURN jsonb_build_object(
    'ok', true, 'tickets', v_tickets,
    'totalBruto', v_total_bruto,
    'totalLiquido', ROUND(v_total_bruto * (1 - v_taxa), 2),
    'taxaAplicada', v_taxa
  );
END;
$$;


-- ── processar_venda_caixa ─────────────────────────────────────
-- Venda física na porta pelo operador CAIXA (tipo = VENDA_CAIXA)
-- Diferente do checkout: não tem owner (comprador presencial),
-- tickets criados pelo operador autenticado (criado_por = auth.uid()).
CREATE OR REPLACE FUNCTION processar_venda_caixa(
  p_evento_id    UUID,
  p_lote_id      UUID,
  p_variacao_id  UUID,
  p_email        TEXT,
  p_valor_unit   NUMERIC,
  p_taxa         NUMERIC DEFAULT 0.05  -- ignorado, calculado server-side
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_ticket_id UUID;
  v_var       variacoes_ingresso%ROWTYPE;
  v_taxa      NUMERIC;
BEGIN
  -- Taxa calculada server-side
  SELECT COALESCE(e.vanta_fee_percent, c.vanta_fee_percent, 0.05)
  INTO v_taxa
  FROM eventos_admin e
  LEFT JOIN comunidades c ON c.id = e.comunidade_id
  WHERE e.id = p_evento_id;
  IF v_taxa IS NULL THEN v_taxa := 0.05; END IF;

  -- Verifica disponibilidade
  SELECT * INTO v_var FROM variacoes_ingresso WHERE id = p_variacao_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'erro', 'Variação não encontrada.');
  END IF;
  IF v_var.vendidos >= v_var.limite THEN
    RETURN jsonb_build_object('ok', false, 'erro', 'Ingresso esgotado.');
  END IF;

  -- Verifica que o operador tem papel CAIXA no evento
  IF NOT EXISTS (
    SELECT 1 FROM equipe_evento
    WHERE evento_id = p_evento_id AND membro_id = auth.uid() AND papel = 'CAIXA'
  ) AND NOT is_masteradm() THEN
    RETURN jsonb_build_object('ok', false, 'erro', 'Sem permissão de caixa para este evento.');
  END IF;

  -- Verifica que o caixa está ativo
  IF NOT EXISTS (
    SELECT 1 FROM eventos_admin WHERE id = p_evento_id AND caixa_ativo = true
  ) THEN
    RETURN jsonb_build_object('ok', false, 'erro', 'Caixa não está ativo para este evento.');
  END IF;

  -- Cria ticket
  INSERT INTO tickets_caixa (evento_id, lote_id, variacao_id, email, valor, status, criado_por)
  VALUES (p_evento_id, p_lote_id, p_variacao_id, p_email, p_valor_unit, 'DISPONIVEL', auth.uid())
  RETURNING id INTO v_ticket_id;

  -- Transação
  INSERT INTO transactions (evento_id, ticket_id, email, valor_bruto, valor_liquido, taxa_aplicada, status, tipo)
  VALUES (
    p_evento_id, v_ticket_id, p_email,
    p_valor_unit, ROUND(p_valor_unit * (1 - v_taxa), 2),
    v_taxa, 'CONCLUIDO', 'VENDA_CAIXA'
  );

  UPDATE variacoes_ingresso SET vendidos = vendidos + 1 WHERE id = p_variacao_id;

  INSERT INTO vendas_log (evento_id, variacao_id, variacao_label, valor)
  VALUES (p_evento_id, p_variacao_id, CONCAT(v_var.area, ' · ', v_var.genero), p_valor_unit);

  RETURN jsonb_build_object(
    'ok', true,
    'ticketId', v_ticket_id,
    'valorLiquido', ROUND(p_valor_unit * (1 - v_taxa), 2),
    'taxaAplicada', v_taxa
  );
END;
$$;


-- ════════════════════════════════════════════════════════════
-- v6 → v7: segurança (JWT/selfie) e soberania
-- ════════════════════════════════════════════════════════════

-- Novos campos em tickets_caixa (titular + CPF + selfie)
ALTER TABLE tickets_caixa
  ADD COLUMN IF NOT EXISTS nome_titular TEXT        NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS cpf          TEXT        NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS selfie_url   TEXT;
  -- selfie_url armazena URL no Supabase Storage (nunca base64 — economiza DB)
  -- bucket: "selfies" (criado via Storage Dashboard)

-- Tabela de log de vendas por produtor (para rastreamento financeiro)
-- A tabela vendas_log acima não tem produtor_id — adicionamos como coluna opcional
ALTER TABLE vendas_log
  ADD COLUMN IF NOT EXISTS produtor_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_vendas_log_produtor ON vendas_log(produtor_id);

-- Tabela de solicitações de acesso de soberania (produtor pede saldo de evento de sócio)
DROP TABLE IF EXISTS soberania_acesso CASCADE;
CREATE TABLE soberania_acesso (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id      UUID        NOT NULL REFERENCES eventos_admin(id) ON DELETE CASCADE,
  solicitante_id UUID        NOT NULL REFERENCES profiles(id)      ON DELETE CASCADE,
  status         TEXT        NOT NULL DEFAULT 'PENDENTE'
                             CHECK (status IN ('PENDENTE', 'AUTORIZADO', 'NEGADO')),
  solicitado_em  TIMESTAMPTZ NOT NULL DEFAULT now(),
  decidido_em    TIMESTAMPTZ,
  UNIQUE (evento_id, solicitante_id)
);

CREATE INDEX IF NOT EXISTS idx_soberania_evento       ON soberania_acesso(evento_id);
CREATE INDEX IF NOT EXISTS idx_soberania_solicitante  ON soberania_acesso(solicitante_id);

ALTER TABLE soberania_acesso ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "soberania_acesso: leitura própria ou masteradm" ON soberania_acesso;
CREATE POLICY "soberania_acesso: leitura própria ou masteradm"
  ON soberania_acesso FOR SELECT
  USING (solicitante_id = auth.uid() OR is_masteradm() OR is_produtor_evento(evento_id));

DROP POLICY IF EXISTS "soberania_acesso: inserir própria" ON soberania_acesso;
CREATE POLICY "soberania_acesso: inserir própria"
  ON soberania_acesso FOR INSERT WITH CHECK (solicitante_id = auth.uid());

DROP POLICY IF EXISTS "soberania_acesso: socio decide" ON soberania_acesso;
CREATE POLICY "soberania_acesso: socio decide"
  ON soberania_acesso FOR UPDATE
  USING (is_produtor_evento(evento_id) OR is_masteradm());


-- ════════════════════════════════════════════════════════════
-- REALTIME
-- ════════════════════════════════════════════════════════════

DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE tickets_caixa;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE solicitacoes_saque;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE vendas_log;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE convidados_lista;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE niveis_prestigio;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
