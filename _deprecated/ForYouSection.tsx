import React, { useMemo } from 'react';
import { Zap } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { Evento, Ingresso } from '../../../types';
import { EventCarousel } from './EventCarousel';
import { sortEvents } from '../../../utils';

export const ForYouSection: React.FC<{
  eventos: Evento[];
  tickets: Ingresso[];
  presencaIds: string[];
  onEventClick: (e: Evento) => void;
  onComunidadeClick?: (id: string) => void;
  showCityInsteadOfLocal?: boolean;
}> = React.memo(({ eventos, tickets, presencaIds, onEventClick, onComunidadeClick, showCityInsteadOfLocal }) => {
  const recommended = useMemo(() => {
    // Calcula formatos/categorias mais frequentados pelo usuário
    const attendedIds = new Set([...tickets.map(t => t.eventoId), ...presencaIds]);
    if (attendedIds.size === 0) return [];

    const formatCount = new Map<string, number>();
    eventos.forEach(e => {
      if (attendedIds.has(e.id)) {
        const fmt = e.formato || e.categoria || '';
        if (fmt) formatCount.set(fmt, (formatCount.get(fmt) ?? 0) + 1);
      }
    });

    if (formatCount.size === 0) return [];

    // Ordena formatos por frequência
    const topFormats = [...formatCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([f]) => f);

    const topFormatSet = new Set(topFormats);
    const todayISO = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });

    // Recomenda eventos futuros dos formatos favoritos que o usuário NÃO tem ingresso
    return sortEvents(
      eventos.filter(e => {
        const fmt = e.formato || e.categoria || '';
        return topFormatSet.has(fmt) && e.dataReal >= todayISO && !attendedIds.has(e.id);
      }),
    ).slice(0, 12);
  }, [eventos, tickets, presencaIds]);

  if (recommended.length === 0) return null;

  return (
    <div className="py-4 w-full">
      <div className="flex items-center gap-2 px-5 mb-3">
        <Zap size="0.875rem" className="text-[#FFD300]" />
        <h3 style={TYPOGRAPHY.sectionKicker} className="text-sm">
          Para Você
        </h3>
      </div>
      <EventCarousel
        eventos={recommended}
        onEventClick={onEventClick}
        onComunidadeClick={onComunidadeClick}
        showCityInsteadOfLocal={showCityInsteadOfLocal}
      />
    </div>
  );
});
