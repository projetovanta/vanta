import React, { useMemo } from 'react';
import type { FunnelStep } from '../../services/analytics/types';

interface Props {
  title: string;
  steps: FunnelStep[];
  formatValue?: (v: number) => string;
}

const DEFAULT_COLORS = ['#FFD300', '#e0b800', '#b89700', '#8b5cf6'];

function interpolateColor(colors: string[], ratio: number): string {
  const idx = ratio * (colors.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.min(lo + 1, colors.length - 1);
  if (lo === hi) return colors[lo];

  const t = idx - lo;
  const parse = (hex: string) => {
    const h = hex.replace('#', '');
    return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
  };

  const a = parse(colors[lo]);
  const b = parse(colors[hi]);
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`;
}

export default function FunnelChart({ title, steps, formatValue }: Props) {
  const maxValue = steps.length > 0 ? steps[0].value : 1;

  const computed = useMemo(
    () =>
      steps.map((step, i) => {
        const pct = maxValue > 0 ? (step.value / maxValue) * 100 : 0;
        const widthPct = Math.max(pct, 8); // min 8% so label is visible
        const color = step.color ?? interpolateColor(DEFAULT_COLORS, steps.length > 1 ? i / (steps.length - 1) : 0);
        return { ...step, pct, widthPct, color };
      }),
    [steps, maxValue],
  );

  return (
    <div className="rounded-2xl bg-zinc-900/40 border border-white/5 p-5 space-y-4">
      <h3 className="text-[0.5rem] uppercase tracking-widest text-zinc-400">{title}</h3>

      <div className="space-y-2">
        {computed.map(step => (
          <div key={step.name} className="space-y-1">
            {/* Label row */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-300 truncate min-w-0">{step.name}</span>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className="text-xs font-medium text-white">
                  {formatValue ? formatValue(step.value) : step.value.toLocaleString('pt-BR')}
                </span>
                <span className="text-[0.5rem] text-zinc-500">{step.pct.toFixed(0)}%</span>
              </div>
            </div>

            {/* Bar */}
            <div className="h-3 w-full rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${step.widthPct}%`,
                  backgroundColor: step.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
