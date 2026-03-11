import React from 'react';
import type { MaisVantaAnalytics, TierDistributionItem } from '../../services/analytics/types';
import BreakdownCard from '../../components/dashboard/BreakdownCard';
import BarChartCard from '../../components/dashboard/BarChartCard';
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

function tierTextColor(tier: string): string {
  return tier === 'BLACK' ? '#f5f5f5' : tierColor(tier);
}

// ── Component ────────────────────────────────────────────────────────────────

export const TiersTab: React.FC<Props> = ({ analytics }) => {
  if (!analytics) return null;

  const { tierDistribution, totalMembros } = analytics;

  return (
    <div className="space-y-4 p-4">
      {/* Tier cards */}
      <div className="space-y-2">
        {tierDistribution.map(tier => (
          <TierCard key={tier.tier} tier={tier} totalMembros={totalMembros} />
        ))}
      </div>

      {/* Stacked breakdown */}
      <BreakdownCard
        title="Distribuição por Tier"
        items={tierDistribution.map(t => ({
          label: tierLabel(t.tier),
          value: t.membros,
          color: tierColor(t.tier),
        }))}
      />

      {/* Bar: membros per tier */}
      <BarChartCard
        title="Membros por Tier"
        data={tierDistribution.map(t => ({
          name: tierLabel(t.tier),
          value: t.membros,
          color: tierColor(t.tier),
        }))}
      />

      {/* Bar: receita per tier */}
      <BarChartCard
        title="Receita por Tier"
        data={tierDistribution.map(t => ({
          name: tierLabel(t.tier),
          value: t.receita,
          color: tierColor(t.tier),
        }))}
        formatValue={fmtBRL}
      />
    </div>
  );
};

// ── TierCard ─────────────────────────────────────────────────────────────────

const TierCard: React.FC<{
  tier: TierDistributionItem;
  totalMembros: number;
}> = ({ tier, totalMembros }) => {
  const pctOfTotal = totalMembros > 0 ? ((tier.membros / totalMembros) * 100).toFixed(1) : '0.0';

  return (
    <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-3 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: tierColor(tier.tier) }} />
          <span className="text-sm font-bold truncate" style={{ color: tierTextColor(tier.tier) }}>
            {tierLabel(tier.tier)}
          </span>
        </div>
        <span className="text-zinc-400 text-xs font-bold shrink-0">{pctOfTotal}%</span>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-400">
          <span className="text-white font-bold">{tier.membros}</span> membros
        </span>
        <span className="text-zinc-400">
          <span className="text-white font-bold">{fmtBRL(tier.receita)}</span>
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${tier.percentual}%`,
            backgroundColor: tierColor(tier.tier),
          }}
        />
      </div>
    </div>
  );
};
