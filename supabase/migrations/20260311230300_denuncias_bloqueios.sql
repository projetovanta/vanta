-- Tabelas de denúncias e bloqueios entre usuários
-- Migration: 20260311230300_denuncias_bloqueios

-- =============================================================
-- 1. DENUNCIAS
-- =============================================================
CREATE TABLE IF NOT EXISTS denuncias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('USUARIO', 'EVENTO', 'COMUNIDADE', 'CHAT')),
  alvo_user_id UUID REFERENCES auth.users(id),
  alvo_evento_id UUID,
  alvo_comunidade_id UUID,
  motivo TEXT NOT NULL CHECK (motivo IN ('OFENSIVO', 'SPAM', 'PERFIL_FALSO', 'ASSEDIO', 'OUTRO')),
  descricao TEXT,
  status TEXT NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'ANALISANDO', 'RESOLVIDA', 'DESCARTADA')),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ
);

-- =============================================================
-- 2. BLOQUEIOS
-- =============================================================
CREATE TABLE IF NOT EXISTS bloqueios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bloqueador_id UUID NOT NULL REFERENCES auth.users(id),
  bloqueado_id UUID NOT NULL REFERENCES auth.users(id),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (bloqueador_id, bloqueado_id)
);

-- =============================================================
-- 3. RLS — DENUNCIAS
-- =============================================================
ALTER TABLE denuncias ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado pode criar denúncia (apenas como reporter)
CREATE POLICY "denuncias_insert_own"
  ON denuncias FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = auth.uid());

-- SELECT apenas para master admin
CREATE POLICY "denuncias_select_admin"
  ON denuncias FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'master'
    )
  );

-- =============================================================
-- 4. RLS — BLOQUEIOS
-- =============================================================
ALTER TABLE bloqueios ENABLE ROW LEVEL SECURITY;

-- Usuário pode inserir bloqueio onde é o bloqueador
CREATE POLICY "bloqueios_insert_own"
  ON bloqueios FOR INSERT
  TO authenticated
  WITH CHECK (bloqueador_id = auth.uid());

-- Usuário pode ver seus próprios bloqueios
CREATE POLICY "bloqueios_select_own"
  ON bloqueios FOR SELECT
  TO authenticated
  USING (bloqueador_id = auth.uid());

-- Usuário pode remover seus próprios bloqueios
CREATE POLICY "bloqueios_delete_own"
  ON bloqueios FOR DELETE
  TO authenticated
  USING (bloqueador_id = auth.uid());
