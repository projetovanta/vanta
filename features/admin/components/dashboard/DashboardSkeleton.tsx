import React from 'react';

interface Props {
  /** Número de cards skeleton (default 6) */
  cards?: number;
  /** Se true, mostra skeleton do gráfico (default true) */
  chart?: boolean;
}

/** Skeleton de loading para dashboards — KPIs + gráfico */
const DashboardSkeleton: React.FC<Props> = ({ cards = 6, chart = true }) => (
  <div className="space-y-4 animate-pulse">
    {/* KPI grid skeleton */}
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: cards }, (_, i) => (
        <div key={i} className="bg-zinc-800/50 rounded-xl h-20" />
      ))}
    </div>

    {/* Chart skeleton */}
    {chart && <div className="bg-zinc-800/50 rounded-xl h-48" />}

    {/* Table/list skeleton */}
    <div className="space-y-2">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="bg-zinc-800/50 rounded-xl h-12" />
      ))}
    </div>
  </div>
);

export default DashboardSkeleton;
