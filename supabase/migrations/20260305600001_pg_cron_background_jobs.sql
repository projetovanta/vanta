-- Background jobs via pg_cron
-- NOTA: pg_cron deve estar habilitado no Supabase Dashboard > Extensions

-- 1. Cleanup de tickets expirados (roda todo dia às 3h BRT)
-- Marca tickets DISPONIVEL como EXPIRADO se evento já terminou há 24h+
SELECT cron.schedule(
  'cleanup-expired-tickets',
  '0 6 * * *',  -- 06:00 UTC = 03:00 BRT
  $$
  UPDATE tickets_caixa
  SET status = 'EXPIRADO'
  WHERE status = 'DISPONIVEL'
    AND evento_id IN (
      SELECT id FROM eventos_admin
      WHERE data_fim < NOW() - INTERVAL '24 hours'
    );
  $$
);

-- 2. Finalizar eventos passados (roda todo dia às 4h BRT)
-- Marca eventos como finalizado=true se data_fim já passou
SELECT cron.schedule(
  'finalize-past-events',
  '0 7 * * *',  -- 07:00 UTC = 04:00 BRT
  $$
  UPDATE eventos_admin
  SET finalizado = true
  WHERE finalizado = false
    AND publicado = true
    AND data_fim < NOW() - INTERVAL '2 hours';
  $$
);

-- 3. Limpar notificações antigas (roda toda semana, domingo 5h BRT)
-- Remove notificações lidas há mais de 30 dias
SELECT cron.schedule(
  'cleanup-old-notifications',
  '0 8 * * 0',  -- 08:00 UTC domingo = 05:00 BRT
  $$
  DELETE FROM notificacoes
  WHERE lida = true
    AND criado_em < NOW() - INTERVAL '30 days';
  $$
);
