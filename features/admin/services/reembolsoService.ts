/**
 * reembolsoService — Reembolso de Ingressos com Auditoria Completa
 * CDC Art. 49: Automático até 7 dias + 48h antes do evento
 * Manual: Produtor solicita → PENDENTE_APROVACAO → Master aprova/rejeita
 * Auditoria: timestamps de notificação, aprovação, rejeição para comprovação legal
 */

import { supabase } from '../../../services/supabaseClient';
import type { Reembolso } from './eventosAdminTypes';

import { tsBR } from '../../../utils';

// ── Mapeador: snake_case (Supabase) → camelCase (TS) ─────────────────────
const mapReembolsoFromDB = (row: any): Reembolso => ({
  id: row.id,
  ticketId: row.ticket_id,
  eventoId: row.evento_id,
  tipo: row.tipo,
  status: row.status,
  motivo: row.motivo,
  valor: row.valor,
  solicitadoPor: row.solicitado_por,
  solicitadoEmail: row.solicitado_email,
  solicitadoNome: row.solicitado_nome,
  aprovadoPor: row.aprovado_por,
  solicitadoEm: row.solicitado_em,
  processadoEm: row.processado_em,
  eventoNome: row.evento_nome,
  produtorNome: row.produtor_nome,
});

// ── Constantes ───────────────────────────────────────────────────────────────────
const DIAS_DIREITO_ARREPENDIMENTO = 7;
const HORAS_ANTES_EVENTO = 48;

// ── Validar se ingresso pode ser reembolsado automaticamente ────────────────────
export async function podeReembolsoAutomatico(
  ticketId: string,
  eventoId: string,
): Promise<{ pode: boolean; motivo?: string }> {
  try {
    const { data: ticket, error: ticketErr } = await supabase
      .from('tickets_caixa')
      .select('emitido_em, status')
      .eq('id', ticketId)
      .single();

    if (ticketErr || !ticket) {
      return { pode: false, motivo: 'Ingresso não encontrado' };
    }

    if (ticket.status !== 'DISPONIVEL') {
      return { pode: false, motivo: `Ingresso com status ${ticket.status}` };
    }

    const { data: evento, error: eventoErr } = await supabase
      .from('eventos_admin')
      .select('data_inicio')
      .eq('id', eventoId)
      .single();

    if (eventoErr || !evento) {
      return { pode: false, motivo: 'Evento não encontrado' };
    }

    const agora = new Date();
    const dataCompra = new Date(ticket.emitido_em);
    const dataEvento = new Date(evento.data_inicio);

    const diasDesdeCompra = Math.floor((agora.getTime() - dataCompra.getTime()) / (1000 * 60 * 60 * 24));

    if (diasDesdeCompra > DIAS_DIREITO_ARREPENDIMENTO) {
      return { pode: false, motivo: 'Prazo de 7 dias expirou' };
    }

    const horasAteEvento = (dataEvento.getTime() - agora.getTime()) / (1000 * 60 * 60);
    if (horasAteEvento < HORAS_ANTES_EVENTO) {
      return { pode: false, motivo: 'Faltam menos de 48h para o evento' };
    }

    return { pode: true };
  } catch (err) {
    console.error('Erro ao validar reembolso automático:', err);
    return { pode: false, motivo: 'Erro interno' };
  }
}

// ── Solicitar reembolso automático (CDC Art. 49) ──────────────────────────────────
export async function solicitarReembolsoAutomatico(
  ticketId: string,
  eventoId: string,
  userId: string,
): Promise<{ success: boolean; error?: string; reembolsoId?: string }> {
  try {
    const { pode, motivo } = await podeReembolsoAutomatico(ticketId, eventoId);
    if (!pode) {
      return { success: false, error: motivo || 'Reembolso não permitido' };
    }

    const { data: ticket, error: ticketErr } = await supabase
      .from('tickets_caixa')
      .select('valor')
      .eq('id', ticketId)
      .single();

    if (ticketErr || !ticket) {
      return { success: false, error: 'Erro ao buscar ticket' };
    }

    const { data, error } = await supabase
      .from('reembolsos')
      .insert({
        ticket_id: ticketId,
        evento_id: eventoId,
        tipo: 'AUTOMATICO',
        status: 'APROVADO', // Automático vai direto pra APROVADO
        motivo: 'Reembolso automático CDC Art. 49',
        valor: ticket.valor,
        solicitado_por: userId,
        aprovado_por: userId, // Master (sistema) aprova automaticamente
        solicitado_em: tsBR(),
        processado_em: tsBR(),
      })
      .select('id')
      .single();

    if (error || !data) {
      return { success: false, error: 'Erro ao processar reembolso' };
    }

    return { success: true, reembolsoId: data.id };
  } catch (err) {
    console.error('Erro ao solicitar reembolso automático:', err);
    return { success: false, error: 'Erro interno' };
  }
}

