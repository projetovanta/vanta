-- Verificação de Instagram no MAIS VANTA
-- Adiciona campos para rastrear se o perfil foi verificado (existência + propriedade via código na bio)

ALTER TABLE solicitacoes_clube
  ADD COLUMN IF NOT EXISTS instagram_verificado BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS instagram_verificado_em TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS codigo_verificacao TEXT;

ALTER TABLE membros_clube
  ADD COLUMN IF NOT EXISTS instagram_verificado BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS instagram_verificado_em TIMESTAMPTZ;
