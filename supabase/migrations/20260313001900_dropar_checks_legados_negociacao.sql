-- Dropar CHECKs legados que ainda têm NEGOCIANDO (removido na simplificação)
-- Os CHECKs novos (eventos_admin_status_evento_check e socios_evento_status_check) são os corretos.

-- 1. eventos_admin: dropar CHECK antigo com NEGOCIANDO
ALTER TABLE eventos_admin DROP CONSTRAINT IF EXISTS chk_status_evento;

-- 2. socios_evento: dropar CHECK antigo com NEGOCIANDO/EXPIRADO
ALTER TABLE socios_evento DROP CONSTRAINT IF EXISTS chk_socios_status;

-- 3. socios_evento: dropar coluna e CHECK de ultimo_turno (dead code da negociação removida)
ALTER TABLE socios_evento DROP CONSTRAINT IF EXISTS socios_evento_ultimo_turno_check;
ALTER TABLE socios_evento DROP COLUMN IF EXISTS ultimo_turno;
