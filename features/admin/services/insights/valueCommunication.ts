/**
 * Módulo D — Value Communication
 * 4 features: Relatório Semanal, Painel Valor VANTA, Dicas Inteligentes, Benchmark
 * Consome módulos A (insights) e B (financial) — read-only.
 */
import { supabase } from '../../../../services/supabaseClient';
import { getCached } from '../../../../services/cache';
import { EVENTOS_ADMIN } from '../eventosAdminCore';
import { getClientScores, getTrendAlerts, getNoShowAnalysis } from './insightsEngine';
import { getPricingSuggestion, getBreakEvenProjection } from './financialIntelligence';
import { generateTips } from './smartTipsRules';
import type {
  WeeklyReport,
  VantaValueMetrics,
  PlatformBenchmarks,
  BenchmarkComparison,
  BenchmarkItem,
  Periodo,
} from './valueTypes';
import type { SmartTip } from './valueTypes';

/** Timestamp BRT -03:00 */
const nowBRT = () => new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00';

/** Formata Date como YYYY-MM-DD (apenas formatação local, não vai pro banco) */
const fmtDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// ════════════════════════════════════════════════════
// D1: Relatório Semanal
// ════════════════════════════════════════════════════

export async function generateWeeklyReport(comunidadeId: string): Promise<WeeklyReport> {
  return getCached(
    `weekly-report-${comunidadeId}`,
    async () => {
      const now = new Date();
      const startThisWeek = new Date(now);
      startThisWeek.setDate(now.getDate() - now.getDay());
      startThisWeek.setHours(0, 0, 0, 0);

      const startLastWeek = new Date(startThisWeek);
      startLastWeek.setDate(startLastWeek.getDate() - 7);

      const eventoIds = EVENTOS_ADMIN.filter(e => e.comunidadeId === comunidadeId).map(e => e.id);

      if (!eventoIds.length) {
        return emptyReport(comunidadeId, startThisWeek, now);
      }

      const thisWeekFilter =
        startThisWeek.toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00';
      const lastWeekFilter =
        startLastWeek.toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00';

      const { data: thisWeekTickets } = await supabase
        .from('tickets_caixa')
        .select('status, valor')
        .in('evento_id', eventoIds)
        .gte('criado_em', thisWeekFilter)
        .in('status', ['DISPONIVEL', 'USADO'])
        .not('origem', 'in', '("CORTESIA","CAIXA")');

      const { data: lastWeekTickets } = await supabase
        .from('tickets_caixa')
        .select('status, valor')
        .in('evento_id', eventoIds)
        .gte('criado_em', lastWeekFilter)
        .lt('criado_em', thisWeekFilter)
        .in('status', ['DISPONIVEL', 'USADO'])
        .not('origem', 'in', '("CORTESIA","CAIXA")');

      const tw = thisWeekTickets ?? [];
      const lw = lastWeekTickets ?? [];

      const twVendas = tw.length;
      const lwVendas = lw.length;
      const twReceita = tw.reduce((s, t) => s + t.valor, 0);
      const lwReceita = lw.reduce((s, t) => s + t.valor, 0);
      const twCheckins = tw.filter(t => t.status === 'USADO').length;
      const lwCheckins = lw.filter(t => t.status === 'USADO').length;
      const twNoShow = twVendas > 0 ? ((twVendas - twCheckins) / twVendas) * 100 : 0;

      const pctDelta = (curr: number, prev: number) => (prev > 0 ? ((curr - prev) / prev) * 100 : 0);

      const topScores = await getClientScores(comunidadeId, 3);
      const alertas = await getTrendAlerts(comunidadeId);

      return {
        comunidadeId,
        semanaInicio: fmtDate(startThisWeek),
        semanaFim: fmtDate(now),
        vendas: {
          total: twVendas,
          delta: Math.round(pctDelta(twVendas, lwVendas) * 10) / 10,
          receita: twReceita,
          receitaDelta: Math.round(pctDelta(twReceita, lwReceita) * 10) / 10,
        },
        publico: {
          checkins: twCheckins,
          checkinsDelta: Math.round(pctDelta(twCheckins, lwCheckins) * 10) / 10,
          taxaNoShow: Math.round(twNoShow * 10) / 10,
        },
        topPromoters: topScores.map(s => ({ nome: s.nome, vendas: s.frequencia })),
        topClientes: topScores.map(s => ({ nome: s.nome, score: s.score })),
        alertas,
        geradoEm: nowBRT(),
      };
    },
    300_000,
  );
}

