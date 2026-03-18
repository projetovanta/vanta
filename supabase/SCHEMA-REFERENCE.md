# VANTA — Schema Reference

> Gerado em 2026-03-18. Fonte: Supabase MCP (execute_sql).
> Para recriar o banco do zero, executar todas as migrations em `supabase/migrations/` em ordem.

---

## Tabelas (90 objetos — 88 BASE TABLE + 2 VIEW)

| # | Tabela | Tipo |
|---|--------|------|
| 1 | analytics_events | TABLE |
| 2 | assinaturas_mais_vanta | TABLE |
| 3 | atribuicoes_plataforma | TABLE |
| 4 | atribuicoes_rbac | TABLE |
| 5 | audit_logs | TABLE |
| 6 | bloqueios | TABLE |
| 7 | brand_profiles | TABLE |
| 8 | cargos | TABLE |
| 9 | cargos_plataforma | TABLE |
| 10 | categorias_evento | TABLE |
| 11 | chargebacks | TABLE |
| 12 | chat_settings | TABLE |
| 13 | cidades_mais_vanta | TABLE |
| 14 | clube_config | TABLE |
| 15 | comemoracoes | TABLE |
| 16 | comemoracoes_config | TABLE |
| 17 | comemoracoes_cortesias | TABLE |
| 18 | comemoracoes_faixas | TABLE |
| 19 | community_follows | TABLE |
| 20 | comprovantes_meia | TABLE |
| 21 | comunidades | TABLE |
| 22 | comunidades_admin | VIEW |
| 23 | comunidades_publico | VIEW |
| 24 | condicoes_comerciais | TABLE |
| 25 | convidados_lista | TABLE |
| 26 | convites_clube | TABLE |
| 27 | convites_mais_vanta | TABLE |
| 28 | cortesias_config | TABLE |
| 29 | cortesias_log | TABLE |
| 30 | cortesias_pendentes | TABLE |
| 31 | cotas_promoter | TABLE |
| 32 | cupons | TABLE |
| 33 | deals_mais_vanta | TABLE |
| 34 | denuncias | TABLE |
| 35 | drafts | TABLE |
| 36 | equipe_evento | TABLE |
| 37 | estilos | TABLE |
| 38 | evento_favoritos | TABLE |
| 39 | eventos_admin | TABLE |
| 40 | eventos_privados | TABLE |
| 41 | experiencias | TABLE |
| 42 | fidelidade_cliente | TABLE |
| 43 | formatos | TABLE |
| 44 | friendships | TABLE |
| 45 | infracoes_mais_vanta | TABLE |
| 46 | interesses | TABLE |
| 47 | legal_documents | TABLE |
| 48 | listas_evento | TABLE |
| 49 | lotes | TABLE |
| 50 | mais_vanta_config | TABLE |
| 51 | mais_vanta_config_evento | TABLE |
| 52 | membros_clube | TABLE |
| 53 | mesas | TABLE |
| 54 | messages | TABLE |
| 55 | mv_convites_especiais | TABLE |
| 56 | mv_solicitacoes_notificacao | TABLE |
| 57 | niveis_prestigio | TABLE |
| 58 | notificacoes_posevento | TABLE |
| 59 | notifications | TABLE |
| 60 | pagamentos_promoter | TABLE |
| 61 | parceiros_mais_vanta | TABLE |
| 62 | passport_aprovacoes | TABLE |
| 63 | pedidos_checkout | TABLE |
| 64 | planos_mais_vanta | TABLE |
| 65 | planos_produtor | TABLE |
| 66 | platform_config | TABLE |
| 67 | pmf_responses | TABLE |
| 68 | produtor_plano | TABLE |
| 69 | profiles | TABLE |
| 70 | push_agendados | TABLE |
| 71 | push_subscriptions | TABLE |
| 72 | push_templates | TABLE |
| 73 | reembolsos | TABLE |
| 74 | regras_lista | TABLE |
| 75 | relatorios_semanais | TABLE |
| 76 | resgates_mais_vanta | TABLE |
| 77 | resgates_mv_evento | TABLE |
| 78 | reviews_evento | TABLE |
| 79 | site_content | TABLE |
| 80 | socios_evento | TABLE |
| 81 | solicitacoes_clube | TABLE |
| 82 | solicitacoes_parceria | TABLE |
| 83 | solicitacoes_saque | TABLE |
| 84 | splits_config | TABLE |
| 85 | tickets_caixa | TABLE |
| 86 | tiers_mais_vanta | TABLE |
| 87 | transactions | TABLE |
| 88 | transferencias_ingresso | TABLE |
| 89 | user_consents | TABLE |
| 90 | vanta_indica | TABLE |
| 91 | vanta_indica_templates | TABLE |
| 92 | variacoes_ingresso | TABLE |
| 93 | vendas_log | TABLE |
| 94 | waitlist | TABLE |

---

## RPCs / Functions (50)

| # | Função |
|---|--------|
| 1 | aceitar_convite_mv |
| 2 | aceitar_cortesia_rpc |
| 3 | anonimizar_conta |
| 4 | buscar_membros |
| 5 | cancelar_serie_recorrente |
| 6 | check_deal_ativo_unico |
| 7 | criar_comunidade_completa |
| 8 | criar_evento_completo |
| 9 | expirar_pedidos_checkout_pendentes |
| 10 | exportar_dados_usuario |
| 11 | finalizar_eventos_expirados |
| 12 | gerar_cortesias_comemoracao |
| 13 | gerar_ocorrencias_recorrente |
| 14 | get_admin_access |
| 15 | get_evento_from_lista |
| 16 | get_evento_from_lote |
| 17 | get_eventos_por_regiao |
| 18 | get_ocorrencias_serie |
| 19 | handle_new_user |
| 20 | has_comunidade_access |
| 21 | has_comunidade_write_access |
| 22 | has_evento_access |
| 23 | has_plataforma_permission |
| 24 | incrementar_usos_cupom |
| 25 | inserir_notificacao |
| 26 | is_event_manager_or_admin |
| 27 | is_event_team_member |
| 28 | is_masteradm |
| 29 | is_membro_clube |
| 30 | is_produtor_evento |
| 31 | is_tenant_member |
| 32 | notificar_deal_sugerido |
| 33 | notificar_lembrete_reserva_mv |
| 34 | processar_compra_checkout |
| 35 | processar_venda_caixa |
| 36 | queimar_ingresso |
| 37 | registrar_noshow_evento_finalizado |
| 38 | rls_auto_enable |
| 39 | search_users |
| 40 | set_updated_at |
| 41 | set_updated_at_drafts |
| 42 | sign_ticket_token |
| 43 | update_cargos_plataforma_updated_at |
| 44 | update_push_sub_last_used |
| 45 | update_resgates_parceiro |
| 46 | update_vagas_deal |
| 47 | user_shares_tenant |
| 48 | verificar_virada_lote |
| 49 | verify_ticket_token |
| 50 | vincular_comemoracao_evento |

---

## Migrations

219 arquivos em `supabase/migrations/` (de 20260225 a 20260319).

---

*Gerado automaticamente via Supabase MCP. Kai, Arquiteto Supabase.*
