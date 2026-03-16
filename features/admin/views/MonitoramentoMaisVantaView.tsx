/**
 * MonitoramentoMaisVantaView — Monitoramento global MAIS VANTA
 * Abas: Membros Globais | Eventos Globais | Infrações | Dívida Social
 */

import React, { useState } from 'react';
import { ArrowLeft, Users, Calendar, AlertCircle, Gift } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { AdminViewHeader } from '../components/AdminViewHeader';
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
      <AdminViewHeader title="Monitoramento" kicker="Visão Global" onBack={onBack} />
      <div className="px-5 py-2 shrink-0 border-b border-white/5">
        <div className="flex flex-wrap gap-1.5">
          {abas.map(a => {
            const Icon = a.icon;
            return (
              <button
                key={a.id}
                onClick={() => setAba(a.id)}
                className={`px-3 py-1.5 rounded-lg text-[0.5625rem] font-black uppercase tracking-wider border transition-all flex items-center gap-1.5 ${
                  aba === a.id
                    ? 'bg-[#FFD300] text-black border-transparent'
                    : 'bg-zinc-900/60 text-zinc-400 border-white/5 active:bg-zinc-800'
                }`}
              >
                <Icon size="0.75rem" />
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
