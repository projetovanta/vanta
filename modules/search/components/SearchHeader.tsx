import React, { useMemo } from 'react';
import { Search, X, MapPin, Sparkles, Calendar, DollarSign } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';

interface SearchHeaderProps {
  currentCity: string;
  query: string;
  setQuery: (q: string) => void;
  onClearSearch: () => void;
  activeTab: 'EVENTS' | 'PEOPLE' | 'LUGARES' | 'BENEFICIOS';
  onTabChange: (tab: 'EVENTS' | 'PEOPLE' | 'LUGARES' | 'BENEFICIOS') => void;
  isMembroMV?: boolean;
  selectedCities: string[];
  onOpenCityFilter: () => void;
  selectedCategories: string[];
  onOpenEstiloFilter: () => void;
  selectedTimeFilter: string | null;
  onOpenTimeFilter: () => void;
  maxPrice: number | null;
  onOpenPriceFilter: () => void;
}

const getTimeLabel = (f: string | null): string => {
  if (!f) return 'Período';
  if (f.startsWith('RANGE:')) {
    const [, start, end] = f.split(':');
    const fmt = (d: string) => {
      const [, m, day] = d.split('-');
      return `${day}/${m}`;
    };
    return `${fmt(start)}–${fmt(end)}`;
  }
  return f;
};

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  query,
  setQuery,
  onClearSearch,
  activeTab,
  onTabChange,
  selectedCities,
  onOpenCityFilter,
  selectedCategories,
  onOpenEstiloFilter,
  selectedTimeFilter,
  onOpenTimeFilter,
  maxPrice,
  onOpenPriceFilter,
  isMembroMV,
}) => {
  const cityLabel = useMemo(
    () =>
      selectedCities.length === 0
        ? 'Cidades'
        : selectedCities.length === 1
          ? selectedCities[0]
          : `${selectedCities[0]} (+${selectedCities.length - 1})`,
    [selectedCities],
  );
  const timeLabel = useMemo(() => getTimeLabel(selectedTimeFilter), [selectedTimeFilter]);
  return (
    <div className="shrink-0 bg-[#0a0a0a] border-b border-white/5 px-6 pb-6 pt-0">
      <h1 style={TYPOGRAPHY.screenTitle} className="text-3xl text-[#FFD300] mb-6">
        Explorar
      </h1>
      <div className="grid grid-cols-4 gap-1.5 mb-6 p-1 bg-zinc-900/50 rounded-2xl border border-white/5">
        {(['EVENTS', 'PEOPLE', 'LUGARES', 'BENEFICIOS'] as const).map(t => (
          <button
            key={t}
            onClick={() => onTabChange(t)}
            className={`py-3.5 rounded-xl text-[0.5625rem] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-[#FFD300] text-black' : 'text-zinc-400'}`}
          >
            {t === 'EVENTS' ? 'Eventos' : t === 'PEOPLE' ? 'Pessoas' : t === 'LUGARES' ? 'Lugares' : 'Pra Você'}
          </button>
        ))}
      </div>
      {/* Busca por texto — todas as abas */}
      <div className="relative mb-4">
        <Search size="1.125rem" className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          className="w-full pl-11 pr-11 py-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl text-white text-sm"
          placeholder={
            activeTab === 'BENEFICIOS'
              ? 'Buscar benefícios pra você...'
              : activeTab === 'PEOPLE'
                ? 'Nome ou e-mail...'
                : activeTab === 'LUGARES'
                  ? 'Bar, casa noturna, restaurante...'
                  : 'O que busca hoje?'
          }
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {query && (
          <button
            onClick={onClearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-zinc-800 rounded-full p-1.5"
          >
            <X size="0.75rem" />
          </button>
        )}
      </div>
      {/* Filtros — Eventos: cidade, estilo, período, preço */}
      {activeTab === 'EVENTS' && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onOpenCityFilter}
            className={`px-3 py-2 rounded-xl text-[0.5625rem] font-bold uppercase border flex items-center gap-2 ${selectedCities.length > 0 ? 'bg-[#FFD300] text-black' : 'bg-zinc-900 text-zinc-400 border-white/5'}`}
          >
            <MapPin size="0.625rem" />
            {cityLabel}
          </button>
          <button
            onClick={onOpenEstiloFilter}
            className={`px-3 py-2 rounded-xl text-[0.5625rem] font-bold uppercase border flex items-center gap-2 ${selectedCategories.length > 0 ? 'bg-[#FFD300] text-black' : 'bg-zinc-900 text-zinc-400 border-white/5'}`}
          >
            <Sparkles size="0.625rem" />
            Estilo
          </button>
          <button
            aria-label="Calendário"
            onClick={onOpenTimeFilter}
            className={`px-3 py-2 rounded-xl text-[0.5625rem] font-bold uppercase border flex items-center gap-2 ${selectedTimeFilter ? 'bg-[#FFD300] text-black' : 'bg-zinc-900 text-zinc-400 border-white/5'}`}
          >
            <Calendar size="0.625rem" />
            {timeLabel}
          </button>
          <button
            onClick={onOpenPriceFilter}
            className={`px-3 py-2 rounded-xl text-[0.5625rem] font-bold uppercase border flex items-center gap-2 ${maxPrice !== null ? 'bg-[#FFD300] text-black' : 'bg-zinc-900 text-zinc-400 border-white/5'}`}
          >
            <DollarSign size="0.625rem" />
            {maxPrice !== null ? `Até R$ ${maxPrice}` : 'Preço'}
          </button>
        </div>
      )}
      {/* Filtros — Benefícios: cidade, período (sem preço, sem estilo) */}
      {activeTab === 'BENEFICIOS' && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onOpenCityFilter}
            className={`px-3 py-2 rounded-xl text-[0.5625rem] font-bold uppercase border flex items-center gap-2 ${selectedCities.length > 0 ? 'bg-[#FFD300] text-black' : 'bg-zinc-900 text-zinc-400 border-white/5'}`}
          >
            <MapPin size="0.625rem" />
            {cityLabel}
          </button>
          <button
            aria-label="Calendário"
            onClick={onOpenTimeFilter}
            className={`px-3 py-2 rounded-xl text-[0.5625rem] font-bold uppercase border flex items-center gap-2 ${selectedTimeFilter ? 'bg-[#FFD300] text-black' : 'bg-zinc-900 text-zinc-400 border-white/5'}`}
          >
            <Calendar size="0.625rem" />
            {timeLabel}
          </button>
        </div>
      )}
    </div>
  );
};
