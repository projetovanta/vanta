-- Campo texto livre "quem te indicou" na solicitação de entrada ao MAIS VANTA
ALTER TABLE solicitacoes_clube ADD COLUMN IF NOT EXISTS indicado_por_texto text;
