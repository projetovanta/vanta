-- Adicionar last_used_at para rastrear uso de tokens FCM
ALTER TABLE push_subscriptions
  ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ DEFAULT now();

-- Atualizar last_used_at no upsert (quando saveSubscription é chamado)
CREATE OR REPLACE FUNCTION update_push_sub_last_used()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_used_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_push_sub_last_used ON push_subscriptions;
CREATE TRIGGER trg_push_sub_last_used
  BEFORE INSERT OR UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_push_sub_last_used();

-- pg_cron: limpar tokens sem uso há 90+ dias (roda diariamente às 03:00 UTC)
SELECT cron.schedule(
  'cleanup-dead-push-tokens',
  '0 3 * * *',
  $$DELETE FROM push_subscriptions WHERE last_used_at < now() - INTERVAL '90 days'$$
);
