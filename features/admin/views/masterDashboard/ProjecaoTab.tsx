import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, DollarSign, Ticket, Target } from 'lucide-react';
import type { MasterAnalytics } from '../../services/analytics/types';
import MetricGrid from '../../components/dashboard/MetricGrid';
import TimeSeriesChart from '../../components/dashboard/TimeSeriesChart';
import { KpiCard } from '../../components/KpiCards';
import { fmtBRL, fmtBRLCompact } from '../../../../utils';

// ── Types ────────────────────────────────────────────────────────────────────

interface Props {
  analytics: MasterAnalytics | null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getDaysElapsedInMonth(): number {
  const now = new Date();
  return now.getDate();
}

function getDaysInCurrentMonth(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

// ── Trend Badge ──────────────────────────────────────────────────────────────

const TrendBadge: React.FC<{
  current: number;
  projected: number;
  label: string;
}> = ({ current, projected, label }) => {
  const diff = projected - current;
  const pct = current > 0 ? Math.round((diff / current) * 100) : 0;
  const isUp = pct > 0;
  const isDown = pct < 0;
  const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
  const color = isUp ? '#10b981' : isDown ? '#ef4444' : '#71717a';

  return (
    <div className="flex items-center justify-between bg-zinc-800/60 rounded-xl px-3 py-2">
      <span className="text-zinc-400 text-xs">{label}</span>
      <div className="flex items-center gap-1.5">
        <Icon size={12} style={{ color }} />
        <span className="text-xs font-bold" style={{ color }}>
          {isUp ? '+' : ''}
          {pct}%
        </span>
      </div>
    </div>
  );
};

// ── Component ────────────────────────────────────────────────────────────────

export const ProjecaoTab: React.FC<Props> = ({ analytics }) => {
  // ── Projection calculations ──────────────────────────────────────────────

  const projection = useMemo(() => {
    if (!analytics) return null;

    const daysElapsed = getDaysElapsedInMonth();
    const daysInMonth = getDaysInCurrentMonth();

    if (daysElapsed === 0) return null;

    const dailyGMV = analytics.gmvTotal / daysElapsed;
    const dailyRevenue = analytics.receitaVanta / daysElapsed;
    const dailyTickets = analytics.totalTickets / daysElapsed;

    const projectedMonthGMV = dailyGMV * daysInMonth;
    const projectedMonthRevenue = dailyRevenue * daysInMonth;
    const projectedMonthTickets = Math.round(dailyTickets * daysInMonth);

    const projectedAnnualGMV = dailyGMV * 30 * 12;
    const projectedAnnualRevenue = dailyRevenue * 30 * 12;
    const projectedAnnualTickets = Math.round(dailyTickets * 30 * 12);

    return {
      daysElapsed,
      daysInMonth,
      dailyGMV,
      dailyRevenue,
      dailyTickets,
      projectedMonthGMV,
      projectedMonthRevenue,
      projectedMonthTickets,
      projectedAnnualGMV,
      projectedAnnualRevenue,
      projectedAnnualTickets,
    };
  }, [analytics]);

  // ── Guard ──────────────────────────────────────────────────────────────────

  if (!analytics) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-zinc-500 text-sm">Sem dados</p>
      </div>
    );
  }

  if (!projection) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-zinc-500 text-sm">Dados insuficientes para projeção</p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Progress indicator */}
      <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Progresso do Mês</span>
          <span className="text-white text-xs font-bold">
            {projection.daysElapsed}/{projection.daysInMonth} dias
          </span>
        </div>
        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#FFD300] rounded-full transition-all duration-700"
            style={{
              width: `${Math.round((projection.daysElapsed / projection.daysInMonth) * 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Projected Month KPIs */}
      <div className="flex flex-col gap-1">
        <span className="text-zinc-500 text-[0.625rem] font-bold uppercase tracking-wider px-1">Projeção Mensal</span>
        <MetricGrid columns={3}>
          <KpiCard
            label="GMV Projetado"
            value={projection.projectedMonthGMV}
            color="#FFD300"
            icon={DollarSign}
            formatValue={fmtBRLCompact}
          />
          <KpiCard
            label="Receita VANTA"
            value={projection.projectedMonthRevenue}
            color="#10b981"
            icon={Target}
            formatValue={fmtBRLCompact}
          />
          <KpiCard
            label="Tickets"
            value={projection.projectedMonthTickets}
            color="#3b82f6"
            icon={Ticket}
            formatValue={v => v.toLocaleString('pt-BR')}
          />
        </MetricGrid>
      </div>

      {/* Projected Annual KPIs */}
      <div className="flex flex-col gap-1">
        <span className="text-zinc-500 text-[0.625rem] font-bold uppercase tracking-wider px-1">
          Projeção Anual (linear)
        </span>
        <MetricGrid columns={3}>
          <KpiCard
            label="GMV Anual"
            value={projection.projectedAnnualGMV}
            color="#FFD300"
            icon={DollarSign}
            formatValue={fmtBRLCompact}
          />
          <KpiCard
            label="Receita Anual"
            value={projection.projectedAnnualRevenue}
            color="#10b981"
            icon={Target}
            formatValue={fmtBRLCompact}
          />
          <KpiCard
            label="Tickets Anual"
            value={projection.projectedAnnualTickets}
            color="#3b82f6"
            icon={Ticket}
            formatValue={v => v.toLocaleString('pt-BR')}
          />
        </MetricGrid>
      </div>

      {/* Vendas timeline (actual) */}
      {analytics.vendasTimeSeries?.length > 0 && (
        <TimeSeriesChart
          title="Vendas — Tendência Atual"
          data={analytics.vendasTimeSeries}
          color="#FFD300"
          fill
          formatValue={fmtBRL}
        />
      )}

      {/* Projection card with daily averages */}
      <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4">
        <h3 className="text-white text-sm font-bold mb-3">Médias Diárias</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col">
            <span className="text-zinc-500 text-[0.625rem] font-bold uppercase tracking-wider">GMV/dia</span>
            <span className="text-white text-sm font-black">{fmtBRLCompact(projection.dailyGMV)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-zinc-500 text-[0.625rem] font-bold uppercase tracking-wider">Receita/dia</span>
            <span className="text-white text-sm font-black">{fmtBRLCompact(projection.dailyRevenue)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-zinc-500 text-[0.625rem] font-bold uppercase tracking-wider">Tix/dia</span>
            <span className="text-white text-sm font-black">{Math.round(projection.dailyTickets)}</span>
          </div>
        </div>
      </div>

      {/* Trend indicators */}
      <div className="flex flex-col gap-2">
        <span className="text-zinc-500 text-[0.625rem] font-bold uppercase tracking-wider px-1">
          Tendência (atual vs projetado mês)
        </span>
        <TrendBadge current={analytics.gmvTotal} projected={projection.projectedMonthGMV} label="GMV" />
        <TrendBadge
          current={analytics.receitaVanta}
          projected={projection.projectedMonthRevenue}
          label="Receita VANTA"
        />
        <TrendBadge current={analytics.totalTickets} projected={projection.projectedMonthTickets} label="Tickets" />
      </div>
    </div>
  );
};
