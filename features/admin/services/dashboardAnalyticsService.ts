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

// ── Timeline de vendas (gráfico de tendência) ─────────────────────────────

export interface VendasTimelinePoint {
  data: string; // label do eixo X (ex: "14/03", "Seg", "10h")
  valor: number; // R$ total
  quantidade: number; // nº de tickets
}

type Granularidade = 'hora' | 'dia' | 'mes';

const getGranularidade = (periodo: Periodo): Granularidade => {
  switch (periodo) {
    case 'HOJE':
      return 'hora';
    case 'SEMANA':
      return 'dia';
    case 'MES':
      return 'dia';
    case 'ANO':
      return 'mes';
  }
};

const formatLabel = (dateStr: string, granularidade: Granularidade): string => {
  const d = new Date(dateStr);
  if (granularidade === 'hora') return `${d.getHours()}h`;
  if (granularidade === 'mes') {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return meses[d.getMonth()];
  }
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const getVendasTimeline = async (periodo: Periodo, comunidadeId?: string): Promise<VendasTimelinePoint[]> => {
  const [inicio, fim] = getDateRanges(periodo);
  const granularidade = getGranularidade(periodo);

  let q = supabase
    .from('tickets_caixa')
    .select('criado_em, valor')
    .gte('criado_em', inicio)
    .lte('criado_em', fim)
    .in('status', ['DISPONIVEL', 'USADO'])
    .order('criado_em', { ascending: true })
    .limit(5000);

  if (comunidadeId) {
    // Filtrar por eventos da comunidade — precisa join via evento_id
    // Como Supabase JS não suporta GROUP BY, agrupamos no client
    const { data: eventosIds } = await supabase.from('eventos_admin').select('id').eq('comunidade_id', comunidadeId);
    if (eventosIds && eventosIds.length > 0) {
      q = q.in(
        'evento_id',
        eventosIds.map(e => e.id),
      );
    }
  }

  const { data } = await q;
  if (!data || data.length === 0) return [];

  // Agrupar por granularidade no client
  const buckets = new Map<string, { valor: number; quantidade: number }>();

  for (const row of data as { criado_em: string; valor: number }[]) {
    const d = new Date(row.criado_em);
    let key: string;
    if (granularidade === 'hora') {
      key = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()).toISOString();
    } else if (granularidade === 'mes') {
      key = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
    } else {
      key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
    }
    const existing = buckets.get(key) ?? { valor: 0, quantidade: 0 };
    existing.valor += row.valor ?? 0;
    existing.quantidade += 1;
    buckets.set(key, existing);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, vals]) => ({
      data: formatLabel(dateKey, granularidade),
      valor: Math.round(vals.valor * 100) / 100,
      quantidade: vals.quantidade,
    }));
};

export const dashboardAnalyticsService = {
  getVendasTimeline,
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
