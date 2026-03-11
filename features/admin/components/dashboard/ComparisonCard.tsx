import React from 'react';

interface Props {
  title: string;
  labelA: string;
  labelB: string;
  valueA: number;
  valueB: number;
  formatValue?: (v: number) => string;
  invertDelta?: boolean;
}

export default function ComparisonCard({
  title,
  labelA,
  labelB,
  valueA,
  valueB,
  formatValue = v => String(v),
  invertDelta = false,
}: Props) {
  const deltaRaw = valueA !== 0 ? ((valueB - valueA) / Math.abs(valueA)) * 100 : valueB > 0 ? 100 : 0;

  const deltaAbs = Math.abs(deltaRaw).toFixed(1);
  const isUp = deltaRaw > 0;
  const isNeutral = deltaRaw === 0;

  const isPositive = invertDelta ? !isUp : isUp;

  const deltaColor = isNeutral ? 'text-zinc-500' : isPositive ? 'text-emerald-400' : 'text-red-400';

  const arrow = isNeutral ? '–' : isUp ? '▲' : '▼';

  return (
    <div className="rounded-2xl bg-zinc-900/40 border border-white/5 p-5 space-y-4">
      <h3 className="text-[0.5rem] uppercase tracking-widest text-zinc-400">{title}</h3>

      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0 text-center">
          <p className="text-[0.5rem] uppercase tracking-widest text-zinc-600 mb-1">{labelA}</p>
          <p className="text-lg font-bold text-white truncate">{formatValue(valueA)}</p>
        </div>

        <div className={`shrink-0 text-center ${deltaColor}`}>
          <span className="text-xs font-bold">{arrow}</span>
          {!isNeutral && <p className="text-[0.5rem] font-bold">{deltaAbs}%</p>}
        </div>

        <div className="flex-1 min-w-0 text-center">
          <p className="text-[0.5rem] uppercase tracking-widest text-zinc-600 mb-1">{labelB}</p>
          <p className="text-lg font-bold text-white truncate">{formatValue(valueB)}</p>
        </div>
      </div>
    </div>
  );
}
