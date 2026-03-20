/**
 * DashboardV2Gateway — Admin completo com Dashboard V2 como home
 * Rota: /dashboard-v2
 * Sidebar + todas as subviews + DashboardV2Home como tela inicial
 * Baseado no AdminV3Gateway — mesma estrutura, mesmas views.
 */

import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import { Search, Loader2, Eye, Menu } from 'lucide-react';
import { SidebarV2, type NavItem } from './components/SidebarV2';
import { CommandPalette } from './components/CommandPalette';

import { eventosAdminService, type SolicitacaoSaque } from '../admin/services/eventosAdminService';
import { clubeService } from '../admin/services/clubeService';
import { comunidadesService } from '../admin/services/comunidadesService';
import { getReembolsosPendentes } from '../admin/services/reembolsoService';
import { countPendencias } from '../admin/services/pendenciasService';
import type { ContaVantaLegacy, Notificacao } from '../../types';
import { getTenantLabel } from '../admin/components/AdminDashboardHome';
import type { RoleListaNova } from '../admin/views/listas';
import {
  canAccessFinanceiro,
  canAccessListas,
  canAccessCheckin,
  canAccessQR,
  canAccessCaixa,
  isMasterOnly,
  canAccessMeusEventos,
  canAccessPortariaScanner,
  canAccessComunidades,
} from '../admin/permissoes';
import { rbacService, CARGO_TO_PORTAL } from '../admin/services/rbacService';
import { SIDEBAR_SECTIONS, COMMUNITY_SIDEBAR_SECTIONS, type AdminSubView } from '../admin/components/AdminSidebar';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../services/supabaseClient';
import { useSessionTimeout } from '../../hooks/useSessionTimeout';
import { adminDeepLink } from '../../hooks/useAppHandlers';
import { VantaDropdown } from '../../components/VantaDropdown';

// Home V2
import { DashboardV2Home } from './DashboardV2Home';
import { PanoramaHome } from './homes/PanoramaHome';

