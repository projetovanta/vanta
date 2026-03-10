import React from 'react';
import {
  Check,
  X,
  Instagram,
  AlertTriangle,
  MapPin,
  User,
  ChevronRight,
  Briefcase,
  HelpCircle,
  Tag,
  FileText,
} from 'lucide-react';
import type { SolicitacaoClube, TierMaisVanta } from '../../../../../types';
import { clubeService } from '../../../services/clubeService';
import { formatDate } from '../types';
import { TIER_LABELS, TIER_COLORS, getTierOptions } from './tierUtils';
import type { PerfilEnriquecido } from './tierUtils';
import { VantaDropdown } from './VantaDropdown';

interface Props {
  solicitacoes: SolicitacaoClube[];
  perfis: Record<string, PerfilEnriquecido>;
  tierSelects: Record<string, TierMaisVanta>;
  tagsSelects: Record<string, string[]>;
  notasInternas: Record<string, string>;
  onTierSelectChange: (id: string, tier: TierMaisVanta) => void;
  onTagsChange: (id: string, tags: string[]) => void;
  onNotaInternaChange: (id: string, nota: string) => void;
  onAprovar: (solId: string) => void;
  onRejeitar: (solId: string) => void;
  onOpenPerfil: (userId: string) => void;
  onOpenInstagram: (handle: string) => void;
}

