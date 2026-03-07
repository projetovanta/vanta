-- Castigo por no-show (não compareceu ao evento após reservar benefício MAIS VANTA)
-- castigo_ate: se NOT NULL e > now(), membro está bloqueado para novas reservas
ALTER TABLE membros_clube ADD COLUMN IF NOT EXISTS castigo_ate TIMESTAMPTZ;
-- Motivo do último castigo (para histórico/auditoria)
ALTER TABLE membros_clube ADD COLUMN IF NOT EXISTS castigo_motivo TEXT;
