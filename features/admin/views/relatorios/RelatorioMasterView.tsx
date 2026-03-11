import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ArrowLeft, BarChart3, RefreshCw, Download, Trophy, TrendingUp, Building2 } from 'lucide-react';
import type { EventoAdmin, ListaEvento, Comunidade } from '../../../../types';
import { eventosAdminService } from '../../services/eventosAdminService';
import { listasService } from '../../services/listasService';
import { comunidadesService } from '../../services/comunidadesService';
import { fmtBRL } from '../../../../utils';
import { exportExcel } from '../../../../utils/exportUtils';
import type { ExcelSheet } from '../../../../utils/exportUtils';

interface Props {
  onBack: () => void;
}

const AUTO_REFRESH_MS = 30_000;

export const RelatorioMasterView: React.FC<Props> = ({ onBack }) => {
  const [comunidades, setComunidades] = useState<Comunidade[]>([]);
  const [eventosMap, setEventosMap] = useState<Map<string, EventoAdmin[]>>(new Map());
  const [listasMap, setListasMap] = useState<Map<string, ListaEvento[]>>(new Map());
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const refresh = useCallback(() => {
    const coms = comunidadesService.getAll();
    setComunidades(coms);
    const eMap = new Map<string, EventoAdmin[]>();
    const lMap = new Map<string, ListaEvento[]>();
    for (const c of coms) {
      const evs = eventosAdminService.getEventosByComunidade(c.id);
      eMap.set(c.id, evs);
      for (const ev of evs) {
        lMap.set(ev.id, listasService.getListasByEvento(ev.id));
      }
    }
    setEventosMap(eMap);
    setListasMap(lMap);
    setLastRefresh(new Date());
  }, []);

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
    let totalEventos = 0;
    let totalConvidados = 0;
    let totalCheckins = 0;
    let totalVendidos = 0;
    let totalGmv = 0;

    const promoterMap = new Map<string, { nome: string; total: number; checkins: number; comunidades: Set<string> }>();
    const porComunidade: {
      id: string;
      nome: string;
      eventos: number;
      convidados: number;
      checkins: number;
      vendidos: number;
      gmv: number;
    }[] = [];

    for (const com of comunidades) {
      const evs = eventosMap.get(com.id) ?? [];
      let comConvidados = 0;
      let comCheckins = 0;
      let comVendidos = 0;
      let comGmv = 0;

      for (const ev of evs) {
        const listas = listasMap.get(ev.id) ?? [];
        const convidados = listas.flatMap(l => l.convidados);
        const checkins = convidados.filter(c => c.checkedIn).length;
        const variacoes = ev.lotes.flatMap(l => l.variacoes);
        const vendidos = variacoes.reduce((s, v) => s + v.vendidos, 0);
        const gmv = variacoes.reduce((s, v) => s + v.vendidos * v.valor, 0);

        comConvidados += convidados.length;
        comCheckins += checkins;
        comVendidos += vendidos;
        comGmv += gmv;

        for (const c of convidados) {
          const cur = promoterMap.get(c.inseridoPor) ?? {
            nome: c.inseridoPorNome || 'Desconhecido',
            total: 0,
            checkins: 0,
            comunidades: new Set(),
          };
          cur.total++;
          if (c.checkedIn) cur.checkins++;
          cur.comunidades.add(com.id);
          promoterMap.set(c.inseridoPor, cur);
        }
      }

      totalEventos += evs.length;
      totalConvidados += comConvidados;
      totalCheckins += comCheckins;
      totalVendidos += comVendidos;
      totalGmv += comGmv;

      porComunidade.push({
        id: com.id,
        nome: com.nome,
        eventos: evs.length,
        convidados: comConvidados,
        checkins: comCheckins,
        vendidos: comVendidos,
        gmv: comGmv,
      });
    }

    const topPromoters = [...promoterMap.entries()].sort((a, b) => b[1].total - a[1].total).slice(0, 15);
    const comunidadesOrdenadas = [...porComunidade].sort((a, b) => b.gmv - a.gmv);

    return {
      totalEventos,
      totalConvidados,
      totalCheckins,
      totalVendidos,
      totalGmv,
      topPromoters,
      comunidadesOrdenadas,
    };
  }, [comunidades, eventosMap, listasMap]);

  const pctCheckin = stats.totalConvidados > 0 ? ((stats.totalCheckins / stats.totalConvidados) * 100).toFixed(1) : '0';
  const ticketMedio = stats.totalVendidos > 0 ? stats.totalGmv / stats.totalVendidos : 0;
  const maxComGmv = Math.max(...stats.comunidadesOrdenadas.map(c => c.gmv), 1);

  // ── Export Excel ────────────────────────────────────────────────────────────
  const handleExport = () => {
    const sheets: ExcelSheet[] = [];

    sheets.push({
      nome: 'Comunidades',
      headers: ['Comunidade', 'Eventos', 'Convidados', 'Check-ins', '% Conversão', 'Ingressos', 'GMV', 'Ticket Médio'],
      rows: stats.comunidadesOrdenadas.map(c => [
        c.nome,
        c.eventos,
        c.convidados,
        c.checkins,
        c.convidados > 0 ? `${((c.checkins / c.convidados) * 100).toFixed(1)}%` : '0%',
        c.vendidos,
        fmtBRL(c.gmv),
        c.vendidos > 0 ? fmtBRL(c.gmv / c.vendidos) : fmtBRL(0),
      ]),
    });

    sheets.push({
      nome: 'Top Promoters',
      headers: ['Promoter', 'Convidados', 'Check-ins', '% Conversão', 'Comunidades'],
      rows: stats.topPromoters.map(([, p]) => [
        p.nome,
        p.total,
        p.checkins,
        p.total > 0 ? `${((p.checkins / p.total) * 100).toFixed(1)}%` : '0%',
        p.comunidades.size,
      ]),
    });

    void exportExcel('Relatorio_Master_VANTA', sheets);
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-[#0A0A0A]">
      {/* Header */}
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-5 pt-8 pb-4 shrink-0">
        <div className="flex items-start gap-3">
          <button
            aria-label="Voltar"
            onClick={onBack}
            className="w-9 h-9 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all shrink-0 mt-0.5"
          >
            <ArrowLeft size="1rem" className="text-zinc-400" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <BarChart3 size="0.75rem" className="text-[#FFD300] shrink-0" />
              <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest">Relatório Master</p>
            </div>
            <p className="text-white text-sm font-bold truncate mt-0.5">Visão Global — VANTA</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleExport}
              className="flex items-center gap-1 px-2 py-1 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 rounded-lg text-[0.5rem] font-black uppercase active:scale-90 transition-all"
            >
              <Download size="0.5625rem" /> Excel
            </button>
            <button
              aria-label="Atualizar"
              onClick={refresh}
              className="flex items-center gap-1 px-2 py-1 bg-zinc-900 border border-white/10 rounded-lg active:scale-90 transition-all"
            >
              <RefreshCw size="0.625rem" className="text-zinc-400" />
              <p className="text-zinc-400 text-[0.5rem]">{tempoStr}</p>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-5 pb-10">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4">
            <p className="text-[0.4375rem] text-zinc-400 font-black uppercase tracking-widest">Comunidades</p>
            <p className="text-white font-black text-xl mt-1">{comunidades.length}</p>
          </div>
          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4">
            <p className="text-[0.4375rem] text-zinc-400 font-black uppercase tracking-widest">GMV Total</p>
            <p className="text-[#FFD300] font-black text-xl mt-1">{fmtBRL(stats.totalGmv)}</p>
          </div>
          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4">
            <p className="text-[0.4375rem] text-zinc-400 font-black uppercase tracking-widest">Eventos</p>
            <p className="text-white font-black text-xl mt-1">{stats.totalEventos}</p>
          </div>
          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4">
            <p className="text-[0.4375rem] text-zinc-400 font-black uppercase tracking-widest">Ticket Médio</p>
            <p className="text-white font-black text-xl mt-1">{fmtBRL(ticketMedio)}</p>
            <p className="text-zinc-400 text-[0.5rem] mt-0.5">{stats.totalVendidos} vendidos</p>
          </div>
          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4">
            <p className="text-[0.4375rem] text-zinc-400 font-black uppercase tracking-widest">Convidados Lista</p>
            <p className="text-white font-black text-xl mt-1">{stats.totalConvidados}</p>
            <p className="text-zinc-400 text-[0.5rem] mt-0.5">{pctCheckin}% check-in</p>
          </div>
          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4">
            <p className="text-[0.4375rem] text-zinc-400 font-black uppercase tracking-widest">Ingressos</p>
            <p className="text-white font-black text-xl mt-1">{stats.totalVendidos}</p>
          </div>
        </div>

        {/* Ranking de Comunidades */}
        {stats.comunidadesOrdenadas.length > 0 && (
          <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Building2 size="0.8125rem" className="text-[#FFD300]" />
              <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest">Ranking de Comunidades</p>
            </div>
            <div className="space-y-2">
              {stats.comunidadesOrdenadas.map((c, i) => {
                const pct = (c.gmv / maxComGmv) * 100;
                const convPct = c.convidados > 0 ? ((c.checkins / c.convidados) * 100).toFixed(0) : '0';
                return (
                  <div key={c.id} className="space-y-1.5 p-3 bg-zinc-900/30 border border-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <p className="text-[#FFD300] font-black text-sm w-5 text-center shrink-0">{i + 1}</p>
                      <div className="flex-1 min-w-0">
                        <p className="text-zinc-300 text-xs font-bold truncate">{c.nome}</p>
                        <p className="text-zinc-400 text-[0.5625rem]">
                          {c.eventos} eventos · {c.convidados} lista ({convPct}%) · {c.vendidos} ingressos
                        </p>
                      </div>
                      <p className="text-[#FFD300] font-black text-sm shrink-0">{fmtBRL(c.gmv)}</p>
                    </div>
                    <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden ml-8">
                      <div className="h-full bg-[#FFD300] rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Top Promoters Global */}
        {stats.topPromoters.length > 0 && (
          <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Trophy size="0.8125rem" className="text-[#FFD300]" />
              <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest">Top Promoters Global</p>
            </div>
            <div className="space-y-2">
              {stats.topPromoters.map(([id, p], i) => {
                const convPct = p.total > 0 ? ((p.checkins / p.total) * 100).toFixed(0) : '0';
                return (
                  <div key={id} className="flex items-center gap-3 p-3 bg-zinc-900/30 border border-white/5 rounded-xl">
                    <p className="text-[#FFD300] font-black text-sm w-5 text-center shrink-0">{i + 1}</p>
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-300 text-xs font-bold truncate">{p.nome}</p>
                      <p className="text-zinc-400 text-[0.5625rem]">
                        {p.checkins}/{p.total} check-ins ({convPct}%) · {p.comunidades.size} comunidade
                        {p.comunidades.size > 1 ? 's' : ''}
                      </p>
                    </div>
                    <p className="text-[#FFD300] font-black text-sm shrink-0">{p.total}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Evolução Global */}
        {stats.comunidadesOrdenadas.length > 1 && (
          <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp size="0.8125rem" className="text-[#FFD300]" />
              <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest">Comparativo</p>
            </div>
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full min-w-0">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Comunidade', 'Eventos', 'Lista', 'Check-in', 'Ingressos', 'GMV'].map(h => (
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
                  {stats.comunidadesOrdenadas.map(c => {
                    const convPct = c.convidados > 0 ? ((c.checkins / c.convidados) * 100).toFixed(0) : '0';
                    return (
                      <tr key={c.id} className="border-b border-white/5">
                        <td className="text-zinc-300 text-[0.625rem] font-bold py-2 px-1 truncate max-w-0">{c.nome}</td>
                        <td className="text-zinc-400 text-[0.625rem] py-2 px-1">{c.eventos}</td>
                        <td className="text-zinc-400 text-[0.625rem] py-2 px-1">{c.convidados}</td>
                        <td className="text-zinc-400 text-[0.625rem] py-2 px-1">
                          {c.checkins} ({convPct}%)
                        </td>
                        <td className="text-zinc-400 text-[0.625rem] py-2 px-1">{c.vendidos}</td>
                        <td className="text-[#FFD300] text-[0.625rem] font-bold py-2 px-1">{fmtBRL(c.gmv)}</td>
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
