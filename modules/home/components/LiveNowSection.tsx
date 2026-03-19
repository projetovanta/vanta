import React from 'react';
import { Radio, ArrowRight } from 'lucide-react';
import { Evento } from '../../../types';
import { OptimizedImage } from '../../../components/OptimizedImage';

export const LiveNowSection: React.FC<{
  eventos: Evento[];
  onEventClick: (e: Evento) => void;
  showCityInsteadOfLocal?: boolean;
}> = React.memo(({ eventos, onEventClick, showCityInsteadOfLocal }) => {
  if (eventos.length === 0) return null;

  return (
    <div className="py-2 w-full">
      <div className="flex items-center gap-2 px-5 mb-3">
        <Radio size="0.875rem" className="text-red-500 animate-pulse" />
        <h3 className="text-base text-white font-serif">Acontecendo Agora</h3>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 snap-x snap-mandatory">
        {eventos.map(e => {
          const localLabel = showCityInsteadOfLocal ? e.cidade || e.local : e.comunidade?.nome || e.local;
          return (
            <div
              key={e.id}
              onClick={() => onEventClick(e)}
              className="shrink-0 w-[18.75rem] snap-start bg-[#111] border border-red-500/15 rounded-2xl overflow-hidden flex gap-3.5 p-3 cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative">
                <OptimizedImage src={e.imagem} alt={e.titulo} width={80} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-red-600 px-1.5 py-0.5 rounded-md shadow-[0_0_8px_rgba(239,68,68,0.4)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span className="text-[0.45rem] font-bold text-white uppercase tracking-wider">Live</span>
                </div>
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <span className="text-[0.6rem] font-semibold text-red-400/80 uppercase tracking-wider mb-0.5 truncate">
                  {e.formato || e.categoria}
                </span>
                <h4 className="font-serif text-sm text-white leading-tight line-clamp-2">{e.titulo}</h4>
                <p className="text-zinc-500 text-[0.65rem] mt-1 truncate">{localLabel}</p>
              </div>
              <div className="flex items-center shrink-0">
                <ArrowRight size="1rem" className="text-red-400/60" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
