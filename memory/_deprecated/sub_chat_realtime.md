# Criado: 2026-03-06 02:00 | Ultima edicao: 2026-03-06 02:00

# Sub-modulo: Chat + Realtime + Presence

## Pertence a: modulo_social.md

## Arquivos (9 arquivos, 1472L)
| Arquivo | Linhas | Funcao |
|---|---|---|
| stores/chatStore.ts | 266 | useChatStore — estado chat + init realtime |
| services/messagesService.ts | 332 | CRUD mensagens + subscribe + presence |
| services/realtimeManager.ts | 112 | Gerenciador de channels Supabase (max 5) |
| modules/messages/MessagesView.tsx | 128 | Lista de conversas (inbox) |
| modules/messages/components/ChatRoomView.tsx | 346 | Sala de chat (historico + envio) |
| modules/messages/components/MessageBubble.tsx | 160 | Bolha de mensagem (reactions, delete) |
| modules/messages/components/NewChatModal.tsx | 78 | Modal nova conversa (busca amigos) |
| modules/messages/components/ChatListItem.tsx | ~140 | Item de conversa com swipe (arquivar/silenciar) |
| modules/messages/components/ArchiveModal.tsx | ~80 | Modal confirmação arquivar (checkbox keepArchived) |
| services/chatSettingsService.ts | ~80 | CRUD chat_settings (archive/unarchive/mute/unmute) |
| types/social.ts | 32 | Tipos: Mensagem, Chat, OnlineUser |

## Types (social.ts)

### Mensagem
| Campo | Tipo | Descricao |
|---|---|---|
| id | string | UUID |
| senderId | string | Quem enviou |
| text | string | Conteudo |
| timestamp | string | ISO 8601 |
| isRead | boolean | Lida pelo destinatario |
| readAt | string? | Quando lida |
| deletedAt | string? | Soft delete |
| reactions | Array<{emoji, userId}> | Reactions JSONB |

### Chat
| Campo | Tipo | Descricao |
|---|---|---|
| id | string | = participantId |
| participantId | string | ID do outro usuario |
| participantNome | string? | Cache local |
| participantFoto | string? | Cache local |
| lastMessage | string | Ultimo texto |
| lastMessageTime | string | ISO 8601 |
| unreadCount | number | Nao lidas |
| messages | Mensagem[] | Historico carregado |

## useChatStore (266L) — Estado

### State
| Campo | Tipo | Default |
|---|---|---|
| chats | Chat[] | [] |
| onlineUsers | Set<string> | new Set() |
| activeChatParticipantId | string/null | null |
| totalUnreadMessages | number | 0 |
| chatSettings | Map<string, ChatSetting> | new Map() |

### Actions
| Metodo | Descricao |
|---|---|
| ensureChatExists(participantId, membro?) | Cria chat local se nao existe, seta activeChatParticipantId |
| sendMessage(participantId, text) | Optimistic update local + messagesService.sendMessage async |
| markChatAsRead(participantId) | Zera unreadCount local + messagesService.markAsRead |
| deleteMessage(messageId, participantId) | messagesService.deleteMessage + remove do state |
| toggleReaction(messageId, emoji, participantId) | messagesService.toggleReaction + update state |
| archiveChat(partnerId, keepArchived) | chatSettingsService.archive + update state |
| unarchiveChat(partnerId) | chatSettingsService.unarchive + remove do state |
| muteChat(partnerId) | chatSettingsService.mute + update state |
| unmuteChat(partnerId) | chatSettingsService.unmute + update state |
| init(userId) | Carrega inbox + settings + subscribe chat + presence. Retorna cleanup fn |

### init() — Fluxo de inicializacao
```
1. Reset state (chats=[], onlineUsers=Set(), chatSettings=Map())
2. chatSettingsService.getAll(userId) → carrega archived/muted
3. messagesService.getInbox(userId) → carrega conversas existentes
4. messagesService.subscribeToInbox(userId, onMessage) → escuta novos msgs
   - Se msg de chat ativo → marca como lida automaticamente
   - Se msg de chat novo → cria Chat com unreadCount=1
   - Se archived && !keepArchived → desarquiva automaticamente
   - Se !muted && !ativo → cria notificação MENSAGEM_NOVA agrupada
5. messagesService.subscribeToPresence(userId, onChange) → escuta online/offline
6. Retorna () => { unsubInbox(); unsubPresence() }
```

