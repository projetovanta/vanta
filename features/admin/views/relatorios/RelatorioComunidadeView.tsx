import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ArrowLeft, BarChart3, RefreshCw, Download, Trophy, TrendingUp, BarChart2 } from 'lucide-react';
import type { EventoAdmin, ListaEvento } from '../../../../types';
import { eventosAdminService } from '../../services/eventosAdminService';
import { listasService } from '../../services/listasService';
import { fmtBRL } from '../../../../utils';
import { exportRelatorioComExcel } from './exportRelatorioComunidade';
import { AdminViewHeader } from '../../components/AdminViewHeader';

interface Props {
  comunidadeId: string;
  comunidadeNome: string;
  onBack: () => void;
}

const AUTO_REFRESH_MS = 30_000;

export const RelatorioComunidadeView: React.FC<Props> = ({ comunidadeId, comunidadeNome, onBack }) => {
  const [eventos, setEventos] = useState<EventoAdmin[]>([]);
  const [listasMap, setListasMap] = useState<Map<string, ListaEvento[]>>(new Map());
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const refresh = useCallback(() => {
    const evs = eventosAdminService.getEventosByComunidade(comunidadeId);
    setEventos(evs);
    const map = new Map<string, ListaEvento[]>();
    for (const ev of evs) {
      map.set(ev.id, listasService.getListasByEvento(ev.id));
    }
    setListasMap(map);
    setLastRefresh(new Date());
  }, [comunidadeId]);

  useEffect(() => {
    refresh();
    intervalRef.current = setInterval(refresh, AUTO_REFRESH_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refresh]);

  const tempoStr = lastRefresh.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // ── Dados consolidados ──────────────────────────────────────────────────────

  const stats = useMemo(() => {
    let totalConvidados = 0;
    let totalCheckins = 0;
    let totalVendidos = 0;
    let totalGmv = 0;

    const promoterMap = new Map<string, { nome: string; total: number; checkins: number }>();
    const porEvento: {
      id: string;
      nome: string;
      data: string;
      convidados: number;
      checkins: number;
      vendidos: number;
      gmv: number;
    }[] = [];

    for (const ev of eventos) {
      const listas = listasMap.get(ev.id) ?? [];
      const convidados = listas.flatMap(l => l.convidados);
      const checkins = convidados.filter(c => c.checkedIn).length;
      const variacoes = ev.lotes.flatMap(l => l.variacoes);
      const vendidos = variacoes.reduce((s, v) => s + v.vendidos, 0);
      const gmv = variacoes.reduce((s, v) => s + v.vendidos * v.valor, 0);

      totalConvidados += convidados.length;
      totalCheckins += checkins;
      totalVendidos += vendidos;
      totalGmv += gmv;

      porEvento.push({
        id: ev.id,
        nome: ev.nome,
        data: ev.dataInicio,
        convidados: convidados.length,
        checkins,
        vendidos,
        gmv,
      });

      for (const c of convidados) {
        const cur = promoterMap.get(c.inseridoPor) ?? {
          nome: c.inseridoPorNome || 'Desconhecido',
          total: 0,
          checkins: 0,
        };
        cur.total++;
        if (c.checkedIn) cur.checkins++;
        promoterMap.set(c.inseridoPor, cur);
      }
    }

    const topPromoters = [...promoterMap.entries()].sort((a, b) => b[1].total - a[1].total).slice(0, 10);
    const eventosOrdenados = [...porEvento].sort((a, b) => a.data.localeCompare(b.data));

    return { totalConvidados, totalCheckins, totalVendidos, totalGmv, topPromoters, eventosOrdenados };
  }, [eventos, listasMap]);

  const pctCheckin = stats.totalConvidados > 0 ? ((stats.totalCheckins / stats.totalConvidados) * 100).toFixed(1) : '0';
  const ticketMedio = stats.totalVendidos > 0 ? stats.totalGmv / stats.totalVendidos : 0;
  const maxEvConvidados = Math.max(...stats.eventosOrdenados.map(e => e.convidados + e.vendidos), 1);

  return (
    <div className="flex-1 flex flex-col bg-[#0A0A0A]">
      <AdminViewHeader
        title={comunidadeNome}
        kicker="Relatório Comunidade"
        onBack={onBack}
        actions={[
          {
            icon: Download,
            label: 'Excel',
            onClick: () => exportRelatorioComExcel(comunidadeNome, eventos, listasMap),
          },
          { icon: RefreshCw, label: 'Atualizar', onClick: refresh },
        ]}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-5 pb-10">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4">
            <p className="text-[0.4375rem] text-zinc-400 font-black uppercase tracking-widest">Eventos</p>
            <p className="text-white font-black text-xl mt-1">{eventos.length}</p>
          </div>
          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4">
            <p className="text-[0.4375rem] text-zinc-400 font-black uppercase tracking-widest">GMV Total</p>
            <p className="text-[#FFD300] font-black text-xl mt-1">{fmtBRL(stats.totalGmv)}</p>
          </div>
          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4">
            <p className="text-[0.4375rem] text-zinc-400 font-black uppercase tracking-widest">Convidados Lista</p>
            <p className="text-white font-black text-xl mt-1">{stats.totalConvidados}</p>
            <p className="text-zinc-400 text-[0.5rem] mt-0.5">{pctCheckin}% check-in</p>
          </div>
          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4">
            <p className="text-[0.4375rem] text-zinc-400 font-black uppercase tracking-widest">Ticket Médio</p>
            <p className="text-white font-black text-xl mt-1">{fmtBRL(ticketMedio)}</p>
            <p className="text-zinc-400 text-[0.5rem] mt-0.5">{stats.totalVendidos} vendidos</p>
          </div>
        </div>

        {/* Top Promoters */}
        {stats.topPromoters.length > 0 && (
          <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Trophy size="0.8125rem" className="text-[#FFD300]" />
              <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest">Top Promoters</p>
            </div>
            <div className="space-y-2">
              {stats.topPromoters.map(([id, p], i) => (
                <div key={id} className="flex items-center gap-3 p-3 bg-zinc-900/30 border border-white/5 rounded-xl">
                  <p className="text-[#FFD300] font-black text-sm w-5 text-center shrink-0">{i + 1}</p>
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-300 text-xs font-bold truncate">{p.nome}</p>
                    <p className="text-zinc-400 text-[0.5625rem]">
                      {p.checkins}/{p.total} check-ins
                    </p>
                  </div>
                  <p className="text-[#FFD300] font-black text-sm shrink-0">{p.total}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Evolução por evento */}
        {stats.eventosOrdenados.length > 0 && (
          <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp size="0.8125rem" className="text-[#FFD300]" />
              <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest">Evolução por Evento</p>
            </div>
            <div className="space-y-2">
              {stats.eventosOrdenados.map(ev => {
                const total = ev.convidados + ev.vendidos;
                const pct = (total / maxEvConvidados) * 100;
                const dataFmt = new Date(ev.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
                return (
                  <div key={ev.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-zinc-400 text-[0.5625rem] font-bold truncate flex-1 min-w-0">{ev.nome}</p>
                      <p className="text-zinc-400 text-[0.5rem] shrink-0 ml-2">{dataFmt}</p>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-[#FFD300] rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex gap-3">
                      <p className="text-zinc-400 text-[0.5rem]">
                        {ev.convidados} lista · {ev.vendidos} ingressos
                      </p>
                      <p className="text-zinc-400 text-[0.5rem]">{fmtBRL(ev.gmv)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Comparativo */}
        {stats.eventosOrdenados.length > 1 && (
          <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <BarChart2 size="0.8125rem" className="text-[#FFD300]" />
              <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest">Comparativo</p>
            </div>
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full min-w-0">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Evento', 'Lista', 'Check-in', 'Ingressos', 'GMV'].map(h => (
                      <th
                        key={h}
                        className="text-[0.4375rem] text-zinc-400 font-black uppercase tracking-widest text-left py-2 px-1"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.eventosOrdenados.map(ev => {
                    const convPct = ev.convidados > 0 ? ((ev.checkins / ev.convidados) * 100).toFixed(0) : '0';
                    return (
                      <tr key={ev.id} className="border-b border-white/3">
                        <td className="text-zinc-300 text-[0.625rem] font-bold py-2 px-1 truncate max-w-[7.5rem]">
                          {ev.nome}
                        </td>
                        <td className="text-zinc-400 text-[0.625rem] py-2 px-1">{ev.convidados}</td>
                        <td className="text-zinc-400 text-[0.625rem] py-2 px-1">
                          {ev.checkins} ({convPct}%)
                        </td>
                        <td className="text-zinc-400 text-[0.625rem] py-2 px-1">{ev.vendidos}</td>
                        <td className="text-[#FFD300] text-[0.625rem] font-bold py-2 px-1">{fmtBRL(ev.gmv)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
