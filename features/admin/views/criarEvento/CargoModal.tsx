import React, { useState } from 'react';
import { Check } from 'lucide-react';
import type { Membro, PapelEquipeEvento } from '../../../../types';
import { labelCls } from './constants';

interface Props {
  membro: Membro;
  papeis: { id: PapelEquipeEvento; label: string; desc: string }[];
  onSelect: (m: Membro, papel: PapelEquipeEvento) => void;
  onClose: () => void;
}

export const CargoModal: React.FC<Props> = ({ membro, papeis, onSelect, onClose }) => {
  const [papel, setPapel] = useState<PapelEquipeEvento>(papeis[0]?.id ?? 'PROMOTER');
  return (
    <div
      className="absolute inset-0 z-[60] flex items-end justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-[#111111] border border-white/10 rounded-t-[2.5rem] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-zinc-700" />
        </div>
        <div className="px-6 pt-4 pb-4 border-b border-white/5 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 shrink-0">
            <img loading="lazy" src={membro.foto} alt={membro.nome} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white font-bold text-base leading-none truncate">{membro.nome}</p>
            <p className="text-zinc-400 text-[10px] mt-0.5 truncate">{membro.email}</p>
          </div>
        </div>
        <div className="p-5 space-y-2">
          <p className={labelCls}>Cargo neste evento</p>
          {papeis.map(p => (
            <button
              key={p.id}
              onClick={() => setPapel(p.id)}
              className={`w-full flex items-center gap-3 p-3.5 border rounded-xl transition-all text-left ${papel === p.id ? 'border-[#FFD300]/30 bg-[#FFD300]/5' : 'border-white/5 bg-zinc-900/40'}`}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 shrink-0 transition-all ${papel === p.id ? 'bg-[#FFD300] border-[#FFD300]' : 'border-zinc-600'}`}
              />
              <div>
                <p
                  className={`font-bold text-sm leading-none mb-0.5 ${papel === p.id ? 'text-[#FFD300]' : 'text-white'}`}
                >
                  {p.label}
                </p>
                <p className="text-zinc-400 text-[9px]">{p.desc}</p>
              </div>
            </button>
          ))}
        </div>
        <div className="px-5" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 2rem))' }}>
          <button
            onClick={() => onSelect(membro, papel)}
            className="w-full py-4 bg-[#FFD300] text-black font-bold text-[10px] uppercase tracking-[0.3em] rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            <Check size={13} /> Adicionar à Equipe
          </button>
        </div>
      </div>
    </div>
  );
};