// ── Lazy-loaded views (mesmo set do AdminV3Gateway) ──────────────────────────
const ComunidadesView = lazy(() =>
  import('../admin/views/ComunidadesView').then(m => ({ default: m.ComunidadesView })),
);
const VantaIndicaView = lazy(() =>
  import('../admin/views/VantaIndicaView').then(m => ({ default: m.VantaIndicaView })),
);
const NotificacoesAdminView = lazy(() =>
  import('../admin/views/NotificacoesAdminView').then(m => ({ default: m.NotificacoesAdminView })),
);
const CheckInView = lazy(() => import('../admin/views/checkin').then(m => ({ default: m.CheckInView })));
const CaixaView = lazy(() => import('../admin/views/CaixaView').then(m => ({ default: m.CaixaView })));
const GerenteDashboardView = lazy(() =>
  import('../admin/views/GerenteDashboardView').then(m => ({ default: m.GerenteDashboardView })),
);
const MeusEventosView = lazy(() =>
  import('../admin/views/MeusEventosView').then(m => ({ default: m.MeusEventosView })),
);
const CargosUnificadoView = lazy(() =>
  import('../admin/views/cargosUnificado').then(m => ({ default: m.CargosUnificadoView })),
);
const MasterFinanceiroView = lazy(() =>
  import('../admin/views/MasterFinanceiroView').then(m => ({ default: m.MasterFinanceiroView })),
);
const FinanceiroView = lazy(() => import('../admin/views/financeiro').then(m => ({ default: m.FinanceiroView })));
const PortariaScannerView = lazy(() =>
  import('../admin/views/PortariaScannerView').then(m => ({ default: m.PortariaScannerView })),
);
const PromoterDashView = lazy(() =>
  import('../admin/views/PromoterDashboardView').then(m => ({ default: m.PromoterDashboardView })),
);
const PromoterCotasView = lazy(() =>
  import('../admin/views/PromoterCotasView').then(m => ({ default: m.PromoterCotasView })),
);
const ListasView = lazy(() => import('../admin/views/listas').then(m => ({ default: m.ListasView })));
const EventosPendentesView = lazy(() =>
  import('../admin/views/EventosPendentesView').then(m => ({ default: m.EventosPendentesView })),
);
const AuditLogView = lazy(() => import('../admin/views/AuditLogView').then(m => ({ default: m.AuditLogView })));
const SolicitacoesParceriaView = lazy(() =>
  import('../admin/views/SolicitacoesParceriaView').then(m => ({ default: m.SolicitacoesParceriaView })),
);
const CategoriasAdminView = lazy(() =>
  import('../admin/views/CategoriasAdminView').then(m => ({ default: m.CategoriasAdminView })),
);
const MaisVantaHubView = lazy(() =>
  import('../admin/views/MaisVantaHubView').then(m => ({ default: m.MaisVantaHubView })),
);
const TabClubeCuradoria = lazy(() => import('../admin/views/curadoria/tabClube').then(m => ({ default: m.TabClube })));
const CidadesMaisVantaView = lazy(() =>
  import('../admin/views/CidadesMaisVantaView').then(m => ({ default: m.CidadesMaisVantaView })),
);
const ParceirosMaisVantaView = lazy(() =>
  import('../admin/views/ParceirosMaisVantaView').then(m => ({ default: m.ParceirosMaisVantaView })),
);
const DealsMaisVantaView = lazy(() =>
  import('../admin/views/DealsMaisVantaView').then(m => ({ default: m.DealsMaisVantaView })),
);
const MonitoramentoMaisVantaView = lazy(() =>
  import('../admin/views/MonitoramentoMaisVantaView').then(m => ({ default: m.MonitoramentoMaisVantaView })),
);
const ConvitesMaisVantaView = lazy(() =>
  import('../admin/views/ConvitesMaisVantaView').then(m => ({ default: m.ConvitesMaisVantaView })),
);
const AnalyticsMaisVantaView = lazy(() =>
  import('../admin/views/AnalyticsMaisVantaView').then(m => ({ default: m.AnalyticsMaisVantaView })),
);
const DiagnosticoView = lazy(() =>
  import('../admin/views/DiagnosticoView').then(m => ({ default: m.DiagnosticoView })),
);
const AssinaturasMaisVantaView = lazy(() =>
  import('../admin/views/AssinaturasMaisVantaView').then(m => ({ default: m.AssinaturasMaisVantaView })),
);
const PassaportesMaisVantaView = lazy(() =>
  import('../admin/views/PassaportesMaisVantaView').then(m => ({ default: m.PassaportesMaisVantaView })),
);
const DividaSocialMaisVantaView = lazy(() =>
  import('../admin/views/DividaSocialMaisVantaView').then(m => ({ default: m.DividaSocialMaisVantaView })),
);
const MembrosGlobaisMaisVantaView = lazy(() =>
  import('../admin/views/MembrosGlobaisMaisVantaView').then(m => ({ default: m.MembrosGlobaisMaisVantaView })),
);
const EventosGlobaisMaisVantaView = lazy(() =>
  import('../admin/views/EventosGlobaisMaisVantaView').then(m => ({ default: m.EventosGlobaisMaisVantaView })),
);
const InfracoesGlobaisMaisVantaView = lazy(() =>
  import('../admin/views/InfracoesGlobaisMaisVantaView').then(m => ({ default: m.InfracoesGlobaisMaisVantaView })),
);
const RelatorioMasterView = lazy(() =>
  import('../admin/views/relatorios').then(m => ({ default: m.RelatorioMasterView })),
);
const RelatorioComunidadeView = lazy(() =>
  import('../admin/views/relatorios').then(m => ({ default: m.RelatorioComunidadeView })),
);
const GestaoComprovantesView = lazy(() =>
  import('../admin/views/GestaoComprovantesView').then(m => ({ default: m.GestaoComprovantesView })),
);
const ProductAnalyticsView = lazy(() =>
  import('../admin/views/ProductAnalyticsView').then(m => ({ default: m.ProductAnalyticsView })),
);
const PendenciasHubView = lazy(() =>
  import('../admin/views/PendenciasHubView').then(m => ({ default: m.PendenciasHubView })),
);
const MasterDashboardView = lazy(() =>
  import('../admin/views/masterDashboard').then(m => ({ default: m.MasterDashboard })),
);
const InsightsDashboardView = lazy(() =>
  import('../admin/views/insightsDashboard').then(m => ({ default: m.InsightsDashboardView })),
);
const ComunidadeDashboardView = lazy(() =>
  import('../admin/views/comunidadeDashboard').then(m => ({ default: m.ComunidadeDashboard })),
);
const MaisVantaDashboardView = lazy(() =>
  import('../admin/views/maisVantaDashboard').then(m => ({ default: m.MaisVantaDashboard })),
);
const FaqView = lazy(() => import('../admin/views/FaqView').then(m => ({ default: m.FaqView })));
const LinksUteisView = lazy(() => import('../admin/views/LinksUteisView').then(m => ({ default: m.LinksUteisView })));
const CondicoesProducerView = lazy(() =>
  import('../admin/views/CondicoesProducerView').then(m => ({ default: m.CondicoesProducerView })),
);
const PendenciasAppView = lazy(() =>
  import('../admin/views/PendenciasAppView').then(m => ({ default: m.PendenciasAppView })),
);
const ConfigPlataformaView = lazy(() =>
  import('../admin/views/ConfigPlataformaView').then(m => ({ default: m.ConfigPlataformaView })),
);
const SiteContentView = lazy(() =>
  import('../admin/views/SiteContentView').then(m => ({ default: m.SiteContentView })),
);
const LegalEditorView = lazy(() =>
  import('../admin/views/LegalEditorView').then(m => ({ default: m.LegalEditorView })),
);
const GestaoUsuariosView = lazy(() =>
  import('../admin/views/GestaoUsuariosView').then(m => ({ default: m.GestaoUsuariosView })),
);

// ── Mapa NavItem → AdminSubView ──────────────────────────────────────────────
const NAV_TO_SUBVIEW: Record<NavItem, AdminSubView> = {
  // VISÃO GERAL
  DASHBOARD: 'DASHBOARD',
  PENDENCIAS: 'PENDENCIAS_HUB',
  INTELIGENCIA: 'INTELIGENCIA',
  // COMUNIDADES
  COMUNIDADES: 'COMUNIDADES',
  PARCERIAS: 'SOLICITACOES_PARCERIA',
  CARGOS: 'CARGOS',
  AUDIT_LOG: 'AUDIT_LOG',
  // EVENTOS
  EVENTOS: 'MEUS_EVENTOS',
  PENDENTES: 'PENDENTES',
  PORTARIA: 'PORTARIA_QR',
  CAIXA: 'CAIXA',
  LISTAS: 'LISTAS',
  // FINANCEIRO
  FINANCEIRO: 'FINANCEIRO_MASTER',
  COMPROVANTES: 'GESTAO_COMPROVANTES',
  RELATORIOS: 'RELATORIO_MASTER',
  // MAIS VANTA
  MAIS_VANTA: 'MAIS_VANTA_HUB',
  // PLATAFORMA
  GESTAO_USUARIOS: 'GESTAO_USUARIOS',
  CATEGORIAS: 'CATEGORIAS',
  CONFIG_PLATAFORMA: 'CONFIG_PLATAFORMA',
  NOTIFICACOES: 'NOTIFICACOES',
  INDICA: 'INDICA',
  SITE_CONTENT: 'SITE_CONTENT',
  LEGAL_EDITOR: 'LEGAL_EDITOR',
  DIAGNOSTICO: 'DIAGNOSTICO',
};

