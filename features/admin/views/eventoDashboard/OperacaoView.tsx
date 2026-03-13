import React from 'react';
import { UserCheck, Users, ShoppingCart, Gift, List, UserPlus, AlertTriangle } from 'lucide-react';
import type { EventoAdmin } from '../../../../types';
import type { EventAnalytics } from '../../services/analytics/types';
import { fmtBRL } from '../../../../utils';
import { KpiCard } from '../../components/KpiCards';
import MetricGrid from '../../components/dashboard/MetricGrid';
import ProgressRing from '../../components/dashboard/ProgressRing';
import TimeSeriesChart from '../../components/dashboard/TimeSeriesChart';
import HeatmapCard from '../../components/dashboard/HeatmapCard';
import LeaderboardCard from '../../components/dashboard/LeaderboardCard';
import { LivePulse } from '../../components/dashboard/LivePulse';

// ── Skeleton de loading ─────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {/* Live pulse skeleton */}
      <div className="animate-pulse bg-zinc-800/50 rounded-xl h-10" />
      {/* KPI grid skeleton */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="animate-pulse bg-zinc-800/50 rounded-xl h-24" />
        ))}
      </div>
      {/* Charts */}
      <div className="flex justify-center">
        <div className="animate-pulse bg-zinc-800/50 rounded-full h-20 w-20" />
      </div>
      <div className="animate-pulse bg-zinc-800/50 rounded-xl h-48" />
      <div className="animate-pulse bg-zinc-800/50 rounded-xl h-48" />
      <div className="animate-pulse bg-zinc-800/50 rounded-xl h-40" />
      <div className="animate-pulse bg-zinc-800/50 rounded-xl h-48" />
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildStaffLeaderboard(analytics: EventAnalytics) {
  return analytics.staff.map(s => ({
    id: s.membroId,
    name: s.membroNome,
    value: s.checkins,
    subtitle: s.papel,
  }));
}

function calcCheckinRate(analytics: EventAnalytics): number {
  const vendidos = analytics.tickets.totalVendidos;
  if (vendidos === 0) return 0;
  return Math.round((analytics.audience.totalCheckins / vendidos) * 100);
}

function calcOcupacaoPercent(analytics: EventAnalytics): number {
  const capacidade = analytics.tickets.porLote.reduce((sum, l) => sum + l.limite, 0);
  if (capacidade === 0) return 0;
  return Math.round((analytics.audience.totalPresentes / capacidade) * 100);
}

// ── Props ────────────────────────────────────────────────────────────────────

interface Props {
  evento: EventoAdmin;
  analytics: EventAnalytics | null;
  loading: boolean;
}

// ── Componente ───────────────────────────────────────────────────────────────

export const OperacaoView: React.FC<Props> = ({ evento: _evento, analytics, loading }) => {
  if (loading || !analytics) {
    return <LoadingSkeleton />;
  }

  const checkinRate = calcCheckinRate(analytics);
  const ocupacaoPercent = calcOcupacaoPercent(analytics);

  return (
    <div className="space-y-4">
      {/* ── Indicador ao vivo ── */}
      <div className="flex items-center justify-center rounded-2xl bg-zinc-900/40 border border-white/5 py-2">
        <LivePulse label="Evento ao Vivo" color="#22c55e" />
      </div>

      {/* ── KPI Grid 2x3 ── */}
      <MetricGrid columns={3}>
        <KpiCard label="Check-ins" value={analytics.audience.totalCheckins} color="#22c55e" icon={UserCheck} />
        <KpiCard label="Ocupação" value={ocupacaoPercent} color="#FFD300" icon={Users} formatValue={v => `${v}%`} />
        <KpiCard
          label="Vendas Caixa"
          value={analytics.operations.vendasCaixaValor}
          color="#8b5cf6"
          icon={ShoppingCart}
          formatValue={fmtBRL}
        />
        <KpiCard label="Cortesias Usadas" value={analytics.operations.cortesiasUsadas} color="#f97316" icon={Gift} />
        <KpiCard label="Listas Ativas" value={analytics.operations.listasAtivas} color="#3b82f6" icon={List} />
        <KpiCard label="Nomes nas Listas" value={analytics.operations.nomesNasListas} color="#ec4899" icon={UserPlus} />
      </MetricGrid>

      {/* ── Check-in rate ring ── */}
      <div className="flex flex-col items-center gap-2 rounded-2xl bg-zinc-900/40 border border-white/5 p-4">
        <p className="text-[0.6rem] uppercase tracking-widest text-zinc-400">Taxa de Check-in</p>
        <ProgressRing
          value={checkinRate}
          label={`${checkinRate}%`}
          size={80}
          color={checkinRate >= 70 ? '#22c55e' : '#FFD300'}
          thickness={6}
        />
        <p className="text-xs text-zinc-500">
          {analytics.audience.totalCheckins.toLocaleString('pt-BR')} /{' '}
          {analytics.tickets.totalVendidos.toLocaleString('pt-BR')} vendidos
        </p>
      </div>

      {/* ── Check-ins por hora ── */}
      <TimeSeriesChart
        title="Check-ins por Hora"
        data={analytics.audience.checkinsPorHora}
        color="#22c55e"
        fill
        formatValue={v => v.toLocaleString('pt-BR')}
      />

      {/* ── Heatmap check-ins ── */}
      {analytics.audience.heatmapCheckins.length > 0 && (
        <HeatmapCard
          title="Heatmap de Check-ins"
          data={analytics.audience.heatmapCheckins}
          colorScale={['#18181b', '#22c55e']}
        />
      )}

      {/* ── Alertas ── */}
      {ocupacaoPercent > 80 && (
        <div className="flex items-start gap-3 rounded-2xl bg-amber-950/30 border border-amber-500/20 p-4">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-400" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-amber-300">Ocupação alta — {ocupacaoPercent}%</p>
            <p className="mt-0.5 text-xs text-amber-400/70">
              O evento está acima de 80% da capacidade. Monitore a entrada e considere pausar vendas no caixa se
              necessário.
            </p>
          </div>
        </div>
      )}

      {/* ── Staff leaderboard ── */}
      <LeaderboardCard
        title="Equipe — Check-ins"
        items={buildStaffLeaderboard(analytics)}
        formatValue={v => v.toLocaleString('pt-BR')}
        maxItems={10}
      />
    </div>
  );
};
