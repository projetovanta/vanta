/**
 * maisVantaAnalyticsService — Analytics do clube MAIS VANTA.
 *
 * Métricas de assinatura: MRR, churn, LTV, distribuição por tier,
 * resgates, deals, parceiros, séries temporais e retenção por cohort.
 *
 * Fonte de dados: membros_clube, planos_mais_vanta, deals_mais_vanta,
 *   resgates_mais_vanta, parceiros_mais_vanta.
 * Cache: 60s via getCached.
 */

import { supabase } from '../../../../services/supabaseClient';
import { getCached } from '../../../../services/cache';
import type { MaisVantaAnalytics, TierDistributionItem, CohortRow, TimeSeriesPoint, Periodo } from './types';

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

/** Extrai YYYY-MM de um ISO string */
function toMonthKey(iso: string): string {
  return iso.slice(0, 7);
}

/** Extrai YYYY-MM-DD de um ISO string */
function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

// ── Cores dos tiers ──────────────────────────────────────────────────────────

const TIER_COLORS: Record<string, string> = {
  lista: '#6366f1',
  presenca: '#8b5cf6',
  social: '#a855f7',
  creator: '#d946ef',
  black: '#1a1a2e',
};

// ── Tipos internos ───────────────────────────────────────────────────────────

interface MembroRow {
  id: string;
  user_id: string;
  tier: string;
  status: string;
  ativo: boolean;
  aprovado_em: string;
  banido_em: string | null;
}

interface PlanoRow {
  id: string;
  nome: string;
  tier_minimo: string;
  preco_mensal: number;
  ativo: boolean;
}

// ── Fetch membros ────────────────────────────────────────────────────────────

async function fetchMembros(): Promise<MembroRow[]> {
  const { data } = await supabase
    .from('membros_clube')
    .select('id, user_id, tier, status, ativo, aprovado_em, banido_em')
    .limit(2000);

  return (data ?? []).map(row => ({
    id: row.id,
    user_id: row.user_id,
    tier: row.tier ?? '',
    status: row.status ?? '',
    ativo: row.ativo ?? false,
    aprovado_em: row.aprovado_em ?? '',
    banido_em: row.banido_em,
  }));
}

// ── Fetch planos (para preços por tier) ──────────────────────────────────────

async function fetchPlanos(): Promise<PlanoRow[]> {
  const { data } = await supabase
    .from('planos_mais_vanta')
    .select('id, nome, tier_minimo, preco_mensal, ativo')
    .limit(50);

  return (data ?? []).map(row => ({
    id: row.id,
    nome: row.nome ?? '',
    tier_minimo: row.tier_minimo ?? '',
    preco_mensal: Number(row.preco_mensal ?? 0),
    ativo: row.ativo ?? false,
  }));
}

// ── Fetch resgates no período ────────────────────────────────────────────────

async function fetchResgatesCount(inicio: string, fim: string): Promise<number> {
  const { data } = await supabase
    .from('resgates_mais_vanta')
    .select('id')
    .gte('aplicado_em', inicio)
    .lte('aplicado_em', fim)
    .limit(2000);

  return data?.length ?? 0;
}

// ── Fetch deals ativos ──────────────────────────────────────────────────────

async function fetchDealsAtivos(): Promise<number> {
  const { data } = await supabase.from('deals_mais_vanta').select('id').eq('status', 'ATIVO').limit(2000);

  return data?.length ?? 0;
}

// ── Fetch parceiros ativos ──────────────────────────────────────────────────

async function fetchParceirosAtivos(): Promise<number> {
  const { data } = await supabase.from('parceiros_mais_vanta').select('id').eq('ativo', true).limit(2000);

  return data?.length ?? 0;
}

// ── Preço estimado por tier ─────────────────────────────────────────────────

function buildTierPriceMap(planos: PlanoRow[]): Map<string, number> {
  const map = new Map<string, number>();

  // Usar o plano ativo com menor preço para cada tier
  // planos_mais_vanta.tier_minimo indica qual tier mínimo o plano exige
  // Vamos mapear tier → preco_mensal do plano correspondente
  for (const plano of planos) {
    if (!plano.ativo) continue;
    const existing = map.get(plano.tier_minimo);
    if (existing === undefined || plano.preco_mensal < existing) {
      map.set(plano.tier_minimo, plano.preco_mensal);
    }
  }

  return map;
}

function getTierPrice(tier: string, tierPriceMap: Map<string, number>): number {
  return tierPriceMap.get(tier) ?? 0;
}

// ── Tier distribution ───────────────────────────────────────────────────────

