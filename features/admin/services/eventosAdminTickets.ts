/**
 * eventosAdminTickets — Vendas, tickets, validacao, operacional, marketing/leads.
 */

import { supabase } from '../../../services/supabaseClient';
import { tsBR } from '../../../utils';
import { EVENTOS_ADMIN, bumpVersion, getSocioId, varLabel, refresh } from './eventosAdminCore';
import { getContractedFees } from './eventosAdminFinanceiro';
import type { TicketCaixa, VendaLog, ValidacaoIngresso } from './eventosAdminTypes';

// ── Vendas ──────────────────────────────────────────────────────────────────

/**
 * Registra venda efetiva via RPC processar_venda_caixa do Supabase.
 */
export const registrarVendaEfetiva = async (
  eventoId: string,
  loteId: string,
  variacaoId: string,
  email: string,
  titular?: { nomeTitular: string; cpf: string; selfieBase64?: string },
): Promise<string> => {
  const ev = EVENTOS_ADMIN.find(e => e.id === eventoId);
  if (!ev) return '';
  const lote = ev.lotes.find(l => l.id === loteId);
  if (!lote) return '';
  const variacao = lote.variacoes.find(v => v.id === variacaoId);
  if (!variacao) return '';

  const fees = getContractedFees(eventoId);

  const { data, error } = await supabase.rpc('processar_venda_caixa', {
    p_evento_id: eventoId,
    p_lote_id: loteId,
    p_variacao_id: variacaoId,
    p_email: email,
    p_valor_unit: variacao.valor,
    p_taxa: fees.feePercent,
  });

  const rpcResult = data as unknown as { ok?: boolean; erro?: string; ticketId?: string } | null;
  if (error || !rpcResult?.ok) {
    console.error('[eventosAdminService] registrarVendaEfetiva erro:', error ?? rpcResult?.erro);
    return '';
  }

  const ticketId = rpcResult.ticketId as string;

  // Atualiza nome_titular e cpf se fornecidos
  if (titular && ticketId) {
    await supabase
      .from('tickets_caixa')
      .update({
        nome_titular: titular.nomeTitular,
        cpf: titular.cpf,
      })
      .eq('id', ticketId);
  }

  // Audit
  const { auditService } = await import('./auditService');
  const produtorId = getSocioId(eventoId);
  auditService.log(produtorId || 'sistema', 'TICKET_VENDIDO', 'ticket', ticketId, undefined, {
    eventoId,
    variacaoId,
    variacaoLabel: varLabel(variacao),
    valor: variacao.valor,
    email,
    produtorId,
  });

  // Verifica virada de lote por % vendido (Early Bird)
  try {
    await supabase.rpc('verificar_virada_lote', { p_evento_id: eventoId });
  } catch {
    /* silencioso */
  }

  // Refresh cache para atualizar contadores vendidos
  await refresh();
  bumpVersion();
  return ticketId;
};

export const registrarVenda = async (eventoId: string, variacaoId?: string): Promise<void> => {
  const ev = EVENTOS_ADMIN.find(e => e.id === eventoId);
  if (!ev) return;
  if (variacaoId) {
    for (const lote of ev.lotes) {
      const variacao = lote.variacoes.find(v => v.id === variacaoId);
      if (variacao) {
        await registrarVendaEfetiva(eventoId, lote.id, variacaoId, '');
        return;
      }
    }
  }
};

