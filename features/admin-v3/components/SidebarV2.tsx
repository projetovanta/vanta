import React from 'react';
import {
  LayoutDashboard,
  AlertCircle,
  Crown,
  Banknote,
  BarChart3,
  FileText,
  Building2,
  Calendar,
  Shield,
  ShoppingCart,
  ListChecks,
  Bell,
  Compass,
  FileCheck,
  Handshake,
  Settings,
  X,
} from 'lucide-react';

export type NavItem =
  | 'DASHBOARD'
  | 'PENDENCIAS'
  | 'MAIS_VANTA'
  | 'FINANCEIRO'
  | 'ANALYTICS'
  | 'RELATORIOS'
  | 'COMUNIDADES'
  | 'EVENTOS'
  | 'PORTARIA'
  | 'CAIXA'
  | 'LISTAS'
  | 'NOTIFICACOES'
  | 'INDICA'
  | 'COMPROVANTES'
  | 'PARCERIAS'
  | 'SISTEMA';

interface SidebarItemDef {
  id: NavItem;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number;
}
interface SidebarSectionDef {
  label: string;
  items: SidebarItemDef[];
}

const SECTIONS: SidebarSectionDef[] = [
  {
    label: 'INÍCIO',
    items: [
      { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'PENDENCIAS', label: 'Pendências', icon: AlertCircle, badge: 3 },
      { id: 'MAIS_VANTA', label: 'MAIS VANTA', icon: Crown, badge: 7 },
    ],
  },
  {
    label: 'NÚMEROS',
    items: [
      { id: 'FINANCEIRO', label: 'Financeiro', icon: Banknote },
      { id: 'ANALYTICS', label: 'Analytics', icon: BarChart3 },
      { id: 'RELATORIOS', label: 'Relatórios', icon: FileText },
    ],
  },
  {
    label: 'OPERAR',
    items: [
      { id: 'COMUNIDADES', label: 'Comunidades', icon: Building2 },
      { id: 'EVENTOS', label: 'Eventos', icon: Calendar },
      { id: 'PORTARIA', label: 'Portaria', icon: Shield },
      { id: 'CAIXA', label: 'Caixa', icon: ShoppingCart },
      { id: 'LISTAS', label: 'Listas', icon: ListChecks },
      { id: 'NOTIFICACOES', label: 'Notificações', icon: Bell },
      { id: 'INDICA', label: 'Vanta Indica', icon: Compass },
    ],
  },
  {
    label: 'SISTEMA',
    items: [
      { id: 'COMPROVANTES', label: 'Comprovantes', icon: FileCheck },
      { id: 'PARCERIAS', label: 'Parcerias', icon: Handshake },
      { id: 'SISTEMA', label: 'Sistema', icon: Settings },
    ],
  },
];

interface Props {
  active: NavItem;
  onSelect: (id: NavItem) => void;
  onClose: () => void;
  isDesktop: boolean;
}

export const SidebarV2: React.FC<Props> = ({ active, onSelect, onClose, isDesktop }) => (
  <div
    className={`shrink-0 flex flex-col border-r border-white/5 overflow-hidden transition-all duration-200 ${isDesktop ? 'w-52' : 'w-48'}`}
    style={{ background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(20px)' }}
  >
    <div className="flex items-center justify-between px-4 h-14 border-b border-white/5">
      <div className="flex items-center gap-2">
        <span className="font-serif italic font-bold text-xl text-[#FFD300]">V</span>
        <span className="text-[0.5rem] font-black uppercase tracking-widest text-zinc-500">Admin</span>
      </div>
      <button onClick={onClose} className="p-2 text-zinc-600 hover:text-zinc-400 transition-colors">
        <X size="0.875rem" />
      </button>
    </div>
    <div className="flex-1 overflow-y-auto no-scrollbar px-2 py-3 space-y-4">
      {SECTIONS.map(section => (
        <div key={section.label}>
          <p className="px-2 mb-1.5 text-[0.5rem] font-black uppercase tracking-[0.2em] text-zinc-600">
            {section.label}
          </p>
          <div className="space-y-0.5">
            {section.items.map(item => {
              const Icon = item.icon;
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    isActive ? 'bg-[#FFD300]/10 text-[#FFD300]' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                  }`}
                >
                  <Icon size="0.875rem" className={isActive ? 'text-[#FFD300]' : 'text-zinc-600'} />
                  <span className="flex-1 text-left truncate text-xs font-medium">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[0.5rem] font-black ${
                        isActive ? 'bg-[#FFD300]/20 text-[#FFD300]' : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  </div>
);
