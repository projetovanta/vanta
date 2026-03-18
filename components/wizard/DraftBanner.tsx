import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';

export interface DraftBannerProps {
  draftKey: string;
  onRestore: (data: unknown) => void;
  onDiscard: () => void;
}

interface DraftData {
  data: unknown;
  savedAt: string;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export const DraftBanner: React.FC<DraftBannerProps> = ({ draftKey, onRestore, onDiscard }) => {
  const [draft, setDraft] = useState<DraftData | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`draft_${draftKey}`);
      if (raw) {
        const parsed = JSON.parse(raw) as DraftData;
        setDraft(parsed);
      }
    } catch {
      // JSON inválido — ignorar
    }
  }, [draftKey]);

  if (!draft) return null;

  const handleRestore = () => {
    onRestore(draft.data);
  };

  const handleDiscard = () => {
    localStorage.removeItem(`draft_${draftKey}`);
    setDraft(null);
    onDiscard();
  };

  return (
    <div className="bg-[#FFD300]/10 border border-[#FFD300]/20 rounded-xl p-4 mb-4">
      <div className="flex items-start gap-3">
        <FileText size={20} className="text-[#FFD300] shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm leading-snug">Você tem um rascunho não finalizado.</p>
          {draft.savedAt && <p className="text-zinc-400 text-xs mt-0.5">Salvo em {formatDate(draft.savedAt)}</p>}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleRestore}
              className="px-4 py-2 bg-[#FFD300] text-black text-[0.625rem] font-black uppercase tracking-widest rounded-lg active:scale-95 transition-all"
            >
              Continuar
            </button>
            <button
              onClick={handleDiscard}
              className="px-4 py-2 text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest rounded-lg hover:text-zinc-300 active:scale-95 transition-all"
            >
              Descartar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
