import React from 'react';
import { Store, Handshake, Gift, Clock } from 'lucide-react';
import type { MaisVantaAnalytics } from '../../services/analytics/types';
import { KpiCard } from '../../components/KpiCards';
import MetricGrid from '../../components/dashboard/MetricGrid';

// ── Types ────────────────────────────────────────────────────────────────────

interface Props {
  analytics: MaisVantaAnalytics | null;
}

// ── Component ────────────────────────────────────────────────────────────────

export const ParceirosTab: React.FC<Props> = ({ analytics }) => {
  if (!analytics) return null;

  const { parceirosAtivos, dealsAtivos, resgatesTotal } = analytics;

  return (
    <div className="space-y-4 p-4">
      {/* KPI */}
      <MetricGrid columns={3}>
        <KpiCard label="Parceiros" value={parceirosAtivos} color="#06b6d4" icon={Store} />
        <KpiCard label="Deals Ativos" value={dealsAtivos} color="#f59e0b" icon={Handshake} />
        <KpiCard label="Resgates" value={resgatesTotal} color="#FFD300" icon={Gift} />
      </MetricGrid>

      {/* Summary cards */}
      <div className="space-y-3">
        <SummaryRow label="Total de parceiros ativos" value={String(parceirosAtivos)} color="#06b6d4" />
        <SummaryRow label="Deals disponiveis" value={String(dealsAtivos)} color="#f59e0b" />
        <SummaryRow label="Resgates realizados" value={resgatesTotal.toLocaleString('pt-BR')} color="#FFD300" />
      </div>

      {/* Placeholder */}
      <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-4 flex items-center gap-3">
        <Clock size={18} className="text-zinc-500 shrink-0" />
        <p className="text-zinc-500 text-xs font-medium">Detalhes por parceiro em breve</p>
      </div>
    </div>
  );
};

// ── SummaryRow ───────────────────────────────────────────────────────────────

const SummaryRow: React.FC<{
  label: string;
  value: string;
  color: string;
}> = ({ label, value, color }) => (
  <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-4 flex items-center justify-between">
    <span className="text-zinc-400 text-sm font-medium truncate min-w-0 flex-1">{label}</span>
    <span className="text-2xl font-black shrink-0 ml-3" style={{ color }}>
      {value}
    </span>
  </div>
);
