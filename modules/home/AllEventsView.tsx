import React, { useEffect, useState, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { TYPOGRAPHY } from '../../constants';
import { Evento } from '../../types';
import { EventCard } from '../../components/EventCard';
import { EventCardSkeleton } from '../../components/Skeleton';
import { vantaService } from '../../services/vantaService';

interface AllEventsViewProps {
  cidade: string;
  onBack: () => void;
  onEventClick: (e: Evento) => void;
  onComunidadeClick?: (id: string) => void;
}

export const AllEventsView: React.FC<AllEventsViewProps> = ({ cidade, onBack, onEventClick, onComunidadeClick }) => {
  const [tab, setTab] = useState<'futuros' | 'passados'>('futuros');
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 20;

  const loadEvents = useCallback(
    async (offset: number, replace: boolean) => {
      setLoading(true);
      const data = await vantaService.getEventosPorCidade(cidade, tab === 'futuros', PAGE_SIZE, offset);
      setEventos(prev => (replace ? data : [...prev, ...data]));
      setHasMore(data.length >= PAGE_SIZE);
      setLoading(false);
    },
    [cidade, tab],
  );

  useEffect(() => {
    setEventos([]);
    setHasMore(true);
    loadEvents(0, true);
  }, [loadEvents]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (!hasMore || loading) return;
      const el = e.currentTarget;
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 400) {
        loadEvents(eventos.length, false);
      }
    },
    [hasMore, loading, eventos.length, loadEvents],
  );

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-[#0A0A0A]">
      {/* Header */}
      <div className="shrink-0 bg-[#0A0A0A] border-b border-white/5 px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="active:scale-90 transition-transform">
            <ArrowLeft size="1.25rem" className="text-white" />
          </button>
          <h1 style={TYPOGRAPHY.screenTitle} className="text-xl text-white">
            Eventos em {cidade}
          </h1>
        </div>
        {/* Tabs */}
        <div className="flex gap-4 mt-4">
          {(['futuros', 'passados'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-xs font-bold uppercase tracking-widest pb-2 border-b-2 transition-colors ${
                tab === t ? 'text-[#FFD300] border-[#FFD300]' : 'text-zinc-500 border-transparent'
              }`}
            >
              {t === 'futuros' ? 'Próximos' : 'Passados'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4" onScroll={handleScroll}>
        <div className="grid grid-cols-2 gap-3">
          {eventos.map(e => (
            <EventCard key={e.id} evento={e} onClick={onEventClick} onComunidadeClick={onComunidadeClick} />
          ))}
        </div>
        {loading && (
          <div className="py-4 space-y-3">
            <EventCardSkeleton />
          </div>
        )}
        {!loading && eventos.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <p className="text-zinc-500 text-sm">
              {tab === 'futuros' ? 'Nenhum evento próximo' : 'Nenhum evento passado'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
