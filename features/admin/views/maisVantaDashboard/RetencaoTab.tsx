import React from 'react';
import { TrendingDown, UserPlus, UserMinus } from 'lucide-react';
import type { MaisVantaAnalytics, CohortRow } from '../../services/analytics/types';
import { KpiCard } from '../../components/KpiCards';
import MetricGrid from '../../components/dashboard/MetricGrid';
import ProgressRing from '../../components/dashboard/ProgressRing';
import { fmtBRL } from '../../../../utils';

// ── Types ────────────────────────────────────────────────────────────────────

interface Props {
  analytics: MaisVantaAnalytics | null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function churnColor(rate: number): string {
  if (rate < 5) return '#22c55e';
  if (rate < 10) return '#f59e0b';
  return '#ef4444';
}

/** Interpolate from red (0%) to green (100%) */
function retentionCellColor(pct: number): string {
  const clamped = Math.min(100, Math.max(0, pct));
  const r = Math.round(239 - (239 - 34) * (clamped / 100));
  const g = Math.round(68 + (197 - 68) * (clamped / 100));
  const b = Math.round(68 - (68 - 94) * (clamped / 100));
  return `rgb(${r}, ${g}, ${b})`;
}

function retentionCellBg(pct: number): string {
  return `${retentionCellColor(pct)}20`;
}

// ── Component ────────────────────────────────────────────────────────────────

export const RetencaoTab: React.FC<Props> = ({ analytics }) => {
  if (!analytics) return null;

  const { churnRate, ltv, novosMembros, cancelamentos, retencaoCohort } = analytics;

  // Find max columns across all cohorts
  const maxCols = retencaoCohort.reduce((max, row) => Math.max(max, row.retention.length), 0);

  return (
    <div className="space-y-4 p-4">
      {/* Churn + LTV */}
      <div className="flex gap-3">
        {/* Churn ring */}
        <div className="flex-1 bg-zinc-900/60 border border-white/5 rounded-xl p-4 flex flex-col items-center gap-2">
          <ProgressRing value={churnRate} label="Churn" size={80} color={churnColor(churnRate)} thickness={5} />
          <p className="text-zinc-400 text-[0.625rem] font-bold uppercase tracking-wider">Taxa de Churn</p>
          <p className="text-white text-lg font-black">{churnRate.toFixed(1)}%</p>
        </div>

        {/* LTV */}
        <div className="flex-1 bg-zinc-900/60 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center gap-2">
          <p className="text-zinc-400 text-[0.625rem] font-bold uppercase tracking-wider">Lifetime Value</p>
          <p className="text-[#FFD300] text-2xl font-black">{fmtBRL(ltv)}</p>
        </div>
      </div>

      {/* Novos vs Cancelamentos */}
      <MetricGrid columns={2}>
        <KpiCard label="Novos Membros" value={novosMembros} color="#22c55e" icon={UserPlus} />
        <KpiCard label="Cancelamentos" value={cancelamentos} color="#ef4444" icon={UserMinus} />
      </MetricGrid>

      {/* Cohort Heatmap */}
      {retencaoCohort.length > 0 && (
        <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-3 space-y-2">
          <h3 className="text-white text-xs font-bold uppercase tracking-wider">Cohort de Retencao</h3>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-[0.625rem] border-collapse min-w-0">
              <thead>
                <tr>
                  <th className="text-zinc-500 font-bold text-left px-1.5 py-1 sticky left-0 bg-zinc-900/90 z-10">
                    Cohort
                  </th>
                  {Array.from({ length: maxCols }).map((_, i) => (
                    <th key={i} className="text-zinc-500 font-bold text-center px-1.5 py-1">
                      M{i}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {retencaoCohort.map(row => (
                  <CohortRowComponent key={row.cohort} row={row} maxCols={maxCols} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ── CohortRowComponent ───────────────────────────────────────────────────────

const CohortRowComponent: React.FC<{
  row: CohortRow;
  maxCols: number;
}> = ({ row, maxCols }) => (
  <tr>
    <td className="text-zinc-400 font-bold px-1.5 py-1 whitespace-nowrap sticky left-0 bg-zinc-900/90 z-10">
      {row.cohort}
    </td>
    {Array.from({ length: maxCols }).map((_, i) => {
      const val = row.retention[i];
      const hasValue = val !== undefined;

      return (
        <td
          key={i}
          className="text-center px-1.5 py-1 font-bold"
          style={
            hasValue
              ? {
                  color: retentionCellColor(val),
                  backgroundColor: retentionCellBg(val),
                }
              : { color: '#3f3f46' }
          }
        >
          {hasValue ? `${val}%` : '-'}
        </td>
      );
    })}
  </tr>
);
