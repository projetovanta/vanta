import React, { useState } from 'react';
import { X, Link, Users, Check } from 'lucide-react';
import { Evento } from '../../../types';
import { TYPOGRAPHY } from '../../../constants';
import { useModalBack } from '../../../hooks/useModalStack';

interface PresencaConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  evento: Evento;
  userName: string;
  onInviteFriends: () => void;
}

export const PresencaConfirmationModal: React.FC<PresencaConfirmationModalProps> = ({
  isOpen,
  onClose,
  evento,
  userName,
  onInviteFriends,
}) => {
  useModalBack(isOpen, onClose, 'presenca-confirmation');
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const handleCopyLink = () => {
    const text = `${userName} confirmou presença em ${evento.titulo}! Que tal ir junto? https://maisvanta.com/event/${evento.id}`;
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="absolute inset-0 z-[250] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" role="presentation" onClick={onClose} />
      <div className="relative w-full max-w-[21.25rem] bg-[#0A0A0A] border border-[#FFD300]/20 rounded-[2.5rem] p-8 text-center shadow-[0_0_50px_rgba(255,211,0,0.1)] animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#FFD300]/20 shadow-xl">
          <Check size="2rem" className="text-[#FFD300] drop-shadow-[0_0_10px_#FFD300]" />
        </div>

        <h2 style={TYPOGRAPHY.screenTitle} className="text-2xl text-white mb-3 italic">
          Eu vou!
        </h2>
        <p className="text-zinc-400 text-xs leading-relaxed mb-8 px-2">
          Você confirmou presença no evento <span className="text-white font-bold">{evento.titulo}</span>. Que tal
          chamar seus amigos para irem também?
        </p>

        <div className="space-y-3">
          <button
            aria-label="Copiar link"
            onClick={handleCopyLink}
            className="w-full py-4 bg-zinc-900 border border-white/5 text-white font-bold text-[0.625rem] uppercase tracking-[0.2em] rounded-xl active:bg-zinc-800 transition-all flex items-center justify-center gap-2"
          >
            <Link size="0.875rem" className="text-[#FFD300]" />
            {copied ? 'Copiado ✓' : 'Copiar Link'}
          </button>

          <button
            onClick={onInviteFriends}
            className="w-full py-4 bg-[#FFD300] text-black font-bold text-[0.625rem] uppercase tracking-[0.2em] rounded-xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Users size="0.875rem" />
            Convidar Amigos VANTA
          </button>

          <button
            onClick={onClose}
            className="w-full py-4 bg-transparent text-zinc-400 font-bold text-[0.625rem] uppercase tracking-[0.2em] active:text-zinc-400 transition-colors"
          >
            Sair
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-white transition-colors"
        >
          <X size="1.125rem" />
        </button>
      </div>
    </div>
  );
};
