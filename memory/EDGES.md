# Criado: 2026-03-06 02:05 | Ultima edicao: 2026-03-06 02:05

# EDGES.md — Propagacao Cross-Dominio

Mapa: tabela/store/RPC → arquivos que consomem. Consultar ANTES de mudar schema, store ou RPC.

## TABELAS NOVAS (sessao 17/mar)
| Tabela | Consumers |
|---|---|
| platform_config | ConfigPlataformaView |
| site_content | SiteContentView |
| legal_documents | LegalEditorView |
| user_consents | legalService |
| comunidades.instagram/whatsapp/tiktok/site | EditarModal, ComunidadePublicView, SolicitacoesParceriaView |

## TABELAS → Consumers

### socios_evento (6 consumers)
| Arquivo | Dominio |
|---|---|
| eventosAdminCore.ts | AE — refresh busca socios_evento |
| eventosAdminCrud.ts | AE — criarEvento insere socios |
| eventosAdminAprovacao.ts | AE — getConvitesPendentes, contraPropostaConvite |
| NegociacaoSocioView.tsx | UI — tela cheia chat, RPCs aceitar/recusar/contrapor/reiniciar (produtor+socio) |
| ConviteSocioModal.tsx | UI — LEGACY (substituido por NegociacaoSocioView no App.tsx) |
| MeusEventosView.tsx | UI — badge status negociacao no card do evento |

### eventos_admin (19 consumers)
| Arquivo | Dominio |
|---|---|
| eventosAdminCore.ts | AE |
| eventosAdminCrud.ts | AE |
| eventosAdminAprovacao.ts | AE, MA |
| eventosAdminFinanceiro.ts | FI |
| campanhasService.ts | MA |
| comunidadesService.ts | CM |
| rbacService.ts | IN |
| mesasService.ts | AE |
| listasService.ts | LI |
| cuponsService.ts | AE |
| reembolsoService.ts | FI |
| waitlistService.ts | CO |
| supabaseVantaService.ts | DS |
| CheckoutPage.tsx | CO |
| EventLandingPage.tsx | EV |
| FinanceiroView.tsx | FI |
| VantaIndicaView.tsx | MA |
| ProductAnalyticsView.tsx | RE |
| Edge Functions (notif-evento-*) | IN |

### profiles (40 consumers)
| Grupo | Arquivos |
|---|---|
| Auth/Identity | authService.ts, authStore.ts, DevQuickLogin.tsx, TosAcceptModal.tsx |
| Social | socialStore.ts, chatStore.ts, messagesService.ts, friendshipsService.ts |
| Profile views | ProfileView.tsx, EditProfileView.tsx, ClubeOptInView.tsx, WalletLockScreen.tsx |
| Event detail | EventSocialProof.tsx, EventDetailManagement.tsx |
| Admin | adminService.ts, comunidadesService.ts, comprovanteService.ts, clubeSolicitacoesService.ts |
| Admin views | MembrosGlobaisMaisVantaView.tsx, InfracoesGlobaisMaisVantaView.tsx, DividaSocialMaisVantaView.tsx, PassaportesMaisVantaView.tsx, NotificacoesAdminView.tsx, EquipeTab.tsx, EditarModal.tsx, StaffRecrutamento.tsx, ImportarStaffPanel.tsx, EventoCaixaView.tsx, AnalyticsSubView.tsx, ProductAnalyticsView.tsx, tabClube/index.tsx |
| Home | NotificationPanel.tsx |
| Edge Functions | send-push, send-invite |

### tickets_caixa (12 consumers)
| Arquivo | Dominio |
|---|---|
| eventosAdminTickets.ts | OP |
| eventosAdminFinanceiro.ts | FI |
| transferenciaService.ts | CA |
| supabaseVantaService.ts | CA |
| achievementsService.ts | DS |
| analyticsService.ts | RE |
| campanhasService.ts | MA |
| reembolsoService.ts | FI |
| EventSocialProof.tsx | EV |
| AnalyticsSubView.tsx | RE |
| EventoCaixaView.tsx | OP |
| ProductAnalyticsView.tsx | RE |

### comunidades (7 consumers)
| Arquivo | Dominio |
|---|---|
| comunidadesService.ts | CM |
| eventosAdminCore.ts | AE |
| rbacService.ts | IN |
| campanhasService.ts | MA |
| SearchView.tsx | DS |
| ComunidadePublicView.tsx | CM |
| EditarModal.tsx (evento_privado_* config) | CM |

