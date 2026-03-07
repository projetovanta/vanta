-- Adicionar campos para notificações automáticas pós-evento MAIS VANTA
-- post_deadline_em: T+24h quando infração será registrada
-- post_aviso_24h_enviado: flag para não reenviar lembrete
-- infraction_registered_em: timestamp quando infração foi registrada

ALTER TABLE reservas_mais_vanta ADD COLUMN IF NOT EXISTS post_deadline_em TIMESTAMPTZ;
ALTER TABLE reservas_mais_vanta ADD COLUMN IF NOT EXISTS post_aviso_24h_enviado BOOLEAN DEFAULT false;
ALTER TABLE reservas_mais_vanta ADD COLUMN IF NOT EXISTS infraction_registered_em TIMESTAMPTZ;

-- Índices para queries de cron jobs
CREATE INDEX IF NOT EXISTS idx_reservas_post_deadline ON reservas_mais_vanta(post_deadline_em) WHERE post_deadline_em IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reservas_infraction_pending ON reservas_mais_vanta(user_id, infraction_registered_em) WHERE infraction_registered_em IS NULL AND post_verificado = false;
