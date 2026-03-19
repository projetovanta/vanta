import React, { useMemo, useRef, useEffect, useState } from 'react';
import { ChevronRight, Ticket } from 'lucide-react';
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
      <div className="py-4 w-full space-y-10">
        {[1, 2, 3].map(i => (
          <div key={i}>
            <div className="px-5 mb-4">
              <div className="h-3 w-20 bg-zinc-800/40 rounded-lg animate-pulse" />
            </div>
            <div className="flex gap-3 px-5">
              {[1, 2, 3].map(j => (
                <div key={j} className="shrink-0 w-[44vw] max-w-[12rem]">
                  <div className="rounded-2xl overflow-hidden bg-[#111] border border-white/[0.06]">
                    <div className="aspect-[3/4] bg-zinc-800/20 animate-pulse" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 w-20 bg-zinc-800/20 rounded-lg animate-pulse" />
                      <div className="h-2.5 w-14 bg-zinc-800/20 rounded-lg animate-pulse" />
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

  if (categorized.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4 px-8">
        <div className="w-16 h-16 rounded-2xl bg-[#FFD300]/5 border border-[#FFD300]/10 flex items-center justify-center">
          <Ticket size="1.5rem" className="text-[#FFD300]/40" />
        </div>
        <p className="text-zinc-500 text-sm text-center leading-relaxed max-w-[16rem]">
          Sem eventos na sua cidade por enquanto.
        </p>
      </div>
    );
  }

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
      <div className="flex items-center justify-between px-5 mb-4">
        <h3 className="text-base text-white font-serif">{categoria}</h3>
        {eventos.length > 3 && (
          <button
            onClick={() => onViewAll(categoria)}
            className="flex items-center gap-0.5 text-xs text-[#FFD300]/70 font-medium active:text-[#FFD300] transition-colors"
          >
            Ver todos <ChevronRight size="0.875rem" />
          </button>
        )}
      </div>

      {/* Carrossel horizontal */}
      <div ref={scrollRef} className="flex gap-3 overflow-x-auto no-scrollbar px-5 snap-x snap-mandatory">
        {visibleEvents.map(e => (
          <div key={e.id} className="shrink-0 w-[44vw] max-w-[12rem] snap-start">
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
            className="shrink-0 w-[44vw] max-w-[12rem] snap-start flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/[0.06] bg-[#111] aspect-[3/4] active:scale-95 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FFD300]/10 flex items-center justify-center">
              <ChevronRight size="1.25rem" className="text-[#FFD300]" />
            </div>
            <span className="text-xs font-semibold text-zinc-400">Ver mais {eventos.length - MAX_VISIBLE}</span>
          </button>
        )}
      </div>
    </div>
  );
};
