-- Cleanup: overloads, função quebrada, cron com status inválido, service_role hardcoded

-- 1. Fix is_event_manager_or_admin: referenciava is_vanta_admin() (dropada)
CREATE OR REPLACE FUNCTION is_event_manager_or_admin(p_evento_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    is_masteradm()
    OR EXISTS (
      SELECT 1 FROM eventos_admin WHERE id = p_evento_id AND created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM equipe_evento
      WHERE evento_id = p_evento_id
        AND membro_id = auth.uid()
        AND papel IN ('GERENTE', 'SOCIO')
    );
$$;

-- 2. Dropar overload antigo: queimar_ingresso(text, uuid, uuid) — frontend usa (uuid, uuid)
DROP FUNCTION IF EXISTS queimar_ingresso(TEXT, UUID, UUID);

-- 3. Dropar overload antigo: gerar_ocorrencias_recorrente(uuid) — frontend usa (uuid, boolean, boolean, boolean)
DROP FUNCTION IF EXISTS gerar_ocorrencias_recorrente(UUID);

-- 4. Remover cron cleanup-expired-tickets (conceito errado: ingresso não deve ser cancelado automaticamente.
--    O app já mostra como "expirado" visualmente quando o evento passou. Status no banco só muda por ação humana.)
SELECT cron.unschedule('cleanup-expired-tickets');

-- 5. Fix cron update-instagram-followers: remover service_role hardcoded
SELECT cron.unschedule('update-instagram-followers-monthly');
SELECT cron.schedule(
  'update-instagram-followers-monthly',
  '0 3 1 * *',
  $$
  SELECT net.http_post(
    url := 'https://daldttuibmxwkpbqtebm.supabase.co/functions/v1/update-instagram-followers',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := '{}'::jsonb
  );
  $$
);

-- 6. Fix cron notif-pedir-review: também tinha service_role hardcoded
SELECT cron.unschedule('notif-pedir-review-daily');
SELECT cron.schedule(
  'notif-pedir-review-daily',
  '0 17 * * *',
  $$
  SELECT net.http_post(
    url := 'https://daldttuibmxwkpbqtebm.supabase.co/functions/v1/notif-pedir-review',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := '{}'::jsonb
  );
  $$
);
