/**
 * DashboardV2Home — Dashboard V2 impactante
 * Ordem: Pendências → Hero financeiro → Gráfico vendas → Pizza → Resumo financeiro → MV → Ações
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Building2,
  ChevronRight,
  Banknote,
  ListChecks,
  ShieldPlus,
  Star,
  Calendar,
  ShoppingCart,
  ClipboardList,
  Shield,
  Loader2,
  Crown,
  Compass,
  Gift,
  RotateCcw,
  UserPlus,
  TrendingUp,
  TrendingDown,
  Minus,
  type LucideIcon,
} from 'lucide-react';
import { TYPOGRAPHY } from '../../constants';
import { fmtBRL } from '../../utils';
import { supabase } from '../../services/supabaseClient';
import type { ContaVantaLegacy } from '../../types';
import type { AdminSubView } from '../admin/components/AdminSidebar';

// Services
import { eventosAdminService } from '../admin/services/eventosAdminService';
import { comunidadesService } from '../admin/services/comunidadesService';
import { assinaturaService } from '../admin/services/assinaturaService';
import { getResumoFinanceiroGlobal, getResumoFinanceiroComunidade } from '../admin/services/eventosAdminFinanceiro';
import type { ResumoFinanceiro } from '../admin/services/eventosAdminFinanceiro';
import {
  dashboardAnalyticsService,
  type Periodo,
  type DashboardMetrics,
  type VendasTimelinePoint,
  getPeriodoLabel,
} from '../admin/services/dashboardAnalyticsService';

// Componentes reutilizados
import { KpiCard, KpiDeltaCard, KpiPieCard, PERIODOS } from '../admin/components/KpiCards';
import { VantaPieChart } from '../admin/components/VantaPieChart';
import { ResumoFinanceiroCard } from '../admin/components/ResumoFinanceiroCard';
import { VendasTimelineChart } from './VendasTimelineChart';
import { GerenteHome } from './homes/GerenteHome';
import { SocioHome } from './homes/SocioHome';
import { PromoterHome } from './homes/PromoterHome';
import { PortariaHome } from './homes/PortariaHome';
import { CaixaHome } from './homes/CaixaHome';

// ── Tipos ──────────────────────────────────────────────────────────────────

interface Pendencias {
  curadoria: number;
  pendentes: number;
  saques: number;
  passaportesMV: number;
  solicitacoesMV: number;
  dividaSocial: number;
  reembolsos: number;
}

interface Props {
  adminNome: string;
  adminRole: ContaVantaLegacy;
  currentUserId: string;
  tenantNome: string | null;
  pendencias: Pendencias;
  onNavigate: (v: AdminSubView) => void;
  comunidadeId?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const calcDelta = (atual: number, anterior: number): number =>
  anterior === 0 ? (atual > 0 ? 100 : 0) : Math.round(((atual - anterior) / anterior) * 100);

const DeltaBadge: React.FC<{ delta: number }> = ({ delta }) => {
  const isPositive = delta > 0;
  const isNegative = delta < 0;
  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  const color = isPositive ? '#10b981' : isNegative ? '#ef4444' : '#71717a';
  return (
    <div className="flex items-center gap-0.5">
      <Icon size="0.75rem" style={{ color }} />
      <span className="text-xs font-bold" style={{ color }}>
        {delta > 0 ? '+' : ''}
        {delta}%
      </span>
    </div>
  );
};

// ── Componente principal ───────────────────────────────────────────────────

export const DashboardV2Home: React.FC<Props> = ({
  adminNome,
  adminRole,
  currentUserId,
  tenantNome,
  pendencias,
  onNavigate,
  comunidadeId,
}) => {
  // ── Role detection ──────────────────────────────────────────────────────
  const isMaster = adminRole === 'vanta_masteradm';
  const isSocio = adminRole === 'vanta_socio';
  const isGerente = adminRole === 'vanta_gerente';
  const isPromoterRole = adminRole === 'vanta_promoter';
  const isPortariaRole =
    adminRole === 'vanta_ger_portaria_lista' ||
    adminRole === 'vanta_portaria_lista' ||
    adminRole === 'vanta_ger_portaria_antecipado' ||
    adminRole === 'vanta_portaria_antecipado';
  const isCaixa = adminRole === 'vanta_caixa';
  const isInCommunity = Boolean(comunidadeId);
  const canSeeFinanceiro = isMaster || isGerente || isSocio;

  // Roles que renderizam home especializada (hooks devem vir ANTES deste check)
  const useSpecializedHome = isPromoterRole || isPortariaRole || isCaixa || isSocio || (isGerente && !!comunidadeId);

  // ── Estado ───────────────────────────────────────────────────────────────
  const [periodo, setPeriodo] = useState<Periodo>('MES');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [resumoFin, setResumoFin] = useState<ResumoFinanceiro | null>(null);
  const [resumoLoading, setResumoLoading] = useState(false);
  const [timeline, setTimeline] = useState<VendasTimelinePoint[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  // ── Realtime: atualiza ao vivo quando há nova venda ou check-in ──
  const [realtimeTick, setRealtimeTick] = useState(0);
  useEffect(() => {
    if (!canSeeFinanceiro) return;
    const channel = supabase
      .channel('dashboard-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tickets_caixa' }, () => {
        setRealtimeTick(t => t + 1);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tickets_caixa' }, () => {
        setRealtimeTick(t => t + 1);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [canSeeFinanceiro]);

  // Refresh dados quando realtime notifica
  useEffect(() => {
    if (realtimeTick === 0) return;
    eventosAdminService.refresh();
  }, [realtimeTick]);

  // KPIs temporais (master global)
  useEffect(() => {
    if (!isMaster || isInCommunity) return;
    let cancelled = false;
    setMetricsLoading(true);
    dashboardAnalyticsService
      .getMetrics(periodo)
      .then(m => {
        if (!cancelled) {
          setMetrics(m);
          setMetricsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setMetricsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isMaster, isInCommunity, periodo]);

  // Resumo financeiro
  useEffect(() => {
    if (!canSeeFinanceiro) return;
    let cancelled = false;
    setResumoLoading(true);
    const fn = comunidadeId ? getResumoFinanceiroComunidade(comunidadeId) : getResumoFinanceiroGlobal();
    fn.then(r => {
      if (!cancelled) {
        setResumoFin(r);
        setResumoLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setResumoLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [comunidadeId, canSeeFinanceiro]);

  // Timeline vendas
  useEffect(() => {
    if (!canSeeFinanceiro) return;
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
  }, [periodo, comunidadeId, canSeeFinanceiro]);

  // KPIs comunidade (estáticos)
  const communityKpis = useMemo(() => {
    if (!comunidadeId) return null;
    const eventos = eventosAdminService.getEventosByComunidade(comunidadeId);
    const totalIngressos = eventos.flatMap(e => e.lotes.flatMap(l => l.variacoes)).reduce((s, v) => s + v.vendidos, 0);
    const faturamento = eventos
      .flatMap(e => e.lotes.flatMap(l => l.variacoes))
      .reduce((s, v) => s + v.vendidos * v.valor, 0);
    return { eventos: eventos.length, totalIngressos, faturamento };
  }, [comunidadeId]);

  // Pizza faturamento (comunidade: por evento, global: por comunidade)
  const pieData = useMemo(() => {
    if (!canSeeFinanceiro) return null;
    const PIE_COLORS = ['#a78bfa', '#10b981', '#3b82f6', '#f59e0b', '#f472b6', '#FFD300', '#ef4444', '#6366f1'];

    if (isInCommunity && comunidadeId) {
      const eventos = eventosAdminService.getEventosByComunidade(comunidadeId);
      const slices = eventos
        .map((e, i) => ({
          name: e.nome,
          value: e.lotes.flatMap(l => l.variacoes).reduce((s, v) => s + v.vendidos * v.valor, 0),
          color: PIE_COLORS[i % PIE_COLORS.length],
        }))
        .filter(s => s.value > 0);
      return slices.length > 0 ? slices : null;
    }

    if (isMaster && !isInCommunity) {
      const coms = comunidadesService.getAll();
      const slices = coms
        .map(c => {
          const evts = eventosAdminService.getEventosByComunidade(c.id);
          const fat = evts
            .flatMap(e => e.lotes.flatMap(l => l.variacoes))
            .reduce((s, v) => s + v.vendidos * v.valor, 0);
          return { name: c.nome, value: fat };
        })
        .filter(s => s.value > 0)
        .sort((a, b) => b.value - a.value);
      const TOP = 5;
      const top = slices.slice(0, TOP).map((s, i) => ({ ...s, color: PIE_COLORS[i] }));
      const restTotal = slices.slice(TOP).reduce((s, c) => s + c.value, 0);
      if (restTotal > 0) top.push({ name: 'Outros', value: restTotal, color: '#52525b' });
      return top.length > 0 ? top : null;
    }

    return null;
  }, [canSeeFinanceiro, isInCommunity, comunidadeId, isMaster]);

  // KPIs estáticos master
  const kpis = useMemo(() => {
    if (!isMaster || isInCommunity) return null;
    const todasComunidades = comunidadesService.getAll().length;
    const comunidadesAtivas = comunidadesService.getAtivas().length;
    const todosEventos = eventosAdminService.getEventos();
    const eventosPublicados = todosEventos.filter(e => e.publicado).length;
    return { comunidades: todasComunidades, comunidadesAtivas, eventos: todosEventos.length, eventosPublicados };
  }, [isMaster, isInCommunity]);

  // Role label
  const roleLabel = isMaster
    ? 'Master Admin'
    : isSocio
      ? 'Sócio'
      : isGerente
        ? 'Gerente'
        : isPromoterRole
          ? 'Promoter'
          : isPortariaRole
            ? 'Portaria'
            : isCaixa
              ? 'Caixa'
              : 'Operacional';

  // ── Pendências ───────────────────────────────────────────────────────────
  const totalPendencias =
    pendencias.pendentes +
    pendencias.saques +
    pendencias.curadoria +
    pendencias.passaportesMV +
    pendencias.solicitacoesMV +
    pendencias.dividaSocial +
    pendencias.reembolsos;

  const pendenciaItems = useMemo(() => {
    const items: {
      icon: LucideIcon;
      label: string;
      count: number;
      color: string;
      bg: string;
      border: string;
      nav: AdminSubView;
    }[] = [];
    if (pendencias.solicitacoesMV > 0)
      items.push({
        icon: UserPlus,
        label: `${pendencias.solicitacoesMV} solicitaç${pendencias.solicitacoesMV > 1 ? 'ões' : 'ão'} MAIS VANTA`,
        count: pendencias.solicitacoesMV,
        color: 'text-[#FFD300]',
        bg: 'bg-[#FFD300]/5',
        border: 'border-[#FFD300]/15',
        nav: 'MAIS_VANTA_HUB' as AdminSubView,
      });
    if (pendencias.passaportesMV > 0)
      items.push({
        icon: Compass,
        label: `${pendencias.passaportesMV} passaporte${pendencias.passaportesMV > 1 ? 's' : ''} aguardando`,
        count: pendencias.passaportesMV,
        color: 'text-[#FFD300]',
        bg: 'bg-[#FFD300]/5',
        border: 'border-[#FFD300]/15',
        nav: 'PASSAPORTES_MV' as AdminSubView,
      });
    if (pendencias.pendentes > 0)
      items.push({
        icon: ClipboardList,
        label: `${pendencias.pendentes} evento${pendencias.pendentes > 1 ? 's' : ''} aguardando`,
        count: pendencias.pendentes,
        color: 'text-amber-500',
        bg: 'bg-amber-500/5',
        border: 'border-amber-500/15',
        nav: 'PENDENTES' as AdminSubView,
      });
    if (pendencias.saques > 0)
      items.push({
        icon: Banknote,
        label: `${pendencias.saques} saque${pendencias.saques > 1 ? 's' : ''} pendente${pendencias.saques > 1 ? 's' : ''}`,
        count: pendencias.saques,
        color: 'text-red-400',
        bg: 'bg-red-500/5',
        border: 'border-red-500/15',
        nav: 'FINANCEIRO_MASTER' as AdminSubView,
      });
    if (pendencias.reembolsos > 0)
      items.push({
        icon: RotateCcw,
        label: `${pendencias.reembolsos} reembolso${pendencias.reembolsos > 1 ? 's' : ''} aguardando`,
        count: pendencias.reembolsos,
        color: 'text-orange-400',
        bg: 'bg-orange-500/5',
        border: 'border-orange-500/15',
        nav: 'FINANCEIRO_MASTER' as AdminSubView,
      });
    if (pendencias.curadoria > 0)
      items.push({
        icon: Star,
        label: `${pendencias.curadoria} curadoria${pendencias.curadoria > 1 ? 's' : ''} pendente${pendencias.curadoria > 1 ? 's' : ''}`,
        count: pendencias.curadoria,
        color: 'text-purple-400',
        bg: 'bg-purple-500/5',
        border: 'border-purple-500/15',
        nav: 'CURADORIA_MV' as AdminSubView,
      });
    if (pendencias.dividaSocial > 0)
      items.push({
        icon: Gift,
        label: `${pendencias.dividaSocial} membro${pendencias.dividaSocial > 1 ? 's' : ''} com dívida social`,
        count: pendencias.dividaSocial,
        color: 'text-amber-400',
        bg: 'bg-amber-500/5',
        border: 'border-amber-500/15',
        nav: 'DIVIDA_SOCIAL_MV' as AdminSubView,
      });
    return items;
  }, [pendencias]);

  // ── Ações rápidas ────────────────────────────────────────────────────────
  const buttons = useMemo(() => {
    const list: {
      id: AdminSubView;
      label: string;
      sublabel: string;
      icon: LucideIcon;
      color: string;
      badge?: number;
      badgeColor?: string;
    }[] = [];

    if (isInCommunity) {
      if (isMaster || isGerente || isSocio)
        list.push({
          id: 'MEUS_EVENTOS',
          label: 'Eventos',
          sublabel: 'Gerenciar eventos',
          icon: Calendar,
          color: '#a78bfa',
        });
      if (isMaster || isGerente || isSocio || isPromoterRole)
        list.push({
          id: 'LISTAS',
          label: 'Listas',
          sublabel: isPromoterRole ? 'Suas cotas' : 'Convidados e cotas',
          icon: ListChecks,
          color: '#60a5fa',
        });
      if (isMaster || isGerente || isSocio)
        list.push({
          id: 'FINANCEIRO',
          label: 'Financeiro',
          sublabel: 'Receita e saques',
          icon: Banknote,
          color: '#10b981',
        });
      if (isCaixa)
        list.push({ id: 'CAIXA', label: 'Caixa', sublabel: 'Venda na porta', icon: ShoppingCart, color: '#f59e0b' });
      if (adminRole === 'vanta_ger_portaria_antecipado' || adminRole === 'vanta_portaria_antecipado')
        list.push({
          id: 'PORTARIA_QR',
          label: 'Scanner QR',
          sublabel: 'Validação de ingressos',
          icon: Shield,
          color: '#22d3ee',
        });
      if (adminRole === 'vanta_ger_portaria_lista' || adminRole === 'vanta_portaria_lista')
        list.push({
          id: 'PORTARIA_LISTA',
          label: 'Check-in Lista',
          sublabel: 'Validação por lista',
          icon: ListChecks,
          color: '#22d3ee',
        });
      return list;
    }

    if (isMaster) {
      if (pendencias.pendentes > 0)
        list.push({
          id: 'PENDENTES',
          label: 'Eventos Pendentes',
          sublabel: `${pendencias.pendentes} aguardando`,
          icon: ClipboardList,
          color: '#f59e0b',
          badge: pendencias.pendentes,
          badgeColor: '#f59e0b',
        });
      list.push({
        id: 'FINANCEIRO_MASTER',
        label: 'Financeiro',
        sublabel: 'Receita, taxas e saques',
        icon: Banknote,
        color: '#10b981',
        badge: pendencias.saques > 0 ? pendencias.saques : undefined,
        badgeColor: '#ef4444',
      });
      list.push({
        id: 'CURADORIA',
        label: 'Curadoria',
        sublabel: 'Membros e prestígio',
        icon: Star,
        color: '#a78bfa',
        badge: pendencias.curadoria > 0 ? pendencias.curadoria : undefined,
        badgeColor: '#a78bfa',
      });
      list.push({
        id: 'CARGOS',
        label: 'Definir Cargos',
        sublabel: 'Cargos e permissões',
        icon: ShieldPlus,
        color: '#f472b6',
      });
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMaster, isSocio, isGerente, isPromoterRole, isPortariaRole, isCaixa, pendencias, isInCommunity, adminRole]);

  // ── Router: homes especializadas por role ────────────────────────────────
  if (isPromoterRole) {
    return (
      <PromoterHome
        adminNome={adminNome}
        currentUserId={currentUserId}
        comunidadeId={comunidadeId}
        onNavigate={v => onNavigate(v as AdminSubView)}
      />
    );
  }
  if (isPortariaRole) {
    return <PortariaHome adminNome={adminNome} adminRole={adminRole} onNavigate={v => onNavigate(v as AdminSubView)} />;
  }
  if (isCaixa) {
    return (
      <CaixaHome adminNome={adminNome} comunidadeId={comunidadeId} onNavigate={v => onNavigate(v as AdminSubView)} />
    );
  }
  if (isSocio) {
    return (
      <SocioHome adminNome={adminNome} comunidadeId={comunidadeId} onNavigate={v => onNavigate(v as AdminSubView)} />
    );
  }
  if (isGerente && comunidadeId) {
    return (
      <GerenteHome adminNome={adminNome} comunidadeId={comunidadeId} onNavigate={v => onNavigate(v as AdminSubView)} />
    );
  }

  // ── Render (MasterHome) ────────────────────────────────────────────────
  return (
    <div className="flex-1 bg-[#0A0A0A] flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-5 max-w-3xl mx-auto w-full">
        {/* Saudação */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FFD300] animate-pulse" />
            <p className="text-[#FFD300]/60 text-[0.5625rem] font-black uppercase tracking-[0.25em]">{roleLabel}</p>
          </div>
          <h1 style={TYPOGRAPHY.screenTitle} className="text-xl leading-none text-white">
            Bem-vindo, {adminNome}
          </h1>
          {tenantNome && (
            <p className="text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest mt-1.5">{tenantNome}</p>
          )}
          {isMaster && !tenantNome && (
            <p className="text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest mt-1.5">
              Visão global da plataforma
            </p>
          )}
        </div>
        {/* ═══ 1. PENDÊNCIAS URGENTES ═══ */}
        {totalPendencias > 0 && (isMaster || isGerente) && (
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-zinc-700 text-[0.5625rem] font-black uppercase tracking-[0.2em]">
                Pendências Urgentes
              </p>
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[0.5625rem] font-black animate-pulse">
                {totalPendencias}
              </span>
            </div>
            <div className="space-y-1.5">
              {pendenciaItems.map((item, i) => (
                <button
                  key={i}
                  onClick={() => onNavigate(item.nav)}
                  className={`w-full flex items-center gap-3 ${item.bg} border ${item.border} rounded-xl px-4 py-3 active:opacity-80 transition-all text-left`}
                >
                  <item.icon size="0.9375rem" className={`${item.color} shrink-0`} />
                  <p className="flex-1 text-zinc-300 text-xs font-semibold truncate">{item.label}</p>
                  <ChevronRight size="0.8125rem" className="text-zinc-700 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ═══ 2. HERO FINANCEIRO ═══ */}
        {canSeeFinanceiro && (
          <div>
            {/* Filtros de período */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-zinc-700 text-[0.5625rem] font-black uppercase tracking-[0.2em]">Desempenho</p>
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
            </div>

            {/* Número hero — faturamento */}
            {isMaster && !isInCommunity && metrics && (
              <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 mb-3">
                <div className="flex flex-col items-center text-center">
                  <p className="text-[#FFD300] text-3xl font-black leading-none">{fmtBRL(metrics.lucroVanta.atual)}</p>
                  <DeltaBadge delta={calcDelta(metrics.lucroVanta.atual, metrics.lucroVanta.anterior)} />
                  <p className="text-zinc-500 text-[0.5625rem] font-black uppercase tracking-widest mt-1">
                    Receita VANTA · {getPeriodoLabel(periodo)}
                  </p>
                </div>

                {/* KPIs secundários */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <KpiDeltaCard label="Vendas" metric={metrics.vendaConvites} color="#a78bfa" icon={ShoppingCart} />
                  <KpiDeltaCard label="Membros" metric={metrics.membrosNovos} color="#22d3ee" icon={Users} />
                  <KpiDeltaCard label="Eventos" metric={metrics.eventos} color="#60a5fa" icon={Calendar} />
                </div>
              </div>
            )}

            {/* Hero comunidade */}
            {isInCommunity && communityKpis && (
              <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 mb-3">
                <div className="flex flex-col items-center text-center mb-4">
                  <p className="text-[#FFD300] text-3xl font-black leading-none">{fmtBRL(communityKpis.faturamento)}</p>
                  <p className="text-zinc-500 text-[0.5625rem] font-black uppercase tracking-widest mt-1">
                    Faturamento da Comunidade
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <KpiCard
                    label="Eventos"
                    value={communityKpis.eventos}
                    color="#a78bfa"
                    icon={Calendar}
                    onClick={() => onNavigate('MEUS_EVENTOS')}
                  />
                  <KpiCard label="Ingressos" value={communityKpis.totalIngressos} color="#60a5fa" icon={Users} />
                </div>
              </div>
            )}

            {metricsLoading && !metrics && (
              <div className="flex items-center justify-center py-8">
                <Loader2 size="1.25rem" className="text-[#FFD300] animate-spin" />
              </div>
            )}
          </div>
        )}

        {/* ═══ 3. GRÁFICO DE VENDAS ═══ */}
        {canSeeFinanceiro && <VendasTimelineChart data={timeline} loading={timelineLoading} />}

        {/* ═══ 4. KPIs ESTÁTICOS MASTER ═══ */}
        {isMaster && kpis && !isInCommunity && (
          <div>
            <p className="text-zinc-700 text-[0.5625rem] font-black uppercase tracking-[0.2em] mb-2.5">Resumo Total</p>
            <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-2">
              <KpiPieCard
                label="Comunidades Ativas"
                value={kpis.comunidadesAtivas}
                total={kpis.comunidades}
                color="#60a5fa"
              />
              <KpiPieCard
                label="Eventos Publicados"
                value={kpis.eventosPublicados}
                total={kpis.eventos}
                color="#a78bfa"
              />
            </div>
          </div>
        )}

        {/* ═══ 5. PIZZA FATURAMENTO ═══ */}
        {pieData && (
          <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
            <p className="text-zinc-700 text-[0.5625rem] font-black uppercase tracking-[0.2em]">
              {isInCommunity ? 'Faturamento por Evento' : 'Faturamento por Comunidade'}
            </p>
            <VantaPieChart
              data={pieData}
              formatValue={v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              height={150}
            />
          </div>
        )}

        {/* ═══ 6. RESUMO FINANCEIRO ═══ */}
        {canSeeFinanceiro && (resumoFin || resumoLoading) && (
          <ResumoFinanceiroCard
            resumo={resumoFin!}
            loading={resumoLoading}
            titulo={isInCommunity ? 'Financeiro da Comunidade' : 'Financeiro Global'}
          />
        )}

        {/* ═══ 7. BANNER MAIS VANTA ═══ */}
        {isInCommunity &&
          comunidadeId &&
          (isMaster || isSocio) &&
          (() => {
            const assinatura = assinaturaService.getAssinatura(comunidadeId);
            const ativa = assinatura?.status === 'ATIVA';
            return (
              <button
                onClick={() => onNavigate('MAIS_VANTA')}
                className={`w-full flex items-center gap-4 rounded-2xl p-4 active:scale-[0.99] transition-all text-left ${
                  ativa
                    ? 'bg-[#FFD300]/5 border border-[#FFD300]/15'
                    : 'bg-gradient-to-r from-[#FFD300]/10 to-[#FFD300]/5 border border-[#FFD300]/20'
                }`}
              >
                <div className="w-11 h-11 rounded-xl bg-[#FFD300]/15 border border-[#FFD300]/25 flex items-center justify-center shrink-0">
                  <Crown size="1.25rem" className="text-[#FFD300]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">
                    {ativa ? 'MAIS VANTA Ativo' : 'Ative o MAIS VANTA'}
                  </p>
                  <p className="text-zinc-400 text-[0.625rem] mt-0.5 truncate">
                    {ativa
                      ? `Plano ${assinaturaService.getInfoPlano(assinatura!).nome} · ${assinaturaService.getInfoPlano(assinatura!).membros} membros`
                      : 'Atraia influenciadores para seus eventos'}
                  </p>
                </div>
                {ativa ? (
                  <span className="shrink-0 px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[0.5625rem] font-black uppercase tracking-wider">
                    Ativo
                  </span>
                ) : (
                  <span className="shrink-0 px-3 py-1.5 rounded-full bg-[#FFD300] text-black text-[0.5625rem] font-black uppercase tracking-wider">
                    Conhecer
                  </span>
                )}
              </button>
            );
          })()}

        {/* ═══ 8. MAIS VANTA MASTER (assinaturas globais) ═══ */}
        {isMaster &&
          !isInCommunity &&
          (() => {
            const allSubs = assinaturaService.getTodasAssinaturas();
            const ativas = allSubs.filter(a => a.status === 'ATIVA').length;
            const mrr = allSubs.filter(a => a.status === 'ATIVA').reduce((s, a) => s + a.valorMensal, 0);
            if (allSubs.length === 0) return null;
            return (
              <button
                onClick={() => onNavigate('ASSINATURAS_MV')}
                className="w-full bg-[#FFD300]/5 border border-[#FFD300]/15 rounded-2xl p-4 active:bg-[#FFD300]/10 transition-all text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Crown size="0.875rem" className="text-[#FFD300] shrink-0" />
                    <p className="text-[#FFD300] text-[0.5625rem] font-black uppercase tracking-widest">MAIS VANTA</p>
                  </div>
                  <ChevronRight size="0.8125rem" className="text-zinc-700 shrink-0" />
                </div>
                <div className="flex items-baseline gap-4">
                  <div>
                    <p className="text-white font-black text-2xl leading-none">{ativas}</p>
                    <p className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-widest mt-1">ativas</p>
                  </div>
                  <div>
                    <p className="text-[#FFD300] font-black text-xl leading-none">{fmtBRL(mrr)}</p>
                    <p className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-widest mt-1">MRR</p>
                  </div>
                </div>
              </button>
            );
          })()}

        {/* ═══ 9. AÇÕES RÁPIDAS ═══ */}
        {buttons.length > 0 && (
          <div>
            <p className="text-zinc-700 text-[0.5625rem] font-black uppercase tracking-[0.2em] mb-2.5">Ações Rápidas</p>
            <div className="space-y-2">
              {buttons.map(btn => {
                const Icon = btn.icon;
                const hasBadge = (btn.badge ?? 0) > 0;
                return (
                  <button
                    key={btn.id}
                    onClick={() => onNavigate(btn.id)}
                    className="w-full flex items-center gap-4 bg-zinc-900/40 border border-white/5 rounded-2xl p-4 active:bg-white/5 active:border-white/10 transition-all text-left"
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 relative"
                      style={{ backgroundColor: `${btn.color}15`, border: `1px solid ${btn.color}25` }}
                    >
                      <Icon size="1.125rem" style={{ color: btn.color }} />
                      {hasBadge && (
                        <span
                          className="absolute -top-1.5 -right-1.5 min-w-[1.125rem] h-[1.125rem] rounded-full text-[0.5rem] font-black flex items-center justify-center px-1 leading-none text-black"
                          style={{ backgroundColor: btn.badgeColor ?? btn.color }}
                        >
                          {(btn.badge ?? 0) > 99 ? '99+' : btn.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm leading-tight truncate">{btn.label}</p>
                      <p className="text-zinc-400 text-[0.625rem] mt-0.5 truncate">{btn.sublabel}</p>
                    </div>
                    {hasBadge ? (
                      <span
                        className="shrink-0 min-w-[1.25rem] h-5 rounded-full text-[0.5rem] font-black flex items-center justify-center px-1.5 leading-none text-black"
                        style={{ backgroundColor: btn.badgeColor ?? btn.color }}
                      >
                        {(btn.badge ?? 0) > 99 ? '99+' : btn.badge}
                      </span>
                    ) : (
                      <ChevronRight size="0.875rem" className="text-zinc-700 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Sem ações */}
        {buttons.length === 0 && !isMaster && !canSeeFinanceiro && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Shield size="1.75rem" className="text-zinc-700" />
            <p className="text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest">
              Nenhuma ação disponível
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
