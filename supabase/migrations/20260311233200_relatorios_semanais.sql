-- relatorios_semanais — histórico de relatórios semanais gerados
-- Usado pelo Motor de Valor VANTA (Módulo D: Value Communication)

CREATE TABLE relatorios_semanais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comunidade_id UUID NOT NULL REFERENCES comunidades(id) ON DELETE CASCADE,
  semana_inicio DATE NOT NULL,
  semana_fim DATE NOT NULL,
  dados JSONB NOT NULL,
  enviado_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT now(),
  UNIQUE(comunidade_id, semana_inicio)
);

CREATE INDEX idx_relatorios_semanais_comunidade ON relatorios_semanais(comunidade_id);
CREATE INDEX idx_relatorios_semanais_semana ON relatorios_semanais(semana_inicio DESC);

-- RLS
ALTER TABLE relatorios_semanais ENABLE ROW LEVEL SECURITY;

-- Admin pode tudo
CREATE POLICY "relatorios_semanais_admin_all" ON relatorios_semanais
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'vanta_masteradm')
  );

-- Gerente/sócio pode ver relatórios da sua comunidade
CREATE POLICY "relatorios_semanais_select_member" ON relatorios_semanais
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM community_follows
      WHERE comunidade_id = relatorios_semanais.comunidade_id
        AND user_id = auth.uid()
    )
  );
