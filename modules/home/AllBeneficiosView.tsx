import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { ArrowLeft, Crown } from 'lucide-react';
import { TYPOGRAPHY } from '../../constants';
import { Evento } from '../../types';
import { EventCard } from '../../components/EventCard';
import { EventCardSkeleton } from '../../components/Skeleton';
import { vantaService } from '../../services/vantaService';
import { useAuthStore } from '../../stores/authStore';
import { clubeService } from '../../features/admin/services/clubeService';

interface AllBeneficiosViewProps {
  cidade: string;
  onBack: () => void;
  onEventClick: (e: Evento) => void;
  onComunidadeClick?: (id: string) => void;
}

export const AllBeneficiosView: React.FC<AllBeneficiosViewProps> = ({
  cidade,
  onBack,
  onEventClick,
  onComunidadeClick,
}) => {
  const userId = useAuthStore(s => s.currentAccount.id);
  const tier = useMemo(() => (userId ? clubeService.getTier(userId) : null), [userId]);

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 20;

  const loadEvents = useCallback(
    async (offset: number, replace: boolean) => {
      if (!tier) return;
      setLoading(true);
      const result = await vantaService.getEventosComBeneficioMV(cidade, tier, undefined, PAGE_SIZE, offset);
      setEventos(prev => (replace ? result.eventos : [...prev, ...result.eventos]));
      setHasMore(result.eventos.length >= PAGE_SIZE);
      setLoading(false);
    },
    [cidade, tier],
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
      <div className="shrink-0 bg-[#0A0A0A] border-b border-white/5 px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="active:scale-90 transition-transform">
            <ArrowLeft size="1.25rem" className="text-white" />
          </button>
          <Crown size="1rem" className="text-[#FFD300]" />
          <h1 style={TYPOGRAPHY.screenTitle} className="text-xl text-white">
            Benefícios em {cidade}
          </h1>
        </div>
      </div>

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
            <p className="text-zinc-500 text-sm">Nenhum benefício disponível nesta cidade</p>
          </div>
        )}
      </div>
    </div>
  );
};
