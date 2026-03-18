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
      <div
        className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory"
        style={{ gap: '12px', paddingInlineStart: '20px', paddingInlineEnd: '20px' }}
      >
        {eventos.map(e => (
          <div key={e.id} className="shrink-0 snap-start" style={{ width: 'min(44vw, 12rem)' }}>
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
    );
  },
);
