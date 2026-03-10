-- pedidos_checkout — registra pedidos pendentes de pagamento Stripe
-- Usado pelo fluxo: create-ticket-checkout → Stripe → webhook → processar_compra_checkout

CREATE TABLE pedidos_checkout (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  evento_id UUID NOT NULL,
  lote_id UUID NOT NULL,
  dados_compra JSONB NOT NULL,        -- { itens: [{ variacao_id, quantidade, valor_unit }], cupom_id?, mesa_id?, acompanhantes?, ref_code? }
  valor_total_centavos INTEGER NOT NULL,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMPTZ DEFAULT now(),
  paid_at TIMESTAMPTZ,
  CONSTRAINT pedidos_checkout_status_check CHECK (status IN ('pendente', 'pago', 'cancelado', 'expirado'))
);

-- Índices
CREATE INDEX idx_pedidos_checkout_user ON pedidos_checkout(user_id);
CREATE INDEX idx_pedidos_checkout_evento ON pedidos_checkout(evento_id);
CREATE INDEX idx_pedidos_checkout_stripe ON pedidos_checkout(stripe_session_id) WHERE stripe_session_id IS NOT NULL;
CREATE INDEX idx_pedidos_checkout_status ON pedidos_checkout(status) WHERE status = 'pendente';

-- RLS
ALTER TABLE pedidos_checkout ENABLE ROW LEVEL SECURITY;

-- User pode ver seus próprios pedidos (polling da tela de sucesso)
CREATE POLICY "pedidos_checkout_select_own" ON pedidos_checkout
  FOR SELECT USING (auth.uid() = user_id);

-- Insert via service role (edge function) — não via client direto
-- Update via service role (webhook)
-- Admin pode ver tudo
CREATE POLICY "pedidos_checkout_admin_all" ON pedidos_checkout
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'vanta_masteradm')
  );
