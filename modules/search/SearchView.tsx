import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Evento, Membro } from '../../types';
import { Building2, MapPin, ChevronRight, Lock } from 'lucide-react';
import { sortEvents, isEventExpired } from '../../utils';
import { SearchHeader } from './components/SearchHeader';
import { SearchResults } from './components/SearchResults';
import { PeopleResults } from './components/PeopleResults';
import { PlacesResults } from './components/PlacesResults';
import { CityFilterModal } from './components/CityFilterModal';
import { VibeFilterModal } from './components/VibeFilterModal';
import { TimeFilterModal } from './components/TimeFilterModal';
import { PriceFilterModal } from './components/PriceFilterModal';
import { getMinPrice } from '../../utils';
import { authService } from '../../services/authService';
import { useBloqueados } from '../../hooks/useBloqueados';
import { OptimizedImage } from '../../components/OptimizedImage';
import { EventCardSkeleton, PersonCardSkeleton } from '../../components/Skeleton';
import { supabase } from '../../services/supabaseClient';
import { useAuthStore } from '../../stores/authStore';
import { useExtrasStore } from '../../stores/extrasStore';
import { useDebounce } from '../../hooks/useDebounce';
import { BeneficiosMVTab } from './components/BeneficiosMVTab';
import { clubeService } from '../../features/admin/services/clubeService';

interface SearchViewProps {
  onEventClick: (evento: Evento) => void;
  onMemberClick: (membro: Membro) => void;
  onComunidadeClick: (id: string) => void;
}

const ITEMS_PER_PAGE = 10;

