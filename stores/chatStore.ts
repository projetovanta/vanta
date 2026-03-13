import { create } from 'zustand';
import { Chat, Membro, Mensagem } from '../types';
import { messagesService, InboxEntry } from '../services/messagesService';
import { supabase } from '../services/supabaseClient';
import { tsBR } from '../utils';
import { getCached } from '../services/cache';
import { withCircuitBreaker } from '../services/circuitBreaker';
import { useAuthStore, GUEST_PLACEHOLDER } from './authStore';
import { notificationsService } from '../features/admin/services/notificationsService';

interface ChatState {
  chats: Chat[];
  onlineUsers: Set<string>;
  activeChatParticipantId: string | null;
  totalUnreadMessages: number;

  // ações
  ensureChatExists: (participantId: string, participantMembro?: Membro) => void;
  sendMessage: (participantId: string, text: string) => void;
  markChatAsRead: (participantId: string) => void;
  deleteMessage: (messageId: string, participantId: string) => Promise<boolean>;
  toggleReaction: (messageId: string, emoji: string, participantId: string) => Promise<void>;

  // init
  init: (userId: string) => () => void;
}

const computeUnread = (chats: Chat[]) => chats.reduce((acc, c) => acc + c.unreadCount, 0);

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  onlineUsers: new Set(),
  activeChatParticipantId: null,
  totalUnreadMessages: 0,

  ensureChatExists: (participantId, participantMembro) => {
    set({ activeChatParticipantId: participantId });
    set(s => {
      const existing = s.chats.find(c => c.participantId === participantId);
      if (existing) {
        if (participantMembro) {
          const updated = s.chats.map(c =>
            c.participantId === participantId
              ? { ...c, participantNome: participantMembro.nome, participantFoto: participantMembro.foto }
              : c,
          );
          return { chats: updated };
        }
        return {};
      }
      const newChat: Chat = {
        id: participantId,
        participantId,
        participantNome: participantMembro?.nome,
        participantFoto: participantMembro?.foto,
        lastMessage: '',
        lastMessageTime: '',
        unreadCount: 0,
        messages: [],
      };
      return { chats: [newChat, ...s.chats] };
    });

    // Carrega histórico em background
    const { currentAccount } = useAuthStore.getState();
    const userId = currentAccount.id;
    if (userId && userId !== GUEST_PLACEHOLDER.id) {
      messagesService.getHistory(userId, participantId).then(msgs => {
        if (msgs.length === 0) return;
        set(s => {
          const updated = s.chats.map(c => {
            if (c.participantId !== participantId) return c;
            const last = msgs[msgs.length - 1];
            return { ...c, messages: msgs, lastMessage: last.text, lastMessageTime: last.timestamp };
          });
          return { chats: updated };
        });
      });
    }
  },

  sendMessage: (participantId, text) => {
    const { currentAccount } = useAuthStore.getState();
    const now = tsBR();
    const optimisticMsg: Mensagem = {
      id: `opt_${Math.random().toString(36).slice(2, 11)}`,
      senderId: currentAccount.id,
      text,
      timestamp: now,
      isRead: true,
      reactions: [],
    };

    set(s => {
      const chatIndex = s.chats.findIndex(c => c.participantId === participantId);
      if (chatIndex === -1) {
        const newChats: Chat[] = [
          {
            id: participantId,
            participantId,
            lastMessage: text,
            lastMessageTime: now,
            unreadCount: 0,
            messages: [optimisticMsg],
          },
          ...s.chats,
        ];
        return { chats: newChats, totalUnreadMessages: computeUnread(newChats) };
      }
      const updatedChats = [...s.chats];
      const chat = { ...updatedChats[chatIndex] };
      chat.messages = [...chat.messages, optimisticMsg];
      chat.lastMessage = text;
      chat.lastMessageTime = now;
      updatedChats.splice(chatIndex, 1);
      const newChats = [chat, ...updatedChats];
      return { chats: newChats, totalUnreadMessages: computeUnread(newChats) };
    });

    const userId = currentAccount.id;
    if (userId && userId !== GUEST_PLACEHOLDER.id) {
      void messagesService.sendMessage(userId, participantId, text);
    }
  },

  markChatAsRead: participantId => {
    set(s => {
      const updated = s.chats.map(c => (c.participantId === participantId ? { ...c, unreadCount: 0 } : c));
      return { chats: updated, totalUnreadMessages: computeUnread(updated) };
    });
    const { currentAccount } = useAuthStore.getState();
    if (currentAccount.id && currentAccount.id !== GUEST_PLACEHOLDER.id) {
      void messagesService.markAsRead(participantId, currentAccount.id);
    }
  },

  deleteMessage: async (messageId, participantId) => {
    const ok = await messagesService.deleteMessage(messageId);
    if (ok) {
      set(s => ({
        chats: s.chats.map(c => {
          if (c.participantId !== participantId) return c;
          return {
            ...c,
            messages: c.messages.map(m => (m.id === messageId ? { ...m, deletedAt: tsBR(), text: m.text } : m)),
          };
        }),
      }));
    }
    return ok;
  },

  toggleReaction: async (messageId, emoji, participantId) => {
    const { currentAccount } = useAuthStore.getState();
    const result = await messagesService.toggleReaction(messageId, emoji, currentAccount.id);
    if (result !== null) {
      set(s => ({
        chats: s.chats.map(c => {
          if (c.participantId !== participantId) return c;
          return {
            ...c,
            messages: c.messages.map(m => (m.id === messageId ? { ...m, reactions: result } : m)),
          };
        }),
      }));
    }
  },

  init: userId => {
    if (!userId || userId === GUEST_PLACEHOLDER.id) {
      set({ chats: [], onlineUsers: new Set(), activeChatParticipantId: null, totalUnreadMessages: 0 });
      return () => {};
    }

    const cleanups: (() => void)[] = [];

    // Carrega inbox (com cache 30s + circuit breaker)
    void withCircuitBreaker(
      'supabase-inbox',
      () => getCached(`inbox:${userId}`, () => messagesService.getInbox(userId), 30_000),
      [] as InboxEntry[],
    ).then(async (entries: InboxEntry[]) => {
      if (entries.length === 0) return;
      const partnerIds = entries.map(e => e.partnerId);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, nome, avatar_url')
        .in('id', partnerIds)
        .limit(1000);
      const profileMap = new Map<string, { nome: string; foto: string }>();
      if (profiles) {
        for (const p of profiles) {
          profileMap.set(p.id, { nome: p.nome, foto: p.avatar_url ?? '' });
        }
      }
      set(s => {
        const existingIds = new Set(s.chats.map(c => c.participantId));
        const newChats: Chat[] = [];
        for (const entry of entries) {
          if (existingIds.has(entry.partnerId)) continue;
          const pf = profileMap.get(entry.partnerId);
          newChats.push({
            id: entry.partnerId,
            participantId: entry.partnerId,
            participantNome: pf?.nome ?? entry.partnerNome,
            participantFoto: pf?.foto ?? entry.partnerFoto,
            lastMessage: entry.lastText,
            lastMessageTime: entry.lastTs,
            unreadCount: entry.unreadCount,
            messages: [],
          });
        }
        if (newChats.length === 0) return {};
        const all = [...s.chats, ...newChats];
        return { chats: all, totalUnreadMessages: computeUnread(all) };
      });
    });

    // Inbox realtime
    const unsubInbox = messagesService.subscribeToInbox(userId, msg => {
      const partnerId = msg.senderId;
      const { activeChatParticipantId } = get();
      const isActive = activeChatParticipantId === partnerId;

      set(s => {
        const idx = s.chats.findIndex(c => c.participantId === partnerId);
        if (idx >= 0) {
          const updated = [...s.chats];
          const chat = { ...updated[idx] };
          if (!isActive) {
            chat.unreadCount = chat.unreadCount + 1;
          }
          chat.lastMessage = msg.text;
          chat.lastMessageTime = msg.timestamp;
          updated.splice(idx, 1);
          const all = [chat, ...updated];
          return { chats: all, totalUnreadMessages: computeUnread(all) };
        }
        const newChat: Chat = {
          id: partnerId,
          participantId: partnerId,
          lastMessage: msg.text,
          lastMessageTime: msg.timestamp,
          unreadCount: isActive ? 0 : 1,
          messages: [],
        };
        const all = [newChat, ...s.chats];
        return { chats: all, totalUnreadMessages: computeUnread(all) };
      });

      // Notificação agrupada (in-app + push) — só se chat não está aberto
      if (!isActive) {
        void createMessageNotification(partnerId, msg.text, get());
      }
    });
    cleanups.push(unsubInbox);

    // Presence
    void messagesService.updateLastSeen(userId);
    const presenceInterval = setInterval(() => {
      void messagesService.updateLastSeen(userId);
    }, 60_000);
    const unsubPresence = messagesService.subscribeToPresence(userId, online => set({ onlineUsers: online }));
    cleanups.push(() => {
      clearInterval(presenceInterval);
      unsubPresence();
    });

    return () => {
      for (const fn of cleanups) fn();
    };
  },
}));

