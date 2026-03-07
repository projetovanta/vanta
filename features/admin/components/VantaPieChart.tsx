import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

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
  /** altura do container — padrão 180 */
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
      <p className="text-zinc-300 text-[10px] font-bold truncate">{d.name}</p>
      <p className="text-white text-xs font-black">
        {formatValue(d.value)} ({pct}%)
      </p>
    </div>
  );
};

export const VantaPieChart: React.FC<Props> = ({
  data,
  formatValue = fmtDefault,
  onSliceClick,
  selectedName,
  height = 180,
}) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;

  return (
    <div className="flex items-center gap-4">
      {/* Pizza */}
      <div className="shrink-0" style={{ width: height, height }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={height / 2 - 10}
              innerRadius={height / 4}
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
        </ResponsiveContainer>
      </div>

      {/* Legenda */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {data.map((d, i) => {
          const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : '0';
          return (
            <button
              key={`${d.name}-${i}`}
              onClick={() => onSliceClick?.(d.name)}
              className={`w-full flex items-center gap-2 text-left rounded-lg px-2 py-1 transition-all ${
                d.name === selectedName ? 'bg-white/5' : onSliceClick ? 'active:bg-white/5' : ''
              }`}
            >
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
              <div className="flex-1 min-w-0">
                <p className="text-zinc-300 text-[9px] font-bold truncate">{d.name}</p>
                <p className="text-zinc-700 text-[7px]">{pct}%</p>
              </div>
              <p className="text-zinc-400 text-[9px] font-bold shrink-0">{formatValue(d.value)}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
