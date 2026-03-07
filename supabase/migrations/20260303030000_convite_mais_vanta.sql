-- Convite MAIS VANTA: master pode convidar membro diretamente
-- Tier pré-atribuído pelo master no momento do convite
ALTER TABLE solicitacoes_clube
  ADD COLUMN IF NOT EXISTS tier_pre_atribuido TEXT;
