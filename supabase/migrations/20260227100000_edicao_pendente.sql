-- 9p: Colunas para aprovação de edição em eventos publicados
ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS edicao_pendente JSONB DEFAULT NULL;
ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS edicao_status TEXT DEFAULT NULL;
ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS edicao_motivo TEXT DEFAULT NULL;
