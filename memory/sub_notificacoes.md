# Criado: 2026-03-06 01:48 | Ultima edicao: 2026-03-06 01:48

# Sub-modulo: Notificacoes (3 canais)

## Pertence a: infraestrutura (cross-modulo)

## 3 Canais
1. **In-app** (sync): notificationsService.add → useAuthStore.notifications
   - Cross-user: via RPC `inserir_notificacao` SECURITY DEFINER (bypassa RLS)
2. **Push** (FCM): pushNotificationService → Edge Function send-push
3. **Email** (Resend): Edge Functions send-*-email

## Service principal: notifyService (services/notifyService.ts)
Funcao `notify()` dispara nos 3 canais simultaneamente.
Parametros: userId, tipo, titulo, mensagem, link

## Cross-user notifications
- notificationsService.add detecta se targetUserId != userId logado
- Se cross-user: usa RPC `inserir_notificacao` (SECURITY DEFINER) em vez de INSERT direto
- Migration: `20260307120000_notif_insert_rpc.sql`

## 30 tipos de notificacao (confirmados em types/auth.ts)
| Tipo | Quando | Modulo |
|---|---|---|
| COMPRA_CONFIRMADA | Apos compra checkout | compra |
| TRANSFERENCIA_PENDENTE | Ao receber transferencia | carteira |
| CORTESIA_PENDENTE | Ao receber cortesia | carteira |
| EVENTO_APROVADO | Master aprova evento | evento |
| SAQUE_APROVADO | Master aprova saque | financeiro |
| REEMBOLSO_APROVADO | Reembolso aprovado | financeiro |
| AMIZADE_PEDIDO | Pedido de amizade | social |
| AMIZADE_ACEITA | Amizade aceita | social |
| MENSAGEM_NOVA | Nova mensagem chat | social |
| MV_APROVADO | Entrada no clube aprovada | clube → membro |
| MV_INFRACAO | Infracao registrada | clube |
| MV_DEAL_NOVO | Novo deal disponível | clube → membro |
| MV_RESGATE_CONFIRMADO | Resgate confirmado | clube → membro |
| MV_ASSINATURA_VENCENDO | Assinatura próxima do vencimento | clube → master |
| MV_ASSINATURA_VENCIDA | Assinatura expirada | clube → master |
| MV_DEAL_EXPIROU | Deal expirou sem resgates | clube → master |
| MV_LIMITE_ATINGIDO | Parceiro atingiu limite de resgates | clube → parceiro |
| MV_BEM_VINDO | Boas-vindas ao clube | clube → membro |
| MV_DEAL_SUGERIDO | Parceiro sugeriu novo deal | clube → master (trigger trg_deal_sugerido) |
| MV_DEAL_APROVADO | Deal sugerido foi aprovado | clube → parceiro |
| MV_DEAL_REJEITADO | Deal sugerido foi rejeitado | clube → parceiro |
| MV_PARCEIRO_BEM_VINDO | Boas-vindas ao parceiro | clube → parceiro |
| MV_RESGATE_PARCEIRO | Membro resgatou no parceiro | clube → parceiro |
| MV_NOSHOW_REGISTRADO | Infração NO_SHOW registrada automaticamente | trigger → membro |
| MV_LEMBRETE_RESERVA | Lembrete 12h antes do evento (cancele se não puder ir) | cron 30min → membro |
| PARCERIA_NOVA | Nova solicitacao de parceria | parceria → master |
| PARCERIA_APROVADA | Solicitacao aprovada | parceria → solicitante |
| PARCERIA_REJEITADA | Solicitacao rejeitada | parceria → solicitante |
| (+ mais tipos) | Ver types/auth.ts para lista completa | diversos |

## Edge Functions de notificacao
| Funcao | Canal | Descricao |
|---|---|---|
| send-push | Push FCM | Envia push notification |
| send-reembolso-email | Email Resend | Notifica reembolso (legado — reembolsoService agora usa notifyService) |
| notif-infraccao-registrada | In-app + Push | Infracao MV |
| send-welcome-email | Email Resend | Boas-vindas |
| send-buyer-notification | In-app + Push | Comunicação com compradores de evento (admin envia) |
| weekly-report | In-app + Push | Relatório semanal automático por comunidade (pg_cron domingo 10h BRT) |

## Handler: useAppHandlers.ts
Recebe notificacoes e navega para a tela correta baseado no `tipo` e `link`:
- CONVITE_SOCIO → NegociacaoSocioView (detecta papel socio/produtor via created_by)
- MENSAGEM_NOVA → openChatRoom (link = partnerId, extrai nome do titulo)
- WALLET → carteira
- FINANCEIRO → financeiro
- /admin/evento/{id} → painel admin (deep link)
- /admin/comunidade/{id} → painel admin (deep link)
- EVENT:{id} → detalhe do evento

## Painel de Notificacoes (NotificationPanel.tsx)
4 abas: TODAS | SOCIAL | EVENTOS | INGRESSOS
- **SOCIAL**: FRIEND_REQUEST, FRIEND_ACCEPTED, MENSAGEM_NOVA, AMIGO
- **EVENTOS**: EVENTO, ANIVERSARIO, REVIEW, PEDIR_REVIEW, EVENTO_APROVADO/RECUSADO/PENDENTE/CANCELADO/FINALIZADO, ALERTA_LOTACAO, EVENTO_PRIVADO_*, COMEMORACAO_*
- **INGRESSOS**: SISTEMA, CORTESIA_PENDENTE, TRANSFERENCIA_PENDENTE, COMPRA_CONFIRMADA, INGRESSO, COTA_RECEBIDA

## Notificacao MENSAGEM_NOVA
- Criada no chatStore via `createMessageNotification` (debounce 2s por remetente)
- Agrupada: busca no banco por notif nao lida do mesmo remetente antes de criar
- Se existe: UPDATE titulo para "Nova mensagem de Fulano (N)"
- Se nao: INSERT nova + push FCM (sem email para evitar spam)
- Se conversa silenciada (muted): skip notificacao

## Checklist
| # | Item | Status | Detalhe |
|---|---|---|---|
| 1 | In-app sync | OK | notificationsService |
| 2 | Push FCM | OK | pushNotificationService + Edge Function |
| 3 | Email Resend | OK | Edge Functions send-*-email |
| 4 | 46 tipos | OK | types/auth.ts (+MENSAGEM_NOVA) |
| 5 | Handler navegacao | OK | useAppHandlers.ts |
| 6 | Campanhas em massa | OK | campanhasService.ts 297L (IN_APP + PUSH + EMAIL, segmentos: TODOS/CIDADE/COMUNIDADE/EVENTO/MV) |
| 7 | Tabelas Supabase | OK | notifications (19 rows), push_subscriptions (2 rows), notificacoes_posevento |
| 8 | Cron jobs | OK | 10 jobs ativos: cleanup tokens/tickets, finalizar eventos, limpar notifs, update IG, expirar negociacoes, weekly-report, notif-pedir-review, lembrete-reserva-mv, process-scheduled-push (1min) |
| 9 | Toggle push por tipo | NAO EXISTE | Sem preferencias de notificacao |
| 8 | Historico de notificacoes | NAO EXISTE | Sem tela dedicada de historico |
| 9 | Unsubscribe email | NAO EXISTE | Sem link de unsubscribe nos emails |
