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
  type LucideIcon,
} from 'lucide-react';
import { eventosAdminService } from '../services/eventosAdminService';
import { TYPOGRAPHY } from '../../../constants';
import { fmtBRL } from '../../../utils';
import { comunidadesService } from '../services/comunidadesService';
import { assinaturaService } from '../services/assinaturaService';
import { VantaPieChart } from './VantaPieChart';
import { getResumoFinanceiroGlobal, getResumoFinanceiroComunidade } from '../services/eventosAdminFinanceiro';
import type { ResumoFinanceiro } from '../services/eventosAdminFinanceiro';
import { ResumoFinanceiroCard } from './ResumoFinanceiroCard';
import {
  dashboardAnalyticsService,
  type Periodo,
  type DashboardMetrics,
  getPeriodoLabel,
} from '../services/dashboardAnalyticsService';
import type { ContaVantaLegacy } from '../../../types';
import { KpiCard, KpiPieCard, KpiDeltaCard, PERIODOS } from './KpiCards';
import type { AdminSubView } from './AdminSidebar';
import { OnboardingChecklist } from './OnboardingChecklist';
import { OnboardingWelcome } from './OnboardingWelcome';

// ── Lookup nome do tenant (usando imports já carregados no topo) ──────────────
export const getTenantLabel = (tenantTipo?: 'COMUNIDADE' | 'EVENTO', tenantId?: string): string | null => {
  if (!tenantTipo || !tenantId) return null;
  if (tenantTipo === 'EVENTO') {
    const ev = eventosAdminService.getEvento(tenantId);
    return ev ? ev.nome : null;
  }
  if (tenantTipo === 'COMUNIDADE') {
    const c = comunidadesService.get(tenantId);
    return c ? c.nome : null;
  }
  return null;
};

interface DashButton {
  id: AdminSubView;
  label: string;
  sublabel: string;
  icon: LucideIcon;
  color: string;
  badge?: number;
  badgeColor?: string;
}