### comemoracoes + comemoracoes_config + comemoracoes_faixas + comemoracoes_cortesias (5 consumers)
| Arquivo | Dominio |
|---|---|
| comemoracaoService.ts | CM |
| ComemoracaoFormView.tsx | CM |
| ComemoracoesTab.tsx | CM |
| ComemoracaoConfigSubView.tsx | AE |
| MinhasSolicitacoesView.tsx | PR |

### eventos_privados (4 consumers)
| Arquivo | Dominio |
|---|---|
| eventoPrivadoService.ts | CM |
| EventoPrivadoFormView.tsx | CM |
| EventosPrivadosTab.tsx | CM |
| MinhasSolicitacoesView.tsx | PR |

### lotes + variacoes_ingresso (3 consumers)
| Arquivo | Dominio |
|---|---|
| eventosAdminCore.ts | AE |
| eventosAdminCrud.ts | AE |
| CheckoutPage.tsx | CO |

### listas_evento + convidados_lista + regras_lista + cotas_promoter (2 consumers)
| Arquivo | Dominio |
|---|---|
| listasService.ts | LI |
| eventosAdminCrud.ts (regras/cotas) | AE |

### messages (1 consumer)
| Arquivo | Dominio |
|---|---|
| messagesService.ts | MS |

### friendships (2 consumers)
| Arquivo | Dominio |
|---|---|
| friendshipsService.ts | SO |
| achievementsService.ts | DS |

### membros_clube (9 consumers)
| Arquivo | Dominio |
|---|---|
| clubeSolicitacoesService.ts | MG |
| clubeMembrosService.ts | MG |
| clubeInstagramService.ts | MG |
| clubeInfracoesService.ts | MG |
| clubeIndex.ts | MG |
| MembrosGlobaisMaisVantaView.tsx | MG |
| InfracoesGlobaisMaisVantaView.tsx | MG |
| Edge: update-instagram-followers | IN |
| Edge: notif-infraccao-registrada | IN |

### solicitacoes_saque (2 consumers) — coluna comprovante_url adicionada
| Arquivo | Dominio |
|---|---|
| eventosAdminFinanceiro.ts | FI |
| supabaseVantaService.ts | FI |

### storage: comprovantes-saque (1 consumer)
| Arquivo | Dominio |
|---|---|
| eventosAdminFinanceiro.ts (uploadComprovanteSaque) | FI |

### reembolsos (2 consumers)
| Arquivo | Dominio |
|---|---|
| eventosAdminFinanceiro.ts | FI |
| reembolsoService.ts | FI |

### atribuicoes_rbac + cargos (4 consumers)
| Arquivo | Dominio |
|---|---|
| rbacService.ts | IN |
| eventosAdminCrud.ts | AE |
| eventosAdminFinanceiro.ts | FI |
| comunidadesService.ts | CM |

### transactions (1 consumer)
| Arquivo | Dominio |
|---|---|
| dashboardAnalyticsService.ts | RE |

### equipe_evento (3 consumers)
| Arquivo | Dominio |
|---|---|
| eventosAdminCore.ts | AE |
| TabEquipeSocio.tsx | AE |
| TabEquipePromoter.tsx | LI |

### cortesias_pendentes (1 consumer)
| Arquivo | Dominio |
|---|---|
| cortesiasService.ts | CA |

### transferencias_ingresso (1 consumer)
| Arquivo | Dominio |
|---|---|
| transferenciaService.ts | CA |

### community_follows (1 consumer)
| Arquivo | Dominio |
|---|---|
| communityFollowService.ts | CM |

### notifications (1 consumer)
| Arquivo | Dominio |
|---|---|
| notificationsService.ts | IN |

### reviews (1 consumer)
| Arquivo | Dominio |
|---|---|
| reviewsService.ts | EV |

### reservas_mais_vanta (1 consumer)
| Arquivo | Dominio |
|---|---|
| clubeReservasService.ts | MG |

### lotes_mais_vanta (1 consumer)
| Arquivo | Dominio |
|---|---|
| clubeLotesService.ts | MG |

### assinaturas_mais_vanta (1 consumer)
| Arquivo | Dominio |
|---|---|
| assinaturaService.ts | MG |

### passport_aprovacoes (1 consumer)
| Arquivo | Dominio |
|---|---|
| clubePassportService.ts | MG |

### infracoes_mais_vanta (1 consumer)
| Arquivo | Dominio |
|---|---|
| clubeInfracoesService.ts | MG |

### waitlist (1 consumer)
| Arquivo | Dominio |
|---|---|
| waitlistService.ts | CO |

