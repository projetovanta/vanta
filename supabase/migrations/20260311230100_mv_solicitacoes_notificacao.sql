-- Solicitações de notificação do produtor para membros MV
CREATE TABLE IF NOT EXISTS mv_solicitacoes_notificacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES eventos_admin(id) ON DELETE CASCADE,
  produtor_id UUID NOT NULL REFERENCES profiles(id),
  mensagem TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'APROVADA', 'REJEITADA', 'ENVIADA')),
  membros_notificados INT DEFAULT 0,
  resolvido_por UUID REFERENCES profiles(id),
  resolvido_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE mv_solicitacoes_notificacao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_mv_sol_notif" ON mv_solicitacoes_notificacao
  FOR ALL USING (
    EXISTS (SELECT 1 FROM atribuicoes_rbac WHERE user_id = auth.uid() AND cargo IN ('masteradm','gerente'))
  );

CREATE POLICY "produtor_own_mv_sol_notif" ON mv_solicitacoes_notificacao
  FOR SELECT USING (produtor_id = auth.uid());

CREATE POLICY "produtor_insert_mv_sol_notif" ON mv_solicitacoes_notificacao
  FOR INSERT WITH CHECK (produtor_id = auth.uid());
