import React, { useCallback } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface DataItem {
  name: string;
  value: number;
  color?: string;
}

interface Props {
  title: string;
  data: DataItem[];
  formatValue?: (v: number) => string;
  height?: number;
  onBarClick?: (name: string) => void;
}

const VANTA_GOLD = '#FFD300';

interface TooltipPayloadEntry {
  value: number;
  payload: DataItem;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  formatValue?: (v: number) => string;
}

function CustomTooltip({ active, payload, formatValue }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-lg bg-zinc-800 border border-white/10 px-3 py-2 shadow-lg">
      <p className="text-[0.5rem] uppercase tracking-widest text-zinc-400">{item.payload.name}</p>
      <p className="text-xs font-semibold text-white">
        {formatValue ? formatValue(item.value) : item.value.toLocaleString('pt-BR')}
      </p>
    </div>
  );
}

export default function BarChartCard({ title, data, formatValue, height = 200, onBarClick }: Props) {
  const handleClick = useCallback(
    (entry: DataItem) => {
      if (onBarClick) onBarClick(entry.name);
    },
    [onBarClick],
  );

  return (
    <div className="rounded-2xl bg-zinc-900/40 border border-white/5 p-5 space-y-4">
      <h3 className="text-[0.5rem] uppercase tracking-widest text-zinc-400">{title}</h3>

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 8 }} />
            <YAxis hide />
            <Tooltip
              content={<CustomTooltip formatValue={formatValue} />}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            />
            <Bar
              dataKey="value"
              radius={[4, 4, 0, 0]}
              cursor={onBarClick ? 'pointer' : undefined}
              onClick={handleClick}
            >
              {data.map((entry, idx) => (
                <Cell key={idx} fill={entry.color ?? VANTA_GOLD} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
