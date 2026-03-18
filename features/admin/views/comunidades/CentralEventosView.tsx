import React, { useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { TYPOGRAPHY } from '../../../../constants';
import { Comunidade } from '../../../../types';
import { CriarEventoView } from '../CriarEventoView';
import { ProximosEventosTab } from './ProximosEventosTab';
import { EventosEncerradosTab } from './EventosEncerradosTab';
import { EventoTab } from './types';

export const CentralEventosView: React.FC<{
  comunidade: Comunidade;
  onBack: () => void;
  currentUserId?: string;
  currentUserNome?: string;
}> = ({ comunidade, onBack, currentUserId, currentUserNome }) => {
  const [tab, setTab] = useState<EventoTab>('CRIAR');
  const [criandoEvento, setCriando] = useState(false);

  if (criandoEvento) {
    return (
      <CriarEventoView
        comunidade={comunidade}
        onBack={() => setCriando(false)}
        currentUserId={currentUserId}
        currentUserNome={currentUserNome}
      />
    );
  }

  const TABS: { id: EventoTab; label: string }[] = [
    { id: 'CRIAR', label: 'Criar' },
    { id: 'PROXIMOS', label: 'Próximos' },
    { id: 'ENCERRADOS', label: 'Encerrados' },
  ];

  return (
    <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col overflow-hidden">
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-8 pb-4 shrink-0">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0 mr-3">
            <p style={TYPOGRAPHY.sectionKicker} className="mb-1">
              Central de Eventos
            </p>
            <h1 style={TYPOGRAPHY.screenTitle} className="text-lg italic truncate">
              {comunidade.nome}
            </h1>
          </div>
          <button
            aria-label="Voltar"
            onClick={onBack}
            className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all shrink-0 mt-1"
          >
            <ArrowLeft size="1.125rem" className="text-zinc-400" />
          </button>
        </div>

        <div className="flex gap-1 p-1 bg-zinc-900/50 rounded-xl border border-white/5">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 rounded-lg text-[0.5625rem] font-black uppercase tracking-wider transition-all ${
                tab === t.id ? 'bg-[#FFD300] text-black' : 'text-zinc-400 active:text-zinc-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 max-w-3xl mx-auto w-full">
        {tab === 'CRIAR' && (
          <button
            onClick={() => setCriando(true)}
            className="w-full flex items-center justify-between p-5 bg-[#FFD300] rounded-2xl active:scale-[0.97] transition-all"
          >
            <div>
              <p className="text-black font-black text-sm uppercase tracking-wider leading-none">Criar Novo Evento</p>
              <p className="text-black/50 text-[0.625rem] font-bold mt-1 truncate">{comunidade.nome}</p>
            </div>
            <div className="w-10 h-10 bg-black/10 rounded-xl flex items-center justify-center shrink-0">
              <Plus size="1.125rem" className="text-black" />
            </div>
          </button>
        )}
        {tab === 'PROXIMOS' && <ProximosEventosTab comunidadeId={comunidade.id} />}
        {tab === 'ENCERRADOS' && <EventosEncerradosTab comunidadeId={comunidade.id} />}
      </div>
    </div>
  );
};