function buildTierDistribution(membrosAtivos: MembroRow[], tierPriceMap: Map<string, number>): TierDistributionItem[] {
  const total = membrosAtivos.length;
  if (total === 0) return [];

  const tierCounts = new Map<string, number>();

  for (const m of membrosAtivos) {
    tierCounts.set(m.tier, (tierCounts.get(m.tier) ?? 0) + 1);
  }

  return Array.from(tierCounts.entries())
    .map(([tier, membros]) => {
      const preco = getTierPrice(tier, tierPriceMap);
      return {
        tier,
        membros,
        receita: round2(membros * preco),
        percentual: round2((membros / total) * 100),
        color: TIER_COLORS[tier] ?? '#888888',
      };
    })
    .sort((a, b) => b.membros - a.membros);
}

// ── MRR calculation ─────────────────────────────────────────────────────────

function calcMRR(membrosAtivos: MembroRow[], tierPriceMap: Map<string, number>): number {
  let mrr = 0;
  for (const m of membrosAtivos) {
    mrr += getTierPrice(m.tier, tierPriceMap);
  }
  return round2(mrr);
}

// ── Churn calculation ───────────────────────────────────────────────────────

function calcChurn(membros: MembroRow[], inicio: string, fim: string): { churnRate: number; cancelamentos: number } {
  // Membros que tinham status ATIVO antes do período e agora têm CANCELADO/BANIDO
  // Aproximação: membros com banido_em no período OU status não ATIVO com aprovado_em antes do período
  const cancelados = membros.filter(m => {
    // Membro cancelado/banido durante o período
    if (m.status === 'CANCELADO' || m.status === 'BANIDO' || m.status === 'SUSPENSO') {
      if (m.banido_em && m.banido_em >= inicio && m.banido_em <= fim) {
        return true;
      }
      // Se aprovado antes do período mas não ativo, considerar como churn
      if (m.aprovado_em < inicio && !m.ativo) {
        return true;
      }
    }
    return false;
  });

  // Total no início do período: membros aprovados antes do início
  const totalInicio = membros.filter(m => m.aprovado_em < inicio).length;
  const cancelamentos = cancelados.length;
  const churnRate = totalInicio > 0 ? round2((cancelamentos / totalInicio) * 100) : 0;

  return { churnRate, cancelamentos };
}

// ── LTV calculation ─────────────────────────────────────────────────────────

function calcLTV(membros: MembroRow[], tierPriceMap: Map<string, number>): number {
  if (membros.length === 0) return 0;

  const now = Date.now();

  // Média de meses ativos
  let totalMonths = 0;
  let totalValor = 0;
  let count = 0;

  for (const m of membros) {
    if (!m.aprovado_em) continue;

    const start = new Date(m.aprovado_em).getTime();
    let end: number;

    if (m.ativo && m.status === 'ATIVO') {
      end = now;
    } else if (m.banido_em) {
      end = new Date(m.banido_em).getTime();
    } else {
      // Se não ativo e sem banido_em, estimar 3 meses
      end = start + 3 * 30 * 86400000;
    }

    const months = Math.max(1, (end - start) / (30 * 86400000));
    const preco = getTierPrice(m.tier, tierPriceMap);

    totalMonths += months;
    totalValor += preco;
    count += 1;
  }

  if (count === 0) return 0;

  const avgMonths = totalMonths / count;
  const avgValor = totalValor / count;

  return round2(avgValor * avgMonths);
}

// ── MRR Time Series ─────────────────────────────────────────────────────────

function buildMrrTimeSeries(membros: MembroRow[], tierPriceMap: Map<string, number>): TimeSeriesPoint[] {
  // Agrupar membros por mês de aprovação
  // Para cada mês, calcular MRR acumulado
  const monthlyNew = new Map<string, { ativos: number; mrr: number }>();

  // Ordenar por aprovado_em
  const sorted = [...membros].sort((a, b) => a.aprovado_em.localeCompare(b.aprovado_em));

  for (const m of sorted) {
    if (!m.aprovado_em) continue;
    const monthKey = toMonthKey(m.aprovado_em);
    const entry = monthlyNew.get(monthKey) ?? { ativos: 0, mrr: 0 };

    if (m.ativo && m.status === 'ATIVO') {
      entry.ativos += 1;
      entry.mrr += getTierPrice(m.tier, tierPriceMap);
    }

    monthlyNew.set(monthKey, entry);
  }

  // Calcular MRR acumulado por mês
  const months = Array.from(monthlyNew.keys()).sort();
  let accMrr = 0;

  return months.map(month => {
    const entry = monthlyNew.get(month);
    accMrr += entry?.mrr ?? 0;
    return { date: month, value: round2(accMrr) };
  });
}

// ── Membros Time Series ─────────────────────────────────────────────────────

