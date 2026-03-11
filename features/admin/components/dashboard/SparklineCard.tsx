import React from 'react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import type { LucideIcon } from 'lucide-react';
import type { TimeSeriesPoint } from '../../services/analytics/types';

interface Props {
  label: string;
  value: string;
  delta?: number;
  icon: LucideIcon;
  color?: string;
  data: TimeSeriesPoint[];
  onClick?: () => void;
}

export default function SparklineCard({ label, value, delta, icon: Icon, color = '#FFD300', data, onClick }: Props) {
  const isPositive = delta !== undefined && delta >= 0;
  const deltaColor = isPositive ? 'text-emerald-400' : 'text-red-400';
  const deltaArrow = isPositive ? '\u25B2' : '\u25BC';

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={e => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) onClick();
      }}
      className={`rounded-2xl bg-zinc-900/40 border border-white/5 p-5 space-y-4 ${
        onClick ? 'cursor-pointer active:bg-white/5' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-zinc-400" />
        <span className="text-[0.5rem] uppercase tracking-widest text-zinc-400">{label}</span>
      </div>

      {/* Value + Delta */}
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white">{value}</span>
        {delta !== undefined && (
          <span className={`text-xs font-medium ${deltaColor}`}>
            {deltaArrow} {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>

      {/* Sparkline */}
      {data.length > 1 && (
        <div className="h-12">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`spark-${label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={1.5}
                fill={`url(#spark-${label})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
