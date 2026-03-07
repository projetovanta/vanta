-- Permitir team/admin fazer UPDATE em cortesias_pendentes (atribuirNomeConvidado, etc)
CREATE POLICY "cortesias_update_team"
  ON cortesias_pendentes FOR UPDATE
  USING (is_event_team_member(evento_id::uuid) OR is_vanta_admin())
  WITH CHECK (is_event_team_member(evento_id::uuid) OR is_vanta_admin());
