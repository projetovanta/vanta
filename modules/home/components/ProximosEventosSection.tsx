import React, { useEffect, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { Evento } from '../../../types';
import { EventCarousel } from './EventCarousel';
import { vantaService } from '../../../services/vantaService';
import { EventCardSkeleton } from '../../../components/Skeleton';

interface ProximosEventosSectionProps {
  cidade: string;
  onEventClick: (e: Evento) => void;
  onComunidadeClick?: (id: string) => void;
  onViewAll: () => void;
}

export const ProximosEventosSection: React.FC<ProximosEventosSectionProps> = React.memo(
  ({ cidade, onEventClick, onComunidadeClick, onViewAll }) => {
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      let cancelled = false;
      setLoading(true);
      vantaService.getEventosPorCidade(cidade, true, 9, 0).then(data => {
        if (!cancelled) {
          setEventos(data);
          setLoading(false);
        }
      });
      return () => {
        cancelled = true;
      };
    }, [cidade]);

    if (!loading && eventos.length === 0) return null;

    return (
      <div className="py-4 w-full">
        <div className="flex items-center gap-2 px-5 mb-3">
          <CalendarDays size="0.875rem" className="text-[#FFD300]" />
          <h3 style={TYPOGRAPHY.sectionKicker} className="text-sm">
            Próximos Eventos
          </h3>
        </div>
        {loading ? (
          <div className="px-5">
            <EventCardSkeleton />
          </div>
        ) : (
          <EventCarousel
            eventos={eventos}
            onEventClick={onEventClick}
            onComunidadeClick={onComunidadeClick}
            onViewAll={onViewAll}
            maxCards={9}
          />
        )}
      </div>
    );
  },
);

ProximosEventosSection.displayName = 'ProximosEventosSection';
