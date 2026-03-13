/**
 * eventAnalyticsService — Analytics consolidado por evento.
 *
 * Queries diretas no Supabase (zero mocks).
 * Reutiliza getResumoFinanceiroEvento para dados financeiros.
 */

import { supabase } from '../../../../services/supabaseClient';
import { getCached } from '../../../../services/cache';
import { getResumoFinanceiroEvento } from '../eventosAdminFinanceiro';
import { eventosAdminService } from '../eventosAdminService';
import { listasService } from '../listasService';
import type { EventoAdmin } from '../../../../types';
import type {
  EventAnalytics,
  TemporalMode,
  RevenueBreakdown,
  TicketBreakdown,
  AudienceMetrics,
  OperationalMetrics,
  PromoterMetrics,
  StaffMemberMetrics,
  TimeSeriesPoint,
  FunnelStep,
  HeatmapCell,
  LoteBreakdown,
  VariacaoBreakdown,
  MetodoPagamentoBreakdown,
} from './types';

// ── Helpers ─────────────────────────────────────────────────────────────────

const round2 = (x: number): number => Math.round(x * 100) / 100;

function detectTemporalMode(ev: EventoAdmin): TemporalMode {
  const now = new Date();
  const inicio = new Date(ev.dataInicio);
  const fim = ev.dataFim ? new Date(ev.dataFim) : new Date(inicio.getTime() + 8 * 3600000);
  if (now < inicio) return 'PRE_EVENTO';
  if (now <= fim) return 'OPERACAO';
  return 'POS_EVENTO';
}

/** Busca nomes de profiles por IDs */
async function fetchProfileNames(ids: string[]): Promise<Map<string, { nome: string; foto?: string }>> {
  const map = new Map<string, { nome: string; foto?: string }>();
  if (ids.length === 0) return map;

  const uniqueIds = [...new Set(ids)];
  const { data } = await supabase.from('profiles').select('id, nome, avatar_url').in('id', uniqueIds).limit(2000);

  if (data) {
    for (const row of data) {
      map.set(row.id, {
        nome: row.nome ?? 'Sem nome',
        foto: row.avatar_url ?? undefined,
      });
    }
  }
  return map;
}

// ── Ticket query row shape ──────────────────────────────────────────────────

interface TicketRow {
  id: string;
  variacao_id: string | null;
  valor: number;
  status: string;
  metodo_pagamento: string | null;
  origem: string | null;
  criado_em: string | null;
  usado_em: string | null;
}

// ── Revenue ─────────────────────────────────────────────────────────────────

async function buildRevenue(eventoId: string): Promise<RevenueBreakdown> {
  const [resumo, reembolsosRes, chargebacksRes] = await Promise.all([
    getResumoFinanceiroEvento(eventoId),
    supabase
      .from('reembolsos')
      .select('valor, status')
      .eq('evento_id', eventoId)
      .in('status', ['APROVADO', 'AUTOMATICO'])
      .limit(2000),
    supabase.from('chargebacks').select('valor').eq('evento_id', eventoId).limit(2000),
  ]);

  const totalReembolsado = (reembolsosRes.data ?? []).reduce((acc, r) => acc + ((r.valor as number) ?? 0), 0);
  const totalChargebacks = (chargebacksRes.data ?? []).reduce((acc, r) => acc + ((r.valor as number) ?? 0), 0);

  return {
    receitaBruta: round2(resumo.receitaBruta),
    receitaListas: round2(resumo.receitaListas),
    custoGateway: round2(resumo.custoGateway),
    totalReembolsado: round2(totalReembolsado),
    totalChargebacks: round2(totalChargebacks),
    receitaLiquida: round2(resumo.receitaLiquida),
    taxaVanta: round2(resumo.taxaVanta),
    splitProdutor: round2(resumo.splitProdutor),
    splitSocio: round2(resumo.splitSocio),
    saquesProcessados: round2(resumo.saquesProcessados),
    saquesPendentes: round2(resumo.saquesPendentes),
    saldoDisponivel: round2(resumo.saldoDisponivel),
  };
}

// ── Tickets ─────────────────────────────────────────────────────────────────