export const AdminDashboardHome: React.FC<{
  adminNome: string;
  adminRole: ContaVantaLegacy;
  tenantNome: string | null;
  tenantArtigo: string | null;
  pendencias: {
    curadoria: number;
    pendentes: number;
    saques: number;
    passaportesMV: number;
    solicitacoesMV: number;
    dividaSocial: number;
    reembolsos: number;
  };
  onNavigate: (v: AdminSubView) => void;
  comunidadeId?: string;
}> = ({ adminNome, adminRole, tenantNome, tenantArtigo, pendencias, onNavigate, comunidadeId }) => {
  const isMaster = adminRole === 'vanta_masteradm';
  const isSocio = adminRole === 'vanta_socio';
  const isGerente = adminRole === 'vanta_gerente';
  const isInCommunity = Boolean(comunidadeId);

  // Onboarding pós-aprovação
  const comunidade = comunidadeId ? comunidadesService.get(comunidadeId) : undefined;
  const needsOnboarding = comunidade && comunidade.onboarding_completo === false && isGerente;
  const welcomeKey = comunidadeId ? `onboarding_visto_${comunidadeId}` : '';
  const [showWelcome, setShowWelcome] = useState(() => needsOnboarding && !localStorage.getItem(welcomeKey));

  // Resumo financeiro (global para master, por comunidade se dentro de uma)
  const [resumoFin, setResumoFin] = useState<ResumoFinanceiro | null>(null);
  const [resumoLoading, setResumoLoading] = useState(false);

  useEffect(() => {
    if (!isMaster && !isGerente && !isSocio) return;
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
  }, [comunidadeId, isMaster, isGerente, isSocio]);

  // KPIs de comunidade (quando dentro de uma)
  const communityKpis = useMemo(() => {
    if (!comunidadeId) return null;
    const eventos = eventosAdminService.getEventosByComunidade(comunidadeId);
    const totalIngressos = eventos.flatMap(e => e.lotes.flatMap(l => l.variacoes)).reduce((s, v) => s + v.vendidos, 0);
    const faturamento = eventos
      .flatMap(e => e.lotes.flatMap(l => l.variacoes))
      .reduce((s, v) => s + v.vendidos * v.valor, 0);
    return { eventos: eventos.length, totalIngressos, faturamento };
  }, [comunidadeId]);

  // Pizza faturamento por evento (comunidade)
  const communityPieData = useMemo(() => {
    if (!comunidadeId || !(isMaster || isGerente || isSocio)) return null;
    const PIE_COLORS = ['#a78bfa', '#10b981', '#3b82f6', '#f59e0b', '#f472b6', '#FFD300', '#ef4444', '#6366f1'];
    const eventos = eventosAdminService.getEventosByComunidade(comunidadeId);
    const slices = eventos
      .map((e, i) => ({
        name: e.nome,
        value: e.lotes.flatMap(l => l.variacoes).reduce((s, v) => s + v.vendidos * v.valor, 0),
        color: PIE_COLORS[i % PIE_COLORS.length],
      }))
      .filter(s => s.value > 0);
    return slices.length > 0 ? slices : null;
  }, [comunidadeId, isMaster, isGerente, isSocio]);

  // KPIs estáticos (totais absolutos — visão global master)
  const kpis = useMemo(() => {
    if (!isMaster || isInCommunity) return null;
    const todasComunidades = comunidadesService.getAll().length;
    const comunidadesAtivas = comunidadesService.getAtivas().length;
    const todosEventos = eventosAdminService.getEventos();
    const eventosPublicados = todosEventos.filter(e => e.publicado).length;
    return { comunidades: todasComunidades, comunidadesAtivas, eventos: todosEventos.length, eventosPublicados };
  }, [isMaster, isInCommunity]);

  // Pizza faturamento por comunidade (visão global master)
  const globalPieData = useMemo(() => {
    if (!isMaster || isInCommunity) return null;
    const PIE_COLORS = ['#a78bfa', '#10b981', '#3b82f6', '#f59e0b', '#f472b6', '#FFD300', '#ef4444', '#6366f1'];
    const coms = comunidadesService.getAll();
    const slices = coms
      .map(c => {
        const evts = eventosAdminService.getEventosByComunidade(c.id);
        const fat = evts.flatMap(e => e.lotes.flatMap(l => l.variacoes)).reduce((s, v) => s + v.vendidos * v.valor, 0);
        return { name: c.nome, value: fat };
      })
      .filter(s => s.value > 0)
      .sort((a, b) => b.value - a.value);
    const TOP = 5;
    const top = slices.slice(0, TOP).map((s, i) => ({ ...s, color: PIE_COLORS[i] }));
    const restTotal = slices.slice(TOP).reduce((s, c) => s + c.value, 0);
    if (restTotal > 0) top.push({ name: 'Outros', value: restTotal, color: '#52525b' });
    return top.length > 0 ? top : null;
  }, [isMaster, isInCommunity]);

  // ── KPIs master com filtros temporais + delta ──────────────────────────────
  const [periodo, setPeriodo] = useState<Periodo>('MES');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [visaoGeralAberta, setVisaoGeralAberta] = useState(false);

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

  const isPromoter = adminRole === 'vanta_promoter';
  const isPortaria =
    adminRole === 'vanta_ger_portaria_lista' ||
    adminRole === 'vanta_portaria_lista' ||
    adminRole === 'vanta_ger_portaria_antecipado' ||
    adminRole === 'vanta_portaria_antecipado';
  const isCaixa = adminRole === 'vanta_caixa';

  const buttons = useMemo((): DashButton[] => {
    const list: DashButton[] = [];
    // Dentro de comunidade: botões contextuais filtrados por role
    if (isInCommunity) {
      // Eventos: gestão (master, gerente, sócio)
      if (isMaster || isGerente || isSocio)
        list.push({
          id: 'MEUS_EVENTOS',
          label: 'Eventos',
          sublabel: 'Gerenciar eventos da comunidade',
          icon: Calendar,
          color: '#a78bfa',
        });
      // Listas: quem gere listas (master, gerente, sócio, promoter)
      if (isMaster || isGerente || isSocio || isPromoter)
        list.push({
          id: 'LISTAS',
          label: 'Listas',
          sublabel: isPromoter ? 'Suas cotas de convidados' : 'Convidados e cotas',
          icon: ListChecks,
          color: '#60a5fa',
        });
      // Financeiro: quem vê financeiro (master, produtor, sócio)
      if (isMaster || isGerente || isSocio)
        list.push({
          id: 'FINANCEIRO',
          label: 'Financeiro',
          sublabel: 'Receita e saques',
          icon: Banknote,
          color: '#10b981',
        });
      // Caixa: quem opera caixa
      if (isCaixa)
        list.push({
          id: 'CAIXA',
          label: 'Caixa',
          sublabel: 'Venda de ingressos na porta',
          icon: ShoppingCart,
          color: '#f59e0b',
        });
      // Portaria antecipado: scanner QR
      if (adminRole === 'vanta_ger_portaria_antecipado' || adminRole === 'vanta_portaria_antecipado')
        list.push({
          id: 'PORTARIA_QR',
          label: 'Scanner QR',
          sublabel: 'Validação de ingressos',
          icon: Shield,
          color: '#22d3ee',
        });
      // Portaria lista: check-in lista
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
    // Visão global master
    if (isMaster) {
      if (pendencias.pendentes > 0)
        list.push({
          id: 'PENDENTES',
          label: 'Eventos Pendentes',
          sublabel: `${pendencias.pendentes} aguardando aprovação`,
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
        sublabel: 'Cargos e permissões da equipe',
        icon: ShieldPlus,
        color: '#f472b6',
      });
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMaster, isSocio, isGerente, isPromoter, isPortaria, isCaixa, pendencias, isInCommunity]);

  const roleLabel = isMaster
    ? 'Master Admin'
    : isSocio
      ? 'Sócio'
      : isGerente
        ? 'Gerente'
        : isGerente
          ? 'Gerente'
          : isPromoter
            ? 'Promoter'
            : isPortaria
              ? 'Portaria'
              : isCaixa
                ? 'Caixa'
                : 'Operacional';

  return (
    <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col overflow-hidden">
      {/* Header contextual */}
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-8 pb-5 shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#FFD300] animate-pulse" />
          <p className="text-[#FFD300]/60 text-[0.5625rem] font-black uppercase tracking-[0.25em]">
            {roleLabel} · Painel Administrativo
          </p>
        </div>
        <h1 style={TYPOGRAPHY.screenTitle} className="text-xl italic leading-none text-white">
          Bem-vindo, {adminNome}
        </h1>
        {tenantNome && (
          <p className="text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest mt-1.5">
            Você está em: <span className="text-zinc-300">{tenantNome}</span>
          </p>
        )}
        {isMaster && !tenantNome && (
          <p className="text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest mt-1.5">
            Visão global da plataforma
          </p>
        )}
      </div>

      {showWelcome && comunidade && (
        <OnboardingWelcome
          comunidadeNome={comunidade.nome}
          onClose={() => {
            localStorage.setItem(welcomeKey, '1');
            setShowWelcome(false);
          }}
        />
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-5 max-w-3xl mx-auto w-full">
        {needsOnboarding && comunidade && (
          <OnboardingChecklist
            comunidade={comunidade}
            onNavigate={onNavigate}
            onEditarComunidade={() => onNavigate('COMUNIDADE_DASHBOARD' as AdminSubView)}
          />
        )}

        {/* KPIs — contexto de comunidade (só para gestão: master, gerente, sócio) */}
        {isInCommunity && communityKpis && (isMaster || isGerente || isSocio) && (
          <div>
            <p className="text-zinc-700 text-[0.5625rem] font-black uppercase tracking-[0.2em] mb-2.5">
              Visão da Comunidade
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <KpiCard
                label="Eventos"
                value={communityKpis.eventos}
                color="#a78bfa"
                icon={Calendar}
                onClick={() => onNavigate('MEUS_EVENTOS')}
              />
              <KpiCard label="Ingressos" value={communityKpis.totalIngressos} color="#60a5fa" icon={Users} />
              <KpiCard
                label="Faturamento"
                value={communityKpis.faturamento}
                color="#10b981"
                icon={Banknote}
                formatValue={fmtBRL}
                onClick={() => onNavigate('FINANCEIRO')}
              />
            </div>
          </div>
        )}

        {/* Banner MAIS VANTA — comunidade */}
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

        {/* Pizza faturamento por evento — comunidade */}
        {isInCommunity && communityPieData && (
          <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
            <p className="text-zinc-700 text-[0.5625rem] font-black uppercase tracking-[0.2em]">
              Faturamento por Evento
            </p>
            <VantaPieChart
              data={communityPieData}
              formatValue={v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              height={150}
            />
          </div>
        )}

        {/* KPIs estáticos — totais absolutos (visão global master) */}
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
              <KpiPieCard
                label="Curadoria Pendente"
                value={pendencias.curadoria}
                total={pendencias.curadoria + 1}
                color="#f59e0b"
                onClick={pendencias.curadoria > 0 ? () => onNavigate('CURADORIA_MV') : undefined}
              />
              <KpiPieCard
                label="Eventos Pendentes"
                value={pendencias.pendentes}
                total={pendencias.pendentes + kpis.eventosPublicados}
                color="#ef4444"
                onClick={pendencias.pendentes > 0 ? () => onNavigate('PENDENTES') : undefined}
              />
            </div>
          </div>
        )}

        {/* Pizza faturamento por comunidade — visão global master */}
        {isMaster && globalPieData && !isInCommunity && (
          <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
            <p className="text-zinc-700 text-[0.5625rem] font-black uppercase tracking-[0.2em]">
              Faturamento por Comunidade
            </p>
            <VantaPieChart
              data={globalPieData}
              formatValue={v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              height={150}
            />
          </div>
        )}

        {/* Resumo Financeiro — visível para master/gerente/sócio */}
        {(isMaster || isGerente || isSocio) && (resumoFin || resumoLoading) && (
          <ResumoFinanceiroCard
            resumo={resumoFin!}
            loading={resumoLoading}
            titulo={isInCommunity ? 'Financeiro da Comunidade' : 'Financeiro Global'}
          />
        )}

        {/* KPIs — visão global master com filtros temporais (colapsável) */}
        {isMaster && !isInCommunity && (
          <div>
            <button
              onClick={() => setVisaoGeralAberta(v => !v)}
              className="w-full flex items-center justify-between mb-2.5 active:opacity-70 transition-opacity"
            >
              <p className="text-zinc-700 text-[0.5625rem] font-black uppercase tracking-[0.2em]">Visão Geral</p>
              <span className="text-[0.5625rem] font-bold text-[#FFD300]/60 uppercase tracking-wider">
                {visaoGeralAberta ? 'Fechar' : 'Ver'}
              </span>
            </button>
            {visaoGeralAberta && (
              <>
                <div className="flex items-center justify-between mb-2">
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
                  <p className="text-zinc-700 text-[0.5625rem] font-medium italic">{getPeriodoLabel(periodo)}</p>
                </div>
                {metricsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size="1.25rem" className="text-[#FFD300] animate-spin" />
                  </div>
                ) : metrics ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <KpiDeltaCard label="Comunidades" metric={metrics.comunidades} color="#60a5fa" icon={Building2} />
                    <KpiDeltaCard label="Eventos" metric={metrics.eventos} color="#a78bfa" icon={Calendar} />
                    <KpiDeltaCard label="Membros Novos" metric={metrics.membrosNovos} color="#22d3ee" icon={Users} />
                    <KpiDeltaCard
                      label="Curados"
                      metric={metrics.membrosCurados}
                      color="#f59e0b"
                      icon={Star}
                      onClick={pendencias.curadoria > 0 ? () => onNavigate('CURADORIA_MV') : undefined}
                    />
                    <KpiDeltaCard label="Vendas" metric={metrics.vendaConvites} color="#a78bfa" icon={ShoppingCart} />
                    <KpiDeltaCard
                      label="Lucro VANTA"
                      metric={metrics.lucroVanta}
                      color="#10b981"
                      icon={Banknote}
                      formatValue={fmtBRL}
                      onClick={() => onNavigate('FINANCEIRO_MASTER')}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div
                        key={i}
                        className="bg-zinc-900/60 border border-white/5 rounded-2xl p-3 h-20 animate-pulse"
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* KPI Assinaturas MAIS VANTA — visão global master */}
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

        {/* Pendências — tudo que requer ação do master */}
        {isMaster &&
          !isInCommunity &&
          (() => {
            const totalPendencias =
              pendencias.pendentes +
              pendencias.saques +
              pendencias.curadoria +
              pendencias.passaportesMV +
              pendencias.solicitacoesMV +
              pendencias.dividaSocial +
              pendencias.reembolsos;
            if (totalPendencias === 0) return null;
            const items: {
              icon: LucideIcon;
              label: string;
              count: number;
              color: string;
              bg: string;
              border: string;
              nav: AdminSubView;
            }[] = [
              pendencias.solicitacoesMV > 0
                ? {
                    icon: UserPlus,
                    label: `${pendencias.solicitacoesMV} solicitaç${pendencias.solicitacoesMV > 1 ? 'ões' : 'ão'} MAIS VANTA`,
                    count: pendencias.solicitacoesMV,
                    color: 'text-[#FFD300]',
                    bg: 'bg-[#FFD300]/5',
                    border: 'border-[#FFD300]/15',
                    nav: 'MAIS_VANTA_HUB' as AdminSubView,
                  }
                : null!,
              pendencias.passaportesMV > 0
                ? {
                    icon: Compass,
                    label: `${pendencias.passaportesMV} passaporte${pendencias.passaportesMV > 1 ? 's' : ''} aguardando aprovação`,
                    count: pendencias.passaportesMV,
                    color: 'text-[#FFD300]',
                    bg: 'bg-[#FFD300]/5',
                    border: 'border-[#FFD300]/15',
                    nav: 'PASSAPORTES_MV' as AdminSubView,
                  }
                : null!,
              pendencias.pendentes > 0
                ? {
                    icon: ClipboardList,
                    label: `${pendencias.pendentes} evento${pendencias.pendentes > 1 ? 's' : ''} aguardando aprovação`,
                    count: pendencias.pendentes,
                    color: 'text-amber-500',
                    bg: 'bg-amber-500/5',
                    border: 'border-amber-500/15',
                    nav: 'PENDENTES' as AdminSubView,
                  }
                : null!,
              pendencias.saques > 0
                ? {
                    icon: Banknote,
                    label: `${pendencias.saques} saque${pendencias.saques > 1 ? 's' : ''} pendente${pendencias.saques > 1 ? 's' : ''}`,
                    count: pendencias.saques,
                    color: 'text-red-400',
                    bg: 'bg-red-500/5',
                    border: 'border-red-500/15',
                    nav: 'FINANCEIRO_MASTER' as AdminSubView,
                  }
                : null!,
              pendencias.reembolsos > 0
                ? {
                    icon: RotateCcw,
                    label: `${pendencias.reembolsos} reembolso${pendencias.reembolsos > 1 ? 's' : ''} aguardando aprovação`,
                    count: pendencias.reembolsos,
                    color: 'text-orange-400',
                    bg: 'bg-orange-500/5',
                    border: 'border-orange-500/15',
                    nav: 'FINANCEIRO_MASTER' as AdminSubView,
                  }
                : null!,
              pendencias.curadoria > 0
                ? {
                    icon: Star,
                    label: `${pendencias.curadoria} solicitaç${pendencias.curadoria > 1 ? 'ões' : 'ão'} MAIS VANTA`,
                    count: pendencias.curadoria,
                    color: 'text-purple-400',
                    bg: 'bg-purple-500/5',
                    border: 'border-purple-500/15',
                    nav: 'CURADORIA_MV' as AdminSubView,
                  }
                : null!,
              pendencias.dividaSocial > 0
                ? {
                    icon: Gift,
                    label: `${pendencias.dividaSocial} membro${pendencias.dividaSocial > 1 ? 's' : ''} com dívida social`,
                    count: pendencias.dividaSocial,
                    color: 'text-amber-400',
                    bg: 'bg-amber-500/5',
                    border: 'border-amber-500/15',
                    nav: 'DIVIDA_SOCIAL_MV' as AdminSubView,
                  }
                : null!,
            ].filter(Boolean);
            return (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-zinc-700 text-[0.5625rem] font-black uppercase tracking-[0.2em]">Pendências</p>
                  <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[0.5625rem] font-black">
                    {totalPendencias}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {items.map((item, i) => (
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
            );
          })()}

        {/* Ações rápidas */}
        {buttons.length > 0 && (
          <div>
            <p className="text-zinc-700 text-[0.5625rem] font-black uppercase tracking-[0.2em] mb-2.5">Ações rápidas</p>
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
                    {hasBadge && (
                      <span
                        className="shrink-0 min-w-[1.25rem] h-5 rounded-full text-[0.5rem] font-black flex items-center justify-center px-1.5 leading-none text-black"
                        style={{ backgroundColor: btn.badgeColor ?? btn.color }}
                      >
                        {(btn.badge ?? 0) > 99 ? '99+' : btn.badge}
                      </span>
                    )}
                    {!hasBadge && <ChevronRight size="0.875rem" className="text-zinc-700 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {buttons.length === 0 && !isMaster && (
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
