import React from 'react';
import { Search, Users, ScanFace, Loader2, Star } from 'lucide-react';
import { Membro } from '../../../../types';
import { formatFollowers } from './types';

export const TabNovosMembros: React.FC<{
  query: string;
  onQueryChange: (q: string) => void;
  loading: boolean;
  filteredMembros: Membro[];
  selfieUrls: Record<string, string>;
  onSelectMembro: (id: string) => void;
  onToggleDestaque: (membroId: string, valor: boolean) => void;
  filterDestaque: boolean;
  onToggleFilterDestaque: () => void;
  destaqueCount: number;
}> = ({
  query,
  onQueryChange,
  loading,
  filteredMembros,
  selfieUrls,
  onSelectMembro,
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
            <Search size={14} className="text-zinc-600 shrink-0" />
            <input
              value={query}
              onChange={e => onQueryChange(e.target.value)}
              placeholder="Buscar membro..."
              className="flex-1 min-w-0 bg-transparent text-white text-sm outline-none placeholder-zinc-700"
            />
          </div>
          <button
            onClick={onToggleFilterDestaque}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border transition-all active:scale-95 shrink-0 ${
              filterDestaque
                ? 'bg-[#FFD300]/15 border-[#FFD300]/30 text-[#FFD300]'
                : 'bg-zinc-900/60 border-white/5 text-zinc-600'
            }`}
          >
            <Star size={12} className={filterDestaque ? 'fill-[#FFD300]' : ''} />
            {destaqueCount > 0 && <span className="text-[9px] font-black">{destaqueCount}</span>}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-5 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <Loader2 size={28} className="text-zinc-700 animate-spin" />
            <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest">Carregando...</p>
          </div>
        ) : filteredMembros.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center">
              <Users size={28} className="text-zinc-700" />
            </div>
            <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest text-center">
              {query || filterDestaque ? 'Nenhum resultado.' : 'Nenhum membro pendente.'}
            </p>
            {!query && !filterDestaque && (
              <p className="text-zinc-700 text-[9px] italic text-center leading-relaxed">
                Novos cadastros aparecem aqui
                <br />
                automaticamente.
              </p>
            )}
          </div>
        ) : (
          filteredMembros.map(m => {
            const selfie = selfieUrls[m.id] || m.biometriaFoto || m.foto;
            const isDestaque = m.destaque ?? false;
            return (
              <div
                key={m.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectMembro(m.id)}
                onKeyDown={e => e.key === 'Enter' && onSelectMembro(m.id)}
                className={`w-full flex gap-4 p-4 border rounded-2xl text-left active:bg-white/3 transition-all cursor-pointer ${
                  isDestaque ? 'bg-[#FFD300]/5 border-[#FFD300]/15' : 'bg-zinc-900/40 border-white/5'
                }`}
              >
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                  <img loading="lazy" src={selfie} alt={m.nome} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 inset-x-0 flex items-center justify-center gap-1 bg-black/60 py-1">
                    <ScanFace size={9} className="text-[#FFD300]" />
                    <span className="text-[#FFD300] text-[7px] font-black uppercase tracking-widest">Selfie</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-white font-bold text-base leading-tight mb-1 truncate">{m.nome}</p>
                  <p className="text-zinc-600 text-[10px] mb-1 truncate">{m.email}</p>
                  {(m.cidade || m.estado) && (
                    <p className="text-zinc-700 text-[9px] truncate mb-1">
                      {[m.cidade, m.estado].filter(Boolean).join(', ')}
                    </p>
                  )}
                  {m.instagram && (
                    <div className="flex items-center gap-1.5 min-w-0">
                      <p className="text-zinc-500 text-[10px] truncate">@{m.instagram.replace(/^@/, '')}</p>
                      {m.seguidoresInstagram != null && (
                        <span className="shrink-0 text-[8px] font-black text-[#FFD300] bg-[#FFD300]/10 border border-[#FFD300]/20 px-1.5 py-0.5 rounded-full">
                          {formatFollowers(m.seguidoresInstagram)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onToggleDestaque(m.id, !isDestaque);
                  }}
                  className="self-center w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-all shrink-0"
                >
                  <Star size={18} className={isDestaque ? 'text-[#FFD300] fill-[#FFD300]' : 'text-zinc-700'} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </>
  );
};
