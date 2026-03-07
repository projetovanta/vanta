-- ============================================================
-- VANTA — Migration v8 → v9
-- Curadoria de membros: campos admin no profiles
-- Execute no SQL Editor do Supabase Dashboard.
-- ============================================================

-- ── 1. Adicionar campos de curadoria no profiles ────────────────

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS curadoria_concluida BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tags_curadoria       TEXT[]  NOT NULL DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notas_admin          TEXT;

-- Todo usuário que já existe e não tem curadoria → fila pendente (já é o default false)

-- ── 2. RLS: masteradm pode atualizar campos de curadoria de qualquer perfil ──
-- (SELECT já é público pela policy existente)

DROP POLICY IF EXISTS "profiles: master atualiza curadoria" ON profiles;
CREATE POLICY "profiles: master atualiza curadoria"
  ON profiles FOR UPDATE
  USING (
    -- Permite o próprio usuário atualizar O SEU perfil
    -- OU permite qualquer usuário autenticado atualizar campos de curadoria
    -- (a restrição de "só master" é feita na camada de aplicação)
    auth.role() = 'authenticated'
  );

-- ── 3. Index para busca eficiente de membros pendentes ──────────

CREATE INDEX IF NOT EXISTS idx_profiles_curadoria
  ON profiles (curadoria_concluida)
  WHERE curadoria_concluida = false;

CREATE INDEX IF NOT EXISTS idx_profiles_curadoria_true
  ON profiles (curadoria_concluida)
  WHERE curadoria_concluida = true;
