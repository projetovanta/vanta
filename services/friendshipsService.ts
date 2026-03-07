/**
 * friendshipsService — amizades 1:1 via Supabase.
 *
 * Tabela: friendships
 *   id            uuid PK
 *   requester_id  uuid (profiles.id)
 *   addressee_id  uuid (profiles.id)
 *   status        text ('PENDING' | 'ACCEPTED')
 *   created_at    timestamptz
 *   updated_at    timestamptz
 *
 * Modelo: PENDING = pedido enviado. ACCEPTED = amigos. DELETE row = cancelar/recusar/remover.
 */

import { supabase } from './supabaseClient';
import { realtimeManager } from './realtimeManager';

import { tsBR } from '../utils';
import type { FriendshipStatus } from '../types';

// ── Tipos internos ─────────────────────────────────────────────────────────

interface DbFriendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'PENDING' | 'ACCEPTED';
  created_at: string;
  updated_at: string;
}

// ── API pública ─────────────────────────────────────────────────────────────

export const friendshipsService = {
  /**
   * Carrega mapa completo de amizades do usuário.
   * Retorna Record<otherUserId, FriendshipStatus>.
   */
  getAll: async (userId: string): Promise<Record<string, FriendshipStatus>> => {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select('*')
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
        .limit(2000);

      if (error || !data) return {};

      const map: Record<string, FriendshipStatus> = {};
      for (const row of data as DbFriendship[]) {
        if (row.status === 'ACCEPTED') {
          const otherId = row.requester_id === userId ? row.addressee_id : row.requester_id;
          map[otherId] = 'FRIENDS';
        } else if (row.status === 'PENDING') {
          if (row.requester_id === userId) {
            map[row.addressee_id] = 'PENDING_SENT';
          } else {
            map[row.requester_id] = 'PENDING_RECEIVED';
          }
        }
      }
      return map;
    } catch {
      return {};
    }
  },

  /**
   * Envia pedido de amizade (INSERT PENDING).
   */
  request: async (requesterId: string, addresseeId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('friendships')
        .insert({ requester_id: requesterId, addressee_id: addresseeId });
      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Aceita pedido de amizade (UPDATE → ACCEPTED).
   * userId = addressee (quem recebeu o pedido).
   */
  accept: async (userId: string, requesterId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'ACCEPTED', updated_at: tsBR() })
        .eq('requester_id', requesterId)
        .eq('addressee_id', userId)
        .eq('status', 'PENDING');
      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Remove amizade / cancela pedido / recusa pedido (DELETE row).
   * Funciona para ambos os lados da relação.
   */
  remove: async (userId: string, otherId: string): Promise<boolean> => {
    try {
      // Tenta deletar em ambas as direções (só uma terá match)
      const { error: e1 } = await supabase
        .from('friendships')
        .delete()
        .eq('requester_id', userId)
        .eq('addressee_id', otherId);

      const { error: e2 } = await supabase
        .from('friendships')
        .delete()
        .eq('requester_id', otherId)
        .eq('addressee_id', userId);

      return !e1 && !e2;
    } catch {
      return false;
    }
  },

  /**
   * Subscribe a mudanças Realtime na tabela friendships para o userId.
   * Usa 2 channels (requester + addressee) pois Supabase não suporta OR em filters.
   * Retorna unsubscribe.
   */
  subscribe: (userId: string, onChange: () => void): (() => void) => {
    const unsub1 = realtimeManager.subscribe(`friendships:req:${userId}`, channel => {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'friendships', filter: `requester_id=eq.${userId}` },
        () => onChange(),
      );
    });

    const unsub2 = realtimeManager.subscribe(`friendships:addr:${userId}`, channel => {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'friendships', filter: `addressee_id=eq.${userId}` },
        () => onChange(),
      );
    });

    return () => {
      unsub1();
      unsub2();
    };
  },
};
