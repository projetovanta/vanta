-- Push Templates + Agendamento
-- Master pode salvar modelos reutilizáveis e agendar envios futuros

-- 1. Templates de push
CREATE TABLE IF NOT EXISTS push_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  canais TEXT[] NOT NULL DEFAULT '{IN_APP}',
  tipo_acao TEXT DEFAULT 'AVISO',
  acao_valor TEXT DEFAULT '',
  criado_por UUID REFERENCES profiles(id) NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE push_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY push_templates_master_all ON push_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'vanta_masteradm'
    )
  );

-- 2. Campanhas agendadas
CREATE TABLE IF NOT EXISTS push_agendados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  canais TEXT[] NOT NULL DEFAULT '{IN_APP}',
  segmento_tipo TEXT NOT NULL DEFAULT 'TODOS',
  segmento_valor TEXT DEFAULT '',
  tipo_acao TEXT DEFAULT 'AVISO',
  acao_valor TEXT DEFAULT '',
  link_notif TEXT DEFAULT '',
  agendar_para TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'ENVIADO', 'CANCELADO', 'ERRO')),
  resultado JSONB,
  criado_por UUID REFERENCES profiles(id) NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  enviado_em TIMESTAMPTZ
);

ALTER TABLE push_agendados ENABLE ROW LEVEL SECURITY;

CREATE POLICY push_agendados_master_all ON push_agendados
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'vanta_masteradm'
    )
  );

CREATE INDEX idx_push_agendados_status ON push_agendados(status) WHERE status = 'PENDENTE';
CREATE INDEX idx_push_agendados_agendar ON push_agendados(agendar_para) WHERE status = 'PENDENTE';
