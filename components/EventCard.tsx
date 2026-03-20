import React from 'react';
import { MapPin, Crown, Radio } from 'lucide-react';
import { Evento } from '../types';
import { TYPOGRAPHY } from '../constants';
import { getMinPrice, isEventHappeningNow, isEventStartingSoon, isEventEndingSoon } from '../utils';
import { OptimizedImage } from './OptimizedImage';

const ESTILO_CORES: Record<string, { bg: string; text: string }> = {
  eletrônica: { bg: 'bg-purple-400/50', text: 'text-purple-100' },
  house: { bg: 'bg-purple-400/50', text: 'text-purple-100' },
  techno: { bg: 'bg-purple-400/50', text: 'text-purple-100' },
  trance: { bg: 'bg-purple-400/50', text: 'text-purple-100' },
  funk: { bg: 'bg-pink-400/50', text: 'text-pink-100' },
  sertanejo: { bg: 'bg-pink-400/50', text: 'text-pink-100' },
  pagode: { bg: 'bg-amber-400/50', text: 'text-amber-100' },
  samba: { bg: 'bg-amber-400/50', text: 'text-amber-100' },
  rock: { bg: 'bg-red-400/50', text: 'text-red-100' },
  pop: { bg: 'bg-blue-400/50', text: 'text-blue-100' },
  rap: { bg: 'bg-orange-400/50', text: 'text-orange-100' },
  'hip hop': { bg: 'bg-orange-400/50', text: 'text-orange-100' },
  reggae: { bg: 'bg-emerald-400/50', text: 'text-emerald-100' },
  jazz: { bg: 'bg-cyan-400/50', text: 'text-cyan-100' },
  mpb: { bg: 'bg-teal-400/50', text: 'text-teal-100' },
  forró: { bg: 'bg-yellow-400/50', text: 'text-yellow-100' },
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
  distLabel?: string;
  percentVendido?: number;
}

