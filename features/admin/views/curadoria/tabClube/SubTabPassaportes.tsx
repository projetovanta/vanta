import React from 'react';
import { Check, Globe, X } from 'lucide-react';
import type { PassportAprovacao } from '../../../../../types';
import type { PerfilEnriquecido } from './tierUtils';
import { formatDate } from '../types';

interface Props {
  passportsPendentes: PassportAprovacao[];
  perfis: Record<string, PerfilEnriquecido>;
  onAprovar: (passportId: string) => void;
  onRejeitar: (passportId: string) => void;
}

export const SubTabPassaportes: React.FC<Props> = ({ passportsPendentes, perfis, onAprovar, onRejeitar }) => (
  <div className="space-y-3">
    {passportsPendentes.length === 0 ? (
      <p className="text-zinc-400 text-xs text-center py-10">Nenhum passaporte pendente</p>
    ) : (
      passportsPendentes.map(p => (
        <div key={p.id} className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm truncate">{perfis[p.userId]?.nome || p.userId.slice(0, 8)}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Globe size="0.625rem" className="text-zinc-400" />
                <span className="text-zinc-400 text-[0.625rem]">Solicitou acesso a nova cidade</span>
              </div>
              <p className="text-zinc-700 text-[0.5rem] mt-1">{formatDate(p.solicitadoEm)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAprovar(p.id)}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 text-[0.5625rem] font-black uppercase active:scale-90 transition-all"
            >
              <Check size="0.625rem" /> Aprovar
            </button>
            <button
              onClick={() => onRejeitar(p.id)}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-[0.5625rem] font-black uppercase active:scale-90 transition-all"
            >
              <X size="0.625rem" /> Rejeitar
            </button>
          </div>
        </div>
      ))
    )}
  </div>
);
