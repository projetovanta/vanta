import React, { useState, useMemo } from 'react';
import { Calendar, Ticket, DollarSign, UserCheck } from 'lucide-react';
import type { CommunityAnalytics, EventoRankingItem } from '../../services/analytics/types';
import { fmtBRL } from '../../../../utils';

// ── Types ────────────────────────────────────────────────────────────────────

interface Props {
  analytics: CommunityAnalytics | null;
  onSelectEvento: (id: string) => void;
}

type SortField = 'receita' | 'vendidos' | 'data';

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  } catch {
    return iso;
  }
}

const BADGE_COLORS = {
  success: { text: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  warning: { text: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  danger: { text: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
} as const;

function checkinBadge(rate: number): { label: string; color: (typeof BADGE_COLORS)[keyof typeof BADGE_COLORS] } {
  const pct = Math.round(rate * 100);
  if (pct >= 70) return { label: `${pct}%`, color: BADGE_COLORS.success };
  if (pct >= 40) return { label: `${pct}%`, color: BADGE_COLORS.warning };
  return { label: `${pct}%`, color: BADGE_COLORS.danger };
}

// ── Empty state ──────────────────────────────────────────────────────────────

const EMPTY = (
  <div className="flex items-center justify-center py-16">
    <p className="text-zinc-500 text-xs">Nenhum evento no período selecionado</p>
  </div>
);

// ── Component ────────────────────────────────────────────────────────────────

export const EventosTab: React.FC<Props> = ({ analytics, onSelectEvento }) => {
  const [sortBy, setSortBy] = useState<SortField>('receita');

  // ── Sort events ────────────────────────────────────────────────────────

  const sorted = useMemo(() => {
    if (!analytics?.eventosRanking) return [];
    const items = [...analytics.eventosRanking];

    switch (sortBy) {
      case 'receita':
        return items.sort((a, b) => b.receita - a.receita);
      case 'vendidos':
        return items.sort((a, b) => b.vendidos - a.vendidos);
      case 'data':
        return items.sort((a, b) => b.dataInicio.localeCompare(a.dataInicio));
      default:
        return items;
    }
  }, [analytics?.eventosRanking, sortBy]);

  // ── Render ─────────────────────────────────────────────────────────────

  if (!analytics) return EMPTY;

  return (
    <div className="p-4 space-y-4 pb-8">
      {/* Sort options */}
      <div className="flex gap-2">
        {[
          { key: 'receita' as SortField, label: 'Receita' },
          { key: 'vendidos' as SortField, label: 'Vendidos' },
          { key: 'data' as SortField, label: 'Data' },
        ].map(({ key, label }) => {
          const isSelected = sortBy === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSortBy(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
                isSelected
                  ? 'bg-[#FFD300]/10 text-[#FFD300] border-[#FFD300]/20'
                  : 'bg-zinc-900/40 text-zinc-400 border-white/5 active:bg-white/5'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Event list */}
      {sorted.length === 0 ? (
        EMPTY
      ) : (
        <div className="space-y-3">
          {sorted.map((evt: EventoRankingItem) => {
            const badge = checkinBadge(evt.checkinRate);
            return (
              <button
                key={evt.eventoId}
                type="button"
                onClick={() => onSelectEvento(evt.eventoId)}
                className="w-full text-left rounded-2xl bg-zinc-900/40 border border-white/5 p-4 active:bg-white/5 transition-all space-y-2"
              >
                {/* Title + date */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-white text-sm font-bold truncate flex-1 min-w-0">{evt.eventoNome}</h3>
                  <span
                    className="shrink-0 text-[0.5rem] font-bold uppercase px-2 py-0.5 rounded-full"
                    style={{ color: badge.color.text, backgroundColor: badge.color.bg }}
                  >
                    {badge.label}
                  </span>
                </div>

                {/* Metrics row */}
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1 text-zinc-400">
                    <Calendar size={12} className="shrink-0" />
                    {formatDate(evt.dataInicio)}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <DollarSign size={12} className="shrink-0" />
                    {fmtBRL(evt.receita)}
                  </span>
                  <span className="flex items-center gap-1 text-purple-400">
                    <Ticket size={12} className="shrink-0" />
                    {evt.vendidos}
                  </span>
                  <span className="flex items-center gap-1 text-amber-400">
                    <UserCheck size={12} className="shrink-0" />
                    {Math.round(evt.checkinRate * 100)}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
