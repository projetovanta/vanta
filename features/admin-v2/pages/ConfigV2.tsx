import React, { useState } from 'react';
import { Tag, ShieldPlus, Handshake, Activity, HelpCircle, LinkIcon } from 'lucide-react';

const TABS = [
  { id: 'CATEGORIAS', label: 'Categorias', icon: Tag },
  { id: 'CARGOS', label: 'Cargos', icon: ShieldPlus },
  { id: 'PARCERIAS', label: 'Parcerias', icon: Handshake },
  { id: 'DIAGNOSTICO', label: 'Diagnóstico', icon: Activity },
  { id: 'FAQ', label: 'FAQ', icon: HelpCircle },
  { id: 'LINKS', label: 'Links Úteis', icon: LinkIcon },
] as const;

export const ConfigV2: React.FC = () => {
  const [tab, setTab] = useState('CATEGORIAS');

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
      <h1 className="text-2xl font-serif italic text-white">Configurações</h1>
      <p className="text-zinc-400 text-sm">Setup, categorias e sistema</p>

      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                tab === t.id
                  ? 'bg-zinc-700/30 border-zinc-600/30 text-zinc-200'
                  : 'bg-zinc-900/60 border-white/5 text-zinc-400 active:bg-white/5'
              }`}
            >
              <Icon size="0.875rem" /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px]">
        <p className="text-zinc-500 text-sm">
          Aqui vai carregar <span className="text-white font-bold">{TABS.find(t => t.id === tab)?.label}</span>
        </p>
        <p className="text-zinc-600 text-xs mt-2">Configurações raramente mudam — ficam organizadas aqui</p>
      </div>
    </div>
  );
};
