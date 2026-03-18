import React from 'react';
import { Sparkles } from 'lucide-react';
import { useModalBack } from '../hooks/useModalStack';
import { TYPOGRAPHY } from '../constants';

interface RestrictedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  onCadastro: () => void;
  mensagem?: string;
}

export const RestrictedModal: React.FC<RestrictedModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onCadastro,
  mensagem = 'Crie sua conta pra aproveitar tudo que a noite tem de melhor',
}) => {
  useModalBack(isOpen, onClose, 'restricted-modal');
  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" role="presentation" />
      <div
        className="relative w-full max-w-[85%] bg-[#0A0A0A]/80 backdrop-blur-2xl border border-[#FFD300]/20 rounded-[2.5rem] p-8 text-center shadow-[0_0_50px_rgba(255,211,0,0.05)] animate-in zoom-in-95 duration-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-16 h-16 bg-zinc-900/60 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#FFD300]/20 shadow-xl">
          <Sparkles size="1.5rem" className="text-[#FFD300]" />
        </div>
        <h3 style={TYPOGRAPHY.screenTitle} className="text-xl text-white mb-3">
          Crie sua conta
        </h3>
        <p className="text-zinc-400 text-sm leading-relaxed mb-8 px-2">{mensagem}</p>
        <div className="space-y-3">
          <button
            onClick={onLogin}
            className="w-full py-4 bg-[#FFD300] text-black font-bold text-[0.625rem] uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all"
          >
            Já tenho conta
          </button>
          <button
            onClick={onCadastro}
            className="w-full py-3.5 border border-[#FFD300]/15 text-white font-bold text-[0.625rem] uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all"
          >
            Criar Conta
          </button>
          <button
            onClick={onClose}
            className="w-full py-3.5 text-zinc-400 font-bold text-[0.625rem] uppercase tracking-wide active:opacity-60 transition-all"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
};
