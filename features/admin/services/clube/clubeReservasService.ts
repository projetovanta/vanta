import type { ReservaMaisVanta } from '../../../../types';
import { supabase } from '../../../../services/supabaseClient';
import { tsBR } from '../../../../utils';
import { _lotes, _reservas, bump, rowToReserva } from './clubeCache';
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
  await supabase.from('lotes_mais_vanta').update({ reservados: lote.reservados }).eq('id', loteId);

  const reserva = rowToReserva(data);
  _reservas.unshift(reserva);
  bump();
  return reserva;
}

export async function cancelarReserva(reservaId: string): Promise<boolean> {
  const idx = _reservas.findIndex(r => r.id === reservaId);
  if (idx < 0) return false;
  const reserva = _reservas[idx];
  if (reserva.status === 'CANCELADO') return false;

  await supabase.from('reservas_mais_vanta').update({ status: 'CANCELADO' }).eq('id', reservaId);

  const lote = _lotes.find(l => l.id === reserva.loteMaisVantaId);
  if (lote) {
    lote.reservados = Math.max(0, lote.reservados - 1);
    await supabase.from('lotes_mais_vanta').update({ reservados: lote.reservados }).eq('id', lote.id);
  }

  reserva.status = 'CANCELADO';
  bump();
  return true;
}

export async function confirmarPost(reservaId: string, postUrl: string): Promise<void> {
  await supabase.from('reservas_mais_vanta').update({ post_url: postUrl, status: 'PENDENTE_POST' }).eq('id', reservaId);
  const reserva = _reservas.find(r => r.id === reservaId);
  if (reserva) {
    reserva.postUrl = postUrl;
    reserva.status = 'PENDENTE_POST';
  }
  bump();
}

export async function verificarPost(reservaId: string, _masterId: string): Promise<void> {
  await supabase.from('reservas_mais_vanta').update({ post_verificado: true, status: 'USADO' }).eq('id', reservaId);
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
