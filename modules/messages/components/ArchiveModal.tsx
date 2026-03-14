import React, { useState } from 'react';
import { Archive, X } from 'lucide-react';

interface ArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (keepArchived: boolean) => void;
  participantNome: string;
}

export const ArchiveModal: React.FC<ArchiveModalProps> = ({ isOpen, onClose, onConfirm, participantNome }) => {
  const [keepArchived, setKeepArchived] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[300] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-zinc-900 border border-white/10 rounded-3xl p-5 w-full max-w-sm animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Archive size="1rem" className="text-[#FFD300]" />
            <h3 className="text-white font-bold text-sm">Arquivar conversa</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
            <X size="0.875rem" className="text-zinc-400" />
          </button>
        </div>

        <p className="text-zinc-400 text-xs mb-1">
          A conversa com <span className="text-white font-bold">{participantNome}</span> será movida para Arquivadas.
        </p>
        <p className="text-zinc-500 text-[0.625rem] mb-4">
          Conversas arquivadas ficam silenciadas — sem notificações de novas mensagens.
        </p>

        <label className="flex items-center gap-2.5 mb-5 cursor-pointer">
          <div
            onClick={() => setKeepArchived(v => !v)}
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
              keepArchived ? 'bg-[#FFD300] border-[#FFD300]' : 'border-zinc-600 bg-transparent'
            }`}
          >
            {keepArchived && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6L5 9L10 3" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className="text-zinc-300 text-[0.625rem] font-semibold">
            Manter arquivada mesmo com novas mensagens
          </span>
        </label>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-zinc-800 border border-white/5 text-zinc-400 font-bold text-[0.625rem] uppercase tracking-widest rounded-2xl active:scale-[0.98] transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm(keepArchived);
              setKeepArchived(false);
            }}
            className="flex-1 py-3 bg-[#FFD300] text-black font-bold text-[0.625rem] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
          >
            <Archive size="0.75rem" /> Arquivar
          </button>
        </div>
      </div>
    </div>
  );
};
