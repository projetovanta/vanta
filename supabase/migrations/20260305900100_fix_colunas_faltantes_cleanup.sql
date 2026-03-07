-- ══════════════════════════════════════════════════════════════════════════════
-- FIX: Colunas faltantes + cleanup de tabelas órfãs
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. eventos_admin — adicionar mesas_ativo e planta_mesas
ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS mesas_ativo BOOLEAN DEFAULT false;
ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS planta_mesas TEXT;

-- 2. profiles — adicionar excluido e excluido_em (soft delete)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS excluido BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS excluido_em TIMESTAMPTZ;

-- 3. Cleanup: dropar tabelas órfãs vazias sem uso no código
--    guestlist_entries depende de guestlists (FK), dropar primeiro
DROP TABLE IF EXISTS guestlist_entries;
DROP TABLE IF EXISTS guestlists;
DROP TABLE IF EXISTS reembolsos_contagem;
