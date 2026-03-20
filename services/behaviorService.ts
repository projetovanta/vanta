import { supabase } from './supabaseClient';
import type { Evento } from '../types';
import type { Json } from '../types/supabase';

type ActionType = 'VIEW' | 'PURCHASE' | 'FAVORITE' | 'DWELL';

async function track(
  userId: string,
  eventId: string,
  actionType: ActionType,
  metadata?: { [key: string]: Json | undefined },
) {
  const { error } = await supabase.from('user_behavior').insert({
    user_id: userId,
    event_id: eventId,
    action_type: actionType,
    metadata: (metadata ?? {}) as Json,
  });
  if (error) console.warn('[behaviorService] track error:', error.message);
}

export const behaviorService = {
  trackView(userId: string, eventId: string) {
    return track(userId, eventId, 'VIEW');
  },

  trackPurchase(userId: string, eventId: string) {
    return track(userId, eventId, 'PURCHASE');
  },

  trackFavorite(userId: string, eventId: string) {
    return track(userId, eventId, 'FAVORITE');
  },

  trackDwell(userId: string, eventId: string, seconds: number) {
    return track(userId, eventId, 'DWELL', { dwell_seconds: seconds });
  },

  async getRecomendados(userId: string, cidade: string, limit = 20): Promise<Evento[]> {
    const { data, error } = await supabase.rpc('eventos_recomendados_behavior', {
      p_user_id: userId,
      p_cidade: cidade,
      p_limit: limit,
    });
    if (error) {
      console.warn('[behaviorService] getRecomendados error:', error.message);
      return [];
    }
    return (data ?? []) as unknown as Evento[];
  },
};
