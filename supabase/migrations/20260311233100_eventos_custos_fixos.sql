-- Adiciona coluna custos_fixos em eventos_admin
-- Usado pelo Motor de Valor VANTA (Módulo B: Break-Even Projection)
-- Valor opcional — quando NULL, break-even calcula apenas com taxas

ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS custos_fixos NUMERIC(10,2) DEFAULT 0;

COMMENT ON COLUMN eventos_admin.custos_fixos IS 'Custos fixos do evento (locação, segurança, etc). Usado no cálculo de break-even.';
