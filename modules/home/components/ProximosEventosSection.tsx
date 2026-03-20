import React, { useEffect, useState, useMemo } from 'react';
import { CalendarDays } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { Evento } from '../../../types';
import { EventCarousel } from './EventCarousel';
import { vantaService } from '../../../services/vantaService';
import { EventCardSkeleton } from '../../../components/Skeleton';
import { SectionFilterChips } from '../../../components/SectionFilterChips';
import { filterTopGroups } from '../utils/filterSubCarousels';

interface ProximosEventosSectionProps {
  cidade: string;
  onEventClick: (e: Evento) => void;
  onComunidadeClick?: (id: string) => void;
  onViewAll: () => void;
}

export const ProximosEventosSection: React.FC<ProximosEventosSectionProps> = React.memo(
  ({ cidade, onEventClick, onComunidadeClick, onViewAll }) => {
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [estilos, setEstilos] = useState<string[]>([]);
    const [selectedChip, setSelectedChip] = useState('Todos');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      let cancelled = false;
      setLoading(true);
      setSelectedChip('Todos');

      Promise.all([
        vantaService.getEventosPorCidade(cidade, true, 30, 0),
        vantaService.getEstilosPorCidade(cidade),
      ]).then(([data, chips]) => {
        if (!cancelled) {
          setEventos(data);
          setEstilos(chips);
          setLoading(false);
        }
      });

      return () => {
        cancelled = true;
      };
    }, [cidade]);

    // Formatos disponíveis (tipos de evento)
    const formatos = useMemo(() => {
      const set = new Set<string>();
      eventos.forEach(e => {
        if (e.formato) set.add(e.formato);
      });
      return Array.from(set).sort();
    }, [eventos]);

    // Chips: Todos + formatos + estilos
    const chips = useMemo(() => {
      const c = ['Todos'];
      formatos.forEach(f => c.push(f));
      estilos.forEach(s => {
        if (!c.includes(s)) c.push(s);
      });
      return c;
    }, [formatos, estilos]);

    // Grupos por formato
    const formatoGroups = useMemo(() => {
      return formatos
        .map(f => ({ label: f, items: eventos.filter(e => e.formato === f) }))
        .filter(g => g.items.length > 0);
    }, [eventos, formatos]);

    // Grupos por estilo (só estilo principal = estilos[0])
    const estiloGroups = useMemo(() => {
      return estilos
        .map(s => ({ label: s, items: eventos.filter(e => e.estilos?.[0] === s) }))
        .filter(g => g.items.length > 0);
    }, [eventos, estilos]);

    // Filtrar por relevância (mínimo dinâmico + top 4)
    const visibleFormatoGroups = useMemo(() => {
      let groups = formatoGroups;
      if (selectedChip !== 'Todos') {
        const match = groups.find(g => g.label === selectedChip);
        if (match) return [match];
        groups = groups
          .map(g => ({ ...g, items: g.items.filter(e => e.estilos?.[0] === selectedChip) }))
          .filter(g => g.items.length > 0);
      }
      return filterTopGroups(groups, eventos.length);
    }, [formatoGroups, selectedChip, eventos.length]);

    const visibleEstiloGroups = useMemo(() => {
      let groups = estiloGroups;
      if (selectedChip !== 'Todos') {
        const match = groups.find(g => g.label === selectedChip);
        if (match) return [match];
        const formatoEventos = eventos.filter(e => e.formato === selectedChip);
        if (formatoEventos.length > 0) {
          groups = estilos
            .map(s => ({ label: s, items: formatoEventos.filter(e => e.estilos?.[0] === s) }))
            .filter(g => g.items.length > 0);
        }
      }
      return filterTopGroups(groups, eventos.length);
    }, [estiloGroups, estilos, eventos, selectedChip]);

    // Carrossel "Todos" filtrado pelo chip
    const todosEventos = useMemo(() => {
      if (selectedChip === 'Todos') return eventos;
      // Formato?
      const byFormato = eventos.filter(e => e.formato === selectedChip);
      if (byFormato.length > 0) return byFormato;
      // Estilo?
      return eventos.filter(e => e.estilos?.[0] === selectedChip);
    }, [eventos, selectedChip]);

    if (!loading && eventos.length === 0) return null;

    return (
      <div className="py-4 w-full">
        <div className="flex items-center gap-2 px-5 mb-3">
          <CalendarDays size="0.875rem" className="text-[#FFD300]" />
          <h3 style={TYPOGRAPHY.sectionKicker} className="text-sm">
            Próximos Eventos
          </h3>
        </div>
        <SectionFilterChips chips={chips} selected={selectedChip} onSelect={setSelectedChip} />
        {loading ? (
          <div className="px-5">
            <EventCardSkeleton />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Carrossel principal — Todos */}
            <EventCarousel
              eventos={todosEventos.slice(0, 9)}
              onEventClick={onEventClick}
              onComunidadeClick={onComunidadeClick}
              onViewAll={onViewAll}
              maxCards={9}
            />

            {/* Sub-carrosséis por formato */}
            {visibleFormatoGroups.length > 0 && (
              <div className="space-y-4">
                {visibleFormatoGroups.map(g => (
                  <div key={`fmt-${g.label}`}>
                    <p className="text-[0.625rem] font-bold uppercase tracking-widest text-zinc-500 px-5 mb-2">
                      {g.label}
                    </p>
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

            {/* Sub-carrosséis por estilo */}
            {visibleEstiloGroups.length > 0 && (
              <div className="space-y-4">
                {visibleEstiloGroups.map(g => (
                  <div key={`sty-${g.label}`}>
                    <p className="text-[0.625rem] font-bold uppercase tracking-widest text-zinc-500 px-5 mb-2">
                      {g.label}
                    </p>
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
        )}
      </div>
    );
  },
);

ProximosEventosSection.displayName = 'ProximosEventosSection';
