-- Adicionar email de contato e telefone com DDD na solicitacao de parceria
ALTER TABLE solicitacoes_parceria
  ADD COLUMN IF NOT EXISTS email_contato TEXT,
  ADD COLUMN IF NOT EXISTS telefone TEXT;

COMMENT ON COLUMN solicitacoes_parceria.email_contato IS 'Email de contato comercial';
COMMENT ON COLUMN solicitacoes_parceria.telefone IS 'Telefone com DDD (ex: 11999991234)';
