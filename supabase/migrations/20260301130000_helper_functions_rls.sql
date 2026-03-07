-- ══════════════════════════════════════════════════════════════════════════════
-- Helper Functions for RLS — usadas por policies futuras
-- Date: 2026-03-01
-- ══════════════════════════════════════════════════════════════════════════════

-- Função: is_masteradm() — verifica se user atual é vanta_masteradm
CREATE OR REPLACE FUNCTION is_masteradm()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM conta_vanta
    WHERE id = auth.uid()
      AND role = 'vanta_masteradm'
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Função: is_membro_clube(check_user_id UUID) — verifica se user está no clube MAIS VANTA
CREATE OR REPLACE FUNCTION is_membro_clube(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM membros_clube
    WHERE user_id = check_user_id
      AND ativo = true
      AND banido_permanente = false
  );
END;
$$ LANGUAGE plpgsql STABLE;
