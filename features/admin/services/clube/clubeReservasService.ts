/**
 * clubeReservasService — Resgates MV de evento.
 * Usa tabela resgates_mv_evento (substitui reservas_mais_vanta dropada).
 */
import { supabase } from '../../../../services/supabaseClient';
import type { Database } from '../../../../types/supabase';

type ResgateMVEvento = Database['public']['Tables']['resgates_mv_evento']['Row'];

export interface ResgateMV {
  id: string;
  beneficioId: string;
  eventoId: string;
  userId: string;
  status: 'RESGATADO' | 'USADO' | 'PENDENTE_POST' | 'NO_SHOW' | 'CANCELADO';
  postVerificado: boolean;
  postUrl?: string;
  postDeadlineEm?: string;
  resgatadoEm: string;
}

const rowToResgate = (r: ResgateMVEvento): ResgateMV => ({
  id: r.id,
  beneficioId: r.beneficio_id,
  eventoId: r.evento_id,
  userId: r.user_id,
  status: r.status as ResgateMV['status'],
  postVerificado: r.post_verificado,
  postUrl: r.post_url ?? undefined,
  postDeadlineEm: r.post_deadline_em ?? undefined,
  resgatadoEm: r.resgatado_em,
});

/** Resgatar benefício MV de evento */
export async function resgatarBeneficio(
  beneficioId: string,
  eventoId: string,
  userId: string,
): Promise<ResgateMV | null> {
  // Verificar vagas disponíveis antes de resgatar
  const { data: config } = await supabase
    .from('mais_vanta_config_evento')
    .select('vagas_limite, vagas_resgatadas')
    .eq('id', beneficioId)
    .maybeSingle();
  if (config?.vagas_limite != null && config.vagas_limite > 0) {
    if ((config.vagas_resgatadas ?? 0) >= config.vagas_limite) {
      console.error('[clubeReservas] resgatarBeneficio: vagas esgotadas');
      return null;
    }
  }
  const { data, error } = await supabase
    .from('resgates_mv_evento')
    .insert({ beneficio_id: beneficioId, evento_id: eventoId, user_id: userId })
    .select('*')
    .single();
  if (error) {
    console.error('[clubeReservas] resgatarBeneficio:', error.message);
    return null;
  }
  // Incrementar vagas_resgatadas
  await supabase
    .from('mais_vanta_config_evento')
    .update({ vagas_resgatadas: (config?.vagas_resgatadas ?? 0) + 1 })
    .eq('id', beneficioId);
  return rowToResgate(data);
}

/** Buscar resgate do usuário num benefício específico */
export async function getResgate(beneficioId: string, userId: string): Promise<ResgateMV | null> {
  const { data } = await supabase
    .from('resgates_mv_evento')
    .select('*')
    .eq('beneficio_id', beneficioId)
    .eq('user_id', userId)
    .maybeSingle();
  return data ? rowToResgate(data) : null;
}

/** Resgates do usuário (todos os eventos) */
export async function getResgatesUsuario(userId: string): Promise<ResgateMV[]> {
  const { data } = await supabase
    .from('resgates_mv_evento')
    .select('*')
    .eq('user_id', userId)
    .order('resgatado_em', { ascending: false });
  return (data ?? []).map(rowToResgate);
}

/** Resgates de um evento (admin) */
export async function getResgatesEvento(eventoId: string): Promise<ResgateMV[]> {
  const { data } = await supabase
    .from('resgates_mv_evento')
    .select('*')
    .eq('evento_id', eventoId)
    .order('resgatado_em', { ascending: false });
  return (data ?? []).map(rowToResgate);
}

/** Cancelar resgate */
export async function cancelarResgate(resgateId: string): Promise<boolean> {
  const now = new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00';
  const { error } = await supabase
    .from('resgates_mv_evento')
    .update({ status: 'CANCELADO', cancelado_em: now })
    .eq('id', resgateId);
  return !error;
}

/** Resgates pendentes de post (admin) */
export async function getResgatesPendentePost(): Promise<ResgateMV[]> {
  const { data } = await supabase
    .from('resgates_mv_evento')
    .select('*')
    .eq('status', 'PENDENTE_POST')
    .eq('post_verificado', false);
  return (data ?? []).map(rowToResgate);
}

/** Membro envia link do post (sem marcar como verificado) */
export async function enviarPostUrl(resgateId: string, postUrl: string): Promise<void> {
  await supabase
    .from('resgates_mv_evento')
    .update({ post_url: postUrl, status: 'PENDENTE_POST' } as never)
    .eq('id', resgateId);
}

/** Verificar post de resgate (admin) */
export async function verificarPost(resgateId: string, postUrl: string): Promise<void> {
  await supabase.from('resgates_mv_evento').update({ post_verificado: true, post_url: postUrl }).eq('id', resgateId);
}
