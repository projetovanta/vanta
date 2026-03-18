-- Fix C10: Recriar FKs apontando pra auth.users(id) em vez de profiles(id)
-- Motivo: profiles tem RLS que bloqueia FK check. auth.users NÃO tem RLS.
-- 44 colunas em 33 tabelas. Zero órfãos verificados antes de aplicar.

-- Bloco 1: Financeiro
ALTER TABLE tickets_caixa ADD CONSTRAINT IF NOT EXISTS fk_tickets_owner FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE pedidos_checkout ADD CONSTRAINT IF NOT EXISTS fk_pedidos_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE transactions ADD CONSTRAINT IF NOT EXISTS fk_transactions_comprador FOREIGN KEY (comprador_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE reembolsos ADD CONSTRAINT IF NOT EXISTS fk_reembolsos_solicitado FOREIGN KEY (solicitado_por) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE reembolsos ADD CONSTRAINT IF NOT EXISTS fk_reembolsos_aprovado FOREIGN KEY (aprovado_por) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE reembolsos ADD CONSTRAINT IF NOT EXISTS fk_reembolsos_socio FOREIGN KEY (socio_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Bloco 2: Social + Mensagens
ALTER TABLE messages ADD CONSTRAINT IF NOT EXISTS fk_messages_sender FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE messages ADD CONSTRAINT IF NOT EXISTS fk_messages_recipient FOREIGN KEY (recipient_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD CONSTRAINT IF NOT EXISTS fk_notifications_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE push_subscriptions ADD CONSTRAINT IF NOT EXISTS fk_push_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE reviews_evento ADD CONSTRAINT IF NOT EXISTS fk_reviews_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE chat_settings ADD CONSTRAINT IF NOT EXISTS fk_chat_settings_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE community_follows ADD CONSTRAINT IF NOT EXISTS fk_community_follows_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Bloco 3: RBAC + Admin + Clube
ALTER TABLE atribuicoes_rbac ADD CONSTRAINT IF NOT EXISTS fk_rbac_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE comunidades ADD CONSTRAINT IF NOT EXISTS fk_comunidades_created_by FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE eventos_admin ADD CONSTRAINT IF NOT EXISTS fk_eventos_created_by FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE membros_clube ADD CONSTRAINT IF NOT EXISTS fk_membros_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE membros_clube ADD CONSTRAINT IF NOT EXISTS fk_membros_convidado FOREIGN KEY (convidado_por) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE membros_clube ADD CONSTRAINT IF NOT EXISTS fk_membros_aprovado FOREIGN KEY (aprovado_por) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE socios_evento ADD CONSTRAINT IF NOT EXISTS fk_socios_socio FOREIGN KEY (socio_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE solicitacoes_clube ADD CONSTRAINT IF NOT EXISTS fk_sol_clube_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE solicitacoes_clube ADD CONSTRAINT IF NOT EXISTS fk_sol_clube_convidado FOREIGN KEY (convidado_por) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE solicitacoes_parceria ADD CONSTRAINT IF NOT EXISTS fk_sol_parceria_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE audit_logs ADD CONSTRAINT IF NOT EXISTS fk_audit_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Bloco 4: Restante
ALTER TABLE analytics_events ADD CONSTRAINT IF NOT EXISTS fk_analytics_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE drafts ADD CONSTRAINT IF NOT EXISTS fk_drafts_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE evento_favoritos ADD CONSTRAINT IF NOT EXISTS fk_favoritos_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE comprovantes_meia ADD CONSTRAINT IF NOT EXISTS fk_comprovantes_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE comprovantes_meia ADD CONSTRAINT IF NOT EXISTS fk_comprovantes_aprovado FOREIGN KEY (aprovado_por) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE fidelidade_cliente ADD CONSTRAINT IF NOT EXISTS fk_fidelidade_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE infracoes_mais_vanta ADD CONSTRAINT IF NOT EXISTS fk_infracoes_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE transferencias_ingresso ADD CONSTRAINT IF NOT EXISTS fk_transf_remetente FOREIGN KEY (remetente_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE transferencias_ingresso ADD CONSTRAINT IF NOT EXISTS fk_transf_destinatario FOREIGN KEY (destinatario_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE waitlist ADD CONSTRAINT IF NOT EXISTS fk_waitlist_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE user_consents ADD CONSTRAINT IF NOT EXISTS fk_consents_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE resgates_mais_vanta ADD CONSTRAINT IF NOT EXISTS fk_resgates_mv_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE resgates_mv_evento ADD CONSTRAINT IF NOT EXISTS fk_resgates_mve_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE parceiros_mais_vanta ADD CONSTRAINT IF NOT EXISTS fk_parceiros_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE mv_convites_especiais ADD CONSTRAINT IF NOT EXISTS fk_mv_convites_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE pmf_responses ADD CONSTRAINT IF NOT EXISTS fk_pmf_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE passport_aprovacoes ADD CONSTRAINT IF NOT EXISTS fk_passport_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE atribuicoes_plataforma ADD CONSTRAINT IF NOT EXISTS fk_atrib_plat_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
