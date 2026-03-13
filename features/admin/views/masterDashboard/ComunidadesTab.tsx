import React, { useState, useMemo, useCallback } from 'react';
import { ArrowUpDown } from 'lucide-react';
import type { MasterAnalytics, CommunityRankingItem } from '../../services/analytics/types';
import BarChartCard from '../../components/dashboard/BarChartCard';
import { fmtBRL, fmtBRLCompact } from '../../../../utils';

// ── Types ────────────────────────────────────────────────────────────────────

interface Props {
  analytics: MasterAnalytics | null;
  onSelectComunidade: (id: string) => void;
}

type SortField = 'gmv' | 'tickets' | 'eventos';

const SORT_OPTIONS: { key: SortField; label: string }[] = [
  { key: 'gmv', label: 'GMV' },
  { key: 'tickets', label: 'Tickets' },
  { key: 'eventos', label: 'Eventos' },
];

// ── Community Card ───────────────────────────────────────────────────────────

const CommunityCard: React.FC<{
  item: CommunityRankingItem;
  rank: number;
  onClick: () => void;
}> = ({ item, rank, onClick }) => {
  const rankColor = rank === 1 ? '#FFD300' : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32' : '#71717a';

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full bg-zinc-900/60 border border-white/5 rounded-2xl p-3 active:bg-white/5 transition-all text-left"
    >
      {/* Rank */}
      <span className="text-sm font-black shrink-0 w-6 text-center" style={{ color: rankColor }}>
        {rank}
      </span>

      {/* Foto */}
      {item.comunidadeFoto ? (
        <img
          src={item.comunidadeFoto}
          alt=""
          className="w-8 h-8 rounded-full object-cover shrink-0 border border-white/10"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-zinc-700 shrink-0 flex items-center justify-center">
          <span className="text-[0.5rem] font-bold text-zinc-400 uppercase">
            {item.comunidadeNome?.charAt(0) ?? '?'}
          </span>
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-bold truncate">{item.comunidadeNome}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-zinc-400 text-[0.625rem]">GMV {fmtBRLCompact(item.gmv)}</span>
          <span className="text-zinc-600 text-[0.5rem]">|</span>
          <span className="text-zinc-400 text-[0.625rem]">Taxa {(item.taxaVanta * 100).toFixed(1)}%</span>
        </div>
      </div>

      {/* Right stats */}
      <div className="shrink-0 text-right">
        <p className="text-white text-xs font-bold">{item.eventos} ev</p>
        <p className="text-zinc-400 text-[0.625rem]">{item.tickets} tix</p>
      </div>
    </button>
  );
};

// ── Component ────────────────────────────────────────────────────────────────

export const ComunidadesTab: React.FC<Props> = ({ analytics, onSelectComunidade }) => {
  const [sortBy, setSortBy] = useState<SortField>('gmv');

  const sorted = useMemo(() => {
    if (!analytics?.comunidadesRanking) return [];
    return [...analytics.comunidadesRanking].sort((a, b) => {
      switch (sortBy) {
        case 'gmv':
          return b.gmv - a.gmv;
        case 'tickets':
          return b.tickets - a.tickets;
        case 'eventos':
          return b.eventos - a.eventos;
        default:
          return 0;
      }
    });
  }, [analytics?.comunidadesRanking, sortBy]);

  const barData = useMemo(() => {
    return sorted.slice(0, 10).map(c => ({
      name: c.comunidadeNome.length > 12 ? c.comunidadeNome.slice(0, 12) + '...' : c.comunidadeNome,
      value: c.gmv,
    }));
  }, [sorted]);

  const handleBarClick = useCallback(
    (name: string) => {
      const found = sorted.find(c => c.comunidadeNome.startsWith(name.replace('...', '')));
      if (found) onSelectComunidade(found.comunidadeId);
    },
    [sorted, onSelectComunidade],
  );

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
      {/* Sort toggle */}
      <div className="flex items-center gap-2">
        <ArrowUpDown size={12} className="text-zinc-500 shrink-0" />
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              className={`
                px-3 py-1 rounded-full text-[0.625rem] font-bold uppercase tracking-wider
                whitespace-nowrap shrink-0 transition-all
                ${
                  sortBy === opt.key
                    ? 'bg-[#FFD300]/15 text-[#FFD300] border border-[#FFD300]/30'
                    : 'bg-zinc-800/60 text-zinc-400 border border-white/5 active:bg-white/5'
                }
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Community cards */}
      <div className="flex flex-col gap-2">
        {sorted.map((item, idx) => (
          <CommunityCard
            key={item.comunidadeId}
            item={item}
            rank={idx + 1}
            onClick={() => onSelectComunidade(item.comunidadeId)}
          />
        ))}
        {sorted.length === 0 && <p className="text-zinc-500 text-sm text-center py-8">Nenhuma comunidade no período</p>}
      </div>

      {/* Bar chart — GMV por comunidade (top 10) */}
      {barData.length > 0 && (
        <BarChartCard
          title="GMV por Comunidade (Top 10)"
          data={barData}
          formatValue={fmtBRL}
          onBarClick={handleBarClick}
        />
      )}
    </div>
  );
};
