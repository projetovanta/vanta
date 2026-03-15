-- Adiciona campo frequencia na solicitação do MAIS VANTA (curadoria)
ALTER TABLE solicitacoes_clube ADD COLUMN IF NOT EXISTS frequencia TEXT;

COMMENT ON COLUMN solicitacoes_clube.frequencia IS 'Frequência que sai: raramente, frequentemente, toda_semana, quase_toda_noite';
