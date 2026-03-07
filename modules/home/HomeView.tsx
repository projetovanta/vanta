import React, { useMemo, useCallback, useState } from 'react';
import { Evento } from '../../types';
import { EventFeed } from './components/EventFeed';
import { Highlights } from './components/Highlights';
import { SavedEventsSection } from './components/SavedEventsSection';
import { EventCardSkeleton } from '../../components/Skeleton';
import { LiveNowSection } from './components/LiveNowSection';
import { NearYouSection } from './components/NearYouSection';
import { ThisWeekSection } from './components/ThisWeekSection';
import { NewOnPlatformSection } from './components/NewOnPlatformSection';
import { QuickActions } from './components/QuickActions';
import { ForYouSection } from './components/ForYouSection';
import { FriendsGoingSection } from './components/FriendsGoingSection';
import { isEventHappeningNow, sortEvents } from '../../utils';
import { TYPOGRAPHY } from '../../constants';
import { MapPin, Search } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useTicketsStore } from '../../stores/ticketsStore';
import { useExtrasStore } from '../../stores/extrasStore';

interface HomeViewProps {
  onEventClick: (e: Evento) => void;
  onNavigateToSearch: () => void;
  onNavigateToProfile: (sub: string) => void;
  onOpenNotifications?: () => void;
  onEventoIndicaClick?: (eventoId: string) => void;
  onComunidadeClick?: (id: string) => void;
}

const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h < 6) return 'Boa madrugada';
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
};

