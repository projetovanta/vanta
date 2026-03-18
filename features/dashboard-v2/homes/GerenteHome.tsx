/**
 * GerenteHome — "Sua casa, seu controle."
 * Cockpit: próximo evento + faturamento + checklist + vendas.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Users,
  Banknote,
  ListChecks,
  Clock,
  ChevronRight,
  Loader2,
  BarChart3,
  Building2,
} from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { fmtBRL } from '../../../utils';
import { eventosAdminService } from '../../admin/services/eventosAdminService';
import { comunidadesService } from '../../admin/services/comunidadesService';
import { getResumoFinanceiroComunidade } from '../../admin/services/eventosAdminFinanceiro';
import type { ResumoFinanceiro } from '../../admin/services/eventosAdminFinanceiro';
import { VendasTimelineChart } from '../VendasTimelineChart';
import {
  dashboardAnalyticsService,
  type Periodo,
  type VendasTimelinePoint,
} from '../../admin/services/dashboardAnalyticsService';
import { PERIODOS } from '../../admin/components/KpiCards';
import { ResumoFinanceiroCard } from '../../admin/components/ResumoFinanceiroCard';

interface Props {
  adminNome: string;
  comunidadeId?: string;
  onNavigate: (v: string) => void;
}

export const GerenteHome: React.FC<Props> = ({ adminNome, comunidadeId, onNavigate }) => {
  const [periodo, setPeriodo] = useState<Periodo>('MES');
  const [resumo, setResumo] = useState<ResumoFinanceiro | null>(null);
  const [resumoLoading, setResumoLoading] = useState(false);
  const [timeline, setTimeline] = useState<VendasTimelinePoint[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  const comunidade = comunidadeId ? comunidadesService.get(comunidadeId) : undefined;

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

  // Eventos da comunidade
  const eventos = useMemo(() => {
    if (!comunidadeId) return [];
    return eventosAdminService.getEventosByComunidade(comunidadeId);
  }, [comunidadeId]);

  // Próximo evento
  const proximoEvento = useMemo(() => {
    const now = new Date();
    const futuros = eventos
      .filter(e => e.publicado && new Date(e.dataInicio) > now)
      .sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime());
    return futuros[0] ?? null;
  }, [eventos]);

  // Evento ao vivo
  const eventoAoVivo = useMemo(() => {
    const now = new Date();
    return eventos.find(e => e.publicado && new Date(e.dataInicio) <= now && new Date(e.dataFim) >= now) ?? null;
  }, [eventos]);

  // KPIs
  const kpis = useMemo(() => {
    const totalVendidos = eventos.flatMap(e => e.lotes.flatMap(l => l.variacoes)).reduce((s, v) => s + v.vendidos, 0);
    const faturamento = eventos
      .flatMap(e => e.lotes.flatMap(l => l.variacoes))
      .reduce((s, v) => s + v.vendidos * v.valor, 0);
    return { totalVendidos, faturamento, totalEventos: eventos.length };
  }, [eventos]);

  // Dias até o próximo evento
  const diasAte = proximoEvento
    ? Math.ceil((new Date(proximoEvento.dataInicio).getTime() - Date.now()) / 86400000)
    : null;

  // Vendidos do próximo evento
  const proximoVendidos = proximoEvento
    ? proximoEvento.lotes.flatMap(l => l.variacoes).reduce((s, v) => s + v.vendidos, 0)
    : 0;
  const proximoCapacidade = proximoEvento
    ? proximoEvento.lotes.flatMap(l => l.variacoes).reduce((s, v) => s + v.limite, 0)
    : 0;
  const proximoPct = proximoCapacidade > 0 ? Math.round((proximoVendidos / proximoCapacidade) * 100) : 0;

  const fmtData = (iso: string) => {
    const d = new Date(iso);
    const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return `${dias[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1} · ${d.getHours()}h`;
  };

  return (
    <div className="flex-1 bg-[#0A0A0A] flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-5 max-w-3xl mx-auto w-full">
        {/* Saudação */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            <p className="text-[#10b981]/60 text-[0.5625rem] font-black uppercase tracking-[0.25em]">Gerente</p>
          </div>
          <h1 style={TYPOGRAPHY.screenTitle} className="text-xl leading-none text-white">
            Olá, {adminNome?.split(' ')[0]}
          </h1>
          {comunidade && (
            <p className="text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest mt-1.5">
              {comunidade.nome} · Sua casa, seu controle
            </p>
          )}
        </div>
        {/* Evento ao vivo */}
        {eventoAoVivo &&
          (() => {
            const vendidos = eventoAoVivo.lotes.flatMap(l => l.variacoes).reduce((s, v) => s + v.vendidos, 0);
            const cap = eventoAoVivo.lotes.flatMap(l => l.variacoes).reduce((s, v) => s + v.limite, 0);
            const pctVivo = cap > 0 ? Math.round((vendidos / cap) * 100) : 0;
            return (
              <button
                onClick={() => onNavigate('MEUS_EVENTOS')}
                className="w-full bg-red-500/10 border border-red-500/20 rounded-2xl p-4 active:bg-red-500/15 transition-all text-left"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <p className="text-red-400 text-[0.5625rem] font-black uppercase tracking-widest">
                    Acontecendo Agora
                  </p>
                </div>
                <p className="text-white font-bold text-sm">{eventoAoVivo.nome}</p>
                <p className="text-zinc-400 text-xs mt-1">
                  {vendidos} entradas · {pctVivo}% da capacidade
                </p>
              </button>
            );
          })()}

        {/* Próximo evento */}
        {proximoEvento && !eventoAoVivo && (
          <button
            onClick={() => onNavigate('MEUS_EVENTOS')}
            className="w-full bg-zinc-900/40 border border-white/5 rounded-2xl p-5 active:bg-white/5 transition-all text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-zinc-700 text-[0.5625rem] font-black uppercase tracking-[0.2em]">Próximo Evento</p>
              <span className="text-zinc-500 text-[0.5625rem] font-bold">
                {diasAte === 0 ? 'Hoje' : diasAte === 1 ? 'Amanhã' : `${diasAte} dias`}
              </span>
            </div>
            <p className="text-white font-bold text-sm">{proximoEvento.nome}</p>
            <p className="text-zinc-500 text-xs mt-1">{fmtData(proximoEvento.dataInicio)}</p>
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-zinc-400 text-xs font-bold">
                  {proximoVendidos}/{proximoCapacidade} vendidos
                </p>
                <p className="text-zinc-500 text-xs font-bold">{proximoPct}%</p>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${proximoPct}%`,
                    backgroundColor: proximoPct >= 90 ? '#ef4444' : proximoPct >= 60 ? '#f59e0b' : '#10b981',
                  }}
                />
              </div>
              {proximoPct < 30 && (
                <p className="text-zinc-600 text-[0.5625rem] mt-2">
                  Compartilhe o link do evento pra aumentar as vendas
                </p>
              )}
              {proximoPct >= 90 && (
                <p className="text-amber-400 text-[0.5625rem] mt-2">Quase lotando! Considere abrir mais ingressos</p>
              )}
            </div>
          </button>
        )}

        {/* Hero faturamento */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5">
          <div className="flex flex-col items-center text-center">
            <p className="text-[#FFD300] text-3xl font-black leading-none">{fmtBRL(kpis.faturamento)}</p>
            <p className="text-zinc-500 text-[0.5625rem] font-black uppercase tracking-widest mt-1">
              Faturamento da casa
            </p>
          </div>
          <div className="flex items-center justify-center gap-6 mt-3">
            <div className="text-center">
              <p className="text-white font-black text-lg">{kpis.totalVendidos}</p>
              <p className="text-zinc-500 text-[0.5625rem] font-black uppercase">vendidos</p>
            </div>
            <div className="text-center">
              <p className="text-white font-black text-lg">{kpis.totalEventos}</p>
              <p className="text-zinc-500 text-[0.5625rem] font-black uppercase">eventos</p>
            </div>
          </div>
        </div>

        {/* Filtros + Gráfico */}
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

        <VendasTimelineChart data={timeline} loading={timelineLoading} />

        {/* Resumo financeiro */}
        {(resumo || resumoLoading) && (
          <ResumoFinanceiroCard resumo={resumo!} loading={resumoLoading} titulo="Financeiro da Casa" />
        )}

        {/* Ações */}
        <div>
          <p className="text-zinc-700 text-[0.5625rem] font-black uppercase tracking-[0.2em] mb-2.5">
            O que você pode fazer
          </p>
          <div className="space-y-2">
            {[
              {
                id: 'MEUS_EVENTOS',
                label: 'Eventos',
                sub: 'Criar, editar, gerenciar',
                icon: Calendar,
                color: '#a78bfa',
              },
              { id: 'LISTAS', label: 'Listas', sub: 'Convidados e cotas', icon: ListChecks, color: '#60a5fa' },
              { id: 'FINANCEIRO', label: 'Financeiro', sub: 'Receita e saques', icon: Banknote, color: '#10b981' },
              {
                id: 'RELATORIO_MASTER',
                label: 'Relatórios',
                sub: 'Resumo e exportação',
                icon: BarChart3,
                color: '#f59e0b',
              },
              {
                id: 'COMUNIDADES',
                label: 'Editar Comunidade',
                sub: 'Dados, fotos e configuração',
                icon: Building2,
                color: '#8b8b8b',
              },
            ].map(btn => (
              <button
                key={btn.id}
                onClick={() => onNavigate(btn.id)}
                className="w-full flex items-center gap-4 bg-zinc-900/40 border border-white/5 rounded-2xl p-4 active:bg-white/5 active:border-white/10 transition-all text-left"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${btn.color}15`, border: `1px solid ${btn.color}25` }}
                >
                  <btn.icon size="1.125rem" style={{ color: btn.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm leading-tight truncate">{btn.label}</p>
                  <p className="text-zinc-400 text-[0.625rem] mt-0.5 truncate">{btn.sub}</p>
                </div>
                <ChevronRight size="0.875rem" className="text-zinc-700 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
