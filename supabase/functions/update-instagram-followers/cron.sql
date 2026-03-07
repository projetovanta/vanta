-- Instrução para configurar pg_cron no Dashboard do Supabase
--
-- Ir em: Dashboard Supabase → Database → Extensions → Habilitar pg_cron e pg_net
-- Depois executar este SQL no SQL Editor:
--
-- O cron roda a cada 30 dias (dia 1 de cada mês às 03:00 UTC)
-- Chama a edge function update-instagram-followers via pg_net

-- Executar no SQL Editor do Dashboard Supabase
-- Pré-requisito: Extensions pg_cron e pg_net habilitadas

SELECT cron.schedule(
  'update-instagram-followers-monthly',
  '0 3 1 * *',  -- dia 1 de cada mês, 03:00 UTC
  $$
  SELECT net.http_post(
    url := 'https://daldttuibmxwkpbqtebm.supabase.co/functions/v1/update-instagram-followers',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('supabase.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
