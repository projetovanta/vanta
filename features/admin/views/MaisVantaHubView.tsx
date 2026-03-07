/**
 * MaisVantaHubView — Hub centralizado MAIS VANTA
 * Abas: Planos & Tiers | Assinaturas | Passaportes | Clube | Config
 */

import React, { useState } from 'react';
import { ArrowLeft, Settings, Crown, Compass, Sparkles, SlidersHorizontal } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { PlanosMaisVantaView } from './PlanosMaisVantaView';
import { AssinaturasMaisVantaView } from './AssinaturasMaisVantaView';
import { PassaportesMaisVantaView } from './PassaportesMaisVantaView';
import { ConfigMaisVantaView } from './ConfigMaisVantaView';
import { TabClube } from './curadoria/tabClube';

type AbaHub = 'PLANOS' | 'ASSINATURAS' | 'PASSAPORTES' | 'CLUBE' | 'CONFIG';

export const MaisVantaHubView: React.FC<{ onBack: () => void; masterId: string; comunidadeId?: string }> = ({
  onBack,
  masterId,
  comunidadeId,
}) => {
  const [aba, setAba] = useState<AbaHub>('PLANOS');

  const abas: { id: AbaHub; label: string; icon: typeof Settings }[] = [
    { id: 'PLANOS', label: 'Planos & Tiers', icon: Settings },
    { id: 'ASSINATURAS', label: 'Assinaturas', icon: Crown },
    { id: 'PASSAPORTES', label: 'Passaportes', icon: Compass },
    { id: 'CLUBE', label: 'Clube', icon: Sparkles },
    { id: 'CONFIG', label: 'Config', icon: SlidersHorizontal },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* lint-layout-ok — tab container, filhos gerenciam scroll */}
      {/* Header */}
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-8 pb-4 shrink-0">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0 mr-3">
            <p style={TYPOGRAPHY.sectionKicker} className="mb-1">
              Administração
            </p>
            <h1 style={TYPOGRAPHY.screenTitle} className="text-xl italic">
              MAIS VANTA
            </h1>
          </div>
          <button
            onClick={onBack}
            className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
          >
            <ArrowLeft size={18} className="text-zinc-400" />
          </button>
        </div>

        {/* Abas */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {abas.map(a => {
            const Icon = a.icon;
            return (
              <button
                key={a.id}
                onClick={() => setAba(a.id)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider shrink-0 border transition-all flex items-center gap-1.5 ${
                  aba === a.id
                    ? 'bg-[#FFD300] text-black border-transparent'
                    : 'bg-zinc-900/60 text-zinc-500 border-white/5 active:bg-zinc-800'
                }`}
              >
                <Icon size={12} />
                {a.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Conteúdo das abas */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {aba === 'PLANOS' && <PlanosMaisVantaView onBack={() => {}} />}
        {aba === 'ASSINATURAS' && <AssinaturasMaisVantaView onBack={() => {}} />}
        {aba === 'PASSAPORTES' && <PassaportesMaisVantaView onBack={() => {}} masterId={masterId} />}
        {aba === 'CLUBE' && <TabClube adminId={masterId} toastFn={() => {}} comunidadeId={comunidadeId} />}
        {aba === 'CONFIG' && <ConfigMaisVantaView />}
      </div>
    </div>
  );
};