function emptyReport(comunidadeId: string, start: Date, end: Date): WeeklyReport {
  return {
    comunidadeId,
    semanaInicio: fmtDate(start),
    semanaFim: fmtDate(end),
    vendas: { total: 0, delta: 0, receita: 0, receitaDelta: 0 },
    publico: { checkins: 0, checkinsDelta: 0, taxaNoShow: 0 },
    topPromoters: [],
    topClientes: [],
    alertas: [],
    geradoEm: nowBRT(),
  };
}

// ════════════════════════════════════════════════════
// D2: Painel Valor VANTA
// ════════════════════════════════════════════════════

export async function getVantaValueMetrics(comunidadeId: string, _periodo: Periodo): Promise<VantaValueMetrics> {
  return getCached(
    `vanta-value-${comunidadeId}`,
    async () => {
      const eventos = EVENTOS_ADMIN.filter(e => e.comunidadeId === comunidadeId);
      const eventoIds = eventos.map(e => e.id);

      let ticketsProcessados = 0;
      if (eventoIds.length) {
        const { count } = await supabase
          .from('tickets_caixa')
          .select('*', { count: 'exact', head: true })
          .in('evento_id', eventoIds);
        ticketsProcessados = count ?? 0;
      }

      const alertas = await getTrendAlerts(comunidadeId);
      const insightsGerados = alertas.length + Math.floor(eventos.length * 2.5);
      const tempoEconomizadoHoras = eventos.length * 3;
      const operacoesAutomatizadas = ticketsProcessados * 2;

      return {
        comunidadeId,
        periodo: _periodo,
        insightsGerados,
        tempoEconomizadoHoras,
        operacoesAutomatizadas,
        receitaOtimizada: 0,
        eventosGerenciados: eventos.length,
        ticketsProcessados,
      };
    },
    300_000,
  );
}

// ════════════════════════════════════════════════════
// D3: Dicas Inteligentes
// ════════════════════════════════════════════════════

export async function getSmartTips(comunidadeId: string, eventoId?: string): Promise<SmartTip[]> {
  const key = eventoId ? `tips-${eventoId}` : `tips-com-${comunidadeId}`;
  return getCached(
    key,
    async () => {
      const targetEventoId = eventoId ?? EVENTOS_ADMIN.find(e => e.comunidadeId === comunidadeId)?.id;
      if (!targetEventoId) return [];

      const ev = EVENTOS_ADMIN.find(e => e.id === targetEventoId);

      const [noShow, pricing, breakEven] = await Promise.all([
        getNoShowAnalysis(targetEventoId).catch(() => undefined),
        getPricingSuggestion(targetEventoId).catch(() => null),
        getBreakEvenProjection(targetEventoId).catch(() => null),
      ]);

      let vendidoPercent = 0;
      let cortesiasPercent = 0;
      if (ev) {
        let capacidade = 0;
        let vendidos = 0;
        for (const lote of ev.lotes) {
          if (!lote.ativo) continue;
          for (const v of lote.variacoes) {
            capacidade += v.limite;
            vendidos += v.vendidos;
          }
        }
        vendidoPercent = capacidade > 0 ? (vendidos / capacidade) * 100 : 0;

        const { count: totalTickets } = await supabase
          .from('tickets_caixa')
          .select('*', { count: 'exact', head: true })
          .eq('evento_id', targetEventoId)
          .in('status', ['DISPONIVEL', 'USADO']);

        const { count: cortesias } = await supabase
          .from('tickets_caixa')
          .select('*', { count: 'exact', head: true })
          .eq('evento_id', targetEventoId)
          .eq('origem', 'CORTESIA')
          .in('status', ['DISPONIVEL', 'USADO']);

        const tot = totalTickets ?? 0;
        const cort = cortesias ?? 0;
        cortesiasPercent = tot > 0 ? (cort / tot) * 100 : 0;
      }

      const diasParaEvento = ev ? Math.ceil((new Date(ev.dataInicio).getTime() - Date.now()) / 86_400_000) : undefined;

      const checkinRate = noShow
        ? noShow.totalVendidos > 0
          ? (noShow.totalUsados / noShow.totalVendidos) * 100
          : 0
        : undefined;

      return generateTips({
        noShow,
        pricing,
        breakEven,
        ticketMedio: breakEven?.ticketMedio,
        checkinRate,
        vendidoPercent,
        diasParaEvento: diasParaEvento ?? undefined,
        cortesiasPercent,
      });
    },
    60_000,
  );
}

