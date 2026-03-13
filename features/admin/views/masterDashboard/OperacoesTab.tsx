import React, { useMemo } from 'react';
import { Calendar, Ticket, Zap } from 'lucide-react';
import type { MasterAnalytics } from '../../services/analytics/types';
import MetricGrid from '../../components/dashboard/MetricGrid';
import LeaderboardCard from '../../components/dashboard/LeaderboardCard';
import { KpiCard } from '../../components/KpiCards';
import { fmtBRLCompact } from '../../../../utils';

// ── Types ────────────────────────────────────────────────────────────────────

interface Props {
  analytics: MasterAnalytics | null;
  onSelectEvento: (id: string) => void;
}

// ── Component ────────────────────────────────────────────────────────────────

export const OperacoesTab: React.FC<Props> = ({ analytics, onSelectEvento }) => {
  const eventosLeaderboard = useMemo(() => {
    if (!analytics?.topEventos) return [];
    return analytics.topEventos.map(e => ({
      id: e.eventoId,
      name: e.eventoNome,
      value: e.vendidos,
      subtitle: `Check-in ${Math.round(e.checkinRate * 100)}%`,
    }));
  }, [analytics?.topEventos]);

  const highCheckinEvents = useMemo(() => {
    if (!analytics?.topEventos) return [];
    return analytics.topEventos.filter(e => e.checkinRate >= 0.8);
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
      {/* Summary KPIs */}
      <MetricGrid columns={2}>
        <KpiCard
          label="Total Eventos"
          value={analytics.totalEventos}
          color="#FFD300"
          icon={Calendar}
          formatValue={v => v.toLocaleString('pt-BR')}
        />
        <KpiCard
          label="Total Tickets"
          value={analytics.totalTickets}
          color="#3b82f6"
          icon={Ticket}
          formatValue={v => v.toLocaleString('pt-BR')}
        />
      </MetricGrid>

      {/* Top eventos by vendidos */}
      {eventosLeaderboard.length > 0 && (
        <LeaderboardCard
          title="Top Eventos por Vendas"
          items={eventosLeaderboard}
          formatValue={v => `${v.toLocaleString('pt-BR')} tix`}
          onItemClick={onSelectEvento}
        />
      )}

      {/* High check-in highlight */}
      {highCheckinEvents.length > 0 && (
        <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-emerald-400 shrink-0" />
            <h3 className="text-white text-sm font-bold">Alta Taxa de Check-in ({'>'}80%)</h3>
          </div>
          <div className="flex flex-col gap-2">
            {highCheckinEvents.map(e => (
              <button
                key={e.eventoId}
                onClick={() => onSelectEvento(e.eventoId)}
                className="flex items-center justify-between w-full bg-zinc-800/60 rounded-xl px-3 py-2 active:bg-white/5 transition-all"
              >
                <span className="text-zinc-200 text-sm truncate min-w-0 flex-1 text-left">{e.eventoNome}</span>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-emerald-400 text-xs font-bold">{Math.round(e.checkinRate * 100)}%</span>
                  <span className="text-zinc-500 text-[0.625rem]">{fmtBRLCompact(e.receita)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Operational summary */}
      <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4">
        <h3 className="text-white text-sm font-bold mb-2">Resumo Operacional</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <span className="text-zinc-500 text-[0.625rem] font-bold uppercase tracking-wider">Comunidades</span>
            <span className="text-white text-lg font-black">{analytics.totalComunidades}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-zinc-500 text-[0.625rem] font-bold uppercase tracking-wider">Tix / Evento</span>
            <span className="text-white text-lg font-black">
              {analytics.totalEventos > 0 ? Math.round(analytics.totalTickets / analytics.totalEventos) : 0}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-zinc-500 text-[0.625rem] font-bold uppercase tracking-wider">GMV / Evento</span>
            <span className="text-white text-lg font-black">
              {analytics.totalEventos > 0 ? fmtBRLCompact(analytics.gmvTotal / analytics.totalEventos) : 'R$ 0'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-zinc-500 text-[0.625rem] font-bold uppercase tracking-wider">Top Eventos</span>
            <span className="text-white text-lg font-black">{analytics.topEventos?.length ?? 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
