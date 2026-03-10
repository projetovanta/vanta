import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { TYPOGRAPHY } from '../constants';
import { useModalBack } from '../hooks/useModalStack';

export const UnsavedChangesModal: React.FC<{
  onStay: () => void;
  onLeave: () => void;
}> = ({ onStay, onLeave }) => {
  useModalBack(true, onStay, 'unsaved-changes');
  return (
    <div className="absolute inset-0 z-[500] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" role="presentation" onClick={onStay} />
      <div className="relative w-full max-w-[85%] bg-[#0A0A0A] border border-[#FFD300]/20 rounded-[2.5rem] p-8 text-center shadow-[0_0_50px_rgba(255,211,0,0.08)] animate-in zoom-in-95 duration-300">
        <button
          onClick={onStay}
          className="absolute top-6 right-6 p-2 text-zinc-400 active:text-white transition-colors"
        >
          <X size={18} />
        </button>
        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#FFD300]/20 shadow-xl">
          <AlertTriangle size={28} className="text-[#FFD300]" />
        </div>
        <h2 style={TYPOGRAPHY.screenTitle} className="text-xl text-white mb-3 italic">
          Sair sem salvar?
        </h2>
        <p className="text-zinc-400 text-xs leading-relaxed mb-8 px-4">
          Suas alterações serão perdidas se você sair agora.
        </p>
        <div className="space-y-3">
          <button
            onClick={onStay}
            className="w-full py-4 bg-[#FFD300] text-black font-bold text-[10px] uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all"
          >
            Continuar Editando
          </button>
          <button
            onClick={onLeave}
            className="w-full py-4 text-zinc-400 font-bold text-[10px] uppercase active:opacity-60 transition-all"
          >
            Sair sem salvar
          </button>
        </div>
      </div>
    </div>
  );
};
