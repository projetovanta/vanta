-- Master admin tem poder absoluto sobre cortesias_pendentes e transferencias_ingresso

-- cortesias_pendentes: SELECT para admin
CREATE POLICY "cortesias_select_admin"
  ON cortesias_pendentes FOR SELECT
  USING (is_vanta_admin());

-- transferencias_ingresso: SELECT para admin
CREATE POLICY "transf_select_admin"
  ON transferencias_ingresso FOR SELECT
  USING (is_vanta_admin());

-- transferencias_ingresso: UPDATE para admin
CREATE POLICY "transf_update_admin"
  ON transferencias_ingresso FOR UPDATE
  USING (is_vanta_admin())
  WITH CHECK (is_vanta_admin());

-- transferencias_ingresso: INSERT para admin (pode criar transferencia em nome de alguem)
CREATE POLICY "transf_insert_admin"
  ON transferencias_ingresso FOR INSERT
  WITH CHECK (is_vanta_admin());
