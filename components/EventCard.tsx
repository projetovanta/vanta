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
        className="group flex flex-col w-full rounded-2xl overflow-hidden cursor-pointer bg-[#161616] border border-white/5 shadow-2xl transition-all duration-300 active:scale-[0.98]"
        onClick={() => onClick(evento)}
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-black">
          <OptimizedImage
            src={evento.imagem}
            alt={evento.titulo}
            width={200}
            className="w-full h-full object-cover opacity-90"
            fallback={
              <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                <span className="text-zinc-700 text-[0.5625rem] font-black uppercase tracking-widest">Sem Imagem</span>
              </div>
            }
          />
          <div
            className={`absolute top-0 right-0 z-30 px-2 py-1.5 rounded-bl-xl font-black text-[0.4375rem] tracking-widest max-w-[65%] truncate ${badge.className}`}
          >
            {badge.text}
          </div>
          <div className="absolute inset-0 p-3 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/20 to-transparent">
            <div className="flex items-center gap-1.5 mb-1.5">
              {(() => {
                const estiloCor = getEstiloCor(evento.estilos);
                return (
                  <span
                    className={`px-2 py-0.5 rounded-md text-[0.5rem] font-black uppercase tracking-wider truncate max-w-[60%] ${
                      estiloCor
                        ? `${estiloCor.bg} ${estiloCor.text} border border-current/20`
                        : 'bg-[#FFD300] text-black'
                    }`}
                  >
                    {evento.estilos?.[0] || evento.formato || evento.categoria}
                  </span>
                );
              })()}
              {evento.temBeneficioMaisVanta && (
                <span className="flex items-center px-1 py-0.5 rounded-md bg-[#FFD300]/10 border border-[#FFD300]/20 shrink-0">
                  <Crown size="0.625rem" className="text-[#FFD300]" />
                </span>
              )}
            </div>
            <h3 className="font-serif text-[0.9375rem] text-white leading-snug line-clamp-2">{evento.titulo}</h3>
          </div>
        </div>
        <div className="px-3 py-2.5 border-t border-white/5 flex items-center justify-between gap-2 min-w-0">
          <button
            onClick={handleLocalClick}
            className={`flex items-center gap-1.5 min-w-0 flex-1 ${evento.comunidade && onComunidadeClick ? 'active:opacity-70' : ''}`}
          >
            <MapPin size="0.6875rem" className="text-[#FFD300] shrink-0" />
            <span className="text-[0.625rem] text-zinc-400 font-semibold truncate text-left">
              {' '}
              {/* lint-layout-ok */}
              {localLabel}
            </span>
          </button>
          {!evento.ocultarValor && minPrice > 0 && (
            <div className="shrink-0 text-right">
              <p className="text-[0.5rem] text-zinc-400 uppercase font-bold tracking-wider leading-none">A partir de</p>{' '}
              {/* lint-layout-ok */}
              <p
                className="text-[0.8125rem] text-[#FFD300] leading-tight" // lint-layout-ok
                style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700 }}
              >
                R$ {minPrice.toFixed(2).replace('.', ',')}
              </p>
            </div>
          )}
          {evento.ocultarValor && (
            <span className="text-[0.75rem] font-serif italic text-[#FFD300] shrink-0">Consulta</span>
          )}
        </div>
      </div>
    );
  },
);
