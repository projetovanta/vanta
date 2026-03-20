import React, { useEffect, useState, useMemo } from 'react';
import { Crown } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { Evento } from '../../../types';
import { EventCarousel } from './EventCarousel';
import { vantaService } from '../../../services/vantaService';
import { useAuthStore } from '../../../stores/authStore';
import { clubeService } from '../../../features/admin/services/clubeService';
import { EventCardSkeleton } from '../../../components/Skeleton';
import { SectionFilterChips } from '../../../components/SectionFilterChips';
import { filterTopGroups } from '../utils/filterSubCarousels';

interface BeneficiosMVSectionProps {
  cidade: string;
  onEventClick: (e: Evento) => void;
  onComunidadeClick?: (id: string) => void;
  onViewAll: () => void;
}

export const BeneficiosMVSection: React.FC<BeneficiosMVSectionProps> = React.memo(
  ({ cidade, onEventClick, onComunidadeClick, onViewAll }) => {
    const isGuest = useAuthStore(s => s.currentAccount.role) === 'vanta_guest';
    const userId = useAuthStore(s => s.currentAccount.id);
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [beneficios, setBeneficios] = useState<Map<string, { tipo: string; desconto: number | null }>>(new Map());
    const [selectedChip, setSelectedChip] = useState('Todos');
    const [loading, setLoading] = useState(true);

    const isMembro = useMemo(() => (!isGuest && userId ? clubeService.isMembro(userId) : false), [isGuest, userId]);
    const tier = useMemo(() => (userId ? clubeService.getTier(userId) : null), [userId]);

    useEffect(() => {
      if (!isMembro || !tier) {
        setLoading(false);
        return;
      }
      let cancelled = false;
      setLoading(true);
      setSelectedChip('Todos');
      vantaService.getEventosComBeneficioMV(cidade, tier, undefined, 30, 0).then(result => {
        if (!cancelled) {
          setEventos(result.eventos);
          setBeneficios(result.beneficios);
          setLoading(false);
        }
      });
      return () => {
        cancelled = true;
      };
    }, [cidade, isMembro, tier]);

    // Chips por tipo de benefício
    const tipoChips = useMemo(() => {
      const tipos = new Set<string>();
      beneficios.forEach(b => {
        if (b.tipo === 'ingresso') tipos.add('Ingresso');
        else if (b.tipo === 'lista') tipos.add('Lista');
        if (b.desconto && b.desconto > 0) tipos.add('Desconto');
      });
      if (tipos.size === 0) return [];
      return ['Todos', ...Array.from(tipos).sort()];
    }, [beneficios]);

    // Sub-carrosséis por formato
    const formatos = useMemo(() => {
      const set = new Set<string>();
      eventos.forEach(e => {
        if (e.formato) set.add(e.formato);
      });
      return Array.from(set).sort();
    }, [eventos]);

    const estilosUnicos = useMemo(() => {
      const set = new Set<string>();
      eventos.forEach(e => e.estilos?.forEach(s => set.add(s)));
      return Array.from(set).sort();
    }, [eventos]);

    // Filtrar por chip de tipo de benefício
    const filteredEventos = useMemo(() => {
      if (selectedChip === 'Todos') return eventos;
      return eventos.filter(e => {
        const b = beneficios.get(e.id);
        if (!b) return false;
        if (selectedChip === 'Desconto') return b.desconto != null && b.desconto > 0;
        if (selectedChip === 'Ingresso') return b.tipo === 'ingresso';
        if (selectedChip === 'Lista') return b.tipo === 'lista';
        return false;
      });
    }, [eventos, beneficios, selectedChip]);

    const formatoGroups = useMemo(
      () =>
        filterTopGroups(
          formatos
            .map(f => ({ label: f, items: filteredEventos.filter(e => e.formato === f) }))
            .filter(g => g.items.length > 0),
          filteredEventos.length,
        ),
      [filteredEventos, formatos],
    );

    const estiloGroups = useMemo(
      () =>
        filterTopGroups(
          estilosUnicos
            .map(s => ({ label: s, items: filteredEventos.filter(e => e.estilos?.[0] === s) }))
            .filter(g => g.items.length > 0),
          filteredEventos.length,
        ),
      [filteredEventos, estilosUnicos],
    );

    if (!isMembro || !tier) return null;
    if (!loading && eventos.length === 0) return null;

    return (
      <div className="py-4 w-full">
        <div className="flex items-center gap-2 px-5 mb-3">
          <Crown size="0.875rem" className="text-[#FFD300]" />
          <h3 style={TYPOGRAPHY.sectionKicker} className="text-sm">
            Benefícios MAIS VANTA
          </h3>
        </div>
        <SectionFilterChips chips={tipoChips} selected={selectedChip} onSelect={setSelectedChip} />
        {loading ? (
          <div className="px-5">
            <EventCardSkeleton />
          </div>
        ) : (
          <div className="space-y-4">
            <EventCarousel
              eventos={filteredEventos.slice(0, 9)}
              onEventClick={onEventClick}
              onComunidadeClick={onComunidadeClick}
              onViewAll={onViewAll}
              maxCards={9}
            />
            {formatoGroups.map(g => (
              <div key={`fmt-${g.label}`}>
                <p className="text-[0.625rem] font-bold uppercase tracking-widest text-zinc-500 px-5 mb-2">{g.label}</p>
                <EventCarousel
                  eventos={g.items.slice(0, 9)}
                  onEventClick={onEventClick}
                  onComunidadeClick={onComunidadeClick}
                  maxCards={9}
                />
              </div>
            ))}
            {estiloGroups.map(g => (
              <div key={`sty-${g.label}`}>
                <p className="text-[0.625rem] font-bold uppercase tracking-widest text-zinc-500 px-5 mb-2">{g.label}</p>
                <EventCarousel
                  eventos={g.items.slice(0, 9)}
                  onEventClick={onEventClick}
                  onComunidadeClick={onComunidadeClick}
                  maxCards={9}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
);

BeneficiosMVSection.displayName = 'BeneficiosMVSection';
