/**
 * masterAnalyticsService — Analytics consolidado god-mode (masteradm).
 *
 * Agrega GMV, receita VANTA, custo gateway, rankings de comunidades e eventos,
 * e séries temporais de vendas globais.
 *
 * Fonte de dados: vendas_log, tickets_caixa, eventos_admin, comunidades.
 * Cache: 60s via getCached.
 */

import { supabase } from '../../../../services/supabaseClient';
import { getCached } from '../../../../services/cache';
import type {
  MasterAnalytics,
  RevenueBreakdown,
  CommunityRankingItem,
  EventoRankingItem,
  TimeSeriesPoint,
  Periodo,
} from './types';
import { getResumoFinanceiroGlobal, getResumoFinanceiroEvento, getGatewayCostGlobal } from '../eventosAdminFinanceiro';
import { eventosAdminService } from '../eventosAdminService';
import { comunidadesService } from '../comunidadesService';

// ── Helpers ──────────────────────────────────────────────────────────────────

const round2 = (x: number): number => Math.round(x * 100) / 100;

function getDateRange(periodo: Periodo): [string, string] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (periodo) {
    case 'HOJE':
      return [today.toISOString(), now.toISOString()];
    case 'SEMANA': {
      const d = today.getDay();
      const diff = d === 0 ? 6 : d - 1;
      return [new Date(today.getTime() - diff * 86400000).toISOString(), now.toISOString()];
    }
    case 'MES':
      return [new Date(now.getFullYear(), now.getMonth(), 1).toISOString(), now.toISOString()];
    case 'ANO':
      return [new Date(now.getFullYear(), 0, 1).toISOString(), now.toISOString()];
  }
}

/** Extrai YYYY-MM-DD de um ISO string */
function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

// ── Tipos auxiliares internos ────────────────────────────────────────────────

interface VendaLogRow {
  evento_id: string;
  valor: number;
  ts: string;
  origem: string;
}

interface ComunidadeAcc {
  comunidadeId: string;
  comunidadeNome: string;
  comunidadeFoto?: string;
  gmv: number;
  taxaVanta: number;
  eventos: Set<string>;
  tickets: number;
}

// ── Taxas VANTA (percentual sobre venda online) ─────────────────────────────

/** Taxa VANTA padrão sobre vendas online (10%) */
const TAXA_VANTA_PERCENT = 0.1;

function calcTaxaVanta(valor: number, origem: string): number {
  // Taxa VANTA se aplica apenas a vendas online (não porta/cortesia/lista)
  if (origem === 'CAIXA' || origem === 'CORTESIA' || origem === 'LISTA') return 0;
  return round2(valor * TAXA_VANTA_PERCENT);
}

// ── Fetch vendas_log com filtro de período ───────────────────────────────────

async function fetchVendasLog(inicio: string, fim: string): Promise<VendaLogRow[]> {
  const { data } = await supabase
    .from('vendas_log')
    .select('evento_id, valor, ts, origem')
    .gte('ts', inicio)
    .lte('ts', fim)
    .order('ts', { ascending: true })
    .limit(2000);

  return (data ?? []).map(row => ({
    evento_id: row.evento_id,
    valor: Number(row.valor ?? 0),
    ts: row.ts,
    origem: row.origem ?? '',
  }));
}

// ── Build comunidades ranking ────────────────────────────────────────────────

function buildComunidadesRanking(
  vendas: VendaLogRow[],
  eventoToComunidade: Map<string, string>,
  comunidadeNames: Map<string, { nome: string; foto: string }>,
): CommunityRankingItem[] {
  const acc = new Map<string, ComunidadeAcc>();

  for (const v of vendas) {
    const comId = eventoToComunidade.get(v.evento_id);
    if (!comId) continue;

    let entry = acc.get(comId);
    if (!entry) {
      const info = comunidadeNames.get(comId);
      entry = {
        comunidadeId: comId,
        comunidadeNome: info?.nome ?? '',
        comunidadeFoto: info?.foto,
        gmv: 0,
        taxaVanta: 0,
        eventos: new Set(),
        tickets: 0,
      };
      acc.set(comId, entry);
    }

    entry.gmv += v.valor;
    entry.taxaVanta += calcTaxaVanta(v.valor, v.origem);
    entry.eventos.add(v.evento_id);
    entry.tickets += 1;
  }

  return Array.from(acc.values())
    .map(e => ({
      comunidadeId: e.comunidadeId,
      comunidadeNome: e.comunidadeNome,
      comunidadeFoto: e.comunidadeFoto,
      gmv: round2(e.gmv),
      taxaVanta: round2(e.taxaVanta),
      eventos: e.eventos.size,
      tickets: e.tickets,
    }))
    .sort((a, b) => b.gmv - a.gmv);
}