export const SearchView: React.FC<SearchViewProps> = ({ onEventClick, onMemberClick, onComunidadeClick }) => {
  const currentCity = useAuthStore(s => s.selectedCity);
  const EVENTOS = useExtrasStore(s => s.allEvents);
  const bloqueados = useBloqueados();
  const searchEventsServerSide = useExtrasStore(s => s.searchEventsServerSide);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  // Histórico de buscas recentes (localStorage)
  const HISTORY_KEY = 'vanta_search_history';
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    } catch {
      return [];
    }
  });
  const saveToHistory = (term: string) => {
    if (!term || term.length < 2) return;
    const updated = [term, ...searchHistory.filter(h => h !== term)].slice(0, 10);
    setSearchHistory(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };
  const [serverSearchResults, setServerSearchResults] = useState<Evento[] | null>(null);
  const [activeTab, setActiveTab] = useState<'EVENTS' | 'PEOPLE' | 'LUGARES' | 'BENEFICIOS'>('EVENTS');
  const currentUserId = useAuthStore(s => s.currentAccount?.id ?? '');
  const isGuest = useAuthStore(s => s.currentAccount.role) === 'vanta_guest';
  const isMembroMV = useMemo(
    () => (!isGuest && currentUserId ? clubeService.isMembro(currentUserId) : false),
    [isGuest, currentUserId],
  );
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [isCityFilterOpen, setIsCityFilterOpen] = useState(false);
  const [isEstiloFilterOpen, setIsEstiloFilterOpen] = useState(false);
  const [isTimeFilterOpen, setIsTimeFilterOpen] = useState(false);
  const [isPriceFilterOpen, setIsPriceFilterOpen] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(ITEMS_PER_PAGE);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    contentRef.current?.scrollTo(0, 0);
  }, []);

  // Server-side search quando query tem 2+ chars
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setServerSearchResults(null);
      return;
    }
    let cancelled = false;
    saveToHistory(debouncedQuery);
    void searchEventsServerSide(debouncedQuery).then(results => {
      if (!cancelled) setServerSearchResults(results);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- saveToHistory depende de searchHistory, incluir causaria loop infinito
  }, [debouncedQuery, searchEventsServerSide]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 500 && activeTab === 'EVENTS') {
      setDisplayLimit(prev => prev + ITEMS_PER_PAGE);
    }
  };

  const cities = useMemo(() => Array.from(new Set(EVENTOS.map(e => e.cidade))).sort(), [EVENTOS]);
  const toggleCity = (city: string) => {
    setSelectedCities(prev => (prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]));
    setDisplayLimit(ITEMS_PER_PAGE);
  };
  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev => (prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]));
    setDisplayLimit(ITEMS_PER_PAGE);
  };
  const clearAllFilters = () => {
    setQuery('');
    setSelectedCities([]);
    setSelectedCategories([]);
    setSelectedTimeFilter(null);
    setMaxPrice(null);
    setDisplayLimit(ITEMS_PER_PAGE);
  };

  const { visibleEvents, totalResults } = useMemo(() => {
    // Se busca server-side retornou resultados, usar esses como base
    let data = serverSearchResults ?? EVENTOS.filter(e => !isEventExpired(e));
    if (selectedCities.length > 0) data = data.filter(e => selectedCities.includes(e.cidade));
    if (selectedCategories.length > 0)
      data = data.filter(e => {
        const fmt = e.formato || e.categoria;
        return (
          selectedCategories.includes(fmt) ||
          (e.estilos ?? []).some(s => selectedCategories.includes(s)) ||
          (e.experiencias ?? []).some(s => selectedCategories.includes(s)) ||
          (e.subcategorias ?? []).some(s => selectedCategories.includes(s))
        );
      });
    if (selectedTimeFilter) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Essa Semana: segunda a domingo da semana atual
      const dayOfWeek = today.getDay(); // 0=dom
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() + mondayOffset);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      // Esse Fim de Semana: sábado e domingo da semana atual
      const saturday = new Date(startOfWeek);
      saturday.setDate(startOfWeek.getDate() + 5);
      const sunday = new Date(startOfWeek);
      sunday.setDate(startOfWeek.getDate() + 6);

      // Esse Mês: primeiro ao último dia do mês atual
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      data = data.filter(e => {
        const eventDate = new Date(e.dataReal);
        eventDate.setHours(0, 0, 0, 0);

        if (selectedTimeFilter === 'Hoje') return eventDate.getTime() === today.getTime();
        if (selectedTimeFilter === 'Amanhã') return eventDate.getTime() === tomorrow.getTime();
        if (selectedTimeFilter === 'Essa Semana') return eventDate >= startOfWeek && eventDate <= endOfWeek;
        if (selectedTimeFilter === 'Esse Fim de Semana') {
          return eventDate.getTime() === saturday.getTime() || eventDate.getTime() === sunday.getTime();
        }
        if (selectedTimeFilter === 'Esse Mês') return eventDate >= startOfMonth && eventDate <= endOfMonth;

        // Range personalizado: RANGE:YYYY-MM-DD:YYYY-MM-DD
        if (selectedTimeFilter.startsWith('RANGE:')) {
          const [, startStr, endStr] = selectedTimeFilter.split(':');
          const rangeStart = new Date(startStr + 'T00:00:00');
          rangeStart.setHours(0, 0, 0, 0);
          const rangeEnd = new Date(endStr + 'T00:00:00');
          rangeEnd.setHours(0, 0, 0, 0);
          return eventDate >= rangeStart && eventDate <= rangeEnd;
        }

        return true;
      });
    }
    if (maxPrice !== null) {
      data = data.filter(e => getMinPrice(e) <= maxPrice);
    }
    // Filtro client-side por texto só quando NÃO temos resultado server-side
    if (debouncedQuery && !serverSearchResults) {
      const lowerQuery = debouncedQuery.toLowerCase();
      data = data.filter(
        e =>
          e.titulo.toLowerCase().includes(lowerQuery) ||
          e.local.toLowerCase().includes(lowerQuery) ||
          e.cidade.toLowerCase().includes(lowerQuery),
      );
    }
    const sortedData = sortEvents(data);
    return { visibleEvents: sortedData.slice(0, displayLimit), totalResults: sortedData.length };
  }, [
    EVENTOS,
    serverSearchResults,
    debouncedQuery,
    selectedCategories,
    selectedCities,
    selectedTimeFilter,
    maxPrice,
    displayLimit,
  ]);

  // ── Busca de pessoas via Supabase ──────────────────────────────────────────
  const [peopleResults, setPeopleResults] = useState<Membro[]>([]);
  const [peopleLoading, setPeopleLoading] = useState(false);
  useEffect(() => {
    if (activeTab !== 'PEOPLE' || debouncedQuery.length < 2 || isGuest) {
      setPeopleResults([]);
      setPeopleLoading(false);
      return;
    }
    let cancelled = false;
    setPeopleLoading(true);
    void (async () => {
      try {
        const r = await authService.buscarMembros(debouncedQuery, 20);
        if (cancelled) return;
        setPeopleResults(r.filter(m => !bloqueados.has(m.id)));
      } catch (err) {
        console.error('[SearchView] busca pessoas:', err);
      } finally {
        if (!cancelled) setPeopleLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, activeTab, bloqueados, isGuest]);

  // ── Busca de lugares (comunidades) ──────────────────────────────────────
  const [placesResults, setPlacesResults] = useState<
    { id: string; nome: string; cidade: string; foto: string; tipo_comunidade?: string }[]
  >([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  useEffect(() => {
    if (activeTab !== 'LUGARES' || debouncedQuery.length < 2 || isGuest || !isMembroMV) {
      setPlacesResults([]);
      setPlacesLoading(false);
      return;
    }
    let cancelled = false;
    setPlacesLoading(true);
    void (async () => {
      try {
        const { data } = await supabase
          .from('comunidades')
          .select('id, nome, cidade, foto, tipo_comunidade')
          .ilike('nome', `%${debouncedQuery}%`)
          .limit(20);
        if (!cancelled) setPlacesResults(data ?? []);
      } catch (err) {
        console.error('[SearchView] busca lugares:', err);
      } finally {
        if (!cancelled) setPlacesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, activeTab, isGuest, isMembroMV]);

  // ── Spotlight de comunidade na busca de eventos (query direta Supabase) ───
  const [comunidadeSpotlight, setComunidadeSpotlight] = useState<{
    comunidade: { id: string; nome: string; foto: string; cidade: string };
    eventos: Evento[];
  } | null>(null);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2 || activeTab !== 'EVENTS') {
      setComunidadeSpotlight(null);
      return;
    }
    let cancelled = false;
    supabase
      .from('comunidades')
      .select('id, nome, foto, cidade')
      .eq('ativa', true)
      .ilike('nome', `%${debouncedQuery}%`)
      .limit(1)
      .then(({ data }) => {
        if (cancelled || !data || data.length === 0) {
          if (!cancelled) setComunidadeSpotlight(null);
          return;
        }
        const match = data[0] as { id: string; nome: string; foto: string; cidade: string };
        const eventosComun = EVENTOS.filter(e => !isEventExpired(e) && e.comunidade?.id === match.id)
          .sort((a, b) => new Date(a.dataReal).getTime() - new Date(b.dataReal).getTime())
          .slice(0, 3);
        setComunidadeSpotlight({ comunidade: match, eventos: eventosComun });
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, activeTab, EVENTOS]);

  const isDefaultView =
    !query &&
    selectedCategories.length === 0 &&
    selectedCities.length === 0 &&
    !selectedTimeFilter &&
    maxPrice === null;

  return (
    <div className="absolute inset-0 flex flex-col bg-[#0a0a0a] animate-in fade-in duration-300">
      <SearchHeader
        currentCity={currentCity}
        query={query}
        setQuery={setQuery}
        onClearSearch={clearAllFilters}
        activeTab={activeTab}
        isMembroMV={isMembroMV}
        onTabChange={tab => {
          setActiveTab(tab);
          clearAllFilters();
        }}
        selectedCities={selectedCities}
        onOpenCityFilter={() => setIsCityFilterOpen(true)}
        selectedCategories={selectedCategories}
        onOpenEstiloFilter={() => setIsEstiloFilterOpen(true)}
        selectedTimeFilter={selectedTimeFilter}
        onOpenTimeFilter={() => setIsTimeFilterOpen(true)}
        maxPrice={maxPrice}
        onOpenPriceFilter={() => setIsPriceFilterOpen(true)}
      />
      <div ref={contentRef} onScroll={handleScroll} className="flex-1 overflow-y-auto no-scrollbar px-6 pt-6 pb-4">
        {/* Histórico de buscas recentes */}
        {!query && searchHistory.length > 0 && activeTab !== 'BENEFICIOS' && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[0.5625rem] font-black uppercase tracking-widest text-zinc-500">Recentes</p>
              <button
                onClick={clearHistory}
                className="text-[0.5rem] font-bold uppercase tracking-widest text-zinc-600 active:text-[#FFD300] transition-colors"
              >
                Limpar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map(term => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-3 py-1.5 bg-zinc-900/60 border border-white/5 rounded-full text-xs text-zinc-300 active:border-[#FFD300]/30 transition-all"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'BENEFICIOS' ? (
          isGuest ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="w-16 h-16 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center mb-5">
                <Lock size="1.5rem" className="text-zinc-400" />
              </div>
              <h3 className="font-serif text-xl text-white mb-2">Área para membros</h3>
              <p className="text-zinc-400 text-sm mb-6 max-w-[16rem]">
                Crie sua conta pra acessar benefícios exclusivos em eventos e parceiros.
              </p>
              <button
                onClick={() => onMemberClick?.({ id: '' } as Membro)}
                className="px-6 py-3 bg-[#FFD300] text-black font-bold text-[0.625rem] uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all"
              >
                Criar conta
              </button>
            </div>
          ) : isMembroMV ? (
            <BeneficiosMVTab
              userId={currentUserId}
              filteredEvents={visibleEvents}
              query={debouncedQuery}
              onEventClick={onEventClick}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="w-16 h-16 rounded-full bg-[#FFD300]/10 border border-[#FFD300]/20 flex items-center justify-center mb-5">
                <Lock size="1.5rem" className="text-[#FFD300]" />
              </div>
              <h3 className="font-serif text-xl text-white mb-2">Lugares pra você</h3>
              <p className="text-zinc-400 text-sm mb-6 max-w-[16rem]">
                Benefícios exclusivos em bares, restaurantes e eventos. Só pra membros.
              </p>
              <button
                onClick={() => onMemberClick?.({ id: currentUserId } as Membro)}
                className="px-6 py-3 bg-[#FFD300] text-black font-bold text-[0.625rem] uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all"
              >
                Saiba mais
              </button>
            </div>
          )
        ) : activeTab === 'EVENTS' ? (
          <>
            {comunidadeSpotlight && (
              <div className="mb-6 animate-in fade-in duration-300">
                <p className="text-[0.5rem] font-black uppercase tracking-widest text-[#FFD300]/70 mb-3">
                  Comunidade encontrada
                </p>
                <button
                  onClick={() => onComunidadeClick(comunidadeSpotlight.comunidade.id)}
                  className="w-full flex items-center gap-4 bg-[#FFD300]/5 border border-[#FFD300]/20 rounded-2xl p-5 mb-4 active:scale-[0.98] transition-all text-left"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-800 shrink-0 border border-white/10">
                    {comunidadeSpotlight.comunidade.foto ? (
                      <OptimizedImage
                        src={comunidadeSpotlight.comunidade.foto}
                        width={56}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 size="1.25rem" className="text-zinc-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[0.4375rem] font-black uppercase tracking-widest bg-[#FFD300]/15 text-[#FFD300] px-2 py-0.5 rounded">
                        Comunidade
                      </span>
                    </div>
                    <p className="text-white font-bold text-sm truncate">{comunidadeSpotlight.comunidade.nome}</p>
                    <p className="text-zinc-400 text-[0.625rem] mt-0.5">Entre para ver todos os eventos</p>
                    {comunidadeSpotlight.comunidade.cidade && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin size="0.5625rem" className="text-zinc-400" />
                        <p className="text-zinc-400 text-[0.625rem] truncate">
                          {comunidadeSpotlight.comunidade.cidade}
                        </p>
                      </div>
                    )}
                  </div>
                  <ChevronRight size="1rem" className="text-[#FFD300] shrink-0" />
                </button>
                {comunidadeSpotlight.eventos.length > 0 && (
                  <>
                    <p className="text-[0.5rem] font-black uppercase tracking-widest text-zinc-400 mb-3">
                      Próximos eventos neste local
                    </p>
                    <div className="space-y-3 mb-6">
                      {comunidadeSpotlight.eventos.map(e => (
                        <button
                          key={e.id}
                          onClick={() => onEventClick(e)}
                          className="w-full flex items-center gap-3 bg-zinc-900/50 border border-white/5 rounded-xl p-3 text-left active:scale-[0.98] transition-all"
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-zinc-800">
                            <OptimizedImage
                              src={e.imagem}
                              width={40}
                              className="w-full h-full object-cover"
                              alt={e.titulo}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-bold truncate">{e.titulo}</p>
                            <p className="text-zinc-400 text-[0.625rem] mt-0.5">
                              {e.data} · {e.horario}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="h-px bg-white/5 mb-6" />
                  </>
                )}
              </div>
            )}
            <SearchResults
              results={visibleEvents}
              currentCity={currentCity}
              isDefaultView={isDefaultView}
              onEventClick={onEventClick}
              onClearSearch={clearAllFilters}
            />
            {visibleEvents.length < totalResults && (
              <div className="px-3 space-y-1">
                <EventCardSkeleton />
                <EventCardSkeleton />
              </div>
            )}
          </>
        ) : activeTab === 'LUGARES' ? (
          isGuest ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="w-16 h-16 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center mb-5">
                <Lock size="1.5rem" className="text-zinc-400" />
              </div>
              <h3 className="font-serif text-xl text-white mb-2">Área para membros</h3>
              <p className="text-zinc-400 text-sm mb-6 max-w-[16rem]">
                Crie sua conta pra descobrir os melhores lugares da sua cidade.
              </p>
              <button
                onClick={() => onMemberClick?.({ id: '' } as Membro)}
                className="px-6 py-3 bg-[#FFD300] text-black font-bold text-[0.625rem] uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all"
              >
                Criar conta
              </button>
            </div>
          ) : !isMembroMV ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="w-16 h-16 rounded-full bg-[#FFD300]/10 border border-[#FFD300]/20 flex items-center justify-center mb-5">
                <Lock size="1.5rem" className="text-[#FFD300]" />
              </div>
              <h3 className="font-serif text-xl text-white mb-2">Área exclusiva MAIS VANTA</h3>
              <p className="text-zinc-400 text-sm mb-6 max-w-[16rem]">
                Benefícios exclusivos em bares, restaurantes e eventos. Só pra membros do clube.
              </p>
              <button
                onClick={() => onMemberClick?.({ id: currentUserId } as Membro)}
                className="px-6 py-3 bg-[#FFD300] text-black font-bold text-[0.625rem] uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all"
              >
                Saiba mais
              </button>
            </div>
          ) : placesLoading ? (
            <div className="space-y-1 px-2">
              {[1, 2, 3, 4].map(i => (
                <PersonCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <PlacesResults results={placesResults} onPlaceClick={onComunidadeClick} />
          )
        ) : isGuest ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-16 h-16 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center mb-5">
              <Lock size="1.5rem" className="text-zinc-400" />
            </div>
            <h3 className="font-serif text-xl text-white mb-2">Área para membros</h3>
            <p className="text-zinc-400 text-sm mb-6 max-w-[16rem]">
              Crie sua conta pra buscar pessoas e conectar com quem curte a mesma vibe.
            </p>
            <button
              onClick={() => onMemberClick?.({ id: '' } as Membro)}
              className="px-6 py-3 bg-[#FFD300] text-black font-bold text-[0.625rem] uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all"
            >
              Criar conta
            </button>
          </div>
        ) : peopleLoading ? (
          <div className="space-y-1 px-2">
            {[1, 2, 3, 4].map(i => (
              <PersonCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <PeopleResults results={peopleResults} onMemberClick={onMemberClick} />
        )}
      </div>
      <CityFilterModal
        isOpen={isCityFilterOpen}
        onClose={() => setIsCityFilterOpen(false)}
        allCities={cities}
        selectedCities={selectedCities}
        onToggleCity={toggleCity}
        onClear={() => setSelectedCities([])}
      />
      <VibeFilterModal
        isOpen={isEstiloFilterOpen}
        onClose={() => setIsEstiloFilterOpen(false)}
        selectedCategories={selectedCategories}
        onToggleCategory={toggleCategory}
        onClear={() => setSelectedCategories([])}
      />
      <TimeFilterModal
        isOpen={isTimeFilterOpen}
        onClose={() => setIsTimeFilterOpen(false)}
        selectedTimeFilter={selectedTimeFilter}
        onSelectTimeFilter={filter => {
          setSelectedTimeFilter(filter);
          setDisplayLimit(ITEMS_PER_PAGE);
        }}
      />
      <PriceFilterModal
        isOpen={isPriceFilterOpen}
        onClose={() => setIsPriceFilterOpen(false)}
        maxPrice={maxPrice}
        onSelectMaxPrice={price => {
          setMaxPrice(price);
          setDisplayLimit(ITEMS_PER_PAGE);
        }}
      />
    </div>
  );
};
