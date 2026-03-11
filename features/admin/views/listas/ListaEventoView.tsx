import React, { useState, useMemo, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { TYPOGRAPHY } from '../../../../constants';
import type { ListaEvento } from '../../../../types';
import { listasService } from '../../services/listasService';
import { formatData, type RoleListaNova } from './listasUtils';
import { TabNomes } from './TabNomes';
import { TabEquipe } from './TabEquipe';
import { TabLotacao } from './TabLotacao';
import { TabCheckin } from './TabCheckin';

type TabEvento = 'NOMES' | 'EQUIPE' | 'LOTACAO' | 'CHECKIN';

export const ListaEventoView: React.FC<{
  lista: ListaEvento;
  role: RoleListaNova;
  userId: string;
  userNome: string;
  onBack: () => void;
}> = ({ lista, role, userId, userNome, onBack }) => {
  const tabsDisponiveis = useMemo((): TabEvento[] => {
    if (role === 'portaria') return ['CHECKIN'];
    if (role === 'promoter') return ['NOMES'];
    return ['NOMES', 'EQUIPE', 'LOTACAO'];
  }, [role]);

  const [tab, setTab] = useState<TabEvento>(tabsDisponiveis[0]);
  const [versao, setVersao] = useState(0);
  const refresh = useCallback(() => setVersao(v => v + 1), []);

  const listaAtual = useMemo(() => {
    void versao;
    return listasService.getLista(lista.id) ?? lista;
  }, [lista, versao]);

  const TAB_LABELS: Record<TabEvento, string> = {
    NOMES: 'Nomes',
    EQUIPE: 'Equipe',
    LOTACAO: 'Lotação',
    CHECKIN: 'Check-in',
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-[#0A0A0A]">
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-5 pt-8 pb-0 shrink-0">
        <div className="flex items-start gap-3 mb-4">
          <button
            aria-label="Voltar"
            onClick={onBack}
            className="w-9 h-9 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all shrink-0 mt-0.5"
          >
            <ArrowLeft size="1rem" className="text-zinc-400" />
          </button>
          <div className="flex-1 min-w-0">
            <p style={TYPOGRAPHY.sectionKicker} className="mb-1">
              Lista de Convidados
            </p>
            <h1 style={TYPOGRAPHY.screenTitle} className="text-lg italic leading-snug line-clamp-2">
              {lista.eventoNome}
            </h1>
            <p className="text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest mt-1 truncate">
              {formatData(lista.eventoData)} · {lista.eventoLocal}
            </p>
          </div>
        </div>

        <div className="flex border-b border-white/5 -mx-5 px-5 gap-0">
          {tabsDisponiveis.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-3 px-4 text-[0.6875rem] font-black uppercase tracking-widest border-b-2 transition-all ${
                tab === t ? 'border-[#FFD300] text-[#FFD300]' : 'border-transparent text-zinc-400 active:text-zinc-400'
              }`}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col p-5">
        {tab === 'NOMES' && (
          <TabNomes lista={listaAtual} role={role} userId={userId} userNome={userNome} onRefresh={refresh} />
        )}
        {tab === 'EQUIPE' && <TabEquipe lista={listaAtual} onRefresh={refresh} />}
        {tab === 'LOTACAO' && <TabLotacao lista={listaAtual} />}
        {tab === 'CHECKIN' && <TabCheckin lista={listaAtual} onRefresh={refresh} userNome={userNome} />}
      </div>
    </div>
  );
};
