import React from 'react';
import { Ticket, DollarSign, TrendingUp, Percent } from 'lucide-react';
import type { EventoAdmin } from '../../../../types';
import type { EventAnalytics } from '../../services/analytics/types';
import { fmtBRL } from '../../../../utils';
import { KpiCard } from '../../components/KpiCards';
import FunnelChart from '../../components/dashboard/FunnelChart';
import TimeSeriesChart from '../../components/dashboard/TimeSeriesChart';
import BarChartCard from '../../components/dashboard/BarChartCard';
import BreakdownCard from '../../components/dashboard/BreakdownCard';
import ProgressRing from '../../components/dashboard/ProgressRing';
import MetricGrid from '../../components/dashboard/MetricGrid';

// ── Skeleton de loading ─────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {/* KPI grid skeleton */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="animate-pulse bg-zinc-800/50 rounded-xl h-24" />
        ))}
      </div>
      {/* Chart skeletons */}
      <div className="animate-pulse bg-zinc-800/50 rounded-xl h-48" />
      <div className="animate-pulse bg-zinc-800/50 rounded-xl h-48" />
      <div className="animate-pulse bg-zinc-800/50 rounded-xl h-40" />
      <div className="animate-pulse bg-zinc-800/50 rounded-xl h-36" />
      <div className="flex justify-center">
        <div className="animate-pulse bg-zinc-800/50 rounded-full h-20 w-20" />
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildFunnelSteps(analytics: EventAnalytics): { name: string; value: number; color?: string }[] {
  const capacidade = analytics.tickets.porLote.reduce((sum, l) => sum + l.limite, 0);
  const vendidos = analytics.tickets.totalVendidos;
  const projecaoCheckin = Math.round(vendidos * (analytics.audience.taxaCheckin || 0.75));

  return [
    { name: 'Capacidade', value: capacidade, color: '#FFD300' },
    { name: 'Vendidos', value: vendidos, color: '#e0b800' },
    { name: 'Check-in Projetado', value: projecaoCheckin, color: '#8b5cf6' },
  ];
}

function buildLoteBarData(analytics: EventAnalytics) {
  return analytics.tickets.porLote.map(l => ({
    name: l.loteNome,
    value: l.vendidos,
  }));
}

const METODO_COLORS: Record<string, string> = {
  CREDITO: '#8b5cf6',
  PIX: '#22c55e',
  CORTESIA: '#FFD300',
  LISTA: '#3b82f6',
  CAIXA: '#f97316',
};

function buildMetodoPagamento(analytics: EventAnalytics) {
  return analytics.tickets.porMetodoPagamento.map(m => ({
    label: m.metodo,
    value: m.valor,
    color: METODO_COLORS[m.metodo] ?? '#71717a',
  }));
}

function calcOcupacao(analytics: EventAnalytics): number {
  const capacidade = analytics.tickets.porLote.reduce((sum, l) => sum + l.limite, 0);
  if (capacidade === 0) return 0;
  return Math.round((analytics.tickets.totalVendidos / capacidade) * 100);
}

// ── Props ────────────────────────────────────────────────────────────────────

interface Props {
  evento: EventoAdmin;
  analytics: EventAnalytics | null;
  loading: boolean;
}

// ── Componente ───────────────────────────────────────────────────────────────

export const PreEventoView: React.FC<Props> = ({ evento: _evento, analytics, loading }) => {
  if (loading || !analytics) {
    return <LoadingSkeleton />;
  }

  const ocupacao = calcOcupacao(analytics);

  return (
    <div className="space-y-4">
      {/* ── Funil de vendas ── */}
      <FunnelChart
        title="Funil de Vendas"
        steps={buildFunnelSteps(analytics)}
        formatValue={v => v.toLocaleString('pt-BR')}
      />

      {/* ── KPI Grid 2x2 ── */}
      <MetricGrid columns={2}>
        <KpiCard label="Vendidos" value={analytics.tickets.totalVendidos} color="#FFD300" icon={Ticket} />
        <KpiCard
          label="Receita"
          value={analytics.revenue.receitaBruta}
          color="#22c55e"
          icon={DollarSign}
          formatValue={fmtBRL}
        />
        <KpiCard
          label="Ticket Médio"
          value={analytics.tickets.ticketMedio}
          color="#8b5cf6"
          icon={TrendingUp}
          formatValue={fmtBRL}
        />
        <KpiCard
          label="Ocupação Projetada"
          value={ocupacao}
          color="#3b82f6"
          icon={Percent}
          formatValue={v => `${v}%`}
        />
      </MetricGrid>

      {/* ── Vendas por dia ── */}
      <TimeSeriesChart title="Vendas por Dia" data={analytics.vendasTimeSeries} fill formatValue={fmtBRL} />

      {/* ── Breakdown por lote ── */}
      <BarChartCard
        title="Vendas por Lote"
        data={buildLoteBarData(analytics)}
        formatValue={v => v.toLocaleString('pt-BR')}
      />

      {/* ── Breakdown por método ── */}
      <BreakdownCard title="Métodos de Pagamento" items={buildMetodoPagamento(analytics)} formatValue={fmtBRL} />

      {/* ── Projeção de lotação ── */}
      <div className="flex flex-col items-center gap-2 rounded-2xl bg-zinc-900/40 border border-white/5 p-4">
        <p className="text-[0.6rem] uppercase tracking-widest text-zinc-400">Lotação</p>
        <ProgressRing
          value={ocupacao}
          label={`${ocupacao}%`}
          size={80}
          color={ocupacao >= 80 ? '#22c55e' : '#FFD300'}
          thickness={6}
        />
        <p className="text-xs text-zinc-500">{analytics.tickets.totalVendidos.toLocaleString('pt-BR')} vendidos</p>
      </div>
    </div>
  );
};

export default PreEventoView;
