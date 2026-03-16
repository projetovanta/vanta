import React from 'react';
import { LayoutDashboard, BarChart3, Zap, Crown, Settings, X } from 'lucide-react';

type NavItem = 'HOME' | 'DADOS' | 'ACOES' | 'MV' | 'CONFIG';

const NAV_ITEMS: { id: NavItem; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'HOME', label: 'Home', icon: LayoutDashboard },
  { id: 'DADOS', label: 'Dados', icon: BarChart3 },
  { id: 'ACOES', label: 'Ações', icon: Zap },
  { id: 'MV', label: 'MV', icon: Crown },
  { id: 'CONFIG', label: 'Config', icon: Settings },
];

interface Props {
  active: NavItem;
  onSelect: (id: NavItem) => void;
  onClose: () => void;
  isDesktop: boolean;
}

export const SidebarV2: React.FC<Props> = ({ active, onSelect, onClose, isDesktop }) => {
  return (
    <div
      className={`shrink-0 flex flex-col bg-[#080808] border-r border-white/5 transition-all duration-200 ${isDesktop ? 'w-20' : 'w-16'}`}
    >
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-white/5">
        <span className="text-[#FFD300] font-serif italic font-bold text-lg">V</span>
      </div>

      {/* Nav items */}
      <div className="flex-1 flex flex-col items-center gap-1 py-4">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                isActive ? 'bg-[#FFD300]/10 text-[#FFD300]' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
              }`}
            >
              <Icon size="1.25rem" />
              <span className="text-[0.5rem] font-bold uppercase tracking-wider">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Close */}
      <button
        onClick={onClose}
        className="flex items-center justify-center h-14 border-t border-white/5 text-zinc-600 hover:text-zinc-400 transition-colors"
      >
        <X size="1.125rem" />
      </button>
    </div>
  );
};

export type { NavItem };
