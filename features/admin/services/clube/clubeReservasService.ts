import type { ReservaMaisVanta } from '../../../../types';
import { supabase } from '../../../../services/supabaseClient';
import { tsBR } from '../../../../utils';
import { _lotes, _membros, _reservas, bump, rowToReserva } from './clubeCache';
import { getTier, tierSuficiente } from './clubeMembrosService';
import { getTierOrdem } from './clubeTiersService';
import { estaBloqueado, temDividaSocial } from './clubeInfracoesService';

export function getReservasUsuario(userId: string): ReservaMaisVanta[] {
  return _reservas.filter(r => r.userId === userId);
}

export function getReservasEvento(eventoId: string): ReservaMaisVanta[] {
  return _reservas.filter(r => r.eventoId === eventoId);
}

export function getReservasPendentePost(): ReservaMaisVanta[] {
  return _reservas.filter(r => r.status === 'PENDENTE_POST' || (r.status === 'RESERVADO' && !r.postVerificado));
}

export async function reservar(loteId: string, eventoId: string, userId: string): Promise<ReservaMaisVanta | null> {
  const lote = _lotes.find(l => l.id === loteId);
  if (!lote || lote.eventoId !== eventoId) return null;
  if (lote.reservados >= lote.quantidade) return null;
  if (lote.tierId) {
    const userTier = getTier(userId);
    if (userTier !== lote.tierId) return null;
  } else {
    if (!tierSuficiente(userId, lote.tierMinimo)) return null;
  }

  if (temDividaSocial(userId)) return null;
  if (estaBloqueado(userId)) return null;

  const jaReservou = _reservas.some(r => r.eventoId === eventoId && r.userId === userId && r.status !== 'CANCELADO');
  if (jaReservou) return null;

  const row = {
    lote_mais_vanta_id: loteId,
    evento_id: eventoId,
    user_id: userId,
    reservado_em: tsBR(),
    status: 'RESERVADO',
  };
  const { data, error } = await supabase.from('reservas_mais_vanta').insert(row).select().single();
  if (error) return null;

  lote.reservados++;
  const { error: errLote } = await supabase
    .from('lotes_mais_vanta')
    .update({ reservados: lote.reservados })
    .eq('id', loteId);
  if (errLote) console.error('[clubeReservas] criarReserva lote update:', errLote);

  const reserva = rowToReserva(data);
  _reservas.unshift(reserva);
  bump();

  // Notificação contextualizada por categoria
  const membro = _membros.get(userId);
  const cat = membro?.categoria ?? 'CONVIDADO';
  const temObrigacaoPost = cat === 'CREATOR' || cat === 'VANTA_BLACK';

  // Buscar nome do evento para a notificação
  const { data: evData } = await supabase.from('eventos_admin').select('nome').eq('id', eventoId).maybeSingle();
  const nomeEvento = (evData as { nome: string } | null)?.nome ?? 'evento';

  const titulo = `Reserva confirmada — ${nomeEvento}`;
  const corpo = temObrigacaoPost
    ? `Lembre: você precisa postar com @maisvanta e #Publi após o evento.`
    : `Sua presença foi confirmada. Não esqueça de passar pela portaria para fazer check-in.`;

  try {
    await supabase.from('notifications').insert({
      user_id: userId,
      tipo: 'MV_LEMBRETE_RESERVA',
      titulo,
      mensagem: corpo,
      link: `/evento/${eventoId}`,
    });
  } catch (_e) {
    // Não bloquear a reserva por falha em notificação
  }

  return reserva;
}

export async function cancelarReserva(reservaId: string): Promise<boolean> {
  const idx = _reservas.findIndex(r => r.id === reservaId);
  if (idx < 0) return false;
  const reserva = _reservas[idx];
  if (reserva.status === 'CANCELADO') return false;

  const { error: errCancel } = await supabase
    .from('reservas_mais_vanta')
    .update({ status: 'CANCELADO' })
    .eq('id', reservaId);
  if (errCancel) {
    console.error('[clubeReservas] cancelarReserva:', errCancel);
    return false;
  }

  const lote = _lotes.find(l => l.id === reserva.loteMaisVantaId);
  if (lote) {
    lote.reservados = Math.max(0, lote.reservados - 1);
    const { error: errLote2 } = await supabase
      .from('lotes_mais_vanta')
      .update({ reservados: lote.reservados })
      .eq('id', lote.id);
    if (errLote2) console.error('[clubeReservas] cancelar lote update:', errLote2);
  }

  reserva.status = 'CANCELADO';
  bump();
  return true;
}

export async function confirmarPost(
  reservaId: string,
  postUrl: string,
): Promise<{ verified: boolean; reason?: string; missing?: string[] }> {
  // 1. Salvar link na reserva
  const { error } = await supabase
    .from('reservas_mais_vanta')
    .update({ post_url: postUrl, status: 'PENDENTE_POST' })
    .eq('id', reservaId);
  if (error) console.error('[clubeReservas] confirmarPost:', error);

  const reserva = _reservas.find(r => r.id === reservaId);
  if (reserva) {
    reserva.postUrl = postUrl;
    reserva.status = 'PENDENTE_POST';
  }

  // 2. Chamar verificação automática via edge function
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      const res = await supabase.functions.invoke('verify-instagram-post', {
        body: { reservaId, postUrl },
      });
      const result = res.data as {
        verified?: boolean;
        reason?: string;
        missing?: string[];
        placeholder?: boolean;
      } | null;

      if (result?.verified) {
        // Edge function já marcou post_verificado = true no banco
        if (reserva) {
          reserva.postVerificado = true;
        }
        bump();
        return { verified: true };
      }

      // Se placeholder (Meta API não configurada), manter como pendente
      if (result?.placeholder) {
        bump();
        return { verified: false, reason: 'Verificação manual pendente' };
      }

      bump();
      return { verified: false, reason: result?.reason, missing: result?.missing };
    }
  } catch (e) {
    console.error('[clubeReservas] verify-instagram-post:', e);
  }

  bump();
  return { verified: false, reason: 'Verificação pendente' };
}

export async function verificarPost(reservaId: string, _masterId: string): Promise<void> {
  const { error } = await supabase
    .from('reservas_mais_vanta')
    .update({ post_verificado: true, status: 'USADO' })
    .eq('id', reservaId);
  if (error) console.error('[clubeReservas] verificarPost:', error);
  const reserva = _reservas.find(r => r.id === reservaId);
  if (reserva) {
    reserva.postVerificado = true;
    reserva.status = 'USADO';
  }
  bump();
}

export function getEventosComBeneficio(userId: string): string[] {
  const tier = getTier(userId);
  if (!tier) return [];
  const eventoIds = new Set<string>();
  for (const l of _lotes) {
    if (l.reservados >= l.quantidade) continue;
    if (l.tierId) {
      if (l.tierId === tier) eventoIds.add(l.eventoId);
    } else {
      if (getTierOrdem(tier) >= getTierOrdem(l.tierMinimo)) eventoIds.add(l.eventoId);
    }
  }
  return Array.from(eventoIds);
}

export function temBeneficio(eventoId: string): boolean {
  return _lotes.some(l => l.eventoId === eventoId && l.reservados < l.quantidade);
}
