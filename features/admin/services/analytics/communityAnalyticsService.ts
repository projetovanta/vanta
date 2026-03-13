/**
 * Community Analytics Service — Agrega métricas de todos os eventos de uma comunidade.
 *
 * Fontes: eventos_admin, tickets_caixa, vendas_log, equipe_evento, cotas_promoter, profiles.
 * Cache: 60s via getCached.
 */

import { supabase } from '../../../../services/supabaseClient';
import { getCached } from '../../../../services/cache';
import { eventosAdminService } from '../eventosAdminService';
import { getResumoFinanceiroComunidade } from '../eventosAdminFinanceiro';
import type {
  CommunityAnalytics,
  RevenueBreakdown,
  TicketBreakdown,
  AudienceMetrics,
  PromoterMetrics,
  EventoRankingItem,
  TimeSeriesPoint,
  Periodo,
  LoteBreakdown,
  VariacaoBreakdown,
  MetodoPagamentoBreakdown,
} from './types';

// ── Helpers ──────────────────────────────────────────────────────────────────

function getDateRange(periodo: Periodo): [string, string] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (periodo) {
    case 'HOJE':
      return [today.toISOString(), now.toISOString()];
    case 'SEMANA': {
      const dow = today.getDay();
      const diff = dow === 0 ? 6 : dow - 1;
      return [new Date(today.getTime() - diff * 86400000).toISOString(), now.toISOString()];
    }
    case 'MES':
      return [new Date(now.getFullYear(), now.getMonth(), 1).toISOString(), now.toISOString()];
    case 'ANO':
      return [new Date(now.getFullYear(), 0, 1).toISOString(), now.toISOString()];
  }
}

function roundMoney(x: number): number {
  return Math.round(x * 100) / 100;
}

function safeDiv(a: number, b: number): number {
  return b === 0 ? 0 : a / b;
}

// ── Revenue Breakdown ────────────────────────────────────────────────────────

function buildRevenueBreakdown(resumo: {
  receitaBruta: number;
  receitaListas: number;
  custoGateway: number;
  receitaLiquida: number;
  taxaVanta: number;
  splitProdutor: number;
  splitSocio: number;
  saquesProcessados: number;
  saquesPendentes: number;
  saldoDisponivel: number;
}): RevenueBreakdown {
  return {
    receitaBruta: roundMoney(resumo.receitaBruta),
    receitaListas: roundMoney(resumo.receitaListas),
    custoGateway: roundMoney(resumo.custoGateway),
    totalReembolsado: 0,
    totalChargebacks: 0,
    receitaLiquida: roundMoney(resumo.receitaLiquida),
    taxaVanta: roundMoney(resumo.taxaVanta),
    splitProdutor: roundMoney(resumo.splitProdutor),
    splitSocio: roundMoney(resumo.splitSocio),
    saquesProcessados: roundMoney(resumo.saquesProcessados),
    saquesPendentes: roundMoney(resumo.saquesPendentes),
    saldoDisponivel: roundMoney(resumo.saldoDisponivel),
  };
}

// ── Ticket Breakdown ─────────────────────────────────────────────────────────

