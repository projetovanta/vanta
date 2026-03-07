# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-04 13:17
# Memória — Mensagens / Chat

## Arquivos
- `services/messagesService.ts` (343L) — inbox, enviar, marcar lido
- `stores/chatStore.ts` (256L) — estado global chat

## Tabela Supabase: messages
- Campos: id, sender_id, receiver_id, text, created_at, read

## messagesService API
- `getInbox(userId)` → InboxEntry[] (parceiros + última msg + unread)
- `getMessages(userId, partnerId)` → mensagens entre 2 users
- `sendMessage(senderId, receiverId, text)` → insere mensagem
- `markRead(userId, partnerId)` → marca como lidas

## useChatStore
- Estado: chats, onlineUsers, totalUnreadMessages, activeChatParticipantId
- Actions: loadInbox, loadMessages, sendMessage, markRead
- Realtime: subscription Supabase para novas mensagens

## InboxEntry
```ts
{ partnerId, partnerNome, partnerFoto, lastText, lastTs, unreadCount }
```