## STORES → Consumers

### useAuthStore (24 consumers — mais usado)
currentAccount, profile, authLoading, selectedCity, notifications, accessNodes
- App.tsx, Layout.tsx, ProtectedRoute.tsx, DevQuickLogin.tsx
- HomeView.tsx, CitySelector.tsx, NotificationPanel.tsx
- EventDetailView.tsx, EventFeed.tsx
- ProfileView.tsx, PublicProfilePreviewView.tsx
- SearchView.tsx, RadarView.tsx
- WalletView.tsx
- MessagesView.tsx, ChatRoomView.tsx
- chatStore.ts, ticketsStore.ts, socialStore.ts, extrasStore.ts
- ComunidadePublicView.tsx
- AdminGateway.tsx
- useAppHandlers.ts

### useTicketsStore (4 consumers)
myTickets, myPresencas, cortesiasPendentes, transferenciasPendentes
- WalletView.tsx, ticketsStore.ts, App.tsx, useAppHandlers.ts

### useChatStore (6 consumers)
chats, onlineUsers, totalUnreadMessages, activeChatParticipantId
- App.tsx, Layout.tsx, useAppHandlers.ts
- MessagesView.tsx, ChatRoomView.tsx, EventDetailView.tsx

### useSocialStore (5 consumers)
friendships, mutualFriends
- socialStore.ts, App.tsx
- ChatRoomView.tsx, MessagesView.tsx, PublicProfilePreviewView.tsx

### useExtrasStore (4 consumers)
allEvents, savedEvents
- extrasStore.ts, App.tsx, HomeView.tsx, EventDetailView.tsx

## RPCs → Consumers

| RPC | Consumer(s) | Dominio |
|---|---|---|
| processar_compra_checkout | CheckoutPage.tsx, comemoracoes (ref_code tracking) | CO |
| gerar_cortesias_comemoracao | processar_compra_checkout (interno) | CO |
| vincular_comemoracao_evento | trigger INSERT eventos_admin | AE |
| processar_venda_caixa | eventosAdminTickets.ts | OP |
| queimar_ingresso | eventosAdminTickets.ts | OP |
| verificar_virada_lote | eventosAdminTickets.ts | OP |
| incrementar_usos_cupom | cuponsService.ts | AE |
| sign_ticket_token | jwtService.ts | CA |
| verify_ticket_token | jwtService.ts | OP |
| get_eventos_por_regiao | supabaseVantaService.ts | DS |
| buscar_membros | authService.ts | ID |
| get_admin_access | AdminGateway.tsx | IN |
| get_convite_socio | NegociacaoSocioView.tsx | AE |
| aceitar_convite_socio | NegociacaoSocioView.tsx | AE |
| recusar_convite_socio | NegociacaoSocioView.tsx | AE |
| contraproposta_convite_socio | NegociacaoSocioView.tsx | AE |
| contraproposta_produtor | NegociacaoSocioView.tsx | AE |
| aceitar_proposta_produtor | NegociacaoSocioView.tsx | AE |
| cancelar_convite_produtor | NegociacaoSocioView.tsx | AE |
| reiniciar_negociacao | NegociacaoSocioView.tsx | AE |
| expirar_negociacoes_vencidas | pg_cron (hourly) | AE |
| gerar_ocorrencias_recorrente | eventosAdminService.ts | AE |
| cancelar_serie_recorrente | SerieChips.tsx | AE |
| get_ocorrencias_serie | SerieChips.tsx | AE |
| inserir_notificacao | notificationsService.ts | IN |
| has_evento_access | RLS: eventos_admin, lotes, variacoes_ingresso, equipe_evento | IN |
| exportar_dados_usuario | lgpdExportService.ts (ProfileView) | PF |
| anonimizar_conta | ProfileView.tsx | PF |

## REGRA DE USO

### condicoes_comerciais (4 consumers)
| Arquivo | Dominio |
|---|---|
| condicoesService.ts | FI |
| ComercialTab.tsx | CM |
| CondicoesProducerView.tsx | FI |
| masterFinanceiro/index.tsx (CondicoesResumoCard) | FI |

Antes de mudar qualquer tabela, store ou RPC:
1. Encontrar a entrada neste arquivo
2. Verificar TODOS os consumers listados
3. Se mudar coluna/tipo → atualizar TODOS os `.select()` e tipos TS
4. Se mudar RPC params → atualizar TODOS os chamadores
5. Se mudar store state → atualizar TODOS os consumers
