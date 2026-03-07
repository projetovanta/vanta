-- 1. Coluna motivo_rejeicao (faltava no DDL)
ALTER TABLE eventos_admin
  ADD COLUMN IF NOT EXISTS motivo_rejeicao TEXT DEFAULT NULL;

-- 2. Policy INSERT para produtor (created_by = auth.uid())
DROP POLICY IF EXISTS "eventos_admin: produtor insere" ON eventos_admin;
CREATE POLICY "eventos_admin: produtor insere"
  ON eventos_admin FOR INSERT
  WITH CHECK (created_by = auth.uid());
