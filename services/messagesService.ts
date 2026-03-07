/**
 * messagesService — mensagens 1:1 via Supabase Realtime.
 *
 * Tabela: messages
 *   id           uuid PK
 *   sender_id    uuid (profiles.id)
 *   recipient_id uuid (profiles.id)
 *   text         text NOT NULL
 *   created_at   timestamptz DEFAULT now()
 *   is_read      boolean DEFAULT false
 *   read_at      timestamptz
 *   deleted_at   timestamptz
 *   reactions    jsonb DEFAULT '[]'
 *
 * RLS:
 *   SELECT: sender_id = auth.uid() OR recipient_id = auth.uid()
 *   INSERT: sender_id = auth.uid()
 *   UPDATE: sender_id = auth.uid() OR recipient_id = auth.uid()
 */

import { supabase } from './supabaseClient';
import { realtimeManager } from './realtimeManager';
import { Mensagem } from '../types';

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Canal único para um par de usuários (ordem alfabética garante simetria). */
const channelKey = (a: string, b: string) => `messages:${[a, b].sort().join('-')}`;

import { tsBR } from '../utils';
import { notify } from './notifyService';

// ── Tipos internos ─────────────────────────────────────────────────────────

interface DbMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  text: string;
  created_at: string;
  is_read: boolean;
  read_at: string | null;
  deleted_at: string | null;
  reactions: Array<{ emoji: string; userId: string }>;
}

const dbToMensagem = (row: DbMessage): Mensagem => ({
  id: row.id,
  senderId: row.sender_id,
  text: row.text,
  timestamp: row.created_at,
  isRead: row.is_read,
  readAt: row.read_at ?? undefined,
  deletedAt: row.deleted_at ?? undefined,
  reactions: row.reactions ?? [],
});

// ── Inbox types ─────────────────────────────────────────────────────────────

export interface InboxEntry {
  partnerId: string;
  partnerNome?: string;
  partnerFoto?: string;
  lastText: string;
  lastTs: string;
  unreadCount: number;
}

// ── API pública ─────────────────────────────────────────────────────────────

