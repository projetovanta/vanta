import React from 'react';
import { ArrowLeft, Share2, Heart, Flag } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { Evento } from '../../../types';
import { ReportModal } from '../../../components/ReportModal';
import { globalToast } from '../../../components/Toast';

interface EventHeaderProps {
  evento: Evento;
  onBack: () => void;
  onShareSuccess?: (msg: string) => void;
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
  onReport?: () => void;
}

export const EventHeader: React.FC<EventHeaderProps> = ({
  evento,
  onBack,
  onShareSuccess,
  isFavorited,
  onToggleFavorite,
  onReport,
}) => {
  const handleShare = async () => {
    const url = `https://maisvanta.com/event/${evento.id}`;
    const shareData = {
      title: evento.titulo,
      text: `Confira "${evento.titulo}" no VANTA!`,
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // Usuário cancelou ou erro — silencioso
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        onShareSuccess?.('Link copiado!');
      } catch {
        // Fallback: sem clipboard API
      }
    }
  };

  return (
    <div className="relative w-full aspect-[4/5] max-h-[70vh] shrink-0 sticky top-0">
      {evento.imagem && (
        <img
          src={evento.imagem}
          className="w-full h-full object-cover"
          alt={evento.titulo}
          referrerPolicy="no-referrer"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#0a0a0a]" />

      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <button
          aria-label="Voltar"
          onClick={onBack}
          className="p-3 bg-black/20 backdrop-blur-md rounded-full border border-white/10 text-white active:scale-90 transition-transform"
        >
          <ArrowLeft size="1.25rem" />
        </button>
        <div className="flex items-center gap-2">
          {onToggleFavorite && (
            <button
              onClick={onToggleFavorite}
              className="p-3 bg-black/20 backdrop-blur-md rounded-full border border-white/10 active:scale-90 transition-transform"
            >
              <Heart
                size="1.125rem"
                fill={isFavorited ? '#FFD300' : 'none'}
                className={isFavorited ? 'text-[#FFD300]' : 'text-white'}
              />
            </button>
          )}
          <button
            aria-label="Compartilhar"
            onClick={handleShare}
            className="p-3 bg-black/20 backdrop-blur-md rounded-full border border-white/10 text-white active:scale-90 transition-transform"
          >
            <Share2 size="1.125rem" />
          </button>
          {onReport && (
            <button
              aria-label="Denunciar"
              onClick={onReport}
              className="p-3 bg-black/20 backdrop-blur-md rounded-full border border-white/10 text-zinc-400 active:scale-90 transition-transform"
            >
              <Flag size="1rem" />
            </button>
          )}
        </div>
      </div>

      <div className="absolute bottom-10 left-0 right-0 p-6 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent pt-20">
        <span className="px-3 py-1 bg-[#FFD300] text-black text-[0.5625rem] font-black uppercase tracking-widest rounded-full mb-3 inline-block shadow-[0_0_15px_rgba(255,211,0,0.4)]">
          {evento.formato || evento.categoria}
        </span>
        <h1
          style={TYPOGRAPHY.screenTitle}
          className="text-3xl leading-tight mb-2 shadow-black drop-shadow-lg line-clamp-2"
        >
          {evento.titulo}
        </h1>
      </div>
    </div>
  );
};