// ── Build vendas time series ─────────────────────────────────────────────────

function buildVendasTimeSeries(vendas: VendaLogRow[]): TimeSeriesPoint[] {
  const dailyMap = new Map<string, number>();

  for (const v of vendas) {
    const key = toDateKey(v.ts);
    dailyMap.set(key, (dailyMap.get(key) ?? 0) + v.valor);
  }

  return Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value: round2(value) }));
}

// ── Build top eventos ────────────────────────────────────────────────────────

function buildTopEventos(
  vendas: VendaLogRow[],
  eventoNames: Map<string, { nome: string; dataInicio: string }>,
): EventoRankingItem[] {
  const acc = new Map<string, { receita: number; vendidos: number; checkinRate: number }>();

  for (const v of vendas) {
    const entry = acc.get(v.evento_id) ?? { receita: 0, vendidos: 0, checkinRate: 0 };
    entry.receita += v.valor;
    entry.vendidos += 1;
    acc.set(v.evento_id, entry);
  }

  return Array.from(acc.entries())
    .map(([eventoId, stats]) => {
      const info = eventoNames.get(eventoId);
      return {
        eventoId,
        eventoNome: info?.nome ?? '',
        dataInicio: info?.dataInicio ?? '',
        receita: round2(stats.receita),
        vendidos: stats.vendidos,
        checkinRate: 0, // Preenchido separadamente se necessário
      };
    })
    .sort((a, b) => b.receita - a.receita)
    .slice(0, 10);
}

// ── Enriquecer top eventos com check-in rate ─────────────────────────────────

async function enrichCheckinRates(topEventos: EventoRankingItem[]): Promise<void> {
  if (topEventos.length === 0) return;

  const ids = topEventos.map(e => e.eventoId);

  // Total tickets por evento
  const { data: ticketsData } = await supabase
    .from('tickets_caixa')
    .select('evento_id, status, usado_em')
    .in('evento_id', ids)
    .in('status', ['DISPONIVEL', 'USADO'])
    .limit(2000);

  if (!ticketsData) return;

  const totals = new Map<string, { total: number; usado: number }>();
  for (const t of ticketsData) {
    const entry = totals.get(t.evento_id) ?? { total: 0, usado: 0 };
    entry.total += 1;
    if (t.usado_em) entry.usado += 1;
    totals.set(t.evento_id, entry);
  }

  for (const ev of topEventos) {
    const stats = totals.get(ev.eventoId);
    if (stats && stats.total > 0) {
      ev.checkinRate = round2((stats.usado / stats.total) * 100);
    }
  }
}

// ── Build revenue breakdown global ──────────────────────────────────────────

function buildRevenueBreakdown(
  resumoGlobal: Awaited<ReturnType<typeof getResumoFinanceiroGlobal>>,
  gatewayCost: Awaited<ReturnType<typeof getGatewayCostGlobal>>,
): RevenueBreakdown {
  return {
    receitaBruta: round2(resumoGlobal.receitaBruta),
    receitaListas: round2(resumoGlobal.receitaListas),
    custoGateway: round2(gatewayCost.totalCusto),
    totalReembolsado: 0, // Calculado no financeiro detalhado
    totalChargebacks: 0,
    receitaLiquida: round2(resumoGlobal.receitaLiquida),
    taxaVanta: round2(resumoGlobal.taxaVanta),
    splitProdutor: round2(resumoGlobal.splitProdutor),
    splitSocio: round2(resumoGlobal.splitSocio),
    saquesProcessados: round2(resumoGlobal.saquesProcessados),
    saquesPendentes: round2(resumoGlobal.saquesPendentes),
    saldoDisponivel: round2(resumoGlobal.saldoDisponivel),
  };
}