## Tabela chat_settings (migration 20260313120000)
| Coluna | Tipo | Descricao |
|---|---|---|
| user_id | UUID FK | Dono da configuracao |
| partner_id | UUID FK | Parceiro de chat |
| archived | BOOLEAN | Conversa arquivada |
| muted | BOOLEAN | Notificacoes silenciadas |
| keep_archived | BOOLEAN | Manter arquivada mesmo com novas msgs |
| archived_at | TIMESTAMPTZ | Quando foi arquivada |
- UNIQUE(user_id, partner_id), RLS: user_id = auth.uid()

## MessagesView — Abas
- CONVERSAS: chats nao arquivados
- ARQUIVADAS (N): chats arquivados, com contador

## ChatListItem — Swipe
- Touch handlers: detecta swipe >60px pra esquerda
- Revela 2 botoes: Silenciar (cinza) + Arquivar (amarelo)
- Arquivar abre ArchiveModal com checkbox keepArchived
- Silenciar é toggle direto com toast

## MessageBubble — Agrupamento
- Timestamps agrupados: mesmo sender + mesmo minuto = sem repeticao
- Padding compacto: px-3 py-1.5, rounded-2xl
- space-y-1 entre mensagens (era space-y-6)

### Consumers (6 telas)
| Arquivo | Consome |
|---|---|
| App.tsx | init, chats |
| Layout.tsx | totalUnreadMessages (badge) |
| useAppHandlers.ts | ensureChatExists, markChatAsRead |
| EventDetailView.tsx | sendMessage |
| ChatRoomView.tsx | onlineUsers, sendMessage, deleteMessage, toggleReaction |
| MessagesView.tsx | chats, onlineUsers |

## messagesService (332L) — CRUD + Realtime

### Metodos CRUD
| Metodo | Descricao |
|---|---|
| sendMessage(senderId, recipientId, text) | INSERT messages → retorna Mensagem |
| getHistory(userId, participantId, limit=50) | SELECT messages com filtro bidirecional |
| getInbox(userId) | RPC ou query agregada → InboxEntry[] |
| markAsRead(senderId, recipientId) | UPDATE read_at WHERE sender=recipientId |
| deleteMessage(messageId) | UPDATE deleted_at (soft delete) |
| toggleReaction(messageId, emoji, userId) | SELECT reactions → toggle → UPDATE |
| updateLastSeen(userId) | UPDATE profiles.last_seen |

### Metodos Realtime
| Metodo | Canal | Descricao |
|---|---|---|
| subscribeToChat(userId, participantId, onUpdate) | `chat:{sorted_ids}` | Escuta INSERT + UPDATE (reactions, delete, read) |
| subscribeToInbox(userId, onMessage) | `inbox:{userId}` | Escuta INSERT global de msgs para o user |
| subscribeToPresence(userId, onChange) | `presence:{userId}` | Presence channel → track online/offline |

## realtimeManager (112L) — Gerenciador de Channels

### Regras
- **MAX_CHANNELS = 5** — limite de channels simultaneos
- Channels gerenciados via Map<string, ManagedChannel>
- Quando excede limite: remove channel com menor prioridade (mais antigo)
- Cada channel tem `priority` (timestamp de criacao)

### API
| Metodo | Descricao |
|---|---|
| subscribe(name, setup, opts?) | Cria/reutiliza channel. Retorna unsubscribe fn |
| unsubscribe(name) | Remove channel especifico |
| unsubscribeAll() | Remove todos (chamado no logout) |
| activeCount | Numero de channels ativos |
| activeChannels | Lista de nomes (debug) |

### Fluxo subscribe
```
1. Verifica se channel ja existe → se sim, retorna unsubscribe existente
2. Cria channel via supabase.channel(name, opts?)
3. Registra no Map com priority = Date.now()
4. Chama setup(channel) → configura .on() listeners
5. Se setup retorna truthy → skip auto-subscribe (presence faz manual)
6. Se nao → channel.subscribe()
7. enforceLimit() → se >5 channels, remove mais antigo
```

## Views

