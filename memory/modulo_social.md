# Criado: 2026-03-06 01:40 | Ultima edicao: 2026-03-06 01:40

# Modulo: Social (Amizades + Mensagens)

## O que e
Social = amizades + chat direto entre usuarios.
Pedido de amizade → aceitar/recusar → amigos podem ver presenca no evento, trocar mensagens, ver mutuos.
Chat = mensagens 1:1 com reactions, delete, read receipts, realtime.

## Tabelas Supabase

### friendships
| Coluna | Tipo | Descricao |
|---|---|---|
| id | UUID PK | auto |
| requester_id | UUID FK profiles | Quem enviou pedido |
| addressee_id | UUID FK profiles | Quem recebeu pedido |
| status | TEXT | PENDING ou ACCEPTED (default PENDING) |
| created_at | TIMESTAMPTZ | auto |
| updated_at | TIMESTAMPTZ | auto |
| UNIQUE | (requester_id, addressee_id) | |

Modelo: PENDING = pedido enviado. ACCEPTED = amigos. DELETE row = cancelar/recusar/remover.

### messages
| Coluna | Tipo | Origem | Descricao |
|---|---|---|---|
| id | UUID PK | migration | auto |
| sender_id | UUID FK profiles | migration | Quem enviou |
| recipient_id | UUID FK profiles | migration | Quem recebeu |
| text | TEXT | migration | Conteudo da mensagem |
| created_at | TIMESTAMPTZ | migration | auto |
| is_read | BOOLEAN | migration | Default false |
| read_at | TIMESTAMPTZ | migration | Quando foi lida |
| deleted_at | TIMESTAMPTZ | migration | Soft delete |
| reactions | JSONB | migration | Array de reactions (default []) |

## Stores

### useSocialStore (stores/socialStore.ts, 158L)
| Estado | Tipo | Descricao |
|---|---|---|
| friendships | Record<string, FriendshipStatus> | Mapa de amizades do usuario |
| mutualFriends | Record<string, string[]> | Amigos em comum por usuario |

**Acoes:**
- `loadFriendships(userId)` — friendshipsService.getAll
- `sendRequest(userId, targetId)` — friendshipsService.request + notify
- `acceptRequest(userId, requesterId)` — friendshipsService.accept + notify
- `removeFriend(userId, otherId)` — friendshipsService.remove

### useChatStore (stores/chatStore.ts, 266L)
| Estado | Tipo | Descricao |
|---|---|---|
| chats | Chat[] | Lista de conversas |
| onlineUsers | Set<string> | Usuarios online (presence) |
| totalUnreadMessages | number | Total de mensagens nao lidas |
| activeChatParticipantId | string | Chat ativo |

**Acoes:**
- `loadChats(userId)` — messagesService.getChats (cache 30s)
- `sendMessage(senderId, recipientId, text)` — messagesService.sendMessage
- `markAsRead(senderId, recipientId)` — messagesService.markAsRead
- `deleteMessage(messageId)` — messagesService.deleteMessage
- `subscribeRealtime(userId)` — Supabase Realtime para novas mensagens

## Servicos

### friendshipsService (services/friendshipsService.ts)
- `getAll(userId)` — SELECT friendships WHERE requester_id OR addressee_id → Record<userId, status>
- `request(requesterId, addresseeId)` — INSERT friendships (status PENDING)
- `accept(userId, requesterId)` — UPDATE status = ACCEPTED
- `remove(userId, otherId)` — DELETE row

### messagesService (services/messagesService.ts)
- `sendMessage(senderId, recipientId, text)` — INSERT messages
- `markAsRead(senderId, recipientId)` — UPDATE is_read=true, read_at=now()
- `deleteMessage(messageId)` — UPDATE deleted_at=now() (soft delete)

## Arquivos
| Arquivo | Linhas | Funcao |
|---|---|---|
| modules/messages/MessagesView.tsx | 128 | Lista de conversas (inbox) |
| modules/messages/components/ChatRoomView.tsx | 346 | Chat 1:1 |
| modules/messages/components/MessageBubble.tsx | 160 | Bolha de mensagem com reactions |
| modules/messages/components/NewChatModal.tsx | 78 | Iniciar nova conversa |
| modules/messages/components/ChatListItem.tsx | 55 | Item da lista de chats |
| stores/socialStore.ts | 158 | Store de amizades |
| stores/chatStore.ts | 266 | Store de chat |
| services/friendshipsService.ts | ~120 | Service de amizades |
| services/messagesService.ts | ~200 | Service de mensagens |

