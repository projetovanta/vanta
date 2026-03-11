import React, { useMemo } from 'react';
import type { HeatmapCell } from '../../services/analytics/types';

interface Props {
  title: string;
  data: HeatmapCell[];
  colorScale?: [string, string];
}

const DAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const HOUR_LABELS = [0, 6, 12, 18] as const;

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
}

function lerpColor(a: string, b: string, t: number): string {
  const [ar, ag, ab] = parseHex(a);
  const [br, bg, bb] = parseHex(b);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `rgb(${r},${g},${bl})`;
}

export default function HeatmapCard({ title, data, colorScale = ['#18181b', '#FFD300'] }: Props) {
  const { grid, maxVal } = useMemo(() => {
    const m: Record<string, number> = {};
    let mx = 0;
    for (const cell of data) {
      const key = `${cell.dayOfWeek}-${cell.hour}`;
      m[key] = (m[key] ?? 0) + cell.value;
      if (m[key] > mx) mx = m[key];
    }
    return { grid: m, maxVal: mx };
  }, [data]);

  return (
    <div className="rounded-2xl bg-zinc-900/40 border border-white/5 p-5 space-y-4">
      <h3 className="text-[0.5rem] uppercase tracking-widest text-zinc-400">{title}</h3>

      <div className="overflow-x-auto no-scrollbar">
        <div className="inline-flex flex-col gap-px" style={{ minWidth: 'fit-content' }}>
          {/* Hour labels */}
          <div className="flex items-center gap-px ml-5">
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} className="flex items-center justify-center" style={{ width: 12, height: 12 }}>
                {(HOUR_LABELS as readonly number[]).includes(h) && (
                  <span className="text-[0.4rem] text-zinc-500">{h}</span>
                )}
              </div>
            ))}
          </div>

          {/* Grid rows */}
          {Array.from({ length: 7 }, (_, day) => (
            <div key={day} className="flex items-center gap-px">
              {/* Day label */}
              <div className="w-4 shrink-0 text-center">
                <span className="text-[0.4rem] text-zinc-500">{DAY_LABELS[day]}</span>
              </div>

              {/* Cells */}
              <div className="flex gap-px ml-1">
                {Array.from({ length: 24 }, (_, hour) => {
                  const val = grid[`${day}-${hour}`] ?? 0;
                  const ratio = maxVal > 0 ? val / maxVal : 0;
                  return (
                    <div
                      key={hour}
                      title={`${DAY_LABELS[day]} ${hour}h: ${val}`}
                      className="rounded-sm"
                      style={{
                        width: 12,
                        height: 12,
                        backgroundColor: lerpColor(colorScale[0], colorScale[1], ratio),
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