### MessagesView (128L) — Lista de conversas
```
Sidebar → Mensagens → MessagesView
- Lista chats ordenados por lastMessageTime
- Indicador online (bolinha verde) via onlineUsers
- Badge unread count
- Busca por nome (debounced)
- Botao "+" → NewChatModal
- Skeleton loading
- Clica chat → onOpenChat(membro) → ChatRoomView
```

### ChatRoomView (346L) — Sala de chat
```
MessagesView → clica chat → ChatRoomView
- Header: foto + nome + status online
- Clica header → PublicProfilePreviewView
- Historico: messagesService.getHistory (50 msgs)
- Subscribe realtime: messagesService.subscribeToChat
- Envio: chatStore.sendMessage (optimistic)
- Scroll to bottom automatico
- markChatAsRead ao abrir
- MessageBubble com reactions + delete
```

### MessageBubble (160L)
- Bolha azul (minha) / cinza (outro)
- Reactions bar (emojis clicaveis)
- Long press → menu delete
- Search highlight (searchQuery)
- Timestamp formatado

### NewChatModal (78L)
- Busca entre amigos (friendships FRIENDS)
- Debounced search
- Seleciona → ensureChatExists → abre ChatRoomView

## Fluxos

### ENVIAR MENSAGEM
```
1. Usuario digita texto + clica enviar
2. chatStore.sendMessage(participantId, text)
   → Optimistic: adiciona msg local com timestamp agora
   → Async: messagesService.sendMessage(userId, participantId, text)
     → INSERT messages (sender_id, recipient_id, text)
3. Destinatario recebe via subscribeToInbox
   → Se chat ativo: marca lida automaticamente
   → Se chat inativo: unreadCount++ → badge atualiza
```

### REACTIONS
```
1. Usuario toca emoji no MessageBubble
2. chatStore.toggleReaction(msgId, emoji, participantId)
   → messagesService.toggleReaction(msgId, emoji, userId)
     → SELECT reactions do msg
     → Se ja tem essa reaction do user → remove
     → Se nao tem → adiciona
     → UPDATE messages SET reactions
3. Outro usuario recebe via subscribeToChat (UPDATE event)
```

### PRESENCE (online/offline)
```
1. init() → messagesService.subscribeToPresence(userId, onChange)
   → realtimeManager.subscribe('presence:...', channel => {
       channel.on('presence', { event: 'sync' }, ...)
       channel.subscribe(status => channel.track({ user_id }))
     })
2. Quando user entra: track() → presence sync → Set<string> atualiza
3. Quando user sai: untrack → presence sync → remove do Set
4. MessagesView + ChatRoomView consomem onlineUsers para indicador
```

### DELETE MENSAGEM
```
1. Long press → confirmar delete
2. chatStore.deleteMessage(msgId, participantId)
   → messagesService.deleteMessage(msgId) → UPDATE deleted_at
   → Remove do state local
3. Outro usuario recebe via subscribeToChat (UPDATE event)
```

## Checklist
| # | Item | Status | Detalhe |
|---|---|---|---|
| 1 | Enviar mensagem | OK | Optimistic + INSERT |
| 2 | Historico | OK | getHistory limit=50 |
| 3 | Inbox | OK | getInbox agregado |
| 4 | Mark as read | OK | UPDATE read_at |
| 5 | Soft delete | OK | UPDATE deleted_at |
| 6 | Reactions emoji | OK | JSONB toggle |
| 7 | Realtime chat | OK | subscribeToChat (INSERT+UPDATE) |
| 8 | Realtime inbox | OK | subscribeToInbox |
| 9 | Presence online | OK | subscribeToPresence + track |
| 10 | Channel manager | OK | realtimeManager max 5 |
| 11 | Optimistic update | OK | sendMessage local first |
| 12 | Badge unread | OK | totalUnreadMessages no Layout |
| 13 | Busca amigos | OK | NewChatModal |
| 14 | Profile preview | OK | ChatRoomView → PublicProfilePreviewView |
| 15 | Paginacao historico | NAO EXISTE | Carrega 50 msgs fixo, sem infinite scroll |
| 16 | Typing indicator | NAO EXISTE | Sem "digitando..." |
| 17 | Media/imagem | NAO EXISTE | Apenas texto |
| 18 | Audio/voice | NAO EXISTE | Apenas texto |
