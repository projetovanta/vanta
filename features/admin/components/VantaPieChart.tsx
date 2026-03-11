import React from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

export interface PieSlice {
  name: string;
  value: number;
  color: string;
}

interface Props {
  data: PieSlice[];
  formatValue?: (v: number) => string;
  onSliceClick?: (name: string) => void;
  selectedName?: string | null;
  /** altura do container — padrão 180 (desktop), 120 (mobile) */
  height?: number;
}

const fmtDefault = (v: number) => v.toLocaleString('pt-BR');

const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: { payload: PieSlice }[];
  total: number;
  formatValue: (v: number) => string;
}> = ({ active, payload, total, formatValue }) => {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : '0';
  return (
    <div className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 shadow-xl">
      <p className="text-zinc-300 text-[0.625rem] font-bold truncate">{d.name}</p>
      <p className="text-white text-xs font-black">
        {formatValue(d.value)} ({pct}%)
      </p>
    </div>
  );
};

/** Hook simples pra detectar se é desktop (>=1024px) */
function useIsLg() {
  const [isLg, setIsLg] = React.useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);
  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (e: MediaQueryListEvent) => setIsLg(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isLg;
}

export const VantaPieChart: React.FC<Props> = ({
  data,
  formatValue = fmtDefault,
  onSliceClick,
  selectedName,
  height = 180,
}) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  const isLg = useIsLg();
  if (total === 0) return null;

  // Mobile: 120px, desktop: prop height
  const size = isLg ? height : Math.min(height, 120);

  return (
    <div className="flex flex-col items-center gap-3 lg:flex-row lg:items-center lg:gap-4">
      {/* Pizza */}
      <div className="shrink-0">
        <PieChart width={size} height={size}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={size / 2 - 8}
            innerRadius={size / 4}
            strokeWidth={2}
            stroke="#0A0A0A"
            onClick={(_: unknown, idx: number) => onSliceClick?.(data[idx].name)}
            className={onSliceClick ? 'cursor-pointer' : ''}
          >
            {data.map((d, i) => (
              <Cell
                key={`${d.name}-${i}`}
                fill={d.color}
                opacity={selectedName != null && d.name !== selectedName ? 0.3 : 1}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip total={total} formatValue={formatValue} />} />
        </PieChart>
      </div>

      {/* Legenda */}
      <div className="w-full min-w-0 space-y-1 lg:flex-1">
        {data.map((d, i) => {
          const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : '0';
          return (
            <button
              key={`${d.name}-${i}`}
              onClick={() => onSliceClick?.(d.name)}
              className={`w-full flex items-center gap-2 text-left rounded-lg px-2 py-1.5 transition-all ${
                d.name === selectedName ? 'bg-white/5' : onSliceClick ? 'active:bg-white/5' : ''
              }`}
            >
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
              <p className="flex-1 min-w-0 text-zinc-300 text-[0.6875rem] font-bold truncate">{d.name}</p>
              <p className="text-zinc-500 text-[0.625rem] shrink-0">{pct}%</p>
              <p className="text-zinc-400 text-[0.6875rem] font-bold shrink-0">{formatValue(d.value)}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
