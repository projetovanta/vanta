-- ============================================================
-- Fluxo de Rejeição com Campos Específicos + Status EM_REVISAO
-- ============================================================

-- Novas colunas em eventos_admin
ALTER TABLE eventos_admin
  ADD COLUMN IF NOT EXISTS rejeicao_campos JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS rodada_rejeicao SMALLINT DEFAULT 0;

-- rejeicao_campos formato:
-- {
--   "nome": "Trocar para nome mais descritivo",
--   "data_inicio": "Data conflita com outro evento",
--   "valor_lote_1": "Valor muito alto para 1o lote"
-- }
-- Chave = campo apontado, Valor = comentário do master (pode ser string vazia)

COMMENT ON COLUMN eventos_admin.rejeicao_campos IS 'JSONB: campos apontados pelo master na rejeição. Chave=campo, Valor=comentário';
COMMENT ON COLUMN eventos_admin.rodada_rejeicao IS 'Contador de rodadas de rejeição (máx 3). 0=nunca rejeitado';
