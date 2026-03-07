-- ============================================================
-- VANTA — Migration: tabela messages (mensagens 1:1)
-- ============================================================
-- Execute no SQL Editor do Supabase Dashboard.
-- ============================================================

-- ── Tabela messages ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text         text NOT NULL CHECK (char_length(text) > 0 AND char_length(text) <= 2000),
  created_at   timestamptz NOT NULL DEFAULT now(),
  is_read      boolean NOT NULL DEFAULT false
);

-- ── Índices ──────────────────────────────────────────────────
-- Consulta de histórico entre dois participantes
CREATE INDEX IF NOT EXISTS idx_messages_pair
  ON public.messages (sender_id, recipient_id, created_at);

CREATE INDEX IF NOT EXISTS idx_messages_pair_inv
  ON public.messages (recipient_id, sender_id, created_at);

-- Não lidas por destinatário
CREATE INDEX IF NOT EXISTS idx_messages_unread
  ON public.messages (recipient_id, is_read)
  WHERE is_read = false;

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Usuário vê apenas mensagens em que é remetente ou destinatário
CREATE POLICY "messages_select"
  ON public.messages FOR SELECT
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- Usuário só insere mensagens onde ele é o remetente
CREATE POLICY "messages_insert"
  ON public.messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

-- Destinatário pode marcar mensagens como lidas
CREATE POLICY "messages_update_read"
  ON public.messages FOR UPDATE
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- ── Realtime ──────────────────────────────────────────────────
-- Habilitar Realtime para a tabela messages no Dashboard:
-- Database > Replication > supabase_realtime > messages
-- Ou via SQL:
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
