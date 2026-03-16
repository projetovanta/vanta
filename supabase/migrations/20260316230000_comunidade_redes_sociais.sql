-- Redes sociais da comunidade
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS instagram text;
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS whatsapp text;
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS tiktok text;
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS site text;
