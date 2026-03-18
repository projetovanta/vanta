-- Fix C2: Adicionar status FALHA_PROCESSAMENTO em pedidos_checkout
-- Permite identificar pedidos pagos cujos ingressos não foram gerados

ALTER TABLE pedidos_checkout DROP CONSTRAINT IF EXISTS pedidos_checkout_status_check;
ALTER TABLE pedidos_checkout ADD CONSTRAINT pedidos_checkout_status_check
  CHECK (status IN ('PENDENTE', 'PAGO', 'CANCELADO', 'EXPIRADO', 'FALHA_PROCESSAMENTO'));
