import React, { useMemo } from 'react';
import { DollarSign, TrendingUp, Ticket, Gem, Calendar, Building2 } from 'lucide-react';
import type { MasterAnalytics } from '../../services/analytics/types';
import MetricGrid from '../../components/dashboard/MetricGrid';
import TimeSeriesChart from '../../components/dashboard/TimeSeriesChart';
import LeaderboardCard from '../../components/dashboard/LeaderboardCard';
import { KpiCard } from '../../components/KpiCards';
import { fmtBRL, fmtBRLCompact } from '../../../../utils';

// ── Types ────────────────────────────────────────────────────────────────────

interface Props {
  analytics: MasterAnalytics | null;
  onSelectComunidade: (id: string) => void;
  onSelectEvento: (id: string) => void;
}

// ── Component ────────────────────────────────────────────────────────────────

export const OverviewTab: React.FC<Props> = ({ analytics, onSelectComunidade, onSelectEvento }) => {
  // ── Derived data ─────────────────────────────────────────────────────────

  const comunidadesLeaderboard = useMemo(() => {
    if (!analytics?.comunidadesRanking) return [];
    return analytics.comunidadesRanking.slice(0, 5).map(c => ({
      id: c.comunidadeId,
      name: c.comunidadeNome,
      foto: c.comunidadeFoto,
      value: c.gmv,
      subtitle: `${c.tickets} tickets`,
    }));
  }, [analytics?.comunidadesRanking]);

  const eventosLeaderboard = useMemo(() => {
    if (!analytics?.topEventos) return [];
    return analytics.topEventos.slice(0, 5).map(e => ({
      id: e.eventoId,
      name: e.eventoNome,
      value: e.receita,
      subtitle: `${e.vendidos} vendidos`,
    }));
  }, [analytics?.topEventos]);

  // ── Guard ──────────────────────────────────────────────────────────────────

  if (!analytics) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-zinc-500 text-sm">Sem dados</p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Hero KPIs */}
      <MetricGrid columns={4}>
        <KpiCard
          label="GMV Total"
          value={analytics.gmvTotal}
          color="#FFD300"
          icon={DollarSign}
          formatValue={fmtBRLCompact}
        />
        <KpiCard
          label="Receita VANTA"
          value={analytics.receitaVanta}
          color="#10b981"
          icon={TrendingUp}
          formatValue={fmtBRLCompact}
        />
        <KpiCard
          label="Lucro VANTA"
          value={analytics.lucroVanta}
          color="#8b5cf6"
          icon={Gem}
          formatValue={fmtBRLCompact}
        />
        <KpiCard
          label="Total Tickets"
          value={analytics.totalTickets}
          color="#3b82f6"
          icon={Ticket}
          formatValue={v => v.toLocaleString('pt-BR')}
        />
      </MetricGrid>

      {/* Vendas timeline */}
      {analytics.vendasTimeSeries?.length > 0 && (
        <TimeSeriesChart
          title="Vendas no Período"
          data={analytics.vendasTimeSeries}
          color="#FFD300"
          fill
          formatValue={fmtBRL}
        />
      )}

      {/* Top 5 Comunidades */}
      {comunidadesLeaderboard.length > 0 && (
        <LeaderboardCard
          title="Top Comunidades"
          items={comunidadesLeaderboard}
          formatValue={fmtBRLCompact}
          maxItems={5}
          onItemClick={onSelectComunidade}
        />
      )}

      {/* Top 5 Eventos */}
      {eventosLeaderboard.length > 0 && (
        <LeaderboardCard
          title="Top Eventos"
          items={eventosLeaderboard}
          formatValue={fmtBRLCompact}
          maxItems={5}
          onItemClick={onSelectEvento}
        />
      )}

      {/* Quick stats */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-zinc-800/60 border border-white/5 rounded-full px-3 py-1.5">
          <Calendar size={12} className="text-zinc-400" />
          <span className="text-xs font-bold text-zinc-300">{analytics.totalEventos} eventos</span>
        </div>
        <div className="flex items-center gap-1.5 bg-zinc-800/60 border border-white/5 rounded-full px-3 py-1.5">
          <Building2 size={12} className="text-zinc-400" />
          <span className="text-xs font-bold text-zinc-300">{analytics.totalComunidades} comunidades</span>
        </div>
      </div>
    </div>
  );
};