// ── Lookup maps ──────────────────────────────────────────────────────────────

function buildEventoToComunidadeMap(eventos: ReturnType<typeof eventosAdminService.getEventos>): Map<string, string> {
  const map = new Map<string, string>();
  for (const ev of eventos) {
    map.set(ev.id, ev.comunidadeId);
  }
  return map;
}

function buildEventoNamesMap(
  eventos: ReturnType<typeof eventosAdminService.getEventos>,
): Map<string, { nome: string; dataInicio: string }> {
  const map = new Map<string, { nome: string; dataInicio: string }>();
  for (const ev of eventos) {
    map.set(ev.id, { nome: ev.nome, dataInicio: ev.dataInicio });
  }
  return map;
}

function buildComunidadeNamesMap(
  comunidades: ReturnType<typeof comunidadesService.getAll>,
): Map<string, { nome: string; foto: string }> {
  const map = new Map<string, { nome: string; foto: string }>();
  for (const c of comunidades) {
    map.set(c.id, { nome: c.nome, foto: c.foto });
  }
  return map;
}

// ── Main export ──────────────────────────────────────────────────────────────

export async function getMasterAnalytics(periodo: Periodo): Promise<MasterAnalytics> {
  return getCached(
    `analytics:master:${periodo}`,
    async () => {
      const [inicio, fim] = getDateRange(periodo);

      // Garantir que services estejam prontos
      if (!eventosAdminService.isReady) await eventosAdminService.refresh();
      if (!comunidadesService.isReady) await comunidadesService.refresh();

      // Dados base
      const eventos = eventosAdminService.getEventos();
      const comunidades = comunidadesService.getAll();

      // Lookup maps
      const eventoToComunidade = buildEventoToComunidadeMap(eventos);
      const eventoNames = buildEventoNamesMap(eventos);
      const comunidadeNames = buildComunidadeNamesMap(comunidades);

      // Fetch vendas no período + financeiro global + gateway cost
      const [vendas, resumoGlobal, gatewayCost] = await Promise.all([
        fetchVendasLog(inicio, fim),
        getResumoFinanceiroGlobal(),
        getGatewayCostGlobal(),
      ]);

      // Rankings e séries temporais
      const comunidadesRanking = buildComunidadesRanking(vendas, eventoToComunidade, comunidadeNames);
      const vendasTimeSeries = buildVendasTimeSeries(vendas);
      const topEventos = buildTopEventos(vendas, eventoNames);

      // Enriquecer top eventos com check-in rate
      await enrichCheckinRates(topEventos);

      // Totais
      const gmvTotal = round2(vendas.reduce((sum, v) => sum + v.valor, 0));
      const receitaVanta = round2(vendas.reduce((sum, v) => sum + calcTaxaVanta(v.valor, v.origem), 0));
      const custoGatewayGlobal = round2(gatewayCost.totalCusto);
      const lucroVanta = round2(receitaVanta - custoGatewayGlobal);

      // Contagens
      const eventosNoPeriodo = new Set(vendas.map(v => v.evento_id));
      const totalTickets = vendas.length;
      const comunidadesNoPeriodo = new Set(vendas.map(v => eventoToComunidade.get(v.evento_id)).filter(Boolean));

      // Revenue breakdown
      const revenue = buildRevenueBreakdown(resumoGlobal, gatewayCost);

      return {
        periodo,
        gmvTotal,
        receitaVanta,
        custoGatewayGlobal,
        lucroVanta,
        totalEventos: eventosNoPeriodo.size,
        totalTickets,
        totalComunidades: comunidadesNoPeriodo.size,
        comunidadesRanking,
        vendasTimeSeries,
        topEventos,
        revenue,
      };
    },
    60_000,
  );
}