async function aggregateTicketBreakdown(eventoIds: string[]): Promise<TicketBreakdown> {
  const empty: TicketBreakdown = {
    totalVendidos: 0,
    totalCortesias: 0,
    totalLista: 0,
    totalCaixa: 0,
    totalOnline: 0,
    totalCancelados: 0,
    totalReembolsados: 0,
    ticketMedio: 0,
    porLote: [],
    porVariacao: [],
    porMetodoPagamento: [],
  };
  if (eventoIds.length === 0) return empty;

  // Fetch tickets in batches (Supabase .in() limit ~300)
  const allTickets: Array<{
    id: string;
    evento_id: string;
    status: string;
    origem: string | null;
    lote_id: string | null;
    variacao_id: string | null;
    variacao_label: string | null;
    valor: number;
    metodo_pagamento: string;
    usado_em: string | null;
  }> = [];

  const batchSize = 200;
  for (let i = 0; i < eventoIds.length; i += batchSize) {
    const batch = eventoIds.slice(i, i + batchSize);
    const { data } = await supabase
      .from('tickets_caixa')
      .select('id, evento_id, status, origem, lote_id, variacao_id, variacao_label, valor, metodo_pagamento, usado_em')
      .in('evento_id', batch)
      .limit(2000);
    if (data) allTickets.push(...(data as typeof allTickets));
  }

  let totalValor = 0;
  const loteMap = new Map<string, LoteBreakdown>();
  const variacaoMap = new Map<string, VariacaoBreakdown>();
  const metodoMap = new Map<string, { quantidade: number; valor: number }>();

  for (const t of allTickets) {
    const status = t.status ?? '';
    const origem = t.origem ?? '';
    const valor = t.valor ?? 0;

    if (status === 'CANCELADO') {
      empty.totalCancelados++;
      continue;
    }
    if (status === 'REEMBOLSADO') {
      empty.totalReembolsados++;
      continue;
    }

    empty.totalVendidos++;
    totalValor += valor;

    if (origem === 'CORTESIA') empty.totalCortesias++;
    else if (origem === 'LISTA') empty.totalLista++;
    else if (origem === 'PORTA') empty.totalCaixa++;
    else empty.totalOnline++;

    // Lote aggregation
    if (t.lote_id) {
      const existing = loteMap.get(t.lote_id);
      if (existing) {
        existing.vendidos++;
        existing.receita += valor;
      } else {
        loteMap.set(t.lote_id, {
          loteId: t.lote_id,
          loteNome: 'Lote',
          vendidos: 1,
          limite: 0,
          receita: valor,
          percentual: 0,
        });
      }
    }

    // Variacao aggregation
    if (t.variacao_id) {
      const existing = variacaoMap.get(t.variacao_id);
      if (existing) {
        existing.vendidos++;
        existing.receita += valor;
      } else {
        variacaoMap.set(t.variacao_id, {
          variacaoId: t.variacao_id,
          label: t.variacao_label ?? '',
          area: '',
          genero: '',
          valor,
          vendidos: 1,
          limite: 0,
          receita: valor,
        });
      }
    }

    // Metodo pagamento
    const metodo = t.metodo_pagamento ?? 'OUTRO';
    const metExist = metodoMap.get(metodo);
    if (metExist) {
      metExist.quantidade++;
      metExist.valor += valor;
    } else {
      metodoMap.set(metodo, { quantidade: 1, valor });
    }
  }

  empty.ticketMedio = roundMoney(safeDiv(totalValor, empty.totalVendidos));

  // Percentuais lotes
  const porLote = Array.from(loteMap.values()).map(l => ({
    ...l,
    receita: roundMoney(l.receita),
    percentual: roundMoney(safeDiv(l.vendidos, empty.totalVendidos) * 100),
  }));

  // Variações
  const porVariacao = Array.from(variacaoMap.values()).map(v => ({
    ...v,
    receita: roundMoney(v.receita),
    valor: roundMoney(v.receita > 0 ? v.receita / v.vendidos : v.valor),
  }));

  // Métodos de pagamento
  const porMetodoPagamento: MetodoPagamentoBreakdown[] = Array.from(metodoMap.entries()).map(([met, d]) => ({
    metodo: met as MetodoPagamentoBreakdown['metodo'],
    quantidade: d.quantidade,
    valor: roundMoney(d.valor),
    percentual: roundMoney(safeDiv(d.quantidade, empty.totalVendidos) * 100),
  }));

  return {
    ...empty,
    porLote,
    porVariacao,
    porMetodoPagamento,
  };
}

// ── Audience Metrics ─────────────────────────────────────────────────────────

