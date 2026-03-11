import React from 'react';
import { DollarSign, Users, TrendingDown, Heart, UserPlus, UserMinus, Handshake, Store } from 'lucide-react';
import type { MaisVantaAnalytics } from '../../services/analytics/types';
import { KpiCard } from '../../components/KpiCards';
import MetricGrid from '../../components/dashboard/MetricGrid';
import TimeSeriesChart from '../../components/dashboard/TimeSeriesChart';
import BreakdownCard from '../../components/dashboard/BreakdownCard';
import { fmtBRL } from '../../../../utils';

// ── Types ────────────────────────────────────────────────────────────────────

interface Props {
  analytics: MaisVantaAnalytics | null;
}

// ── Component ────────────────────────────────────────────────────────────────

export const OverviewTab: React.FC<Props> = ({ analytics }) => {
  if (!analytics) return null;

  const {
    mrrAtual,
    totalMembros,
    churnRate,
    ltv,
    novosMembros,
    cancelamentos,
    dealsAtivos,
    parceirosAtivos,
    mrrTimeSeries,
    membrosTimeSeries,
    tierDistribution,
  } = analytics;

  return (
    <div className="space-y-4 p-4">
      {/* Hero KPIs */}
      <MetricGrid columns={4}>
        <KpiCard label="MRR" value={mrrAtual} color="#10b981" icon={DollarSign} formatValue={fmtBRL} />
        <KpiCard label="Membros" value={totalMembros} color="#8b5cf6" icon={Users} />
        <KpiCard
          label="Churn"
          value={churnRate}
          color="#ef4444"
          icon={TrendingDown}
          formatValue={v => `${v.toFixed(1)}%`}
        />
        <KpiCard label="LTV" value={ltv} color="#FFD300" icon={Heart} formatValue={fmtBRL} />
      </MetricGrid>

      {/* MRR Timeline */}
      <TimeSeriesChart title="MRR" data={mrrTimeSeries} color="#10b981" fill formatValue={fmtBRL} />

      {/* Membros Timeline */}
      <TimeSeriesChart title="Membros" data={membrosTimeSeries} color="#8b5cf6" fill />

      {/* Quick Stats */}
      <MetricGrid columns={4}>
        <KpiCard label="Novos" value={novosMembros} color="#22c55e" icon={UserPlus} />
        <KpiCard label="Cancelamentos" value={cancelamentos} color="#ef4444" icon={UserMinus} />
        <KpiCard label="Deals Ativos" value={dealsAtivos} color="#f59e0b" icon={Handshake} />
        <KpiCard label="Parceiros" value={parceirosAtivos} color="#06b6d4" icon={Store} />
      </MetricGrid>

      {/* Tier distribution preview */}
      <BreakdownCard
        title="Distribuição por Tier"
        items={tierDistribution.map(t => ({
          label: tierLabel(t.tier),
          value: t.membros,
          color: t.color,
        }))}
      />
    </div>
  );
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const TIER_LABELS: Record<string, string> = {
  LISTA: 'Lista',
  PRESENCA: 'Presença',
  SOCIAL: 'Social',
  CREATOR: 'Creator',
  BLACK: 'Black',
};

function tierLabel(tier: string): string {
  return TIER_LABELS[tier] ?? tier;
}