function buildMembrosTimeSeries(membros: MembroRow[], inicio: string, fim: string): TimeSeriesPoint[] {
  const dailyMap = new Map<string, number>();

  for (const m of membros) {
    if (!m.aprovado_em) continue;
    if (m.aprovado_em < inicio || m.aprovado_em > fim) continue;

    const key = toDateKey(m.aprovado_em);
    dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);
  }

  return Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }));
}

// ── Retention Cohort ────────────────────────────────────────────────────────

function buildRetencaoCohort(membros: MembroRow[]): CohortRow[] {
  // Agrupar membros por mês de aprovação (cohort)
  const cohorts = new Map<string, MembroRow[]>();

  for (const m of membros) {
    if (!m.aprovado_em) continue;
    const cohortKey = toMonthKey(m.aprovado_em);
    const arr = cohorts.get(cohortKey) ?? [];
    arr.push(m);
    cohorts.set(cohortKey, arr);
  }

  const now = new Date();
  const nowMonthKey = toMonthKey(now.toISOString());

  // Calcular retenção para cada cohort
  const rows: CohortRow[] = [];

  for (const [cohort, members] of cohorts) {
    if (members.length === 0) continue;

    const cohortDate = new Date(cohort + '-01');
    const totalInCohort = members.length;

    // Quantos meses desde o cohort até agora
    const nowDate = new Date(nowMonthKey + '-01');
    const monthsDiff =
      (nowDate.getFullYear() - cohortDate.getFullYear()) * 12 + (nowDate.getMonth() - cohortDate.getMonth());

    // Limitar a 12 meses de retenção
    const maxMonths = Math.min(monthsDiff, 12);
    const retention: number[] = [];

    for (let i = 0; i <= maxMonths; i++) {
      const checkDate = new Date(cohortDate.getFullYear(), cohortDate.getMonth() + i, 1);
      const checkMonthEnd = new Date(
        checkDate.getFullYear(),
        checkDate.getMonth() + 1,
        0, // Último dia do mês
      );

      // Membros do cohort que ainda estavam ativos neste mês
      const ativos = members.filter(m => {
        // Membro ainda ativo agora = conta como retido em todos os meses
        if (m.ativo && m.status === 'ATIVO') return true;

        // Membro cancelado/banido: verificar se a saída foi depois deste mês
        if (m.banido_em) {
          return new Date(m.banido_em) >= checkMonthEnd;
        }

        // Se não ativo e sem banido_em, considerar que saiu no mês do cohort
        return i === 0;
      });

      retention.push(round2((ativos.length / totalInCohort) * 100));
    }

    rows.push({ cohort, retention });
  }

  // Ordenar por cohort mais recente primeiro
  rows.sort((a, b) => b.cohort.localeCompare(a.cohort));

  // Limitar a últimos 12 cohorts
  return rows.slice(0, 12);
}

// ── Main export ──────────────────────────────────────────────────────────────

export async function getMaisVantaAnalytics(periodo: Periodo): Promise<MaisVantaAnalytics> {
  return getCached(
    `analytics:maisvanta:${periodo}`,
    async () => {
      const [inicio, fim] = getDateRange(periodo);

      // Fetch dados em paralelo
      const [membros, planos, resgatesTotal, dealsAtivos, parceirosAtivos] = await Promise.all([
        fetchMembros(),
        fetchPlanos(),
        fetchResgatesCount(inicio, fim),
        fetchDealsAtivos(),
        fetchParceirosAtivos(),
      ]);

      // Mapa de preços por tier
      const tierPriceMap = buildTierPriceMap(planos);

      // Membros ativos
      const membrosAtivos = membros.filter(m => m.ativo && m.status === 'ATIVO');

      // Novos membros no período
      const novosMembros = membros.filter(m => m.aprovado_em >= inicio && m.aprovado_em <= fim).length;

      // Total e MRR
      const totalMembros = membrosAtivos.length;
      const mrrAtual = calcMRR(membrosAtivos, tierPriceMap);

      // Churn
      const { churnRate, cancelamentos } = calcChurn(membros, inicio, fim);

      // LTV
      const ltv = calcLTV(membros, tierPriceMap);

      // Tier distribution
      const tierDistribution = buildTierDistribution(membrosAtivos, tierPriceMap);

      // Time series
      const mrrTimeSeries = buildMrrTimeSeries(membros, tierPriceMap);
      const membrosTimeSeries = buildMembrosTimeSeries(membros, inicio, fim);

      // Retention cohort
      const retencaoCohort = buildRetencaoCohort(membros);

      return {
        periodo,
        totalMembros,
        mrrAtual,
        churnRate,
        ltv,
        novosMembros,
        cancelamentos,
        tierDistribution,
        resgatesTotal,
        dealsAtivos,
        parceirosAtivos,
        mrrTimeSeries,
        membrosTimeSeries,
        retencaoCohort,
      };
    },
    60_000,
  );
}
