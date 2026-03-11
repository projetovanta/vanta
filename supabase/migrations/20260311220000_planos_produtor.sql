-- Fase 3: Planos do produtor
-- Tabelas para planos configuráveis pelo admin + atribuição produtor→plano

CREATE TABLE IF NOT EXISTS planos_produtor (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome                    TEXT NOT NULL,
  descricao               TEXT DEFAULT '',
  preco_mensal            NUMERIC(10,2) NOT NULL DEFAULT 0,
  limite_eventos_mes      INTEGER NOT NULL DEFAULT 5,
  limite_resgates_evento  INTEGER NOT NULL DEFAULT 20,
  tiers_acessiveis        TEXT[] NOT NULL DEFAULT '{lista,presenca}',
  limite_notificacoes_mes INTEGER NOT NULL DEFAULT 3,
  preco_evento_extra      NUMERIC(10,2) NOT NULL DEFAULT 0,
  preco_notificacao_extra NUMERIC(10,2) NOT NULL DEFAULT 0,
  ativo                   BOOLEAN NOT NULL DEFAULT true,
  personalizado_para      UUID REFERENCES profiles(id) DEFAULT NULL,
  ordem                   INTEGER NOT NULL DEFAULT 0,
  criado_em               TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS produtor_plano (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produtor_id UUID NOT NULL REFERENCES profiles(id),
  plano_id    UUID NOT NULL REFERENCES planos_produtor(id),
  inicio      TIMESTAMPTZ NOT NULL DEFAULT now(),
  fim         TIMESTAMPTZ,
  status      TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'cancelado', 'expirado')),
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE planos_produtor ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtor_plano ENABLE ROW LEVEL SECURITY;

-- Planos visíveis por todos (leitura), editáveis por admin
CREATE POLICY "planos_produtor_select" ON planos_produtor FOR SELECT USING (true);
CREATE POLICY "planos_produtor_admin" ON planos_produtor FOR ALL USING (
  EXISTS (SELECT 1 FROM atribuicoes_rbac WHERE user_id = auth.uid() AND cargo IN ('masteradm', 'socio'))
);

-- Produtor vê seu próprio plano, admin vê todos
CREATE POLICY "produtor_plano_select_own" ON produtor_plano FOR SELECT USING (
  produtor_id = auth.uid() OR
  EXISTS (SELECT 1 FROM atribuicoes_rbac WHERE user_id = auth.uid() AND cargo IN ('masteradm', 'socio'))
);
CREATE POLICY "produtor_plano_admin" ON produtor_plano FOR ALL USING (
  EXISTS (SELECT 1 FROM atribuicoes_rbac WHERE user_id = auth.uid() AND cargo IN ('masteradm', 'socio'))
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_produtor_plano_produtor ON produtor_plano(produtor_id);
CREATE INDEX IF NOT EXISTS idx_produtor_plano_status ON produtor_plano(status);
CREATE INDEX IF NOT EXISTS idx_planos_produtor_ativo ON planos_produtor(ativo);
