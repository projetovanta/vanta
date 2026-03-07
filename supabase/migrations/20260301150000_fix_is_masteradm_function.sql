-- ══════════════════════════════════════════════════════════════════════════════
-- Fix is_masteradm() — referenciava "conta_vanta" (não existe), corrigido para "profiles"
-- Date: 2026-03-01
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION is_masteradm()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role = 'vanta_masteradm'
  );
END;
$$ LANGUAGE plpgsql STABLE;
