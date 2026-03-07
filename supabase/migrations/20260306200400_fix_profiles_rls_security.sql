-- FIX: profiles RLS — remover policy aberta

DROP POLICY IF EXISTS "profiles_all" ON profiles;
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;

CREATE POLICY "profiles_admin_all"
  ON profiles FOR ALL
  USING (is_vanta_admin())
  WITH CHECK (is_vanta_admin());
