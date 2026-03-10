-- Adicionar status ADIADO para solicitações do MAIS VANTA
ALTER TABLE solicitacoes_clube DROP CONSTRAINT IF EXISTS solicitacoes_clube_status_check;
ALTER TABLE solicitacoes_clube ADD CONSTRAINT solicitacoes_clube_status_check
  CHECK (status IN ('PENDENTE','APROVADO','REJEITADO','CONVIDADO','ADIADO'));
