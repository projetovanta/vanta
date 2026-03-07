import React from 'react';
import { Radio, ArrowRight } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { Evento } from '../../../types';
import { OptimizedImage } from '../../../components/OptimizedImage';

export const LiveNowSection: React.FC<{
  eventos: Evento[];
  onEventClick: (e: Evento) => void;
}> = React.memo(({ eventos, onEventClick }) => {
  if (eventos.length === 0) return null;

  return (
    /* px-5 individual — carrossel com edge-bleed, não usar px global */
    <div className="py-4 w-full">
      <div className="flex items-center gap-2 px-5 mb-3">
        <Radio size={14} className="text-red-500 animate-pulse" />
        <h3 style={TYPOGRAPHY.sectionKicker} className="text-sm text-red-400">
          Acontecendo Agora
        </h3>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 snap-x snap-mandatory">
        {eventos.map(e => (
          <div
            key={e.id}
            onClick={() => onEventClick(e)}
            className="shrink-0 w-[75vw] max-w-[320px] snap-start bg-[#161616] border border-red-500/20 rounded-2xl overflow-hidden flex gap-3 p-3 cursor-pointer active:scale-[0.98] transition-transform shadow-[0_0_20px_rgba(239,68,68,0.1)]"
          >
            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 relative">
              <OptimizedImage src={e.imagem} alt={e.titulo} width={64} className="w-full h-full object-cover" />
              <div className="absolute top-1 left-1 flex items-center gap-1 bg-red-500/90 backdrop-blur px-1.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-[7px] font-black text-white uppercase tracking-wider">Live</span>
              </div>
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider mb-0.5 truncate">
                {e.formato || e.categoria}
              </span>
              <h4 className="font-serif text-sm text-white leading-tight truncate">{e.titulo}</h4>
              <p className="text-zinc-500 text-[10px] mt-0.5 truncate">{e.local}</p>
            </div>
            <div className="flex items-center shrink-0">
              <ArrowRight size={14} className="text-red-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
