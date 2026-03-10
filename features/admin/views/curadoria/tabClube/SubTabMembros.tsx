import React from 'react';
import { Search, Crown, X, Instagram, AlertTriangle, RefreshCw, User } from 'lucide-react';
import type { MembroClubeVanta, TierMaisVanta } from '../../../../../types';
import { clubeService } from '../../../services/clubeService';
import { formatDate } from '../types';
import { TIER_LABELS, TIER_COLORS, getTierOptions } from './tierUtils';
import type { PerfilEnriquecido } from './tierUtils';
import { VantaDropdown } from './VantaDropdown';

interface Props {
  filteredMembros: MembroClubeVanta[];
  perfis: Record<string, PerfilEnriquecido>;
  query: string;
  setQuery: (v: string) => void;
  tierFilter: TierMaisVanta | '';
  setTierFilter: (v: TierMaisVanta | '') => void;
  atualizandoSeg: boolean;
  onAtualizarSeguidores: () => void;
  onAlterarTier: (userId: string, tier: TierMaisVanta) => void;
  onOpenPerfil: (userId: string) => void;
}

export const SubTabMembros: React.FC<Props> = ({
  filteredMembros,
  perfis,
  query,
  setQuery,
  tierFilter,
  setTierFilter,
  atualizandoSeg,
  onAtualizarSeguidores,
  onAlterarTier,
  onOpenPerfil,
}) => (
  <div className="space-y-3">
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar membro..."
          className="w-full pl-9 pr-3 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-white text-xs"
        />
      </div>
      <VantaDropdown
        value={tierFilter}
        onChange={v => setTierFilter(v as TierMaisVanta | '')}
        options={[
          { value: '', label: 'Todos' },
          ...getTierOptions().map(t => ({ value: t, label: TIER_LABELS[t], color: TIER_COLORS[t] })),
        ]}
        placeholder="Todos"
        className="w-28"
      />
      <button
        aria-label="Atualizar"
        onClick={onAtualizarSeguidores}
        disabled={atualizandoSeg}
        className="flex items-center gap-1 px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-zinc-400 text-[9px] font-bold shrink-0 active:scale-90 transition-all disabled:opacity-40"
        title="Atualizar seguidores de todos os membros"
      >
        <RefreshCw size={12} className={atualizandoSeg ? 'animate-spin' : ''} />
      </button>
    </div>

    {filteredMembros.length === 0 ? (
      <p className="text-zinc-400 text-xs text-center py-10">Nenhum membro encontrado</p>
    ) : (
      filteredMembros.map(m => {
        const p = perfis[m.userId];
        return (
          <div key={m.userId} className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              {/* Avatar clicável */}
              <button
                onClick={() => onOpenPerfil(m.userId)}
                className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 bg-zinc-800 shrink-0 active:scale-90 transition-all"
              >
                {p?.selfieSignedUrl ? (
                  <img loading="lazy" src={p.selfieSignedUrl} alt="" className="w-full h-full object-cover" />
                ) : p?.foto ? (
                  <img loading="lazy" src={p.foto} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User size={16} className="text-zinc-400" />
                  </div>
                )}
              </button>
              <button onClick={() => onOpenPerfil(m.userId)} className="flex-1 min-w-0 text-left">
                <p className="text-white font-bold text-sm truncate">{p?.nome || m.userId.slice(0, 8)}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {m.instagramHandle && (
                    <>
                      <Instagram size={10} className="text-zinc-400" />
                      <span className="text-zinc-400 text-[10px]">@{m.instagramHandle}</span>
                    </>
                  )}
                  {m.instagramSeguidores && (
                    <span className="text-zinc-400 text-[9px]">
                      · {m.instagramSeguidores.toLocaleString('pt-BR')} seg.
                    </span>
                  )}
                </div>
              </button>
              <div className="flex items-center gap-2 shrink-0">
                <VantaDropdown
                  value={m.tier}
                  onChange={v => onAlterarTier(m.userId, v as TierMaisVanta)}
                  options={getTierOptions().map(t => ({
                    value: t,
                    label: TIER_LABELS[t],
                    color: TIER_COLORS[t],
                  }))}
                  className="w-28"
                />
                <Crown size={14} style={{ color: TIER_COLORS[m.tier] }} />
              </div>
            </div>
            {/* Tags e nota interna do membro */}
            {m.tags && m.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {m.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-[#FFD300]/10 border border-[#FFD300]/20 text-[#FFD300]/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {m.notaInterna && (
              <p className="text-zinc-500 text-[9px] mt-1 truncate" title={m.notaInterna}>
                {m.notaInterna}
              </p>
            )}
            {clubeService.temDividaSocial(m.userId) && (
              <div className="flex items-center gap-1.5 mt-2 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <AlertTriangle size={10} className="text-amber-400" />
                <span className="text-amber-400 text-[9px] font-bold">
                  Post pendente — bloqueado para novas reservas
                </span>
              </div>
            )}
            {clubeService.isBanidoPermanente(m.userId) && (
              <div className="flex items-center gap-1.5 mt-2 px-2 py-1 bg-red-900/30 border border-red-500/30 rounded-lg">
                <X size={10} className="text-red-400" />
                <span className="text-red-400 text-[9px] font-bold">Banido permanentemente</span>
              </div>
            )}
            {!clubeService.isBanidoPermanente(m.userId) && clubeService.getBloqueioAte(m.userId) && (
              <div className="flex items-center gap-1.5 mt-2 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertTriangle size={10} className="text-red-400" />
                <span className="text-red-400 text-[9px] font-bold">
                  Bloqueado até {formatDate(clubeService.getBloqueioAte(m.userId) || '')}
                </span>
              </div>
            )}
          </div>
        );
      })
    )}
  </div>
);
