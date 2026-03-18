import React, { useMemo, useCallback, useState } from 'react';
import { Evento } from '../../types';
import { EventFeed } from './components/EventFeed';
import { Highlights } from './components/Highlights';
import { EventCardSkeleton } from '../../components/Skeleton';
import { LiveNowSection } from './components/LiveNowSection';
import { NearYouSection } from './components/NearYouSection';
import { ThisWeekSection } from './components/ThisWeekSection';
import { ForYouSection } from './components/ForYouSection';
import { FriendsGoingSection } from './components/FriendsGoingSection';
import { LazySection } from './components/LazySection';
import { isEventHappeningNow, sortEvents } from '../../utils';
import { TYPOGRAPHY } from '../../constants';
import { MapPin, Search, Crown } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useTicketsStore } from '../../stores/ticketsStore';
import { useExtrasStore } from '../../stores/extrasStore';
import { clubeService } from '../../features/admin/services/clubeService';

interface HomeViewProps {
  onEventClick: (e: Evento) => void;
  onNavigateToSearch: () => void;
  onNavigateToProfile: (sub: string) => void;
  onNavigateToTab?: (tab: string) => void;
  onOpenNotifications?: () => void;
  onEventoIndicaClick?: (eventoId: string) => void;
  onComunidadeClick?: (id: string) => void;
  onComemorarClick?: (comunidadeId?: string) => void;
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
  onNavigateToTab,
  onOpenNotifications,
  onEventoIndicaClick,
  onComunidadeClick,
  onComemorarClick,
}) => {
  const selectedCity = useAuthStore(s => s.selectedCity);
  const userName = useAuthStore(s => s.currentAccount.nome);
  const isGuest = useAuthStore(s => s.currentAccount.role) === 'vanta_guest';
  const userId = useAuthStore(s => s.currentAccount.id);
  const isMembroMV = useMemo(() => (!isGuest && userId ? clubeService.isMembro(userId) : false), [isGuest, userId]);
  const tickets = useTicketsStore(s => s.myTickets);
  const presencaIds = useTicketsStore(s => s.myPresencas);
  const eventos = useExtrasStore(s => s.allEvents);
  const onRefresh = useExtrasStore(s => s.refreshEvents);
  const loadMoreEvents = useExtrasStore(s => s.loadMoreEvents);
  const hasMoreEvents = useExtrasStore(s => s.hasMoreEvents);
  const eventsLoading = useExtrasStore(s => s.eventsLoading);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);

  const liveEventos = useMemo(
    () => eventos.filter(e => isEventHappeningNow(e) && (!selectedCity || e.cidade === selectedCity)),
    [eventos, selectedCity],
  );

  const liveIds = useMemo(() => new Set(liveEventos.map(e => e.id)), [liveEventos]);

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
  const firstName = isGuest ? undefined : userName?.split(' ')[0];

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

      {/* Saudação — compacta */}
      <div className="px-5 pt-5 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <p className="text-sm text-zinc-400">
            {getGreeting()}
            {firstName ? `, ` : ''}
          </p>
          {firstName && <p className="text-sm text-white font-semibold">{firstName}</p>}
          {isMembroMV && <Crown size="0.7rem" className="text-[#FFD300] ml-0.5" />}
        </div>
        {!firstName && <p className="text-xs text-zinc-500">Descubra a noite</p>}
      </div>

      {/* Seus Benefícios — só membros MV */}
      {isMembroMV && (
        <div className="px-5 pb-4">
          <button
            onClick={() => onNavigateToProfile?.('CLUBE')}
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-[#FFD300]/8 to-[#FFD300]/3 border border-[#FFD300]/15 rounded-2xl active:scale-[0.97] transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-[#FFD300]/10 flex items-center justify-center shrink-0">
              <Crown size="0.875rem" className="text-[#FFD300]" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm text-white font-medium">Seus benefícios</span>
              <span className="text-[0.65rem] text-zinc-500">Exclusivos pra você</span>
            </div>
            <span className="ml-auto text-[#FFD300] text-xs font-bold tracking-wide">Ver →</span>
          </button>
        </div>
      )}

      {/* VANTA Indica (Highlights) */}
      <Highlights
        currentCity={selectedCity}
        onEventoClick={onEventoIndicaClick}
        onComemorarClick={onComemorarClick}
        onComunidadeClick={onComunidadeClick}
        onNavigateToTab={onNavigateToTab}
        onNavigateToProfile={onNavigateToProfile}
      />

      {/* Acontecendo Agora */}
      <LiveNowSection eventos={liveEventos} onEventClick={onEventClick} showCityInsteadOfLocal={!selectedCity} />

      {/* Amigos vão — só aparece se logado e tem amigos com ingresso */}
      <FriendsGoingSection
        eventos={eventos}
        onEventClick={onEventClick}
        onComunidadeClick={onComunidadeClick}
        showCityInsteadOfLocal={!selectedCity}
      />

      {/* Perto de você */}
      <LazySection>
        <NearYouSection
          eventos={cityEventos}
          onEventClick={onEventClick}
          onComunidadeClick={onComunidadeClick}
          showCityInsteadOfLocal={!selectedCity}
          excludeIds={liveIds}
        />
      </LazySection>

      {/* Esta semana */}
      <LazySection>
        <ThisWeekSection
          eventos={thisWeekEventos}
          onEventClick={onEventClick}
          onComunidadeClick={onComunidadeClick}
          showCityInsteadOfLocal={!selectedCity}
        />
      </LazySection>

      {/* Pra Você */}
      <LazySection>
        <ForYouSection
          eventos={eventos}
          tickets={tickets}
          presencaIds={presencaIds}
          onEventClick={onEventClick}
          onComunidadeClick={onComunidadeClick}
          showCityInsteadOfLocal={!selectedCity}
        />
      </LazySection>

      {/* Feed principal */}
      <LazySection>
        <EventFeed
          currentCity={selectedCity}
          eventos={eventos}
          onEventClick={onEventClick}
          onViewAll={onNavigateToSearch}
          onComunidadeClick={onComunidadeClick}
        />
      </LazySection>

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

      {/* Empty State */}
      {!hasAnyContent && !eventsLoading && (
        <div className="flex flex-col items-center justify-center px-8 py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#FFD300]/5 border border-[#FFD300]/10 flex items-center justify-center mb-5">
            <MapPin size="1.5rem" className="text-[#FFD300]" />
          </div>
          <h3 style={TYPOGRAPHY.screenTitle} className="text-xl text-white mb-2">
            Nenhum evento{selectedCity ? ` em ${selectedCity}` : ''}
          </h3>
          <p className="text-zinc-500 text-sm mb-8 max-w-[16rem] mx-auto leading-relaxed">
            {selectedCity
              ? 'Explore outras cidades ou volte depois — novos eventos aparecem toda semana.'
              : 'Novos eventos aparecem toda semana. Fique de olho!'}
          </p>
          {selectedCity && (
            <button
              onClick={onNavigateToSearch}
              className="flex items-center gap-2 bg-[#FFD300] text-black px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest active:scale-95 transition-all shadow-[0_0_20px_rgba(255,211,0,0.2)]"
            >
              <Search size="0.875rem" />
              Explorar
            </button>
          )}
        </div>
      )}
    </div>
  );
};
