-- ══════════════════════════════════════════════════════════════════════════════
-- Chat Settings — arquivar e silenciar conversas
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS chat_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  archived BOOLEAN NOT NULL DEFAULT false,
  muted BOOLEAN NOT NULL DEFAULT false,
  keep_archived BOOLEAN NOT NULL DEFAULT false,
  archived_at TIMESTAMPTZ,
  UNIQUE(user_id, partner_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_settings_user ON chat_settings(user_id);

ALTER TABLE chat_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_settings_own"
  ON chat_settings FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
