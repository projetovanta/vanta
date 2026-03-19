import React, { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { Evento } from '../../../types';
import { EventCarousel } from './EventCarousel';
import { vantaService } from '../../../services/vantaService';
import { EventCardSkeleton } from '../../../components/Skeleton';

interface MaisVendidosSectionProps {
  cidade: string;
  onEventClick: (e: Evento) => void;
  onComunidadeClick?: (id: string) => void;
}

export const MaisVendidosSection: React.FC<MaisVendidosSectionProps> = React.memo(
  ({ cidade, onEventClick, onComunidadeClick }) => {
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      let cancelled = false;
      setLoading(true);
      vantaService.getTopVendidos24h(cidade, 10).then(data => {
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
          <TrendingUp size="0.875rem" className="text-[#FFD300]" />
          <h3 style={TYPOGRAPHY.sectionKicker} className="text-sm">
            Mais Vendidos 24h
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
            maxCards={10}
          />
        )}
      </div>
    );
  },
);

MaisVendidosSection.displayName = 'MaisVendidosSection';
