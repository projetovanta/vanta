import React from 'react';
import { ResponsiveContainer, LineChart, AreaChart, Line, Area, XAxis, YAxis, Tooltip } from 'recharts';
import type { TimeSeriesPoint } from '../../services/analytics/types';

interface Props {
  title: string;
  data: TimeSeriesPoint[];
  color?: string;
  fill?: boolean;
  formatValue?: (v: number) => string;
  height?: number;
}

const VANTA_GOLD = '#FFD300';

interface TooltipPayloadEntry {
  value: number;
  payload: TimeSeriesPoint;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
  formatValue?: (v: number) => string;
}

function CustomTooltip({ active, payload, label, formatValue }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0];
  return (
    <div className="rounded-lg bg-zinc-800 border border-white/10 px-3 py-2 shadow-lg">
      <p className="text-[0.5rem] uppercase tracking-widest text-zinc-500">{label}</p>
      <p className="text-xs font-semibold text-white">
        {formatValue ? formatValue(point.value) : point.value.toLocaleString('pt-BR')}
      </p>
    </div>
  );
}

export default function TimeSeriesChart({
  title,
  data,
  color = VANTA_GOLD,
  fill = false,
  formatValue,
  height = 200,
}: Props) {
  const gradientId = `ts-fill-${title.replace(/\s+/g, '-')}`;

  const axisProps = {
    axisLine: false,
    tickLine: false,
    tick: { fill: '#71717a', fontSize: 8 } as const,
  };

  const sharedMargin = { top: 4, right: 8, bottom: 0, left: 0 };

  return (
    <div className="rounded-2xl bg-zinc-900/40 border border-white/5 p-5 space-y-4">
      <h3 className="text-[0.5rem] uppercase tracking-widest text-zinc-400">{title}</h3>

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {fill ? (
            <AreaChart data={data} margin={sharedMargin}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" {...axisProps} />
              <YAxis {...axisProps} width={32} />
              <Tooltip
                content={<CustomTooltip formatValue={formatValue} />}
                cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#${gradientId})`} />
            </AreaChart>
          ) : (
            <LineChart data={data} margin={sharedMargin}>
              <XAxis dataKey="date" {...axisProps} />
              <YAxis {...axisProps} width={32} />
              <Tooltip
                content={<CustomTooltip formatValue={formatValue} />}
                cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3, fill: color }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