// ── Solicitar reembolso manual (fora do prazo) → PENDENTE_APROVACAO ──────────────
// Produtor solicita, fica em fila para master aprovar/rejeitar
export async function solicitarReembolsoManual(
  ticketId: string,
  eventoId: string,
  motivo: string,
  userId: string,
): Promise<{ success: boolean; error?: string; reembolsoId?: string }> {
  try {
    const { data: ticket, error: ticketErr } = await supabase
      .from('tickets_caixa')
      .select('valor, status')
      .eq('id', ticketId)
      .single();

    if (ticketErr || !ticket) {
      return { success: false, error: 'Ingresso não encontrado' };
    }

    if (ticket.status !== 'DISPONIVEL') {
      return { success: false, error: `Ingresso com status ${ticket.status}` };
    }

    // Inserir com status PENDENTE_APROVACAO
    // Trigger dispara notificação para master + registra notificado_em timestamp
    const agora = new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00';
    const { data, error } = await supabase
      .from('reembolsos')
      .insert({
        ticket_id: ticketId,
        evento_id: eventoId,
        tipo: 'MANUAL',
        status: 'PENDENTE_APROVACAO',
        motivo: motivo || 'Reembolso manual solicitado',
        valor: ticket.valor,
        solicitado_por: userId,
        solicitado_em: agora,
        notificado_em: agora,
      })
      .select('id')
      .single();

    if (error || !data) {
      return { success: false, error: 'Erro ao processar reembolso' };
    }

    return { success: true, reembolsoId: data.id };
  } catch (err) {
    console.error('Erro ao solicitar reembolso manual:', err);
    return { success: false, error: 'Erro interno' };
  }
}

// ── Aprovar reembolso manual (master only) ───────────────────────────────────────
// Status: PENDENTE_APROVACAO → APROVADO
// Auditoria: aprovado_por + processado_em timestamp (trigger)
export async function aprovarReembolsoManual(
  reembolsoId: string,
  masterAdmId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: reembolso, error: reembolsoErr } = await supabase
      .from('reembolsos')
      .select('id, ticket_id, tipo, status')
      .eq('id', reembolsoId)
      .single();

    if (reembolsoErr || !reembolso) {
      return { success: false, error: 'Reembolso não encontrado' };
    }

    if (reembolso.tipo !== 'MANUAL') {
      return { success: false, error: 'Apenas reembolsos manuais podem ser aprovados' };
    }

    if (reembolso.status !== 'PENDENTE_APROVACAO') {
      return { success: false, error: `Reembolso com status ${reembolso.status}` };
    }

    // Trigger automático:
    // 1. Atualiza ticket_caixa.status = REEMBOLSADO
    // 2. Define processado_em = NOW()
    const agoraAprov =
      new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00';
    const { error: updateErr } = await supabase
      .from('reembolsos')
      .update({
        status: 'APROVADO',
        aprovado_por: masterAdmId,
        processado_em: agoraAprov,
      })
      .eq('id', reembolsoId);

    if (updateErr) {
      return { success: false, error: 'Erro ao atualizar reembolso' };
    }

    return { success: true };
  } catch (err) {
    console.error('Erro ao aprovar reembolso manual:', err);
    return { success: false, error: 'Erro interno' };
  }
}

// ── Rejeitar reembolso manual (master only) ──────────────────────────────────────
// Status: PENDENTE_APROVACAO → REJEITADO
// Auditoria: rejeitado_por + rejeitado_em + rejeitado_motivo (para comprovação legal)
export async function rejeitarReembolsoManual(
  reembolsoId: string,
  masterAdmId: string,
  motivo: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: reembolso, error: reembolsoErr } = await supabase
      .from('reembolsos')
      .select('id, tipo, status')
      .eq('id', reembolsoId)
      .single();

    if (reembolsoErr || !reembolso) {
      return { success: false, error: 'Reembolso não encontrado' };
    }

    if (reembolso.tipo !== 'MANUAL') {
      return { success: false, error: 'Apenas reembolsos manuais podem ser rejeitados' };
    }

    if (reembolso.status !== 'PENDENTE_APROVACAO') {
      return { success: false, error: `Reembolso com status ${reembolso.status}` };
    }

    // Registrar auditoria completa: quem rejeitou, quando, por quê
    const agoraRej = new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00';
    const { error: updateErr } = await supabase
      .from('reembolsos')
      .update({
        status: 'REJEITADO',
        rejeitado_por: masterAdmId,
        rejeitado_em: agoraRej,
        rejeitado_motivo: motivo || 'Rejeitado pelo master',
      })
      .eq('id', reembolsoId);

    if (updateErr) {
      return { success: false, error: 'Erro ao rejeitar reembolso' };
    }

    return { success: true };
  } catch (err) {
    console.error('Erro ao rejeitar reembolso manual:', err);
    return { success: false, error: 'Erro interno' };
  }
}

