-- ══════════════════════════════════════════════════════════════════════════════
-- Tabela: notificacoes_posevento
-- Histórico + rastreamento de notificações automáticas MAIS VANTA
-- Criada por edge functions: notif-evento-iniciou, notif-evento-finalizou, etc.
-- Date: 2026-03-01
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS notificacoes_posevento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES eventos_admin(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('EVENTO_INICIOU', 'EVENTO_TERMINOU', 'INFRACCAO_REGISTRADA', 'CHECKIN_CONFIRMACAO')),
  membro_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'ENVIADA' CHECK (status IN ('ENVIADA', 'FALHA', 'LIDA')),
  canal TEXT NOT NULL DEFAULT 'PUSH' CHECK (canal IN ('PUSH', 'IN_APP', 'EMAIL')),
  corpo_mensagem TEXT,
  link_contexto TEXT,
  enviada_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  lida_em TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notif_posevento_evento ON notificacoes_posevento(evento_id);
CREATE INDEX IF NOT EXISTS idx_notif_posevento_membro ON notificacoes_posevento(membro_id);
CREATE INDEX IF NOT EXISTS idx_notif_posevento_tipo ON notificacoes_posevento(tipo);
CREATE INDEX IF NOT EXISTS idx_notif_posevento_status ON notificacoes_posevento(status);

-- RLS: SELECT público + ALL autenticado (padrão comprovado)
ALTER TABLE notificacoes_posevento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notificacoes_posevento_select" ON notificacoes_posevento FOR SELECT USING (true);
CREATE POLICY "notificacoes_posevento_all" ON notificacoes_posevento FOR ALL USING (auth.uid() IS NOT NULL);
