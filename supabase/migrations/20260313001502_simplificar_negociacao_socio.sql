-- Migration: Simplificar negociação de sócio
-- Negociação agora acontece FORA do app. Sócio é adicionado automaticamente na aprovação.

-- ── 1. Migrar dados existentes ──────────────────────────────────────────────

-- Sócios pendentes/negociando → ACEITO (auto-aceitar)
UPDATE socios_evento SET status = 'ACEITO' WHERE status IN ('PENDENTE', 'NEGOCIANDO');

-- Eventos em negociação → PENDENTE (prontos para aprovação)
UPDATE eventos_admin SET status_evento = 'PENDENTE' WHERE status_evento = 'NEGOCIANDO';

-- ── 2. DROP RPCs de negociação (não mais usadas) ────────────────────────────

DROP FUNCTION IF EXISTS aceitar_convite_socio(UUID);
DROP FUNCTION IF EXISTS recusar_convite_socio(UUID, TEXT);
DROP FUNCTION IF EXISTS contraproposta_convite_socio(UUID, NUMERIC, TEXT);
DROP FUNCTION IF EXISTS contraproposta_convite_socio(UUID, INTEGER, INTEGER, TEXT[], TEXT);
DROP FUNCTION IF EXISTS contraproposta_produtor(UUID, UUID, NUMERIC, TEXT);
DROP FUNCTION IF EXISTS contraproposta_produtor(UUID, UUID, INTEGER, TEXT);
DROP FUNCTION IF EXISTS aceitar_proposta_produtor(UUID, UUID);
DROP FUNCTION IF EXISTS cancelar_convite_produtor(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS reenviar_convite_socio(UUID, UUID, NUMERIC, TEXT[], TEXT);
DROP FUNCTION IF EXISTS expirar_negociacoes_vencidas();

-- ── 3. Remover cron job de expiração ────────────────────────────────────────

SELECT cron.unschedule('expirar-negociacoes-vencidas');

-- ── 4. Atualizar CHECK constraints ─────────────────────────────────────────

-- socios_evento: remover NEGOCIANDO e EXPIRADO
ALTER TABLE socios_evento DROP CONSTRAINT IF EXISTS socios_evento_status_check;
ALTER TABLE socios_evento ADD CONSTRAINT socios_evento_status_check
  CHECK (status IN ('PENDENTE', 'ACEITO', 'RECUSADO', 'CANCELADO'));

-- eventos_admin: remover NEGOCIANDO
ALTER TABLE eventos_admin DROP CONSTRAINT IF EXISTS eventos_admin_status_evento_check;
ALTER TABLE eventos_admin ADD CONSTRAINT eventos_admin_status_evento_check
  CHECK (status_evento IN ('RASCUNHO', 'PENDENTE', 'EM_REVISAO', 'ATIVO', 'EM_ANDAMENTO', 'FINALIZADO', 'CANCELADO'));
