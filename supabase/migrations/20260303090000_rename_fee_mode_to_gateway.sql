-- Renomear vanta_fee_mode → gateway_fee_mode
-- Modelo Ingresse: taxa serviço VANTA sempre do cliente, gateway ABSORVER/REPASSAR

-- Comunidades
ALTER TABLE comunidades RENAME COLUMN vanta_fee_mode TO gateway_fee_mode;

-- Eventos
ALTER TABLE eventos_admin RENAME COLUMN vanta_fee_mode TO gateway_fee_mode;
