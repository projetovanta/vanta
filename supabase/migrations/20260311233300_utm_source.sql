-- Adiciona coluna utm_source em tickets_caixa
-- Usado pelo Motor de Valor VANTA (Módulo C: Atribuição de Canal)
-- Capturado no checkout via query param ?utm=X

ALTER TABLE tickets_caixa ADD COLUMN IF NOT EXISTS utm_source TEXT DEFAULT 'ORGANICO';

COMMENT ON COLUMN tickets_caixa.utm_source IS 'Fonte de aquisição: INSTAGRAM, FLYER_QR, PROMOTER, ORGANICO, WHATSAPP, LINK_DIRETO';

CREATE INDEX idx_tickets_caixa_utm ON tickets_caixa(utm_source) WHERE utm_source IS NOT NULL AND utm_source != 'ORGANICO';
