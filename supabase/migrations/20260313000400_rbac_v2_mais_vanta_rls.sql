-- ══════════════════════════════════════════════════════════════════════════════
-- RBAC V2 — Fase 1.4: Fechar RLS das tabelas MAIS VANTA
-- cidades_mais_vanta, parceiros_mais_vanta, deals_mais_vanta: write só admin
-- resgates_mais_vanta: INSERT próprio (membro) + write admin
-- ══════════════════════════════════════════════════════════════════════════════

-- ── 1. cidades_mais_vanta ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "cidades_mv_write" ON cidades_mais_vanta;

CREATE POLICY "cidades_mv_write"
  ON cidades_mais_vanta FOR ALL TO authenticated
  USING (is_masteradm() OR has_plataforma_permission('GERIR_MAIS_VANTA'))
  WITH CHECK (is_masteradm() OR has_plataforma_permission('GERIR_MAIS_VANTA'));

-- ── 2. parceiros_mais_vanta ────────────────────────────────────────────────
DROP POLICY IF EXISTS "parceiros_mv_write" ON parceiros_mais_vanta;

CREATE POLICY "parceiros_mv_write"
  ON parceiros_mais_vanta FOR ALL TO authenticated
  USING (is_masteradm() OR has_plataforma_permission('GERIR_MAIS_VANTA'))
  WITH CHECK (is_masteradm() OR has_plataforma_permission('GERIR_MAIS_VANTA'));

-- ── 3. deals_mais_vanta ────────────────────────────────────────────────────
-- Drop write aberto + policies parceiro-specific (manter read)
DROP POLICY IF EXISTS "deals_mv_write" ON deals_mais_vanta;

-- Admin write
CREATE POLICY "deals_mv_admin_write"
  ON deals_mais_vanta FOR ALL TO authenticated
  USING (is_masteradm() OR has_plataforma_permission('GERIR_MAIS_VANTA'))
  WITH CHECK (is_masteradm() OR has_plataforma_permission('GERIR_MAIS_VANTA'));

-- Parceiro pode INSERT/UPDATE seus próprios deals (via parceiros_mais_vanta.user_id)
-- Manter policy existente deals_mv_parceiro_insert se existir, senão criar
DROP POLICY IF EXISTS "deals_mv_parceiro_insert" ON deals_mais_vanta;
CREATE POLICY "deals_mv_parceiro_insert"
  ON deals_mais_vanta FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM parceiros_mais_vanta
      WHERE id = parceiro_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "deals_mv_parceiro_update" ON deals_mais_vanta;
CREATE POLICY "deals_mv_parceiro_update"
  ON deals_mais_vanta FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM parceiros_mais_vanta
      WHERE id = parceiro_id AND user_id = auth.uid()
    )
  );

-- ── 4. resgates_mais_vanta ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "resgates_mv_write" ON resgates_mais_vanta;

-- Admin write (ALL)
CREATE POLICY "resgates_mv_admin_write"
  ON resgates_mais_vanta FOR ALL TO authenticated
  USING (is_masteradm() OR has_plataforma_permission('GERIR_MAIS_VANTA'))
  WITH CHECK (is_masteradm() OR has_plataforma_permission('GERIR_MAIS_VANTA'));

-- Membro pode INSERT seu próprio resgate
CREATE POLICY "resgates_mv_user_insert"
  ON resgates_mais_vanta FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Membro pode UPDATE seu próprio resgate (ex: cancelar)
CREATE POLICY "resgates_mv_user_update"
  ON resgates_mais_vanta FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
