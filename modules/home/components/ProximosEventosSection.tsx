import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { CalendarDays, Settings, SearchX, Sliders, RotateCcw, X } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { Evento } from '../../../types';
import { EventCarousel } from './EventCarousel';
import { vantaService } from '../../../services/vantaService';
import { EventCardSkeleton } from '../../../components/Skeleton';
import { trackEventView } from '../../../services/analyticsService';
import { filterTopGroups } from '../utils/filterSubCarousels';
import { HomeFilterOverlay } from './HomeFilterOverlay';

interface ProximosEventosSectionProps {
  cidade: string;
  userId?: string;
  onEventClick: (e: Evento) => void;
  onComunidadeClick?: (id: string) => void;
  onViewAll: () => void;
}

export const ProximosEventosSection: React.FC<ProximosEventosSectionProps> = React.memo(
  ({ cidade, userId, onEventClick, onComunidadeClick, onViewAll }) => {
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [estilos, setEstilos] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilterOverlay, setShowFilterOverlay] = useState(false);
    const [localFilters, setLocalFilters] = useState<string[] | null>(null);

    const handleCloseOverlay = useCallback(() => setShowFilterOverlay(false), []);
    const handleApplyFilters = useCallback((filters: string[] | null) => setLocalFilters(filters), []);

    useEffect(() => {
      let cancelled = false;
      setLoading(true);
      setLocalFilters(null);

      Promise.all([
        vantaService.getEventosPorCidade(cidade, true, 30, 0),
        vantaService.getEstilosPorCidade(cidade),
      ]).then(([data, chips]) => {
        if (!cancelled) {
          setEventos(data);
          setEstilos(chips);
          setLoading(false);
          if (userId) {
            data.forEach(e => trackEventView(userId, e.id));
          }
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

    // Separar localFilters em formatos e estilos selecionados
    const selectedFormatos = useMemo(() => {
      if (!localFilters || localFilters.length === 0) return null;
      return localFilters.filter(f => formatos.includes(f));
    }, [localFilters, formatos]);

    const selectedEstilos = useMemo(() => {
      if (!localFilters || localFilters.length === 0) return null;
      return localFilters.filter(s => estilos.includes(s));
    }, [localFilters, estilos]);

    // Eventos pré-filtrados por localFilters (AND entre dimensões, OR dentro)
    const filteredEventos = useMemo(() => {
      if (!localFilters || localFilters.length === 0) return eventos;
      const fmts = selectedFormatos && selectedFormatos.length > 0 ? selectedFormatos : null;
      const stls = selectedEstilos && selectedEstilos.length > 0 ? selectedEstilos : null;
      return eventos.filter(e => {
        const matchFormato = !fmts || (e.formato && fmts.includes(e.formato));
        const matchEstilo = !stls || (e.estilos && e.estilos.some(s => stls.includes(s)));
        return matchFormato && matchEstilo;
      });
    }, [eventos, localFilters, selectedFormatos, selectedEstilos]);

    // Grupos por formato (usa filteredEventos)
    const formatoGroups = useMemo(() => {
      const fmts = selectedFormatos && selectedFormatos.length > 0 ? selectedFormatos : formatos;
      return fmts
        .map(f => ({ label: f, items: filteredEventos.filter(e => e.formato === f) }))
        .filter(g => g.items.length > 0);
    }, [filteredEventos, formatos, selectedFormatos]);

    // Grupos por estilo (só estilo principal = estilos[0], usa filteredEventos)
    const estiloGroups = useMemo(() => {
      const stls = selectedEstilos && selectedEstilos.length > 0 ? selectedEstilos : estilos;
      return stls
        .map(s => ({ label: s, items: filteredEventos.filter(e => e.estilos?.[0] === s) }))
        .filter(g => g.items.length > 0);
    }, [filteredEventos, estilos, selectedEstilos]);

    // Filtrar por relevância (mínimo dinâmico + top 4)
    const visibleFormatoGroups = useMemo(() => {
      return filterTopGroups(formatoGroups, filteredEventos.length);
    }, [formatoGroups, filteredEventos.length]);

    const visibleEstiloGroups = useMemo(() => {
      return filterTopGroups(estiloGroups, filteredEventos.length);
    }, [estiloGroups, filteredEventos.length]);

    const handleResetFilters = useCallback(() => {
      setLocalFilters(null);
    }, []);

    const handleRemoveFilter = useCallback((filter: string) => {
      setLocalFilters(prev => {
        if (!prev) return null;
        const next = prev.filter(f => f !== filter);
        return next.length > 0 ? next : null;
      });
    }, []);

    const hasActiveFilters = localFilters && localFilters.length > 0;
    const noFilteredResults = !loading && hasActiveFilters && filteredEventos.length === 0;

    if (!loading && eventos.length === 0) return null;

    return (
      <div className="py-4 w-full relative">
        <div className="flex items-center gap-2 px-5 mb-3">
          <CalendarDays size="0.875rem" className="text-[#FFD300]" />
          <h3 style={TYPOGRAPHY.sectionKicker} className="text-sm">
            Próximos Eventos
          </h3>
          <button
            onClick={() => setShowFilterOverlay(true)}
            className="ml-auto p-1.5 rounded-full active:scale-90 transition-transform"
          >
            <Settings
              size="0.875rem"
              className={localFilters && localFilters.length > 0 ? 'text-[#FFD300]' : 'text-zinc-600'}
            />
          </button>
        </div>
        {hasActiveFilters && (
          <div className="px-5 pb-2">
            <p className="text-[0.5rem] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1.5">Filtros ativos</p>
            <div className="overflow-x-auto no-scrollbar">
              <div className="flex gap-2 w-max">
                {localFilters!.slice(0, 3).map(f => (
                  <button
                    key={f}
                    onClick={() => handleRemoveFilter(f)}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFD300]/15 border border-[#FFD300]/30 text-[#FFD300] text-[0.5625rem] font-bold uppercase tracking-wider active:scale-95 transition-all"
                  >
                    <span className="truncate max-w-[6rem]">{f}</span>
                    <X size="0.5625rem" className="shrink-0 opacity-70" />
                  </button>
                ))}
                {localFilters!.length > 3 && (
                  <button
                    onClick={() => setShowFilterOverlay(true)}
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-zinc-900/50 border border-white/10 text-zinc-400 text-[0.5625rem] font-bold uppercase tracking-wider active:scale-95 transition-all"
                  >
                    +{localFilters!.length - 3} filtros
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        {loading ? (
          <div className="px-5">
            <EventCardSkeleton />
          </div>
        ) : noFilteredResults ? (
          <div className="flex flex-col items-center justify-center py-10 px-8 gap-3">
            <SearchX size="2rem" className="text-zinc-700" />
            <p className="text-zinc-400 text-xs text-center font-bold">Nenhum evento encontrado com seus filtros</p>
            <p className="text-zinc-600 text-[0.625rem] text-center">
              Tente ajustar suas preferências ou veja todos os eventos
            </p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setShowFilterOverlay(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FFD300]/15 text-[#FFD300] text-xs font-bold active:scale-95 transition-transform border border-[#FFD300]/20"
              >
                <Sliders size="0.75rem" />
                Editar filtros
              </button>
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800/80 text-zinc-400 text-xs font-bold active:scale-95 transition-transform border border-white/5"
              >
                <RotateCcw size="0.75rem" />
                Ver todos
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Carrossel principal — Todos */}
            <EventCarousel
              eventos={filteredEventos.slice(0, 9)}
              onEventClick={onEventClick}
              onComunidadeClick={onComunidadeClick}
              onViewAll={onViewAll}
              maxCards={9}
            />

            {/* Sub-carrosséis por formato (só sem filtro personalizado) */}
            {!hasActiveFilters && visibleFormatoGroups.length > 0 && (
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

            {/* Sub-carrosséis por estilo (só sem filtro personalizado) */}
            {!hasActiveFilters && visibleEstiloGroups.length > 0 && (
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

        {showFilterOverlay && (
          <HomeFilterOverlay
            onClose={handleCloseOverlay}
            cidade={cidade}
            currentFilters={localFilters}
            onApply={handleApplyFilters}
          />
        )}
      </div>
    );
  },
);

ProximosEventosSection.displayName = 'ProximosEventosSection';
