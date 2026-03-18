# MEMORY.md — Índice de Memórias do Projeto VANTA

> Índice central. Cada link aponta pra uma memória específica. Máx 180 linhas.

---

## Projeto — Estratégia & Visão

- [projeto_posicionamento.md](projeto_posicionamento.md) — Posicionamento, BrandScript, modelo de negócio, slogan
- [projeto_redesign_app.md](projeto_redesign_app.md) — Redesign completo do app (3 camadas, tiers, onboarding, tabs)
- [projeto_identidade_visual.md](projeto_identidade_visual.md) — Paleta, tipografia, fotografia, animações, 3 palavras-guia
- [mais_vanta_v2_modelo.md](mais_vanta_v2_modelo.md) — Modelo MAIS VANTA v2 (inspiração Secret Society Dubai)

## Módulos Principais (10)

- [modulo_comunidade.md](modulo_comunidade.md) — Comunidade (casa noturna/bar/espaço)
- [modulo_evento.md](modulo_evento.md) — Evento (admin, criação, dashboard)
- [modulo_compra_ingresso.md](modulo_compra_ingresso.md) — Checkout e compra de ingresso
- [modulo_carteira.md](modulo_carteira.md) — Carteira / Wallet
- [modulo_listas.md](modulo_listas.md) — Listas de entrada & Promoter
- [modulo_financeiro_completo.md](modulo_financeiro_completo.md) — Financeiro completo
- [modulo_social.md](modulo_social.md) — Social (amizades + mensagens)
- [modulo_perfil_feed.md](modulo_perfil_feed.md) — Perfil + Feed + Busca + Radar
- [modulo_rbac.md](modulo_rbac.md) — RBAC (permissões + equipe)
- [modulo_clube.md](modulo_clube.md) — MAIS VANTA (clube exclusivo)

## Sub-Módulos (16)

- [sub_criar_evento.md](sub_criar_evento.md) — Wizard criar evento (5 steps)
- [sub_dashboard_evento.md](sub_dashboard_evento.md) — Dashboard do evento (9 sub-views)
- [sub_transferencia_cortesia.md](sub_transferencia_cortesia.md) — Transferência + Cortesia
- [sub_promoter.md](sub_promoter.md) — Promoter (dashboard + cotas)
- [sub_saque_reembolso.md](sub_saque_reembolso.md) — Saque + Reembolso
- [sub_portaria_caixa.md](sub_portaria_caixa.md) — Portaria (check-in) + Caixa
- [sub_aprovacao_negociacao.md](sub_aprovacao_negociacao.md) — Aprovação + Negociação sócio
- [sub_notificacoes.md](sub_notificacoes.md) — Notificações (3 canais)
- [sub_comunidade_crud.md](sub_comunidade_crud.md) — Comunidade CRUD + Página pública
- [sub_clube_admin.md](sub_clube_admin.md) — MAIS VANTA Admin (curadoria + gestão)
- [sub_relatorios.md](sub_relatorios.md) — Relatórios & Analytics
- [sub_offline.md](sub_offline.md) — Operações offline
- [sub_busca_filtros.md](sub_busca_filtros.md) — Busca + Filtros + Radar
- [sub_chat_realtime.md](sub_chat_realtime.md) — Chat + Realtime + Presence
- [sub_solicitacao_parceria.md](sub_solicitacao_parceria.md) — Solicitação de parceria
- [sub_evento_privado.md](sub_evento_privado.md) — Evento privado (corporativo)

## Sub-Módulos Especiais

- [sub_comemoracao.md](sub_comemoracao.md) — Comemoração (aniversário/despedida VIP)
- [sub_taxas_modelo.md](sub_taxas_modelo.md) — Taxas VANTA (modelo negociável)
- [sub_negociacao_socio.md](sub_negociacao_socio.md) — REMOVIDO (negociação agora fora do app)

## Módulos Auxiliares

- [modulo_financeiro.md](modulo_financeiro.md) — Financeiro (legacy, ver completo acima)
- [modulo_inteligencia.md](modulo_inteligencia.md) — Inteligência VANTA (motor de valor)

## Views & Componentes

- [home_feed.md](home_feed.md) — Home / Feed
- [event_detail.md](event_detail.md) — Detalhe do evento
- [checkout.md](checkout.md) — Checkout
- [wallet.md](wallet.md) — Carteira (view)
- [profile.md](profile.md) — Perfil (view)
- [search.md](search.md) — Busca (view)
- [radar.md](radar.md) — Radar (mapa)
- [mensagens.md](mensagens.md) — Mensagens / Chat
- [onboarding.md](onboarding.md) — Onboarding
- [comunidade_public.md](comunidade_public.md) — Comunidade pública (view)
- [componentes_compartilhados.md](componentes_compartilhados.md) — Componentes compartilhados
- [graficos_componentes.md](graficos_componentes.md) — Gráficos / KPIs
- [admin_dashboard_home.md](admin_dashboard_home.md) — Admin Dashboard Home

## Infraestrutura & Config

- [infraestrutura.md](infraestrutura.md) — Infra (Capacitor, Vite, Supabase, Vercel)
- [plataformas.md](plataformas.md) — PWA, Lojas, E2E
- [responsividade.md](responsividade.md) — Responsividade (scaling fluido)
- [push_notificacoes.md](push_notificacoes.md) — Push / Notificações (FCM)

## RBAC & Permissões

