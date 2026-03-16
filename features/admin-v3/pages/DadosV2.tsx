import React, { useState } from 'react';
import { Banknote, TrendingUp, Sparkles, BarChart3 } from 'lucide-react';

const TABS = [
  { id: 'FINANCEIRO', label: 'Financeiro', icon: Banknote },
  { id: 'ANALYTICS', label: 'Analytics', icon: TrendingUp },
  { id: 'INTELIGENCIA', label: 'Inteligência', icon: Sparkles },
  { id: 'RELATORIOS', label: 'Relatórios', icon: BarChart3 },
] as const;

export const DadosV2: React.FC = () => {
  const [tab, setTab] = useState('FINANCEIRO');

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
      <h1 className="text-2xl font-serif italic text-white">Dados</h1>
      <p className="text-zinc-400 text-sm">Tudo que são números num lugar só</p>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                tab === t.id
                  ? 'bg-[#FFD300]/10 border-[#FFD300]/20 text-[#FFD300]'
                  : 'bg-zinc-900/60 border-white/5 text-zinc-400 active:bg-white/5'
              }`}
            >
              <Icon size="0.875rem" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Placeholder content */}
      <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px]">
        <p className="text-zinc-500 text-sm">
          Aqui vai carregar o <span className="text-white font-bold">{TABS.find(t => t.id === tab)?.label}</span> real
        </p>
        <p className="text-zinc-600 text-xs mt-2">Conectando com os services existentes na próxima fase</p>
      </div>
    </div>
  );
};
