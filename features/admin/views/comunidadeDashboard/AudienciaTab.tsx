import React, { useMemo } from 'react';
import { UserCheck, BarChart3, UserPlus, RefreshCw } from 'lucide-react';
import type { CommunityAnalytics } from '../../services/analytics/types';
import { BreakdownCard, ProgressRing, HeatmapCard } from '../../components/dashboard';
import { KpiCard } from '../../components/KpiCards';

// ── Types ────────────────────────────────────────────────────────────────────

interface Props {
  analytics: CommunityAnalytics | null;
}

// ── Empty state ──────────────────────────────────────────────────────────────

const EMPTY = (
  <div className="flex items-center justify-center py-16">
    <p className="text-zinc-500 text-xs">Sem dados de audiência para o período</p>
  </div>
);

// ── Component ────────────────────────────────────────────────────────────────

export const AudienciaTab: React.FC<Props> = ({ analytics }) => {
  // ── Breakdown: Novos vs Recorrentes ────────────────────────────────────

  const audienceBreakdown = useMemo(() => {
    if (!analytics?.audience) return [];
    const { novos, recorrentes } = analytics.audience;
    return [
      { label: 'Novos', value: novos, color: '#06B6D4' },
      { label: 'Recorrentes', value: recorrentes, color: '#8B5CF6' },
    ];
  }, [analytics?.audience]);

  // ── Render ─────────────────────────────────────────────────────────────

  if (!analytics) return EMPTY;

  const { audience, retencaoPublico } = analytics;
  const retencaoPct = Math.round(retencaoPublico * 100);
  const checkinPct = Math.round(audience.taxaCheckin * 100);

  return (
    <div className="p-4 space-y-5 pb-8">
      {/* KPI Grid 2x2 */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard label="Total Check-ins" value={audience.totalCheckins} color="#10B981" icon={UserCheck} />
        <KpiCard label="Taxa Check-in" value={checkinPct} color="#FFD300" icon={BarChart3} formatValue={v => `${v}%`} />
        <KpiCard label="Novos" value={audience.novos} color="#06B6D4" icon={UserPlus} />
        <KpiCard label="Recorrentes" value={audience.recorrentes} color="#8B5CF6" icon={RefreshCw} />
      </div>

      {/* Novos vs Recorrentes */}
      <BreakdownCard title="Novos vs Recorrentes" items={audienceBreakdown} formatValue={v => `${v} pessoas`} />

      {/* Retenção ring */}
      <div className="rounded-2xl bg-zinc-900/40 border border-white/5 p-5 space-y-4">
        <h3 className="text-[0.5rem] uppercase tracking-widest text-zinc-400">Retenção (2+ eventos)</h3>
        <div className="flex justify-center py-2">
          <ProgressRing value={retencaoPct} label="Retenção" size={96} color="#EC4899" thickness={6} />
        </div>
        <p className="text-center text-zinc-500 text-[0.625rem]">
          {retencaoPct}% dos compradores foram a 2 ou mais eventos
        </p>
      </div>

      {/* Heatmap check-ins */}
      {audience.heatmapCheckins.length > 0 && (
        <HeatmapCard
          title="Check-ins por dia/hora"
          data={audience.heatmapCheckins}
          colorScale={['#18181b', '#FFD300']}
        />
      )}
    </div>
  );
};
