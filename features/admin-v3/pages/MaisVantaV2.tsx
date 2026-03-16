import React, { useState } from 'react';
import { Star, Users, Send, Crown, Settings, MapPin, Store, Ticket, AlertCircle, Eye, BarChart3 } from 'lucide-react';

const TABS = [
  { id: 'CURADORIA', label: 'Curadoria', icon: Star },
  { id: 'MEMBROS', label: 'Membros', icon: Users },
  { id: 'CONVITES', label: 'Convites', icon: Send },
  { id: 'PARCEIROS', label: 'Parceiros', icon: Store },
  { id: 'BENEFICIOS', label: 'Benefícios', icon: Ticket },
  { id: 'CIDADES', label: 'Cidades', icon: MapPin },
  { id: 'INFRACOES', label: 'Infrações', icon: AlertCircle },
  { id: 'ANALYTICS', label: 'Analytics', icon: BarChart3 },
  { id: 'MONITORAMENTO', label: 'Monitor', icon: Eye },
  { id: 'CONFIG', label: 'Config', icon: Settings },
] as const;

export const MaisVantaV2: React.FC = () => {
  const [tab, setTab] = useState('CURADORIA');

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Crown size="1.5rem" className="text-[#FFD300]" />
        <div>
          <h1 className="text-2xl font-serif italic text-white">MAIS VANTA</h1>
          <p className="text-zinc-400 text-sm">Tudo do programa num lugar só</p>
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[0.5625rem] font-bold uppercase tracking-wider border transition-all ${
                tab === t.id
                  ? 'bg-[#FFD300] text-black border-transparent'
                  : 'bg-zinc-900/60 border-white/5 text-zinc-400 active:bg-white/5'
              }`}
            >
              <Icon size="0.75rem" /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="bg-[#FFD300]/5 border border-[#FFD300]/10 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px]">
        <Crown size="2rem" className="text-[#FFD300]/30 mb-4" />
        <p className="text-zinc-500 text-sm">
          Aqui vai carregar <span className="text-[#FFD300] font-bold">{TABS.find(t => t.id === tab)?.label}</span>
        </p>
        <p className="text-zinc-600 text-xs mt-2">Curadoria, Membros, Parceiros, Benefícios — tudo aqui</p>
      </div>
    </div>
  );
};
