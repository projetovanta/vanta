import React, { useState } from 'react';
import { Building2, Calendar, Bell, Compass, FileCheck, ClipboardList } from 'lucide-react';

const TABS = [
  { id: 'COMUNIDADES', label: 'Comunidades', icon: Building2 },
  { id: 'EVENTOS', label: 'Eventos', icon: Calendar },
  { id: 'PENDENTES', label: 'Pendentes', icon: ClipboardList },
  { id: 'NOTIFICACOES', label: 'Notificações', icon: Bell },
  { id: 'INDICA', label: 'Indica', icon: Compass },
  { id: 'COMPROVANTES', label: 'Comprovantes', icon: FileCheck },
] as const;

export const AcoesV2: React.FC = () => {
  const [tab, setTab] = useState('COMUNIDADES');

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
      <h1 className="text-2xl font-serif italic text-white">Ações</h1>
      <p className="text-zinc-400 text-sm">Gerenciar, criar e operar</p>

      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                tab === t.id
                  ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
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
        <p className="text-zinc-600 text-xs mt-2">Conectando com os services existentes na próxima fase</p>
      </div>
    </div>
  );
};
