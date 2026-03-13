-- Adicionar CHECKs de status e etapa em solicitacoes_saque (tabela vazia, sem dados para migrar)

ALTER TABLE solicitacoes_saque
  ADD CONSTRAINT solicitacoes_saque_status_check
    CHECK (status = ANY(ARRAY['PENDENTE','CONCLUIDO','ESTORNADO','RECUSADO']));

ALTER TABLE solicitacoes_saque
  ADD CONSTRAINT solicitacoes_saque_etapa_check
    CHECK (etapa IS NULL OR etapa = ANY(ARRAY['SOLICITADO','GERENTE_AUTORIZADO','RECUSADO']));
