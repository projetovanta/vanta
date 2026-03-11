import React from 'react';
import { Heart, Wallet, Crown } from 'lucide-react';

interface QuickActionsProps {
  onNavigateToProfile: (sub: string) => void;
  onNavigateToSearch: () => void;
  ticketCount: number;
  savedCount: number;
}

const actions = [
  { key: 'WALLET', label: 'Carteira', Icon: Wallet, target: 'profile' },
  { key: 'FAVORITOS', label: 'Favoritos', Icon: Heart, target: 'search' },
  { key: 'CLUBE', label: 'MAIS VANTA', Icon: Crown, target: 'profile' },
] as const;

export const QuickActions: React.FC<QuickActionsProps> = React.memo(
  ({ onNavigateToProfile, onNavigateToSearch, ticketCount, savedCount }) => {
    const getBadge = (key: string) => {
      if (key === 'WALLET' && ticketCount > 0) return ticketCount;
      if (key === 'FAVORITOS' && savedCount > 0) return savedCount;
      return 0;
    };

    const handleClick = (key: string, target: string) => {
      if (target === 'search') {
        onNavigateToSearch();
      } else {
        onNavigateToProfile(key);
      }
    };

    return (
      /* px-5 individual — carrossel com edge-bleed, não usar px global */
      <div className="px-5 pb-2">
        <div className="flex gap-2">
          {actions.map(({ key, label, Icon, target }) => {
            const badge = getBadge(key);
            return (
              <button
                key={key}
                onClick={() => handleClick(key, target)}
                className="flex-1 flex items-center justify-center gap-1.5 bg-zinc-900 border border-white/5 rounded-full h-10 px-2.5 active:scale-95 transition-transform min-w-0"
              >
                <Icon size="0.75rem" className="text-[#FFD300] shrink-0" />
                <span className="text-[0.5625rem] font-bold text-zinc-300 uppercase tracking-tight truncate">
                  {label}
                </span>
                {badge > 0 && (
                  <span className="bg-[#FFD300] text-black text-[0.5rem] font-black rounded-full min-w-[1rem] h-4 flex items-center justify-center px-1 shrink-0">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  },
);
