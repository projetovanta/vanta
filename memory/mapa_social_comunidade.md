# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-04 13:17
# Mapa — Social / Comunidade

## Arquivos Principais
| Módulo | Arquivo | Linhas |
|---|---|---|
| Comunidade pública | `modules/community/ComunidadePublicView.tsx` | 407 |
| Mensagens | `services/messagesService.ts` | 343 |
| Chat store | `stores/chatStore.ts` | 256 |
| Amizades | `services/friendshipsService.ts` | 153 |
| Social store | `stores/socialStore.ts` | 132 |
| Reviews | `features/admin/services/reviewsService.ts` | 92 |
| Community follow | `services/communityFollowService.ts` | 42 |
| Achievements | `services/achievementsService.ts` | 147 |

## Comunidade Pública
- `ComunidadePublicView` → exibe info, eventos, membros, reviews, follow
- Usa `communityFollowService` para seguir/desseguir
- Reviews via `reviewsService`

## Mensagens / Chat
- `messagesService` → inbox, enviar, marcar lido (tabela `messages`)
- `useChatStore` → chats, onlineUsers, totalUnreadMessages
- Realtime via Supabase subscription

## Amizades
- `friendshipsService` → enviar/aceitar/recusar pedido, listar amigos
- `useSocialStore` → friendships, mutualFriends

## Achievements / Badges
- `achievementsService` → badges de frequência (ESTREANTE → LENDA)
- Baseado em presenças por comunidade