function buildTickets(tickets: TicketRow[], ev: EventoAdmin): TicketBreakdown {
  const vendidos = tickets.filter(t => t.status !== 'CANCELADO' && t.status !== 'REEMBOLSADO');
  const cancelados = tickets.filter(t => t.status === 'CANCELADO');
  const reembolsados = tickets.filter(t => t.status === 'REEMBOLSADO');

  const totalVendidos = vendidos.length;
  const totalCortesias = vendidos.filter(t => t.origem === 'CORTESIA').length;
  const totalLista = vendidos.filter(t => t.origem === 'LISTA').length;
  const totalCaixa = vendidos.filter(t => t.origem === 'PORTA').length;
  const totalOnline = vendidos.filter(t => t.origem === 'ANTECIPADO').length;

  const receitaTotal = vendidos.reduce((s, t) => s + (t.valor ?? 0), 0);
  const ticketMedio = totalVendidos > 0 ? round2(receitaTotal / totalVendidos) : 0;

  // Por lote (via variacoes do evento)
  const variacaoToLote = new Map<string, { loteId: string; loteNome: string; limite: number }>();
  for (const lote of ev.lotes ?? []) {
    for (const v of lote.variacoes ?? []) {
      variacaoToLote.set(v.id, { loteId: lote.id, loteNome: lote.nome, limite: lote.limitTotal });
    }
  }

  const loteMap = new Map<string, { vendidos: number; receita: number; limite: number; nome: string }>();
  for (const t of vendidos) {
    const info = t.variacao_id ? variacaoToLote.get(t.variacao_id) : undefined;
    const loteId = info?.loteId ?? 'sem-lote';
    const cur = loteMap.get(loteId) ?? {
      vendidos: 0,
      receita: 0,
      limite: info?.limite ?? 0,
      nome: info?.loteNome ?? 'Sem lote',
    };
    cur.vendidos += 1;
    cur.receita += t.valor ?? 0;
    loteMap.set(loteId, cur);
  }

  const porLote: LoteBreakdown[] = [...loteMap.entries()].map(([loteId, d]) => ({
    loteId,
    loteNome: d.nome,
    vendidos: d.vendidos,
    limite: d.limite,
    receita: round2(d.receita),
    percentual: totalVendidos > 0 ? round2((d.vendidos / totalVendidos) * 100) : 0,
  }));

  // Por variacao
  const varMap = new Map<string, { vendidos: number; receita: number }>();
  for (const t of vendidos) {
    const vId = t.variacao_id ?? 'sem-variacao';
    const cur = varMap.get(vId) ?? { vendidos: 0, receita: 0 };
    cur.vendidos += 1;
    cur.receita += t.valor ?? 0;
    varMap.set(vId, cur);
  }

  const allVars = (ev.lotes ?? []).flatMap(l => l.variacoes ?? []);
  const porVariacao: VariacaoBreakdown[] = allVars.map(v => {
    const stats = varMap.get(v.id) ?? { vendidos: 0, receita: 0 };
    return {
      variacaoId: v.id,
      label: `${v.area}${v.areaCustom ? ` (${v.areaCustom})` : ''} - ${v.genero}`,
      area: v.areaCustom ?? v.area,
      genero: v.genero,
      valor: v.valor,
      vendidos: stats.vendidos,
      limite: v.limite,
      receita: round2(stats.receita),
    };
  });

  // Por metodo de pagamento
  const metodoMap = new Map<string, { quantidade: number; valor: number }>();
  for (const t of vendidos) {
    const metodo = t.metodo_pagamento ?? t.origem ?? 'OUTRO';
    const cur = metodoMap.get(metodo) ?? { quantidade: 0, valor: 0 };
    cur.quantidade += 1;
    cur.valor += t.valor ?? 0;
    metodoMap.set(metodo, cur);
  }

  const porMetodoPagamento: MetodoPagamentoBreakdown[] = [...metodoMap.entries()].map(([metodo, d]) => ({
    metodo: metodo as MetodoPagamentoBreakdown['metodo'],
    quantidade: d.quantidade,
    valor: round2(d.valor),
    percentual: totalVendidos > 0 ? round2((d.quantidade / totalVendidos) * 100) : 0,
  }));

  return {
    totalVendidos,
    totalCortesias,
    totalLista,
    totalCaixa,
    totalOnline,
    totalCancelados: cancelados.length,
    totalReembolsados: reembolsados.length,
    ticketMedio,
    porLote,
    porVariacao,
    porMetodoPagamento,
  };
}

