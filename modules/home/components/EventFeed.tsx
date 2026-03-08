import React, { useMemo, useRef, useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { Evento } from '../../../types';
import { EventCard } from '../../../components/EventCard';
import { sortEvents } from '../../../utils';
import { supabase } from '../../../services/supabaseClient';
import { trackEventView } from '../../../services/analyticsService';
import { useAuthStore } from '../../../stores/authStore';

interface FormatoRow {
  label: string;
}

export const EventFeed: React.FC<{
  currentCity: string;
  eventos: Evento[];
  onEventClick: (e: any) => void;
  onViewAll: (cat?: string) => void;
  onComunidadeClick?: (id: string) => void;
}> = React.memo(({ currentCity, eventos: allEventos, onEventClick, onViewAll, onComunidadeClick }) => {
  const [formatoRows, setFormatoRows] = useState<FormatoRow[]>([]);
  const [formatosLoaded, setFormatosLoaded] = useState(false);
  const currentUserId = useAuthStore(s => s.currentAccount?.id);

  useEffect(() => {
    supabase
      .from('formatos')
      .select('label')
      .eq('ativo', true)
      .order('ordem', { ascending: true })
      .then(
        ({ data }) => {
          setFormatoRows((data ?? []) as FormatoRow[]);
          setFormatosLoaded(true);
        },
        () => {
          setFormatosLoaded(true);
        },
      );
  }, []);

  const categorized = useMemo(() => {
    const filtered = sortEvents(allEventos.filter(e => !currentCity || e.cidade === currentCity));
    if (formatoRows.length === 0 && filtered.length === 0) return [];

    const formatoLabels = formatoRows.map(f => f.label);
    const usedIds = new Set<string>();
    const result: { categoria: string; eventos: Evento[] }[] = [];

    // Agrupa por formato (usa evento.formato, fallback para evento.categoria)
    formatoLabels.forEach(label => {
      const matching = filtered.filter(e => {
        const fmt = e.formato || e.categoria;
        return fmt === label && !usedIds.has(e.id);
      });
      if (matching.length === 0) return;
      matching.forEach(e => usedIds.add(e.id));
      result.push({ categoria: label, eventos: matching });
    });

    // Eventos sem formato mapeado
    const remaining = filtered.filter(e => !usedIds.has(e.id));
    if (remaining.length > 0) {
      result.push({ categoria: 'Outros', eventos: remaining });
    }

    return result;
  }, [allEventos, currentCity, formatoRows]);

  // Track impressões no feed (batch: acumula IDs → 1 INSERT a cada 3s)
  const trackedRef = useRef(new Set<string>());
  useEffect(() => {
    if (!currentUserId || categorized.length === 0) return;
    for (const { eventos } of categorized) {
      for (const e of eventos.slice(0, 8)) {
        if (!trackedRef.current.has(e.id)) {
          trackedRef.current.add(e.id);
          trackEventView(currentUserId, e.id);
        }
      }
    }
  }, [categorized, currentUserId]);

  if (!formatosLoaded) {
    // Skeleton loading enquanto carrega categorias do Supabase
    return (
      <div className="py-4 w-full space-y-8">
        {[1, 2, 3].map(i => (
          <div key={i}>
            <div className="px-5 mb-3">
              <div className="h-4 w-24 bg-zinc-800/50 rounded animate-pulse" />
            </div>
            <div className="flex gap-3 px-5">
              {[1, 2, 3].map(j => (
                <div key={j} className="shrink-0 w-[42vw] max-w-[180px]">
                  <div className="rounded-2xl overflow-hidden bg-[#161616] border border-white/5">
                    <div className="aspect-[4/5] bg-zinc-800/30 animate-pulse" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 w-20 bg-zinc-800/30 rounded animate-pulse" />
                      <div className="h-3 w-14 bg-zinc-800/30 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (categorized.length === 0) return null;

  return (
    <div className="py-4 w-full space-y-8">
      {categorized.map(({ categoria, eventos }) => (
        <CategoryRow
          key={categoria}
          categoria={categoria}
          eventos={eventos}
          onEventClick={onEventClick}
          onComunidadeClick={onComunidadeClick}
          onViewAll={onViewAll}
          currentCity={currentCity}
        />
      ))}
    </div>
  );
});

const CategoryRow: React.FC<{
  categoria: string;
  eventos: Evento[];
  onEventClick: (e: Evento) => void;
  onComunidadeClick?: (id: string) => void;
  onViewAll: (cat?: string) => void;
  currentCity: string;
}> = ({ categoria, eventos, onEventClick, onComunidadeClick, onViewAll, currentCity }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const MAX_VISIBLE = 8;
  const visibleEvents = eventos.slice(0, MAX_VISIBLE);
  const hasMore = eventos.length > MAX_VISIBLE;

  return (
    <div>
      {/* px-5 individual — carrossel com edge-bleed, não usar px global */}
      <div className="flex items-center justify-between px-5 mb-3">
        <h3 style={TYPOGRAPHY.sectionKicker} className="text-sm">
          {categoria}
        </h3>
        {eventos.length > 3 && (
          <button
            onClick={() => onViewAll(categoria)}
            className="flex items-center gap-1 text-[9px] text-zinc-400 font-black uppercase tracking-widest active:text-[#FFD300] transition-colors"
          >
            Ver todos <ChevronRight size={12} />
          </button>
        )}
      </div>

      {/* Carrossel horizontal */}
      <div ref={scrollRef} className="flex gap-3 overflow-x-auto no-scrollbar px-5 snap-x snap-mandatory">
        {visibleEvents.map(e => (
          <div key={e.id} className="shrink-0 w-[42vw] max-w-[180px] snap-start">
            <EventCard
              evento={e}
              onClick={onEventClick}
              onComunidadeClick={onComunidadeClick}
              showCityInsteadOfLocal={!currentCity}
            />
          </div>
        ))}
        {hasMore && (
          <button
            onClick={() => onViewAll(categoria)}
            className="shrink-0 w-[42vw] max-w-[180px] snap-start flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#161616] aspect-[4/5] active:scale-95 transition-transform"
          >
            <ChevronRight size={24} className="text-[#FFD300]" />
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Ver Mais</span>
            <span className="text-[9px] text-zinc-400">+{eventos.length - MAX_VISIBLE} eventos</span>
          </button>
        )}
      </div>
    </div>
  );
};
