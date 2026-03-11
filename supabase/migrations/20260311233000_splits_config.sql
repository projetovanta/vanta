-- splits_config — configuração de splits de receita por evento/comunidade
-- Usado pelo Motor de Valor VANTA (Módulo B: Financial Intelligence)

CREATE TABLE splits_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comunidade_id UUID REFERENCES comunidades(id) ON DELETE CASCADE,
  evento_id UUID REFERENCES eventos_admin(id) ON DELETE CASCADE,
  beneficiario_id UUID NOT NULL REFERENCES profiles(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('SOCIO', 'PROMOTER', 'ARTISTA', 'OUTROS')),
  percentual NUMERIC(5,2) NOT NULL CHECK (percentual >= 0 AND percentual <= 100),
  fixo NUMERIC(10,2) DEFAULT 0 CHECK (fixo >= 0),
  descricao TEXT,
  criado_em TIMESTAMPTZ DEFAULT now(),
  criado_por UUID REFERENCES profiles(id),
  CONSTRAINT splits_config_scope CHECK (comunidade_id IS NOT NULL OR evento_id IS NOT NULL)
);

CREATE INDEX idx_splits_config_comunidade ON splits_config(comunidade_id) WHERE comunidade_id IS NOT NULL;
CREATE INDEX idx_splits_config_evento ON splits_config(evento_id) WHERE evento_id IS NOT NULL;
CREATE INDEX idx_splits_config_beneficiario ON splits_config(beneficiario_id);

-- RLS
ALTER TABLE splits_config ENABLE ROW LEVEL SECURITY;

-- Admin (masteradm) pode tudo
CREATE POLICY "splits_config_admin_all" ON splits_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'vanta_masteradm')
  );

-- Membro da equipe pode ver splits do evento
CREATE POLICY "splits_config_select_evento" ON splits_config
  FOR SELECT USING (
    evento_id IS NOT NULL AND has_evento_access(evento_id)
  );

-- Seguidor da comunidade pode ver splits da comunidade
CREATE POLICY "splits_config_select_comunidade" ON splits_config
  FOR SELECT USING (
    comunidade_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM community_follows WHERE comunidade_id = splits_config.comunidade_id AND user_id = auth.uid()
    )
  );
