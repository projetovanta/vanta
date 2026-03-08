import React from 'react';
import {
  ArrowLeft,
  Users,
  Building2,
  QrCode,
  ListChecks,
  ShieldPlus,
  ChevronRight,
  Banknote,
  Database,
  Menu,
  ChevronLeft,
  User,
  Star,
  Calendar,
  ShoppingCart,
  ClipboardList,
  LayoutDashboard,
  Compass,
  Tag,
  Mail,
  Bell,
  Activity,
  BarChart3,
  Crown,
  Settings,
  AlertCircle,
  Gift,
  FileCheck,
  TrendingUp,
  Handshake,
  type LucideIcon,
} from 'lucide-react';
import type { ContaVanta } from '../../../types';

export type AdminSubView =
  | 'DASHBOARD'
  | 'CURADORIA'
  | 'COMUNIDADES'
  | 'INDICA'
  | 'NOTIFICACOES'
  | 'LISTAS'
  | 'PORTARIA_QR'
  | 'PORTARIA_LISTA'
  | 'CARGOS'
  | 'FINANCEIRO_MASTER'
  | 'FINANCEIRO'
  | 'PORTARIA_SCANNER'
  | 'MEUS_EVENTOS'
  | 'CAIXA'
  | 'PENDENTES'
  | 'AUDIT_LOG'
  | 'CATEGORIAS'
  | 'CONVITES_SOCIO'
  | 'PROMOTER_COTAS'
  | 'MAIS_VANTA_HUB'
  | 'MONITORAMENTO_MV'
  | 'DIAGNOSTICO'
  | 'ASSINATURAS_MV'
  | 'PASSAPORTES_MV'
  | 'DIVIDA_SOCIAL_MV'
  | 'MEMBROS_GLOBAIS_MV'
  | 'EVENTOS_GLOBAIS_MV'
  | 'INFRACOES_GLOBAIS_MV'
  | 'GESTAO_COMPROVANTES'
  | 'RELATORIO_MASTER'
  | 'PRODUCT_ANALYTICS'
  | 'MAIS_VANTA'
  | 'SOLICITACOES_PARCERIA'
  | 'PENDENCIAS_HUB';

export interface SidebarSectionItem {
  id: AdminSubView;
  label: string;
  icon: LucideIcon;
  color?: string;
  roles: ContaVanta[];
  badge?: number;
}

export interface SidebarSection {
  label: string;
  items: SidebarSectionItem[];
}

// audit-ok: Regra de acesso — vanta_masteradm: global | vanta_gerente: comunidade | vanta_socio: evento(s)
// vanta_ger_portaria_*/vanta_portaria_*: check-in | vanta_promoter: listas | vanta_caixa: caixa
export const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    label: 'GERAL',
    items: [
      {
        id: 'DASHBOARD',
        label: 'Início',
        icon: LayoutDashboard,
        color: '#FFD300',
        roles: ['vanta_masteradm', 'vanta_socio', 'vanta_gerente'],
      },
      {
        id: 'PENDENCIAS_HUB',
        label: 'Pendências',
        icon: AlertCircle,
        color: '#ef4444',
        roles: ['vanta_masteradm', 'vanta_socio', 'vanta_gerente'],
      },
      { id: 'CONVITES_SOCIO', label: 'Convites', icon: Mail, color: '#f59e0b', roles: ['vanta_socio'] },
    ],
  },
  {
    label: 'PESSOAS',
    items: [
      { id: 'CURADORIA', label: 'Curadoria', icon: Star, color: '#a78bfa', roles: ['vanta_masteradm'] },
      {
        id: 'GESTAO_COMPROVANTES',
        label: 'Comprovantes',
        icon: FileCheck,
        color: '#22d3ee',
        roles: ['vanta_masteradm'],
      },
      { id: 'CARGOS', label: 'Cargos', icon: ShieldPlus, color: '#f472b6', roles: ['vanta_masteradm'] },
    ],
  },
  {
    label: 'EVENTOS',
    items: [
      {
        id: 'PENDENTES',
        label: 'Pendentes',
        icon: ClipboardList,
        color: '#f59e0b',
        roles: ['vanta_masteradm'],
      },
      { id: 'CATEGORIAS', label: 'Categorias', icon: Tag, color: '#f97316', roles: ['vanta_masteradm'] },
      {
        id: 'SOLICITACOES_PARCERIA',
        label: 'Parcerias',
        icon: Handshake,
        color: '#22d3ee',
        roles: ['vanta_masteradm'],
      },
    ],
  },
  {
    label: 'FINANCEIRO',
    items: [
      { id: 'FINANCEIRO_MASTER', label: 'Financeiro', icon: Banknote, color: '#10b981', roles: ['vanta_masteradm'] },
      {
        id: 'RELATORIO_MASTER',
        label: 'Relatórios',
        icon: BarChart3,
        color: '#FFD300',
        roles: ['vanta_masteradm'],
      },
    ],
  },
  {
    label: 'MAIS VANTA',
    items: [
      { id: 'MAIS_VANTA_HUB', label: 'Configuração', icon: Crown, color: '#FFD300', roles: ['vanta_masteradm'] },
      { id: 'MONITORAMENTO_MV', label: 'Monitoramento', icon: Users, color: '#FFD300', roles: ['vanta_masteradm'] },
      { id: 'ASSINATURAS_MV', label: 'Assinaturas', icon: Gift, color: '#a78bfa', roles: ['vanta_masteradm'] },
      { id: 'PASSAPORTES_MV', label: 'Passaportes', icon: Compass, color: '#22d3ee', roles: ['vanta_masteradm'] },
    ],
  },
  {
    label: 'MARKETING',
    items: [
      { id: 'INDICA', label: 'Vanta Indica', icon: Compass, color: '#f97316', roles: ['vanta_masteradm'] },
      { id: 'NOTIFICACOES', label: 'Notificações', icon: Bell, color: '#f59e0b', roles: ['vanta_masteradm'] },
    ],
  },
  {
    label: 'SISTEMA',
    items: [
      {
        id: 'COMUNIDADES',
        label: 'Comunidades',
        icon: Building2,
        color: '#60a5fa',
        roles: ['vanta_masteradm', 'vanta_gerente', 'vanta_socio'],
      },
      {
        id: 'PRODUCT_ANALYTICS',
        label: 'Analytics',
        icon: TrendingUp,
        color: '#8b5cf6',
        roles: ['vanta_masteradm'],
      },
      { id: 'DIAGNOSTICO', label: 'Diagnóstico', icon: Activity, color: '#22d3ee', roles: ['vanta_masteradm'] },
    ],
  },
];

