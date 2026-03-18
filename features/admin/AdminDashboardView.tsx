/** @deprecated LEGADO — substituído por DashboardV2Gateway. Mantido como referência por decisão do Dan (18/mar/2026). */
import React, { useState, useMemo, useEffect, Suspense, lazy } from 'react';
import { ArrowLeft, ChevronRight, Loader2 } from 'lucide-react';
import { eventosAdminService, SolicitacaoSaque } from './services/eventosAdminService';
import { clubeService } from './services/clubeService';
import { comunidadesService } from './services/comunidadesService';
import { getReembolsosPendentes } from './services/reembolsoService';
import { countPendencias } from './services/pendenciasService';
import { TYPOGRAPHY } from '../../constants';
import { ContaVantaLegacy, Notificacao, AccessNode } from '../../types';
import {
  AdminSidebar,
  SIDEBAR_SECTIONS,
  COMMUNITY_SIDEBAR_SECTIONS,
  type AdminSubView,
} from './components/AdminSidebar';
import { AdminDashboardHome, getTenantLabel } from './components/AdminDashboardHome';
import type { RoleListaNova } from './views/listas';
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
} from './permissoes';
import { rbacService } from './services/rbacService';

// ── Lazy-loaded views (carregam sob demanda) ──────────────────────────────────
const ComunidadesView = lazy(() => import('./views/ComunidadesView').then(m => ({ default: m.ComunidadesView })));
const VantaIndicaView = lazy(() => import('./views/VantaIndicaView').then(m => ({ default: m.VantaIndicaView })));
const NotificacoesAdminView = lazy(() =>
  import('./views/NotificacoesAdminView').then(m => ({ default: m.NotificacoesAdminView })),
);
const CheckInView = lazy(() => import('./views/checkin').then(m => ({ default: m.CheckInView })));
const CaixaView = lazy(() => import('./views/CaixaView').then(m => ({ default: m.CaixaView })));
const GerenteDashboardView = lazy(() =>
  import('./views/GerenteDashboardView').then(m => ({ default: m.GerenteDashboardView })),
);
const MeusEventosView = lazy(() => import('./views/MeusEventosView').then(m => ({ default: m.MeusEventosView })));
const CargosUnificadoView = lazy(() =>
  import('./views/cargosUnificado').then(m => ({ default: m.CargosUnificadoView })),
);
const MasterFinanceiroView = lazy(() =>
  import('./views/MasterFinanceiroView').then(m => ({ default: m.MasterFinanceiroView })),
);
const FinanceiroView = lazy(() => import('./views/financeiro').then(m => ({ default: m.FinanceiroView })));
const PortariaScannerView = lazy(() =>
  import('./views/PortariaScannerView').then(m => ({ default: m.PortariaScannerView })),
);
const PromoterDashView = lazy(() =>
  import('./views/PromoterDashboardView').then(m => ({ default: m.PromoterDashboardView })),
);
const PromoterCotasView = lazy(() => import('./views/PromoterCotasView').then(m => ({ default: m.PromoterCotasView })));
const CaixaDashboardView = lazy(() =>
  import('./views/CaixaDashboardView').then(m => ({ default: m.CaixaDashboardView })),
);
const PortariaListaDashView = lazy(() =>
  import('./views/PortariaListaDashView').then(m => ({ default: m.PortariaListaDashView })),
);
const PortariaQRDashView = lazy(() =>
  import('./views/PortariaQRDashView').then(m => ({ default: m.PortariaQRDashView })),
);
const SocioDashboardView = lazy(() =>
  import('./views/SocioDashboardView').then(m => ({ default: m.SocioDashboardView })),
);
const ListasView = lazy(() => import('./views/listas').then(m => ({ default: m.ListasView })));
const EventosPendentesView = lazy(() =>
  import('./views/EventosPendentesView').then(m => ({ default: m.EventosPendentesView })),
);
const AuditLogView = lazy(() => import('./views/AuditLogView').then(m => ({ default: m.AuditLogView })));
const SolicitacoesParceriaView = lazy(() =>
  import('./views/SolicitacoesParceriaView').then(m => ({ default: m.SolicitacoesParceriaView })),
);
const CategoriasAdminView = lazy(() =>
  import('./views/CategoriasAdminView').then(m => ({ default: m.CategoriasAdminView })),
);
const MaisVantaHubView = lazy(() => import('./views/MaisVantaHubView').then(m => ({ default: m.MaisVantaHubView })));
const TabClubeCuradoria = lazy(() => import('./views/curadoria/tabClube').then(m => ({ default: m.TabClube })));
const CidadesMaisVantaView = lazy(() =>
  import('./views/CidadesMaisVantaView').then(m => ({ default: m.CidadesMaisVantaView })),
);
const ParceirosMaisVantaView = lazy(() =>
  import('./views/ParceirosMaisVantaView').then(m => ({ default: m.ParceirosMaisVantaView })),
);
const DealsMaisVantaView = lazy(() =>
  import('./views/DealsMaisVantaView').then(m => ({ default: m.DealsMaisVantaView })),
);
const MonitoramentoMaisVantaView = lazy(() =>
  import('./views/MonitoramentoMaisVantaView').then(m => ({ default: m.MonitoramentoMaisVantaView })),
);
const ConvitesMaisVantaView = lazy(() =>
  import('./views/ConvitesMaisVantaView').then(m => ({ default: m.ConvitesMaisVantaView })),
);
const AnalyticsMaisVantaView = lazy(() =>
  import('./views/AnalyticsMaisVantaView').then(m => ({ default: m.AnalyticsMaisVantaView })),
);
const DiagnosticoView = lazy(() => import('./views/DiagnosticoView').then(m => ({ default: m.DiagnosticoView })));
const AssinaturasMaisVantaView = lazy(() =>
  import('./views/AssinaturasMaisVantaView').then(m => ({ default: m.AssinaturasMaisVantaView })),
);
const PassaportesMaisVantaView = lazy(() =>
  import('./views/PassaportesMaisVantaView').then(m => ({ default: m.PassaportesMaisVantaView })),
);
const DividaSocialMaisVantaView = lazy(() =>
  import('./views/DividaSocialMaisVantaView').then(m => ({ default: m.DividaSocialMaisVantaView })),
);
const MembrosGlobaisMaisVantaView = lazy(() =>
  import('./views/MembrosGlobaisMaisVantaView').then(m => ({ default: m.MembrosGlobaisMaisVantaView })),
);
const EventosGlobaisMaisVantaView = lazy(() =>
  import('./views/EventosGlobaisMaisVantaView').then(m => ({ default: m.EventosGlobaisMaisVantaView })),
);
const InfracoesGlobaisMaisVantaView = lazy(() =>
  import('./views/InfracoesGlobaisMaisVantaView').then(m => ({ default: m.InfracoesGlobaisMaisVantaView })),
);
const RelatorioMasterView = lazy(() => import('./views/relatorios').then(m => ({ default: m.RelatorioMasterView })));
const RelatorioComunidadeView = lazy(() =>
  import('./views/relatorios').then(m => ({ default: m.RelatorioComunidadeView })),
);
const GestaoComprovantesView = lazy(() =>
  import('./views/GestaoComprovantesView').then(m => ({ default: m.GestaoComprovantesView })),
);
const ProductAnalyticsView = lazy(() =>
  import('./views/ProductAnalyticsView').then(m => ({ default: m.ProductAnalyticsView })),
);
const PendenciasHubView = lazy(() => import('./views/PendenciasHubView').then(m => ({ default: m.PendenciasHubView })));
const PendenciasAppView = lazy(() => import('./views/PendenciasAppView').then(m => ({ default: m.PendenciasAppView })));
const ConfigPlataformaView = lazy(() =>
  import('./views/ConfigPlataformaView').then(m => ({ default: m.ConfigPlataformaView })),
);
const SiteContentView = lazy(() => import('./views/SiteContentView').then(m => ({ default: m.SiteContentView })));
const LegalEditorView = lazy(() => import('./views/LegalEditorView').then(m => ({ default: m.LegalEditorView })));
const GestaoUsuariosView = lazy(() =>
  import('./views/GestaoUsuariosView').then(m => ({ default: m.GestaoUsuariosView })),
);
const MasterDashboardView = lazy(() => import('./views/masterDashboard').then(m => ({ default: m.MasterDashboard })));
const InsightsDashboardView = lazy(() =>
  import('./views/insightsDashboard').then(m => ({ default: m.InsightsDashboardView })),
);
const ComunidadeDashboardView = lazy(() =>
  import('./views/comunidadeDashboard').then(m => ({ default: m.ComunidadeDashboard })),
);
const MaisVantaDashboardView = lazy(() =>
  import('./views/maisVantaDashboard').then(m => ({ default: m.MaisVantaDashboard })),
);
const FaqView = lazy(() => import('./views/FaqView').then(m => ({ default: m.FaqView })));
const LinksUteisView = lazy(() => import('./views/LinksUteisView').then(m => ({ default: m.LinksUteisView })));
const CondicoesProducerView = lazy(() =>
  import('./views/CondicoesProducerView').then(m => ({ default: m.CondicoesProducerView })),
);
export const AdminDashboardView: React.FC<{
  onClose: () => void;
  adminNome: string;
  adminRole?: ContaVantaLegacy;
  currentUserId?: string;
  addNotification: (n: Omit<Notificacao, 'id'>) => void;
  accessNodes?: AccessNode[];
  /** Contexto pré-selecionado vindo do AdminGateway */
  initialTenantId?: string;
  initialTenantTipo?: 'COMUNIDADE' | 'EVENTO';
}> = ({
  onClose,
  adminNome,
  adminRole = 'vanta_masteradm' as ContaVantaLegacy,
  currentUserId = '',
  addNotification,
  accessNodes = [],
  initialTenantId,
  initialTenantTipo,
}) => {
  const [subView, setSubView] = useState<AdminSubView>('DASHBOARD');
  const [promoterCotasListaId, setPromoterCotasListaId] = useState<string>('');
  const [caixaEventoId, setCaixaEventoId] = useState<string | undefined>(undefined);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => window.matchMedia('(min-width: 768px)').matches);
  const [toastMsg, setToastMsg] = useState('');
  const toast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Lazy service init — priorizado: eventos primeiro (Home precisa), resto em background
  useEffect(() => {
    // P1: essencial pro dashboard home (contadores, cards)
    void eventosAdminService.refresh();
    // P2: background — só quando acessar a view correspondente já terá cache
    const timer = setTimeout(() => {
      void import('./services/listasService').then(m => m.listasService.refresh());
      void import('./services/cortesiasService').then(m => m.cortesiasService.refresh());
      void import('./services/clubeService').then(m => m.clubeService.refresh());
      void import('./services/assinaturaService').then(m => m.assinaturaService.refresh());
      void import('./services/maisVantaConfigService').then(m => m.maisVantaConfigService.refresh());
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Detectar desktop (≥768px) para sidebar sempre expandido + max-w-4xl
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 768px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  const back = () => setSubView('DASHBOARD');

  // Para vanta_member: inicializa activeContext direto se tiver só 1 nó (sem tela de seleção)
  const [activeContext, setActiveContext] = useState<AccessNode | null>(() =>
    adminRole === 'vanta_member' && accessNodes.length === 1 ? accessNodes[0] : null,
  );

  // Detecta se estamos no escopo de comunidade
  const isInCommunity = Boolean(initialTenantId && initialTenantTipo === 'COMUNIDADE');

  // comunidadeId e gatewayEventoId usados por visibleSections e child views
  const comunidadeId = isInCommunity ? initialTenantId : undefined;
  const gatewayEventoId = initialTenantTipo === 'EVENTO' ? initialTenantId : undefined;

  // Filtro de seções por role + permissões reais — sidebar dinâmico conforme contexto
  const visibleSections = useMemo(() => {
    const base = isInCommunity ? COMMUNITY_SIDEBAR_SECTIONS : SIDEBAR_SECTIONS;
    const ctx = { communityId: comunidadeId, eventId: gatewayEventoId };
    // Mapa de guards por subView — itens sem guard aparecem se o role está no array
    const guardMap: Partial<Record<AdminSubView, boolean>> = {
      PORTARIA_QR: canAccessQR(currentUserId, adminRole, ctx),
      PORTARIA_LISTA: canAccessCheckin(currentUserId, adminRole, ctx),
      CAIXA: canAccessCaixa(currentUserId, adminRole, ctx),
      FINANCEIRO: canAccessFinanceiro(currentUserId, adminRole, ctx),
      LISTAS: canAccessListas(currentUserId, adminRole, ctx),
      MEUS_EVENTOS: canAccessMeusEventos(currentUserId, adminRole, ctx),
    };
    // Permissões de plataforma do usuário (RBAC V2)
    const permPlat = rbacService.getPermissoesPlataforma();

    // Mapa: seção da sidebar → permissão de plataforma que dá acesso
    const sectionPermMap: Record<string, string> = {
      'MAIS VANTA': 'GERIR_MAIS_VANTA',
      FINANCEIRO: 'GERIR_FINANCEIRO_GLOBAL',
      INTELIGÊNCIA: 'VER_ANALYTICS',
    };

    return base
      .map(section => ({
        ...section,
        items: section.items.filter(item => {
          const roles = item.roles as string[];
          // Primeiro: role no array OU permissão de plataforma equivalente
          const hasRole = roles.includes(adminRole as string);
          const hasPlatPerm =
            roles.includes('vanta_masteradm') &&
            sectionPermMap[section.label] &&
            permPlat.includes(sectionPermMap[section.label]);
          if (!hasRole && !hasPlatPerm) return false;
          // Segundo: se tem guard específico, aplicar
          if (item.id in guardMap) return guardMap[item.id];
          return true;
        }),
      }))
      .filter(section => section.items.length > 0);
  }, [adminRole, isInCommunity, currentUserId, comunidadeId, gatewayEventoId]);

  // Contagem de pendentes para o badge do sidebar
  const pendentesCount = useMemo(
    () => (adminRole === 'vanta_masteradm' ? eventosAdminService.getEventosPendentes().length : 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [adminRole, subView], // re-calcula quando muda de view (após aprovar/rejeitar)
  );

  // IDs de comunidades e eventos do usuário (para pendências)
  const comunidadeIds = useMemo(
    () => accessNodes.filter(n => n.tipo === 'COMUNIDADE').map(n => n.contextId),
    [accessNodes],
  );
  const eventoIds = useMemo(() => accessNodes.filter(n => n.tipo === 'EVENTO').map(n => n.contextId), [accessNodes]);

  // Badge de pendências do hub
  const [pendenciasHubCount, setPendenciasHubCount] = useState(0);
  useEffect(() => {
    if (!currentUserId || !adminRole) return;
    let cancelled = false;
    countPendencias(currentUserId, adminRole, comunidadeIds, eventoIds).then(count => {
      if (!cancelled) setPendenciasHubCount(count);
    });
    return () => {
      cancelled = true;
    };
  }, [currentUserId, adminRole, comunidadeIds, eventoIds, subView]);

  // Nome do tenant contextual (comunidade ou evento) passado pelo Gateway
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

  // Pendências calculadas para o DashboardView
  const [saquesCount, setSaquesCount] = useState(0);
  const [reembolsosCount, setReembolsosCount] = useState(0);
  useEffect(() => {
    if (adminRole === 'vanta_masteradm') {
      eventosAdminService
        .getSolicitacoesSaque()
        .then(list => setSaquesCount(list.filter((s: SolicitacaoSaque) => s.status === 'PENDENTE').length))
        .catch(() => setSaquesCount(0));
      getReembolsosPendentes()
        .then(list => setReembolsosCount(list.length))
        .catch(() => setReembolsosCount(0));
    }
  }, [adminRole, subView]);

  const dashPendencias = useMemo(() => {
    if (adminRole === 'vanta_masteradm') {
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
  }, [adminRole, subView, saquesCount, reembolsosCount]);

  // vanta_member: roteado via AccessNodes (mantém lógica específica)
  if (adminRole === 'vanta_member') {
    const backFn = accessNodes.length === 1 ? onClose : () => setActiveContext(null);

    if (activeContext) {
      if (
        activeContext.portalRole === 'vanta_ger_portaria_lista' ||
        activeContext.portalRole === 'vanta_portaria_lista'
      )
        return (
          <PortariaListaDashView
            onBack={backFn}
            currentUserId={currentUserId}
            isGerente={activeContext.portalRole === 'vanta_ger_portaria_lista'}
            onOpenPortaria={() => {
              setActiveContext(null);
              setSubView('PORTARIA_LISTA');
            }}
          />
        );
      if (
        activeContext.portalRole === 'vanta_ger_portaria_antecipado' ||
        activeContext.portalRole === 'vanta_portaria_antecipado'
      )
        return (
          <PortariaQRDashView
            onBack={backFn}
            currentUserId={currentUserId}
            isGerente={activeContext.portalRole === 'vanta_ger_portaria_antecipado'}
            onOpenScanner={() => {
              setActiveContext(null);
              setSubView('PORTARIA_QR');
            }}
          />
        );
      if (activeContext.portalRole === 'vanta_caixa')
        return (
          <CaixaDashboardView
            onBack={backFn}
            currentUserId={currentUserId}
            onOpenCaixa={eventoId => {
              setActiveContext(null);
              setSubView('CAIXA');
              setCaixaEventoId(eventoId);
            }}
          />
        );
      if (activeContext.portalRole === 'vanta_socio')
        return (
          <SocioDashboardView
            onBack={backFn}
            currentUserId={currentUserId}
            onNavigate={view => {
              setActiveContext(null);
              setSubView(view as AdminSubView);
            }}
          />
        );
      if (activeContext.portalRole === 'vanta_gerente')
        return <GerenteDashboardView onBack={backFn} currentUserId={currentUserId} addNotification={addNotification} />;
      if (activeContext.portalRole === 'vanta_promoter')
        return <PromoterDashView onBack={backFn} currentUserId={currentUserId} onNavigateGuestlist={() => {}} />;
    }

    // Tela de seleção (nodes.length > 1)
    return (
      <div className="absolute inset-0 bg-[#0A0A0A] z-[150] flex flex-col overflow-hidden">
        <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-10 pb-6 shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FFD300]" />
                <p className="text-[#FFD300]/60 text-[0.5625rem] font-black uppercase tracking-[0.25em]">
                  Acesso Liberado
                </p>
              </div>
              <h1 style={TYPOGRAPHY.screenTitle} className="text-2xl italic leading-none text-white">
                Escolha seu Portal
              </h1>
              <p className="text-zinc-400 text-xs mt-2">Olá, {adminNome}</p>
            </div>
            <button
              aria-label="Voltar"
              onClick={onClose}
              className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
            >
              <ArrowLeft size="1.125rem" className="text-zinc-400" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-5">
          {Object.entries(
            accessNodes.reduce<Record<string, typeof accessNodes>>((acc, node) => {
              const key = node.cargoLabel || node.portalRole;
              if (!acc[key]) acc[key] = [];
              acc[key].push(node);
              return acc;
            }, {}),
          ).map(([cargoLabel, nodes]) => (
            <div key={cargoLabel}>
              <p className="text-[0.5625rem] text-zinc-400 font-black uppercase tracking-wider mb-2">{cargoLabel}</p>
              <div className="space-y-2">
                {nodes.map(node => (
                  <button
                    key={node.id}
                    onClick={() => setActiveContext(node)}
                    className="w-full flex items-center gap-4 bg-zinc-900/30 border border-white/5 rounded-2xl p-4 active:bg-[#FFD300]/5 active:border-[#FFD300]/20 transition-all text-left"
                  >
                    {node.contextFoto && (
                      <img
                        src={node.contextFoto}
                        alt={node.contextNome}
                        className="w-14 h-14 rounded-xl object-cover shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <span
                        className={`text-[0.5625rem] font-black uppercase tracking-wider px-2 py-0.5 rounded mb-1.5 inline-block ${node.tipo === 'COMUNIDADE' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}
                      >
                        {node.tipo === 'COMUNIDADE' ? 'Local' : 'Evento'}
                      </span>
                      <p className="text-white font-bold text-sm leading-tight truncate">{node.contextNome}</p>
                    </div>
                    <ChevronRight size="1rem" className="text-zinc-700 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getRoleLista = (role: string): RoleListaNova => {
    if (role === 'vanta_masteradm' || role === 'vanta_socio' || role === 'vanta_gerente') return 'gerente';
    if (role === 'vanta_promoter') return 'promoter';
    if (role === 'vanta_ger_portaria_lista' || role === 'vanta_portaria_lista') return 'portaria_lista';
    if (role === 'vanta_ger_portaria_antecipado' || role === 'vanta_portaria_antecipado') return 'portaria_antecipado';
    return 'promoter';
  };

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

  const renderContent = () => {
    if (subView === 'DASHBOARD') {
      return (
        <AdminDashboardHome
          adminNome={adminNome}
          adminRole={adminRole}
          tenantNome={tenantNome}
          tenantArtigo={tenantArtigo}
          pendencias={dashPendencias}
          onNavigate={v => {
            if (v === 'MAIS_VANTA') {
              setSubView('MAIS_VANTA_HUB');
              return;
            }
            setSubView(v);
          }}
          comunidadeId={comunidadeId}
        />
      );
    }
    if (subView === 'MEUS_EVENTOS') {
      if (!canAccessMeusEventos(currentUserId, adminRole, { communityId: comunidadeId, eventId: gatewayEventoId }))
        return guardBlock(back);
      return adminRole === 'vanta_gerente' ? (
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
          currentUserRole={adminRole}
          comunidadeId={comunidadeId}
        />
      );
    }
    if (subView === 'CAIXA') {
      if (!canAccessCaixa(currentUserId, adminRole, { communityId: comunidadeId, eventId: gatewayEventoId }))
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
      if (!isMasterOnly(currentUserId, adminRole)) return guardBlock(back);
      return <CargosUnificadoView onBack={back} currentUserId={currentUserId} addNotification={addNotification} />;
    }
    // ── Inteligência VANTA ──────────────────────────────────────────────────
    if (subView === 'INTELIGENCIA') {
      return <InsightsDashboardView onBack={back} comunidadeId={comunidadeId} onNavigate={setSubView} />;
    }
    // ── Novos Dashboards Analytics ──────────────────────────────────────────
    if (subView === 'MASTER_DASHBOARD') {
      if (adminRole !== 'vanta_masteradm') return guardBlock(back);
      return (
        <MasterDashboardView
          onSelectComunidade={(_comId: string) => {
            // Drill-down to COMUNIDADES view for now
            setSubView('COMUNIDADES');
          }}
          onSelectEvento={(_evId: string) => {
            setSubView('MEUS_EVENTOS');
          }}
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
          onSelectEvento={(_evId: string) => {
            setSubView('MEUS_EVENTOS');
          }}
        />
      );
    }
    if (subView === 'MAIS_VANTA_DASHBOARD') {
      if (adminRole !== 'vanta_masteradm') return guardBlock(back);
      return <MaisVantaDashboardView onBack={back} />;
    }
    // Master: visão global da plataforma
    if (subView === 'FINANCEIRO_MASTER') {
      if (adminRole !== 'vanta_masteradm') return guardBlock(back);
      return <MasterFinanceiroView onBack={back} addNotification={addNotification} />;
    }
    // Sócio/Produtor: somente seus próprios dados financeiros
    if (subView === 'FINANCEIRO') {
      if (!canAccessFinanceiro(currentUserId, adminRole, { communityId: comunidadeId, eventId: gatewayEventoId }))
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
      if (!canAccessPortariaScanner(currentUserId, adminRole, { communityId: comunidadeId, eventId: gatewayEventoId }))
        return guardBlock(back);
      return <PortariaScannerView onBack={back} eventoId={gatewayEventoId} />;
    }
    if (subView === 'COMUNIDADES') {
      if (!canAccessComunidades(currentUserId, adminRole, { communityId: comunidadeId })) return guardBlock(back);
      return (
        <ComunidadesView
          onBack={back}
          adminRole={adminRole}
          adminNome={adminNome}
          memberId={currentUserId}
          focusComunidadeId={comunidadeId}
        />
      );
    }
    if (subView === 'INDICA') {
      if (!isMasterOnly(currentUserId, adminRole)) return guardBlock(back);
      return <VantaIndicaView onBack={back} userId={currentUserId} />;
    }
    if (subView === 'LISTAS') {
      if (!canAccessListas(currentUserId, adminRole, { communityId: comunidadeId, eventId: gatewayEventoId }))
        return guardBlock(back);
      return (
        <ListasView
          onBack={back}
          role={getRoleLista(adminRole)}
          userId={currentUserId}
          userNome={adminNome}
          comunidadeId={comunidadeId}
        />
      );
    }
    if (subView === 'PORTARIA_QR') {
      if (!canAccessQR(currentUserId, adminRole, { communityId: comunidadeId, eventId: gatewayEventoId }))
        return guardBlock(back);
      return <CheckInView onBack={back} comunidadeId={comunidadeId} modoFixo="QR" />;
    }
    if (subView === 'PORTARIA_LISTA') {
      if (!canAccessCheckin(currentUserId, adminRole, { communityId: comunidadeId, eventId: gatewayEventoId }))
        return guardBlock(back);
      return <CheckInView onBack={back} comunidadeId={comunidadeId} modoFixo="LISTA" />;
    }
    if (subView === 'NOTIFICACOES') {
      if (!isMasterOnly(currentUserId, adminRole)) return guardBlock(back);
      return <NotificacoesAdminView onBack={back} />;
    }
    if (subView === 'PENDENCIAS_HUB') {
      return (
        <PendenciasHubView
          userId={currentUserId}
          role={adminRole}
          comunidadeIds={comunidadeIds}
          eventoIds={eventoIds}
          onBack={back}
          onNavigate={setSubView}
        />
      );
    }
    if (subView === 'PENDENTES') {
      if (!isMasterOnly(currentUserId, adminRole)) return guardBlock(back);
      return <EventosPendentesView onBack={back} masterUserId={currentUserId} />;
    }
    if (subView === 'SOLICITACOES_PARCERIA') {
      if (!isMasterOnly(currentUserId, adminRole)) return guardBlock(back);
      return <SolicitacoesParceriaView onBack={back} />;
    }
    if (subView === 'AUDIT_LOG') {
      if (!isMasterOnly(currentUserId, adminRole)) return guardBlock(back);
      return <AuditLogView onBack={back} />;
    }
    if (subView === 'DIAGNOSTICO') {
      if (!isMasterOnly(currentUserId, adminRole)) return guardBlock(back);
      return <DiagnosticoView onBack={back} />;
    }
    if (subView === 'FAQ') {
      if (!isMasterOnly(currentUserId, adminRole)) return guardBlock(back);
      return <FaqView onBack={back} />;
    }
    if (subView === 'LINKS_UTEIS') {
      if (!isMasterOnly(currentUserId, adminRole)) return guardBlock(back);
      return <LinksUteisView onBack={back} />;
    }
    if (subView === 'CATEGORIAS') {
      if (!isMasterOnly(currentUserId, adminRole)) return guardBlock(back);
      return <CategoriasAdminView onBack={back} />;
    }
    if (subView === 'MAIS_VANTA_HUB') {
      if (adminRole !== 'vanta_masteradm') return guardBlock(back);
      return <MaisVantaHubView onBack={back} masterId={currentUserId} />;
    }
    if (subView === 'MONITORAMENTO_MV') {
      if (adminRole !== 'vanta_masteradm') return guardBlock(back);
      return <MonitoramentoMaisVantaView onBack={back} />;
    }
    if (subView === 'ASSINATURAS_MV') {
      if (adminRole !== 'vanta_masteradm') return guardBlock(back);
      return <AssinaturasMaisVantaView onBack={back} />;
    }
    if (subView === 'PASSAPORTES_MV') {
      if (adminRole !== 'vanta_masteradm') return guardBlock(back);
      return <PassaportesMaisVantaView onBack={back} masterId={currentUserId} />;
    }
    if (subView === 'DIVIDA_SOCIAL_MV') {
      if (adminRole !== 'vanta_masteradm') return guardBlock(back);
      return <DividaSocialMaisVantaView onBack={back} />;
    }
    if (subView === 'MEMBROS_GLOBAIS_MV') {
      if (adminRole !== 'vanta_masteradm' && adminRole !== 'vanta_gerente') return guardBlock(back);
      return <MembrosGlobaisMaisVantaView onBack={back} />;
    }
    if (subView === 'EVENTOS_GLOBAIS_MV') {
      if (adminRole !== 'vanta_masteradm') return guardBlock(back);
      return <EventosGlobaisMaisVantaView onBack={back} />;
    }
    if (subView === 'INFRACOES_GLOBAIS_MV') {
      if (adminRole !== 'vanta_masteradm') return guardBlock(back);
      return <InfracoesGlobaisMaisVantaView onBack={back} />;
    }
    if (subView === 'CIDADES_MV') {
      if (adminRole !== 'vanta_masteradm') return guardBlock(back);
      return <CidadesMaisVantaView />;
    }
    if (subView === 'PARCEIROS_MV') {
      if (adminRole !== 'vanta_masteradm' && adminRole !== 'vanta_gerente') return guardBlock(back);
      return <ParceirosMaisVantaView />;
    }
    if (subView === 'DEALS_MV') {
      if (adminRole !== 'vanta_masteradm' && adminRole !== 'vanta_gerente') return guardBlock(back);
      return <DealsMaisVantaView />;
    }
    if (subView === 'CURADORIA_MV') {
      if (adminRole !== 'vanta_masteradm') return guardBlock(back);
      return (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-8 pb-4 shrink-0">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-[0.5625rem] font-black uppercase tracking-[.25em] text-[#FFD300]/60 mb-1">
                  MAIS VANTA
                </p>
                <h1 className="text-xl font-bold italic text-white">Curadoria</h1>
              </div>
              <button
                aria-label="Voltar"
                onClick={back}
                className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
              >
                <ArrowLeft size="1.125rem" className="text-zinc-400" />
              </button>
            </div>
          </div>
          <TabClubeCuradoria adminId={currentUserId} toastFn={(_tipo, msg) => toast(msg)} comunidadeId={comunidadeId} />
        </div>
      );
    }
    if (subView === 'CONVITES_MV') {
      if (adminRole !== 'vanta_masteradm' && adminRole !== 'vanta_gerente') return guardBlock(back);
      return <ConvitesMaisVantaView onBack={back} toastFn={toast} />;
    }
    if (subView === 'ANALYTICS_MV') {
      if (adminRole !== 'vanta_masteradm') return guardBlock(back);
      return <AnalyticsMaisVantaView onBack={back} />;
    }
    if (subView === 'RELATORIO_MASTER') {
      if (adminRole === 'vanta_gerente' && comunidadeId) {
        const comNome = comunidadesService.get(comunidadeId)?.nome ?? 'Comunidade';
        return <RelatorioComunidadeView comunidadeId={comunidadeId} comunidadeNome={comNome} onBack={back} />;
      }
      if (adminRole !== 'vanta_masteradm') return guardBlock(back);
      return <RelatorioMasterView onBack={back} />;
    }
    if (subView === 'GESTAO_COMPROVANTES') {
      if (adminRole !== 'vanta_masteradm') return guardBlock(back);
      return <GestaoComprovantesView onBack={back} masterId={currentUserId} />;
    }
    if (subView === 'PRODUCT_ANALYTICS') {
      if (!isMasterOnly(currentUserId, adminRole)) return guardBlock(back);
      return <ProductAnalyticsView onBack={back} />;
    }
    if (subView === 'PROMOTER_COTAS') {
      if (promoterCotasListaId) {
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
      }
      return (
        <PromoterDashView
          onBack={back}
          currentUserId={currentUserId}
          onNavigateCotas={listaId => {
            setPromoterCotasListaId(listaId);
          }}
          onNavigateGuestlist={() => setSubView('LISTAS')}
        />
      );
    }
    if (subView === 'SITE_CONTENT') {
      if (!isMasterOnly(currentUserId, adminRole)) return guardBlock(back);
      return <SiteContentView onBack={back} currentUserId={currentUserId} />;
    }
    if (subView === 'LEGAL_EDITOR') {
      if (!isMasterOnly(currentUserId, adminRole)) return guardBlock(back);
      return <LegalEditorView onBack={back} currentUserId={currentUserId} />;
    }
    if (subView === 'GESTAO_USUARIOS') {
      if (!isMasterOnly(currentUserId, adminRole)) return guardBlock(back);
      return <GestaoUsuariosView onBack={back} />;
    }
    if (subView === 'CONFIG_PLATAFORMA') {
      if (!isMasterOnly(currentUserId, adminRole)) return guardBlock(back);
      return <ConfigPlataformaView onBack={back} currentUserId={currentUserId} />;
    }
    if (subView === 'PENDENCIAS_APP') {
      if (!isMasterOnly(currentUserId, adminRole)) return guardBlock(back);
      return <PendenciasAppView onBack={back} />;
    }
    if (subView === 'CONDICOES_COMERCIAIS') {
      return (
        <CondicoesProducerView
          onBack={back}
          comunidadeId={comunidadeId ?? ''}
          comunidadeNome={tenantNome ?? undefined}
        />
      );
    }

    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="w-1.5 h-1.5 rounded-full bg-[#FFD300]/40" />
        <p className="text-zinc-700 text-[0.625rem] font-black uppercase tracking-[0.2em]">Selecione um módulo</p>
      </div>
    );
  };

  return (
    <div className="absolute inset-0 bg-[#0A0A0A] z-[150] flex items-center justify-center">
      <div className={`w-full h-full flex flex-row overflow-hidden ${isDesktop ? '' : 'max-w-4xl'}`}>
        <AdminSidebar
          open={sidebarOpen}
          isDesktop={isDesktop}
          onToggle={() => setSidebarOpen(p => !p)}
          activeView={subView}
          onSelect={id => {
            if (id === 'MAIS_VANTA') {
              setSubView('MAIS_VANTA_HUB');
              if (!isDesktop) setSidebarOpen(false);
              return;
            }
            setSubView(id);
            if (!isDesktop) setSidebarOpen(false);
          }}
          onClose={onClose}
          adminRole={adminRole}
          visibleSections={visibleSections}
          pendentesCount={pendentesCount}
          pendenciasHubCount={pendenciasHubCount}
          totalPendencias={(Object.values(dashPendencias) as number[]).reduce((a, b) => a + b, 0)}
          tenantNome={tenantNome}
          tenantFoto={tenantFoto}
        />
        <div className="flex-1 min-w-0 relative overflow-hidden flex flex-col">
          {/* Breadcrumb — caminho de navegação */}
          {subView !== 'DASHBOARD' &&
            (() => {
              // Sub-views internas que não aparecem no sidebar
              const INTERNAL_CRUMBS: Partial<Record<AdminSubView, { section: string; label: string }>> = {
                DIVIDA_SOCIAL_MV: { section: 'MAIS VANTA', label: 'Dívida Social' },
                EVENTOS_GLOBAIS_MV: { section: 'MAIS VANTA', label: 'Eventos' },
                PORTARIA_SCANNER: { section: 'OPERAÇÃO', label: 'Scanner QR' },
              };
              const crumb =
                INTERNAL_CRUMBS[subView] ??
                visibleSections.reduce<{ section: string; label: string } | null>((acc, sec) => {
                  if (acc) return acc;
                  const found = sec.items.find(i => i.id === subView);
                  return found ? { section: sec.label, label: found.label } : null;
                }, null);
              if (!crumb) return null;
              return (
                <div className="shrink-0 flex items-center gap-1 px-4 py-2 border-b border-white/5 bg-[#080808]">
                  <button
                    onClick={() => setSubView('DASHBOARD')}
                    className="text-zinc-400 text-[0.625rem] font-semibold hover:text-zinc-300 transition-colors"
                  >
                    Painel
                  </button>
                  <ChevronRight size="0.625rem" className="text-zinc-700" />
                  <span className="text-zinc-400 text-[0.625rem] font-semibold">{crumb.section}</span>
                  <ChevronRight size="0.625rem" className="text-zinc-700" />
                  <span className="text-[#FFD300] text-[0.625rem] font-bold">{crumb.label}</span>
                </div>
              );
            })()}
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

        {/* Toast */}
        {toastMsg && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-zinc-800 border border-white/10 rounded-xl text-white text-xs font-medium z-[200] shadow-lg">
            {toastMsg}
          </div>
        )}
      </div>
    </div>
  );
};
