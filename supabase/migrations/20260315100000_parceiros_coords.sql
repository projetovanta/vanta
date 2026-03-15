-- Adiciona coordenadas (lat/lng) na tabela parceiros_mais_vanta
-- Necessário pra mostrar pins de parceiros no Radar (mapa)

ALTER TABLE parceiros_mais_vanta ADD COLUMN IF NOT EXISTS coords JSONB DEFAULT NULL;

COMMENT ON COLUMN parceiros_mais_vanta.coords IS 'Coordenadas {lat, lng} do parceiro. Preenchido manualmente no admin ou via geocoding do endereço.';