// Sidebar dedicado para contexto de comunidade (master na comunidade = gerente + extras)
export const COMMUNITY_SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    label: 'GERAL',
    items: [
      {
        id: 'DASHBOARD',
        label: 'Início',
        icon: LayoutDashboard,
        color: '#FFD300',
        roles: [
          'vanta_masteradm',
          'vanta_socio',
          'vanta_gerente',
          'vanta_promoter',
          'vanta_ger_portaria_lista',
          'vanta_portaria_lista',
          'vanta_ger_portaria_antecipado',
          'vanta_portaria_antecipado',
          'vanta_caixa',
        ],
      },
      {
        id: 'PENDENCIAS_HUB',
        label: 'Pendências',
        icon: AlertCircle,
        color: '#ef4444',
        roles: [
          'vanta_masteradm',
          'vanta_socio',
          'vanta_gerente',
          'vanta_promoter',
          'vanta_ger_portaria_lista',
          'vanta_portaria_lista',
          'vanta_ger_portaria_antecipado',
          'vanta_portaria_antecipado',
          'vanta_caixa',
        ],
      },
      {
        id: 'MEUS_EVENTOS',
        label: 'Eventos',
        icon: Calendar,
        color: '#a78bfa',
        roles: ['vanta_masteradm', 'vanta_socio', 'vanta_gerente'],
      },
    ],
  },
  {
    label: 'OPERAÇÃO',
    items: [
      {
        id: 'PORTARIA_QR',
        label: 'Scanner QR',
        icon: QrCode,
        color: '#22d3ee',
        roles: ['vanta_masteradm', 'vanta_ger_portaria_antecipado', 'vanta_portaria_antecipado'],
      },
      {
        id: 'PORTARIA_LISTA',
        label: 'Check-in Lista',
        icon: ListChecks,
        color: '#22d3ee',
        roles: ['vanta_masteradm', 'vanta_ger_portaria_lista', 'vanta_portaria_lista'],
      },
      {
        id: 'CAIXA',
        label: 'Caixa',
        icon: ShoppingCart,
        color: '#f59e0b',
        roles: ['vanta_masteradm', 'vanta_caixa'],
      },
      {
        id: 'LISTAS',
        label: 'Listas',
        icon: ListChecks,
        color: '#60a5fa',
        roles: ['vanta_masteradm', 'vanta_socio', 'vanta_gerente', 'vanta_promoter'],
      },
      { id: 'PROMOTER_COTAS', label: 'Minhas Cotas', icon: BarChart3, color: '#a78bfa', roles: ['vanta_promoter'] },
    ],
  },
  {
    label: 'FINANCEIRO',
    items: [
      {
        id: 'FINANCEIRO',
        label: 'Financeiro',
        icon: Banknote,
        color: '#10b981',
        roles: ['vanta_masteradm', 'vanta_socio', 'vanta_gerente'],
      },
      {
        id: 'RELATORIO_MASTER',
        label: 'Relatórios',
        icon: BarChart3,
        color: '#FFD300',
        roles: ['vanta_masteradm', 'vanta_gerente'],
      },
    ],
  },
  {
    label: 'MAIS VANTA',
    items: [
      { id: 'MAIS_VANTA_HUB', label: 'MAIS VANTA', icon: Crown, color: '#FFD300', roles: ['vanta_masteradm'] },
      { id: 'MAIS_VANTA', label: 'MAIS VANTA', icon: Crown, color: '#FFD300', roles: ['vanta_socio'] },
    ],
  },
  {
    label: 'ADMINISTRAÇÃO',
    items: [
      {
        id: 'COMUNIDADES',
        label: 'Editar Comunidade',
        icon: Building2,
        color: '#60a5fa',
        roles: ['vanta_masteradm', 'vanta_gerente'],
      },
      { id: 'AUDIT_LOG', label: 'Audit Log', icon: ClipboardList, color: '#f59e0b', roles: ['vanta_masteradm'] },
    ],
  },
];

