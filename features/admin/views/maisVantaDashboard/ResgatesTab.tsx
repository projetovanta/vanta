import React from 'react';
import { Gift, Handshake, Store, Inbox } from 'lucide-react';
import type { MaisVantaAnalytics } from '../../services/analytics/types';
import { KpiCard } from '../../components/KpiCards';
import MetricGrid from '../../components/dashboard/MetricGrid';

// ── Types ────────────────────────────────────────────────────────────────────

interface Props {
  analytics: MaisVantaAnalytics | null;
}

// ── Component ────────────────────────────────────────────────────────────────

export const ResgatesTab: React.FC<Props> = ({ analytics }) => {
  if (!analytics) return null;

  const { resgatesTotal, dealsAtivos, parceirosAtivos } = analytics;

  const hasResgates = resgatesTotal > 0 || dealsAtivos > 0 || parceirosAtivos > 0;

  return (
    <div className="space-y-4 p-4">
      {/* KPI Grid */}
      <MetricGrid columns={3}>
        <KpiCard label="Total Resgates" value={resgatesTotal} color="#FFD300" icon={Gift} />
        <KpiCard label="Deals Ativos" value={dealsAtivos} color="#f59e0b" icon={Handshake} />
        <KpiCard label="Parceiros Ativos" value={parceirosAtivos} color="#06b6d4" icon={Store} />
      </MetricGrid>

      {/* Summary cards */}
      {hasResgates ? (
        <div className="space-y-3">
          <SummaryCard label="Resgates realizados" value={resgatesTotal} color="#FFD300" />
          <SummaryCard label="Deals ativos no momento" value={dealsAtivos} color="#f59e0b" />
          <SummaryCard label="Parceiros com deals ativos" value={parceirosAtivos} color="#06b6d4" />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
          <Inbox size={40} className="text-zinc-600" />
          <p className="text-zinc-400 text-sm font-medium">Nenhum resgate no periodo</p>
        </div>
      )}
    </div>
  );
};

// ── SummaryCard ──────────────────────────────────────────────────────────────

const SummaryCard: React.FC<{
  label: string;
  value: number;
  color: string;
}> = ({ label, value, color }) => (
  <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-4 flex items-center justify-between">
    <span className="text-zinc-400 text-sm font-medium truncate min-w-0 flex-1">{label}</span>
    <span className="text-2xl font-black shrink-0 ml-3" style={{ color }}>
      {value.toLocaleString('pt-BR')}
    </span>
  </div>
);
