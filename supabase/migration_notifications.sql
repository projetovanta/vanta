-- ══════════════════════════════════════════════════════════
-- Migration: notifications table + RLS
-- ══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS notifications (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID          NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  titulo      TEXT          NOT NULL DEFAULT '',
  mensagem    TEXT          NOT NULL DEFAULT '',
  tipo        TEXT          NOT NULL DEFAULT 'SISTEMA',
  lida        BOOLEAN       NOT NULL DEFAULT false,
  link        TEXT          NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_lida ON notifications(user_id, lida);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Leitura: somente as próprias notificações
DROP POLICY IF EXISTS "notifications: leitura própria" ON notifications;
CREATE POLICY "notifications: leitura própria"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Inserção: qualquer usuário autenticado pode criar notificação
-- (serviços internos criam notificações para outros usuários via service_role,
--  mas no frontend o INSERT é para o próprio user ou via trigger)
DROP POLICY IF EXISTS "notifications: inserção autenticado" ON notifications;
CREATE POLICY "notifications: inserção autenticado"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Atualização: somente das próprias (marcar como lida)
DROP POLICY IF EXISTS "notifications: atualização própria" ON notifications;
CREATE POLICY "notifications: atualização própria"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Deleção: somente das próprias
DROP POLICY IF EXISTS "notifications: deleção própria" ON notifications;
CREATE POLICY "notifications: deleção própria"
  ON notifications FOR DELETE
  USING (user_id = auth.uid());

-- Realtime
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
