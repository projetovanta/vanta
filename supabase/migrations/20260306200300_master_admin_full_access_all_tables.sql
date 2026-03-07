-- ============================================================
-- Master admin (vanta_masteradm) tem soberania total em todas as tabelas
-- Policy ALL = SELECT + INSERT + UPDATE + DELETE
-- ============================================================

CREATE POLICY "admin_all_analytics_events"
  ON analytics_events FOR ALL
  USING (is_vanta_admin()) WITH CHECK (is_vanta_admin());

CREATE POLICY "admin_all_community_follows"
  ON community_follows FOR ALL
  USING (is_vanta_admin()) WITH CHECK (is_vanta_admin());

CREATE POLICY "admin_all_comprovantes_meia"
  ON comprovantes_meia FOR ALL
  USING (is_vanta_admin()) WITH CHECK (is_vanta_admin());

CREATE POLICY "admin_all_evento_favoritos"
  ON evento_favoritos FOR ALL
  USING (is_vanta_admin()) WITH CHECK (is_vanta_admin());

CREATE POLICY "admin_all_friendships"
  ON friendships FOR ALL
  USING (is_vanta_admin()) WITH CHECK (is_vanta_admin());

CREATE POLICY "admin_all_messages"
  ON messages FOR ALL
  USING (is_vanta_admin()) WITH CHECK (is_vanta_admin());

CREATE POLICY "admin_all_notifications"
  ON notifications FOR ALL
  USING (is_vanta_admin()) WITH CHECK (is_vanta_admin());

CREATE POLICY "admin_all_pagamentos_promoter"
  ON pagamentos_promoter FOR ALL
  USING (is_vanta_admin()) WITH CHECK (is_vanta_admin());

CREATE POLICY "admin_all_passport_aprovacoes"
  ON passport_aprovacoes FOR ALL
  USING (is_vanta_admin()) WITH CHECK (is_vanta_admin());

CREATE POLICY "admin_all_pmf_responses"
  ON pmf_responses FOR ALL
  USING (is_vanta_admin()) WITH CHECK (is_vanta_admin());

CREATE POLICY "admin_all_push_subscriptions"
  ON push_subscriptions FOR ALL
  USING (is_vanta_admin()) WITH CHECK (is_vanta_admin());

CREATE POLICY "admin_all_reviews_evento"
  ON reviews_evento FOR ALL
  USING (is_vanta_admin()) WITH CHECK (is_vanta_admin());

CREATE POLICY "admin_all_soberania_acesso"
  ON soberania_acesso FOR ALL
  USING (is_vanta_admin()) WITH CHECK (is_vanta_admin());

CREATE POLICY "admin_all_waitlist"
  ON waitlist FOR ALL
  USING (is_vanta_admin()) WITH CHECK (is_vanta_admin());