- [rbac_definitivo.md](rbac_definitivo.md) — RBAC definitivo (roles/cargos)
- [permissoes_rbac.md](permissoes_rbac.md) — Permissões RBAC (service)

## Admin & Operações

- [painel_administrativo.md](painel_administrativo.md) — Painel Admin
- [services_admin.md](services_admin.md) — Services Admin (38 arquivos)
- [categorias.md](categorias.md) — Categorias de evento
- [checkin_caixa.md](checkin_caixa.md) — Check-in / Caixa / QR
- [checkin_offline.md](checkin_offline.md) — Check-in offline (IndexedDB)
- [clube_influencia.md](clube_influencia.md) — MAIS VANTA (services)
- [regras_reembolso.md](regras_reembolso.md) — Regras de reembolso
- [reviews.md](reviews.md) — Reviews
- [relatorios.md](relatorios.md) — Relatórios (service)

## Mapas & Grafos

- [EDGES.md](EDGES.md) — Propagação cross-domínio (tabela/store/RPC → consumers)
- [graph_admin_evento.md](graph_admin_evento.md) — Grafo admin evento
- [graph_identidade.md](graph_identidade.md) — Grafo identidade & conta
- [mapa_admin_painel.md](mapa_admin_painel.md) — Mapa painel admin
- [mapa_features_extras.md](mapa_features_extras.md) — Mapa features extras
- [mapa_financeiro.md](mapa_financeiro.md) — Mapa financeiro
- [mapa_infraestrutura_ui.md](mapa_infraestrutura_ui.md) — Mapa infra / UI
- [mapa_operacoes_evento.md](mapa_operacoes_evento.md) — Mapa operações evento
- [mapa_rbac_permissoes.md](mapa_rbac_permissoes.md) — Mapa RBAC
- [mapa_social_comunidade.md](mapa_social_comunidade.md) — Mapa social / comunidade
- [mapa_usuario_app.md](mapa_usuario_app.md) — Mapa app do usuário

## Checklists (9)

- [checklist_entrega.md](checklist_entrega.md) — Checklist entrega (CONGELADO)
- [checklist_fluxos.md](checklist_fluxos.md) — Checklist fluxos interativo
- [checklist_m1_fluxo_principal.md](checklist_m1_fluxo_principal.md) — M1: Fluxo principal
- [checklist_m2_mais_vanta.md](checklist_m2_mais_vanta.md) — M2: MAIS VANTA
- [checklist_m3_auth_social.md](checklist_m3_auth_social.md) — M3: Auth + Perfil + Social
- [checklist_m4_evento_compra.md](checklist_m4_evento_compra.md) — M4: Evento + Compra
- [checklist_m5_admin_operacao.md](checklist_m5_admin_operacao.md) — M5: Admin + Operação
- [checklist_m6_financeiro.md](checklist_m6_financeiro.md) — M6: Financeiro
- [checklist_m7_master.md](checklist_m7_master.md) — M7: Master Tools
- [checklist_m8_infra.md](checklist_m8_infra.md) — M8: Infra + Edge Functions
- [checklist_m9_comunidade_rbac.md](checklist_m9_comunidade_rbac.md) — M9: Comunidade + RBAC

## Auditoria & Progresso

- [audit_mapeamento_progress.md](audit_mapeamento_progress.md) — Progresso mapeamento (132 fluxos)
- [plano_blocos_melhorias.md](plano_blocos_melhorias.md) — 4 blocos de melhorias (visual, navegação, financeiro, operações) — COMPLETOS
- [decisoes_features_futuras.md](decisoes_features_futuras.md) — 20 decisões de features futuras (Dan, 17/mar sessão 5)

## Feedback

- [feedback_aplicar_migration_imediato.md](feedback_aplicar_migration_imediato.md) — NUNCA deixar migration pendente — aplicar + gerar tipos + deploy = obrigatório
- [feedback_zero_workarounds_any.md](feedback_zero_workarounds_any.md) — ZERO workarounds com `as any` no Supabase — migration primeiro, tipos depois, código por último
- [feedback_plano_antes_execucao.md](feedback_plano_antes_execucao.md) — NUNCA executar sem plano aprovado
- [feedback_alex_demitido.md](feedback_alex_demitido.md) — Alex demitido: NUNCA substituir admin sem teste, SEMPRE usar referências do Dan
- [feedback_rafa_convoca_equipe.md](feedback_rafa_convoca_equipe.md) — Rafa NUNCA age sozinho — convoca especialistas, cada um assina, Rafa consolida e reporta ao Dan
- [feedback_ler_memorias_obrigatorio.md](feedback_ler_memorias_obrigatorio.md) — OBRIGATÓRIO ler memórias de feedback antes de qualquer ação
- [feedback_sem_bypass_hooks.md](feedback_sem_bypass_hooks.md) — NUNCA contornar hooks via Bash/node/python/sed — pedir autorização ao Dan via AskUserQuestion
- [feedback_nunca_burlar_marker.md](feedback_nunca_burlar_marker.md) — NUNCA rodar vanta-marker.sh sem ter feito o trabalho real — última chance
- [feedback_padrao_sprint_sessao.md](feedback_padrao_sprint_sessao.md) — Padrão sprint: blocos temáticos → investigar → plano com equipe → Dan aprova → executar → memórias

## Meta

- [regras_usuario.md](regras_usuario.md) — Regras do usuário (comunicação, preferências)
- [sessao_atual.md](sessao_atual.md) — Estado atual + pendências
