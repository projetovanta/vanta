import React from 'react';
import { CalendarDays } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { Evento } from '../../../types';
import { EventCard } from '../../../components/EventCard';

export const ThisWeekSection: React.FC<{
  eventos: Evento[];
  onEventClick: (e: Evento) => void;
  onComunidadeClick?: (id: string) => void;
  showCityInsteadOfLocal?: boolean;
}> = React.memo(({ eventos, onEventClick, onComunidadeClick, showCityInsteadOfLocal }) => {
  if (eventos.length === 0) return null;

  return (
    /* px-5 individual — carrossel com edge-bleed, não usar px global */
    <div className="py-5 w-full">
      <div className="px-5 mb-4">
        <div className="flex items-center gap-2 mb-0.5">
          <CalendarDays size="0.875rem" className="text-[#FFD300]" />
          <h3 className="text-base text-white font-semibold">Esta Semana</h3>
        </div>
        <p className="text-[0.7rem] text-zinc-500 ml-6">Os próximos eventos na sua cidade</p>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 snap-x snap-mandatory">
        {eventos.map(e => (
          <div key={e.id} className="shrink-0 w-[44vw] max-w-[12rem] snap-start">
            <EventCard
              evento={e}
              onClick={onEventClick}
              onComunidadeClick={onComunidadeClick}
              showCityInsteadOfLocal={showCityInsteadOfLocal}
            />
          </div>
        ))}
      </div>
    </div>
  );
});
