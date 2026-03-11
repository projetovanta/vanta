import React, { useEffect } from 'react';
import { Check, AlertTriangle, X } from 'lucide-react';
import type { FeedbackTela } from './checkinTypes';

export const FeedbackOverlay: React.FC<{ tipo: FeedbackTela; nome?: string; onDismiss: () => void }> = ({
  tipo,
  nome,
  onDismiss,
}) => {
  const cfg = {
    VERDE: {
      bg: '#059669',
      Icon: Check,
      titulo: 'Entrada Confirmada',
      sub: nome ? `Bem-vindo, ${nome}!` : 'Bem-vindo!',
    },
    AMARELO: {
      bg: '#D97706',
      Icon: AlertTriangle,
      titulo: 'Já Utilizado',
      sub: 'Este ingresso já foi lido anteriormente.',
    },
    VERMELHO: {
      bg: '#DC2626',
      Icon: X,
      titulo: 'Inválido',
      sub: 'QR Code não reconhecido.',
    },
  }[tipo];

  const { Icon } = cfg;

  useEffect(() => {
    const id = setTimeout(onDismiss, 2500);
    return () => clearTimeout(id);
  }, [onDismiss]);

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 animate-in fade-in duration-150"
      style={{ backgroundColor: cfg.bg }}
      onClick={onDismiss}
    >
      <div
        className="w-28 h-28 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.2)' }}
      >
        <Icon size="3.5rem" className="text-white" strokeWidth={2.5} />
      </div>
      <div className="text-center px-8">
        <p className="text-white font-black text-3xl leading-none mb-3">{cfg.titulo}</p>
        <p className="text-white/70 text-sm">{cfg.sub}</p>
      </div>
      <p className="text-white/40 text-[0.5625rem] font-black uppercase tracking-widest">Toque para fechar</p>
    </div>
  );
};
