import React, { useEffect, useState } from 'react';
import { ArrowLeft, Megaphone, ListChecks, Users, UserCheck, Percent } from 'lucide-react';
import { getPromoterAnalytics } from '../../services/analytics';
import type { PromoterAnalyticsResult } from '../../services/analytics/promoterAnalyticsService';
import type { PromoterEventMetrics } from '../../services/analytics/promoterAnalyticsService';
import { TimeSeriesChart } from '../../components/dashboard';
import { KpiCard } from '../../components/KpiCards';
import { useAuthStore } from '../../../../stores/authStore';

// ── Props ────────────────────────────────────────────────────────────────────

interface Props {
  eventoId?: string;
  onBack: () => void;
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton: React.FC = () => (
  <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-24 bg-zinc-900/60 rounded-2xl animate-pulse" />
      ))}
    </div>
    <div className="h-48 bg-zinc-900/60 rounded-2xl animate-pulse" />
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-28 bg-zinc-900/60 rounded-2xl animate-pulse" />
      ))}
    </div>
  </div>
);

// ── Empty State ──────────────────────────────────────────────────────────────

const EmptyState: React.FC = () => (
  <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6">
    <Megaphone size={40} className="text-zinc-600" />
    <p className="text-zinc-400 text-sm text-center">Nenhum dado de promoter encontrado.</p>
    <p className="text-zinc-500 text-xs text-center">Quando voce for atribuido a listas, seus dados aparecerao aqui.</p>
  </div>
);

// ── Event Card ───────────────────────────────────────────────────────────────

const EventCard: React.FC<{ evento: PromoterEventMetrics }> = ({ evento }) => (
  <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 space-y-2">
    <p className="text-white text-sm font-bold truncate">{evento.eventoNome}</p>
    <div className="grid grid-cols-3 gap-2">
      <div className="text-center">
        <p className="text-white text-base font-black">{evento.totalNomes}</p>
        <p className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-wider">Nomes</p>
      </div>
      <div className="text-center">
        <p className="text-white text-base font-black">{evento.totalCheckins}</p>
        <p className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-wider">Check-ins</p>
      </div>
      <div className="text-center">
        <p className="text-white text-base font-black">{evento.taxaConversao}%</p>
        <p className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-wider">Conversao</p>
      </div>
    </div>
    {evento.listas > 0 && (
      <p className="text-zinc-500 text-xs">
        {evento.listas} lista{evento.listas > 1 ? 's' : ''} atribuida{evento.listas > 1 ? 's' : ''}
      </p>
    )}
  </div>
);

// ── Main Component ───────────────────────────────────────────────────────────

export const PromoterDashboardView: React.FC<Props> = ({ eventoId, onBack }) => {
  const userId = useAuthStore(s => s.currentAccount?.id);
  const [data, setData] = useState<PromoterAnalyticsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getPromoterAnalytics(userId, eventoId);
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [userId, eventoId]);

  // ── Derived data ─────────────────────────────────────────────────────────

  const totals = data?.totals;
  const eventos = data?.eventos ?? [];
  const timeSeries = data?.nomesTimeSeries ?? [];

  const filteredEventos = eventoId ? eventos.filter(e => e.eventoId === eventoId) : eventos;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-[#0A0A0A]">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 pt-[env(safe-area-inset-top)] pb-3 border-b border-white/5">
        <button onClick={onBack} className="p-1.5 -ml-1.5 active:bg-white/5 rounded-lg">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-white text-base font-bold truncate">Meu Desempenho</h1>
          {data?.promoterNome && <p className="text-zinc-400 text-xs truncate">{data.promoterNome}</p>}
        </div>
        <Megaphone size={20} className="text-amber-400 shrink-0" />
      </div>

      {/* Content */}
      {loading ? (
        <Skeleton />
      ) : error ? (
        <div className="flex-1 flex items-center justify-center px-6">
          <p className="text-red-400 text-sm text-center">{error}</p>
        </div>
      ) : !totals || eventos.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
          {/* KPI Grid */}
          <div className="grid grid-cols-2 gap-3">
            <KpiCard label="Listas Atribuidas" value={totals.listasAtribuidas} color="#FFD300" icon={ListChecks} />
            <KpiCard label="Total Nomes" value={totals.totalNomes} color="#8B5CF6" icon={Users} />
            <KpiCard label="Check-ins" value={totals.totalCheckins} color="#10B981" icon={UserCheck} />
            <KpiCard
              label="Conversao"
              value={totals.taxaConversao}
              color="#F59E0B"
              icon={Percent}
              formatValue={v => `${v}%`}
            />
          </div>

          {/* Timeline */}
          {timeSeries.length > 0 && (
            <TimeSeriesChart title="Nomes Adicionados por Dia" data={timeSeries} color="#8B5CF6" fill />
          )}

          {/* Per-event breakdown */}
          {filteredEventos.length > 0 && (
            <div className="space-y-3">
              <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider px-1">
                {eventoId ? 'Evento' : `Eventos (${filteredEventos.length})`}
              </p>
              {filteredEventos.map(ev => (
                <EventCard key={ev.eventoId} evento={ev} />
              ))}
            </div>
          )}

          {/* Comissao total */}
          {totals.comissao > 0 && (
            <div className="bg-zinc-900/60 border border-amber-400/20 rounded-2xl p-4 text-center">
              <p className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-wider mb-1">
                Comissao Acumulada
              </p>
              <p className="text-amber-400 text-xl font-black">
                R$ {totals.comissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