export const HomeView: React.FC<HomeViewProps> = ({
  onEventClick,
  onNavigateToSearch,
  onNavigateToProfile,
  onOpenNotifications,
  onEventoIndicaClick,
  onComunidadeClick,
}) => {
  const selectedCity = useAuthStore(s => s.selectedCity);
  const userName = useAuthStore(s => s.currentAccount.nome);
  const tickets = useTicketsStore(s => s.myTickets);
  const presencaIds = useTicketsStore(s => s.myPresencas);
  const eventos = useExtrasStore(s => s.allEvents);
  const savedEventIds = useExtrasStore(s => s.savedEvents);
  const onRefresh = useExtrasStore(s => s.refreshEvents);
  const loadMoreEvents = useExtrasStore(s => s.loadMoreEvents);
  const hasMoreEvents = useExtrasStore(s => s.hasMoreEvents);
  const eventsLoading = useExtrasStore(s => s.eventsLoading);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);

  const savedEventos = useMemo(
    () => (savedEventIds ?? []).map(id => eventos.find(e => e.id === id)).filter(Boolean) as Evento[],
    [savedEventIds, eventos],
  );

  const liveEventos = useMemo(
    () => eventos.filter(e => isEventHappeningNow(e) && (!selectedCity || e.cidade === selectedCity)),
    [eventos, selectedCity],
  );

  const cityEventos = useMemo(
    () => eventos.filter(e => !selectedCity || e.cidade === selectedCity),
    [eventos, selectedCity],
  );

  // Esta semana: próximos 7 dias (excluindo "ao vivo" pra não duplicar)
  const thisWeekEventos = useMemo(() => {
    const todayISO = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
    const weekEnd = new Date(todayISO + 'T00:00:00-03:00');
    weekEnd.setDate(weekEnd.getDate() + 7);
    const weekEndISO = weekEnd.toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
    const liveIds = new Set(liveEventos.map(e => e.id));
    return sortEvents(
      cityEventos.filter(e => e.dataReal >= todayISO && e.dataReal <= weekEndISO && !liveIds.has(e.id)),
    ).slice(0, 15);
  }, [cityEventos, liveEventos]);

  // Novos na plataforma: comunidades com poucos eventos (1–2) = novos produtores
  const newOnPlatform = useMemo(() => {
    const comunidadeCount = new Map<string, number>();
    eventos.forEach(e => {
      if (e.comunidade?.id) comunidadeCount.set(e.comunidade.id, (comunidadeCount.get(e.comunidade.id) ?? 0) + 1);
    });
    const todayNow = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
    return cityEventos
      .filter(e => e.comunidade?.id && (comunidadeCount.get(e.comunidade.id) ?? 0) <= 2 && e.dataReal >= todayNow)
      .slice(0, 10);
  }, [cityEventos, eventos]);

  // Pull-to-refresh
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isRefreshing) return;
      const el = e.currentTarget;
      if (el.scrollTop > 0) return;
      const diff = e.touches[0].clientY - touchStartY;
      if (diff > 0) setPullDistance(Math.min(diff * 0.4, 80));
    },
    [touchStartY, isRefreshing],
  );

  const handleTouchEnd = useCallback(() => {
    if (pullDistance > 60 && onRefresh) {
      setIsRefreshing(true);
      onRefresh();
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
      }, 1500);
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, onRefresh]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (!hasMoreEvents) return;
      const el = e.currentTarget;
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 400) {
        loadMoreEvents();
      }
    },
    [hasMoreEvents, loadMoreEvents],
  );

  const hasAnyContent = cityEventos.length > 0;
  const firstName = userName?.split(' ')[0];

  return (
    <div
      className="animate-in fade-in duration-500 overflow-y-auto no-scrollbar"
      style={{ paddingBottom: 'calc(44px + env(safe-area-inset-bottom, 0px) * 0.5)' }}
      onScroll={handleScroll}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {pullDistance > 0 && (
        <div className="flex justify-center items-center transition-all" style={{ height: pullDistance }}>
          <div
            className={`w-6 h-6 border-2 border-[#FFD300] border-t-transparent rounded-full ${isRefreshing ? 'animate-spin' : ''}`}
            style={{ transform: `rotate(${pullDistance * 4}deg)` }}
          />
        </div>
      )}

      {/* Saudação personalizada — px-5 individual, carrossel com edge-bleed */}
      <div className="px-5 pt-6 pb-2">
        <p className="text-sm text-zinc-500">
          {getGreeting()}
          {firstName ? ',' : ''}
        </p>
        {firstName && (
          <h1 style={TYPOGRAPHY.screenTitle} className="text-2xl text-white">
            {firstName}
          </h1>
        )}
      </div>

      {/* Quick Actions */}
      <QuickActions
        onNavigateToProfile={onNavigateToProfile}
        onNavigateToSearch={onNavigateToSearch}
        ticketCount={tickets.filter(t => t.status === 'DISPONIVEL').length}
        savedCount={savedEventos.length}
      />

      {/* Notificação inline */}

      {/* Bloco de Destaques Horizontal */}
      <Highlights currentCity={selectedCity} onEventoClick={onEventoIndicaClick} />

      {/* Acontecendo Agora */}
      <LiveNowSection eventos={liveEventos} onEventClick={onEventClick} />

      {/* Amigos vão — só aparece se tem amigos com ingresso */}
      <FriendsGoingSection eventos={eventos} onEventClick={onEventClick} onComunidadeClick={onComunidadeClick} />

      {/* Perto de Você */}
      <NearYouSection eventos={cityEventos} onEventClick={onEventClick} onComunidadeClick={onComunidadeClick} />

      {/* Esta Semana */}
      <ThisWeekSection eventos={thisWeekEventos} onEventClick={onEventClick} onComunidadeClick={onComunidadeClick} />

      {/* Eventos Salvos */}
      <SavedEventsSection eventos={savedEventos} onEventClick={onEventClick} onComunidadeClick={onComunidadeClick} />

      {/* Novos na Plataforma */}
      <NewOnPlatformSection eventos={newOnPlatform} onEventClick={onEventClick} onComunidadeClick={onComunidadeClick} />

      {/* Para Você — recomendação personalizada */}
      <ForYouSection
        eventos={eventos}
        tickets={tickets}
        presencaIds={presencaIds}
        onEventClick={onEventClick}
        onComunidadeClick={onComunidadeClick}
      />

      {/* Feed de Eventos */}
      <EventFeed
        currentCity={selectedCity}
        eventos={eventos}
        onEventClick={onEventClick}
        onViewAll={onNavigateToSearch}
        onComunidadeClick={onComunidadeClick}
      />

      {/* Loading skeleton durante carregamento inicial */}
      {!hasAnyContent && eventos.length === 0 && eventsLoading && (
        <div className="px-5 space-y-3 py-6">
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
        </div>
      )}

      {/* Loading indicator durante infinite scroll */}
      {hasMoreEvents && eventsLoading && eventos.length > 0 && (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-2 border-[#FFD300] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty State — px-8 individual, não usar px global */}
      {!hasAnyContent && !eventsLoading && (
        <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center mb-4">
            <MapPin size={18} className="text-zinc-600" />
          </div>
          <h3 style={TYPOGRAPHY.screenTitle} className="text-lg text-white mb-2">
            Nenhum evento{selectedCity ? ` em ${selectedCity}` : ''}
          </h3>
          <p className="text-zinc-500 text-sm mb-6 max-w-[240px] mx-auto">
            {selectedCity
              ? 'Explore outras cidades ou volte depois — novos eventos aparecem toda semana.'
              : 'Novos eventos aparecem toda semana. Fique de olho!'}
          </p>
          {selectedCity && (
            <button
              onClick={onNavigateToSearch}
              className="flex items-center gap-2 bg-[#FFD300] text-black px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest active:scale-95 transition-transform"
            >
              <Search size={14} />
              Explorar
            </button>
          )}
        </div>
      )}
    </div>
  );
};
