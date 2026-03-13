-- Cleanup: remover funções duplicadas + migrar 70 policies de is_vanta_admin() → is_masteradm()
-- trg_deal_sugerido() = duplicata de notificar_deal_sugerido() (nenhum trigger usa)
-- is_vanta_admin() = idêntica a is_masteradm() — unificar em is_masteradm()

DROP FUNCTION IF EXISTS trg_deal_sugerido() CASCADE;

-- ═══ Recriar 70 policies com is_masteradm() ═══

-- analytics_events
DROP POLICY IF EXISTS "admin_all_analytics_events" ON analytics_events;
CREATE POLICY "admin_all_analytics_events" ON analytics_events FOR ALL USING (is_masteradm()) WITH CHECK (is_masteradm());

-- assinaturas_mais_vanta
DROP POLICY IF EXISTS "assinaturas_mv_admin_all" ON assinaturas_mais_vanta;
CREATE POLICY "assinaturas_mv_admin_all" ON assinaturas_mais_vanta FOR ALL USING (is_masteradm()) WITH CHECK (is_masteradm());

-- chargebacks
DROP POLICY IF EXISTS "chargebacks_admin_all" ON chargebacks;
CREATE POLICY "chargebacks_admin_all" ON chargebacks FOR ALL USING (is_masteradm()) WITH CHECK (is_masteradm());
DROP POLICY IF EXISTS "chargebacks_insert_team" ON chargebacks;
CREATE POLICY "chargebacks_insert_team" ON chargebacks FOR INSERT WITH CHECK (is_event_team_member(evento_id) OR is_masteradm());
DROP POLICY IF EXISTS "chargebacks_select" ON chargebacks;
CREATE POLICY "chargebacks_select" ON chargebacks FOR SELECT TO authenticated USING (is_event_team_member(evento_id) OR is_masteradm());

-- community_follows
DROP POLICY IF EXISTS "admin_all_community_follows" ON community_follows;
CREATE POLICY "admin_all_community_follows" ON community_follows FOR ALL USING (is_masteradm()) WITH CHECK (is_masteradm());

-- comprovantes_meia
DROP POLICY IF EXISTS "admin_all_comprovantes_meia" ON comprovantes_meia;
CREATE POLICY "admin_all_comprovantes_meia" ON comprovantes_meia FOR ALL USING (is_masteradm()) WITH CHECK (is_masteradm());

-- convidados_lista
DROP POLICY IF EXISTS "convidados_lista_delete" ON convidados_lista;
CREATE POLICY "convidados_lista_delete" ON convidados_lista FOR DELETE TO authenticated USING (is_event_team_member(get_evento_from_lista(lista_id)) OR is_masteradm());
DROP POLICY IF EXISTS "convidados_lista_insert" ON convidados_lista;
CREATE POLICY "convidados_lista_insert" ON convidados_lista FOR INSERT TO authenticated WITH CHECK (is_event_team_member(get_evento_from_lista(lista_id)) OR is_masteradm());
DROP POLICY IF EXISTS "convidados_lista_select" ON convidados_lista;
CREATE POLICY "convidados_lista_select" ON convidados_lista FOR SELECT TO authenticated USING (is_event_team_member(get_evento_from_lista(lista_id)) OR is_masteradm());
DROP POLICY IF EXISTS "convidados_lista_update" ON convidados_lista;
CREATE POLICY "convidados_lista_update" ON convidados_lista FOR UPDATE TO authenticated USING (is_event_team_member(get_evento_from_lista(lista_id)) OR is_masteradm()) WITH CHECK (is_event_team_member(get_evento_from_lista(lista_id)) OR is_masteradm());

-- cortesias_config
DROP POLICY IF EXISTS "cortesias_config_insert" ON cortesias_config;
CREATE POLICY "cortesias_config_insert" ON cortesias_config FOR INSERT TO authenticated WITH CHECK (is_event_team_member(evento_id) OR is_masteradm());
DROP POLICY IF EXISTS "cortesias_config_select" ON cortesias_config;
CREATE POLICY "cortesias_config_select" ON cortesias_config FOR SELECT TO authenticated USING (is_event_team_member(evento_id) OR is_masteradm());
DROP POLICY IF EXISTS "cortesias_config_update" ON cortesias_config;
CREATE POLICY "cortesias_config_update" ON cortesias_config FOR UPDATE TO authenticated USING (is_event_team_member(evento_id) OR is_masteradm()) WITH CHECK (is_event_team_member(evento_id) OR is_masteradm());

-- cortesias_log
DROP POLICY IF EXISTS "cortesias_log_insert" ON cortesias_log;
CREATE POLICY "cortesias_log_insert" ON cortesias_log FOR INSERT TO authenticated WITH CHECK (is_event_team_member(evento_id) OR is_masteradm());
DROP POLICY IF EXISTS "cortesias_log_select" ON cortesias_log;
CREATE POLICY "cortesias_log_select" ON cortesias_log FOR SELECT TO authenticated USING (is_event_team_member(evento_id) OR is_masteradm());

