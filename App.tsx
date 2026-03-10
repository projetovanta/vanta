import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Header, TabBar } from './components/Layout';
import { HomeView } from './modules/home/HomeView';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ModuleErrorBoundary } from './components/ModuleErrorBoundary';
import { ProfileSubView } from './types';
import type { Notificacao } from './types/auth';
import { useNavigation } from './hooks/useNavigation';
import { useAppHandlers } from './hooks/useAppHandlers';
import { useAuthStore } from './stores/authStore';
import { useTicketsStore } from './stores/ticketsStore';
import { useChatStore } from './stores/chatStore';
import { useSocialStore } from './stores/socialStore';
import { useExtrasStore } from './stores/extrasStore';
import { TYPOGRAPHY } from './constants';
import { Shield, PartyPopper, Gift, Star, ChevronRight, X } from 'lucide-react';
import { NotificationPanel } from './components/Home/NotificationPanel';
import { CitySelector } from './components/Home/CitySelector';
import { AppModals } from './components/AppModals';
import { SessionExpiredModal } from './components/SessionExpiredModal';
import { GlobalToastContainer } from './components/Toast';
import { usePWA } from './hooks/usePWA';
import { DevQuickLogin } from './components/DevQuickLogin';
import { trackAppOpen, checkPmfEligible } from './services/analyticsService';
import { PmfSurveyModal } from './components/PmfSurveyModal';
import { ResetPasswordView } from './components/ResetPasswordView';
import { nativePushService } from './services/nativePushService';
import { logger } from './services/logger';

