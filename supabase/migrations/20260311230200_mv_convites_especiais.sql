-- Convites especiais do Vanta para membros em eventos específicos
CREATE TABLE IF NOT EXISTS mv_convites_especiais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES eventos_admin(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  beneficio_id UUID REFERENCES mais_vanta_config_evento(id),
  enviado_por UUID NOT NULL REFERENCES profiles(id),
  mensagem TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'ENVIADO' CHECK (status IN ('ENVIADO', 'VISTO', 'RESGATADO', 'IGNORADO')),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(evento_id, user_id)
);

ALTER TABLE mv_convites_especiais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_mv_conv_esp" ON mv_convites_especiais
  FOR ALL USING (
    EXISTS (SELECT 1 FROM atribuicoes_rbac WHERE user_id = auth.uid() AND cargo IN ('masteradm','gerente'))
  );

CREATE POLICY "membro_own_mv_conv_esp" ON mv_convites_especiais
  FOR SELECT USING (user_id = auth.uid());
