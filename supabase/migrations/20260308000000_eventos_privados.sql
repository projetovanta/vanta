-- Feature: Evento Privado / Corporativo
-- Solicitação de uso do espaço para eventos particulares

-- Config na comunidade: habilitar evento privado + texto apresentação + fotos + opções
ALTER TABLE comunidades
  ADD COLUMN IF NOT EXISTS evento_privado_ativo BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS evento_privado_texto TEXT,
  ADD COLUMN IF NOT EXISTS evento_privado_fotos JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS evento_privado_formatos JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS evento_privado_atracoes JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS evento_privado_faixas_capacidade JSONB DEFAULT '[]'::jsonb;

-- Tabela de solicitações
CREATE TABLE IF NOT EXISTS eventos_privados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comunidade_id UUID NOT NULL REFERENCES comunidades(id) ON DELETE CASCADE,
  solicitante_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'ENVIADA' CHECK (status IN ('ENVIADA','VISUALIZADA','EM_ANALISE','APROVADA','RECUSADA','CONVERTIDA')),
  -- Dados do formulário
  nome_completo TEXT NOT NULL,
  empresa TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT NOT NULL,
  instagram TEXT NOT NULL,
  data_evento TEXT,
  data_estimativa TEXT,
  faixa_capacidade TEXT NOT NULL,
  horario TEXT NOT NULL CHECK (horario IN ('DIURNO','NOTURNO','DIA_INTEIRO')),
  formatos JSONB NOT NULL DEFAULT '[]'::jsonb,
  atracoes JSONB NOT NULL DEFAULT '[]'::jsonb,
  descricao TEXT NOT NULL,
  -- Gestão
  evento_id UUID REFERENCES eventos_admin(id),
  avaliado_por UUID REFERENCES profiles(id),
  avaliado_em TIMESTAMPTZ,
  motivo_recusa TEXT,
  mensagem_gerente TEXT,
  visualizado_em TIMESTAMPTZ,
  em_analise_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger updated_at
CREATE TRIGGER set_updated_at_eventos_privados
  BEFORE UPDATE ON eventos_privados
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Index
CREATE INDEX IF NOT EXISTS idx_eventos_privados_comunidade ON eventos_privados(comunidade_id);
CREATE INDEX IF NOT EXISTS idx_eventos_privados_solicitante ON eventos_privados(solicitante_id);
CREATE INDEX IF NOT EXISTS idx_eventos_privados_status ON eventos_privados(status);

-- RLS
ALTER TABLE eventos_privados ENABLE ROW LEVEL SECURITY;

-- Solicitante vê as próprias solicitações
CREATE POLICY eventos_privados_own ON eventos_privados
  FOR SELECT USING (solicitante_id = auth.uid());

-- Solicitante pode criar
CREATE POLICY eventos_privados_insert ON eventos_privados
  FOR INSERT WITH CHECK (solicitante_id = auth.uid());

-- Gerente/master vê solicitações da comunidade
CREATE POLICY eventos_privados_admin_select ON eventos_privados
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM atribuicoes_rbac ar
      WHERE ar.user_id = auth.uid()
        AND ar.tenant_type = 'COMUNIDADE'
        AND ar.tenant_id = eventos_privados.comunidade_id
        AND ar.cargo IN ('MASTER','DONO','GERENTE')
        AND ar.ativo = true
    )
  );

-- Gerente/master pode atualizar (aprovar/recusar)
CREATE POLICY eventos_privados_admin_update ON eventos_privados
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM atribuicoes_rbac ar
      WHERE ar.user_id = auth.uid()
        AND ar.tenant_type = 'COMUNIDADE'
        AND ar.tenant_id = eventos_privados.comunidade_id
        AND ar.cargo IN ('MASTER','DONO','GERENTE')
        AND ar.ativo = true
    )
  );
