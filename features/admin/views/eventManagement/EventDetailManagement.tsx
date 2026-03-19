import React, { useState } from 'react';
import {
  ArrowLeft,
  Users,
  BarChart2,
  List,
  Clock,
  TrendingUp,
  Gift,
  Settings2,
  FileText,
  LayoutGrid,
} from 'lucide-react';
import { TYPOGRAPHY } from '../../../../constants';
import { ContaVantaLegacy, ListaEvento } from '../../../../types';
import { listasService } from '../../services/listasService';
import { cortesiasService } from '../../services/cortesiasService';
import { eventosAdminService } from '../../services/eventosAdminService';
import { rbacService } from '../../services/rbacService';
import { useToast, ToastContainer } from '../../../../components/Toast';
import { Tab } from './types';
import { TabLotacao } from './TabLotacao';
import { TabEquipePromoter } from './TabEquipePromoter';
import { TabEquipeSocio } from './TabEquipeSocio';
import { TabLista } from './TabLista';
import { TabLogs } from './TabLogs';
import { TabResumoCaixa } from './TabResumoCaixa';
import { TabCortesias } from './TabCortesias';
import { TabCargosPermissoes } from './TabCargosPermissoes';
import { TabRelatorio } from './TabRelatorio';
import { TabMesas } from './TabMesas';