// ════════════════════════════════════════════════════
// D4: Benchmark
// ════════════════════════════════════════════════════

async function getPlatformBenchmarks(): Promise<PlatformBenchmarks> {
  return getCached(
    'platform-benchmarks',
    async () => {
      const { data: finalizados } = await supabase.from('eventos_admin').select('id').eq('status_evento', 'FINALIZADO');

      const eventoIds = finalizados?.map(e => e.id) ?? [];
      if (!eventoIds.length) {
        return { checkinRateMedio: 0, ticketMedio: 0, noShowMedio: 0, taxaLotacaoMedia: 0, totalEventos: 0 };
      }

      const { data: tickets } = await supabase
        .from('tickets_caixa')
        .select('status, valor')
        .in('evento_id', eventoIds)
        .in('status', ['DISPONIVEL', 'USADO'])
        .not('origem', 'in', '("CORTESIA","CAIXA")');

      const all = tickets ?? [];
      const total = all.length;
      const usados = all.filter(t => t.status === 'USADO').length;
      const receita = all.reduce((s, t) => s + t.valor, 0);

      return {
        checkinRateMedio: total > 0 ? (usados / total) * 100 : 0,
        ticketMedio: total > 0 ? receita / total : 0,
        noShowMedio: total > 0 ? ((total - usados) / total) * 100 : 0,
        taxaLotacaoMedia: 0,
        totalEventos: eventoIds.length,
      };
    },
    600_000,
  );
}

export async function getBenchmarkComparison(comunidadeId: string): Promise<BenchmarkComparison> {
  return getCached(
    `benchmark-${comunidadeId}`,
    async () => {
      const plataforma = await getPlatformBenchmarks();

      const eventoIds = EVENTOS_ADMIN.filter(
        e => e.comunidadeId === comunidadeId && e.statusEvento === 'FINALIZADO',
      ).map(e => e.id);

      let comCheckinRate = 0;
      let comTicketMedio = 0;
      let comNoShow = 0;

      if (eventoIds.length) {
        const { data: tickets } = await supabase
          .from('tickets_caixa')
          .select('status, valor')
          .in('evento_id', eventoIds)
          .in('status', ['DISPONIVEL', 'USADO'])
          .not('origem', 'in', '("CORTESIA","CAIXA")');

        const all = tickets ?? [];
        const total = all.length;
        const usados = all.filter(t => t.status === 'USADO').length;
        const receita = all.reduce((s, t) => s + t.valor, 0);

        comCheckinRate = total > 0 ? (usados / total) * 100 : 0;
        comTicketMedio = total > 0 ? receita / total : 0;
        comNoShow = total > 0 ? ((total - usados) / total) * 100 : 0;
      }

      const calcDelta = (com: number, plat: number) => (plat > 0 ? ((com - plat) / plat) * 100 : 0);

      const metricas: BenchmarkItem[] = [
        {
          metrica: 'checkin_rate',
          label: 'Taxa de Check-in',
          valorComunidade: Math.round(comCheckinRate * 10) / 10,
          valorPlataforma: Math.round(plataforma.checkinRateMedio * 10) / 10,
          delta: Math.round(calcDelta(comCheckinRate, plataforma.checkinRateMedio) * 10) / 10,
          melhor: comCheckinRate >= plataforma.checkinRateMedio,
        },
        {
          metrica: 'ticket_medio',
          label: 'Ticket Médio',
          valorComunidade: Math.round(comTicketMedio * 100) / 100,
          valorPlataforma: Math.round(plataforma.ticketMedio * 100) / 100,
          delta: Math.round(calcDelta(comTicketMedio, plataforma.ticketMedio) * 10) / 10,
          melhor: comTicketMedio >= plataforma.ticketMedio,
        },
        {
          metrica: 'no_show',
          label: 'Taxa de No-Show',
          valorComunidade: Math.round(comNoShow * 10) / 10,
          valorPlataforma: Math.round(plataforma.noShowMedio * 10) / 10,
          delta: Math.round(calcDelta(comNoShow, plataforma.noShowMedio) * 10) / 10,
          melhor: comNoShow <= plataforma.noShowMedio,
        },
      ];

      return { comunidadeId, metricas };
    },
    300_000,
  );
}