// ── Audience ────────────────────────────────────────────────────────────────

async function buildAudience(tickets: TicketRow[], eventoId: string, comunidadeId: string): Promise<AudienceMetrics> {
  const usados = tickets.filter(t => t.status === 'USADO');
  const vendidos = tickets.filter(t => t.status !== 'CANCELADO' && t.status !== 'REEMBOLSADO');
  const totalCheckins = usados.length;
  const taxaCheckin = vendidos.length > 0 ? round2((totalCheckins / vendidos.length) * 100) : 0;

  // Checkins por hora
  const checkinsPorHora: TimeSeriesPoint[] = [];
  const horaMap = new Map<string, number>();
  for (const t of usados) {
    if (!t.usado_em) continue;
    const dt = new Date(t.usado_em);
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}T${String(dt.getHours()).padStart(2, '0')}:00`;
    horaMap.set(key, (horaMap.get(key) ?? 0) + 1);
  }
  for (const [date, value] of [...horaMap.entries()].sort()) {
    checkinsPorHora.push({ date, value });
  }

  // Heatmap checkins
  const heatCells = new Map<string, number>();
  for (const t of usados) {
    if (!t.usado_em) continue;
    const dt = new Date(t.usado_em);
    const key = `${dt.getDay()}-${dt.getHours()}`;
    heatCells.set(key, (heatCells.get(key) ?? 0) + 1);
  }
  const heatmapCheckins: HeatmapCell[] = [...heatCells.entries()].map(([key, value]) => {
    const [d, h] = key.split('-');
    return { dayOfWeek: Number(d), hour: Number(h), value };
  });

  // Recorrentes: emails que compraram em outros eventos da mesma comunidade
  let recorrentes = 0;
  let novos = 0;

  const emailsEvento = usados
    .map(t => (t as unknown as Record<string, unknown>).email as string | undefined)
    .filter((e): e is string => !!e);

  if (emailsEvento.length > 0) {
    const { count } = await supabase
      .from('tickets_caixa')
      .select('email', { count: 'exact', head: true })
      .neq('evento_id', eventoId)
      .in('email', emailsEvento.slice(0, 500))
      .limit(1);

    recorrentes = count ?? 0;
    novos = emailsEvento.length - recorrentes;
  }

  return {
    totalCheckins,
    taxaCheckin,
    totalPresentes: totalCheckins,
    totalAusentes: vendidos.length - totalCheckins,
    checkinsPorHora,
    heatmapCheckins,
    recorrentes,
    novos: Math.max(novos, 0),
  };
}

// ── Operational ─────────────────────────────────────────────────────────────

function buildOperational(
  tickets: TicketRow[],
  listas: { convidados: { checkedIn: boolean }[] }[],
  cortesiasEnviadas: number,
  cortesiasUsadas: number,
): OperationalMetrics {
  const vendidos = tickets.filter(t => t.status !== 'CANCELADO' && t.status !== 'REEMBOLSADO');
  const usados = tickets.filter(t => t.status === 'USADO');
  const caixa = vendidos.filter(t => t.origem === 'PORTA');

  return {
    checkinRate: vendidos.length > 0 ? round2((usados.length / vendidos.length) * 100) : 0,
    vendasCaixaTotal: caixa.length,
    vendasCaixaValor: round2(caixa.reduce((s, t) => s + (t.valor ?? 0), 0)),
    cortesiasEnviadas,
    cortesiasUsadas,
    listasAtivas: listas.length,
    nomesNasListas: listas.reduce((s, l) => s + (l.convidados?.length ?? 0), 0),
  };
}

// ── Promoters ───────────────────────────────────────────────────────────────

async function buildPromoterMetrics(eventoId: string): Promise<PromoterMetrics[]> {
  // Buscar cotas e convidados via listas do evento
  const { data: cotasRows } = await supabase
    .from('cotas_promoter')
    .select('promoter_id, lista_id, alocado')
    .limit(2000);

  const { data: listasRows } = await supabase.from('listas_evento').select('id').eq('evento_id', eventoId).limit(2000);

  const listaIds = new Set((listasRows ?? []).map(l => l.id as string));
  const cotasEvento = (cotasRows ?? []).filter(c => listaIds.has(c.lista_id as string));

  if (cotasEvento.length === 0) return [];

  const promoterIds = [...new Set(cotasEvento.map(c => c.promoter_id as string))];
  const profiles = await fetchProfileNames(promoterIds);

  // Convidados por lista
  const { data: convidadosRows } = await supabase
    .from('convidados_lista')
    .select('lista_id, inserido_por, checked_in')
    .in('lista_id', [...listaIds])
    .limit(2000);

  const convidados = convidadosRows ?? [];

  return promoterIds.map(pid => {
    const pCotas = cotasEvento.filter(c => (c.promoter_id as string) === pid);
    const totalAlocado = pCotas.reduce((s, c) => s + ((c.alocado as number) ?? 0), 0);
    const pConvidados = convidados.filter(c => c.inserido_por === pid);
    const totalNomes = pConvidados.length;
    const totalCheckins = pConvidados.filter(c => c.checked_in).length;
    const profile = profiles.get(pid);

    return {
      promoterId: pid,
      promoterNome: profile?.nome ?? 'Sem nome',
      promoterFoto: profile?.foto,
      listasAtribuidas: pCotas.length,
      totalNomes,
      totalCheckins,
      taxaConversao: totalNomes > 0 ? round2((totalCheckins / totalNomes) * 100) : 0,
      comissao: 0, // Comissao calculada pelo financeiro se aplicavel
    };
  });
}

// ── Staff ───────────────────────────────────────────────────────────────────

async function buildStaffMetrics(eventoId: string, tickets: TicketRow[]): Promise<StaffMemberMetrics[]> {
  const { data: equipeRows } = await supabase
    .from('equipe_evento')
    .select('membro_id, papel')
    .eq('evento_id', eventoId)
    .limit(2000);

  if (!equipeRows?.length) return [];

  const membroIds = equipeRows.map(e => e.membro_id as string);
  const profiles = await fetchProfileNames(membroIds);

  // Tickets criados por membro (vendas caixa) — campo criado_por se existir
  // Como tickets_caixa nao tem criado_por, usamos equipe + papel para contagem
  const ticketsPorOrigem = new Map<string, TicketRow[]>();
  for (const t of tickets) {
    const key = t.origem ?? 'OUTRO';
    const arr = ticketsPorOrigem.get(key) ?? [];
    arr.push(t);
    ticketsPorOrigem.set(key, arr);
  }

  return equipeRows.map(row => {
    const membroId = row.membro_id as string;
    const papel = (row.papel as string) ?? '';
    const profile = profiles.get(membroId);

    // Portaria = checkins, Caixa = vendas porta
    const isPortaria = papel === 'portaria';
    const isCaixa = papel === 'caixa';
    const usados = tickets.filter(t => t.status === 'USADO');
    const porta = tickets.filter(t => t.origem === 'PORTA' && t.status !== 'CANCELADO');

    return {
      membroId,
      membroNome: profile?.nome ?? 'Sem nome',
      papel,
      checkins: isPortaria ? usados.length : 0,
      vendasCaixa: isCaixa ? porta.length : 0,
      valorVendasCaixa: isCaixa ? round2(porta.reduce((s, t) => s + (t.valor ?? 0), 0)) : 0,
    };
  });
}

// ── Time Series (vendas_log) ────────────────────────────────────────────────

async function buildVendasTimeSeries(eventoId: string): Promise<TimeSeriesPoint[]> {
  const { data } = await supabase
    .from('vendas_log')
    .select('valor, ts')
    .eq('evento_id', eventoId)
    .order('ts', { ascending: true })
    .limit(2000);

  if (!data?.length) return [];

  const dayMap = new Map<string, number>();
  for (const row of data) {
    const ts = row.ts as string | null;
    if (!ts) continue;
    const day = ts.slice(0, 10); // YYYY-MM-DD
    dayMap.set(day, (dayMap.get(day) ?? 0) + ((row.valor as number) ?? 0));
  }

  return [...dayMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value: round2(value) }));
}

// ── Funnel ──────────────────────────────────────────────────────────────────

function buildFunnel(ev: EventoAdmin, tickets: TicketRow[]): FunnelStep[] {
  const limiteTotal = (ev.lotes ?? []).reduce((s, l) => s + (l.variacoes ?? []).reduce((sv, v) => sv + v.limite, 0), 0);
  const vendidos = tickets.filter(t => t.status !== 'CANCELADO' && t.status !== 'REEMBOLSADO').length;
  const checkins = tickets.filter(t => t.status === 'USADO').length;

  return [
    { name: 'Capacidade', value: limiteTotal, color: '#6366f1' },
    { name: 'Vendidos', value: vendidos, color: '#8b5cf6' },
    { name: 'Check-ins', value: checkins, color: '#a855f7' },
  ];
}

// ── Heatmap vendas ──────────────────────────────────────────────────────────

async function buildHeatmapVendas(eventoId: string): Promise<HeatmapCell[]> {
  const { data } = await supabase.from('vendas_log').select('ts').eq('evento_id', eventoId).limit(2000);

  if (!data?.length) return [];

  const cells = new Map<string, number>();
  for (const row of data) {
    const ts = row.ts as string | null;
    if (!ts) continue;
    const dt = new Date(ts);
    const key = `${dt.getDay()}-${dt.getHours()}`;
    cells.set(key, (cells.get(key) ?? 0) + 1);
  }

  return [...cells.entries()].map(([key, value]) => {
    const [d, h] = key.split('-');
    return { dayOfWeek: Number(d), hour: Number(h), value };
  });
}

// ── Cortesias count ─────────────────────────────────────────────────────────

async function getCortesiaCounts(eventoId: string): Promise<{ enviadas: number; usadas: number }> {
  const { data } = await supabase
    .from('tickets_caixa')
    .select('status')
    .eq('evento_id', eventoId)
    .eq('origem', 'CORTESIA')
    .limit(2000);

  const rows = data ?? [];
  return {
    enviadas: rows.length,
    usadas: rows.filter(r => (r.status as string) === 'USADO').length,
  };
}

// ── Main export ─────────────────────────────────────────────────────────────

export async function getEventAnalytics(eventoId: string): Promise<EventAnalytics | null> {
  return getCached<EventAnalytics | null>(`event-analytics-${eventoId}`, () => fetchEventAnalytics(eventoId), 30_000);
}

async function fetchEventAnalytics(eventoId: string): Promise<EventAnalytics | null> {
  const ev = eventosAdminService.getEvento(eventoId);
  if (!ev) return null;

  const temporalMode = detectTemporalMode(ev);

  // Fetch tickets + parallel data
  const [ticketsRes, revenue, listas, cortesiaCounts, promoters, vendasTS, heatmap] = await Promise.all([
    supabase
      .from('tickets_caixa')
      .select('id, variacao_id, valor, status, metodo_pagamento, origem, criado_em, usado_em')
      .eq('evento_id', eventoId)
      .limit(2000),
    buildRevenue(eventoId),
    Promise.resolve(listasService.getListasByEvento(eventoId)),
    getCortesiaCounts(eventoId),
    buildPromoterMetrics(eventoId),
    buildVendasTimeSeries(eventoId),
    buildHeatmapVendas(eventoId),
  ]);

  const tickets: TicketRow[] = (ticketsRes.data ?? []).map(row => ({
    id: row.id as string,
    variacao_id: row.variacao_id as string | null,
    valor: (row.valor as number) ?? 0,
    status: (row.status as string) ?? 'DISPONIVEL',
    metodo_pagamento: row.metodo_pagamento as string | null,
    origem: row.origem as string | null,
    criado_em: row.criado_em as string | null,
    usado_em: row.usado_em as string | null,
  }));

  const [ticketBreakdown, audience, staff] = await Promise.all([
    Promise.resolve(buildTickets(tickets, ev)),
    buildAudience(tickets, eventoId, ev.comunidadeId),
    buildStaffMetrics(eventoId, tickets),
  ]);

  const operations = buildOperational(
    tickets,
    listas.map(l => ({ convidados: l.convidados ?? [] })),
    cortesiaCounts.enviadas,
    cortesiaCounts.usadas,
  );

  const funnel = buildFunnel(ev, tickets);

  return {
    eventoId,
    eventoNome: ev.nome,
    comunidadeId: ev.comunidadeId,
    temporalMode,
    revenue,
    tickets: ticketBreakdown,
    audience,
    operations,
    promoters,
    staff,
    vendasTimeSeries: vendasTS,
    funnelConversao: funnel,
    heatmapVendas: heatmap,
  };
}
