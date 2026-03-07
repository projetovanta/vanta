-- ══════════════════════════════════════════════════════════════════════════════
-- Fix: is_masteradm() com SECURITY DEFINER + criar is_produtor_evento()
-- Fix: policies listas_evento e equipe_evento
-- Date: 2026-03-04
-- ══════════════════════════════════════════════════════════════════════════════

-- ── 1. is_masteradm() com SECURITY DEFINER ──────────────────────────────────
-- Sem SECURITY DEFINER, se profiles tiver RLS, a função retorna false sempre
CREATE OR REPLACE FUNCTION is_masteradm()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role = 'vanta_masteradm'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ── 2. is_produtor_evento() — NUNCA EXISTIU, referenciada em policies ────────
CREATE OR REPLACE FUNCTION is_produtor_evento(p_evento_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM equipe_evento
    WHERE evento_id = p_evento_id
      AND membro_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ── 3. RLS listas_evento — garantir policies corretas ────────────────────────
ALTER TABLE listas_evento ENABLE ROW LEVEL SECURITY;

-- Dropar policies antigas se existirem (podem ter sido criadas no Dashboard)
DO $$ BEGIN
  DROP POLICY IF EXISTS "listas: escrita sócio ou masteradm" ON listas_evento;
  DROP POLICY IF EXISTS "listas: leitura por equipe" ON listas_evento;
  DROP POLICY IF EXISTS "listas_evento_select" ON listas_evento;
  DROP POLICY IF EXISTS "listas_evento_insert" ON listas_evento;
  DROP POLICY IF EXISTS "listas_evento_update" ON listas_evento;
  DROP POLICY IF EXISTS "listas_evento_delete" ON listas_evento;
END $$;

-- SELECT: equipe do evento ou masteradm
CREATE POLICY "listas_evento: leitura equipe ou master"
  ON listas_evento FOR SELECT
  USING (
    is_masteradm()
    OR is_produtor_evento(evento_id)
  );

-- INSERT: masteradm ou produtor do evento
CREATE POLICY "listas_evento: escrita master ou produtor"
  ON listas_evento FOR INSERT
  WITH CHECK (
    is_masteradm()
    OR is_produtor_evento(evento_id)
  );

-- UPDATE: masteradm ou produtor do evento
CREATE POLICY "listas_evento: update master ou produtor"
  ON listas_evento FOR UPDATE
  USING (
    is_masteradm()
    OR is_produtor_evento(evento_id)
  );

-- DELETE: masteradm ou produtor do evento
CREATE POLICY "listas_evento: delete master ou produtor"
  ON listas_evento FOR DELETE
  USING (
    is_masteradm()
    OR is_produtor_evento(evento_id)
  );

-- ── 4. RLS equipe_evento — garantir policies ────────────────────────────────
ALTER TABLE equipe_evento ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "equipe_evento_select" ON equipe_evento;
  DROP POLICY IF EXISTS "equipe_evento_insert" ON equipe_evento;
  DROP POLICY IF EXISTS "equipe_evento_update" ON equipe_evento;
  DROP POLICY IF EXISTS "equipe_evento_delete" ON equipe_evento;
END $$;

-- SELECT: qualquer autenticado (necessário para is_produtor_evento funcionar)
CREATE POLICY "equipe_evento: leitura autenticado"
  ON equipe_evento FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- INSERT: masteradm ou produtor do evento
CREATE POLICY "equipe_evento: insert master ou produtor"
  ON equipe_evento FOR INSERT
  WITH CHECK (
    is_masteradm()
    OR is_produtor_evento(evento_id)
  );

-- UPDATE: masteradm ou produtor do evento
CREATE POLICY "equipe_evento: update master ou produtor"
  ON equipe_evento FOR UPDATE
  USING (
    is_masteradm()
    OR is_produtor_evento(evento_id)
  );

-- DELETE: masteradm
CREATE POLICY "equipe_evento: delete master"
  ON equipe_evento FOR DELETE
  USING (is_masteradm());

-- ── 5. Fix policy comunidades — adicionar SELECT/INSERT para masteradm ──────
DO $$ BEGIN
  DROP POLICY IF EXISTS "comunidades: masteradm escreve" ON comunidades;
  DROP POLICY IF EXISTS "comunidades: masteradm_all" ON comunidades;
END $$;

CREATE POLICY "comunidades: masteradm full access"
  ON comunidades FOR ALL
  USING (is_masteradm())
  WITH CHECK (is_masteradm());

-- ── 6. Fix policy eventos_admin — masteradm precisa SELECT ──────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "eventos_admin: masteradm_select" ON eventos_admin;
  DROP POLICY IF EXISTS "eventos_admin: masteradm_all" ON eventos_admin;
END $$;

CREATE POLICY "eventos_admin: masteradm full access"
  ON eventos_admin FOR ALL
  USING (is_masteradm())
  WITH CHECK (is_masteradm());
