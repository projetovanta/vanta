-- Coluna: venda_vanta em eventos_admin
-- Indica se o evento tem venda de ingressos pelo VANTA (true) ou venda externa (false)
-- Default true = compatibilidade com todos os eventos existentes

ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS venda_vanta BOOLEAN DEFAULT true;

-- Campos para eventos SEM VENDA (link afiliado)
ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS link_externo TEXT;
ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS plataforma_externa TEXT;
ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS comissao_vanta NUMERIC(5,2);
ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS codigo_afiliado TEXT;
ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS proposta_status TEXT DEFAULT NULL;
-- proposta_status: NULL (sem proposta), ENVIADA, ACEITA, RECUSADA, NEGOCIANDO
ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS proposta_rodada INT DEFAULT 0;
ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS proposta_mensagem TEXT;
