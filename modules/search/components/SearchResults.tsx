import React, { useRef } from 'react';
import { Search, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Evento } from '../../../types';
import { TYPOGRAPHY } from '../../../constants';
import { getMinPrice } from '../../../utils';
import { OptimizedImage } from '../../../components/OptimizedImage';

// Escala com o font-size dinâmico: 5.75rem ≈ 92px@16px base
const getItemHeight = () => parseFloat(getComputedStyle(document.documentElement).fontSize) * 5.75;

export const SearchResults: React.FC<{
  results: Evento[];
  currentCity: string;
  isDefaultView: boolean;
  onEventClick: (e: Evento) => void;
  onClearSearch: () => void;
}> = ({ results, currentCity, isDefaultView, onEventClick, onClearSearch }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: results.length,
    getScrollElement: () => parentRef.current,
    estimateSize: getItemHeight,
    overscan: 5,
  });

  return (
    <div className="space-y-4">
      <h2 style={TYPOGRAPHY.uiLabel} className="mb-2">
        {isDefaultView
          ? currentCity
            ? `Próximos em ${currentCity}`
            : 'Próximos Eventos'
          : `${results.length} Resultados`}
      </h2>
      {results.length > 0 ? (
        <div
          ref={parentRef}
          className="flex-1 overflow-y-auto no-scrollbar"
          style={{ maxHeight: 'calc(100vh - 16.25rem)' }}
        >
          <div
            style={{
              height: virtualizer.getTotalSize(),
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map(virtualRow => {
              const evento = results[virtualRow.index];
              return (
                <div
                  key={evento.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: virtualRow.size,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="pb-2"
                >
                  <div
                    onClick={() => onEventClick(evento)}
                    className="bg-zinc-900 border border-white/5 rounded-2xl p-3 flex gap-4 cursor-pointer active:scale-95 transition-all h-full"
                  >
                    <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden">
                      <OptimizedImage
                        src={evento.imagem}
                        alt={evento.titulo || 'Evento'}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <span className="text-[0.5625rem] font-bold text-[#FFD300] uppercase tracking-wider mb-1">
                        {evento.formato || evento.categoria}
                      </span>
                      <h3 className="font-serif font-bold text-white truncate mb-1">{evento.titulo}</h3>
                      <div className="text-zinc-400 text-[0.625rem] truncate">
                        <MapPin size="0.625rem" className="inline mr-1" />
                        {evento.local}
                      </div>
                    </div>
                    <div className="flex items-center text-zinc-400">
                      <ArrowRight size="1rem" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-zinc-400">Nenhum evento encontrado.</p>
        </div>
      )}
    </div>
  );
};
