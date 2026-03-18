import React from 'react';
import { TYPOGRAPHY } from '../../../../constants';

interface Props {
  total: number;
  cap: number;
  tipo: 'ingressos' | 'lista';
  onConfirmar: () => void;
  onCancelar: () => void;
}

export const CapacidadeModal: React.FC<Props> = ({ total, cap, tipo, onConfirmar, onCancelar }) => (
  <div
    className="absolute inset-0 z-[70] flex items-end justify-center bg-black/85 backdrop-blur-sm"
    onClick={onCancelar}
  >
    <div
      className="w-full max-w-sm bg-[#111111] border border-white/10 rounded-t-[2.5rem] overflow-hidden"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex justify-center pt-3 pb-1">
        <div className="w-10 h-1 rounded-full bg-zinc-700" />
      </div>
      <div className="px-6 pt-4 pb-2">
        <p className="text-[#FFD300] text-[0.625rem] font-black uppercase tracking-widest mb-2">
          Atenção · Capacidade do Local
        </p>
        <h2 style={TYPOGRAPHY.screenTitle} className="text-lg italic mb-3">
          Limite Excedido
        </h2>
        <p className="text-zinc-400 text-sm leading-relaxed">
          O total de{' '}
          <span className="text-white font-bold">
            {total} {tipo}
          </span>{' '}
          supera a capacidade máxima do local de <span className="text-white font-bold">{cap} pessoas</span>. Deseja
          continuar mesmo assim?
        </p>
      </div>
      <div className="px-6 pt-4 flex gap-3" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 2rem))' }}>
        <button
          onClick={onCancelar}
          className="flex-1 py-4 bg-zinc-900 border border-white/10 text-zinc-400 font-black text-[0.625rem] uppercase tracking-widest rounded-xl active:scale-95 transition-all"
        >
          Não, Ajustar
        </button>
        <button
          onClick={onConfirmar}
          className="flex-1 py-4 bg-[#FFD300] text-black font-bold text-[0.625rem] uppercase tracking-widest rounded-xl active:scale-95 transition-all"
        >
          Sim, Continuar
        </button>
      </div>
    </div>
  </div>
);
