/**
 * dashboardAnalyticsService — métricas do dashboard master com filtros temporais.
 *
 * Consulta Supabase com filtros de data e retorna contagens + período anterior
 * para cálculo de delta comparativo (hoje vs ontem, semana vs semana passada, etc.).
 */

import { supabase } from '../../../services/supabaseClient';

export type Periodo = 'HOJE' | 'SEMANA' | 'MES' | 'ANO';

export interface MetricaPar {
  atual: number;
  anterior: number;
}

export interface DashboardMetrics {
  comunidades: MetricaPar;
  eventos: MetricaPar;
  membrosNovos: MetricaPar;
  membrosCurados: MetricaPar;
  vendaConvites: MetricaPar;
  lucroVanta: MetricaPar; // em R$
}

const PERIODO_LABELS: Record<Periodo, string> = {
  HOJE: 'vs ontem',
  SEMANA: 'vs semana passada',
  MES: 'vs mês passado',
  ANO: 'vs ano passado',
};

export const getPeriodoLabel = (p: Periodo): string => PERIODO_LABELS[p];

// ── Helpers de data ──────────────────────────────────────────────────────────

/** Retorna [inicioAtual, fimAtual, inicioAnterior, fimAnterior] como ISO strings */
const getDateRanges = (periodo: Periodo): [string, string, string, string] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let inicioAtual: Date;
  let fimAtual: Date;
  let inicioAnterior: Date;
  let fimAnterior: Date;

  switch (periodo) {
    case 'HOJE': {
      inicioAtual = today;
      fimAtual = now;
      inicioAnterior = new Date(today.getTime() - 86400000);
      fimAnterior = new Date(today.getTime() - 1);
      break;
    }
    case 'SEMANA': {
      const dayOfWeek = today.getDay();
      const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      inicioAtual = new Date(today.getTime() - diffToMonday * 86400000);
      fimAtual = now;
      inicioAnterior = new Date(inicioAtual.getTime() - 7 * 86400000);
      fimAnterior = new Date(inicioAtual.getTime() - 1);
      break;
    }
    case 'MES': {
      inicioAtual = new Date(now.getFullYear(), now.getMonth(), 1);
      fimAtual = now;
      inicioAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      fimAnterior = new Date(inicioAtual.getTime() - 1);
      break;
    }
    case 'ANO': {
      inicioAtual = new Date(now.getFullYear(), 0, 1);
      fimAtual = now;
      inicioAnterior = new Date(now.getFullYear() - 1, 0, 1);
      fimAnterior = new Date(inicioAtual.getTime() - 1);
      break;
    }
  }

  return [inicioAtual.toISOString(), fimAtual.toISOString(), inicioAnterior.toISOString(), fimAnterior.toISOString()];
};

// ── Queries helpers ──────────────────────────────────────────────────────────

type FilterBuilder = any;

const countInRange = async (
  table: string,
  col: string,
  inicio: string,
  fim: string,
  extraFilters?: (q: FilterBuilder) => FilterBuilder,
): Promise<number> => {
  let q = supabase
    .from(table as any)
    .select('*', { count: 'exact', head: true })
    .gte(col, inicio)
    .lte(col, fim);
  if (extraFilters) q = extraFilters(q);
  const { count } = await q;
  return count ?? 0;
};

// ── API pública ──────────────────────────────────────────────────────────────

/** Soma lucro VANTA real (valor_bruto - valor_liquido) da tabela transactions */
const sumLucroVantaInRange = async (inicio: string, fim: string): Promise<number> => {
  const { data } = await supabase
    .from('transactions')
    .select('valor_bruto, valor_liquido')
    .gte('created_at', inicio)
    .lte('created_at', fim)
    .eq('status', 'CONCLUIDO')
    .limit(1000);
  if (!data) return 0;
  return (data as { valor_bruto: number; valor_liquido: number }[]).reduce(
    (s, r) => s + ((r.valor_bruto ?? 0) - (r.valor_liquido ?? 0)),
    0,
  );
};

export const dashboardAnalyticsService = {
  async getMetrics(periodo: Periodo): Promise<DashboardMetrics> {
    const [ia, fa, ip, fp] = getDateRanges(periodo);

    const [
      comunidadesAtual,
      comunidadesAnterior,
      eventosAtual,
      eventosAnterior,
      membrosAtual,
      membrosAnterior,
      curadosAtual,
      curadosAnterior,
      vendasAtual,
      vendasAnterior,
      lucroAtual,
      lucroAnterior,
    ] = await Promise.all([
      // Comunidades criadas
      countInRange('comunidades', 'created_at', ia, fa),
      countInRange('comunidades', 'created_at', ip, fp),
      // Eventos criados
      countInRange('eventos_admin', 'created_at', ia, fa),
      countInRange('eventos_admin', 'created_at', ip, fp),
      // Membros novos (profiles criados)
      countInRange('profiles', 'created_at', ia, fa, (q: FilterBuilder) =>
        q.not('email', 'is', null).not('nome', 'is', null),
      ),
      countInRange('profiles', 'created_at', ip, fp, (q: FilterBuilder) =>
        q.not('email', 'is', null).not('nome', 'is', null),
      ),
      // Membros classificados (curadoria_concluida = true, updated_at no período)
      countInRange('profiles', 'updated_at', ia, fa, (q: FilterBuilder) => q.eq('curadoria_concluida', true)),
      countInRange('profiles', 'updated_at', ip, fp, (q: FilterBuilder) => q.eq('curadoria_concluida', true)),
      // Venda de convites (tickets criados)
      countInRange('tickets_caixa', 'criado_em', ia, fa, (q: FilterBuilder) => q.in('status', ['DISPONIVEL', 'USADO'])),
      countInRange('tickets_caixa', 'criado_em', ip, fp, (q: FilterBuilder) => q.in('status', ['DISPONIVEL', 'USADO'])),
      // Lucro VANTA real (valor_bruto - valor_liquido da tabela transactions)
      sumLucroVantaInRange(ia, fa),
      sumLucroVantaInRange(ip, fp),
    ]);

    return {
      comunidades: { atual: comunidadesAtual, anterior: comunidadesAnterior },
      eventos: { atual: eventosAtual, anterior: eventosAnterior },
      membrosNovos: { atual: membrosAtual, anterior: membrosAnterior },
      membrosCurados: { atual: curadosAtual, anterior: curadosAnterior },
      vendaConvites: { atual: vendasAtual, anterior: vendasAnterior },
      lucroVanta: {
        atual: Math.round(lucroAtual * 100) / 100,
        anterior: Math.round(lucroAnterior * 100) / 100,
      },
    };
  },
};