export const EventDetailManagement: React.FC<{
  listaId: string | null;
  eventoId?: string;
  onBack: () => void;
  defaultTab?: Tab;
  isSocio: boolean;
  adminNome: string;
  currentUserId: string;
  currentUserNome: string;
  currentUserRole?: ContaVantaLegacy;
}> = ({
  listaId,
  eventoId: eventoIdProp,
  onBack,
  defaultTab = 'LOTACAO',
  isSocio,
  adminNome,
  currentUserId,
  currentUserNome,
  currentUserRole = 'vanta_masteradm',
}) => {
  const [lista, setLista] = useState(() => (listaId ? listasService.getLista(listaId) : null));
  const [tab, setTab] = useState<Tab>(defaultTab);
  const [logTick, setLogTick] = useState(0);
  const { toasts, dismiss, toast } = useToast();
  const refresh = () => {
    if (listaId) setLista({ ...listasService.getLista(listaId)! });
    setLogTick(t => t + 1);
  };

  const checkedIn = lista?.convidados.filter(c => c.checkedIn).length ?? 0;
  const total = lista?.convidados.length ?? 0;

  const eventoAdminId = eventoIdProp ?? (listaId ? cortesiasService.getEventoAdminId(listaId) : null) ?? null;
  const comunidadeId = eventoAdminId ? (eventosAdminService.getEvento(eventoAdminId)?.comunidadeId ?? '') : '';
  const hasCortesias = !!cortesiasService.getCortesiaConfig(eventoAdminId ?? '');
  const eventoAdmin = eventoAdminId ? eventosAdminService.getEvento(eventoAdminId) : null;
  const [mesasAtivo, setMesasAtivo] = useState(() => eventoAdmin?.mesasAtivo ?? false);

  type TabDef = { id: Tab; label: string; icon: React.FC<any> };
  const TABS: TabDef[] = isSocio
    ? [
        { id: 'LOTACAO', label: 'Lotação', icon: BarChart2 },
        { id: 'EQUIPE', label: 'Equipe', icon: Users },
        { id: 'LISTA', label: 'Lista', icon: List },
        ...(hasCortesias ? [{ id: 'CORTESIAS' as Tab, label: 'Cortesias', icon: Gift }] : []),
        { id: 'LOGS', label: 'Logs', icon: Clock },
        { id: 'RESUMO', label: 'Caixa', icon: TrendingUp },
        { id: 'CARGOS_PERM', label: 'Funções', icon: Settings2 },
        ...(mesasAtivo ? [{ id: 'MESAS' as Tab, label: 'Mesas', icon: LayoutGrid }] : []),
        { id: 'RELATORIO', label: 'Relatório', icon: FileText },
      ]
    : [
        { id: 'LOTACAO', label: 'Lotação', icon: BarChart2 },
        { id: 'EQUIPE', label: 'Equipe', icon: Users },
        { id: 'LISTA', label: 'Lista', icon: List },
      ];

  return (
    <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col overflow-hidden">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      <div className="shrink-0 bg-[#0A0A0A] border-b border-white/5 px-6 pt-6 pb-4">
        <div className="flex justify-between items-start mb-1">
          <div className="flex-1 min-w-0 mr-3">
            <p style={TYPOGRAPHY.sectionKicker} className="mb-1">
              Gestão do Evento
            </p>
            <h1 style={TYPOGRAPHY.screenTitle} className="text-lg truncate">
              {lista?.eventoNome ?? eventoAdmin?.nome ?? 'Evento'}
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
        <div className="flex items-center gap-3 mb-4 mt-2 flex-wrap">
          <span className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-widest">
            {lista?.eventoLocal ?? eventoAdmin?.local ?? ''}
          </span>
          <span className="w-1 h-1 rounded-full bg-zinc-700 shrink-0" />
          <span className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-widest">{total} inscritos</span>
          {checkedIn > 0 && (
            <>
              <span className="w-1 h-1 rounded-full bg-zinc-700 shrink-0" />
              <span className="text-emerald-500 text-[0.5625rem] font-black uppercase tracking-widest">
                {checkedIn} entraram
              </span>
            </>
          )}
          {isSocio && (
            <span className="ml-auto px-2 py-0.5 bg-[#FFD300]/10 border border-[#FFD300]/20 rounded-full text-[#FFD300] text-[0.5rem] font-black uppercase tracking-widest shrink-0">
              Meu Evento
            </span>
          )}
        </div>
        {/* Tabs — horizontal scroll para sócio (5 tabs) */}
        <div className="flex flex-wrap gap-1 p-1 bg-zinc-900/50 rounded-xl border border-white/5">
          {TABS.map(t => {
            const isLocked = false;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center justify-center gap-1 px-3.5 py-2.5 rounded-lg text-[0.5625rem] font-black uppercase tracking-wide transition-all ${
                  tab === t.id ? 'bg-[#FFD300] text-black' : 'text-zinc-400 active:text-zinc-300'
                }`}
              >
                <t.icon size="0.625rem" /> {t.label}
                {isLocked && ' 🔒'}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 max-w-3xl mx-auto w-full">
        {tab === 'LOTACAO' && lista && <TabLotacao lista={lista} />}
        {tab === 'EQUIPE' && lista && (
          <>
            <TabEquipeSocio listaId={listaId ?? ''} lista={lista} onUpdate={refresh} toastFn={toast} />
            {!isSocio && (
              <div className="mt-6 pt-6 border-t border-white/5">
                <TabEquipePromoter
                  lista={lista}
                  onRefresh={refresh}
                  toastFn={toast}
                  eventoId={eventoAdminId ?? undefined}
                  currentUserId={currentUserId}
                />
              </div>
            )}
          </>
        )}
        {tab === 'LISTA' && lista && (
          <TabLista
            lista={lista}
            isSocio={isSocio}
            currentUserId={currentUserId}
            currentUserNome={currentUserNome}
            refresh={refresh}
          />
        )}
        {tab === 'CORTESIAS' && lista && listaId && (
          <TabCortesias listaId={listaId} lista={lista} adminNome={adminNome} key={logTick} />
        )}
        {tab === 'LOGS' && <TabLogs listaId={listaId ?? ''} eventoAdminId={eventoAdminId ?? undefined} key={logTick} />}
        {tab === 'RESUMO' && lista && <TabResumoCaixa lista={lista} toastFn={toast} />}
        {tab === 'CARGOS_PERM' && <TabCargosPermissoes comunidadeId={comunidadeId} toastFn={toast} />}
        {tab === 'MESAS' && eventoAdminId && (
          <TabMesas
            eventoId={eventoAdminId}
            mesasAtivo={mesasAtivo}
            plantaMesas={eventoAdmin?.plantaMesas}
            onToggle={setMesasAtivo}
          />
        )}
        {tab === 'RELATORIO' && eventoAdminId && <TabRelatorio eventoAdminId={eventoAdminId} />}
      </div>
    </div>
  );
};