## Fluxos

### ENVIAR PEDIDO DE AMIZADE
**Quem**: Usuario logado
**Navegacao**: Perfil de outro usuario -> Botao "Adicionar"
**Guards anti-self-request (3 camadas)**:
1. `guardedOpenMemberProfile` (useAppHandlers) — se `m.id === currentAccount.id`, redireciona para tab PERFIL
2. `requestFriendship` (socialStore) — rejeita se `memberId === currentAccount.id`
3. `PublicProfilePreviewView` — recebe `isOwner=true` via App.tsx, mostra "Editar Perfil" em vez de "Adicionar Amigo"
**O que acontece (se nao for self)**:
1. friendshipsService.request → INSERT friendships (PENDING)
2. Notificacao enviada ao destinatario (notify)

**Quem recebe**: Destinatario ve pedido pendente, pode aceitar ou recusar

### ACEITAR PEDIDO
**Quem**: Usuario que recebeu pedido
**Navegacao**: Notificacao/perfil -> Aceitar
**O que acontece**:
1. friendshipsService.accept → UPDATE status = ACCEPTED
2. Notificacao enviada ao remetente original

**Consequencia**: ambos viram amigos, podem ver presenca mutua, trocar mensagens

### REMOVER AMIZADE
**Quem**: Qualquer um dos amigos
**O que acontece**: friendshipsService.remove → DELETE row
**Consequencia**: deixam de ser amigos, sem acesso a presenca/chat exclusivo

### ENVIAR MENSAGEM
**Quem**: Usuario logado (para amigo ou qualquer usuario)
**Navegacao**: Bottom nav "Mensagens" -> MessagesView -> Chat existente ou NewChatModal
**O que acontece**:
1. messagesService.sendMessage → INSERT messages
2. Realtime: destinatario recebe mensagem em tempo real (Supabase Realtime)
3. Badge de unread atualiza

### REACTIONS EM MENSAGEM
**Quem**: Qualquer participante do chat
**Navegacao**: ChatRoomView -> segurar mensagem -> escolher emoji
**O que acontece**: UPDATE messages.reactions (JSONB append)

### DELETAR MENSAGEM
**Quem**: Remetente da mensagem
**O que acontece**: messagesService.deleteMessage → UPDATE deleted_at (soft delete)
**Consequencia**: mensagem some do chat mas permanece no banco

### MARCAR COMO LIDA
**Quem**: Automatico ao abrir chat
**O que acontece**: messagesService.markAsRead → UPDATE is_read=true, read_at=now()
**Consequencia**: read receipt visivel, badge unread atualiza

## Onde este modulo aparece (propagacao)

| Tela | O que usa |
|---|---|
| Bottom nav | Badge de mensagens nao lidas (totalUnreadMessages) |
| ProfileView | Botao adicionar/remover amigo |
| PublicProfilePreviewView | Status amizade + botao |
| EventDetailView | Amigos que vao (social proof) |
| SearchView | Busca de usuarios para amizade |
| WalletView | Transferir ingresso para amigo |
| HomeView | Presenca de amigos |

## Checklist de status
| # | Item | Status | Detalhe |
|---|---|---|---|
| 1 | Pedido de amizade | OK | friendshipsService.request + notify |
| 2 | Aceitar/recusar | OK | accept + remove |
| 3 | Lista de amigos | OK | useSocialStore.friendships |
| 4 | Chat 1:1 | OK | ChatRoomView 346L |
| 5 | Realtime mensagens | OK | Supabase Realtime subscription |
| 6 | Reactions | OK | JSONB reactions no messages |
| 7 | Soft delete mensagem | OK | deleted_at |
| 8 | Read receipts | OK | read_at + is_read |
| 9 | Online presence | OK | onlineUsers no chatStore |
| 10 | Badge unread | OK | totalUnreadMessages |
| 11 | Buscar usuario | OK | NewChatModal + search |
| 12 | RLS | OK | friendships + messages com RLS |
| 13 | Amigos mutuos | OK | mutualFriends no socialStore |
| 14 | Bloquear usuario | NAO EXISTE | Sem funcao de bloqueio |
| 15 | Grupo de chat | NAO EXISTE | Apenas 1:1 |
| 16 | Enviar imagem/midia | NAO EXISTE | Apenas texto |
| 17 | Denunciar mensagem | NAO EXISTE | Sem report |
