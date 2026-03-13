-- ══════════════════════════════════════════════════════════════════════════════
-- RBAC V2 — Fase 1.5: Remover is_vanta_admin_or_gerente()
-- Substituir em audit_logs por is_masteradm() OR has_plataforma_permission('VER_ANALYTICS')
-- ══════════════════════════════════════════════════════════════════════════════

-- ── 1. Substituir policy de audit_logs ─────────────────────────────────────
DROP POLICY IF EXISTS "audit_logs_select" ON audit_logs;

CREATE POLICY "audit_logs_select"
  ON audit_logs FOR SELECT TO authenticated
  USING (is_masteradm() OR has_plataforma_permission('VER_ANALYTICS'));

-- ── 2. Drop a função obsoleta ──────────────────────────────────────────────
DROP FUNCTION IF EXISTS is_vanta_admin_or_gerente();
