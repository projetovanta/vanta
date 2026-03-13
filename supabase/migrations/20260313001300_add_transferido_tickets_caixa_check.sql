-- Adicionar TRANSFERIDO e EXPIRADO ao CHECK de tickets_caixa
-- TRANSFERIDO: sem isso, toda transferência de ingresso falhava silenciosamente
-- EXPIRADO: quando o evento é finalizado, ingressos DISPONIVEL viram EXPIRADO automaticamente
ALTER TABLE tickets_caixa DROP CONSTRAINT tickets_caixa_status_check;
ALTER TABLE tickets_caixa ADD CONSTRAINT tickets_caixa_status_check
  CHECK (status = ANY (ARRAY['DISPONIVEL', 'USADO', 'CANCELADO', 'REEMBOLSADO', 'TRANSFERIDO', 'EXPIRADO']));

-- Atualizar finalizar_eventos_expirados para marcar ingressos não usados como EXPIRADO
CREATE OR REPLACE FUNCTION finalizar_eventos_expirados()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_evento_ids UUID[];
BEGIN
  SELECT array_agg(id) INTO v_evento_ids
  FROM eventos_admin
  WHERE status_evento IN ('ATIVO', 'EM_ANDAMENTO')
    AND data_fim IS NOT NULL
    AND data_fim < NOW();

  IF v_evento_ids IS NULL OR array_length(v_evento_ids, 1) IS NULL THEN
    RETURN;
  END IF;

  UPDATE eventos_admin
  SET status_evento = 'FINALIZADO', updated_at = NOW()
  WHERE id = ANY(v_evento_ids);

  UPDATE tickets_caixa
  SET status = 'EXPIRADO'
  WHERE evento_id = ANY(v_evento_ids)
    AND status = 'DISPONIVEL';
END;
$$;
