/**
 * AdminV3Gateway — V2 Melhorado com 16 itens (mesclados de 26)
 * Rota: /admin-v3
 * 4 seções: INÍCIO, NÚMEROS, OPERAR, SISTEMA
 * Sidebar completa + glass + command palette
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Star,
  Users,
  Crown,
  Banknote,
  Calendar,
  BarChart3,
  Shield,
  Bell,
  Compass,
  AlertCircle,
  Settings,
  FileCheck,
  Handshake,
  ShoppingCart,
  ListChecks,
  FileText,
  Building2,
  Tag,
  ShieldPlus,
  Activity,
  HelpCircle,
  LinkIcon,
  ClipboardList,
  Send,
  Sparkles,
  Eye,
  MapPin,
  Store,
  Ticket,
} from 'lucide-react';
import { SidebarV2, type NavItem } from './components/SidebarV2';
import { CommandPalette } from './components/CommandPalette';
import { HomeV2 } from './pages/HomeV2';

// ── Tab page component ──
const TabPage: React.FC<{
  title: string;
  subtitle: string;
  tabs: { id: string; label: string; icon: typeof Star }[];
  color?: string;
}> = ({ title, subtitle, tabs, color = '#FFD300' }) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? '');
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-serif italic text-white">{title}</h1>
        <p className="text-zinc-400 text-sm mt-1">{subtitle}</p>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[0.5625rem] font-bold uppercase tracking-wider border transition-all ${
                isActive
                  ? 'text-black border-transparent'
                  : 'bg-zinc-900/60 border-white/5 text-zinc-400 active:bg-white/5'
              }`}
              style={isActive ? { backgroundColor: color } : undefined}
            >
              <Icon size="0.75rem" /> {t.label}
            </button>
          );
        })}
      </div>
      <div
        className="rounded-2xl p-8 flex flex-col items-center justify-center min-h-[250px]"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
      >
        <p className="text-zinc-500 text-sm">
          Aqui carrega <span className="text-white font-bold">{tabs.find(t => t.id === activeTab)?.label}</span> real
        </p>
        <p className="text-zinc-600 text-xs mt-2">Conectando com services existentes na próxima fase</p>
      </div>
    </div>
  );
};

// ── Pages config ──
const PAGES: Record<
  NavItem,
  { title: string; subtitle: string; tabs: { id: string; label: string; icon: typeof Star }[]; color?: string }
> = {
  DASHBOARD: { title: '', subtitle: '', tabs: [] },
  PENDENCIAS: {
    title: 'Pendências',
    subtitle: 'Tudo que precisa de atenção',
    tabs: [
      { id: 'TODAS', label: 'Todas', icon: AlertCircle },
      { id: 'EVENTOS', label: 'Eventos Pendentes', icon: ClipboardList },
      { id: 'CORTESIAS', label: 'Cortesias', icon: Star },
      { id: 'REEMBOLSOS', label: 'Reembolsos', icon: Banknote },
    ],
  },
  MAIS_VANTA: {
    title: 'MAIS VANTA',
    subtitle: 'Tudo do programa num lugar só',
    tabs: [
      { id: 'CURADORIA', label: 'Curadoria', icon: Star },
      { id: 'MEMBROS', label: 'Membros', icon: Users },
      { id: 'CONVITES', label: 'Convites', icon: Send },
      { id: 'INFRACOES', label: 'Infrações', icon: AlertCircle },
      { id: 'PARCEIROS', label: 'Parceiros', icon: Store },
      { id: 'BENEFICIOS', label: 'Benefícios', icon: Ticket },
      { id: 'CIDADES', label: 'Cidades', icon: MapPin },
      { id: 'PASSAPORTES', label: 'Passaportes', icon: Compass },
      { id: 'MONITOR', label: 'Monitor', icon: Eye },
      { id: 'PAINEL', label: 'Painel', icon: Sparkles },
      { id: 'CONFIG', label: 'Config', icon: Settings },
    ],
    color: '#FFD300',
  },
  FINANCEIRO: {
    title: 'Financeiro',
    subtitle: 'Receita, saques e dinheiro',
    tabs: [
      { id: 'GLOBAL', label: 'Visão Global', icon: Banknote },
      { id: 'COMUNIDADE', label: 'Por Comunidade', icon: Building2 },
    ],
    color: '#34D399',
  },
  ANALYTICS: {
    title: 'Analytics',
    subtitle: 'Dados, métricas e inteligência',
    tabs: [
      { id: 'PRODUTO', label: 'Produto', icon: BarChart3 },
      { id: 'MV', label: 'MAIS VANTA', icon: Crown },
      { id: 'INTELIGENCIA', label: 'Inteligência', icon: Sparkles },
      { id: 'MASTER', label: 'Painel Master', icon: Crown },
    ],
    color: '#34D399',
  },
  RELATORIOS: {
    title: 'Relatórios',
    subtitle: 'Exportar dados',
    tabs: [
      { id: 'GLOBAL', label: 'Global', icon: FileText },
      { id: 'COMUNIDADE', label: 'Por Comunidade', icon: Building2 },
    ],
    color: '#34D399',
  },
  COMUNIDADES: { title: 'Comunidades', subtitle: 'Casas, bares e espaços', tabs: [] },
  EVENTOS: { title: 'Eventos', subtitle: 'Criar, editar e gerenciar', tabs: [] },
  PORTARIA: {
    title: 'Portaria',
    subtitle: 'Check-in do dia',
    tabs: [
      { id: 'QR', label: 'Scanner QR', icon: Shield },
      { id: 'LISTA', label: 'Check-in Lista', icon: ListChecks },
    ],
    color: '#A78BFA',
  },
  CAIXA: { title: 'Caixa', subtitle: 'Venda presencial', tabs: [] },
  LISTAS: { title: 'Listas', subtitle: 'Convidados e promoters', tabs: [] },
  NOTIFICACOES: { title: 'Notificações', subtitle: 'Push segmentado', tabs: [] },
  INDICA: { title: 'Vanta Indica', subtitle: 'Curadoria editorial', tabs: [] },
  COMPROVANTES: { title: 'Comprovantes', subtitle: 'Meia-entrada', tabs: [] },
  PARCERIAS: { title: 'Parcerias', subtitle: 'Solicitações de parceria', tabs: [] },
  SISTEMA: {
    title: 'Sistema',
    subtitle: 'Configurações e ferramentas',
    tabs: [
      { id: 'CATEGORIAS', label: 'Categorias', icon: Tag },
      { id: 'CARGOS', label: 'Cargos', icon: ShieldPlus },
      { id: 'DIAGNOSTICO', label: 'Diagnóstico', icon: Activity },
      { id: 'FAQ', label: 'FAQ', icon: HelpCircle },
      { id: 'LINKS', label: 'Links Úteis', icon: LinkIcon },
      { id: 'AUDIT', label: 'Audit Log', icon: ClipboardList },
    ],
    color: '#525252',
  },
};

export const AdminV3Gateway: React.FC = () => {
  const [activeNav, setActiveNav] = useState<NavItem>('DASHBOARD');
  const [showPalette, setShowPalette] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 768px)').matches);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const h = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
      if (!e.matches) setSidebarOpen(false);
    };
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

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

  const handleNavigate = useCallback((view: string) => {
    const valid = Object.keys(PAGES);
    if (valid.includes(view)) setActiveNav(view as NavItem);
  }, []);

  const page = PAGES[activeNav];

  return (
    <div className="absolute inset-0 flex bg-[#050505] text-white overflow-hidden">
      {sidebarOpen && (
        <SidebarV2
          active={activeNav}
          onSelect={id => {
            setActiveNav(id);
            if (!isDesktop) setSidebarOpen(false);
          }}
          onClose={() => setSidebarOpen(false)}
          isDesktop={isDesktop}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          className="shrink-0 flex items-center gap-3 px-5 h-14 border-b border-white/5"
          style={{ background: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(15px)' }}
        >
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} className="p-2 text-zinc-500 hover:text-white">
              <Search size="1rem" />
            </button>
          )}
          <button
            onClick={() => setShowPalette(true)}
            className="flex-1 flex items-center gap-3 bg-white/3 border border-white/5 rounded-xl px-4 py-2.5 text-left hover:bg-white/5 transition-colors"
          >
            <Search size="0.875rem" className="text-zinc-500" />
            <span className="text-sm text-zinc-500">Buscar...</span>
            <kbd className="ml-auto px-2 py-0.5 bg-zinc-800 text-zinc-600 text-[0.5rem] font-bold rounded border border-white/10">
              ⌘K
            </kbd>
          </button>
          <div className="w-8 h-8 rounded-full bg-[#FFD300] flex items-center justify-center shrink-0">
            <span className="text-black text-xs font-black">D</span>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col bg-[#0A0A0A]">
          {activeNav === 'DASHBOARD' ? (
            <HomeV2 onNavigate={handleNavigate} />
          ) : page.tabs.length > 0 ? (
            <TabPage title={page.title} subtitle={page.subtitle} tabs={page.tabs} color={page.color} />
          ) : (
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
              <h1 className="text-2xl font-serif italic text-white">{page.title}</h1>
              <p className="text-zinc-400 text-sm">{page.subtitle}</p>
              <div
                className="rounded-2xl p-8 flex flex-col items-center justify-center min-h-[250px]"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <p className="text-zinc-500 text-sm">
                  Aqui carrega <span className="text-white font-bold">{page.title}</span> real
                </p>
                <p className="text-zinc-600 text-xs mt-2">View existente será plugada na próxima fase</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <CommandPalette isOpen={showPalette} onClose={() => setShowPalette(false)} onSelect={handleNavigate} />

      <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400 text-[0.5rem] font-black uppercase tracking-wider pointer-events-none z-[600]">
        V3 — 16 itens mesclados
      </div>
    </div>
  );
};
