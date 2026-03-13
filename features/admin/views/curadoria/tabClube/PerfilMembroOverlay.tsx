import React from 'react';
import {
  ArrowLeft,
  Check,
  X,
  Instagram,
  AlertTriangle,
  Crown,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
} from 'lucide-react';
import type { SolicitacaoClube, MembroClubeVanta, TierMaisVanta } from '../../../../../types';
import { clubeService } from '../../../services/clubeService';
import { formatDate } from '../types';
import { TIER_LABELS, TIER_COLORS, getTierOptions } from './tierUtils';
import type { PerfilEnriquecido } from './tierUtils';
import { VantaDropdown } from './VantaDropdown';

interface Props {
  userId: string;
  perfil: PerfilEnriquecido;
  solicitacao?: SolicitacaoClube;
  membro?: MembroClubeVanta;
  perfis: Record<string, PerfilEnriquecido>;
  tierSelects: Record<string, TierMaisVanta>;
  onTierSelectChange: (id: string, tier: TierMaisVanta) => void;
  onAprovar: (solId: string) => void;
  onClose: () => void;
}

/** Helper: abre Instagram via deep link (app) com fallback web */
const openInstagram = (handle: string) => {
  window.location.href = `instagram://user?username=${handle}`;
  setTimeout(() => {
    window.open(`https://instagram.com/${handle}`, '_blank');
  }, 500);
};

export const PerfilMembroOverlay: React.FC<Props> = ({
  userId,
  perfil,
  solicitacao,
  membro,
  perfis,
  tierSelects,
  onTierSelectChange,
  onAprovar,
  onClose,
}) => {
  const igHandle = solicitacao?.instagramHandle || membro?.instagramHandle || perfil.instagram;

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-4 pb-6">
      {/* Header */}
      <button
        onClick={onClose}
        className="flex items-center gap-2 text-zinc-400 text-xs mb-4 active:scale-95 transition-all"
      >
        <ArrowLeft size="1rem" /> Voltar
      </button>

      {/* Foto perfil */}
      <div className="flex gap-4 mb-5">
        {perfil.foto ? (
          <div className="shrink-0">
            <p className="text-zinc-400 text-[0.5rem] font-black uppercase tracking-wider mb-1.5">Foto Perfil</p>
            <div className="w-24 h-24 rounded-2xl overflow-hidden border border-white/10 bg-zinc-900">
              <img loading="lazy" src={perfil.foto} alt="Perfil" className="w-full h-full object-cover" />
            </div>
          </div>
        ) : (
          <div className="w-24 h-24 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center">
            <User size="2rem" className="text-zinc-700" />
          </div>
        )}
      </div>

      {/* Nome */}
      <h2 className="text-white font-bold text-lg mb-3 truncate">{perfil.nome}</h2>

      {/* Info grid */}
      <div className="space-y-2.5 mb-5">
        {perfil.email && (
          <div className="flex items-center gap-2.5">
            <Mail size="0.75rem" className="text-zinc-400 shrink-0" />
            <span className="text-zinc-300 text-xs truncate">{perfil.email}</span>
          </div>
        )}
        {perfil.telefone && (
          <div className="flex items-center gap-2.5">
            <Phone size="0.75rem" className="text-zinc-400 shrink-0" />
            <span className="text-zinc-300 text-xs">{perfil.telefone}</span>
          </div>
        )}
        {(perfil.cidade || perfil.estado) && (
          <div className="flex items-center gap-2.5">
            <MapPin size="0.75rem" className="text-zinc-400 shrink-0" />
            <span className="text-zinc-300 text-xs">{[perfil.cidade, perfil.estado].filter(Boolean).join(', ')}</span>
          </div>
        )}
        {igHandle && (
          <div className="flex items-center gap-2.5 flex-wrap">
            <Instagram size="0.75rem" className="text-zinc-400 shrink-0" />
            <span className="text-zinc-300 text-xs">@{igHandle}</span>
            {(solicitacao?.instagramSeguidores || membro?.instagramSeguidores) && (
              <span className="text-zinc-400 text-[0.625rem]">
                · {(solicitacao?.instagramSeguidores || membro?.instagramSeguidores)?.toLocaleString('pt-BR')}{' '}
                seguidores
              </span>
            )}
            {solicitacao?.instagramVerificado || membro?.instagramVerificado ? (
              <span className="text-[0.5rem] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                Verificado ✓
              </span>
            ) : (
              (solicitacao || membro) && (
                <span className="text-[0.5rem] font-black uppercase tracking-wider text-zinc-400 bg-zinc-800 border border-white/5 px-1.5 py-0.5 rounded-full">
                  Não verificado
                </span>
              )
            )}
          </div>
        )}
        {perfil.cadastradoEm && (
          <div className="flex items-center gap-2.5">
            <Calendar size="0.75rem" className="text-zinc-400 shrink-0" />
            <span className="text-zinc-300 text-xs">Cadastro: {formatDate(perfil.cadastradoEm)}</span>
          </div>
        )}
        {solicitacao && (
          <div className="flex items-center gap-2.5">
            <Crown size="0.75rem" className="text-[#FFD300] shrink-0" />
            <span className="text-zinc-300 text-xs">Solicitou em: {formatDate(solicitacao.criadoEm)}</span>
          </div>
        )}
        {solicitacao?.convidadoPor && (
          <div className="flex items-center gap-2.5">
            <User size="0.75rem" className="text-zinc-400 shrink-0" />
            <span className="text-zinc-300 text-xs">
              Convidado por: {perfis[solicitacao.convidadoPor]?.nome || solicitacao.convidadoPor.slice(0, 8)}
            </span>
          </div>
        )}
      </div>

      {/* Botão Instagram */}
      {igHandle && (
        <button
          onClick={() => openInstagram(igHandle)}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-purple-600/20 to-pink-500/20 border border-purple-500/30 rounded-xl text-purple-300 text-xs font-bold mb-3 active:scale-95 transition-all"
        >
          <Instagram size="0.875rem" /> Abrir Instagram
        </button>
      )}

      {/* Se for solicitação pendente — ações de aprovar/rejeitar */}
      {solicitacao && solicitacao.status === 'PENDENTE' && (
        <div className="space-y-2 mt-4">
          <VantaDropdown
            value={tierSelects[solicitacao.id] || 'lista'}
            onChange={v => onTierSelectChange(solicitacao.id, v as TierMaisVanta)}
            options={getTierOptions().map(t => ({ value: t, label: TIER_LABELS[t], color: TIER_COLORS[t] }))}
            className="w-full"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onAprovar(solicitacao.id);
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 text-[0.625rem] font-black uppercase active:scale-90 transition-all"
            >
              <Check size="0.75rem" /> Aprovar
            </button>
          </div>
        </div>
      )}

      {/* Se for membro ativo — info do tier */}
      {membro && (
        <div className="mt-4 bg-zinc-900/60 border border-white/5 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown size="0.875rem" style={{ color: TIER_COLORS[membro.tier] }} />
            <span className="text-white text-xs font-bold">{TIER_LABELS[membro.tier]}</span>
          </div>
          {clubeService.temDividaSocial(membro.userId) && (
            <span className="text-amber-400 text-[0.5625rem] font-bold flex items-center gap-1">
              <AlertTriangle size="0.625rem" /> Dívida Social
            </span>
          )}
        </div>
      )}
    </div>
  );
};
