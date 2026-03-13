-- Fix: data_fim já é TIMESTAMPTZ, não concatenar timezone string
-- Causa: cron job falhando a cada 15min com "invalid input syntax for type timestamp"
CREATE OR REPLACE FUNCTION finalizar_eventos_expirados()
RETURNS void AS $$
BEGIN
  UPDATE eventos_admin
  SET status_evento = 'FINALIZADO',
      updated_at = NOW()
  WHERE status_evento IN ('ATIVO', 'EM_ANDAMENTO')
    AND data_fim IS NOT NULL
    AND data_fim < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