// ── Lazy-loaded views (code splitting) ───────────────────────────────────────
const EventDetailView = lazy(() =>
  import('./modules/event-detail/EventDetailView').then(m => ({ default: m.EventDetailView })),
);
const RadarView = lazy(() => import('./modules/radar/RadarView').then(m => ({ default: m.RadarView })));
const SearchView = lazy(() => import('./modules/search/SearchView').then(m => ({ default: m.SearchView })));
const ProfileView = lazy(() => import('./modules/profile/ProfileView').then(m => ({ default: m.ProfileView })));
const MessagesView = lazy(() => import('./modules/messages/MessagesView').then(m => ({ default: m.MessagesView })));
const ChatRoomView = lazy(() =>
  import('./modules/messages/components/ChatRoomView').then(m => ({ default: m.ChatRoomView })),
);
const AdminGateway = lazy(() => import('./features/admin/AdminGateway').then(m => ({ default: m.AdminGateway })));
const PublicProfilePreviewView = lazy(() =>
  import('./modules/profile/PublicProfilePreviewView').then(m => ({ default: m.PublicProfilePreviewView })),
);
const WalletView = lazy(() => import('./modules/wallet/WalletView').then(m => ({ default: m.WalletView })));
const ComunidadePublicView = lazy(() =>
  import('./modules/community/ComunidadePublicView').then(m => ({ default: m.ComunidadePublicView })),
);
const MyTicketsView = lazy(() =>
  import('./features/tickets/views/MyTicketsView').then(m => ({ default: m.MyTicketsView })),
);
const AuthModal = lazy(() => import('./components/AuthModal').then(m => ({ default: m.AuthModal })));
const ConviteSocioModal = lazy(() =>
  import('./components/ConviteSocioModal').then(m => ({ default: m.ConviteSocioModal })),
);
const NegociacaoSocioView = lazy(() =>
  import('./features/admin/views/NegociacaoSocioView').then(m => ({ default: m.NegociacaoSocioView })),
);
const CheckoutPage = lazy(() => import('./modules/checkout/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const AceitarConviteMVPage = lazy(() =>
  import('./modules/convite/AceitarConviteMVPage').then(m => ({ default: m.AceitarConviteMVPage })),
);
const ParceiroDashboardPage = lazy(() =>
  import('./modules/parceiro/ParceiroDashboardPage').then(m => ({ default: m.ParceiroDashboardPage })),
);
const EventLandingPage = lazy(() =>
  import('./modules/landing/EventLandingPage').then(m => ({ default: m.EventLandingPage })),
);
const NotFoundView = lazy(() => import('./components/NotFoundView').then(m => ({ default: m.NotFoundView })));

// ── Limpeza única de localStorage ao inicializar (dados de desenvolvimento) ──
const _LS_CLEAN_KEY = 'vanta_ls_clean_v1';
if (!localStorage.getItem(_LS_CLEAN_KEY)) {
  const VANTA_KEYS = [
    'vanta_tickets_caixa',
    'vanta_saques',
    'vanta_guest_lists',
    'vanta_soberania',
    'vanta_notifications',
    'vanta_audit_logs',
    'vanta_selected_city',
  ];
  VANTA_KEYS.forEach(k => localStorage.removeItem(k));
  localStorage.setItem(_LS_CLEAN_KEY, '1');
}

export default function App() {
  const nav = useNavigation();
  const pwa = usePWA();
  const h = useAppHandlers(nav, pwa);

  // ── Store inits ────────────────────────────────────────────────────────────
  const initAuth = useAuthStore(s => s.init);
  const currentAccountId = useAuthStore(s => s.currentAccount.id);
  const authLoading = useAuthStore(s => s.authLoading);
  const ticketsInit = useTicketsStore(s => s.init);
  const chatInit = useChatStore(s => s.init);
  const socialInit = useSocialStore(s => s.init);
  const initEvents = useExtrasStore(s => s.initEvents);
  const initFavoritos = useExtrasStore(s => s.initFavoritos);
  const registerCortesiaCallbacks = useTicketsStore(s => s.registerCortesiaCallbacks);

  const [showResetPassword, setShowResetPassword] = useState(false);

  useEffect(() => {
    const handler = () => setShowResetPassword(true);
    window.addEventListener('vanta:password-recovery', handler);
    return () => window.removeEventListener('vanta:password-recovery', handler);
  }, []);

  // ── Native push listeners (Capacitor) ────────────────────────────────────
  useEffect(() => {
    nativePushService.setupNativeListeners(data => {
      const link = data.link || '';
      const tipo = (data.tipo || 'SISTEMA') as Notificacao['tipo'];
      // Reutiliza a mesma lógica de deep link do handler de notificações
      const fakeNotif = { id: '', titulo: '', mensagem: '', tipo, lida: true, link, timestamp: '' };
      h.handleNotificationActionClickComposite(fakeNotif);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => initAuth(), [initAuth]);

  // Guard: se authLoading ficar true por mais de 8s, força liberação como guest
  useEffect(() => {
    if (!authLoading) return;
    const guard = setTimeout(() => {
      if (useAuthStore.getState().authLoading) {
        logger.error('[App] authLoading stuck for 8s — forcing guest');
        useAuthStore.setState({ authLoading: false });
      }
    }, 8000);
    return () => clearTimeout(guard);
  }, [authLoading]);

  useEffect(() => ticketsInit(currentAccountId), [currentAccountId, ticketsInit]);
  useEffect(() => chatInit(currentAccountId), [currentAccountId, chatInit]);
  useEffect(() => socialInit(currentAccountId), [currentAccountId, socialInit]);
  useEffect(() => initEvents(), [initEvents]);
  useEffect(() => initFavoritos(currentAccountId), [currentAccountId, initFavoritos]);
  useEffect(() => {
    registerCortesiaCallbacks(h.addNotification);
  }, [registerCortesiaCallbacks, h.addNotification]);

  // ── Comemorar Aniversário (Vanta Indica) ──────────────────────────────────
  const [comemorarComunidadeId, setComemorarComunidadeId] = useState<string | null>(null);

  // ── Analytics: track app open + PMF survey ────────────────────────────────
  const [showPmf, setShowPmf] = useState(false);
  useEffect(() => {
    if (!currentAccountId) return;
    trackAppOpen(currentAccountId);
    const timer = setTimeout(() => {
      checkPmfEligible(currentAccountId).then(ok => {
        if (ok) setShowPmf(true);
      });
    }, 5000);
    return () => clearTimeout(timer);
  }, [currentAccountId]);

  // ── Prefetch lazy chunks das tabs mais prováveis ───────────────────────────
  useEffect(() => {
    const prefetch = () => {
      void import('./modules/event-detail/EventDetailView');
      void import('./modules/search/SearchView');
      void import('./modules/wallet/WalletView');
      void import('./modules/profile/ProfileView');
    };
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(prefetch);
      return () => cancelIdleCallback(id);
    }
    const timer = setTimeout(prefetch, 3000);
    return () => clearTimeout(timer);
  }, []);

  // ── Selectors para renderContent (mínimo necessário) ──────────────────────
  const chats = useChatStore(s => s.chats);

  // ── renderContent — conteúdo da tab ativa ─────────────────────────────────
  const renderContent = () => {
    if (nav.activeTab === 'MENSAGENS') {
      if (nav.profileSubView === 'CHAT_ROOM' && nav.selectedMember) {
        const chat = chats.find(c => c.participantId === nav.selectedMember?.id) || {
          id: nav.selectedMember.id,
          participantId: nav.selectedMember.id,
          lastMessage: '',
          lastMessageTime:
            new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00',
          unreadCount: 0,
          messages: [],
        };
        return (
          <ChatRoomView
            chat={chat}
            onBack={() => {
              nav.setProfileSubView('MAIN');
              nav.closeMemberProfile();
            }}
          />
        );
      }
      return (
        <ModuleErrorBoundary moduleName="Mensagens">
          <MessagesView onOpenChat={h.openChatRoom} />
        </ModuleErrorBoundary>
      );
    }

    if (
      (nav.profileSubView === 'PREVIEW_PUBLIC' || nav.profileSubView === 'PREVIEW_FRIENDS') &&
      nav.activeTab === 'PERFIL'
    ) {
      const status = nav.profileSubView === 'PREVIEW_FRIENDS' ? 'FRIENDS' : 'NONE';
      return (
        <PublicProfilePreviewView
          profile={h.profile}
          onBack={() => nav.setProfileSubView('MAIN')}
          isOwner={true}
          friendshipStatusOverride={status}
          onRequestFriendOverride={h.handleRequestFriendshipComposite}
          onOpenChat={h.openChatRoom}
          setProfilePreviewStatus={s => {
            nav.setProfileSubView(s === 'PUBLIC' ? 'PREVIEW_PUBLIC' : 'PREVIEW_FRIENDS');
            h.setProfilePreviewStatus(s);
          }}
          profilePreviewStatus={h.profilePreviewStatus}
        />
      );
    }

    if (nav.profileSubView === 'WALLET' && nav.activeTab === 'PERFIL') {
      return (
        <ModuleErrorBoundary moduleName="Wallet">
          <WalletView
            onGoToHome={() => nav.setProfileSubView('MAIN')}
            isSubView={true}
            onDevolverCortesia={h.handleDevolverCortesia}
            onTransferirIngresso={h.handleTransferirIngresso}
            onSuccess={h.showSuccess}
          />
        </ModuleErrorBoundary>
      );
    }

    if (nav.profileSubView === 'MY_TICKETS' && nav.activeTab === 'PERFIL') {
      return <MyTicketsView userId={h.currentAccount.id} onBack={() => nav.setProfileSubView('MAIN')} />;
    }

    switch (nav.activeTab) {
      case 'INICIO':
        return (
          <ModuleErrorBoundary moduleName="Home">
            <HomeView
              onEventClick={nav.openEventDetail}
              onNavigateToSearch={() => nav.navigateToTab('BUSCAR')}
              onNavigateToProfile={sub => {
                if (h.isGuest) {
                  h.setShowGuestModal(true);
                  return;
                }
                nav.navigateToTab('PERFIL');
                nav.setProfileSubView(sub as ProfileSubView);
              }}
              onOpenNotifications={() => {
                if (h.isGuest) {
                  h.setShowGuestModal(true);
                  return;
                }
                nav.setIsNotificationModalOpen(true);
              }}
              onEventoIndicaClick={id => {
                const ev = h.allEvents.find(e => e.id === id);
                if (ev) nav.openEventDetail(ev);
              }}
              onComunidadeClick={nav.openComunidade}
              onComemorarClick={comId => {
                if (h.isGuest) {
                  h.setShowGuestModal(true);
                  return;
                }
                setComemorarComunidadeId(comId || null);
              }}
            />
          </ModuleErrorBoundary>
        );
      case 'RADAR':
        return (
          <ModuleErrorBoundary moduleName="Radar">
            <RadarView onEventSelect={nav.openEventDetail} onNavigateToTab={nav.navigateToTab} />
          </ModuleErrorBoundary>
        );
      case 'BUSCAR':
        return (
          <ModuleErrorBoundary moduleName="Busca">
            <SearchView
              onEventClick={nav.openEventDetail}
              onMemberClick={h.guardedOpenMemberProfile}
              onComunidadeClick={nav.openComunidade}
            />
          </ModuleErrorBoundary>
        );
      case 'PERFIL':
        return (
          <ModuleErrorBoundary moduleName="Perfil">
            <ProfileView
              subView={nav.profileSubView}
              setSubView={nav.setProfileSubView}
              onUpdateProfile={h.handleUpdateProfile}
              onAdminClick={h.hasAdminAccess ? () => nav.navigateToTab('ADMIN_HUB') : undefined}
              showAdminGuide={h.showAdminGuide}
              onClearAdminGuide={() => h.setShowAdminGuide(false)}
              onLogout={() => {
                h.logout();
                nav.navigateToTab('INICIO');
                h.setShowLoginView(true);
              }}
              onEventClick={nav.openEventDetail}
              onSuccess={h.showSuccess}
              clubeConviteId={nav.clubeConviteId}
              onClearConviteId={() => nav.setClubeConviteId(null)}
            />
          </ModuleErrorBoundary>
        );
      case 'ADMIN_HUB': {
        const role = h.currentAccount.role;
        const accessNodes = useAuthStore.getState().accessNodes;
        const blocked = role === 'vanta_guest' || (role === 'vanta_member' && accessNodes.length === 0);
        if (blocked) {
          return (
            <div className="absolute inset-0 bg-[#0A0A0A] z-[150] flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-white/10">
                <Shield size={28} className="text-zinc-400" />
              </div>
              <h2 style={TYPOGRAPHY.screenTitle} className="text-xl italic mb-3">
                Sem Acesso
              </h2>
              <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-8">
                Você não possui cargos ativos em nenhum evento ou comunidade.
              </p>
              <button
                onClick={() => nav.navigateToTab('INICIO')}
                className="px-8 py-4 bg-zinc-900 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 active:scale-95 transition-all"
              >
                Voltar
              </button>
            </div>
          );
        }
        return (
          <ModuleErrorBoundary moduleName="Admin">
            <AdminGateway onBack={() => nav.navigateToTab('INICIO')} />
          </ModuleErrorBoundary>
        );
      }
      default:
        return null;
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center">
        <div className="w-full max-w-md flex flex-col items-center gap-6">
          <img
            src="/icon-192.png"
            alt="VANTA"
            className="w-20 h-20 rounded-2xl animate-spin"
            style={{ animationDuration: '2s' }}
          />
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">Carregando</span>
        </div>
      </div>
    );
  }

  // ── Layout ────────────────────────────────────────────────────────────────
  const isFocusView =
    (nav.activeTab === 'PERFIL' && nav.profileSubView !== 'MAIN') ||
    (nav.activeTab === 'MENSAGENS' && nav.profileSubView === 'CHAT_ROOM') ||
    nav.activeTab === 'ADMIN_HUB' ||
    !!nav.selectedMember;
  const showGlobalUI = !isFocusView;

  const suspenseFallback = (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#FFD300]/30 border-t-[#FFD300] rounded-full animate-spin" />
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-[#050505] flex flex-col items-center text-white selection:bg-[#FFD300] selection:text-black overflow-hidden"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div
        className={`w-full flex-1 bg-[#0A0A0A] relative overflow-hidden flex flex-col ${nav.activeTab === 'ADMIN_HUB' ? 'max-w-4xl' : 'max-w-md'}`}
      >
        {showResetPassword && (
          <div className="absolute inset-0 z-[500]">
            <ResetPasswordView
              onComplete={() => {
                setShowResetPassword(false);
                window.location.hash = '';
              }}
            />
          </div>
        )}
        <Suspense fallback={suspenseFallback}>
          <Routes>
            {/* ── Standalone pages (sem tab bar) ─────────────────────── */}
            <Route path="/checkout/:slug" element={<CheckoutPage />} />
            <Route path="/evento/:slug" element={<EventLandingPage />} />
            <Route path="/convite-mv/:token" element={<AceitarConviteMVPage />} />
            <Route path="/parceiro" element={<ParceiroDashboardPage />} />

            {/* ── App shell (com tab bar) ────────────────────────────── */}
            <Route
              path="*"
              element={
                <AppShell
                  nav={nav}
                  h={h}
                  isFocusView={isFocusView}
                  showGlobalUI={showGlobalUI}
                  renderContent={renderContent}
                  chats={chats}
                />
              }
            />
          </Routes>
          <AppModals
            isGuest={h.isGuest}
            userId={h.currentAccount.id}
            pwa={pwa}
            setShowAuthModal={h.setShowAuthModal}
            showLoginView={h.showLoginView}
            setShowLoginView={h.setShowLoginView}
            showGuestModal={h.showGuestModal}
            setShowGuestModal={h.setShowGuestModal}
            showSuccessModal={h.showSuccessModal}
            setShowSuccessModal={h.setShowSuccessModal}
            successMessage={h.successMessage}
            showProfileSuccess={h.showProfileSuccess}
            setShowProfileSuccess={h.setShowProfileSuccess}
            showOnboarding={h.showOnboarding}
            reviewTarget={h.reviewTarget}
            setReviewTarget={h.setReviewTarget}
            handleAuthSuccess={h.handleAuthSuccess}
            handleLoginSuccess={h.handleLoginSuccess}
            handleOnboardingComplete={h.handleOnboardingComplete}
            onRegisterFcm={() => pwa.registerFcmPush(h.currentAccount.id)}
          />
          <GlobalToastContainer />
          <SessionExpiredModal onLogin={() => h.setShowAuthModal(true)} />
          {h.showAuthModal && (
            <AuthModal isOpen onClose={() => h.setShowAuthModal(false)} onSuccess={h.handleAuthSuccess} />
          )}
          {showPmf && currentAccountId && (
            <PmfSurveyModal userId={currentAccountId} onClose={() => setShowPmf(false)} />
          )}
          {comemorarComunidadeId && (
            <div className="absolute inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
              <div className="w-full max-w-sm bg-zinc-900 rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                <div className="relative bg-gradient-to-br from-[#FFD300]/20 via-zinc-900 to-zinc-900 p-6 pb-4 text-center">
                  <button
                    onClick={() => setComemorarComunidadeId(null)}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                  <div className="w-16 h-16 rounded-full bg-[#FFD300]/10 flex items-center justify-center mx-auto mb-4">
                    <PartyPopper size={32} className="text-[#FFD300]" />
                  </div>
                  <h2 style={TYPOGRAPHY.screenTitle} className="text-xl mb-1">
                    Comemore com a gente
                  </h2>
                  <p className="text-zinc-400 text-xs">Seu aniversário merece ser especial</p>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FFD300]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Gift size={16} className="text-[#FFD300]" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">Cortesias exclusivas</p>
                      <p className="text-zinc-500 text-xs">Ganhe ingressos de cortesia pra você e seus convidados</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FFD300]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Star size={16} className="text-[#FFD300]" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">Tratamento VIP</p>
                      <p className="text-zinc-500 text-xs">Fila exclusiva e entrada antecipada no evento</p>
                    </div>
                  </div>
                </div>
                <div className="p-5 pt-2">
                  <button
                    onClick={() => {
                      const comId = comemorarComunidadeId;
                      setComemorarComunidadeId(null);
                      nav.openComunidade(comId);
                    }}
                    className="w-full bg-[#FFD300] text-black font-black text-sm py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
                  >
                    Quero comemorar
                    <ChevronRight size={18} />
                  </button>
                  <p className="text-zinc-600 text-[10px] text-center mt-3">
                    Você será levado à página do espaço para preencher sua solicitação
                  </p>
                </div>
              </div>
            </div>
          )}
          {h.conviteSocioEventoId && (
            <NegociacaoSocioView
              eventoId={h.conviteSocioEventoId}
              userId={h.currentAccount.id}
              papel={h.negociacaoPapel}
              onClose={() => h.setConviteSocioEventoId(null)}
              onSuccess={msg => {
                h.setConviteSocioEventoId(null);
                h.showSuccess(msg);
              }}
            />
          )}
        </Suspense>
      </div>
      {import.meta.env.DEV && <DevQuickLogin />}
    </div>
  );
}

// ── AppShell — layout com Header + TabBar + overlays ─────────────────────────
function AppShell({
  nav,
  h,
  isFocusView,
  showGlobalUI,
  renderContent,
  chats: _chats,
}: {
  nav: ReturnType<typeof useNavigation>;
  h: ReturnType<typeof useAppHandlers>;
  isFocusView: boolean;
  showGlobalUI: boolean;
  renderContent: () => React.ReactNode;
  chats: unknown[];
}) {
  return (
    <>
      <div
        className={`flex-1 flex flex-col overflow-hidden ${nav.selectedMember && nav.activeTab !== 'MENSAGENS' ? 'hidden' : ''}`}
      >
        {nav.selectedEvent ? (
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <ModuleErrorBoundary moduleName="EventDetail">
              <EventDetailView
                evento={nav.selectedEvent}
                onBack={nav.closeEventDetail}
                onBuy={h.handleBuyTicketComposite}
                onConfirmarPresenca={h.handlePresencaComposite}
                onMemberClick={h.guardedOpenMemberProfile}
                onComunidadeClick={nav.openComunidade}
                onSuccess={h.showSuccess}
              />
            </ModuleErrorBoundary>
          </div>
        ) : (
          <>
            {!isFocusView && nav.activeTab === 'INICIO' && (
              <Header
                onProfileClick={() => h.guestNavigateToTab('PERFIL')}
                onCityClick={() => nav.setIsCityModalOpen(true)}
                onNotificationClick={() =>
                  h.isGuest ? h.setShowGuestModal(true) : nav.setIsNotificationModalOpen(true)
                }
                showAdmin={h.hasAdminAccess}
                onAdminClick={() => nav.navigateToTab('ADMIN_HUB')}
                isCitySelectorOpen={nav.isCityModalOpen}
              />
            )}
            <main
              ref={el => {
                nav.mainScrollRef.current = el;
              }}
              className={`flex-1 min-h-0 relative ${isFocusView ? 'overflow-hidden' : 'overflow-y-auto no-scrollbar'}`}
            >
              {renderContent()}
            </main>
            {showGlobalUI && <TabBar activeTab={nav.activeTab} setActiveTab={h.guestNavigateToTab} />}
            <NotificationPanel
              isOpen={nav.isNotificationModalOpen}
              onClose={() => {
                h.markAllNotificationsAsRead();
                nav.setIsNotificationModalOpen(false);
              }}
              onNotificationAction={h.handleNotificationActionClickComposite}
              onMemberClick={h.guardedOpenMemberProfile}
            />
            <CitySelector isOpen={nav.isCityModalOpen} onClose={() => nav.setIsCityModalOpen(false)} />
          </>
        )}
      </div>
      {nav.selectedMember && nav.activeTab !== 'MENSAGENS' && (
        <div className="absolute inset-0 z-[200] bg-[#050505] animate-in slide-in-from-right duration-300 overflow-y-auto no-scrollbar">
          <PublicProfilePreviewView
            profile={nav.selectedMember}
            onBack={nav.closeMemberProfile}
            isOwner={nav.selectedMember.id === h.currentAccount.id}
            onRequestFriendOverride={h.handleRequestFriendshipComposite}
            onOpenChat={h.openChatRoom}
          />
        </div>
      )}
      {nav.selectedComunidadeId && (
        <div className="absolute inset-0 z-[180] animate-in slide-in-from-right duration-300 overflow-hidden">
          <ComunidadePublicView
            comunidadeId={nav.selectedComunidadeId}
            onBack={nav.closeComunidade}
            onEventClick={nav.openEventDetail}
            onMemberClick={h.guardedOpenMemberProfile}
            onRequestLogin={() => h.setShowLoginView(true)}
            onRequestCadastro={() => h.setShowAuthModal(true)}
          />
          {nav.selectedEvent && (
            <div className="absolute inset-0 animate-in slide-in-from-right duration-300 overflow-y-auto no-scrollbar">
              <ModuleErrorBoundary moduleName="EventDetail">
                <EventDetailView
                  evento={nav.selectedEvent}
                  onBack={nav.closeEventDetail}
                  onBuy={h.handleBuyTicketComposite}
                  onConfirmarPresenca={h.handlePresencaComposite}
                  onMemberClick={h.guardedOpenMemberProfile}
                  onComunidadeClick={nav.openComunidade}
                  onSuccess={h.showSuccess}
                />
              </ModuleErrorBoundary>
            </div>
          )}
        </div>
      )}
    </>
  );
}