export const messagesService = {
  /**
   * Envia uma mensagem para um destinatário.
   * Retorna a mensagem inserida ou null em caso de erro.
   */
  sendMessage: async (senderId: string, recipientId: string, text: string): Promise<Mensagem | null> => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({ sender_id: senderId, recipient_id: recipientId, text })
        .select()
        .single();

      if (error || !data) {
        console.error('[MSG] sendMessage error:', error?.message);
        return null;
      }

      // Push para destinatário offline (fire-and-forget — só push, sem in-app)
      void notify({
        userId: recipientId,
        titulo: 'Nova mensagem',
        mensagem: text.length > 80 ? text.slice(0, 80) + '...' : text,
        tipo: 'SISTEMA',
        link: senderId,
      });

      return dbToMensagem(data as DbMessage);
    } catch {
      return null;
    }
  },

  /**
   * Carrega o histórico de mensagens entre dois usuários.
   * Ordena por created_at ASC (mais antigas primeiro).
   */
  getHistory: async (userId: string, participantId: string, limit = 50): Promise<Mensagem[]> => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${userId},recipient_id.eq.${participantId}),` +
            `and(sender_id.eq.${participantId},recipient_id.eq.${userId})`,
        )
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error || !data) return [];
      return (data as DbMessage[]).map(dbToMensagem);
    } catch {
      return [];
    }
  },

  /**
   * Busca as últimas 200 mensagens do usuário para montar o inbox.
   * Agrupa por parceiro no client-side.
   */
  getInbox: async (userId: string): Promise<InboxEntry[]> => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(200);

      if (error || !data) return [];

      const rows = data as DbMessage[];
      const map = new Map<string, InboxEntry>();

      for (const row of rows) {
        const partnerId = row.sender_id === userId ? row.recipient_id : row.sender_id;
        if (!map.has(partnerId)) {
          map.set(partnerId, {
            partnerId,
            lastText: row.text,
            lastTs: row.created_at,
            unreadCount: 0,
          });
        }
        // Conta unread (mensagens recebidas não lidas)
        if (row.recipient_id === userId && !row.is_read) {
          const entry = map.get(partnerId)!;
          entry.unreadCount++;
        }
      }

      return Array.from(map.values());
    } catch {
      return [];
    }
  },

  /**
   * Marca todas as mensagens recebidas de um remetente como lidas.
   * Atualiza is_read e read_at.
   */
  markAsRead: async (senderId: string, recipientId: string): Promise<void> => {
    try {
      await supabase
        .from('messages')
        .update({ is_read: true, read_at: tsBR() })
        .eq('sender_id', senderId)
        .eq('recipient_id', recipientId)
        .eq('is_read', false);
    } catch {
      // silencioso — não crítico
    }
  },

  /**
   * Soft delete: marca deleted_at na mensagem.
   * Só funciona se sender_id = auth.uid() (RLS).
   * Limite de 15 minutos é validado no client.
   */
  deleteMessage: async (messageId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('messages').update({ deleted_at: tsBR() }).eq('id', messageId);

      if (error) {
        console.error('[MSG] deleteMessage error:', error.message);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Toggle de reaction (emoji) em uma mensagem.
   * Busca reactions atual, adiciona ou remove, e faz UPDATE.
   */
  toggleReaction: async (
    messageId: string,
    emoji: string,
    userId: string,
  ): Promise<Array<{ emoji: string; userId: string }> | null> => {
    try {
      // Busca reactions atual
      const { data, error } = await supabase.from('messages').select('reactions').eq('id', messageId).single();

      if (error || !data) return null;

      const reactions: Array<{ emoji: string; userId: string }> =
        (data.reactions as unknown as Array<{ emoji: string; userId: string }>) ?? [];
      const existingIdx = reactions.findIndex(r => r.emoji === emoji && r.userId === userId);

      if (existingIdx >= 0) {
        reactions.splice(existingIdx, 1);
      } else {
        reactions.push({ emoji, userId });
      }

      const { error: updateError } = await supabase.from('messages').update({ reactions }).eq('id', messageId);

      if (updateError) return null;
      return reactions;
    } catch {
      return null;
    }
  },

  /**
   * Inscreve em mensagens recebidas de participantId para userId em realtime.
   * Escuta INSERT e UPDATE (reactions, delete, read).
   * Retorna unsubscribe.
   */
  subscribeToChat: (
    userId: string,
    participantId: string,
    onInsert: (msg: Mensagem) => void,
    onUpdate?: (msg: Mensagem) => void,
  ): (() => void) => {
    return realtimeManager.subscribe(channelKey(userId, participantId), channel => {
      channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `sender_id=eq.${participantId}`,
          },
          payload => {
            const row = payload.new as DbMessage;
            if (row.recipient_id === userId) {
              onInsert(dbToMensagem(row));
            }
          },
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
          },
          payload => {
            const row = payload.new as DbMessage;
            if (
              (row.sender_id === userId && row.recipient_id === participantId) ||
              (row.sender_id === participantId && row.recipient_id === userId)
            ) {
              onUpdate?.(dbToMensagem(row));
            }
          },
        );
    });
  },

  /**
   * Canal global de inbox: escuta INSERT de mensagens recebidas pelo userId.
   * Usado para atualizar badge/inbox sem estar no chat.
   */
  subscribeToInbox: (userId: string, onMessage: (msg: Mensagem) => void): (() => void) => {
    return realtimeManager.subscribe(`inbox:${userId}`, channel => {
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId}`,
        },
        payload => {
          const row = payload.new as DbMessage;
          onMessage(dbToMensagem(row));
        },
      );
    });
  },

  /**
   * Atualiza last_seen do usuário no profiles.
   */
  updateLastSeen: async (userId: string): Promise<void> => {
    try {
      await supabase.from('profiles').update({ last_seen: tsBR() }).eq('id', userId);
    } catch {
      // silencioso
    }
  },

  /**
   * Supabase Presence: canal global de usuários online.
   * Retorna unsubscribe.
   */
  subscribeToPresence: (userId: string, onChange: (onlineIds: Set<string>) => void): (() => void) => {
    return realtimeManager.subscribe(
      'presence:online',
      channel => {
        channel.on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const ids = new Set<string>(Object.keys(state));
          onChange(ids);
        });
        channel.subscribe(async status => {
          if (status === 'SUBSCRIBED') {
            await channel.track({ user_id: userId, online_at: tsBR() });
          }
        });
        return true; // skip auto-subscribe (already called above)
      },
      { config: { presence: { key: userId } } },
    );
  },
};