-- cortesias_pendentes
DROP POLICY IF EXISTS "cortesias_insert_team" ON cortesias_pendentes;
CREATE POLICY "cortesias_insert_team" ON cortesias_pendentes FOR INSERT WITH CHECK (is_event_team_member((evento_id)::uuid) OR is_masteradm());
DROP POLICY IF EXISTS "cortesias_select_admin" ON cortesias_pendentes;
CREATE POLICY "cortesias_select_admin" ON cortesias_pendentes FOR SELECT USING (is_masteradm());
DROP POLICY IF EXISTS "cortesias_update_team" ON cortesias_pendentes;
CREATE POLICY "cortesias_update_team" ON cortesias_pendentes FOR UPDATE USING (is_event_team_member((evento_id)::uuid) OR is_masteradm()) WITH CHECK (is_event_team_member((evento_id)::uuid) OR is_masteradm());

-- cotas_promoter
DROP POLICY IF EXISTS "cotas_select_manager" ON cotas_promoter;
CREATE POLICY "cotas_select_manager" ON cotas_promoter FOR SELECT TO authenticated USING (is_event_team_member(get_evento_from_lista(lista_id)) OR is_masteradm());

-- estilos
DROP POLICY IF EXISTS "estilos_admin_all" ON estilos;
CREATE POLICY "estilos_admin_all" ON estilos FOR ALL USING (is_masteradm()) WITH CHECK (is_masteradm());

-- evento_favoritos
DROP POLICY IF EXISTS "admin_all_evento_favoritos" ON evento_favoritos;
CREATE POLICY "admin_all_evento_favoritos" ON evento_favoritos FOR ALL USING (is_masteradm()) WITH CHECK (is_masteradm());

-- eventos_admin
DROP POLICY IF EXISTS "eventos_insert" ON eventos_admin;
CREATE POLICY "eventos_insert" ON eventos_admin FOR INSERT TO authenticated WITH CHECK ((created_by = auth.uid()) OR is_masteradm());
DROP POLICY IF EXISTS "eventos_update" ON eventos_admin;
CREATE POLICY "eventos_update" ON eventos_admin FOR UPDATE TO authenticated USING ((created_by = auth.uid()) OR is_event_team_member(id) OR is_masteradm()) WITH CHECK ((created_by = auth.uid()) OR is_event_team_member(id) OR is_masteradm());

-- experiencias
DROP POLICY IF EXISTS "experiencias_admin_all" ON experiencias;
CREATE POLICY "experiencias_admin_all" ON experiencias FOR ALL USING (is_masteradm()) WITH CHECK (is_masteradm());

-- formatos
DROP POLICY IF EXISTS "formatos_admin_all" ON formatos;
CREATE POLICY "formatos_admin_all" ON formatos FOR ALL USING (is_masteradm()) WITH CHECK (is_masteradm());

-- friendships
DROP POLICY IF EXISTS "admin_all_friendships" ON friendships;
CREATE POLICY "admin_all_friendships" ON friendships FOR ALL USING (is_masteradm()) WITH CHECK (is_masteradm());

-- interesses
DROP POLICY IF EXISTS "interesses_delete" ON interesses;
CREATE POLICY "interesses_delete" ON interesses FOR DELETE TO authenticated USING (is_masteradm());
DROP POLICY IF EXISTS "interesses_insert" ON interesses;
CREATE POLICY "interesses_insert" ON interesses FOR INSERT TO authenticated WITH CHECK (is_masteradm());
DROP POLICY IF EXISTS "interesses_update" ON interesses;
CREATE POLICY "interesses_update" ON interesses FOR UPDATE TO authenticated USING (is_masteradm()) WITH CHECK (is_masteradm());

-- mesas
DROP POLICY IF EXISTS "mesas_delete_team" ON mesas;
CREATE POLICY "mesas_delete_team" ON mesas FOR DELETE USING (is_event_team_member(evento_id) OR is_masteradm());
DROP POLICY IF EXISTS "mesas_insert_team" ON mesas;
CREATE POLICY "mesas_insert_team" ON mesas FOR INSERT WITH CHECK (is_event_team_member(evento_id) OR is_masteradm());
DROP POLICY IF EXISTS "mesas_update_team" ON mesas;
CREATE POLICY "mesas_update_team" ON mesas FOR UPDATE USING (is_event_team_member(evento_id) OR is_masteradm()) WITH CHECK (is_event_team_member(evento_id) OR is_masteradm());

-- messages
DROP POLICY IF EXISTS "admin_all_messages" ON messages;
CREATE POLICY "admin_all_messages" ON messages FOR ALL USING (is_masteradm()) WITH CHECK (is_masteradm());