export const AdminSidebar: React.FC<{
  open: boolean;
  isDesktop: boolean;
  onToggle: () => void;
  activeView: AdminSubView;
  onSelect: (id: AdminSubView) => void;
  onClose: () => void;
  adminRole: ContaVanta;
  visibleSections: SidebarSection[];
  pendentesCount?: number;
  convitesCount?: number;
  pendenciasHubCount?: number;
  totalPendencias?: number;
  tenantNome?: string;
  tenantFoto?: string;
}> = ({
  open,
  isDesktop,
  onToggle,
  activeView,
  onSelect,
  onClose,
  visibleSections,
  pendentesCount = 0,
  convitesCount = 0,
  pendenciasHubCount = 0,
  totalPendencias = 0,
  tenantNome,
  tenantFoto,
}) => {
  // Desktop: sempre expandido. Mobile: toggle manual.
  const expanded = isDesktop || open;

  return (
    <aside
      className={`shrink-0 flex flex-col bg-[#080808] border-r border-white/5 overflow-hidden transition-all duration-200 ${expanded ? (isDesktop ? 'w-56' : 'w-48') : 'w-14'}`}
    >
      {/* Header */}
      <div className="h-14 flex items-center shrink-0 border-b border-white/5 ">
        {expanded ? (
          <div className="flex items-center w-full px-2 gap-1">
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-lg active:bg-white/5 transition-all relative"
            >
              <ArrowLeft size={16} className="text-zinc-400" />
              {totalPendencias > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] bg-red-500 text-white text-[7px] font-black rounded-full flex items-center justify-center px-0.5 leading-none">
                  {totalPendencias > 99 ? '99+' : totalPendencias}
                </span>
              )}
            </button>
            {tenantNome ? (
              <div className="flex-1 flex items-center gap-1.5 min-w-0 px-1">
                {tenantFoto ? (
                  <img loading="lazy" src={tenantFoto} alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />
                ) : null}
                <span className="text-zinc-400 text-[9px] font-black uppercase tracking-widest truncate">
                  {tenantNome}
                </span>
              </div>
            ) : (
              <span className="flex-1 text-zinc-500 text-[9px] font-black uppercase tracking-widest truncate px-1">
                Portal VANTA
              </span>
            )}
            {!isDesktop && (
              <button
                onClick={onToggle}
                className="flex items-center justify-center w-8 h-8 rounded-lg active:bg-white/5 transition-all"
              >
                <ChevronLeft size={16} className="text-zinc-400" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <button
              onClick={onToggle}
              className="flex items-center justify-center w-10 h-10 rounded-lg active:bg-white/5 transition-all"
            >
              <Menu size={18} className="text-zinc-400" />
            </button>
          </div>
        )}
      </div>

      {/* Nav — seções */}
      <nav className="flex-1 overflow-y-auto no-scrollbar py-2">
        {visibleSections.map(section => (
          <div key={section.label} className="mb-3">
            {expanded && (
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-700 px-4 pt-2 pb-1">
                {section.label}
              </p>
            )}
            {section.items.map(item => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              const iconColor = item.color ?? (isActive ? '#FFD300' : undefined);
              const badgeCount =
                item.id === 'PENDENTES'
                  ? pendentesCount
                  : item.id === 'CONVITES_SOCIO'
                    ? convitesCount
                    : item.id === 'PENDENCIAS_HUB'
                      ? pendenciasHubCount
                      : (item.badge ?? 0);
              return (
                <button
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all relative ${
                    isActive ? 'bg-[#FFD300]/10 text-white' : 'text-zinc-500 active:bg-white/5 active:text-zinc-300'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r bg-[#FFD300]" />
                  )}
                  <div className="relative shrink-0">
                    <Icon size={18} style={iconColor ? { color: iconColor } : undefined} />
                    {!expanded && badgeCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 text-black text-[7px] font-black rounded-full flex items-center justify-center leading-none">
                        {badgeCount > 9 ? '9+' : badgeCount}
                      </span>
                    )}
                  </div>
                  {expanded && (
                    <>
                      <span className="flex-1 text-xs font-semibold truncate leading-none">{item.label}</span>
                      {badgeCount > 0 && (
                        <span className="shrink-0 min-w-[18px] h-[18px] bg-amber-500 text-black text-[8px] font-black rounded-full flex items-center justify-center px-1 leading-none">
                          {badgeCount > 99 ? '99+' : badgeCount}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer — ícone de usuário */}
      <div className="shrink-0 border-t border-white/5 p-2">
        <div className="flex items-center justify-center h-9">
          <User size={16} className="text-zinc-600" />
        </div>
      </div>
    </aside>
  );
};
