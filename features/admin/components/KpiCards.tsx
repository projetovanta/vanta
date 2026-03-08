import React from 'react';
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';
import type { MetricaPar, Periodo } from '../services/dashboardAnalyticsService';

// ── KPI Card (comunidade — sem delta) ────────────────────────────────────────
export const KpiCard: React.FC<{
  label: string;
  value: number;
  color: string;
  icon: LucideIcon;
  prefix?: string;
  formatValue?: (v: number) => string;
  onClick?: () => void;
}> = ({ label, value, color, icon: Icon, prefix, formatValue, onClick }) => (
  <button
    onClick={onClick}
    disabled={!onClick}
    className={`flex flex-col items-center justify-center bg-zinc-900/60 border border-white/5 rounded-2xl p-3 min-w-0 ${onClick ? 'active:bg-white/5 active:border-white/10 cursor-pointer' : 'cursor-default'} transition-all`}
  >
    <Icon size={16} style={{ color }} className="mb-1.5" />
    <p className="text-white text-lg font-black leading-none truncate w-full text-center">
      {prefix}
      {formatValue ? formatValue(value) : value}
    </p>
    <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest mt-1 truncate w-full text-center">
      {label}
    </p>
  </button>
);

// ── KPI Card com Mini Donut ──────────────────────────────────────────────────
const MiniDonut: React.FC<{ value: number; total: number; color: string }> = ({ value, total, color }) => {
  const pct = total > 0 ? Math.min(value / total, 1) : 0;
  const r = 16;
  const c = 2 * Math.PI * r;
  const filled = c * pct;
  const empty = c - filled;
  return (
    <svg width="38" height="38" viewBox="0 0 42 42" className="shrink-0">
      <circle cx="21" cy="21" r={r} fill="none" stroke="#27272a" strokeWidth="4" />
      {pct > 0 && (
        <circle
          cx="21"
          cy="21"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={`${filled} ${empty}`}
          strokeDashoffset={c / 4}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      )}
      <text x="21" y="22" textAnchor="middle" dominantBaseline="central" fill="white" fontSize="9" fontWeight="900">
        {total > 0 ? `${Math.round(pct * 100)}%` : '—'}
      </text>
    </svg>
  );
};

export const KpiPieCard: React.FC<{
  label: string;
  value: number;
  total: number;
  color: string;
  onClick?: () => void;
}> = ({ label, value, total, color, onClick }) => (
  <button
    onClick={onClick}
    disabled={!onClick}
    className={`flex items-center gap-3 bg-zinc-900/60 border border-white/5 rounded-2xl p-3 min-w-0 ${onClick ? 'active:bg-white/5 cursor-pointer' : 'cursor-default'} transition-all`}
  >
    <MiniDonut value={value} total={total} color={color} />
    <div className="flex-1 min-w-0">
      <p className="text-white text-base font-black leading-none">
        {value}
        <span className="text-zinc-400 text-xs font-bold">/{total}</span>
      </p>
      <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest mt-0.5 truncate">{label}</p>
    </div>
  </button>
);

// ── Delta helper ─────────────────────────────────────────────────────────────
const calcDelta = (atual: number, anterior: number): number =>
  anterior === 0 ? (atual > 0 ? 100 : 0) : Math.round(((atual - anterior) / anterior) * 100);

// ── KPI Card com Delta Comparativo ──────────────────────────────────────────
export const KpiDeltaCard: React.FC<{
  label: string;
  metric: MetricaPar;
  color: string;
  icon: LucideIcon;
  prefix?: string;
  formatValue?: (v: number) => string;
  onClick?: () => void;
}> = ({ label, metric, color, icon: Icon, prefix, formatValue, onClick }) => {
  const delta = calcDelta(metric.atual, metric.anterior);
  const isPositive = delta > 0;
  const isNegative = delta < 0;
  const DeltaIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  const deltaColor = isPositive ? '#10b981' : isNegative ? '#ef4444' : '#71717a';

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`flex flex-col items-center justify-center bg-zinc-900/60 border border-white/5 rounded-2xl p-3 min-w-0 ${onClick ? 'active:bg-white/5 active:border-white/10 cursor-pointer' : 'cursor-default'} transition-all`}
    >
      <Icon size={14} style={{ color }} className="mb-1" />
      <p className="text-white text-lg font-black leading-none truncate w-full text-center">
        {formatValue ? (
          formatValue(metric.atual)
        ) : (
          <>
            {prefix}
            {metric.atual.toLocaleString('pt-BR')}
          </>
        )}
      </p>
      <div className="flex items-center gap-0.5 mt-1">
        <DeltaIcon size={10} style={{ color: deltaColor }} />
        <span className="text-[9px] font-bold" style={{ color: deltaColor }}>
          {delta > 0 ? '+' : ''}
          {delta}%
        </span>
      </div>
      <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest mt-0.5 truncate w-full text-center">
        {label}
      </p>
    </button>
  );
};

// ── Filtro de Período (chips) ───────────────────────────────────────────────
export const PERIODOS: { value: Periodo; label: string }[] = [
  // audit-ok: diferente do PERIODOS de eventManagement
  { value: 'HOJE', label: 'Hoje' },
  { value: 'SEMANA', label: 'Semana' },
  { value: 'MES', label: 'Mês' },
  { value: 'ANO', label: 'Ano' },
];
