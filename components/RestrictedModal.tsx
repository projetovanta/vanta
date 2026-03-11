import React from 'react';
import { Lock } from 'lucide-react';
import { useModalBack } from '../hooks/useModalStack';

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
  mensagem = 'Esta função é exclusiva para membros.',
}) => {
  useModalBack(isOpen, onClose, 'restricted-modal');
  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 z-[200] flex items-center justify-center bg-black/70 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="mx-6 w-full max-w-sm bg-zinc-900 border border-white/10 rounded-2xl p-6 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 bg-[#FFD300]/10 rounded-full flex items-center justify-center">
            <Lock size="1.25rem" className="text-[#FFD300]" />
          </div>
          <div>
            <h3 className="text-white text-base font-bold mb-1">Área Restrita</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">{mensagem}</p>
          </div>
          <div className="flex flex-col gap-2 w-full mt-2">
            <button
              onClick={onLogin}
              className="w-full py-3 bg-[#FFD300] text-black text-sm font-black uppercase tracking-wider rounded-full active:scale-95 transition-all"
            >
              Entrar
            </button>
            <button
              onClick={onCadastro}
              className="w-full py-3 bg-transparent border border-zinc-400 text-zinc-300 text-sm font-black uppercase tracking-wider rounded-full active:scale-95 transition-all"
            >
              Cadastrar
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 text-zinc-400 text-xs active:text-zinc-300 transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
