import React from 'react';
import { Evento } from '../../../types';
import { EventCard } from '../../../components/EventCard';
import { ViewAllCard } from '../../../components/ViewAllCard';

interface EventCarouselProps {
  eventos: Evento[];
  onEventClick: (e: Evento) => void;
  onComunidadeClick?: (id: string) => void;
  showCityInsteadOfLocal?: boolean;
  distLabels?: Map<string, string>;
  onViewAll?: () => void;
  viewAllLabel?: string;
  maxCards?: number;
}

/**
 * Carrossel horizontal padronizado de EventCards.
 * Todas as seções da Home devem usar este componente.
 * Margem de 20px à esquerda e direita, gap de 12px entre cards.
 */
export const EventCarousel: React.FC<EventCarouselProps> = React.memo(
  ({
    eventos,
    onEventClick,
    onComunidadeClick,
    showCityInsteadOfLocal,
    distLabels,
    onViewAll,
    viewAllLabel,
    maxCards = 9,
  }) => {
    if (eventos.length === 0) return null;

    const visibleEventos = eventos.slice(0, maxCards);

    return (
      <div className="overflow-x-auto no-scrollbar">
        <div className="flex gap-3 w-max px-5">
          {visibleEventos.map(e => (
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
          {onViewAll && eventos.length >= maxCards && <ViewAllCard onClick={onViewAll} label={viewAllLabel} />}
        </div>
      </div>
    );
  },
);