export const SubTabSolicitacoes: React.FC<Props> = ({
  solicitacoes,
  perfis,
  tierSelects,
  tagsSelects,
  notasInternas,
  onTierSelectChange,
  onTagsChange,
  onNotaInternaChange,
  onAprovar,
  onRejeitar,
  onOpenPerfil,
  onOpenInstagram,
}) => (
  <div className="space-y-3">
    {solicitacoes.length === 0 ? (
      <p className="text-zinc-400 text-xs text-center py-10">Nenhuma solicitação pendente</p>
    ) : (
      solicitacoes.map(sol => {
        const p = perfis[sol.userId];
        return (
          <div key={sol.id} className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 space-y-3">
            {/* Card clicável — abre perfil */}
            <button
              onClick={() => onOpenPerfil(sol.userId)}
              className="w-full flex items-start gap-3 text-left active:scale-[0.98] transition-all"
            >
              {/* Selfie ou avatar */}
              <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 bg-zinc-800 shrink-0">
                {p?.selfieSignedUrl ? (
                  <img loading="lazy" src={p.selfieSignedUrl} alt="Selfie" className="w-full h-full object-cover" />
                ) : p?.foto ? (
                  <img loading="lazy" src={p.foto} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User size={20} className="text-zinc-400" />
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-bold text-sm truncate">{p?.nome || sol.userId.slice(0, 8)}</p>
                  <ChevronRight size={12} className="text-zinc-400 shrink-0" />
                </div>
                {p?.email && <p className="text-zinc-400 text-[10px] truncate">{p.email}</p>}
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Instagram size={10} className="text-zinc-400" />
                  <span className="text-zinc-400 text-[10px]">@{sol.instagramHandle}</span>
                  {sol.instagramSeguidores && (
                    <span className="text-zinc-400 text-[9px]">
                      · {sol.instagramSeguidores.toLocaleString('pt-BR')} seg.
                    </span>
                  )}
                  {sol.instagramVerificado ? (
                    <span className="text-[8px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                      Verificado ✓
                    </span>
                  ) : (
                    <span className="text-[8px] font-black uppercase tracking-wider text-zinc-400 bg-zinc-800 border border-white/5 px-1.5 py-0.5 rounded-full">
                      Não verificado
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  {(p?.cidade || p?.estado) && (
                    <span className="text-zinc-400 text-[9px] flex items-center gap-1">
                      <MapPin size={8} /> {[p?.cidade, p?.estado].filter(Boolean).join(', ')}
                    </span>
                  )}
                  <span className="text-zinc-700 text-[8px]">{formatDate(sol.criadoEm)}</span>
                </div>
                {sol.convidadoPor && (
                  <p className="text-zinc-400 text-[9px] mt-0.5">
                    Convidado por: {perfis[sol.convidadoPor]?.nome || sol.convidadoPor.slice(0, 8)}
                  </p>
                )}
                {clubeService.getFlagReincidencia(sol.userId) && (
                  <div className="flex items-center gap-1 mt-1 bg-red-500/15 border border-red-500/30 rounded-lg px-2 py-1">
                    <AlertTriangle size={10} className="text-red-400 shrink-0" />
                    <span className="text-red-400 text-[9px] font-bold">
                      Excluído por reincidência — solicita retorno
                    </span>
                  </div>
                )}
              </div>
            </button>

            {/* Profissão e Como conheceu */}
            {(sol.profissao || sol.comoConheceu) && (
              <div className="flex flex-wrap gap-2 px-1">
                {sol.profissao && (
                  <span className="flex items-center gap-1 text-zinc-400 text-[9px] bg-zinc-800/60 border border-white/5 rounded-lg px-2 py-1">
                    <Briefcase size={9} className="shrink-0" /> {sol.profissao}
                  </span>
                )}
                {sol.comoConheceu && (
                  <span className="flex items-center gap-1 text-zinc-400 text-[9px] bg-zinc-800/60 border border-white/5 rounded-lg px-2 py-1">
                    <HelpCircle size={9} className="shrink-0" /> {sol.comoConheceu}
                  </span>
                )}
              </div>
            )}

            {/* Tags — campo livre */}
            <div className="px-1 space-y-1">
              <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Tag size={9} /> Tags internas
              </p>
              {/* Tags já adicionadas */}
              {(tagsSelects[sol.id] || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-1">
                  {(tagsSelects[sol.id] || []).map(tag => (
                    <button
                      key={tag}
                      onClick={() =>
                        onTagsChange(
                          sol.id,
                          (tagsSelects[sol.id] || []).filter(t => t !== tag),
                        )
                      }
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#FFD300]/15 border border-[#FFD300]/30 text-[#FFD300] active:scale-90 transition-all"
                    >
                      {tag} <X size={8} />
                    </button>
                  ))}
                </div>
              )}
              {/* Input para adicionar tag */}
              <input
                type="text"
                placeholder="Digite uma tag e pressione Enter..."
                className="w-full bg-zinc-800/40 border border-white/5 rounded-xl px-3 py-1.5 text-zinc-300 text-[10px] placeholder-zinc-600 focus:outline-none focus:border-[#FFD300]/20"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val && !(tagsSelects[sol.id] || []).includes(val)) {
                      onTagsChange(sol.id, [...(tagsSelects[sol.id] || []), val]);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
            </div>

            {/* Nota interna */}
            <div className="px-1 space-y-1">
              <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                <FileText size={9} /> Nota interna
              </p>
              <textarea
                value={notasInternas[sol.id] || ''}
                onChange={e => onNotaInternaChange(sol.id, e.target.value)}
                placeholder="Observações internas (só curadores veem)..."
                rows={2}
                className="w-full bg-zinc-800/40 border border-white/5 rounded-xl px-3 py-2 text-zinc-300 text-[10px] placeholder-zinc-600 resize-none focus:outline-none focus:border-[#FFD300]/20"
              />
            </div>

            {/* Ações — 2 linhas para caber em mobile */}
            <div className="space-y-2">
              {/* Linha 1: Instagram + Tier */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenInstagram(sol.instagramHandle)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 text-[10px] font-bold shrink-0 active:scale-90 transition-all"
                >
                  <Instagram size={12} /> Instagram
                </button>
                <VantaDropdown
                  value={tierSelects[sol.id] || 'desconto'}
                  onChange={v => onTierSelectChange(sol.id, v as TierMaisVanta)}
                  options={getTierOptions().map(t => ({
                    value: t,
                    label: TIER_LABELS[t],
                    color: TIER_COLORS[t],
                  }))}
                  className="flex-1 min-w-0"
                />
              </div>
              {/* Linha 2: Aprovar + Rejeitar */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onAprovar(sol.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 text-[10px] font-black uppercase active:scale-90 transition-all"
                >
                  <Check size={12} /> Aprovar
                </button>
                <button
                  onClick={() => onRejeitar(sol.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-[10px] font-black uppercase active:scale-90 transition-all"
                >
                  <X size={12} /> Rejeitar
                </button>
              </div>
            </div>
          </div>
        );
      })
    )}
  </div>
);
