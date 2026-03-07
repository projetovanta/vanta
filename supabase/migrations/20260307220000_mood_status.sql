-- Mood/Status no perfil do usuario
-- Emoji + texto curto, expira em 24h

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mood_emoji TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mood_text TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mood_expires_at TIMESTAMPTZ;
