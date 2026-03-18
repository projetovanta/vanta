import React from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Membro } from '../../../../types';
import { TYPOGRAPHY } from '../../../../constants';
import { DestinoOption } from './types';

interface SuccessScreenProps {
  onBack: () => void;
  selectedMembro: Membro | null;
  selectedDestino: DestinoOption | null;
  labelCargo: string;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({
  onBack,
  selectedMembro,
  selectedDestino,
  labelCargo,
}) => (
  <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col overflow-hidden">
    <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-10 pb-6 shrink-0">
      <button
        aria-label="Voltar"
        onClick={onBack}
        className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
      >
        <ArrowLeft size="1.125rem" className="text-zinc-400" />
      </button>
    </div>
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
        <CheckCircle size="2.25rem" className="text-emerald-400" />
      </div>
      <h2 style={TYPOGRAPHY.screenTitle} className="text-2xl text-white mb-2">
        Cargo Atribuído
      </h2>
      <p className="text-zinc-400 text-xs leading-relaxed mb-8 max-w-xs text-center">
        {selectedMembro?.nome} agora tem acesso ao painel como{' '}
        <span className="text-white font-bold">{labelCargo}</span> em{' '}
        <span className="text-white font-bold">{selectedDestino?.nome}</span>. Uma notificação foi enviada.
      </p>
      <button
        onClick={onBack}
        className="px-8 py-4 bg-[#FFD300] text-black font-bold text-[0.625rem] uppercase tracking-[0.3em] rounded-xl active:scale-[0.98] transition-all"
      >
        Voltar
      </button>
    </div>
  </div>
);
