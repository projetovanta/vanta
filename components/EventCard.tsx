import React from 'react';
import { MapPin, Crown } from 'lucide-react';
import { Evento } from '../types';
import { TYPOGRAPHY } from '../constants';
import { getMinPrice, isEventHappeningNow, isEventStartingSoon, isEventEndingSoon } from '../utils';
import { OptimizedImage } from './OptimizedImage';

const ESTILO_CORES: Record<string, { bg: string; text: string }> = {
  eletrônica: { bg: 'bg-purple-500/15', text: 'text-purple-400' },
  house: { bg: 'bg-purple-500/15', text: 'text-purple-400' },
  techno: { bg: 'bg-purple-500/15', text: 'text-purple-400' },
  trance: { bg: 'bg-purple-500/15', text: 'text-purple-400' },
  funk: { bg: 'bg-pink-500/15', text: 'text-pink-400' },
  sertanejo: { bg: 'bg-pink-500/15', text: 'text-pink-400' },
  pagode: { bg: 'bg-amber-500/15', text: 'text-amber-400' },
  samba: { bg: 'bg-amber-500/15', text: 'text-amber-400' },
  rock: { bg: 'bg-red-500/15', text: 'text-red-400' },
  pop: { bg: 'bg-blue-500/15', text: 'text-blue-400' },
  rap: { bg: 'bg-orange-500/15', text: 'text-orange-400' },
  'hip hop': { bg: 'bg-orange-500/15', text: 'text-orange-400' },
  reggae: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  jazz: { bg: 'bg-cyan-500/15', text: 'text-cyan-400' },
  mpb: { bg: 'bg-teal-500/15', text: 'text-teal-400' },
  forró: { bg: 'bg-yellow-500/15', text: 'text-yellow-400' },
};

function getEstiloCor(estilos?: string[]): { bg: string; text: string } | null {
  if (!estilos?.length) return null;
  const key = estilos[0].toLowerCase();
  for (const [k, v] of Object.entries(ESTILO_CORES)) {
    if (key.includes(k)) return v;
  }
  return null;
}

interface EventCardProps {
  evento: Evento;
  onClick: (event: Evento) => void;
  onComunidadeClick?: (comunidadeId: string) => void;
  showCityInsteadOfLocal?: boolean;
}

export const EventCard: React.FC<EventCardProps> = React.memo(
  ({ evento, onClick, onComunidadeClick, showCityInsteadOfLocal }) => {
    const minPrice = getMinPrice(evento);
    const isHappening = isEventHappeningNow(evento);
    const isStartingSoon = isEventStartingSoon(evento);
    const isEndingSoon = isEventEndingSoon(evento);
    // imageError removido — OptimizedImage gerencia fallback internamente

    const formatDateLabel = (d: string): string => {
      if (!d.includes('T')) return d;
      try {
        const parsed = new Date(d);
        if (isNaN(parsed.getTime())) return d;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const eventDay = new Date(parsed);
        eventDay.setHours(0, 0, 0, 0);
        if (eventDay.getTime() === today.getTime()) return 'Hoje';
        if (eventDay.getTime() === tomorrow.getTime()) return 'Amanhã';
        return eventDay.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
      } catch {
        return d;
      }
    };

    const getBadgeConfig = () => {
      if (isEndingSoon) return { text: 'ACABA EM BREVE', className: 'bg-[#FF3131]/80 animate-pulse text-white' };
      if (isStartingSoon) return { text: 'COMEÇA EM BREVE', className: 'bg-[#FF8C00]/80 animate-pulse text-white' };
      if (isHappening) return { text: 'ACONTECENDO AGORA', className: 'bg-[#39FF14]/80 animate-pulse text-black' };
      return {
        text: `${formatDateLabel(evento.data).toUpperCase()} • ${evento.horario}`,
        className: 'bg-black/80 text-white/90',
      };
    };

    const badge = getBadgeConfig();
    const localLabel = showCityInsteadOfLocal ? evento.cidade || evento.local : evento.comunidade?.nome || evento.local;

    const handleLocalClick = (e: React.MouseEvent) => {
      if (evento.comunidade && onComunidadeClick) {
        e.stopPropagation();
        onComunidadeClick(evento.comunidade.id);
      }
    };

    return (
      <div
        className="group flex flex-col w-full rounded-2xl overflow-hidden cursor-pointer bg-[#111] border border-white/[0.06] transition-all duration-300 active:scale-[0.97]"
        onClick={() => onClick(evento)}
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-black">
          <OptimizedImage
            src={evento.imagem}
            alt={evento.titulo}
            width={400}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            fallback={
              <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center">
                <span className="text-zinc-600 text-[0.6rem] font-bold uppercase tracking-widest">Sem Imagem</span>
              </div>
            }
          />
          {/* Badge de data/status */}
          <div
            className={`absolute top-2.5 left-2.5 z-30 px-2 py-1 rounded-lg font-bold text-[0.55rem] tracking-wider backdrop-blur-md ${badge.className}`}
          >
            {badge.text}
          </div>
          {/* MV badge */}
          {evento.temBeneficioMaisVanta && (
            <div className="absolute top-2.5 right-2.5 z-30 flex items-center px-1.5 py-1 rounded-lg bg-black/40 backdrop-blur-md">
              <Crown size="0.6rem" className="text-[#FFD300]" />
            </div>
          )}
          {/* Overlay gradiente compacto — só embaixo */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-3">
            {(() => {
              const estiloCor = getEstiloCor(evento.estilos);
              return (
                <span
                  className={`inline-block px-2 py-0.5 rounded-md text-[0.5rem] font-bold uppercase tracking-wider mb-1.5 ${
                    estiloCor ? `${estiloCor.bg} ${estiloCor.text}` : 'bg-[#FFD300]/90 text-black'
                  }`}
                >
                  {evento.estilos?.[0] || evento.formato || evento.categoria}
                </span>
              );
            })()}
            <h3 className="font-serif text-sm text-white leading-snug line-clamp-2 drop-shadow-lg">{evento.titulo}</h3>
          </div>
        </div>
        {/* Footer do card */}
        <div className="px-3 py-2.5 space-y-1">
          <div className="flex items-center gap-1.5">
            <MapPin size="0.65rem" className="text-[#FFD300] shrink-0" />
            {evento.comunidade && onComunidadeClick ? (
              <button
                onClick={handleLocalClick}
                className="text-[0.65rem] text-zinc-300 font-medium truncate text-left active:opacity-70"
              >
                {localLabel}
              </button>
            ) : (
              <span className="text-[0.65rem] text-zinc-400 font-medium truncate">{localLabel}</span>
            )}
          </div>
          {!evento.ocultarValor && minPrice > 0 && (
            <p
              className="text-sm text-[#FFD300] leading-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700 }}
            >
              R$ {minPrice.toFixed(2).replace('.', ',')}
            </p>
          )}
          {evento.ocultarValor && <span className="text-xs font-serif italic text-[#FFD300]">Consulta</span>}
        </div>
      </div>
    );
  },
);
