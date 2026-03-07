-- Cron job: expirar negociações vencidas (a cada hora)
SELECT cron.schedule(
  'expirar-negociacoes-vencidas',
  '0 * * * *',  -- a cada hora cheia
  $$
  SELECT expirar_negociacoes_vencidas();
  $$
);
