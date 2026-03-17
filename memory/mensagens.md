# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-04 13:17
# Memória — Mensagens / Chat

## Arquivos
- `services/messagesService.ts` (343L) — inbox, enviar, marcar lido
- `stores/chatStore.ts` (256L) — estado global chat

## Tabela Supabase: messages
- Campos: id, sender_id, receiver_id, text, created_at, read

## messagesService API
- `getInbox(userId)` → InboxEntry[] (parceiros + última msg + unread)
- `getHistory(userId, partnerId)` → mensagens entre 2 users
- `sendMessage(senderId, receiverId, text)` → insere mensagem
- `markAsRead(senderId, recipientId)` → marca como lidas
- `deleteMessage(messageId)` → deleta mensagem
- `toggleReaction(messageId, userId, emoji)` → reação
- `updateLastSeen(userId)` → atualiza presença

## useChatStore
- Estado: chats, onlineUsers, totalUnreadMessages, activeChatParticipantId
- Actions: loadInbox, loadMessages, sendMessage, markAsRead
- Realtime: subscription Supabase para novas mensagens

## InboxEntry
```ts
{ partnerId, partnerNome, partnerFoto, lastText, lastTs, unreadCount }
```