-- niveis_prestigio
DROP POLICY IF EXISTS "niveis_prestigio_admin_all" ON niveis_prestigio;
CREATE POLICY "niveis_prestigio_admin_all" ON niveis_prestigio FOR ALL USING (is_masteradm()) WITH CHECK (is_masteradm());

-- notificacoes_posevento
DROP POLICY IF EXISTS "notificacoes_posevento_delete_admin" ON notificacoes_posevento;
CREATE POLICY "notificacoes_posevento_delete_admin" ON notificacoes_posevento FOR DELETE USING (is_masteradm());
DROP POLICY IF EXISTS "notificacoes_posevento_insert_team" ON notificacoes_posevento;
CREATE POLICY "notificacoes_posevento_insert_team" ON notificacoes_posevento FOR INSERT WITH CHECK (is_event_team_member(evento_id) OR is_masteradm());
DROP POLICY IF EXISTS "notificacoes_posevento_update_team" ON notificacoes_posevento;
CREATE POLICY "notificacoes_posevento_update_team" ON notificacoes_posevento FOR UPDATE USING (is_event_team_member(evento_id) OR is_masteradm()) WITH CHECK (is_event_team_member(evento_id) OR is_masteradm());

-- notifications
DROP POLICY IF EXISTS "admin_all_notifications" ON notifications;
CREATE POLICY "admin_all_notifications" ON notifications FOR ALL USING (is_masteradm()) WITH CHECK (is_masteradm());
DROP POLICY IF EXISTS "notif_insert_admin" ON notifications;
CREATE POLICY "notif_insert_admin" ON notifications FOR INSERT WITH CHECK (is_masteradm());

-- pagamentos_promoter
DROP POLICY IF EXISTS "admin_all_pagamentos_promoter" ON pagamentos_promoter;
CREATE POLICY "admin_all_pagamentos_promoter" ON pagamentos_promoter FOR ALL USING (is_masteradm()) WITH CHECK (is_masteradm());

-- passport_aprovacoes
DROP POLICY IF EXISTS "admin_all_passport_aprovacoes" ON passport_aprovacoes;
CREATE POLICY "admin_all_passport_aprovacoes" ON passport_aprovacoes FOR ALL USING (is_masteradm()) WITH CHECK (is_masteradm());

-- pmf_responses
DROP POLICY IF EXISTS "admin_all_pmf_responses" ON pmf_responses;
CREATE POLICY "admin_all_pmf_responses" ON pmf_responses FOR ALL USING (is_masteradm()) WITH CHECK (is_masteradm());

-- profiles
DROP POLICY IF EXISTS "profiles_admin_all" ON profiles;
CREATE POLICY "profiles_admin_all" ON profiles FOR ALL USING (is_masteradm()) WITH CHECK (is_masteradm());
DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;
CREATE POLICY "profiles_update_admin" ON profiles FOR UPDATE TO authenticated USING (is_masteradm()) WITH CHECK (is_masteradm());

-- push_subscriptions
DROP POLICY IF EXISTS "admin_all_push_subscriptions" ON push_subscriptions;
CREATE POLICY "admin_all_push_subscriptions" ON push_subscriptions FOR ALL USING (is_masteradm()) WITH CHECK (is_masteradm());

-- reembolsos
DROP POLICY IF EXISTS "reembolsos_admin_all" ON reembolsos;
CREATE POLICY "reembolsos_admin_all" ON reembolsos FOR ALL USING (is_masteradm()) WITH CHECK (is_masteradm());
DROP POLICY IF EXISTS "reembolsos_select_own" ON reembolsos;
CREATE POLICY "reembolsos_select_own" ON reembolsos FOR SELECT USING ((auth.uid() = solicitado_por) OR is_event_team_member(evento_id) OR is_masteradm());
DROP POLICY IF EXISTS "reembolsos_update_admin" ON reembolsos;
CREATE POLICY "reembolsos_update_admin" ON reembolsos FOR UPDATE USING (is_masteradm()) WITH CHECK (is_masteradm());

-- regras_lista
DROP POLICY IF EXISTS "regras_lista_delete" ON regras_lista;
CREATE POLICY "regras_lista_delete" ON regras_lista FOR DELETE TO authenticated USING (is_event_team_member(get_evento_from_lista(lista_id)) OR is_masteradm());
DROP POLICY IF EXISTS "regras_lista_insert" ON regras_lista;
CREATE POLICY "regras_lista_insert" ON regras_lista FOR INSERT TO authenticated WITH CHECK (is_event_team_member(get_evento_from_lista(lista_id)) OR is_masteradm());
DROP POLICY IF EXISTS "regras_lista_select" ON regras_lista;
CREATE POLICY "regras_lista_select" ON regras_lista FOR SELECT TO authenticated USING (is_event_team_member(get_evento_from_lista(lista_id)) OR is_masteradm());
DROP POLICY IF EXISTS "regras_lista_update" ON regras_lista;
CREATE POLICY "regras_lista_update" ON regras_lista FOR UPDATE TO authenticated USING (is_event_team_member(get_evento_from_lista(lista_id)) OR is_masteradm()) WITH CHECK (is_event_team_member(get_evento_from_lista(lista_id)) OR is_masteradm());