/**
 * Debounce por remetente: acumula mensagens e cria/atualiza notificação após 2s de silêncio.
 */
const msgAccum = new Map<string, { count: number; lastText: string; timer: ReturnType<typeof setTimeout> }>();

function createMessageNotification(partnerId: string, text: string, state: ChatState) {
  const chat = state.chats.find(c => c.participantId === partnerId);
  const senderName = chat?.participantNome ?? 'Alguém';

  const prev = msgAccum.get(partnerId);
  if (prev) {
    clearTimeout(prev.timer);
    prev.count += 1;
    prev.lastText = text;
    prev.timer = setTimeout(() => flushNotification(partnerId, senderName), 2000);
  } else {
    msgAccum.set(partnerId, {
      count: 1,
      lastText: text,
      timer: setTimeout(() => flushNotification(partnerId, senderName), 2000),
    });
  }
}

async function flushNotification(partnerId: string, senderName: string) {
  const accum = msgAccum.get(partnerId);
  if (!accum) return;
  msgAccum.delete(partnerId);

  const preview = accum.lastText.length > 50 ? accum.lastText.slice(0, 47) + '...' : accum.lastText;

  // Verificar se já existe notificação agrupada não lida do mesmo remetente
  const existing = notificationsService
    .getAll()
    .find(n => n.tipo === 'MENSAGEM_NOVA' && n.link === partnerId && !n.lida);

  if (existing) {
    // Incrementar contador
    const match = existing.titulo.match(/\((\d+)\)$/);
    const prevCount = match ? parseInt(match[1]) : 1;
    const total = prevCount + accum.count;
    const titulo = `Nova mensagem de ${senderName} (${total})`;
    await supabase
      .from('notifications')
      .update({ titulo, mensagem: preview, created_at: tsBR() })
      .eq('id', existing.id);
    void notificationsService.refresh().then(() => {
      useAuthStore.setState({
        notifications: notificationsService.getAll(),
        unreadNotifications: notificationsService.getUnreadCount(),
      });
    });
  } else {
    const titulo =
      accum.count > 1 ? `Nova mensagem de ${senderName} (${accum.count})` : `Nova mensagem de ${senderName}`;
    await notificationsService.add({
      titulo,
      mensagem: preview,
      tipo: 'MENSAGEM_NOVA',
      lida: false,
      link: partnerId,
      timestamp: '',
    });
    useAuthStore.setState({
      notifications: notificationsService.getAll(),
      unreadNotifications: notificationsService.getUnreadCount(),
    });

    // Push FCM (fire-and-forget, sem email)
    const currentUserId = useAuthStore.getState().currentAccount.id;
    supabase.functions
      .invoke('send-push', {
        body: {
          userIds: [currentUserId],
          title: titulo,
          body: preview,
          data: { link: partnerId, tipo: 'MENSAGEM_NOVA' },
        },
      })
      .catch(() => {});
  }
}
