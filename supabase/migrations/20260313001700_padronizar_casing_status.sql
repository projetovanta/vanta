-- Padronizar status de 3 tabelas: minúsculas → MAIÚSCULAS
-- Tabelas vazias em produção, sem risco de perda de dados.

-- ══════════════════════════════════════════════════════════
-- 1. convites_clube: disponivel/usado/expirado → DISPONIVEL/USADO/EXPIRADO
-- ══════════════════════════════════════════════════════════
UPDATE convites_clube SET status = UPPER(status) WHERE status <> UPPER(status);

ALTER TABLE convites_clube DROP CONSTRAINT IF EXISTS convites_clube_status_check;
ALTER TABLE convites_clube ADD CONSTRAINT convites_clube_status_check
  CHECK (status IN ('DISPONIVEL', 'USADO', 'EXPIRADO'));

-- ══════════════════════════════════════════════════════════
-- 2. pedidos_checkout: pendente/pago/cancelado/expirado → PENDENTE/PAGO/CANCELADO/EXPIRADO
-- ══════════════════════════════════════════════════════════
UPDATE pedidos_checkout SET status = UPPER(status) WHERE status <> UPPER(status);

ALTER TABLE pedidos_checkout DROP CONSTRAINT IF EXISTS pedidos_checkout_status_check;
ALTER TABLE pedidos_checkout ADD CONSTRAINT pedidos_checkout_status_check
  CHECK (status IN ('PENDENTE', 'PAGO', 'CANCELADO', 'EXPIRADO'));

-- Recriar índice parcial com casing correto
DROP INDEX IF EXISTS idx_pedidos_checkout_status;
CREATE INDEX idx_pedidos_checkout_status ON pedidos_checkout(status) WHERE status = 'PENDENTE';

-- Atualizar DEFAULT
ALTER TABLE pedidos_checkout ALTER COLUMN status SET DEFAULT 'PENDENTE';

-- ══════════════════════════════════════════════════════════
-- 3. produtor_plano: ativo/cancelado/expirado → ATIVO/CANCELADO/EXPIRADO
-- ══════════════════════════════════════════════════════════
UPDATE produtor_plano SET status = UPPER(status) WHERE status <> UPPER(status);

ALTER TABLE produtor_plano DROP CONSTRAINT IF EXISTS produtor_plano_status_check;
ALTER TABLE produtor_plano ADD CONSTRAINT produtor_plano_status_check
  CHECK (status IN ('ATIVO', 'CANCELADO', 'EXPIRADO'));
