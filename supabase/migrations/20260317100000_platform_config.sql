-- Configurações da plataforma editáveis pelo master
CREATE TABLE IF NOT EXISTS platform_config (
  key text PRIMARY KEY,
  value text NOT NULL,
  label text,
  descricao text,
  tipo text DEFAULT 'number', -- number, percent, text, boolean
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES profiles(id)
);

-- RLS: só master lê e escreve
ALTER TABLE platform_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "master_read_platform_config" ON platform_config
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'vanta_masteradm')
  );

CREATE POLICY "master_write_platform_config" ON platform_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'vanta_masteradm')
  );

-- Seed com valores atuais
INSERT INTO platform_config (key, value, label, descricao, tipo) VALUES
  ('vanta_fee_percent', '0.05', 'Taxa VANTA (%)', 'Percentual cobrado sobre ingressos vendidos pelo app', 'percent'),
  ('gateway_credito_percent', '0.035', 'Taxa Gateway Crédito (%)', 'Percentual do gateway para cartão de crédito', 'percent'),
  ('gateway_credito_fixo', '0.39', 'Taxa Gateway Crédito (fixo)', 'Valor fixo por transação de crédito (R$)', 'number'),
  ('gateway_pix_percent', '0.01', 'Taxa Gateway PIX (%)', 'Percentual do gateway para pagamento via PIX', 'percent')
ON CONFLICT (key) DO NOTHING;
