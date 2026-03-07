import React from 'react';
import { Home, Map, Search, User, Shield, Bell, ChevronDown, MessageSquare } from 'lucide-react';
import { TabState } from '../types';
import { TYPOGRAPHY } from '../constants';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';

export const TabBar: React.FC<{
  activeTab: TabState;
  setActiveTab: (tab: TabState) => void;
}> = ({ activeTab, setActiveTab }) => {
  const unreadMessagesCount = useChatStore(s => s.totalUnreadMessages);
  const tabs = [
    { id: 'INICIO', icon: Home, label: 'Início' },
    { id: 'RADAR', icon: Map, label: 'Radar' },
    { id: 'BUSCAR', icon: Search, label: 'Buscar' },
    { id: 'MENSAGENS', icon: MessageSquare, label: 'Mensagens', badge: unreadMessagesCount > 0 },
    { id: 'PERFIL', icon: User, label: 'Perfil' },
  ];
  return (
    <nav className="shrink-0 w-full z-[100]" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) * 0.5)' }}>
      <div className="flex justify-around items-center h-11 bg-[#050505] border-t border-white/5">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabState)}
            className="relative flex flex-col items-center justify-center flex-1 h-11 active:opacity-60 transition-all"
          >
            <tab.icon size={16} className={`mb-0.5 ${activeTab === tab.id ? 'text-[#FFD300]' : 'text-zinc-400'}`} />
            <span
              className={`text-[6px] font-black uppercase tracking-[0.2em] ${activeTab === tab.id ? 'text-white' : 'text-zinc-400'}`}
            >
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export const Header: React.FC<{
  onProfileClick: () => void;
  onCityClick: () => void;
  onNotificationClick: () => void;
  showAdmin?: boolean;
  onAdminClick?: () => void;
  isCitySelectorOpen?: boolean;
}> = ({ onProfileClick, onCityClick, onNotificationClick, showAdmin, onAdminClick, isCitySelectorOpen }) => {
  const userPhoto = useAuthStore(s => s.profile.foto);
  const currentCity = useAuthStore(s => s.selectedCity);
  const notificationCount = useAuthStore(s => s.unreadNotifications);

  return (
    <header className="sticky top-0 z-[110] bg-[#050505]/95 border-b border-white/5 px-4 shrink-0">
      <div className="flex justify-between items-center h-16 w-full">
        <button
          onClick={onProfileClick}
          className="w-8 h-8 rounded-full border border-[#FFD300] p-0.5 overflow-hidden active:scale-90 transition-all"
        >
          <img
            loading="lazy"
            src={userPhoto}
            className="w-full h-full rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        </button>
        <button
          onClick={onCityClick}
          className="flex flex-col items-center px-4 min-h-[44px] justify-center active:scale-95 transition-all"
        >
          <span style={TYPOGRAPHY.uiLabel} className="text-[#FFD300] text-[7px] mb-0.5">
            Estou em:
          </span>
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-white">{currentCity || 'Todas as cidades'}</span>
            <ChevronDown
              size={12}
              className={`text-[#FFD300] transition-transform ${isCitySelectorOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </button>
        <div className="flex items-center gap-2">
          {showAdmin && (
            <button
              onClick={onAdminClick}
              className="p-2 bg-zinc-900 rounded-full border-2 border-[#FFD300] text-[#FFD300] active:scale-90 transition-all"
            >
              <Shield size={16} />
            </button>
          )}
          <button onClick={onNotificationClick} className="p-2 relative active:scale-90 transition-all">
            <Bell size={18} className="text-zinc-500" />
            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-black text-white leading-none">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
