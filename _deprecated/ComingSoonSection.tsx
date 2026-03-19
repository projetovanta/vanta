import React from 'react';
import { CalendarRange } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { Evento } from '../../../types';
import { EventCarousel } from './EventCarousel';

export const ComingSoonSection: React.FC<{
  eventos: Evento[];
  onEventClick: (e: Evento) => void;
  onComunidadeClick?: (id: string) => void;
  showCityInsteadOfLocal?: boolean;
}> = React.memo(({ eventos, onEventClick, onComunidadeClick, showCityInsteadOfLocal }) => {
  if (eventos.length === 0) return null;

  return (
    <div className="py-4 w-full">
      <div className="flex items-center gap-2 px-5 mb-3">
        <CalendarRange size="0.875rem" className="text-[#FFD300]" />
        <h3 style={TYPOGRAPHY.sectionKicker} className="text-sm">
          Em Breve
        </h3>
      </div>
      <EventCarousel
        eventos={eventos}
        onEventClick={onEventClick}
        onComunidadeClick={onComunidadeClick}
        showCityInsteadOfLocal={showCityInsteadOfLocal}
      />
    </div>
  );
});

ComingSoonSection.displayName = 'ComingSoonSection';
