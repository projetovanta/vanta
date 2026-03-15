import React from 'react';
import { TYPOGRAPHY } from '../../../constants';
import { Sparkles } from 'lucide-react';

interface Props {
  comunidadeNome: string;
  onClose: () => void;
}

export const OnboardingWelcome: React.FC<Props> = ({ comunidadeNome, onClose }) => {
  return (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-6">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center space-y-5">
        <div className="w-14 h-14 rounded-full bg-[#FFD300]/10 flex items-center justify-center mx-auto">
          <Sparkles className="w-7 h-7 text-[#FFD300]" />
        </div>

        <div>
          <h2 style={TYPOGRAPHY.screenTitle} className="text-lg text-white mb-2">
            Bem-vindo à rede VANTA!
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Sua solicitação para <span className="text-white font-semibold">{comunidadeNome}</span> foi aprovada.
            Complete os dados da sua comunidade para começar a criar eventos.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-[#FFD300] text-black font-black text-sm uppercase tracking-widest"
        >
          Começar
        </button>
      </div>
    </div>
  );
};
