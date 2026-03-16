/**
 * SocioHome — "Seu evento, seus números."
 * Foco: split do sócio + vendas do evento + condições comerciais.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Banknote, Users, Calendar, TrendingUp, Loader2, FileText } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { fmtBRL } from '../../../utils';
import { eventosAdminService } from '../../admin/services/eventosAdminService';
import { getResumoFinanceiroComunidade } from '../../admin/services/eventosAdminFinanceiro';
import type { ResumoFinanceiro } from '../../admin/services/eventosAdminFinanceiro';
import { KpiCard } from '../../admin/components/KpiCards';
import { VendasTimelineChart } from '../VendasTimelineChart';
import {
  dashboardAnalyticsService,
  type Periodo,
  type VendasTimelinePoint,
} from '../../admin/services/dashboardAnalyticsService';
import { PERIODOS } from '../../admin/components/KpiCards';

interface Props {
  adminNome: string;
  comunidadeId?: string;
  onNavigate: (v: string) => void;
}

export const SocioHome: React.FC<Props> = ({ adminNome, comunidadeId, onNavigate }) => {
  const [periodo, setPeriodo] = useState<Periodo>('MES');
  const [resumo, setResumo] = useState<ResumoFinanceiro | null>(null);
  const [resumoLoading, setResumoLoading] = useState(false);
  const [timeline, setTimeline] = useState<VendasTimelinePoint[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  // Resumo financeiro
  useEffect(() => {
    if (!comunidadeId) return;
    let cancelled = false;
    setResumoLoading(true);
    getResumoFinanceiroComunidade(comunidadeId)
      .then(r => {
        if (!cancelled) {
          setResumo(r);
          setResumoLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setResumoLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [comunidadeId]);

  // Timeline vendas
  useEffect(() => {
    if (!comunidadeId) return;
    let cancelled = false;
    setTimelineLoading(true);
    dashboardAnalyticsService
      .getVendasTimeline(periodo, comunidadeId)
      .then(d => {
        if (!cancelled) {
          setTimeline(d);
          setTimelineLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setTimelineLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [periodo, comunidadeId]);

  // KPIs do evento
  const kpis = useMemo(() => {
    if (!comunidadeId) return null;
    const eventos = eventosAdminService.getEventosByComunidade(comunidadeId);
    const totalVendidos = eventos.flatMap(e => e.lotes.flatMap(l => l.variacoes)).reduce((s, v) => s + v.vendidos, 0);
    const faturamento = eventos
      .flatMap(e => e.lotes.flatMap(l => l.variacoes))
      .reduce((s, v) => s + v.vendidos * v.valor, 0);
    const ticketMedio = totalVendidos > 0 ? faturamento / totalVendidos : 0;
    // TODO: pegar split real do sócio via socios_evento
    const splitPct = 40;
    const meuSplit = faturamento * (splitPct / 100);
    return { totalVendidos, faturamento, ticketMedio, splitPct, meuSplit, eventos: eventos.length };
  }, [comunidadeId]);

  return (
    <div className="flex-1 bg-[#0A0A0A] flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-5 max-w-3xl mx-auto w-full">
        {/* Saudação */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] animate-pulse" />
            <p className="text-[#a78bfa]/60 text-[0.5625rem] font-black uppercase tracking-[0.25em]">Sócio</p>
          </div>
          <h1 style={TYPOGRAPHY.screenTitle} className="text-xl italic leading-none text-white">
            Olá, {adminNome?.split(' ')[0]}
          </h1>
          <p className="text-zinc-500 text-[0.625rem] font-black uppercase tracking-widest mt-1.5">
            Seu evento, seus números
          </p>
        </div>
        {/* Hero — Meu Split */}
        {kpis && (
          <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5">
            <div className="flex flex-col items-center text-center mb-4">
              <p className="text-[#FFD300] text-3xl font-black leading-none">{fmtBRL(kpis.meuSplit)}</p>
              <p className="text-zinc-500 text-[0.5625rem] font-black uppercase tracking-widest mt-1">
                Seu split ({kpis.splitPct}%)
              </p>
              <p className="text-zinc-600 text-xs mt-1">Evento faturou {fmtBRL(kpis.faturamento)}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <KpiCard label="Vendidos" value={kpis.totalVendidos} color="#a78bfa" icon={Users} />
              <KpiCard
                label="Tkt Médio"
                value={kpis.ticketMedio}
                color="#10b981"
                icon={TrendingUp}
                formatValue={fmtBRL}
              />
              <KpiCard label="Eventos" value={kpis.eventos} color="#60a5fa" icon={Calendar} />
            </div>
          </div>
        )}

        {/* Filtro de período */}
        <div className="flex gap-1.5">
          {PERIODOS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriodo(p.value)}
              className={`px-3 py-1.5 rounded-full text-[0.5625rem] font-black uppercase tracking-wider transition-all ${
                periodo === p.value
                  ? 'bg-[#FFD300] text-black'
                  : 'bg-zinc-900/60 text-zinc-400 border border-white/5 active:bg-white/5'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Gráfico vendas */}
        <VendasTimelineChart data={timeline} loading={timelineLoading} />

        {/* Ações */}
        <div>
          <p className="text-zinc-700 text-[0.5625rem] font-black uppercase tracking-[0.2em] mb-2.5">
            O que você pode fazer
          </p>
          <div className="space-y-2">
            <button
              onClick={() => onNavigate('MEUS_EVENTOS')}
              className="w-full flex items-center gap-4 bg-zinc-900/40 border border-white/5 rounded-2xl p-4 active:bg-white/5 transition-all text-left"
            >
              <div className="w-11 h-11 rounded-xl bg-[#a78bfa]/15 border border-[#a78bfa]/25 flex items-center justify-center shrink-0">
                <Calendar size="1.125rem" className="text-[#a78bfa]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm">Meu Evento</p>
                <p className="text-zinc-400 text-[0.625rem] mt-0.5">Detalhes, pedidos e equipe</p>
              </div>
            </button>
            <button
              onClick={() => onNavigate('LISTAS')}
              className="w-full flex items-center gap-4 bg-zinc-900/40 border border-white/5 rounded-2xl p-4 active:bg-white/5 transition-all text-left"
            >
              <div className="w-11 h-11 rounded-xl bg-[#60a5fa]/15 border border-[#60a5fa]/25 flex items-center justify-center shrink-0">
                <Users size="1.125rem" className="text-[#60a5fa]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm">Listas</p>
                <p className="text-zinc-400 text-[0.625rem] mt-0.5">Convidados e cotas</p>
              </div>
            </button>
            <button
              onClick={() => onNavigate('FINANCEIRO')}
              className="w-full flex items-center gap-4 bg-zinc-900/40 border border-white/5 rounded-2xl p-4 active:bg-white/5 transition-all text-left"
            >
              <div className="w-11 h-11 rounded-xl bg-[#10b981]/15 border border-[#10b981]/25 flex items-center justify-center shrink-0">
                <Banknote size="1.125rem" className="text-[#10b981]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm">Financeiro</p>
                <p className="text-zinc-400 text-[0.625rem] mt-0.5">Receita e saques</p>
              </div>
            </button>
            <button
              onClick={() => onNavigate('CONDICOES_COMERCIAIS')}
              className="w-full flex items-center gap-4 bg-zinc-900/40 border border-white/5 rounded-2xl p-4 active:bg-white/5 transition-all text-left"
            >
              <div className="w-11 h-11 rounded-xl bg-[#f59e0b]/15 border border-[#f59e0b]/25 flex items-center justify-center shrink-0">
                <FileText size="1.125rem" className="text-[#f59e0b]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm">Condições Comerciais</p>
                <p className="text-zinc-400 text-[0.625rem] mt-0.5">Taxas e acordos</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
