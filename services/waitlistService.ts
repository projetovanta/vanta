/**
 * waitlistService — Lista de espera quando variação esgota.
 */

import { supabase } from './supabaseClient';

import { tsBR } from '../utils';

class WaitlistService {
  /** Registra interesse na fila */
  async entrar(eventoId: string, variacaoId: string, email: string, userId?: string): Promise<boolean> {
    const { error } = await supabase.from('waitlist').upsert(
      {
        evento_id: eventoId,
        variacao_id: variacaoId,
        email: email.trim().toLowerCase(),
        user_id: userId || null,
      },
      { onConflict: 'evento_id,variacao_id,email' },
    );
    if (error) {
      console.error('[waitlistService] entrar erro:', error);
      return false;
    }
    return true;
  }

  /** Verifica se email já está na fila de uma variação */
  async jaInscrito(eventoId: string, variacaoId: string, email: string): Promise<boolean> {
    const { count } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
      .eq('evento_id', eventoId)
      .eq('variacao_id', variacaoId)
      .eq('email', email.trim().toLowerCase());
    return (count ?? 0) > 0;
  }

  /** Contagem de inscritos por variação (para admin) */
  async getContagem(eventoId: string): Promise<Record<string, number>> {
    const { data, error } = await supabase.from('waitlist').select('variacao_id').eq('evento_id', eventoId).limit(2000);
    if (error) console.error('[waitlistService.getContagem]', error.message);

    const result: Record<string, number> = {};
    if (!data) return result;
    for (const row of data) {
      const vid = row.variacao_id as string;
      result[vid] = (result[vid] ?? 0) + 1;
    }
    return result;
  }

  /** Notifica os próximos N da fila quando vaga abre */
  async notificarProximos(eventoId: string, variacaoId: string, vagas: number): Promise<number> {
    const { data } = await supabase
      .from('waitlist')
      .select('id, user_id, email')
      .eq('evento_id', eventoId)
      .eq('variacao_id', variacaoId)
      .is('notificado_em', null)
      .order('created_at', { ascending: true })
      .limit(vagas);

    if (!data || data.length === 0) return 0;

    // Buscar nome do evento para a notificação
    const { data: evRow } = await supabase.from('eventos_admin').select('nome').eq('id', eventoId).maybeSingle();
    const eventoNome = (evRow?.nome as string) ?? '';

    const { notificationsService } = await import('../features/admin/services/notificationsService');
    let notificados = 0;

    for (const row of data) {
      const userId = row.user_id as string | null;
      if (userId) {
        void notificationsService.add(
          {
            tipo: 'SISTEMA',
            titulo: 'Vaga disponível!',
            mensagem: `Uma vaga abriu para "${eventoNome}". Garanta seu ingresso agora!`,
            link: eventoId,
            lida: false,
            timestamp: tsBR(),
          },
          userId,
        );
      }

      // Marca como notificado
      const { error: errWl } = await supabase.from('waitlist').update({ notificado_em: tsBR() }).eq('id', row.id);
      if (errWl) console.error('[waitlistService] notificar update:', errWl);

      notificados++;
    }

    return notificados;
  }

  /** Remove da fila (quando comprou) */
  async remover(eventoId: string, variacaoId: string, email: string): Promise<void> {
    await supabase
      .from('waitlist')
      .delete()
      .eq('evento_id', eventoId)
      .eq('variacao_id', variacaoId)
      .eq('email', email.trim().toLowerCase());
  }
}

export const waitlistService = new WaitlistService();
