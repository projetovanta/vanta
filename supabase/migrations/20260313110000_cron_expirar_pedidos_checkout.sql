-- Cron job: expirar pedidos_checkout PENDENTE com mais de 30 minutos
-- Roda a cada 5 minutos

-- Função que expira pedidos antigos
CREATE OR REPLACE FUNCTION expirar_pedidos_checkout_pendentes()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE pedidos_checkout
  SET status = 'EXPIRADO'
  WHERE status = 'PENDENTE'
    AND created_at < now() - interval '30 minutes';
END;
$$;

-- Agendar cron (a cada 5 minutos)
SELECT cron.schedule(
  'expirar-pedidos-checkout-30min',
  '*/5 * * * *',
  $$SELECT expirar_pedidos_checkout_pendentes()$$
);
