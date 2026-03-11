import React from 'react';
import { CalendarDays } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { Evento } from '../../../types';
import { EventCard } from '../../../components/EventCard';

export const ThisWeekSection: React.FC<{
  eventos: Evento[];
  onEventClick: (e: Evento) => void;
  onComunidadeClick?: (id: string) => void;
}> = React.memo(({ eventos, onEventClick, onComunidadeClick }) => {
  if (eventos.length === 0) return null;

  return (
    /* px-5 individual — carrossel com edge-bleed, não usar px global */
    <div className="py-4 w-full">
      <div className="flex items-center gap-2 px-5 mb-3">
        <CalendarDays size="0.875rem" className="text-[#FFD300]" />
        <h3 style={TYPOGRAPHY.sectionKicker} className="text-sm">
          Esta Semana
        </h3>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 snap-x snap-mandatory">
        {eventos.map(e => (
          <div key={e.id} className="shrink-0 w-[42vw] max-w-[11.25rem] snap-start">
            <EventCard evento={e} onClick={onEventClick} onComunidadeClick={onComunidadeClick} />
          </div>
        ))}
      </div>
    </div>
  );
});
