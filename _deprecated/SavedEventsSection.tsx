import React, { useRef } from 'react';
import { Heart } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { Evento } from '../../../types';
import { EventCard } from '../../../components/EventCard';

export const SavedEventsSection: React.FC<{
  eventos: Evento[];
  onEventClick: (e: Evento) => void;
  onComunidadeClick?: (id: string) => void;
}> = React.memo(({ eventos, onEventClick, onComunidadeClick }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (eventos.length === 0) return null;

  return (
    /* px-5 individual — carrossel com edge-bleed, não usar px global */
    <div className="py-4 w-full">
      <div className="flex items-center gap-2 px-5 mb-3">
        <Heart size="0.875rem" fill="#FFD300" className="text-[#FFD300]" />
        <h3 style={TYPOGRAPHY.sectionKicker} className="text-sm">
          Salvos
        </h3>
      </div>
      <div ref={scrollRef} className="flex gap-3 overflow-x-auto no-scrollbar px-5 snap-x snap-mandatory">
        {eventos.map(e => (
          <div key={e.id} className="shrink-0 w-[42vw] max-w-[11.25rem] snap-start">
            <EventCard evento={e} onClick={onEventClick} onComunidadeClick={onComunidadeClick} />
          </div>
        ))}
      </div>
    </div>
  );
});
