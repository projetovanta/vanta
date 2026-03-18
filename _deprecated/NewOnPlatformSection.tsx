import React from 'react';
import { Sparkles } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { Evento } from '../../../types';
import { EventCard } from '../../../components/EventCard';

export const NewOnPlatformSection: React.FC<{
  eventos: Evento[];
  onEventClick: (e: Evento) => void;
  onComunidadeClick?: (id: string) => void;
}> = React.memo(({ eventos, onEventClick, onComunidadeClick }) => {
  if (eventos.length === 0) return null;

  return (
    /* px-5 individual — carrossel com edge-bleed, não usar px global */
    <div className="py-4 w-full">
      <div className="flex items-center gap-2 px-5 mb-3">
        <Sparkles size="0.875rem" className="text-[#FFD300]" />
        <h3 style={TYPOGRAPHY.sectionKicker} className="text-sm">
          Novos na Plataforma
        </h3>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 snap-x snap-mandatory">
        {eventos.map(e => (
          <div key={e.id} className="shrink-0 w-[42vw] max-w-[11.25rem] snap-start relative">
            <EventCard evento={e} onClick={onEventClick} onComunidadeClick={onComunidadeClick} />
            <div className="absolute top-2 left-2 z-40 flex items-center gap-1 bg-[#FFD300]/90 backdrop-blur-md px-2 py-0.5 rounded-full">
              <Sparkles size="0.5rem" className="text-black" />
              <span className="text-[0.4375rem] font-black text-black uppercase tracking-wider">Novo</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