// ── Role tabs (ferramenta de dev/análise) ────────────────────────────────────
const ROLE_TABS: { role: ContaVantaLegacy; label: string }[] = [
  { role: 'vanta_masteradm' as ContaVantaLegacy, label: 'Master' },
  { role: 'vanta_gerente', label: 'Gerente' },
  { role: 'vanta_socio', label: 'Sócio' },
  { role: 'vanta_promoter', label: 'Promoter' },
  { role: 'vanta_ger_portaria_antecipado', label: 'Portaria' },
  { role: 'vanta_caixa', label: 'Caixa' },
];

// ── Componente Principal ─────────────────────────────────────────────────────

export const DashboardV2Gateway: React.FC<{
  onClose?: () => void;
  adminNome?: string;
  adminRole?: ContaVantaLegacy;
  currentUserId?: string;
  addNotification?: (n: Omit<Notificacao, 'id'>) => void;
  initialTenantId?: string;
  initialTenantTipo?: 'COMUNIDADE' | 'EVENTO';
}> = ({
  onClose,
  adminNome: propNome,
  adminRole: propRole,
  currentUserId: propUserId,
  addNotification: propAddNotif,
  initialTenantId,
  initialTenantTipo,
}) => {
  // Fallback pro authStore se não receber props (rota standalone)
  const storeNome = useAuthStore(s => s.profile.nome);
  const storeUserId = useAuthStore(s => s.currentAccount.id);
  const storeRole = useAuthStore(s => s.currentAccount.role) || 'vanta_member';
  const storeAddNotif = useAuthStore(s => s.addNotification);

  const adminNome = propNome ?? storeNome;
  const currentUserId = propUserId ?? storeUserId;
  const adminRole = (propRole ?? storeRole) as ContaVantaLegacy;
  const addNotification = propAddNotif ?? storeAddNotif;

  // ── Navegação ────────────────────────────────────────────────────────────
  const [activeNav, setActiveNav] = useState<NavItem>('DASHBOARD');
  const [subView, _setSubView] = useState<AdminSubView>(() => {
    const hash = window.location.hash.replace('#admin/', '');
    return hash && hash !== '' ? (hash as AdminSubView) : 'DASHBOARD';
  });
  const setSubView = useCallback((v: AdminSubView) => {
    _setSubView(v);
    window.history.replaceState(null, '', v === 'DASHBOARD' ? window.location.pathname : `#admin/${v}`);
  }, []);

  const [showPalette, setShowPalette] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 768px)').matches);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.matchMedia('(min-width: 768px)').matches);
  const [promoterCotasListaId, setPromoterCotasListaId] = useState('');
  const [caixaEventoId, setCaixaEventoId] = useState<string | undefined>(undefined);
  const [toastMsg, setToastMsg] = useState('');
  const [simulatedRole, setSimulatedRole] = useState<ContaVantaLegacy | null>(null);

  // ── Session timeout (30min inativo = logout) ──────────────────────────
  useSessionTimeout(
    useCallback(() => {
      supabase.auth.signOut();
    }, []),
    true,
  );

  // ── Panorama vs Contexto ────────────────────────────────────────────────
  // null = panorama (caixa de entrada). Preenchido = dentro de um contexto.
  const [activeContext, setActiveContext] = useState<{
    tenantId: string;
    tenantTipo: 'COMUNIDADE' | 'EVENTO' | 'MASTER';
    cargo: string;
  } | null>(
    initialTenantId ? { tenantId: initialTenantId, tenantTipo: initialTenantTipo ?? 'COMUNIDADE', cargo: '' } : null,
  );

  // Access data do RPC (pra panorama)
  const [accessData, setAccessData] = useState<{
    role: string;
    comunidades: { id: string; nome: string; foto: string | null; cargo: string; direto: boolean }[];
    eventos: { id: string; nome: string; foto: string | null; comunidade_id: string; cargo: string }[];
  } | null>(null);

  useEffect(() => {
    supabase.rpc('get_admin_access', { p_user_id: currentUserId }).then(({ data, error }) => {
      if (!error && data) setAccessData(data as unknown as typeof accessData & object);
    });
  }, [currentUserId]);

  // C15: Consumir deep link admin (push notification → admin/comunidade/:id ou admin/evento/:id)
  useEffect(() => {
    if (adminDeepLink.tenantId && accessData) {
      setActiveContext({
        tenantId: adminDeepLink.tenantId,
        tenantTipo: adminDeepLink.tenantTipo ?? 'COMUNIDADE',
        cargo: '',
      });
      setSubView('DASHBOARD');
      setActiveNav('DASHBOARD');
      // Consumir deep link (não reprocessar)
      adminDeepLink.tenantId = null;
      adminDeepLink.tenantTipo = null;
    }
  }, [accessData]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEnterContext = (tenantId: string, tenantTipo: 'COMUNIDADE' | 'EVENTO' | 'MASTER', cargo: string) => {
    setActiveContext({ tenantId, tenantTipo, cargo });
    setSubView('DASHBOARD');
    setActiveNav('DASHBOARD');
  };

  const handleBackToPanorama = () => {
    setActiveContext(null);
    setSubView('DASHBOARD');
    setActiveNav('DASHBOARD');
  };
  const toast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Role efetivo (real ou simulado)
  const isMasterReal = adminRole === ('vanta_masteradm' as ContaVantaLegacy);
  const contextRole = activeContext?.cargo
    ? (CARGO_TO_PORTAL[activeContext.cargo as keyof typeof CARGO_TO_PORTAL] ?? adminRole)
    : adminRole;
  const effectiveRole =
    simulatedRole ??
    (activeContext?.tenantTipo === 'MASTER'
      ? ('vanta_masteradm' as ContaVantaLegacy)
      : (contextRole as ContaVantaLegacy));

  // ── Desktop detection ──────────────────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const h = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
      if (!e.matches) setSidebarOpen(false);
    };
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  // ── Command palette shortcut ───────────────────────────────────────────
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowPalette(p => !p);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  // ── Lazy service init ──────────────────────────────────────────────────
  useEffect(() => {
    void eventosAdminService.refresh();
    void rbacService.refresh();
    void comunidadesService.refresh();
    const timer = setTimeout(() => {
      void import('../admin/services/listasService').then(m => m.listasService.refresh());
      void import('../admin/services/cortesiasService').then(m => m.cortesiasService.refresh());
      void import('../admin/services/clubeService').then(m => m.clubeService.refresh());
      void import('../admin/services/assinaturaService').then(m => m.assinaturaService.refresh());
      void import('../admin/services/maisVantaConfigService').then(m => m.maisVantaConfigService.refresh());
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // ── Contexto do tenant ─────────────────────────────────────────────────
  // Contexto efetivo: do activeContext (panorama→drill-down) ou das props iniciais
  const ctxTenantId = activeContext?.tenantId ?? initialTenantId;
  const ctxTenantTipo = activeContext?.tenantTipo ?? initialTenantTipo;
  const isInCommunity = Boolean(ctxTenantId && ctxTenantTipo === 'COMUNIDADE');
  const comunidadeId = isInCommunity ? ctxTenantId : undefined;
  const gatewayEventoId = ctxTenantTipo === 'EVENTO' ? ctxTenantId : undefined;

  // contextRole movido pra antes de effectiveRole (linha ~278)

  const tenantNome = useMemo(
    () => getTenantLabel(initialTenantTipo, initialTenantId),
    [initialTenantTipo, initialTenantId],
  );
  const tenantFoto = useMemo(
    () => (comunidadeId ? comunidadesService.get(comunidadeId)?.foto : undefined),
    [comunidadeId],
  );
  const tenantArtigo =
    initialTenantTipo === 'EVENTO' ? 'do evento' : initialTenantTipo === 'COMUNIDADE' ? 'da comunidade' : null;

  // ── Pendências ─────────────────────────────────────────────────────────
  const pendentesCount = useMemo(
    () =>
      effectiveRole === ('vanta_masteradm' as ContaVantaLegacy) ? eventosAdminService.getEventosPendentes().length : 0,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveRole, subView],
  );

  const comunidadeIds = useMemo<string[]>(() => [], []);
  const eventoIds = useMemo<string[]>(() => [], []);

  const [pendenciasHubCount, setPendenciasHubCount] = useState(0);
  useEffect(() => {
    if (!currentUserId || !effectiveRole) return;
    let cancelled = false;
    countPendencias(currentUserId, effectiveRole, comunidadeIds, eventoIds).then(count => {
      if (!cancelled) setPendenciasHubCount(count);
    });
    return () => {
      cancelled = true;
    };
  }, [currentUserId, effectiveRole, comunidadeIds, eventoIds, subView]);

  const [saquesCount, setSaquesCount] = useState(0);
  const [reembolsosCount, setReembolsosCount] = useState(0);
  useEffect(() => {
    if (effectiveRole === ('vanta_masteradm' as ContaVantaLegacy)) {
      eventosAdminService
        .getSolicitacoesSaque()
        .then(list => setSaquesCount(list.filter((s: SolicitacaoSaque) => s.status === 'PENDENTE').length))
        .catch(() => setSaquesCount(0));
      getReembolsosPendentes()
        .then(list => setReembolsosCount(list.length))
        .catch(() => setReembolsosCount(0));
    }
  }, [effectiveRole, subView]);

  const dashPendencias = useMemo(() => {
    if (effectiveRole === ('vanta_masteradm' as ContaVantaLegacy)) {
      const solicitacoesMV = clubeService.getSolicitacoesPendentes().length;
      return {
        curadoria: solicitacoesMV,
        pendentes: eventosAdminService.getEventosPendentes().length,
        saques: saquesCount,
        passaportesMV: clubeService.getPassportsPendentes().length,
        solicitacoesMV,
        dividaSocial: new Set(clubeService.getReservasPendentePost().map(r => r.userId)).size,
        reembolsos: reembolsosCount,
      };
    }
    return {
      curadoria: 0,
      pendentes: 0,
      saques: 0,
      passaportesMV: 0,
      solicitacoesMV: 0,
      dividaSocial: 0,
      reembolsos: 0,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveRole, subView, saquesCount, reembolsosCount]);

  const totalPendencias = (Object.values(dashPendencias) as number[]).reduce((a, b) => a + b, 0);

  // ── Navegação: NavItem → SubView ───────────────────────────────────────
  const handleNavSelect = useCallback(
    (id: NavItem) => {
      setActiveNav(id);
      if (id === 'FINANCEIRO') {
        setSubView(effectiveRole === ('vanta_masteradm' as ContaVantaLegacy) ? 'FINANCEIRO_MASTER' : 'FINANCEIRO');
      } else {
        setSubView(NAV_TO_SUBVIEW[id]);
      }
      if (!isDesktop) setSidebarOpen(false);
    },
    [effectiveRole, isDesktop],
  );

  const handleNavigate = useCallback(
    (view: string) => {
      const navKeys = Object.keys(NAV_TO_SUBVIEW) as NavItem[];
      const navMatch = navKeys.find(k => k === view);
      if (navMatch) {
        handleNavSelect(navMatch);
        return;
      }
      setSubView(view as AdminSubView);
    },
    [handleNavSelect],
  );

  const back = () => {
    setSubView('DASHBOARD');
    setActiveNav('DASHBOARD');
  };

  // ── Guards ─────────────────────────────────────────────────────────────
  const guardBlock = (goBack: () => void) => (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
      <div className="w-2 h-2 rounded-full bg-red-500/40" />
      <p className="text-zinc-400 text-xs font-medium">Acesso negado</p>
      <p className="text-zinc-700 text-[0.625rem]">Você não tem permissão para acessar este módulo.</p>
      <button
        onClick={goBack}
        className="mt-4 px-4 py-2 bg-zinc-900 border border-white/10 rounded-lg text-zinc-400 text-xs active:scale-95 transition-all"
      >
        Voltar
      </button>
    </div>
  );

  const getRoleLista = (role: string): RoleListaNova => {
    if (role === 'vanta_masteradm' || role === 'vanta_socio' || role === 'vanta_gerente') return 'gerente';
    if (role === 'vanta_promoter') return 'promoter';
    if (role === 'vanta_ger_portaria_lista' || role === 'vanta_portaria_lista') return 'portaria_lista';
    if (role === 'vanta_ger_portaria_antecipado' || role === 'vanta_portaria_antecipado') return 'portaria_antecipado';
    return 'promoter';
  };

  // ── Render Content ─────────────────────────────────────────────────────
  const renderContent = () => {
    // HOME — Dashboard V2
    if (subView === 'DASHBOARD') {
      // Se não tem contexto ativo → mostra Panorama
      if (!activeContext && accessData) {
        return (
          <PanoramaHome
            adminNome={adminNome}
            currentUserId={currentUserId}
            isMaster={isMasterReal}
            comunidades={accessData.comunidades}
            eventos={accessData.eventos}
            onEnterContext={handleEnterContext}
          />
        );
      }
      // Dentro de um contexto → mostra home por role
      return (
        <DashboardV2Home
          adminNome={adminNome}
          adminRole={effectiveRole}
          currentUserId={currentUserId}
          tenantNome={tenantNome}
          pendencias={dashPendencias}
          onNavigate={v => {
            if (v === 'MAIS_VANTA') {
              setSubView('MAIS_VANTA_HUB');
              setActiveNav('MAIS_VANTA');
              return;
            }
            setSubView(v);
          }}
          comunidadeId={comunidadeId}
        />
      );
    }
    if (subView === 'MEUS_EVENTOS') {
      if (!canAccessMeusEventos(currentUserId, effectiveRole, { communityId: comunidadeId, eventId: gatewayEventoId }))
        return guardBlock(back);
      return effectiveRole === 'vanta_gerente' ? (
        <GerenteDashboardView
          onBack={back}
          currentUserId={currentUserId}
          addNotification={addNotification}
          comunidadeId={comunidadeId}
        />
      ) : (
        <MeusEventosView
          onBack={back}
          currentUserId={currentUserId}
          currentUserRole={effectiveRole}
          comunidadeId={comunidadeId}
        />
      );
    }
    if (subView === 'CAIXA') {
      if (!canAccessCaixa(currentUserId, effectiveRole, { communityId: comunidadeId, eventId: gatewayEventoId }))
        return guardBlock(back);
      return (
        <CaixaView
          onBack={() => {
            setCaixaEventoId(undefined);
            back();
          }}
          comunidadeId={comunidadeId}
          eventoId={caixaEventoId}
        />
      );
    }
    if (subView === 'CARGOS') {
      if (!isMasterOnly(currentUserId, effectiveRole)) return guardBlock(back);
      return <CargosUnificadoView onBack={back} currentUserId={currentUserId} addNotification={addNotification} />;
    }
    if (subView === 'INTELIGENCIA')
      return <InsightsDashboardView onBack={back} comunidadeId={comunidadeId} onNavigate={setSubView} />;
    if (subView === 'MASTER_DASHBOARD') {
      if (effectiveRole !== ('vanta_masteradm' as ContaVantaLegacy)) return guardBlock(back);
      return (
        <MasterDashboardView
          onSelectComunidade={() => setSubView('COMUNIDADES')}
          onSelectEvento={() => setSubView('MEUS_EVENTOS')}
        />
      );
    }
    if (subView === 'COMUNIDADE_DASHBOARD') {
      if (!comunidadeId) return guardBlock(back);
      const comNome = comunidadesService.get(comunidadeId)?.nome ?? 'Comunidade';
      return (
        <ComunidadeDashboardView
          comunidadeId={comunidadeId}
          comunidadeNome={comNome}
          onBack={back}
          onSelectEvento={() => setSubView('MEUS_EVENTOS')}
        />
      );
    }
    if (subView === 'MAIS_VANTA_DASHBOARD') {
      if (effectiveRole !== ('vanta_masteradm' as ContaVantaLegacy)) return guardBlock(back);
      return <MaisVantaDashboardView onBack={back} />;
    }
    if (subView === 'FINANCEIRO_MASTER') {
      if (effectiveRole !== ('vanta_masteradm' as ContaVantaLegacy)) return guardBlock(back);
      return <MasterFinanceiroView onBack={back} addNotification={addNotification} />;
    }
    if (subView === 'FINANCEIRO') {
      if (!canAccessFinanceiro(currentUserId, effectiveRole, { communityId: comunidadeId, eventId: gatewayEventoId }))
        return guardBlock(back);
      return (
        <FinanceiroView
          onBack={back}
          currentUserId={currentUserId}
          addNotification={addNotification}
          comunidadeId={comunidadeId}
        />
      );
    }
    if (subView === 'PORTARIA_SCANNER') {
      if (
        !canAccessPortariaScanner(currentUserId, effectiveRole, { communityId: comunidadeId, eventId: gatewayEventoId })
      )
        return guardBlock(back);
      return <PortariaScannerView onBack={back} eventoId={gatewayEventoId} />;
    }
    if (subView === 'COMUNIDADES') {
      if (!canAccessComunidades(currentUserId, effectiveRole, { communityId: comunidadeId })) return guardBlock(back);
      return (
        <ComunidadesView
          onBack={back}
          adminRole={effectiveRole}
          adminNome={adminNome}
          memberId={currentUserId}
          focusComunidadeId={comunidadeId}
        />
      );
    }
    if (subView === 'INDICA') {
      if (!isMasterOnly(currentUserId, effectiveRole)) return guardBlock(back);
      return <VantaIndicaView onBack={back} userId={currentUserId} />;
    }
    if (subView === 'LISTAS') {
      if (!canAccessListas(currentUserId, effectiveRole, { communityId: comunidadeId, eventId: gatewayEventoId }))
        return guardBlock(back);
      return (
        <ListasView
          onBack={back}
          role={getRoleLista(effectiveRole)}
          userId={currentUserId}
          userNome={adminNome}
          comunidadeId={comunidadeId}
        />
      );
    }
    if (subView === 'PORTARIA_QR') {
      if (!canAccessQR(currentUserId, effectiveRole, { communityId: comunidadeId, eventId: gatewayEventoId }))
        return guardBlock(back);
      return <CheckInView onBack={back} comunidadeId={comunidadeId} modoFixo="QR" />;
    }
    if (subView === 'PORTARIA_LISTA') {
      if (!canAccessCheckin(currentUserId, effectiveRole, { communityId: comunidadeId, eventId: gatewayEventoId }))
        return guardBlock(back);
      return <CheckInView onBack={back} comunidadeId={comunidadeId} modoFixo="LISTA" />;
    }
    if (subView === 'NOTIFICACOES') {
      if (!isMasterOnly(currentUserId, effectiveRole)) return guardBlock(back);
      return <NotificacoesAdminView onBack={back} />;
    }
    if (subView === 'PENDENCIAS_HUB')
      return (
        <PendenciasHubView
          userId={currentUserId}
          role={effectiveRole}
          comunidadeIds={comunidadeIds}
          eventoIds={eventoIds}
          onBack={back}
          onNavigate={setSubView}
        />
      );
    if (subView === 'PENDENTES') {
      if (!isMasterOnly(currentUserId, effectiveRole)) return guardBlock(back);
      return <EventosPendentesView onBack={back} masterUserId={currentUserId} />;
    }
    if (subView === 'SOLICITACOES_PARCERIA') {
      if (!isMasterOnly(currentUserId, effectiveRole)) return guardBlock(back);
      return <SolicitacoesParceriaView onBack={back} />;
    }
    if (subView === 'AUDIT_LOG') {
      if (!isMasterOnly(currentUserId, effectiveRole)) return guardBlock(back);
      return <AuditLogView onBack={back} />;
    }
    if (subView === 'DIAGNOSTICO') {
      if (!isMasterOnly(currentUserId, effectiveRole)) return guardBlock(back);
      return <DiagnosticoView onBack={back} />;
    }
    if (subView === 'FAQ') {
      if (!isMasterOnly(currentUserId, effectiveRole)) return guardBlock(back);
      return <FaqView onBack={back} />;
    }
    if (subView === 'LINKS_UTEIS') {
      if (!isMasterOnly(currentUserId, effectiveRole)) return guardBlock(back);
      return <LinksUteisView onBack={back} />;
    }
    if (subView === 'CATEGORIAS') {
      if (!isMasterOnly(currentUserId, effectiveRole)) return guardBlock(back);
      return <CategoriasAdminView onBack={back} />;
    }
    if (subView === 'MAIS_VANTA_HUB') {
      if (effectiveRole !== ('vanta_masteradm' as ContaVantaLegacy)) return guardBlock(back);
      return <MaisVantaHubView onBack={back} masterId={currentUserId} />;
    }
    if (subView === 'MONITORAMENTO_MV') {
      if (effectiveRole !== ('vanta_masteradm' as ContaVantaLegacy)) return guardBlock(back);
      return <MonitoramentoMaisVantaView onBack={back} />;
    }
    if (subView === 'ASSINATURAS_MV') {
      if (effectiveRole !== ('vanta_masteradm' as ContaVantaLegacy)) return guardBlock(back);
      return <AssinaturasMaisVantaView onBack={back} />;
    }
    if (subView === 'PASSAPORTES_MV') {
      if (effectiveRole !== ('vanta_masteradm' as ContaVantaLegacy)) return guardBlock(back);
      return <PassaportesMaisVantaView onBack={back} masterId={currentUserId} />;
    }
    if (subView === 'DIVIDA_SOCIAL_MV') {
      if (effectiveRole !== ('vanta_masteradm' as ContaVantaLegacy)) return guardBlock(back);
      return <DividaSocialMaisVantaView onBack={back} />;
    }
    if (subView === 'MEMBROS_GLOBAIS_MV') {
      if (effectiveRole !== ('vanta_masteradm' as ContaVantaLegacy) && effectiveRole !== 'vanta_gerente')
        return guardBlock(back);
      return <MembrosGlobaisMaisVantaView onBack={back} />;
    }
    if (subView === 'EVENTOS_GLOBAIS_MV') {
      if (effectiveRole !== ('vanta_masteradm' as ContaVantaLegacy)) return guardBlock(back);
      return <EventosGlobaisMaisVantaView onBack={back} />;
    }
    if (subView === 'INFRACOES_GLOBAIS_MV') {
      if (effectiveRole !== ('vanta_masteradm' as ContaVantaLegacy)) return guardBlock(back);
      return <InfracoesGlobaisMaisVantaView onBack={back} />;
    }
    if (subView === 'CIDADES_MV') {
      if (effectiveRole !== ('vanta_masteradm' as ContaVantaLegacy)) return guardBlock(back);
      return <CidadesMaisVantaView onBack={back} />;
    }
    if (subView === 'PARCEIROS_MV') {
      if (effectiveRole !== ('vanta_masteradm' as ContaVantaLegacy) && effectiveRole !== 'vanta_gerente')
        return guardBlock(back);
      return <ParceirosMaisVantaView onBack={back} />;
    }
    if (subView === 'DEALS_MV') {
      if (effectiveRole !== ('vanta_masteradm' as ContaVantaLegacy) && effectiveRole !== 'vanta_gerente')
        return guardBlock(back);
      return <DealsMaisVantaView onBack={back} />;
    }
    if (subView === 'CURADORIA_MV') {
      if (effectiveRole !== ('vanta_masteradm' as ContaVantaLegacy)) return guardBlock(back);
      return (
        <div className="flex-1 flex flex-col overflow-hidden">
          <TabClubeCuradoria
            adminId={currentUserId}
            toastFn={(_tipo: string, msg: string) => toast(msg)}
            comunidadeId={comunidadeId}
          />
        </div>
      );
    }
    if (subView === 'CONVITES_MV') {
      if (effectiveRole !== ('vanta_masteradm' as ContaVantaLegacy) && effectiveRole !== 'vanta_gerente')
        return guardBlock(back);
      return <ConvitesMaisVantaView onBack={back} toastFn={toast} />;
    }
    if (subView === 'ANALYTICS_MV') {
      if (effectiveRole !== ('vanta_masteradm' as ContaVantaLegacy)) return guardBlock(back);
      return <AnalyticsMaisVantaView onBack={back} />;
    }
    if (subView === 'RELATORIO_MASTER') {
      if (effectiveRole === 'vanta_gerente' && comunidadeId) {
        const comNome = comunidadesService.get(comunidadeId)?.nome ?? 'Comunidade';
        return <RelatorioComunidadeView comunidadeId={comunidadeId} comunidadeNome={comNome} onBack={back} />;
      }
      if (effectiveRole !== ('vanta_masteradm' as ContaVantaLegacy)) return guardBlock(back);
      return <RelatorioMasterView onBack={back} />;
    }
    if (subView === 'GESTAO_COMPROVANTES') {
      if (effectiveRole !== ('vanta_masteradm' as ContaVantaLegacy)) return guardBlock(back);
      return <GestaoComprovantesView onBack={back} masterId={currentUserId} />;
    }
    if (subView === 'PRODUCT_ANALYTICS') {
      if (!isMasterOnly(currentUserId, effectiveRole)) return guardBlock(back);
      return <ProductAnalyticsView onBack={back} />;
    }
    if (subView === 'PROMOTER_COTAS') {
      if (promoterCotasListaId)
        return (
          <PromoterCotasView
            listaId={promoterCotasListaId}
            onBack={() => {
              setPromoterCotasListaId('');
              setSubView('PROMOTER_COTAS');
            }}
            currentUserId={currentUserId}
          />
        );
      return (
        <PromoterDashView
          onBack={back}
          currentUserId={currentUserId}
          onNavigateCotas={listaId => setPromoterCotasListaId(listaId)}
          onNavigateGuestlist={() => setSubView('LISTAS')}
        />
      );
    }
    if (subView === 'CONDICOES_COMERCIAIS')
      return (
        <CondicoesProducerView
          onBack={back}
          comunidadeId={comunidadeId ?? ''}
          comunidadeNome={tenantNome ?? undefined}
        />
      );
    if (subView === 'SITE_CONTENT') return <SiteContentView onBack={back} currentUserId={currentUserId} />;
    if (subView === 'LEGAL_EDITOR') return <LegalEditorView onBack={back} currentUserId={currentUserId} />;
    if (subView === 'GESTAO_USUARIOS') return <GestaoUsuariosView onBack={back} />;
    if (subView === 'CONFIG_PLATAFORMA') return <ConfigPlataformaView onBack={back} currentUserId={currentUserId} />;
    if (subView === 'PENDENCIAS_APP') return <PendenciasAppView onBack={back} />;

    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="w-1.5 h-1.5 rounded-full bg-[#FFD300]/40" />
        <p className="text-zinc-700 text-[0.625rem] font-black uppercase tracking-[0.2em]">Selecione um módulo</p>
      </div>
    );
  };

  // ── Layout ─────────────────────────────────────────────────────────────
  return (
    <div className="absolute inset-0 flex overflow-hidden bg-[#050505] text-white z-[100]">
      {/* Sidebar + conteúdo 500px — mesmo layout do app */}
      <div className="w-full flex-1 overflow-hidden flex justify-center bg-[#050505]">
        {sidebarOpen && activeContext && (
          <SidebarV2
            active={activeNav}
            onSelect={handleNavSelect}
            onClose={() => setSidebarOpen(false)}
            isDesktop={isDesktop}
            adminRole={effectiveRole}
            pendenciasCount={pendenciasHubCount}
            totalPendencias={totalPendencias}
            tenantNome={tenantNome ?? undefined}
            tenantFoto={tenantFoto ?? undefined}
          />
        )}

        <div className="flex-1 max-w-[500px] flex flex-col overflow-hidden bg-[#0A0A0A] relative">
          {/* Header glass */}
          <div
            className="shrink-0 flex items-center gap-2 px-3 md:px-5 h-14 border-b border-white/5"
            style={{ background: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(15px)' }}
          >
            {activeContext ? (
              <button
                onClick={handleBackToPanorama}
                className="flex items-center gap-1.5 py-2 text-zinc-400 active:text-white transition-colors shrink-0"
              >
                <span className="text-[0.625rem] font-bold">← Panorama</span>
              </button>
            ) : (
              <button
                onClick={() => onClose?.()}
                className="flex items-center gap-1.5 py-2 text-zinc-400 active:text-white transition-colors shrink-0"
              >
                <span className="text-[0.625rem] font-bold">← Voltar</span>
              </button>
            )}
            {!sidebarOpen && activeContext && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-zinc-500 hover:text-white"
                aria-label="Abrir menu"
              >
                <Menu size="1rem" />
              </button>
            )}
            <button
              onClick={() => setShowPalette(true)}
              className="flex-1 flex items-center gap-3 bg-white/3 border border-white/5 rounded-xl px-4 py-2.5 text-left hover:bg-white/5 transition-colors"
            >
              <Search size="0.875rem" className="text-zinc-500" />
              <span className="text-sm text-zinc-500">Buscar...</span>
              <kbd className="ml-auto px-2 py-0.5 bg-zinc-800 text-zinc-600 text-[0.5rem] font-bold rounded border border-white/10 hidden md:block">
                ⌘K
              </kbd>
            </button>

            {/* Role tabs (dev tool — desktop only) */}
            {isMasterReal && (
              <div className="hidden md:flex items-center gap-1 shrink-0 min-w-[7rem]">
                <Eye size="0.625rem" className="text-zinc-700 shrink-0" />
                <VantaDropdown
                  value={simulatedRole ?? ''}
                  onChange={v => setSimulatedRole(v ? (v as ContaVantaLegacy) : null)}
                  placeholder="Real"
                  options={[{ value: '', label: 'Real' }, ...ROLE_TABS.map(t => ({ value: t.role, label: t.label }))]}
                  className="text-[0.5rem]"
                />
              </div>
            )}

            {tenantFoto ? (
              <img src={tenantFoto} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#FFD300] flex items-center justify-center shrink-0">
                <span className="text-black text-xs font-black">{adminNome?.charAt(0)?.toUpperCase() || 'V'}</span>
              </div>
            )}
          </div>

          {/* Conteúdo principal */}
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col bg-[#0A0A0A] relative">
            <Suspense
              fallback={
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 size="1.5rem" className="text-[#FFD300] animate-spin" />
                </div>
              }
            >
              {renderContent()}
            </Suspense>
          </div>
        </div>

        <CommandPalette
          isOpen={showPalette}
          onClose={() => setShowPalette(false)}
          onSelect={handleNavigate}
          onDataSelect={type => {
            if (type === 'evento') {
              setSubView('MEUS_EVENTOS');
            } else if (type === 'comunidade') {
              setSubView('COMUNIDADES');
            } else if (type === 'membro') {
              setSubView('GESTAO_USUARIOS');
            }
          }}
        />

        {toastMsg && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-zinc-800 border border-white/10 rounded-xl text-white text-xs font-medium z-[200] shadow-lg">
            {toastMsg}
          </div>
        )}
      </div>
    </div>
  );
};
