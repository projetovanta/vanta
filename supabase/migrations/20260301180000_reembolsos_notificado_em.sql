-- ══════════════════════════════════════════════════════════════════════════════
-- Reembolsos — Adicionar coluna notificado_em (prova de notificação ao produtor)
-- Date: 2026-03-01
-- ══════════════════════════════════════════════════════════════════════════════

-- Quando o produtor é notificado sobre um reembolso pendente,
-- registra o timestamp como prova documental (resguarda a plataforma)
-- NULL até o produtor ser notificado; timestamp gravado pelo service ao disparar notificação
ALTER TABLE public.reembolsos
  ADD COLUMN IF NOT EXISTS notificado_em TIMESTAMPTZ;
