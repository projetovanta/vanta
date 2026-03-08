import React from 'react';
import { Search, Users, Loader2, MapPin, X, Edit2, Crown, Star } from 'lucide-react';
import { Membro } from '../../../../types';
import { formatFollowers } from './types';

export const TabMembros: React.FC<{
  queryM: string;
  onQueryMChange: (q: string) => void;
  loadingM: boolean;
  filteredM: Membro[];
  cidades: string[];
  filterCidades: Set<string>;
  activeFilterCount: number;
  onSelectMembro: (m: Membro) => void;
  onRemoveCidadeFilter: (c: string) => void;
  onClearFilters: () => void;
  mvMemberIds: Set<string>;
  mvPendingIds: Set<string>;
  onConvidarMV: (m: Membro) => void;
  onToggleDestaque: (membroId: string, valor: boolean) => void;
  filterDestaque: boolean;
  onToggleFilterDestaque: () => void;
  destaqueCount: number;
}> = ({
  queryM,
  onQueryMChange,
  loadingM,
  filteredM,
  filterCidades,
  activeFilterCount,
  onSelectMembro,
  onRemoveCidadeFilter,
  onClearFilters,
  mvMemberIds,
  mvPendingIds,
  onConvidarMV,
  onToggleDestaque,
  filterDestaque,
  onToggleFilterDestaque,
  destaqueCount,
}) => {
  return (
    <>
      <div className="px-5 pt-4 pb-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-3 bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-2.5 min-w-0">
            <Search size={14} className="text-zinc-400 shrink-0" />
            <input
              value={queryM}
              onChange={e => onQueryMChange(e.target.value)}
              placeholder="Buscar membro..."
              className="flex-1 min-w-0 bg-transparent text-white text-sm outline-none placeholder-zinc-700"
            />
          </div>
          <button
            onClick={onToggleFilterDestaque}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border transition-all active:scale-95 shrink-0 ${
              filterDestaque
                ? 'bg-[#FFD300]/15 border-[#FFD300]/30 text-[#FFD300]'
                : 'bg-zinc-900/60 border-white/5 text-zinc-400'
            }`}
          >
            <Star size={12} className={filterDestaque ? 'fill-[#FFD300]' : ''} />
            {destaqueCount > 0 && <span className="text-[9px] font-black">{destaqueCount}</span>}
          </button>
        </div>

        {/* Chips dos filtros ativos */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {Array.from(filterCidades).map(c => (
              <button
                key={c}
                onClick={() => onRemoveCidadeFilter(c)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider border bg-zinc-800 border-zinc-700 text-zinc-300 active:scale-95 transition-all"
              >
                <MapPin size={8} />
                {c}
                <X size={8} />
              </button>
            ))}
            <button
              onClick={onClearFilters}
              className="px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider text-zinc-400 active:text-zinc-400 transition-all"
            >
              Limpar
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-5 space-y-3">
        {loadingM ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <Loader2 size={28} className="text-zinc-700 animate-spin" />
            <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest">Carregando membros...</p>
          </div>
        ) : filteredM.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center">
              <Users size={28} className="text-zinc-700" />
            </div>
            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest text-center">
              {queryM || activeFilterCount > 0 || filterDestaque ? 'Nenhum resultado.' : 'Nenhum membro classificado.'}
            </p>
            {!queryM && activeFilterCount === 0 && !filterDestaque && (
              <p className="text-zinc-700 text-[10px] italic mt-1 text-center">
                Use a aba "Novos Membros" para classificar.
              </p>
            )}
          </div>
        ) : (
          filteredM.map(m => {
            const isDestaque = m.destaque ?? false;
            return (
              <div
                key={m.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectMembro(m)}
                onKeyDown={e => e.key === 'Enter' && onSelectMembro(m)}
                className={`w-full flex items-center gap-4 p-4 border rounded-2xl active:bg-zinc-900/80 transition-all text-left relative overflow-hidden cursor-pointer ${
                  isDestaque ? 'bg-[#FFD300]/5 border-[#FFD300]/15' : 'bg-zinc-900/60 border-white/5'
                }`}
              >
                <div className="w-[52px] h-[52px] rounded-2xl overflow-hidden border border-white/10 shrink-0">
                  <img loading="lazy" src={m.foto} alt={m.nome} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm leading-none mb-1 truncate">{m.nome}</p>
                  <p className="text-zinc-400 text-[10px] truncate mb-1">{m.email}</p>
                  {(m.cidade || m.estado) && (
                    <p className="text-zinc-700 text-[9px] truncate mb-1">
                      {[m.cidade, m.estado].filter(Boolean).join(', ')}
                    </p>
                  )}
                  {m.instagram && (
                    <div className="flex items-center gap-1.5 min-w-0 mb-1">
                      <p className="text-zinc-400 text-[10px] truncate">@{m.instagram.replace(/^@/, '')}</p>
                      {m.seguidoresInstagram != null && (
                        <span className="shrink-0 text-[8px] font-black text-[#FFD300] bg-[#FFD300]/10 border border-[#FFD300]/20 px-1.5 py-0.5 rounded-full">
                          {formatFollowers(m.seguidoresInstagram)}
                        </span>
                      )}
                    </div>
                  )}
                  {(m.tagsCuradoria ?? []).length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {(m.tagsCuradoria ?? []).slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="text-[7px] font-black uppercase tracking-wide text-[#FFD300] bg-[#FFD300]/10 border border-[#FFD300]/20 px-2 py-0.5 rounded-full truncate max-w-[7rem]"
                        >
                          {tag}
                        </span>
                      ))}
                      {(m.tagsCuradoria ?? []).length > 3 && (
                        <span className="text-[7px] font-black text-zinc-400">
                          +{(m.tagsCuradoria ?? []).length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onToggleDestaque(m.id, !isDestaque);
                    }}
                    className="w-8 h-8 rounded-xl flex items-center justify-center active:scale-90 transition-all"
                  >
                    <Star size={14} className={isDestaque ? 'text-[#FFD300] fill-[#FFD300]' : 'text-zinc-700'} />
                  </button>
                  {mvMemberIds.has(m.id) ? (
                    <span className="text-[7px] font-black uppercase tracking-wider text-[#FFD300] bg-[#FFD300]/10 border border-[#FFD300]/20 px-2 py-1.5 rounded-xl">
                      MV
                    </span>
                  ) : mvPendingIds.has(m.id) ? (
                    <span className="text-[7px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1.5 rounded-xl">
                      Pendente
                    </span>
                  ) : (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onConvidarMV(m);
                      }}
                      className="w-8 h-8 rounded-xl bg-[#FFD300]/10 border border-[#FFD300]/20 flex items-center justify-center active:scale-90 transition-all"
                    >
                      <Crown size={12} className="text-[#FFD300]" />
                    </button>
                  )}
                  <div className="w-8 h-8 rounded-xl bg-zinc-800/50 border border-white/5 flex items-center justify-center">
                    <Edit2 size={12} className="text-zinc-400" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {!loadingM && (
        <div className="px-6 pb-6 pt-3 border-t border-white/5 shrink-0">
          <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest text-center">
            {filteredM.length} membro{filteredM.length !== 1 ? 's' : ''} classificado{filteredM.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </>
  );
};
