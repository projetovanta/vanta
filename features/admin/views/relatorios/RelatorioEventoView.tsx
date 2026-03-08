import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, BarChart3, RefreshCw, Download } from 'lucide-react';
import type { EventoAdmin, ListaEvento } from '../../../../types';
import type { TicketCaixa } from '../../services/eventosAdminTypes';
import { listasService } from '../../services/listasService';
import { eventosAdminService } from '../../services/eventosAdminService';
import { TabGeral } from './TabGeral';
import { TabListas } from './TabListas';
import { TabIngressos } from './TabIngressos';
import { exportRelatorioExcel } from './exportRelatorio';

type Tab = 'GERAL' | 'LISTAS' | 'INGRESSOS';

interface Props {
  evento: EventoAdmin;
  role: 'gerente' | 'promoter' | 'portaria_lista' | 'portaria_antecipado';
  currentUserId: string;
  onBack: () => void;
}

const TAB_LABELS: Record<Tab, string> = {
  GERAL: 'Geral',
  LISTAS: 'Listas',
  INGRESSOS: 'Ingressos',
};

const AUTO_REFRESH_MS = 30_000;

export const RelatorioEventoView: React.FC<Props> = ({ evento, role, currentUserId, onBack }) => {
  const [tab, setTab] = useState<Tab>('GERAL');
  const [listas, setListas] = useState<ListaEvento[]>([]);
  const [tickets, setTickets] = useState<TicketCaixa[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const refresh = useCallback(() => {
    const all = listasService.getListasByEvento(evento.id);
    setListas(all);
    eventosAdminService.getTicketsCaixaByEvento(evento.id).then(setTickets);
    setLastRefresh(new Date());
  }, [evento.id]);

  // Refresh inicial + auto-refresh 30s
  useEffect(() => {
    refresh();
    intervalRef.current = setInterval(refresh, AUTO_REFRESH_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refresh]);

  const tempoStr = lastRefresh.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Tabs disponíveis por role
  const tabsDisponiveis: Tab[] =
    role === 'promoter'
      ? ['LISTAS']
      : role === 'portaria_lista' || role === 'portaria_antecipado'
        ? ['GERAL', 'LISTAS']
        : ['GERAL', 'LISTAS', 'INGRESSOS'];

  return (
    <div className="absolute inset-0 flex flex-col bg-[#0A0A0A]">
      {/* Header */}
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-5 pt-8 pb-0 shrink-0">
        <div className="flex items-start gap-3 mb-3">
          <button aria-label="Voltar"
            onClick={onBack}
            className="w-9 h-9 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all shrink-0 mt-0.5"
          >
            <ArrowLeft size={16} className="text-zinc-400" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <BarChart3 size={12} className="text-[#FFD300] shrink-0" />
              <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest">Relatório</p>
            </div>
            <p className="text-white text-sm font-bold truncate mt-0.5">{evento.nome}</p>
          </div>
          <button aria-label="Atualizar"
            onClick={refresh}
            className="flex items-center gap-1 px-2 py-1 bg-zinc-900 border border-white/10 rounded-lg active:scale-90 transition-all shrink-0"
          >
            <RefreshCw size={10} className="text-zinc-400" />
            <p className="text-zinc-400 text-[8px]">{tempoStr}</p>
          </button>
        </div>

        {/* Export (só gerente) */}
        {role === 'gerente' && (
          <div className="mb-3">
            <button
              onClick={() => exportRelatorioExcel(evento, listas, tickets)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-wider active:scale-95 transition-all"
            >
              <Download size={10} /> Exportar Excel
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-white/5 -mx-5 px-5 gap-0">
          {tabsDisponiveis.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-3 px-4 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all ${
                tab === t ? 'border-[#FFD300] text-[#FFD300]' : 'border-transparent text-zinc-400 active:text-zinc-400'
              }`}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col p-5">
        {tab === 'GERAL' && <TabGeral evento={evento} listas={listas} />}
        {tab === 'LISTAS' && <TabListas listas={listas} role={role} currentUserId={currentUserId} />}
        {tab === 'INGRESSOS' && <TabIngressos evento={evento} tickets={tickets} />}
      </div>
    </div>
  );
};