export const getVendasLog = async (eventoId: string): Promise<VendaLog[]> => {
  // Paginar para eventos com >1000 vendas (default Supabase limit = 1000)
  type VendaRow = {
    variacao_id: string | null;
    variacao_label: string;
    valor: number;
    produtor_id: string | null;
    ts: string;
    origem: string;
  };
  const PAGE = 1000;
  const all: VendaRow[] = [];
  let from = 0;

  while (true) {
    const { data } = await supabase
      .from('vendas_log')
      .select('variacao_id, variacao_label, valor, produtor_id, ts, origem')
      .eq('evento_id', eventoId)
      .order('ts', { ascending: false })
      .range(from, from + PAGE - 1);
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return all.map(row => ({
    variacaoId: row.variacao_id ?? '',
    variacaoLabel: row.variacao_label ?? '',
    valor: row.valor ?? 0,
    produtorId: row.produtor_id ?? '',
    ts: row.ts ?? '',
    origem: (row.origem ?? 'PORTA') as VendaLog['origem'],
  }));
};

export const registrarCortesia = async (eventoId: string): Promise<void> => {
  const ev = EVENTOS_ADMIN.find(e => e.id === eventoId);
  if (!ev) return;
  // Contagem derivada de cortesias_log no Supabase
  const { count } = await supabase
    .from('cortesias_log')
    .select('*', { count: 'exact', head: true })
    .eq('evento_id', eventoId);
  ev.cortesiasEnviadas = (count ?? 0) + 1; // +1 para incluir a que está sendo registrada agora
};

export const getCheckinsIngresso = async (eventoAdminId: string): Promise<number> => {
  const { count } = await supabase
    .from('tickets_caixa')
    .select('*', { count: 'exact', head: true })
    .eq('evento_id', eventoAdminId)
    .eq('status', 'USADO');
  return count ?? 0;
};

export interface CheckinsPorOrigem {
  antecipado: number;
  porta: number;
  cortesia: number;
}

export const getCheckinsPorOrigem = async (eventoAdminId: string): Promise<CheckinsPorOrigem> => {
  const { data } = await supabase
    .from('tickets_caixa')
    .select('origem')
    .eq('evento_id', eventoAdminId)
    .eq('status', 'USADO')
    .limit(500);

  const result: CheckinsPorOrigem = { antecipado: 0, porta: 0, cortesia: 0 };
  if (!data) return result;
  for (const row of data) {
    const origem = (row as { origem?: string }).origem ?? 'PORTA';
    if (origem === 'ANTECIPADO') result.antecipado++;
    else if (origem === 'CORTESIA') result.cortesia++;
    else result.porta++;
  }
  return result;
};

// ── Validacao / Check-in ────────────────────────────────────────────────────

export const validarEQueimarIngresso = async (
  ticketId: string,
  eventoId: string,
  operadorId?: string,
): Promise<{ resultado: ValidacaoIngresso; ticket?: TicketCaixa }> => {
  const { data, error } = await supabase.rpc('queimar_ingresso', {
    p_ticket_id: ticketId,
    p_event_id: eventoId,
  });

  if (error) {
    console.error('[eventosAdminService] queimar_ingresso erro:', error);
    return { resultado: 'INVALIDO' };
  }

  const resultado = ((data as unknown as { resultado?: string })?.resultado as string) ?? 'INVALIDO';

  if (resultado === 'VALIDO') {
    const { auditService } = await import('./auditService');
    auditService.log(
      operadorId ?? 'portaria',
      'TICKET_QUEIMADO',
      'ticket',
      ticketId,
      { status: 'DISPONIVEL' },
      { status: 'USADO' },
    );
  }

  return { resultado: resultado as ValidacaoIngresso };
};

// ── Tickets Caixa ───────────────────────────────────────────────────────────

export const getTicketsCaixaByEvento = async (eventoId: string): Promise<TicketCaixa[]> => {
  const { data } = await supabase
    .from('tickets_caixa')
    .select('*, variacoes_ingresso(area, genero)')
    .eq('evento_id', eventoId)
    .order('criado_em', { ascending: false })
    .limit(500);

  if (!data) return [];
  return data.map((row: Record<string, unknown>) => {
    const variacao = row.variacoes_ingresso as { area?: string; genero?: string } | null;
    const vLabel = variacao ? `${variacao.area ?? 'PISTA'} · ${variacao.genero ?? 'UNISEX'}` : '';
    return {
      id: row.id as string,
      eventoId: row.evento_id as string,
      variacaoId: (row.variacao_id as string) ?? '',
      variacaoLabel: vLabel,
      valor: Number(row.valor ?? 0),
      email: (row.email as string) ?? '',
      nomeTitular: (row.nome_titular as string) ?? '',
      cpf: (row.cpf as string) ?? '',
      selfieUrl: row.selfie_url as string | undefined,
      status: (row.status as TicketCaixa['status']) ?? 'DISPONIVEL',
      emitidoEm: (row.criado_em as string) ?? '',
      usadoEm: row.usado_em as string | undefined,
    };
  });
};

export const addTicketToCaixa = async (ticket: Omit<TicketCaixa, 'emitidoEm'>): Promise<void> => {
  await supabase.from('tickets_caixa').insert({
    id: ticket.id,
    evento_id: ticket.eventoId,
    variacao_id: ticket.variacaoId || null,
    email: ticket.email,
    nome_titular: ticket.nomeTitular,
    valor: ticket.valor,
    status: ticket.status,
  });
  bumpVersion();
};

// ── Operacional — Participantes ─────────────────────────────────────────────

export const editarTitular = async (
  ticketId: string,
  nome: string,
  email: string,
  operadorId?: string,
): Promise<boolean> => {
  const { error } = await supabase
    .from('tickets_caixa')
    .update({ nome_titular: nome.trim(), email: email.trim() })
    .eq('id', ticketId);

  if (error) return false;

  const { auditService } = await import('./auditService');
  auditService.log(operadorId ?? 'sistema', 'TICKET_TITULAR_EDITADO', 'ticket', ticketId, undefined, { nome, email });
  bumpVersion();
  return true;
};

export const atualizarSelfieUrl = async (ticketId: string, url: string): Promise<void> => {
  await supabase.from('tickets_caixa').update({ selfie_url: url }).eq('id', ticketId);
};

export const reenviarIngresso = async (ticketId: string, operadorId?: string): Promise<boolean> => {
  const { auditService } = await import('./auditService');
  auditService.log(operadorId ?? 'sistema', 'TICKET_REENVIADO', 'ticket', ticketId, undefined, {});

  // Notificação in-app ao dono do ingresso (fire-and-forget)
  void (async () => {
    try {
      const { data: ticket } = await supabase
        .from('tickets_caixa')
        .select('owner_id, evento_id, variacao_label')
        .eq('id', ticketId)
        .single();
      const ownerId = ticket?.owner_id as string | undefined;
      if (!ownerId) return;
      const eventoNome = EVENTOS_ADMIN.find(e => e.id === ticket.evento_id)?.nome ?? 'Evento';
      const { notificationsService } = await import('./notificationsService');
      await notificationsService.add(
        {
          titulo: 'Ingresso reenviado',
          mensagem: `Seu ingresso ${ticket.variacao_label ?? ''} para ${eventoNome} foi reenviado.`,
          tipo: 'INGRESSO',
          lida: false,
          link: '',
          timestamp: tsBR(),
        },
        ownerId,
      );
    } catch {
      /* fire-and-forget */
    }
  })();

  bumpVersion();
  return true;
};

export const cancelarIngresso = async (ticketId: string, operadorId?: string): Promise<boolean> => {
  // Busca dados antes de cancelar (para waitlist)
  const { data: ticketRow } = await supabase
    .from('tickets_caixa')
    .select('evento_id, variacao_id')
    .eq('id', ticketId)
    .single();

  const { error } = await supabase.from('tickets_caixa').update({ status: 'CANCELADO' }).eq('id', ticketId);

  if (error) return false;

  const { auditService } = await import('./auditService');
  auditService.log(
    operadorId ?? 'sistema',
    'TICKET_CANCELADO',
    'ticket',
    ticketId,
    { status: 'DISPONIVEL' },
    { status: 'CANCELADO' },
  );

  // Notificar waitlist se variação identificada
  if (ticketRow?.evento_id && ticketRow?.variacao_id) {
    try {
      const { waitlistService } = await import('../../../services/waitlistService');
      void waitlistService.notificarProximos(ticketRow.evento_id as string, ticketRow.variacao_id as string, 1);
    } catch {
      /* silencioso */
    }
  }

  await refresh();
  bumpVersion();
  return true;
};
