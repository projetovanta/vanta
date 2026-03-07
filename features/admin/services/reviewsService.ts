/**
 * reviewsService — Reviews de eventos via Supabase.
 */

import { ReviewEvento } from '../../../types';
import { supabase } from '../../../services/supabaseClient';
import type { Database } from '../../../types/supabase';

type ReviewRow = Database['public']['Tables']['reviews_evento']['Row'];

const rowToReview = (r: ReviewRow): ReviewEvento => ({
  id: r.id,
  eventoId: r.evento_id,
  userId: r.user_id,
  rating: r.rating,
  comentario: r.comentario ?? undefined,
  criadoEm: r.created_at ?? '',
});

export const reviewsService = {
  /** Lista reviews de um evento */
  async getByEvento(eventoId: string): Promise<ReviewEvento[]> {
    const { data, error } = await supabase
      .from('reviews_evento')
      .select('*')
      .eq('evento_id', eventoId)
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) {
      console.error('[reviewsService] getByEvento erro:', error);
      return [];
    }
    return (data ?? []).map(r => rowToReview(r));
  },

  /** Média e contagem de um evento */
  async getMediaEvento(eventoId: string): Promise<{ media: number; count: number }> {
    const { data, error } = await supabase
      .from('reviews_evento')
      .select('rating')
      .eq('evento_id', eventoId)
      .limit(2000);

    if (error || !data || data.length === 0) {
      return { media: 0, count: 0 };
    }
    const ratings = data.map((r: Record<string, unknown>) => Number(r.rating));
    const soma = ratings.reduce((a, b) => a + b, 0);
    return { media: Math.round((soma / ratings.length) * 10) / 10, count: ratings.length };
  },

  /** Submeter review (upsert — atualiza se já existir) */
  async submit(eventoId: string, userId: string, rating: number, comentario?: string): Promise<boolean> {
    const { error } = await supabase.from('reviews_evento').upsert(
      {
        evento_id: eventoId,
        user_id: userId,
        rating,
        comentario: comentario || null,
      },
      { onConflict: 'evento_id,user_id' },
    );

    if (error) {
      console.error('[reviewsService] submit erro:', error);
      return false;
    }
    return true;
  },

  /** Média e contagem de todos os eventos de uma comunidade */
  async getMediaComunidade(comunidadeId: string): Promise<{ media: number; count: number }> {
    const { data, error } = await supabase
      .from('reviews_evento')
      .select('rating, eventos_admin!inner ( comunidade_id )')
      .eq('eventos_admin.comunidade_id', comunidadeId)
      .limit(2000);

    if (error || !data || data.length === 0) {
      return { media: 0, count: 0 };
    }
    const ratings = data.map((r: Record<string, unknown>) => Number(r.rating));
    const soma = ratings.reduce((a, b) => a + b, 0);
    return { media: Math.round((soma / ratings.length) * 10) / 10, count: ratings.length };
  },

  /** Verifica se o usuário já avaliou este evento */
  async getExisting(eventoId: string, userId: string): Promise<ReviewEvento | null> {
    const { data, error } = await supabase
      .from('reviews_evento')
      .select('*')
      .eq('evento_id', eventoId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return null;
    return rowToReview(data);
  },
};