// ── Obter reembolsos de um evento ────────────────────────────────────────────────
export async function getReembolsosPorEvento(eventoId: string): Promise<Reembolso[]> {
  try {
    const { data, error } = await supabase
      .from('reembolsos')
      .select(
        `
        id,
        ticket_id,
        evento_id,
        tipo,
        status,
        motivo,
        valor,
        solicitado_por,
        aprovado_por,
        rejeitado_por,
        solicitado_em,
        notificado_em,
        processado_em,
        rejeitado_em,
        rejeitado_motivo
      `,
      )
      .eq('evento_id', eventoId)
      .order('solicitado_em', { ascending: false })
      .limit(1000);

    if (error) {
      console.error('Erro ao buscar reembolsos:', error);
      return [];
    }

    return (data || []).map(mapReembolsoFromDB);
  } catch (err) {
    console.error('Erro ao buscar reembolsos do evento:', err);
    return [];
  }
}

// ── Obter reembolsos manuais pendentes de aprovação ──────────────────────────────
export async function getReembolsosPendentes(): Promise<Reembolso[]> {
  try {
    const { data, error } = await supabase
      .from('reembolsos')
      .select(
        `
        id,
        ticket_id,
        evento_id,
        tipo,
        status,
        motivo,
        valor,
        solicitado_por,
        rejeitado_por,
        solicitado_em,
        notificado_em,
        profiles!solicitado_por (email),
        eventos_admin!evento_id (nome)
      `,
      )
      .eq('tipo', 'MANUAL')
      .eq('status', 'PENDENTE_APROVACAO')
      .order('solicitado_em', { ascending: true })
      .limit(1000);

    if (error) {
      console.error('Erro ao buscar reembolsos pendentes:', error);
      return [];
    }

    return (data || []).map(row => {
      const profiles = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      const evento = Array.isArray(row.eventos_admin) ? row.eventos_admin[0] : row.eventos_admin;
      return {
        ...mapReembolsoFromDB(row),
        solicitadoEmail: profiles?.email,
        eventoNome: evento?.nome,
      };
    });
  } catch (err) {
    console.error('Erro ao buscar reembolsos pendentes:', err);
    return [];
  }
}

// ── Obter reembolsos aprovados ───────────────────────────────────────────────────
export async function getReembolsosAprovados(): Promise<Reembolso[]> {
  try {
    const { data, error } = await supabase
      .from('reembolsos')
      .select(
        `
        id,
        ticket_id,
        evento_id,
        tipo,
        motivo,
        valor,
        solicitado_por,
        aprovado_por,
        solicitado_em,
        processado_em
      `,
      )
      .eq('status', 'APROVADO')
      .order('processado_em', { ascending: false })
      .limit(2000);

    if (error) {
      console.error('Erro ao buscar reembolsos aprovados:', error);
      return [];
    }

    return (data || []).map(mapReembolsoFromDB);
  } catch (err) {
    console.error('Erro ao buscar reembolsos aprovados:', err);
    return [];
  }
}

// ── Obter reembolsos rejeitados ──────────────────────────────────────────────────
export async function getReembolsosRejeitados(): Promise<Reembolso[]> {
  try {
    const { data, error } = await supabase
      .from('reembolsos')
      .select(
        `
        id,
        ticket_id,
        evento_id,
        tipo,
        motivo,
        valor,
        solicitado_por,
        rejeitado_por,
        solicitado_em,
        rejeitado_em,
        rejeitado_motivo
      `,
      )
      .eq('status', 'REJEITADO')
      .order('rejeitado_em', { ascending: false })
      .limit(2000);

    if (error) {
      console.error('Erro ao buscar reembolsos rejeitados:', error);
      return [];
    }

    return (data || []).map(mapReembolsoFromDB);
  } catch (err) {
    console.error('Erro ao buscar reembolsos rejeitados:', err);
    return [];
  }
}
