import React, { useState, useMemo } from 'react';
import {
  Check,
  Instagram,
  AlertTriangle,
  MapPin,
  User,
  ChevronRight,
  Briefcase,
  HelpCircle,
  FileText,
  Clock,
  Sparkles,
  Eye,
  Users,
} from 'lucide-react';
import type { SolicitacaoClube, TierMaisVanta } from '../../../../../types';
import { clubeService } from '../../../services/clubeService';
import { formatDate } from '../types';
import { TIER_LABELS, TIER_COLORS, getTierOptions } from './tierUtils';
import type { PerfilEnriquecido } from './tierUtils';
import { VantaDropdown } from './VantaDropdown';
import { TagsPredefinidas } from './TagsPredefinidas';

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
  onAdiar: (solId: string) => void;
  onOpenPerfil: (userId: string) => void;
  onOpenInstagram: (handle: string) => void;
}

type BaldeFiltro =
  | 'todos'
  | 'provavel_creator'
  | 'provavel_presenca'
  | 'provavel_social'
  | 'indicado_tier_alto'
  | 'sem_fit_claro';

const BALDE_CONFIG: { key: BaldeFiltro; label: string; cor: string; icon: React.ReactNode }[] = [
  { key: 'todos', label: 'Todos', cor: 'text-zinc-300 bg-zinc-800 border-white/10', icon: null },
  {
    key: 'provavel_creator',
    label: 'Creator',
    cor: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
    icon: <Sparkles size="0.625rem" />,
  },
  {
    key: 'provavel_presenca',
    label: 'Presença',
    cor: 'text-pink-300 bg-pink-500/10 border-pink-500/20',
    icon: <Eye size="0.625rem" />,
  },
  {
    key: 'provavel_social',
    label: 'Social',
    cor: 'text-blue-300 bg-blue-500/10 border-blue-500/20',
    icon: <Users size="0.625rem" />,
  },
  {
    key: 'indicado_tier_alto',
    label: 'Indicação VIP',
    cor: 'text-yellow-300 bg-yellow-500/10 border-yellow-500/20',
    icon: <Sparkles size="0.625rem" />,
  },
  {
    key: 'sem_fit_claro',
    label: 'Sem fit',
    cor: 'text-zinc-400 bg-zinc-800/60 border-white/5',
    icon: <HelpCircle size="0.625rem" />,
  },
];

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
  onAdiar,
  onOpenPerfil,
  onOpenInstagram,
}) => {
  const [baldeFiltro, setBaldeFiltro] = useState<BaldeFiltro>('todos');

  const contagens = useMemo(() => {
    const c: Record<string, number> = { todos: solicitacoes.length };
    for (const sol of solicitacoes) {
      const b = sol.baldeSugerido || 'sem_fit_claro';
      c[b] = (c[b] || 0) + 1;
    }
    return c;
  }, [solicitacoes]);

  const filtradas = useMemo(
    () =>
      baldeFiltro === 'todos'
        ? solicitacoes
        : solicitacoes.filter(s => (s.baldeSugerido || 'sem_fit_claro') === baldeFiltro),
    [solicitacoes, baldeFiltro],
  );

  return (
    <div className="space-y-3">
      {/* Filtro por baldes */}
      {solicitacoes.length > 0 && (
        <div className="-mx-1 px-1">
          <div className="flex flex-wrap gap-1.5 pb-2">
            {BALDE_CONFIG.map(b => {
              const count = contagens[b.key] || 0;
              const ativo = baldeFiltro === b.key;
              return (
                <button
                  key={b.key}
                  onClick={() => setBaldeFiltro(b.key)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[0.5625rem] font-bold uppercase tracking-wider transition-all active:scale-95 ${
                    ativo ? b.cor + ' ring-1 ring-white/20' : 'text-zinc-500 bg-zinc-900/40 border-white/5'
                  }`}
                >
                  {b.icon}
                  {b.label}
                  {count > 0 && <span className="ml-0.5 opacity-60">{count}</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {filtradas.length === 0 ? (
        <p className="text-zinc-400 text-xs text-center py-10">
          {solicitacoes.length === 0 ? 'Nenhuma solicitação pendente' : 'Nenhuma solicitação neste balde'}
        </p>
      ) : (
        filtradas.map(sol => {
          const p = perfis[sol.userId];
          return (
            <div key={sol.id} className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 space-y-3">
              {/* Card clicável — abre perfil */}
              <button
                onClick={() => onOpenPerfil(sol.userId)}
                className="w-full flex items-start gap-3 text-left active:scale-[0.98] transition-all"
              >
                {/* Avatar */}
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 bg-zinc-800 shrink-0">
                  {p?.foto ? (
                    <img loading="lazy" src={p.foto} alt="Perfil" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size="1.25rem" className="text-zinc-400" />
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-bold text-sm truncate">{p?.nome || sol.userId.slice(0, 8)}</p>
                    <ChevronRight size="0.75rem" className="text-zinc-400 shrink-0" />
                  </div>
                  {p?.email && <p className="text-zinc-400 text-[0.625rem] truncate">{p.email}</p>}
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Instagram size="0.625rem" className="text-zinc-400" />
                    <span className="text-zinc-400 text-[0.625rem]">@{sol.instagramHandle}</span>
                    {sol.instagramSeguidores && (
                      <span className="text-zinc-400 text-[0.5625rem]">
                        · {sol.instagramSeguidores.toLocaleString('pt-BR')} seg.
                      </span>
                    )}
                    {sol.instagramVerificado ? (
                      <span className="text-[0.5rem] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                        Verificado ✓
                      </span>
                    ) : (
                      <span className="text-[0.5rem] font-black uppercase tracking-wider text-zinc-400 bg-zinc-800 border border-white/5 px-1.5 py-0.5 rounded-full">
                        Não verificado
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {(sol.cidade || p?.cidade || p?.estado) && (
                      <span className="text-zinc-400 text-[0.5625rem] flex items-center gap-1">
                        <MapPin size="0.5rem" /> {sol.cidade || [p?.cidade, p?.estado].filter(Boolean).join(', ')}
                      </span>
                    )}
                    {sol.baldeSugerido && (
                      <span
                        className={`text-[0.5rem] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                          sol.baldeSugerido === 'provavel_creator'
                            ? 'text-amber-300 bg-amber-500/10 border border-amber-500/20'
                            : sol.baldeSugerido === 'provavel_presenca'
                              ? 'text-pink-300 bg-pink-500/10 border border-pink-500/20'
                              : sol.baldeSugerido === 'provavel_social'
                                ? 'text-blue-300 bg-blue-500/10 border border-blue-500/20'
                                : sol.baldeSugerido === 'indicado_tier_alto'
                                  ? 'text-yellow-300 bg-yellow-500/10 border border-yellow-500/20'
                                  : 'text-zinc-400 bg-zinc-800 border border-white/5'
                        }`}
                      >
                        {sol.baldeSugerido === 'provavel_creator'
                          ? 'Creator'
                          : sol.baldeSugerido === 'provavel_presenca'
                            ? 'Presença'
                            : sol.baldeSugerido === 'provavel_social'
                              ? 'Social'
                              : sol.baldeSugerido === 'indicado_tier_alto'
                                ? 'Indicação VIP'
                                : 'Sem fit'}
                      </span>
                    )}
                    <span className="text-zinc-700 text-[0.5rem]">{formatDate(sol.criadoEm)}</span>
                  </div>
                  {(sol.convidadoPor || sol.indicadoPorTexto) && (
                    <p className="text-zinc-400 text-[0.5625rem] mt-0.5">
                      {sol.convidadoPor
                        ? `Convidado por: ${perfis[sol.convidadoPor]?.nome || sol.convidadoPor.slice(0, 8)}`
                        : `Indicado por: ${sol.indicadoPorTexto}`}
                    </p>
                  )}
                  {clubeService.getFlagReincidencia(sol.userId) && (
                    <div className="flex items-center gap-1 mt-1 bg-red-500/15 border border-red-500/30 rounded-lg px-2 py-1">
                      <AlertTriangle size="0.625rem" className="text-red-400 shrink-0" />
                      <span className="text-red-400 text-[0.5625rem] font-bold">
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
                    <span className="flex items-center gap-1 text-zinc-400 text-[0.5625rem] bg-zinc-800/60 border border-white/5 rounded-lg px-2 py-1">
                      <Briefcase size="0.5625rem" className="shrink-0" /> {sol.profissao}
                    </span>
                  )}
                  {sol.comoConheceu && (
                    <span className="flex items-center gap-1 text-zinc-400 text-[0.5625rem] bg-zinc-800/60 border border-white/5 rounded-lg px-2 py-1">
                      <HelpCircle size="0.5625rem" className="shrink-0" /> {sol.comoConheceu}
                    </span>
                  )}
                </div>
              )}

              {/* Tags predefinidas por categoria */}
              <TagsPredefinidas selected={tagsSelects[sol.id] || []} onChange={tags => onTagsChange(sol.id, tags)} />

              {/* Nota interna */}
              <div className="px-1 space-y-1">
                <p className="text-zinc-500 text-[0.5625rem] font-bold uppercase tracking-wider flex items-center gap-1">
                  <FileText size="0.5625rem" /> Nota interna
                </p>
                <textarea
                  value={notasInternas[sol.id] || ''}
                  onChange={e => onNotaInternaChange(sol.id, e.target.value)}
                  placeholder="Observações internas (só curadores veem)..."
                  rows={2}
                  className="w-full bg-zinc-800/40 border border-white/5 rounded-xl px-3 py-2 text-zinc-300 text-[0.625rem] placeholder-zinc-600 resize-none focus:outline-none focus:border-[#FFD300]/20"
                />
              </div>

              {/* Ações — 2 linhas para caber em mobile */}
              <div className="space-y-2">
                {/* Linha 1: Instagram + Tier */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenInstagram(sol.instagramHandle)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 text-[0.625rem] font-bold shrink-0 active:scale-90 transition-all"
                  >
                    <Instagram size="0.75rem" /> Instagram
                  </button>
                  <VantaDropdown
                    value={tierSelects[sol.id] || 'lista'}
                    onChange={v => onTierSelectChange(sol.id, v as TierMaisVanta)}
                    options={getTierOptions().map(t => ({
                      value: t,
                      label: TIER_LABELS[t],
                      color: TIER_COLORS[t],
                    }))}
                    className="flex-1 min-w-0"
                  />
                </div>
                {/* Linha 2: Aprovar + Adiar */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onAprovar(sol.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 text-[0.625rem] font-black uppercase active:scale-90 transition-all"
                  >
                    <Check size="0.75rem" /> Aprovar
                  </button>
                  <button
                    onClick={() => onAdiar(sol.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-zinc-500/20 border border-zinc-500/30 rounded-xl text-zinc-400 text-[0.625rem] font-black uppercase active:scale-90 transition-all"
                  >
                    <Clock size="0.75rem" /> Adiar
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