async function aggregateAudienceMetrics(eventoIds: string[]): Promise<AudienceMetrics> {
  const result: AudienceMetrics = {
    totalCheckins: 0,
    taxaCheckin: 0,
    totalPresentes: 0,
    totalAusentes: 0,
    checkinsPorHora: [],
    heatmapCheckins: [],
    recorrentes: 0,
    novos: 0,
  };
  if (eventoIds.length === 0) return result;

  // Fetch used tickets per event
  const allUsed: Array<{ evento_id: string; owner_id: string | null; usado_em: string | null }> = [];
  const allTotal: Array<{ evento_id: string }> = [];

  const batchSize = 200;
  for (let i = 0; i < eventoIds.length; i += batchSize) {
    const batch = eventoIds.slice(i, i + batchSize);

    const [usedRes, totalRes] = await Promise.all([
      supabase
        .from('tickets_caixa')
        .select('evento_id, owner_id, usado_em')
        .in('evento_id', batch)
        .eq('status', 'USADO')
        .limit(2000),
      supabase
        .from('tickets_caixa')
        .select('evento_id')
        .in('evento_id', batch)
        .in('status', ['DISPONIVEL', 'USADO'])
        .limit(2000),
    ]);

    if (usedRes.data) allUsed.push(...(usedRes.data as typeof allUsed));
    if (totalRes.data) allTotal.push(...(totalRes.data as typeof allTotal));
  }

  result.totalCheckins = allUsed.length;
  result.totalPresentes = allUsed.length;
  result.totalAusentes = Math.max(0, allTotal.length - allUsed.length);
  result.taxaCheckin = roundMoney(safeDiv(result.totalCheckins, allTotal.length) * 100);

  // Recorrentes: users who checked in to 2+ distinct events
  const userEventMap = new Map<string, Set<string>>();
  for (const row of allUsed) {
    const uid = row.owner_id;
    if (!uid) continue;
    const set = userEventMap.get(uid);
    if (set) {
      set.add(row.evento_id);
    } else {
      userEventMap.set(uid, new Set([row.evento_id]));
    }
  }
  let recorrentes = 0;
  let novos = 0;
  for (const [, events] of userEventMap) {
    if (events.size >= 2) recorrentes++;
    else novos++;
  }
  result.recorrentes = recorrentes;
  result.novos = novos;

  // Checkins por hora (aggregate across events)
  const hourMap = new Map<string, number>();
  for (const row of allUsed) {
    if (!row.usado_em) continue;
    const dt = new Date(row.usado_em);
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}T${String(dt.getHours()).padStart(2, '0')}:00`;
    hourMap.set(key, (hourMap.get(key) ?? 0) + 1);
  }
  result.checkinsPorHora = Array.from(hourMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }));

  // Heatmap (dayOfWeek x hour)
  const heatGrid = new Map<string, number>();
  for (const row of allUsed) {
    if (!row.usado_em) continue;
    const dt = new Date(row.usado_em);
    const key = `${dt.getDay()}-${dt.getHours()}`;
    heatGrid.set(key, (heatGrid.get(key) ?? 0) + 1);
  }
  result.heatmapCheckins = Array.from(heatGrid.entries()).map(([key, value]) => {
    const [d, h] = key.split('-');
    return { dayOfWeek: Number(d), hour: Number(h), value };
  });

  return result;
}

// ── Top Promoters ────────────────────────────────────────────────────────────

async function aggregateTopPromoters(eventoIds: string[]): Promise<PromoterMetrics[]> {
  if (eventoIds.length === 0) return [];

  // Get all listas for these events, then cotas
  const { data: listas } = await supabase
    .from('listas_evento')
    .select('id, evento_id')
    .in('evento_id', eventoIds)
    .limit(2000);

  if (!listas?.length) return [];

  const listaIds = listas.map(l => (l as { id: string }).id);

  const { data: cotas } = await supabase
    .from('cotas_promoter')
    .select('lista_id, promoter_id')
    .in('lista_id', listaIds)
    .limit(2000);

  if (!cotas?.length) return [];

  // Get convidados per lista for counts
  const { data: convidados } = await supabase
    .from('convidados_lista')
    .select('lista_id, checked_in')
    .in('lista_id', listaIds)
    .limit(2000);

  // Build lista→promoter map
  const listaPromoterMap = new Map<string, string>();
  for (const c of cotas) {
    const cota = c as { lista_id: string; promoter_id: string };
    listaPromoterMap.set(cota.lista_id, cota.promoter_id);
  }

  // Aggregate per promoter
  const promoterAgg = new Map<string, { listas: Set<string>; nomes: number; checkins: number }>();
  for (const conv of convidados ?? []) {
    const row = conv as { lista_id: string; checked_in: boolean | null };
    const promoterId = listaPromoterMap.get(row.lista_id);
    if (!promoterId) continue;

    const agg = promoterAgg.get(promoterId);
    if (agg) {
      agg.listas.add(row.lista_id);
      agg.nomes++;
      if (row.checked_in) agg.checkins++;
    } else {
      promoterAgg.set(promoterId, {
        listas: new Set([row.lista_id]),
        nomes: 1,
        checkins: row.checked_in ? 1 : 0,
      });
    }
  }

  // Fetch promoter profiles
  const promoterIds = Array.from(promoterAgg.keys());
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, nome, avatar_url')
    .in('id', promoterIds)
    .limit(2000);

  const profileMap = new Map<string, { nome: string; foto: string | null }>();
  for (const p of profiles ?? []) {
    const prof = p as { id: string; nome: string; avatar_url: string | null };
    profileMap.set(prof.id, { nome: prof.nome, foto: prof.avatar_url });
  }

  const result: PromoterMetrics[] = [];
  for (const [pid, agg] of promoterAgg) {
    const prof = profileMap.get(pid);
    result.push({
      promoterId: pid,
      promoterNome: prof?.nome ?? 'Promoter',
      promoterFoto: prof?.foto ?? undefined,
      listasAtribuidas: agg.listas.size,
      totalNomes: agg.nomes,
      totalCheckins: agg.checkins,
      taxaConversao: roundMoney(safeDiv(agg.checkins, agg.nomes) * 100),
      comissao: 0,
    });
  }

  return result.sort((a, b) => b.totalNomes - a.totalNomes).slice(0, 10);
}

// ── Eventos Ranking ──────────────────────────────────────────────────────────

async function buildEventosRanking(
  eventos: Array<{ id: string; nome: string; dataInicio: string }>,
): Promise<EventoRankingItem[]> {
  if (eventos.length === 0) return [];

  const eventoIds = eventos.map(e => e.id);

  // vendas_log sum por evento
  const { data: vendas } = await supabase
    .from('vendas_log')
    .select('evento_id, valor')
    .in('evento_id', eventoIds)
    .limit(2000);

  const receitaMap = new Map<string, number>();
  for (const v of vendas ?? []) {
    const row = v as { evento_id: string; valor: number };
    receitaMap.set(row.evento_id, (receitaMap.get(row.evento_id) ?? 0) + (row.valor ?? 0));
  }

  // tickets_caixa count + usado count por evento
  const { data: tickets } = await supabase
    .from('tickets_caixa')
    .select('evento_id, status')
    .in('evento_id', eventoIds)
    .in('status', ['DISPONIVEL', 'USADO'])
    .limit(2000);

  const ticketCountMap = new Map<string, { total: number; usado: number }>();
  for (const t of tickets ?? []) {
    const row = t as { evento_id: string; status: string };
    const existing = ticketCountMap.get(row.evento_id);
    if (existing) {
      existing.total++;
      if (row.status === 'USADO') existing.usado++;
    } else {
      ticketCountMap.set(row.evento_id, {
        total: 1,
        usado: row.status === 'USADO' ? 1 : 0,
      });
    }
  }

  const nomeMap = new Map(eventos.map(e => [e.id, { nome: e.nome, data: e.dataInicio }]));

  const ranking: EventoRankingItem[] = eventoIds.map(eid => {
    const ev = nomeMap.get(eid);
    const receita = receitaMap.get(eid) ?? 0;
    const tc = ticketCountMap.get(eid);
    const vendidos = tc?.total ?? 0;
    const usado = tc?.usado ?? 0;
    return {
      eventoId: eid,
      eventoNome: ev?.nome ?? '',
      dataInicio: ev?.data ?? '',
      receita: roundMoney(receita),
      vendidos,
      checkinRate: roundMoney(safeDiv(usado, vendidos) * 100),
    };
  });

  return ranking.sort((a, b) => b.receita - a.receita);
}

// ── Vendas Time Series ───────────────────────────────────────────────────────

async function buildVendasTimeSeries(
  eventoIds: string[],
  dateFrom: string,
  dateTo: string,
): Promise<TimeSeriesPoint[]> {
  if (eventoIds.length === 0) return [];

  const allVendas: Array<{ ts: string; valor: number }> = [];
  const batchSize = 200;

  for (let i = 0; i < eventoIds.length; i += batchSize) {
    const batch = eventoIds.slice(i, i + batchSize);
    const { data } = await supabase
      .from('vendas_log')
      .select('ts, valor')
      .in('evento_id', batch)
      .gte('ts', dateFrom)
      .lte('ts', dateTo)
      .limit(2000);
    if (data) allVendas.push(...(data as typeof allVendas));
  }

  // Group by day
  const dayMap = new Map<string, number>();
  for (const v of allVendas) {
    if (!v.ts) continue;
    const day = v.ts.slice(0, 10); // YYYY-MM-DD
    dayMap.set(day, (dayMap.get(day) ?? 0) + (v.valor ?? 0));
  }

  return Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value: roundMoney(value) }));
}

// ── Retencao Publico ─────────────────────────────────────────────────────────

async function calcRetencaoPublico(eventoIds: string[]): Promise<number> {
  if (eventoIds.length <= 1) return 0;

  const allBuyers: Array<{ evento_id: string; owner_id: string | null }> = [];
  const batchSize = 200;

  for (let i = 0; i < eventoIds.length; i += batchSize) {
    const batch = eventoIds.slice(i, i + batchSize);
    const { data } = await supabase
      .from('tickets_caixa')
      .select('evento_id, owner_id')
      .in('evento_id', batch)
      .in('status', ['DISPONIVEL', 'USADO'])
      .limit(2000);
    if (data) allBuyers.push(...(data as typeof allBuyers));
  }

  const userEventMap = new Map<string, Set<string>>();
  for (const row of allBuyers) {
    if (!row.owner_id) continue;
    const set = userEventMap.get(row.owner_id);
    if (set) {
      set.add(row.evento_id);
    } else {
      userEventMap.set(row.owner_id, new Set([row.evento_id]));
    }
  }

  const totalUsers = userEventMap.size;
  if (totalUsers === 0) return 0;

  let recorrentes = 0;
  for (const [, events] of userEventMap) {
    if (events.size >= 2) recorrentes++;
  }

  return roundMoney(safeDiv(recorrentes, totalUsers) * 100);
}

// ── MAIN EXPORT ──────────────────────────────────────────────────────────────

export async function getCommunityAnalytics(
  comunidadeId: string,
  periodo: Periodo,
): Promise<CommunityAnalytics | null> {
  return getCached(
    `analytics:community:${comunidadeId}:${periodo}`,
    () => fetchCommunityAnalytics(comunidadeId, periodo),
    60_000,
  );
}

async function fetchCommunityAnalytics(comunidadeId: string, periodo: Periodo): Promise<CommunityAnalytics | null> {
  // 1. Get all events for this community
  const allEventos = eventosAdminService.getEventosByComunidade(comunidadeId);
  if (!allEventos?.length) return null;

  // 2. Filter by periodo date range
  const [dateFrom, dateTo] = getDateRange(periodo);
  const filteredEventos = allEventos.filter(ev => {
    const d = ev.dataInicio;
    return d >= dateFrom && d <= dateTo;
  });

  const eventoIds = filteredEventos.map(e => e.id);

  // 3. Community name
  const comunidadeNome = allEventos[0]?.comunidade?.nome ?? '';

  // Count active vs finalized
  const eventosAtivos = filteredEventos.filter(
    e => e.publicado && (!('status_evento' in e) || (e as Record<string, unknown>).status_evento !== 'FINALIZADO'),
  ).length;
  const eventosFinalizados = filteredEventos.length - eventosAtivos;

  // 4. Aggregated financeiro
  const resumo = await getResumoFinanceiroComunidade(comunidadeId);
  const revenue = buildRevenueBreakdown(resumo);

  // 5–10: Parallel aggregation
  const [tickets, audience, topPromoters, eventosRanking, vendasTimeSeries, retencaoPublico] = await Promise.all([
    aggregateTicketBreakdown(eventoIds),
    aggregateAudienceMetrics(eventoIds),
    aggregateTopPromoters(eventoIds),
    buildEventosRanking(filteredEventos.map(e => ({ id: e.id, nome: e.nome, dataInicio: e.dataInicio }))),
    buildVendasTimeSeries(eventoIds, dateFrom, dateTo),
    calcRetencaoPublico(eventoIds),
  ]);

  return {
    comunidadeId,
    comunidadeNome,
    periodo,
    totalEventos: filteredEventos.length,
    eventosAtivos,
    eventosFinalizados,
    revenue,
    tickets,
    audience,
    topPromoters,
    eventosRanking,
    vendasTimeSeries,
    retencaoPublico,
  };
}
