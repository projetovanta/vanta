-- ══════════════════════════════════════════════════════════════════════════════
-- MV3 — Meta/Instagram API (campo meta_user_id para Graph API futura)
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE membros_clube ADD COLUMN IF NOT EXISTS meta_user_id TEXT;
-- meta_user_id = Instagram Business Account ID (Graph API)
-- Será preenchido quando OAuth com Meta for implementado
