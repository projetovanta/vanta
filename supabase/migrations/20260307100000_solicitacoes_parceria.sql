-- Tabela de solicitações de parceria (donos de espaço/produtora querem entrar no VANTA)
CREATE TABLE IF NOT EXISTS solicitacoes_parceria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('ESPACO_FIXO', 'PRODUTORA')),
  nome TEXT NOT NULL,
  cidade TEXT NOT NULL,
  categoria TEXT NOT NULL,
  capacidade_media TEXT,
  tempo_mercado TEXT,
  instagram TEXT NOT NULL,
  site TEXT,
  fotos TEXT[] DEFAULT '{}',
  google_maps TEXT,
  intencoes TEXT[] NOT NULL DEFAULT '{}',
  publico_alvo TEXT[] DEFAULT '{}',
  estilos TEXT[] DEFAULT '{}',
  frequencia TEXT,
  media_publico TEXT,
  aceite_termos BOOLEAN NOT NULL DEFAULT false,
  aceite_termos_em TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'APROVADA', 'REJEITADA')),
  motivo_rejeicao TEXT,
  analisado_por UUID REFERENCES profiles(id),
  analisado_em TIMESTAMPTZ,
  comunidade_criada_id UUID REFERENCES comunidades(id),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE solicitacoes_parceria ENABLE ROW LEVEL SECURITY;

-- Usuario pode ver suas proprias solicitacoes
CREATE POLICY "solicitacoes_parceria_select_own"
  ON solicitacoes_parceria FOR SELECT
  USING (auth.uid() = user_id);

-- Usuario pode inserir sua propria solicitacao
CREATE POLICY "solicitacoes_parceria_insert_own"
  ON solicitacoes_parceria FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Master admin pode ver todas
CREATE POLICY "solicitacoes_parceria_select_master"
  ON solicitacoes_parceria FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'vanta_masteradm'
    )
  );

-- Master admin pode atualizar (aprovar/rejeitar)
CREATE POLICY "solicitacoes_parceria_update_master"
  ON solicitacoes_parceria FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'vanta_masteradm'
    )
  );

-- Coluna tipo_comunidade em comunidades
ALTER TABLE comunidades
  ADD COLUMN IF NOT EXISTS tipo_comunidade TEXT DEFAULT 'ESPACO_FIXO'
  CHECK (tipo_comunidade IN ('ESPACO_FIXO', 'PRODUTORA'));

-- Indice para busca rapida de pendentes
CREATE INDEX IF NOT EXISTS idx_solicitacoes_parceria_status
  ON solicitacoes_parceria(status);
