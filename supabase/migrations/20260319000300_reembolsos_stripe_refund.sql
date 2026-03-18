-- Fix C4: Adicionar colunas para rastrear refund real no Stripe
-- + C11: Trocar ON DELETE CASCADE por RESTRICT (registro fiscal não pode ser apagado)

-- Colunas de rastreamento do refund
ALTER TABLE reembolsos ADD COLUMN IF NOT EXISTS stripe_refund_id TEXT;
ALTER TABLE reembolsos ADD COLUMN IF NOT EXISTS processado_em TIMESTAMPTZ;
ALTER TABLE reembolsos ADD COLUMN IF NOT EXISTS refund_automatico BOOLEAN DEFAULT false;

-- Fix C11: Trocar CASCADE por RESTRICT em reembolsos (registro fiscal/legal)
ALTER TABLE reembolsos DROP CONSTRAINT IF EXISTS fk_ticket_id;
ALTER TABLE reembolsos ADD CONSTRAINT fk_ticket_id
  FOREIGN KEY (ticket_id) REFERENCES tickets_caixa(id) ON DELETE RESTRICT;

ALTER TABLE reembolsos DROP CONSTRAINT IF EXISTS fk_evento_id;
ALTER TABLE reembolsos ADD CONSTRAINT fk_evento_id
  FOREIGN KEY (evento_id) REFERENCES eventos_admin(id) ON DELETE RESTRICT;
