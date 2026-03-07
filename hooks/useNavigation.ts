import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Evento, TabState, ProfileSubView, Membro } from '../types';

/** Reseta scrollTop de um elemento (se existir) */
const resetScroll = (el: HTMLElement | null) => {
  if (el) el.scrollTop = 0;
};

/** Mapa tab → pathname */
const TAB_TO_PATH: Record<TabState, string> = {
  INICIO: '/',
  RADAR: '/radar',
  BUSCAR: '/buscar',
  MENSAGENS: '/mensagens',
  PERFIL: '/perfil',
  ADMIN_HUB: '/admin',
};

const PATH_TO_TAB: Record<string, TabState> = {
  '/': 'INICIO',
  '/radar': 'RADAR',
  '/buscar': 'BUSCAR',
  '/mensagens': 'MENSAGENS',
  '/perfil': 'PERFIL',
  '/admin': 'ADMIN_HUB',
};

/** Resolve a tab ativa a partir do pathname */
const resolveTab = (pathname: string): TabState => {
  // Match exato primeiro
  if (PATH_TO_TAB[pathname]) return PATH_TO_TAB[pathname];
  // Match por prefixo
  if (pathname.startsWith('/admin')) return 'ADMIN_HUB';
  if (pathname.startsWith('/perfil')) return 'PERFIL';
  if (pathname.startsWith('/mensagens')) return 'MENSAGENS';
  // Rotas de overlay (evento, comunidade, membro) — mantém tab anterior
  return 'INICIO';
};

export const useNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [profileSubView, setProfileSubView] = useState<ProfileSubView>('MAIN');
  const [selectedMember, setSelectedMember] = useState<Membro | null>(null);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);
  const [selectedComunidadeId, setSelectedComunidadeId] = useState<string | null>(null);
  const [clubeConviteId, setClubeConviteId] = useState<string | null>(null);
  const eventBeforeComunidadeRef = useRef<Evento | null>(null);

  // Tab ativa derivada do pathname
  const activeTab = resolveTab(location.pathname);

  // Ref do <main> scrollável — atribuído via mainRef no App.tsx
  const mainScrollRef = useRef<HTMLElement | null>(null);
  // Mapa de scroll positions salvas por tab (para restaurar ao voltar)
  const scrollPositions = useRef<Map<string, number>>(new Map());

  /** Salva posição de scroll atual da main */
  const saveScrollPosition = useCallback((key: string) => {
    if (mainScrollRef.current) {
      scrollPositions.current.set(key, mainScrollRef.current.scrollTop);
    }
  }, []);

  const openEventDetail = useCallback(
    (e: Evento) => {
      saveScrollPosition(activeTab);
      setSelectedEvent(e);
      const slug = e.slug || e.id;
      navigate(`/evento/${slug}`);
    },
    [activeTab, navigate, saveScrollPosition],
  );

  const closeEventDetail = useCallback(() => {
    setSelectedEvent(null);
    navigate(-1);
    requestAnimationFrame(() => {
      const saved = scrollPositions.current.get(activeTab) ?? 0;
      if (mainScrollRef.current) mainScrollRef.current.scrollTop = saved;
    });
  }, [activeTab, navigate]);

  const openMemberProfile = useCallback(
    (m: Membro) => {
      saveScrollPosition(activeTab);
      setSelectedMember(m);
    },
    [activeTab, saveScrollPosition],
  );

  const closeMemberProfile = useCallback(() => {
    setSelectedMember(null);
    requestAnimationFrame(() => {
      const saved = scrollPositions.current.get(activeTab) ?? 0;
      if (mainScrollRef.current) mainScrollRef.current.scrollTop = saved;
    });
  }, [activeTab]);

  const openComunidade = useCallback(
    (id: string) => {
      eventBeforeComunidadeRef.current = selectedEvent;
      setSelectedEvent(null);
      setSelectedComunidadeId(id);
      navigate(`/comunidade/${id}`);
    },
    [navigate, selectedEvent],
  );

  const closeComunidade = useCallback(() => {
    setSelectedComunidadeId(null);
    if (eventBeforeComunidadeRef.current) {
      setSelectedEvent(eventBeforeComunidadeRef.current);
      eventBeforeComunidadeRef.current = null;
    }
    navigate(-1);
  }, [navigate]);

  const navigateToTab = useCallback(
    (tab: TabState) => {
      saveScrollPosition(activeTab);
      setProfileSubView('MAIN');
      setSelectedMember(null);
      setSelectedEvent(null);
      setSelectedComunidadeId(null);
      navigate(TAB_TO_PATH[tab]);
      requestAnimationFrame(() => resetScroll(mainScrollRef.current));
    },
    [activeTab, navigate, saveScrollPosition],
  );

  // ── Deep link: sincroniza URL → estado na montagem ──────────────────────────
  useEffect(() => {
    const path = location.pathname;

    // Perfil sub-views
    if (path === '/perfil/carteira') setProfileSubView('WALLET');
    else if (path === '/perfil/ingressos') setProfileSubView('MY_TICKETS');
    else if (path === '/perfil/preview') setProfileSubView('PREVIEW_PUBLIC');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    activeTab,
    selectedEvent,
    selectedMember,
    selectedComunidadeId,
    profileSubView,
    isCityModalOpen,
    isNotificationModalOpen,
    setProfileSubView,
    setIsCityModalOpen,
    setIsNotificationModalOpen,
    openEventDetail,
    closeEventDetail,
    openMemberProfile,
    closeMemberProfile,
    openComunidade,
    closeComunidade,
    navigateToTab,
    clubeConviteId,
    setClubeConviteId,
    mainScrollRef,
  };
};