-- reviews_evento
DROP POLICY IF EXISTS "admin_all_reviews_evento" ON reviews_evento;
CREATE POLICY "admin_all_reviews_evento" ON reviews_evento FOR ALL USING (is_masteradm()) WITH CHECK (is_masteradm());

-- soberania_acesso
DROP POLICY IF EXISTS "admin_all_soberania_acesso" ON soberania_acesso;
CREATE POLICY "admin_all_soberania_acesso" ON soberania_acesso FOR ALL USING (is_masteradm()) WITH CHECK (is_masteradm());

-- solicitacoes_saque
DROP POLICY IF EXISTS "saques_select" ON solicitacoes_saque;
CREATE POLICY "saques_select" ON solicitacoes_saque FOR SELECT TO authenticated USING ((produtor_id = auth.uid()) OR is_masteradm());
DROP POLICY IF EXISTS "saques_update_admin" ON solicitacoes_saque;
CREATE POLICY "saques_update_admin" ON solicitacoes_saque FOR UPDATE TO authenticated USING (is_masteradm()) WITH CHECK (is_masteradm());

-- tickets_caixa
DROP POLICY IF EXISTS "tickets_insert_team" ON tickets_caixa;
CREATE POLICY "tickets_insert_team" ON tickets_caixa FOR INSERT WITH CHECK (is_event_team_member(evento_id) OR is_masteradm());
DROP POLICY IF EXISTS "tickets_select_admin" ON tickets_caixa;
CREATE POLICY "tickets_select_admin" ON tickets_caixa FOR SELECT TO authenticated USING (is_masteradm());
DROP POLICY IF EXISTS "tickets_update_team" ON tickets_caixa;
CREATE POLICY "tickets_update_team" ON tickets_caixa FOR UPDATE USING (is_event_team_member(evento_id) OR is_masteradm()) WITH CHECK (is_event_team_member(evento_id) OR is_masteradm());

-- transactions
DROP POLICY IF EXISTS "transactions_select" ON transactions;
CREATE POLICY "transactions_select" ON transactions FOR SELECT TO authenticated USING (is_event_team_member(evento_id) OR is_masteradm());

-- transferencias_ingresso
DROP POLICY IF EXISTS "transf_insert_admin" ON transferencias_ingresso;
CREATE POLICY "transf_insert_admin" ON transferencias_ingresso FOR INSERT WITH CHECK (is_masteradm());
DROP POLICY IF EXISTS "transf_select_admin" ON transferencias_ingresso;
CREATE POLICY "transf_select_admin" ON transferencias_ingresso FOR SELECT USING (is_masteradm());
DROP POLICY IF EXISTS "transf_update_admin" ON transferencias_ingresso;
CREATE POLICY "transf_update_admin" ON transferencias_ingresso FOR UPDATE USING (is_masteradm()) WITH CHECK (is_masteradm());

-- vanta_indica
DROP POLICY IF EXISTS "indica_delete" ON vanta_indica;
CREATE POLICY "indica_delete" ON vanta_indica FOR DELETE TO authenticated USING (is_masteradm());
DROP POLICY IF EXISTS "indica_insert" ON vanta_indica;
CREATE POLICY "indica_insert" ON vanta_indica FOR INSERT TO authenticated WITH CHECK (is_masteradm());
DROP POLICY IF EXISTS "indica_select" ON vanta_indica;
CREATE POLICY "indica_select" ON vanta_indica FOR SELECT TO authenticated USING ((ativo = true) OR is_masteradm());
DROP POLICY IF EXISTS "indica_update" ON vanta_indica;
CREATE POLICY "indica_update" ON vanta_indica FOR UPDATE TO authenticated USING (is_masteradm()) WITH CHECK (is_masteradm());

-- vendas_log
DROP POLICY IF EXISTS "vendas_log_select" ON vendas_log;
CREATE POLICY "vendas_log_select" ON vendas_log FOR SELECT TO authenticated USING (is_event_team_member(evento_id) OR is_masteradm());

-- waitlist
DROP POLICY IF EXISTS "admin_all_waitlist" ON waitlist;
CREATE POLICY "admin_all_waitlist" ON waitlist FOR ALL USING (is_masteradm()) WITH CHECK (is_masteradm());

-- ═══ DROPAR is_vanta_admin() definitivamente ═══
DROP FUNCTION IF EXISTS is_vanta_admin();
