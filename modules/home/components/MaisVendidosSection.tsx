import React, { useEffect, useState, useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { Evento } from '../../../types';
import { EventCarousel } from './EventCarousel';
import { vantaService } from '../../../services/vantaService';
import { EventCardSkeleton } from '../../../components/Skeleton';
import { SectionFilterChips } from '../../../components/SectionFilterChips';
import { filterTopGroups } from '../utils/filterSubCarousels';

interface MaisVendidosSectionProps {
  cidade: string;
  onEventClick: (e: Evento) => void;
  onComunidadeClick?: (id: string) => void;
}

export const MaisVendidosSection: React.FC<MaisVendidosSectionProps> = React.memo(
  ({ cidade, onEventClick, onComunidadeClick }) => {
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [selectedChip, setSelectedChip] = useState('Todos');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      let cancelled = false;
      setLoading(true);
      setSelectedChip('Todos');
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

    const chips = useMemo(() => {
      const c = ['Todos'];
      formatos.forEach(f => c.push(f));
      estilosUnicos.forEach(s => {
        if (!c.includes(s)) c.push(s);
      });
      return c;
    }, [formatos, estilosUnicos]);

    const formatoGroups = useMemo(
      () =>
        formatos.map(f => ({ label: f, items: eventos.filter(e => e.formato === f) })).filter(g => g.items.length > 0),
      [eventos, formatos],
    );

    const estiloGroups = useMemo(
      () =>
        estilosUnicos
          .map(s => ({ label: s, items: eventos.filter(e => e.estilos?.[0] === s) }))
          .filter(g => g.items.length > 0),
      [eventos, estilosUnicos],
    );

    const visibleFormatoGroups = useMemo(() => {
      let groups = formatoGroups;
      if (selectedChip !== 'Todos') {
        const match = groups.find(g => g.label === selectedChip);
        if (match) return [match];
        groups = groups
          .map(g => ({ ...g, items: g.items.filter(e => e.estilos?.includes(selectedChip)) }))
          .filter(g => g.items.length > 0);
      }
      return filterTopGroups(groups, eventos.length);
    }, [formatoGroups, selectedChip, eventos.length]);

    const visibleEstiloGroups = useMemo(() => {
      let groups = estiloGroups;
      if (selectedChip !== 'Todos') {
        const match = groups.find(g => g.label === selectedChip);
        if (match) return [match];
        const fmtEvts = eventos.filter(e => e.formato === selectedChip);
        if (fmtEvts.length > 0) {
          groups = estilosUnicos
            .map(s => ({ label: s, items: fmtEvts.filter(e => e.estilos?.[0] === s) }))
            .filter(g => g.items.length > 0);
        }
      }
      return filterTopGroups(groups, eventos.length);
    }, [estiloGroups, estilosUnicos, eventos, selectedChip]);

    const todosEventos = useMemo(() => {
      if (selectedChip === 'Todos') return eventos;
      const byFmt = eventos.filter(e => e.formato === selectedChip);
      if (byFmt.length > 0) return byFmt;
      return eventos.filter(e => e.estilos?.[0] === selectedChip);
    }, [eventos, selectedChip]);

    if (!loading && eventos.length === 0) return null;

    return (
      <div className="py-4 w-full">
        <div className="flex items-center gap-2 px-5 mb-3">
          <TrendingUp size="0.875rem" className="text-[#FFD300]" />
          <h3 style={TYPOGRAPHY.sectionKicker} className="text-sm">
            Mais Vendidos 24h
          </h3>
        </div>
        <SectionFilterChips chips={chips} selected={selectedChip} onSelect={setSelectedChip} />
        {loading ? (
          <div className="px-5">
            <EventCardSkeleton />
          </div>
        ) : (
          <div className="space-y-4">
            <EventCarousel
              eventos={todosEventos}
              onEventClick={onEventClick}
              onComunidadeClick={onComunidadeClick}
              maxCards={10}
            />
            {visibleFormatoGroups.map(g => (
              <div key={`fmt-${g.label}`}>
                <p className="text-[0.625rem] font-bold uppercase tracking-widest text-zinc-500 px-5 mb-2">{g.label}</p>
                <EventCarousel
                  eventos={g.items}
                  onEventClick={onEventClick}
                  onComunidadeClick={onComunidadeClick}
                  maxCards={10}
                />
              </div>
            ))}
            {visibleEstiloGroups.map(g => (
              <div key={`sty-${g.label}`}>
                <p className="text-[0.625rem] font-bold uppercase tracking-widest text-zinc-500 px-5 mb-2">{g.label}</p>
                <EventCarousel
                  eventos={g.items}
                  onEventClick={onEventClick}
                  onComunidadeClick={onComunidadeClick}
                  maxCards={10}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
);

MaisVendidosSection.displayName = 'MaisVendidosSection';
