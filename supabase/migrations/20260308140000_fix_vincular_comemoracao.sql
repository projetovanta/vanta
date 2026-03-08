-- Fix: vincular_comemoracao_evento usava NEW.data_real (coluna inexistente)
-- Corrigido para NEW.data_inicio com cast para text (data_comemoracao é text)
CREATE OR REPLACE FUNCTION vincular_comemoracao_evento()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE comemoracoes
  SET evento_id = NEW.id
  WHERE comunidade_id = NEW.comunidade_id
    AND evento_id IS NULL
    AND data_comemoracao = to_char(NEW.data_inicio AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM-DD')
    AND status IN ('ENVIADA', 'VISUALIZADA', 'EM_ANALISE', 'APROVADA');

  RETURN NEW;
END;
$$;
