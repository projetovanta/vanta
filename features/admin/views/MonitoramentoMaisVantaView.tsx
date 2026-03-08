/**
 * MonitoramentoMaisVantaView — Monitoramento global MAIS VANTA
 * Abas: Membros Globais | Eventos Globais | Infrações | Dívida Social
 */

import React, { useState } from 'react';
import { ArrowLeft, Users, Calendar, AlertCircle, Gift } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { MembrosGlobaisMaisVantaView } from './MembrosGlobaisMaisVantaView';
import { EventosGlobaisMaisVantaView } from './EventosGlobaisMaisVantaView';
import { InfracoesGlobaisMaisVantaView } from './InfracoesGlobaisMaisVantaView';
import { DividaSocialMaisVantaView } from './DividaSocialMaisVantaView';

type AbaMonitoramento = 'MEMBROS' | 'EVENTOS' | 'INFRACOES' | 'DIVIDA';

export const MonitoramentoMaisVantaView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [aba, setAba] = useState<AbaMonitoramento>('MEMBROS');

  const abas: { id: AbaMonitoramento; label: string; icon: typeof Users }[] = [
    { id: 'MEMBROS', label: 'Membros Globais', icon: Users },
    { id: 'EVENTOS', label: 'Eventos Globais', icon: Calendar },
    { id: 'INFRACOES', label: 'Infrações', icon: AlertCircle },
    { id: 'DIVIDA', label: 'Dívida Social', icon: Gift },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* lint-layout-ok — tab container, filhos gerenciam scroll */}
      {/* Header */}
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-8 pb-4 shrink-0">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0 mr-3">
            <p style={TYPOGRAPHY.sectionKicker} className="mb-1">
              Visão Global
            </p>
            <h1 style={TYPOGRAPHY.screenTitle} className="text-xl italic">
              Monitoramento
            </h1>
          </div>
          <button aria-label="Voltar"
            onClick={onBack}
            className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
          >
            <ArrowLeft size={18} className="text-zinc-400" />
          </button>
        </div>

        {/* Abas — scroll horizontal */}
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
                    : 'bg-zinc-900/60 text-zinc-400 border-white/5 active:bg-zinc-800'
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
      <div className="flex-1 overflow-hidden">
        {aba === 'MEMBROS' && <MembrosGlobaisMaisVantaView onBack={() => {}} />}
        {aba === 'EVENTOS' && <EventosGlobaisMaisVantaView onBack={() => {}} />}
        {aba === 'INFRACOES' && <InfracoesGlobaisMaisVantaView onBack={() => {}} />}
        {aba === 'DIVIDA' && <DividaSocialMaisVantaView onBack={() => {}} />}
      </div>
    </div>
  );
};
