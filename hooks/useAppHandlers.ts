import { useState, useEffect, useCallback } from 'react';
import { Evento, Ingresso, Membro, Notificacao, TabState, ContaVantaLegacy, ProfileSubView } from '../types';
import { useAuthStore } from '../stores/authStore';
import { useTicketsStore } from '../stores/ticketsStore';
import { useExtrasStore } from '../stores/extrasStore';
import { useSocialStore } from '../stores/socialStore';
import { useChatStore } from '../stores/chatStore';
import { vantaService } from '../services/vantaService';
import { supabase } from '../services/supabaseClient';
import type { useNavigation } from './useNavigation';
import type { usePWA } from './usePWA';

type Nav = ReturnType<typeof useNavigation>;
type PWA = ReturnType<typeof usePWA>;

/** Deep link pendente para o AdminGateway pré-selecionar comunidade/evento */
export const adminDeepLink: { tenantId: string | null; tenantTipo: 'COMUNIDADE' | 'EVENTO' | null } = {
  tenantId: null,
  tenantTipo: null,
};

const ROLES_COM_PORTAL_DIRETO: ContaVantaLegacy[] = ['vanta_masteradm'];

export const useAppHandlers = (nav: Nav, pwa: PWA) => {
  // ── Store selectors (atômicos) ───────────────────────────────────────────
  const currentAccount = useAuthStore(s => s.currentAccount);
  const profile = useAuthStore(s => s.profile);
  const accessNodes = useAuthStore(s => s.accessNodes);
  const registerUser = useAuthStore(s => s.registerUser);
  const loginWithMembro = useAuthStore(s => s.loginWithMembro);
  const logout = useAuthStore(s => s.logout);
  const updateProfileStore = useAuthStore(s => s.updateProfile);
  const addNotification = useAuthStore(s => s.addNotification);
  const handleNotificationAction = useAuthStore(s => s.handleNotificationAction);
  const markAllNotificationsAsRead = useAuthStore(s => s.markAllNotificationsAsRead);
  const notifications = useAuthStore(s => s.notifications);
  const authLoading = useAuthStore(s => s.authLoading);

  const devolverCortesia = useTicketsStore(s => s.devolverCortesia);
  const transferirIngresso = useTicketsStore(s => s.transferirIngresso);
  const cortesiasPendentes = useTicketsStore(s => s.cortesiasPendentes);

  const allEvents = useExtrasStore(s => s.allEvents);
  const confirmarPresenca = useExtrasStore(s => s.confirmarPresenca);
  const addExternalTicket = useExtrasStore(s => s.addExternalTicket);

  const requestFriendship = useSocialStore(s => s.requestFriendship);

  const ensureChatExists = useChatStore(s => s.ensureChatExists);
  const markChatAsRead = useChatStore(s => s.markChatAsRead);

  // ── Modal states ─────────────────────────────────────────────────────────
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLoginView, setShowLoginView] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAdminGuide, setShowAdminGuide] = useState(false);
  const [showProfileSuccess, setShowProfileSuccess] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<{ eventoId: string; eventoNome: string } | null>(null);
  const [profilePreviewStatus, setProfilePreviewStatus] = useState<'PUBLIC' | 'FRIENDS'>('PUBLIC');

  // ── Derivados ────────────────────────────────────────────────────────────
  const isGuest = currentAccount.role === 'vanta_guest';
  const hasAdminAccess = !isGuest && (ROLES_COM_PORTAL_DIRETO.includes(currentAccount.role) || accessNodes.length > 0);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const requireAuth =
    <T extends unknown[]>(fn: (...args: T) => void) =>
    (...args: T) => {
      if (isGuest) {
        setShowGuestModal(true);
        return;
      }
      fn(...args);
    };

  const showSuccess = useCallback((msg: string) => {
    setSuccessMessage(msg);
    setShowSuccessModal(true);
  }, []);

  // ── Handlers compostos ───────────────────────────────────────────────────
  const handleBuyTicketComposite = requireAuth((e: Evento) => {
    window.open(`/checkout/${e.id}`, '_blank');
  });

  const handleDevolverCortesia = (ticket: Ingresso) => {
    devolverCortesia(ticket);
    showSuccess('Cortesia devolvida com sucesso! O saldo foi restaurado ao pool.');
  };

  const handleTransferirIngresso = async (ticket: Ingresso, destinatarioId: string, destinatarioNome: string) => {
    const ok = await transferirIngresso(ticket, destinatarioId, destinatarioNome);
    if (ok) {
      showSuccess(`Ingresso transferido para ${destinatarioNome}! Ele receberá na carteira dele.`);
    }
  };

  const handlePresencaComposite = (e: Evento): boolean | void => {
    if (isGuest) {
      setShowGuestModal(true);
      return false;
    }
    confirmarPresenca(e);
  };

  const handleAuthSuccess = (novaMembro: Membro) => {
    registerUser(novaMembro);
    setShowAuthModal(false);
    setShowLoginView(false);
    showSuccess('Bem-vindo à VANTA! Seu cadastro foi realizado com sucesso.');
  };

  const handleLoginSuccess = (membro: Membro) => {
    loginWithMembro(membro);
    setShowLoginView(false);
    if (pwa.notifPermission === 'granted') {
      pwa.registerFcmPush(membro.id);
    }
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('vanta_onboarding_done', '1');
    setShowOnboarding(false);
  };

  const handleUpdateProfile = (data: Partial<Membro>) => {
    updateProfileStore(data);
    setShowProfileSuccess(true);
    nav.setProfileSubView('MAIN');
  };

  const guardedOpenMemberProfile = requireAuth((m: Membro) => {
    if (m.id === currentAccount.id) {
      // É o próprio usuário — ir para tab PERFIL
      nav.navigateToTab('PERFIL');
      return;
    }
    nav.openMemberProfile(m);
  });

  const openChatRoom = (member: Membro) => {
    ensureChatExists(member.id, member);
    markChatAsRead(member.id);
    const setChatView = () => {
      nav.openMemberProfile(member);
      nav.setProfileSubView('CHAT_ROOM');
    };
    if (nav.activeTab !== 'MENSAGENS') {
      nav.navigateToTab('MENSAGENS');
      // navigateToTab reseta selectedMember/profileSubView — setar no próximo frame
      requestAnimationFrame(setChatView);
    } else {
      setChatView();
    }
  };

  const guestNavigateToTab = (tab: TabState) => {
    const BLOCKED: TabState[] = ['MENSAGENS', 'PERFIL', 'ADMIN_HUB'];
    if (isGuest && BLOCKED.includes(tab)) {
      setShowGuestModal(true);
      return;
    }
    nav.navigateToTab(tab);
  };

  const handleNotificationActionClickComposite = (n: Notificacao) => {
    handleNotificationAction(n);
    nav.setIsNotificationModalOpen(false);

    if (n.link === 'ADMIN_ACCESS_GUIDE') {
      nav.navigateToTab('PERFIL');
      setShowAdminGuide(true);
      return;
    }
    if (n.link === 'ADMIN_HUB') {
      nav.navigateToTab('ADMIN_HUB');
      return;
    }
    if (n.link === 'GESTAO_COMPROVANTES') {
      nav.navigateToTab('ADMIN_HUB');
      return;
    }
    if (n.link?.startsWith('/admin/')) {
      const comMatch = n.link.match(/^\/admin\/comunidade\/(.+)$/);
      const evtMatch = n.link.match(/^\/admin\/evento\/(.+)$/);
      if (comMatch) {
        adminDeepLink.tenantId = comMatch[1];
        adminDeepLink.tenantTipo = 'COMUNIDADE';
      } else if (evtMatch) {
        adminDeepLink.tenantId = evtMatch[1];
        adminDeepLink.tenantTipo = 'EVENTO';
      }
      nav.navigateToTab('ADMIN_HUB');
      return;
    }
    if (n.link === 'WALLET') {
      nav.navigateToTab('PERFIL');
      nav.setProfileSubView('WALLET');
      return;
    }
    if (n.link === 'EDIT_PROFILE') {
      nav.navigateToTab('PERFIL');
      nav.setProfileSubView('EDIT_PROFILE');
      return;
    }
    if (n.link === 'CLUBE') {
      nav.navigateToTab('PERFIL');
      nav.setProfileSubView('CLUBE');
      return;
    }
    if (n.link.startsWith('CLUBE_CONVITE:')) {
      const cId = n.link.split(':')[1];
      nav.navigateToTab('PERFIL');
      nav.setProfileSubView('CLUBE');
      if (cId) nav.setClubeConviteId(cId);
      return;
    }
    if (n.link.startsWith('comunidade:')) {
      const comId = n.link.split(':')[1];
      if (comId) nav.openComunidade(comId);
      return;
    }

    // Helper: busca evento no cache local ou no Supabase on-demand
    const openEventByLink = (link: string, fallbackTab?: TabState) => {
      const cached = allEvents.find(e => e.id === link);
      if (cached) {
        nav.openEventDetail(cached);
        return;
      }
      if (link) {
        void vantaService.getEventoById(link).then(ev => {
          if (ev) nav.openEventDetail(ev);
          else if (fallbackTab) nav.navigateToTab(fallbackTab);
        });
      } else if (fallbackTab) {
        nav.navigateToTab(fallbackTab);
      }
    };

    switch (n.tipo) {
      case 'EVENTO': {
        openEventByLink(n.link, 'INICIO');
        break;
      }
      case 'CORTESIA_PENDENTE': {
        nav.navigateToTab('PERFIL');
        nav.setProfileSubView('WALLET');
        break;
      }
      case 'SISTEMA': {
        if (n.link) {
          openEventByLink(n.link);
        } else {
          nav.navigateToTab('PERFIL');
          nav.setProfileSubView('WALLET');
        }
        break;
      }
      case 'SOCIO_ADICIONADO':
      case 'CONVITE_SOCIO': {
        // Abre o dashboard do evento no painel admin
        if (n.link) {
          openEventByLink(n.link);
        }
        break;
      }
      case 'REVIEW':
      case 'PEDIR_REVIEW': {
        const reviewEvent = allEvents.find(e => e.id === n.link);
        setReviewTarget({ eventoId: n.link, eventoNome: reviewEvent?.titulo ?? 'Evento' });
        break;
      }
      case 'FRIEND_REQUEST':
      case 'FRIEND_ACCEPTED':
      case 'AMIGO':
      case 'ANIVERSARIO': {
        const fakeMembro = { id: n.link, nome: n.titulo, foto: '' } as Membro;
        guardedOpenMemberProfile(fakeMembro);
        break;
      }
      case 'MENSAGEM_NOVA': {
        // link = partnerId — abre o chat
        const chatMembro = {
          id: n.link,
          nome: n.titulo.replace(/^Nova mensagem de /, '').replace(/\s*\(\d+\)$/, ''),
          foto: '',
        } as Membro;
        openChatRoom(chatMembro);
        break;
      }
      case 'TRANSFERENCIA_PENDENTE':
      case 'INGRESSO':
      case 'COMPRA_CONFIRMADA': {
        nav.navigateToTab('PERFIL');
        nav.setProfileSubView('WALLET');
        break;
      }
      case 'MAIS_VANTA': {
        nav.navigateToTab('PERFIL');
        nav.setProfileSubView('CLUBE');
        break;
      }
      case 'CARGO_ATRIBUIDO':
      case 'CARGO_REMOVIDO': {
        openEventByLink(n.link, 'PERFIL');
        break;
      }
      case 'EVENTO_APROVADO':
      case 'EVENTO_RECUSADO':
      case 'EVENTO_PENDENTE':
      case 'EVENTO_CANCELADO':
      case 'EVENTO_FINALIZADO': {
        openEventByLink(n.link, 'ADMIN_HUB');
        break;
      }
      case 'SAQUE_SOLICITADO':
      case 'SAQUE_AUTORIZADO':
      case 'SAQUE_APROVADO':
      case 'SAQUE_RECUSADO':
      case 'REEMBOLSO_SOLICITADO':
      case 'REEMBOLSO_APROVADO':
      case 'REEMBOLSO_RECUSADO': {
        nav.navigateToTab('ADMIN_HUB');
        break;
      }
      case 'COTA_RECEBIDA': {
        nav.navigateToTab('ADMIN_HUB');
        break;
      }
      case 'ALERTA_LOTACAO': {
        // Link contém eventoId — abre admin do evento
        if (n.link?.startsWith('/admin/')) {
          const comMatch = n.link.match(/^\/admin\/comunidade\/(.+)$/);
          if (comMatch) {
            adminDeepLink.tenantId = comMatch[1];
            adminDeepLink.tenantTipo = 'COMUNIDADE';
          }
        }
        nav.navigateToTab('ADMIN_HUB');
        break;
      }
      default:
        break;
    }
  };

  const handleRequestFriendshipComposite = (id: string) => {
    requestFriendship(id);
    showSuccess('Solicitação de amizade enviada!');
  };

  // ── BroadcastChannel listener (checkout → app) ──────────────────────────
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('vanta_tickets');
      bc.onmessage = (ev: MessageEvent) => {
        if (ev.data?.type === 'VANTA_TICKET_PURCHASED') {
          const tickets: Ingresso[] = ev.data.tickets ?? (ev.data.ticket ? [ev.data.ticket] : []);
          tickets.forEach(t => addExternalTicket(t));
          if (tickets.length > 0) {
            showSuccess(
              `${tickets.length} ingresso${tickets.length !== 1 ? 's' : ''} confirmado${tickets.length !== 1 ? 's' : ''}! Verifique sua carteira.`,
            );
          }
        }
      };
    } catch {
      /* BroadcastChannel not supported */
    }
    return () => {
      bc?.close();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Onboarding auto-trigger ──────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && currentAccount.id && currentAccount.role !== 'vanta_guest') {
      if (!localStorage.getItem('vanta_onboarding_done')) {
        setShowOnboarding(true);
      }
    }
  }, [authLoading, currentAccount.id, currentAccount.role]);

  return {
    // derivados
    isGuest,
    hasAdminAccess,
    // modal states
    showSuccessModal,
    setShowSuccessModal,
    successMessage,
    showAuthModal,
    setShowAuthModal,
    showLoginView,
    setShowLoginView,
    showGuestModal,
    setShowGuestModal,
    showOnboarding,
    showAdminGuide,
    setShowAdminGuide,
    showProfileSuccess,
    setShowProfileSuccess,
    reviewTarget,
    setReviewTarget,
    profilePreviewStatus,
    setProfilePreviewStatus,
    // handlers
    showSuccess,
    handleBuyTicketComposite,
    handleDevolverCortesia,
    handleTransferirIngresso,
    handlePresencaComposite,
    handleAuthSuccess,
    handleLoginSuccess,
    handleOnboardingComplete,
    handleUpdateProfile,
    handleNotificationActionClickComposite,
    handleRequestFriendshipComposite,
    guardedOpenMemberProfile,
    openChatRoom,
    guestNavigateToTab,
    // store refs needed by App
    addNotification,
    markAllNotificationsAsRead,
    notifications,
    cortesiasPendentes,
    logout,
    profile,
    currentAccount,
    allEvents,
  };
};
