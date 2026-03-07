-- ══════════════════════════════════════════════════════════
-- Migration: pix_tipo e pix_chave em profiles
-- Persistir dados PIX do produtor/sócio para saques
-- ══════════════════════════════════════════════════════════

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pix_tipo  TEXT DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pix_chave TEXT DEFAULT NULL;
