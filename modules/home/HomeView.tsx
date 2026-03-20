import React, { useMemo, useCallback, useState } from 'react';
import { Evento } from '../../types';
import { Highlights } from './components/Highlights';
import { LazySection } from './components/LazySection';
import { ProximosEventosSection } from './components/ProximosEventosSection';
import { MaisVendidosSection } from './components/MaisVendidosSection';
import { LocaisParceiroSection } from './components/LocaisParceiroSection';
import { DescubraCidadesSection } from './components/DescubraCidadesSection';
import { IndicaPraVoceSection } from './components/IndicaPraVoceSection';
import { BeneficiosMVSection } from './components/BeneficiosMVSection';
import { TYPOGRAPHY } from '../../constants';
import { MapPin, Search, Crown } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
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
  onOpenAllEvents?: (cidade: string) => void;
  onOpenAllPartners?: (cidade: string) => void;
  onOpenAllBeneficios?: (cidade: string) => void;
  onOpenCityView?: (cidade: string) => void;
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
  onOpenAllEvents,
  onOpenAllPartners,
  onOpenAllBeneficios,
  onOpenCityView,
}) => {
  const selectedCity = useAuthStore(s => s.selectedCity);
  const userName = useAuthStore(s => s.currentAccount.nome);
  const isGuest = useAuthStore(s => s.currentAccount.role) === 'vanta_guest';
  const userId = useAuthStore(s => s.currentAccount.id);
  const isMembroMV = useMemo(() => (!isGuest && userId ? clubeService.isMembro(userId) : false), [isGuest, userId]);
  const onRefresh = useExtrasStore(s => s.refreshEvents);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);

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

  const firstName = isGuest ? undefined : userName?.split(' ')[0];

  return (
    <div
      className="animate-in fade-in duration-500 overflow-y-auto no-scrollbar"
      style={{ paddingBottom: 'calc(44px + env(safe-area-inset-bottom, 0px) * 0.5)' }}
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

      {/* Saudação — compacta, 1 linha */}
      <div className="px-5 pt-3 pb-1">
        <p className="text-sm text-zinc-400">
          {getGreeting()}
          {firstName ? `, ` : ''}
          {firstName && <span className="text-white font-semibold">{firstName}</span>}
          {isMembroMV && <Crown size="0.7rem" className="text-[#FFD300] ml-1 inline" />}
        </p>
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

      {/* Próximos Eventos */}
      {selectedCity && (
        <LazySection>
          <ProximosEventosSection
            cidade={selectedCity}
            userId={userId}
            onEventClick={onEventClick}
            onComunidadeClick={onComunidadeClick}
            onViewAll={() => onOpenAllEvents?.(selectedCity)}
          />
        </LazySection>
      )}

      {/* VANTA Indica pra Você */}
      {selectedCity && (
        <LazySection>
          <IndicaPraVoceSection
            cidade={selectedCity}
            onEventClick={onEventClick}
            onComunidadeClick={onComunidadeClick}
            onViewAll={onNavigateToSearch}
          />
        </LazySection>
      )}

      {/* Mais Vendidos 24h */}
      {selectedCity && (
        <LazySection>
          <MaisVendidosSection
            cidade={selectedCity}
            onEventClick={onEventClick}
            onComunidadeClick={onComunidadeClick}
          />
        </LazySection>
      )}

      {/* Locais Parceiros */}
      {selectedCity && onComunidadeClick && (
        <LazySection>
          <LocaisParceiroSection
            cidade={selectedCity}
            onComunidadeClick={onComunidadeClick}
            onViewAll={() => onOpenAllPartners?.(selectedCity)}
          />
        </LazySection>
      )}

      {/* Descubra Cidades */}
      {selectedCity && (
        <LazySection>
          <DescubraCidadesSection cidadeAtual={selectedCity} onCidadeClick={cidade => onOpenCityView?.(cidade)} />
        </LazySection>
      )}

      {/* Benefícios MAIS VANTA */}
      {selectedCity && (
        <LazySection>
          <BeneficiosMVSection
            cidade={selectedCity}
            onEventClick={onEventClick}
            onComunidadeClick={onComunidadeClick}
            onViewAll={() => onOpenAllBeneficios?.(selectedCity)}
          />
        </LazySection>
      )}

      {/* Empty State — quando não tem cidade selecionada */}
      {!selectedCity && (
        <div className="flex flex-col items-center justify-center px-8 py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#FFD300]/5 border border-[#FFD300]/10 flex items-center justify-center mb-5">
            <MapPin size="1.5rem" className="text-[#FFD300]" />
          </div>
          <h3 style={TYPOGRAPHY.screenTitle} className="text-xl text-white mb-2">
            Selecione uma cidade
          </h3>
          <p className="text-zinc-500 text-sm mb-8 max-w-[16rem] mx-auto leading-relaxed">
            Toque no seletor de cidade acima para explorar eventos perto de você.
          </p>
          <button
            onClick={onNavigateToSearch}
            className="flex items-center gap-2 bg-[#FFD300] text-black px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest active:scale-95 transition-all shadow-[0_0_20px_rgba(255,211,0,0.2)]"
          >
            <Search size="0.875rem" />
            Explorar
          </button>
        </div>
      )}
    </div>
  );
};
