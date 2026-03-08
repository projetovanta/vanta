-- Adiciona forma_pagamento ao convidados_lista
-- Registra como o convidado pagou na entrada (regras com valor > 0)
ALTER TABLE convidados_lista
  ADD COLUMN IF NOT EXISTS forma_pagamento TEXT DEFAULT NULL
  CHECK (forma_pagamento IS NULL OR forma_pagamento IN ('DINHEIRO', 'CARTAO', 'PIX'));

COMMENT ON COLUMN convidados_lista.forma_pagamento IS 'Como pagou na entrada: DINHEIRO, CARTAO, PIX. NULL = regra gratuita ou não informado.';
