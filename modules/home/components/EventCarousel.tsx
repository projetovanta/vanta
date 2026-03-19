import React from 'react';
import { Evento } from '../../../types';
import { EventCard } from '../../../components/EventCard';

interface EventCarouselProps {
  eventos: Evento[];
  onEventClick: (e: Evento) => void;
  onComunidadeClick?: (id: string) => void;
  showCityInsteadOfLocal?: boolean;
  distLabels?: Map<string, string>;
}

/**
 * Carrossel horizontal padronizado de EventCards.
 * Todas as seções da Home devem usar este componente.
 * Margem de 20px à esquerda e direita, gap de 12px entre cards.
 */
export const EventCarousel: React.FC<EventCarouselProps> = React.memo(
  ({ eventos, onEventClick, onComunidadeClick, showCityInsteadOfLocal, distLabels }) => {
    if (eventos.length === 0) return null;

    return (
      <div className="overflow-x-auto no-scrollbar">
        <div className="flex gap-3 w-max px-5">
          {eventos.map(e => (
            <div key={e.id} className="shrink-0 snap-start w-[9.5rem]">
              <EventCard
                evento={e}
                onClick={onEventClick}
                onComunidadeClick={onComunidadeClick}
                showCityInsteadOfLocal={showCityInsteadOfLocal}
                distLabel={distLabels?.get(e.id)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  },
);
