import React, { useMemo } from 'react';
import { DollarSign, Users, CalendarRange } from 'lucide-react';
import type { MaisVantaAnalytics } from '../../services/analytics/types';
import { KpiCard } from '../../components/KpiCards';
import MetricGrid from '../../components/dashboard/MetricGrid';
import TimeSeriesChart from '../../components/dashboard/TimeSeriesChart';
import BreakdownCard from '../../components/dashboard/BreakdownCard';
import { ExportButton } from '../../components/dashboard';
import { fmtBRL } from '../../../../utils';

// ── Types ────────────────────────────────────────────────────────────────────

interface Props {
  analytics: MaisVantaAnalytics | null;
}

// ── Constants ────────────────────────────────────────────────────────────────

const TIER_LABELS: Record<string, string> = {
  LISTA: 'Lista',
  PRESENCA: 'Presença',
  SOCIAL: 'Social',
  CREATOR: 'Creator',
  BLACK: 'Black',
};

const TIER_COLORS: Record<string, string> = {
  LISTA: '#6366f1',
  PRESENCA: '#8b5cf6',
  SOCIAL: '#a855f7',
  CREATOR: '#d946ef',
  BLACK: '#1a1a2e',
};

function tierLabel(tier: string): string {
  return TIER_LABELS[tier] ?? tier;
}

function tierColor(tier: string): string {
  return TIER_COLORS[tier] ?? '#71717a';
}

// ── Component ────────────────────────────────────────────────────────────────

export const FinanceiroTab: React.FC<Props> = ({ analytics }) => {
  const exportData = useMemo(() => {
    if (!analytics) return [];
    return analytics.tierDistribution.map(t => ({
      tier: tierLabel(t.tier),
      membros: t.membros,
      receita: t.receita,
      percentual: t.percentual,
    }));
  }, [analytics]);

  if (!analytics) return null;

  const { mrrAtual, totalMembros, mrrTimeSeries, tierDistribution } = analytics;

  const receitaAnual = mrrAtual * 12;

  return (
    <div className="space-y-4 p-4">
      {/* KPI Grid */}
      <MetricGrid columns={3}>
        <KpiCard label="MRR" value={mrrAtual} color="#10b981" icon={DollarSign} formatValue={fmtBRL} />
        <KpiCard label="Membros" value={totalMembros} color="#8b5cf6" icon={Users} />
        <KpiCard label="Receita Anual" value={receitaAnual} color="#FFD300" icon={CalendarRange} formatValue={fmtBRL} />
      </MetricGrid>

      {/* MRR Timeline */}
      <TimeSeriesChart title="Evolucao MRR" data={mrrTimeSeries} color="#10b981" fill formatValue={fmtBRL} />

      {/* Tier revenue breakdown */}
      <BreakdownCard
        title="Receita por Tier"
        items={tierDistribution.map(t => ({
          label: tierLabel(t.tier),
          value: t.receita,
          color: tierColor(t.tier),
        }))}
        formatValue={fmtBRL}
      />

      {/* Projecao Anual card */}
      <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-white text-xs font-bold uppercase tracking-wider">Projecao Anual</h3>
          <span className="text-[0.625rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFD300]/10 text-[#FFD300] border border-[#FFD300]/20">
            MRR x 12
          </span>
        </div>
        <p className="text-[#FFD300] text-3xl font-black">{fmtBRL(receitaAnual)}</p>
        <p className="text-zinc-500 text-xs">Baseado no MRR atual de {fmtBRL(mrrAtual)}</p>
      </div>

      {/* Export */}
      <div className="flex justify-end">
        <ExportButton data={exportData} filename="mais-vanta-financeiro" label="Exportar CSV" />
      </div>
    </div>
  );
};
