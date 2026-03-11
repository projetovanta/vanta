-- Avaliação do produtor sobre o resultado MAIS VANTA no evento
ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS mv_avaliacao TEXT
  CHECK (mv_avaliacao IS NULL OR mv_avaliacao IN ('eficiente', 'ineficiente'));
