import React, { useMemo } from 'react';
import { CalendarDays, Ticket, DollarSign, TrendingUp, UserCheck, RefreshCw } from 'lucide-react';
import type { CommunityAnalytics } from '../../services/analytics/types';
import { TimeSeriesChart, LeaderboardCard } from '../../components/dashboard';
import { KpiCard } from '../../components/KpiCards';
import { fmtBRL } from '../../../../utils';

// ── Types ────────────────────────────────────────────────────────────────────

interface Props {
  analytics: CommunityAnalytics | null;
  onSelectEvento: (id: string) => void;
}

// ── Empty state ──────────────────────────────────────────────────────────────

const EMPTY = (
  <div className="flex items-center justify-center py-16">
    <p className="text-zinc-500 text-xs">Sem dados para o período selecionado</p>
  </div>
);

// ── Component ────────────────────────────────────────────────────────────────

export const OverviewTab: React.FC<Props> = ({ analytics, onSelectEvento }) => {
  // ── Leaderboard items ──────────────────────────────────────────────────

  const eventosLeaderboard = useMemo(() => {
    if (!analytics?.eventosRanking) return [];
    return analytics.eventosRanking.slice(0, 5).map(e => ({
      id: e.eventoId,
      name: e.eventoNome,
      value: e.receita,
      subtitle: `${e.vendidos} vendidos`,
    }));
  }, [analytics?.eventosRanking]);

  const promotersLeaderboard = useMemo(() => {
    if (!analytics?.topPromoters) return [];
    return analytics.topPromoters.slice(0, 5).map(p => ({
      id: p.promoterId,
      name: p.promoterNome,
      foto: p.promoterFoto,
      value: p.totalNomes,
      subtitle: `${(p.taxaConversao * 100).toFixed(0)}% conversão`,
    }));
  }, [analytics?.topPromoters]);

  // ── Render ─────────────────────────────────────────────────────────────

  if (!analytics) return EMPTY;

  const { revenue, tickets, audience, retencaoPublico } = analytics;

  return (
    <div className="p-4 space-y-5 pb-8">
      {/* KPI Grid 2x3 */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard label="Total Eventos" value={analytics.totalEventos} color="#FFD300" icon={CalendarDays} />
        <KpiCard label="Vendidos Total" value={tickets.totalVendidos} color="#8B5CF6" icon={Ticket} />
        <KpiCard
          label="Receita Bruta"
          value={revenue.receitaBruta}
          color="#10B981"
          icon={DollarSign}
          formatValue={fmtBRL}
        />
        <KpiCard
          label="Receita Líquida"
          value={revenue.receitaLiquida}
          color="#06B6D4"
          icon={TrendingUp}
          formatValue={fmtBRL}
        />
        <KpiCard
          label="Taxa Check-in"
          value={Math.round(audience.taxaCheckin * 100)}
          color="#F59E0B"
          icon={UserCheck}
          formatValue={v => `${v}%`}
        />
        <KpiCard
          label="Retenção"
          value={Math.round(retencaoPublico * 100)}
          color="#EC4899"
          icon={RefreshCw}
          formatValue={v => `${v}%`}
        />
      </div>

      {/* Vendas timeline */}
      {analytics.vendasTimeSeries.length > 0 && (
        <TimeSeriesChart
          title="Vendas ao longo do tempo"
          data={analytics.vendasTimeSeries}
          color="#FFD300"
          fill
          formatValue={fmtBRL}
        />
      )}

      {/* Top 5 Eventos */}
      <LeaderboardCard
        title="Top 5 Eventos — Receita"
        items={eventosLeaderboard}
        formatValue={fmtBRL}
        maxItems={5}
        onItemClick={onSelectEvento}
      />

      {/* Top 5 Promoters */}
      <LeaderboardCard
        title="Top 5 Promoters — Nomes"
        items={promotersLeaderboard}
        formatValue={v => `${v} nomes`}
        maxItems={5}
      />
    </div>
  );
};