export const EventCard: React.FC<EventCardProps> = React.memo(
  ({ evento, onClick, onComunidadeClick, showCityInsteadOfLocal, distLabel, percentVendido }) => {
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
      if (isEndingSoon)
        return { text: 'ACABA EM BREVE', className: 'bg-red-600/90 text-white border border-red-400/40' };
      if (isStartingSoon)
        return { text: 'COMEÇA EM BREVE', className: 'bg-amber-500/90 text-white border border-amber-300/40' };
      if (isHappening)
        return {
          text: 'ACONTECENDO AGORA',
          className:
            'bg-green-500/90 text-white border border-green-300/40 shadow-[0_0_12px_rgba(34,197,94,0.4)] animate-pulse',
        };
      return {
        text: `${formatDateLabel(evento.data).toUpperCase()} • ${evento.horario}`,
        className: 'bg-black/60 text-white/90 border border-white/10',
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

    const estiloCor = getEstiloCor(evento.estilos);

    const isMV = evento.temBeneficioMaisVanta;
    const isEsgotado = percentVendido != null && percentVendido >= 100;
    const isUltimasVagas = percentVendido != null && percentVendido >= 80 && percentVendido < 100;

    return (
      <div className="relative">
        {/* Coroa MV — posicionada no wrapper, renderizada ao lado do badge de estilo */}
        <div
          className={`flex flex-col w-full rounded-2xl overflow-hidden cursor-pointer bg-[#111] active:scale-[0.97] transition-transform ${
            isMV
              ? 'border-[1.5px] border-[#FFD300]/40 shadow-[0_0_12px_rgba(255,211,0,0.1)]'
              : 'border border-white/[0.06]'
          }`}
          onClick={() => onClick(evento)}
        >
          {/* Linha colorida no topo / dourada pra MV */}
          <div
            className={`h-0.5 w-full ${isMV ? 'bg-[#FFD300]/60' : estiloCor ? estiloCor.bg.replace('/15', '/40') : 'bg-[#FFD300]/30'}`}
          />
          <div className="relative aspect-[4/5] overflow-hidden bg-black">
            <OptimizedImage
              src={evento.imagem}
              alt={evento.titulo}
              width={400}
              className="w-full h-full object-cover"
              fallback={
                <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center">
                  <span className="text-zinc-600 text-[0.6rem] font-bold uppercase tracking-widest">Sem Imagem</span>
                </div>
              }
            />
            {/* Badge de data/status — pill */}
            <div
              className={`absolute top-0 right-0 z-30 px-2 h-[1.2rem] rounded-bl-lg font-bold text-[0.55rem] tracking-wider leading-none backdrop-blur-md flex items-center gap-1 whitespace-nowrap shadow-[0_2px_8px_rgba(0,0,0,0.4)] ${badge.className}`}
            >
              {isHappening && <Radio size="0.625rem" className="shrink-0" />}
              {badge.text}
            </div>
            {/* MV badge removido — coroa agora está fora do card */}
            {/* Carimbo ESGOTADO / ÚLTIMAS VAGAS — estilo selo inclinado sobre a imagem */}
            {isEsgotado && (
              <div className="absolute inset-0 z-[35] pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] bg-[#E60000]/90 py-2.5 rotate-[-35deg] shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
                  <p className="text-white font-black text-[0.75rem] uppercase tracking-[0.3em] text-center leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                    Esgotado
                  </p>
                </div>
              </div>
            )}
            {isUltimasVagas && (
              <div className="absolute inset-0 z-[35] pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] bg-orange-500/90 py-2.5 rotate-[-35deg] shadow-[0_4px_12px_rgba(0,0,0,0.6)] animate-pulse">
                  <p className="text-white font-black text-[0.75rem] uppercase tracking-[0.3em] text-center leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                    Últimas Vagas
                  </p>
                </div>
              </div>
            )}
            {/* Conteúdo inferior — badge + título com gradient local */}
            <div className="absolute inset-x-0 bottom-0 z-20">
              <div className="relative px-3 pb-3 pt-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                  {isMV && (
                    <Crown
                      size="0.75rem"
                      className="text-[#FFD300] shrink-0"
                      style={{ filter: 'drop-shadow(0 0 4px rgba(255,211,0,0.5))' }}
                    />
                  )}
                  <span
                    className={`inline-block px-2 py-0.5 rounded-lg text-[0.55rem] font-bold uppercase tracking-wider leading-none shadow-[0_2px_8px_rgba(0,0,0,0.5)] ${
                      estiloCor ? `${estiloCor.bg} ${estiloCor.text}` : 'bg-[#FFD300]/20 text-[#FFD300]'
                    }`}
                  >
                    {evento.estilos?.[0] || evento.formato || evento.categoria}
                  </span>
                </div>
                <h3 className="font-serif text-[0.9rem] text-white leading-snug line-clamp-2 drop-shadow-lg">
                  {evento.titulo}
                </h3>
              </div>
            </div>
          </div>
          {/* Footer do card — altura fixa pra todos os cards ficarem iguais */}
          <div className="px-3 pt-1.5 pb-2.5 h-[3.25rem] flex flex-col justify-center gap-0.5">
            {/* Local + Distância */}
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin size="0.6rem" className="text-[#FFD300]/60 shrink-0" />
              {evento.comunidade && onComunidadeClick ? (
                <button
                  onClick={handleLocalClick}
                  className="text-[0.65rem] text-zinc-400 font-medium text-left active:opacity-70"
                >
                  {localLabel}
                </button>
              ) : (
                <span className="text-[0.65rem] text-zinc-500 font-medium">{localLabel}</span>
              )}
              {distLabel && (
                <>
                  <span className="text-zinc-600 text-[0.5rem]">•</span>
                  <span className="text-[0.6rem] text-[#FFD300]/70 font-semibold shrink-0">{distLabel}</span>
                </>
              )}
            </div>
            {/* Preço */}
            {!evento.ocultarValor && minPrice > 0 ? (
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-[0.6rem] text-zinc-600 uppercase tracking-wider font-medium">A partir de</span>
                <p className="text-[0.6rem] text-[#FFD300] font-bold leading-tight tracking-wide">
                  R$ {minPrice.toFixed(2).replace('.', ',')}
                </p>
              </div>
            ) : (
              <span className="text-[0.6rem] font-bold text-[#FFD300] text-center">Sob consulta</span>
            )}
          </div>
        </div>
      </div>
    );
  },
);
