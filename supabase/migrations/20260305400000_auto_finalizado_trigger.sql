-- Trigger: auto-finalizar eventos quando data_fim já passou
-- Executada via pg_cron a cada 15 minutos OU via trigger em UPDATE

-- Função que finaliza eventos cuja data_fim já passou
CREATE OR REPLACE FUNCTION finalizar_eventos_expirados()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE eventos_admin
  SET status_evento = 'FINALIZADO',
      updated_at = NOW()
  WHERE status_evento IN ('ATIVO', 'EM_ANDAMENTO')
    AND data_fim IS NOT NULL
    AND (data_fim || 'T' || COALESCE(hora_fim, '23:59') || ':00-03:00')::timestamptz < NOW();
END;
$$;

-- Extensão pg_cron (já habilitada no Supabase por default)
-- Agendar execução a cada 15 minutos
SELECT cron.schedule(
  'finalizar-eventos-expirados',
  '*/15 * * * *',
  $$SELECT finalizar_eventos_expirados()$$
);
