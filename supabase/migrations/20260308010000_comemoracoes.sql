-- Feature: Comemoracao (Aniversario/Despedida VIP)
-- Solicitacao de comemoracao em evento ou comunidade

-- Config por evento
CREATE TABLE IF NOT EXISTS comemoracoes_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID REFERENCES eventos_admin(id) ON DELETE CASCADE,
  comunidade_id UUID NOT NULL REFERENCES comunidades(id) ON DELETE CASCADE,
  habilitado BOOLEAN NOT NULL DEFAULT true,
  limite_comemoracoes INTEGER,
  deadline_hora TEXT,
  datas_bloqueadas JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(evento_id)
);

-- Faixas de beneficios por config
CREATE TABLE IF NOT EXISTS comemoracoes_faixas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID NOT NULL REFERENCES comemoracoes_config(id) ON DELETE CASCADE,
  min_vendas INTEGER NOT NULL,
  cortesias INTEGER NOT NULL DEFAULT 0,
  beneficio_consumo TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Solicitacoes de comemoracao
CREATE TABLE IF NOT EXISTS comemoracoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comunidade_id UUID NOT NULL REFERENCES comunidades(id) ON DELETE CASCADE,
  evento_id UUID REFERENCES eventos_admin(id),
  solicitante_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'ENVIADA' CHECK (status IN ('ENVIADA','VISUALIZADA','EM_ANALISE','APROVADA','RECUSADA')),
  -- Formulario
  motivo TEXT NOT NULL CHECK (motivo IN ('ANIVERSARIO','DESPEDIDA','OUTRO')),
  motivo_outro TEXT,
  nome_completo TEXT NOT NULL,
  data_aniversario TEXT,
  data_comemoracao TEXT NOT NULL,
  celular TEXT NOT NULL,
  instagram TEXT NOT NULL,
  -- Tracking
  ref_code TEXT UNIQUE,
  vendas_count INTEGER NOT NULL DEFAULT 0,
  -- Gestao
  avaliado_por UUID REFERENCES profiles(id),
  avaliado_em TIMESTAMPTZ,
  motivo_recusa TEXT,
  mensagem_gerente TEXT,
  visualizado_em TIMESTAMPTZ,
  em_analise_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cortesias ganhas por comemoracao
CREATE TABLE IF NOT EXISTS comemoracoes_cortesias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comemoracao_id UUID NOT NULL REFERENCES comemoracoes(id) ON DELETE CASCADE,
  faixa_id UUID NOT NULL REFERENCES comemoracoes_faixas(id) ON DELETE CASCADE,
  nome_convidado TEXT,
  celular_convidado TEXT,
  resgatado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Triggers updated_at
CREATE TRIGGER set_updated_at_comemoracoes_config
  BEFORE UPDATE ON comemoracoes_config
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_comemoracoes
  BEFORE UPDATE ON comemoracoes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_comemoracoes_comunidade ON comemoracoes(comunidade_id);
CREATE INDEX IF NOT EXISTS idx_comemoracoes_evento ON comemoracoes(evento_id);
CREATE INDEX IF NOT EXISTS idx_comemoracoes_solicitante ON comemoracoes(solicitante_id);
CREATE INDEX IF NOT EXISTS idx_comemoracoes_ref_code ON comemoracoes(ref_code);
CREATE INDEX IF NOT EXISTS idx_comemoracoes_config_evento ON comemoracoes_config(evento_id);
CREATE INDEX IF NOT EXISTS idx_comemoracoes_config_comunidade ON comemoracoes_config(comunidade_id);
CREATE INDEX IF NOT EXISTS idx_comemoracoes_faixas_config ON comemoracoes_faixas(config_id);
CREATE INDEX IF NOT EXISTS idx_comemoracoes_cortesias_comemoracao ON comemoracoes_cortesias(comemoracao_id);

-- RLS
ALTER TABLE comemoracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comemoracoes_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE comemoracoes_faixas ENABLE ROW LEVEL SECURITY;
ALTER TABLE comemoracoes_cortesias ENABLE ROW LEVEL SECURITY;

-- Solicitante ve proprias comemoracoes
CREATE POLICY comemoracoes_own ON comemoracoes
  FOR SELECT USING (solicitante_id = auth.uid());

CREATE POLICY comemoracoes_insert ON comemoracoes
  FOR INSERT WITH CHECK (solicitante_id = auth.uid());

-- Gerente ve comemoracoes da comunidade
CREATE POLICY comemoracoes_admin_select ON comemoracoes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM atribuicoes_rbac ar
      WHERE ar.user_id = auth.uid()
        AND ar.tenant_type = 'COMUNIDADE'
        AND ar.tenant_id = comemoracoes.comunidade_id
        AND ar.cargo IN ('MASTER','DONO','GERENTE')
        AND ar.ativo = true
    )
  );

CREATE POLICY comemoracoes_admin_update ON comemoracoes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM atribuicoes_rbac ar
      WHERE ar.user_id = auth.uid()
        AND ar.tenant_type = 'COMUNIDADE'
        AND ar.tenant_id = comemoracoes.comunidade_id
        AND ar.cargo IN ('MASTER','DONO','GERENTE')
        AND ar.ativo = true
    )
  );

-- Config: gerente le e escreve
CREATE POLICY comemoracoes_config_admin ON comemoracoes_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM atribuicoes_rbac ar
      WHERE ar.user_id = auth.uid()
        AND ar.tenant_type = 'COMUNIDADE'
        AND ar.tenant_id = comemoracoes_config.comunidade_id
        AND ar.cargo IN ('MASTER','DONO','GERENTE')
        AND ar.ativo = true
    )
  );

-- Config: membro pode ler (pra ver se comemoracoes estao habilitadas)
CREATE POLICY comemoracoes_config_read ON comemoracoes_config
  FOR SELECT USING (true);

-- Faixas: todos podem ler (pra ver beneficios)
CREATE POLICY comemoracoes_faixas_read ON comemoracoes_faixas
  FOR SELECT USING (true);

-- Faixas: gerente escreve
CREATE POLICY comemoracoes_faixas_admin ON comemoracoes_faixas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM comemoracoes_config cc
      JOIN atribuicoes_rbac ar ON ar.tenant_id = cc.comunidade_id
      WHERE cc.id = comemoracoes_faixas.config_id
        AND ar.user_id = auth.uid()
        AND ar.tenant_type = 'COMUNIDADE'
        AND ar.cargo IN ('MASTER','DONO','GERENTE')
        AND ar.ativo = true
    )
  );

-- Cortesias: solicitante ve proprias
CREATE POLICY comemoracoes_cortesias_own ON comemoracoes_cortesias
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM comemoracoes c
      WHERE c.id = comemoracoes_cortesias.comemoracao_id
        AND c.solicitante_id = auth.uid()
    )
  );

-- Cortesias: gerente ve da comunidade
CREATE POLICY comemoracoes_cortesias_admin ON comemoracoes_cortesias
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM comemoracoes c
      JOIN atribuicoes_rbac ar ON ar.tenant_id = c.comunidade_id
      WHERE c.id = comemoracoes_cortesias.comemoracao_id
        AND ar.user_id = auth.uid()
        AND ar.tenant_type = 'COMUNIDADE'
        AND ar.cargo IN ('MASTER','DONO','GERENTE')
        AND ar.ativo = true
    )
  );
