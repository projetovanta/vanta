import React from 'react';

interface BreakdownItem {
  label: string;
  value: number;
  color: string;
}

interface Props {
  title: string;
  items: BreakdownItem[];
  formatValue?: (v: number) => string;
}

export default function BreakdownCard({ title, items, formatValue = v => String(v) }: Props) {
  const total = items.reduce((sum, i) => sum + i.value, 0);

  return (
    <div className="rounded-2xl bg-zinc-900/40 border border-white/5 p-5 space-y-4">
      <h3 className="text-[0.5rem] uppercase tracking-widest text-zinc-400">{title}</h3>

      {total === 0 ? (
        <div className="space-y-2">
          <div className="h-2 rounded-full bg-zinc-800" />
          <p className="text-xs text-zinc-600">Sem dados</p>
        </div>
      ) : (
        <>
          <div className="flex h-2 rounded-full overflow-hidden bg-zinc-800">
            {items.map(item => {
              const pct = (item.value / total) * 100;
              if (pct === 0) return null;
              return (
                <div
                  key={item.label}
                  className="h-full first:rounded-l-full last:rounded-r-full"
                  style={{ width: `${pct}%`, backgroundColor: item.color }}
                />
              );
            })}
          </div>

          <ul className="space-y-1.5">
            {items.map(item => {
              const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';
              return (
                <li key={item.label} className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="flex-1 min-w-0 truncate text-zinc-400">{item.label}</span>
                  <span className="text-white shrink-0">{formatValue(item.value)}</span>
                  <span className="text-zinc-600 shrink-0 w-12 text-right">{pct}%</span>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
