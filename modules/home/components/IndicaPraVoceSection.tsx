import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { Evento } from '../../../types';
import { EventCarousel } from './EventCarousel';
import { vantaService } from '../../../services/vantaService';
import { useAuthStore } from '../../../stores/authStore';
import { EventCardSkeleton } from '../../../components/Skeleton';

interface IndicaPraVoceSectionProps {
  cidade: string;
  onEventClick: (e: Evento) => void;
  onComunidadeClick?: (id: string) => void;
  onViewAll?: () => void;
}

export const IndicaPraVoceSection: React.FC<IndicaPraVoceSectionProps> = React.memo(
  ({ cidade, onEventClick, onComunidadeClick, onViewAll }) => {
    const isGuest = useAuthStore(s => s.currentAccount.role) === 'vanta_guest';
    const interesses = useAuthStore(s => s.currentAccount.interesses);
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (isGuest || !interesses || interesses.length === 0) {
        setLoading(false);
        return;
      }

      let cancelled = false;
      setLoading(true);
      vantaService.getEventosPorCidade(cidade, true, 20, 0).then(data => {
        if (cancelled) return;
        const interesseSet = new Set(interesses.map(i => i.toLowerCase()));
        const filtered = data.filter(e => {
          const tags = [
            e.formato?.toLowerCase(),
            ...(e.estilos ?? []).map((s: string) => s.toLowerCase()),
            ...(e.experiencias ?? []).map((x: string) => x.toLowerCase()),
            e.categoria?.toLowerCase(),
            ...(e.subcategorias ?? []).map((s: string) => s.toLowerCase()),
          ].filter(Boolean);
          return tags.some(t => t && interesseSet.has(t));
        });
        setEventos(filtered.slice(0, 9));
        setLoading(false);
      });
      return () => {
        cancelled = true;
      };
    }, [cidade, isGuest, interesses]);

    if (isGuest || !interesses || interesses.length === 0) return null;
    if (!loading && eventos.length === 0) return null;

    return (
      <div className="py-4 w-full">
        <div className="flex items-center gap-2 px-5 mb-3">
          <Sparkles size="0.875rem" className="text-[#FFD300]" />
          <h3 style={TYPOGRAPHY.sectionKicker} className="text-sm">
            VANTA Indica pra Você
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

IndicaPraVoceSection.displayName = 'IndicaPraVoceSection';
