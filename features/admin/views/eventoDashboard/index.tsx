import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Users,
  Pencil,
  BarChart2,
  List,
  TrendingUp,
  Gift,
  Settings2,
  UserCheck,
  Tag,
  PieChart,
  Copy,
  Ticket,
  DollarSign,
  Activity,
  Loader2,
  ShoppingBag,
  Zap,
  LayoutGrid,
  Star,
  AlertTriangle,
  Cake,
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { TYPOGRAPHY } from '../../../../constants';
import { OptimizedImage } from '../../../../components/OptimizedImage';
import { ContaVantaLegacy } from '../../../../types';
import { eventosAdminService } from '../../services/eventosAdminService';
import { supabase } from '../../../../services/supabaseClient';
import { listasService } from '../../services/listasService';
import { cortesiasService } from '../../services/cortesiasService';
import {
  getContractedFees,
  getGatewayCostByEvento,
  getResumoFinanceiroEvento,
} from '../../services/eventosAdminFinanceiro';
import type { ResumoFinanceiro } from '../../services/eventosAdminFinanceiro';
import { ResumoFinanceiroCard } from '../../components/ResumoFinanceiroCard';
import { VantaPieChart } from '../../components/VantaPieChart';
import { EditarEventoView } from '../EditarEventoView';
import { EventDetailManagement } from '../eventManagement/EventDetailManagement';
import { ParticipantesView } from '../ParticipantesView';
import { isSocioEvento } from '../../permissoes';
import type { Tab } from '../eventManagement/types';
import type { VendaLog } from '../../services/eventosAdminTypes';
import { fmtBRL } from '../../../../utils';
import {
  fmtData,
  fmtHora,
  agruparPorDia,
  agruparPorOrigem,
  agruparPorVariacao,
  agruparAcumulado,
  calcPicoVendas,
  contarPorCanal,
} from './eventoDashboardUtils';
import { DuplicarModal } from './DuplicarModal';
import { AnalyticsSubView } from './AnalyticsSubView';
import { CuponsSubView } from './CuponsSubView';
import { RelatorioEventoView } from '../relatorios';
import { PedidosSubView } from './PedidosSubView';
import { EditarLotesSubView } from './EditarLotesSubView';
import { EditarListaSubView } from './EditarListaSubView';
import { ComemoracaoConfigSubView } from './ComemoracaoConfigSubView';
import { SerieChips } from './SerieChips';
import { PreEventoView } from './PreEventoView';
import { OperacaoView } from './OperacaoView';
import { PosEventoView } from './PosEventoView';
import { getEventAnalytics } from '../../services/analytics';
import type { EventAnalytics } from '../../services/analytics/types';
import { reviewsService } from '../../services/reviewsService';
import type { ReviewEvento } from '../../../../types';

type SubView =
  | 'DASHBOARD'
  | 'EDITAR'
  | 'GESTAO'
  | 'CUPONS'
  | 'PARTICIPANTES'
  | 'DUPLICAR'
  | 'ANALYTICS'
  | 'RELATORIO'
  | 'PEDIDOS'
  | 'EDITAR_LOTES'
  | 'EDITAR_LISTA'
  | 'COMEMORACAO_CONFIG';

export const EventoDashboard: React.FC<{
  eventoId: string;
  onBack: () => void;
  currentUserId: string;
  currentUserRole: ContaVantaLegacy;
  adminNome?: string;
  onNavigateEvento?: (eventoId: string) => void;
}> = ({ eventoId, onBack, currentUserId, currentUserRole, adminNome = '', onNavigateEvento }) => {
  const [subView, setSubView] = useState<SubView>('DASHBOARD');
  const [gestaoTab, setGestaoTab] = useState<Tab>('LOTACAO');

  const [svcVersion, setSvcVersion] = useState(() => eventosAdminService.getVersion());
  useEffect(() => {
    const id = setInterval(() => setSvcVersion(eventosAdminService.getVersion()), 2_000);
    return () => clearInterval(id);
  }, []);

  const evento = useMemo(
    () => eventosAdminService.getEvento(eventoId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [eventoId, svcVersion],
  );

  const listaId = useMemo(() => {
    const diretas = listasService.getListasByEvento(eventoId);
    if (diretas.length > 0) return diretas[0].id;
    const listas = listasService.getListas();
    for (const l of listas) {
      const eaId = cortesiasService.getEventoAdminId(l.id);
      if (eaId === eventoId) return l.id;
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventoId, svcVersion]);

  const status = useMemo(() => {
    if (!evento) return 'desconhecido';
    if (evento.statusEvento === 'CANCELADO') return 'cancelado';
    if (evento.statusEvento === 'FINALIZADO') return 'encerrado';
    const agora = new Date();
    const dInicio = new Date(evento.dataInicio);
    const dFim = new Date(evento.dataFim);
    if (dInicio <= agora && dFim > agora) return 'ao_vivo';
    if (dInicio > agora) return 'futuro';
    return 'encerrado';
  }, [evento]);

  const [showCancelarModal, setShowCancelarModal] = useState(false);
  const [showEncerrarModal, setShowEncerrarModal] = useState(false);
  const [cancelMotivo, setCancelMotivo] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const eventoAtivo = status !== 'cancelado' && status !== 'encerrado';

  // ── Event Analytics (para views temporais) ──────────────────────────────────
  const [eventAnalytics, setEventAnalytics] = useState<EventAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setAnalyticsLoading(true);
    getEventAnalytics(eventoId)
      .then(data => {
        if (!cancelled) {
          setEventAnalytics(data);
          setAnalyticsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setAnalyticsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [eventoId]);

  // ── Dados reais (async) ──────────────────────────────────────────────────────
  const [vendasLog, setVendasLog] = useState<VendaLog[]>([]);
  const [checkinsIngresso, setCheckinsIngresso] = useState(0);
  const [gwCost, setGwCost] = useState<{ totalCusto: number; totalVendas: number }>({ totalCusto: 0, totalVendas: 0 });
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchData = () => {
      Promise.all([
        eventosAdminService.getVendasLog(eventoId),
        eventosAdminService.getCheckinsIngresso(eventoId),
        getGatewayCostByEvento(eventoId),
      ])
        .then(([vl, ci, gw]) => {
          if (cancelled) return;
          const listas = listasService.getListasByEvento(eventoId);
          const ciLista = listas.reduce((sum, l) => sum + l.convidados.filter(c => c.checkedIn).length, 0);
          setVendasLog(vl);
          setCheckinsIngresso(ci);
          setGwCost(gw);
          setDataLoading(false);
        })
        .catch(err => {
          console.error('[EventoDash] ERRO:', err);
          setDataLoading(false);
        });
    };
    setDataLoading(true);
    fetchData();
    // Re-fetch a cada 30s para dados ao vivo
    const tid = setInterval(fetchData, 30_000);
    return () => {
      cancelled = true;
      clearInterval(tid);
    };
  }, [eventoId]);

  // ── Reviews (async — apenas para eventos encerrados) ──────────────────────
  const [reviews, setReviews] = useState<ReviewEvento[]>([]);
  const [reviewsMedia, setReviewsMedia] = useState<{ media: number; count: number }>({ media: 0, count: 0 });

  useEffect(() => {
    if (status !== 'encerrado') return;
    let cancelled = false;
    Promise.all([reviewsService.getByEvento(eventoId), reviewsService.getMediaEvento(eventoId)])
      .then(([revs, media]) => {
        if (cancelled) return;
        setReviews(revs.slice(0, 10)); // top 10 mais recentes
        setReviewsMedia(media);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [eventoId, status]);

  // ── Resumo Financeiro completo ────────────────────────────────────────────
  const [resumoFin, setResumoFin] = useState<ResumoFinanceiro | null>(null);
  const [resumoLoading, setResumoLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setResumoLoading(true);
    getResumoFinanceiroEvento(eventoId)
      .then(r => {
        if (!cancelled) {
          setResumoFin(r);
          setResumoLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setResumoLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [eventoId]);

  // Check-ins de lista (sync — cache local)
  const checkinsLista = useMemo(() => {
    const listas = listasService.getListasByEvento(eventoId);
    return listas.reduce((sum, l) => sum + l.convidados.filter(c => c.checkedIn).length, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventoId, svcVersion]);

  // ── KPIs calculados ────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const totalVendidos = vendasLog.length;
    const receitaBruta = vendasLog.reduce((s, v) => s + v.valor, 0);
    const fees = getContractedFees(eventoId);
    const receitaLiquida =
      fees.gatewayMode === 'ABSORVER' ? Math.round((receitaBruta - gwCost.totalCusto) * 100) / 100 : receitaBruta;
    const ticketMedio = totalVendidos > 0 ? Math.round((receitaBruta / totalVendidos) * 100) / 100 : 0;
    const totalCheckins = checkinsIngresso + checkinsLista;
    const cortesias = evento?.cortesiasEnviadas ?? 0;
    const capacidade = evento?.lotes.flatMap(l => l.variacoes).reduce((s, v) => s + v.limite, 0) ?? 0;
    const ocupacao = capacidade > 0 ? Math.round((totalCheckins / capacidade) * 100) : 0;
    return { totalVendidos, receitaBruta, receitaLiquida, ticketMedio, totalCheckins, cortesias, capacidade, ocupacao };
  }, [vendasLog, checkinsIngresso, checkinsLista, gwCost, eventoId, evento]);

  // ── Alertas ao vivo ────────────────────────────────────────────────────────
  const alertasAoVivo = useMemo(() => {
    if (status !== 'ao_vivo') return [];
    const alertas: { id: string; msg: string; severity: 'warn' | 'critical' }[] = [];
    if (kpis.ocupacao >= 95) {
      alertas.push({ id: 'lotacao-95', msg: `Lotação em ${kpis.ocupacao}% — quase esgotado!`, severity: 'critical' });
    } else if (kpis.ocupacao >= 80) {
      alertas.push({ id: 'lotacao-80', msg: `Lotação em ${kpis.ocupacao}% — atenção!`, severity: 'warn' });
    }
    // Lotes esgotados
    for (const lote of evento?.lotes ?? []) {
      for (const v of lote.variacoes) {
        if (v.limite > 0 && v.vendidos >= v.limite) {
          alertas.push({
            id: `esgotado-${v.id}`,
            msg: `${lote.nome} — ${v.area ?? 'Variação'} esgotado`,
            severity: 'warn',
          });
        }
      }
    }
    return alertas;
  }, [status, kpis.ocupacao, evento?.lotes]);

  // ── Push alerta lotação (uma vez por threshold) ────────────────────────────
  const [alertaPushEnviado, setAlertaPushEnviado] = useState<Set<number>>(new Set());
  useEffect(() => {
    if (status !== 'ao_vivo' || !evento) return;
    const thresholds = [80, 95];
    for (const t of thresholds) {
      if (kpis.ocupacao >= t && !alertaPushEnviado.has(t)) {
        setAlertaPushEnviado(prev => new Set(prev).add(t));
        // Enviar push ao dono do evento (gerente/sócio) via send-push Edge Function
        const donos = [evento.criadorId].filter(Boolean);
        if (donos.length > 0) {
          supabase.functions
            .invoke('send-push', {
              body: {
                userIds: donos,
                title: t >= 95 ? '🔴 Lotação crítica!' : '⚠️ Lotação alta',
                body: `${evento.nome} está em ${kpis.ocupacao}% de ocupação.`,
                data: { eventoId: evento.id, tipo: 'ALERTA_LOTACAO' },
              },
            })
            .catch(() => {});
        }
      }
    }
  }, [status, kpis.ocupacao, evento, alertaPushEnviado]);

  // ── Dados dos gráficos ──────────────────────────────────────────────────────
  const chartVendasDia = useMemo(() => agruparPorDia(vendasLog), [vendasLog]);
  const chartOrigem = useMemo(() => agruparPorOrigem(vendasLog), [vendasLog]);
  const chartVariacao = useMemo(() => agruparPorVariacao(vendasLog), [vendasLog]);
  const chartAcumulado = useMemo(() => agruparAcumulado(vendasLog), [vendasLog]);
  const picoVendas = useMemo(() => calcPicoVendas(vendasLog), [vendasLog]);
  const vendasCanal = useMemo(() => contarPorCanal(vendasLog), [vendasLog]);

  // ── Status dos módulos (visibilidade dinâmica) ────────────────────────────
  const moduleStatus = useMemo(() => {
    const temLista = listaId !== null;
    const temCortesias = !!cortesiasService.getCortesiaConfig(eventoId);
    const temMesas = evento?.mesasAtivo === true;
    const temLotes = (evento?.lotes.length ?? 0) > 0;
    return {
      PEDIDOS: true,
      CUPONS: true,
      EQUIPE: true,
      PARTICIPANTES: true,
      CAIXA: true,
      RELATORIO: true,
      ANALYTICS: true,
      CARGOS_PERM: true,
      LOTACAO: temLotes,
      LISTA: temLista,
      CORTESIAS: temCortesias,
      MESAS: temMesas,
    } as Record<string, boolean>;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listaId, eventoId, evento, svcVersion]);

  // ── SubViews ──────────────────────────────────────────────────────────────
  if (subView === 'EDITAR') {
    return (
      <EditarEventoView eventoId={eventoId} onBack={() => setSubView('DASHBOARD')} currentUserId={currentUserId} />
    );
  }

  if (subView === 'CUPONS') {
    return <CuponsSubView eventoId={eventoId} currentUserId={currentUserId} onBack={() => setSubView('DASHBOARD')} />;
  }

  if (subView === 'PARTICIPANTES') {
    return (
      <ParticipantesView eventoId={eventoId} eventoNome={evento?.nome ?? ''} onBack={() => setSubView('DASHBOARD')} />
    );
  }

  if (subView === 'ANALYTICS') {
    return <AnalyticsSubView eventoId={eventoId} onBack={() => setSubView('DASHBOARD')} />;
  }

  if (subView === 'PEDIDOS') {
    return (
      <PedidosSubView eventoId={eventoId} eventoNome={evento?.nome ?? ''} onBack={() => setSubView('DASHBOARD')} />
    );
  }

  if (subView === 'RELATORIO' && evento) {
    const roleRelatorio =
      currentUserRole === 'vanta_gerente' || currentUserRole === 'vanta_masteradm' || currentUserRole === 'vanta_socio'
        ? ('gerente' as const)
        : currentUserRole === 'vanta_promoter'
          ? ('promoter' as const)
          : currentUserRole === 'vanta_ger_portaria_lista' || currentUserRole === 'vanta_portaria_lista'
            ? ('portaria_lista' as const)
            : ('portaria_antecipado' as const);
    return (
      <RelatorioEventoView
        evento={evento}
        role={roleRelatorio}
        currentUserId={currentUserId}
        onBack={() => setSubView('DASHBOARD')}
      />
    );
  }

  if (subView === 'EDITAR_LOTES') {
    return (
      <EditarLotesSubView eventoId={eventoId} onBack={() => setSubView('DASHBOARD')} currentUserId={currentUserId} />
    );
  }

  if (subView === 'EDITAR_LISTA') {
    return <EditarListaSubView eventoId={eventoId} onBack={() => setSubView('DASHBOARD')} />;
  }

  if (subView === 'COMEMORACAO_CONFIG') {
    return <ComemoracaoConfigSubView eventoId={eventoId} onBack={() => setSubView('DASHBOARD')} />;
  }

  if (subView === 'GESTAO') {
    return (
      <EventDetailManagement
        listaId={listaId}
        eventoId={eventoId}
        onBack={() => setSubView('DASHBOARD')}
        defaultTab={gestaoTab}
        isSocio={isSocioEvento(eventoId, currentUserId, currentUserRole)}
        adminNome={adminNome}
        currentUserId={currentUserId}
        currentUserNome={adminNome}
        currentUserRole={currentUserRole}
      />
    );
  }

  if (!evento) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8">
        <p className="text-zinc-400 text-xs">Evento não encontrado</p>
        <button onClick={onBack} className="text-zinc-400 text-xs underline">
          Voltar
        </button>
      </div>
    );
  }

  const openTab = (tab: Tab) => {
    setGestaoTab(tab);
    setSubView('GESTAO');
  };

  /** Abre wizard inline para ativar/editar a feature inativa */
  const ativarFeature = (key: string) => {
    switch (key) {
      case 'LOTACAO':
        setSubView('EDITAR_LOTES');
        break;
      case 'LISTA':
        setSubView('EDITAR_LISTA');
        break;
      case 'CORTESIAS':
        setSubView('EDITAR_LOTES'); // cortesias vivem junto aos lotes
        break;
      case 'MESAS':
        setSubView('EDITAR'); // mesas ainda usa editar geral
        break;
      default:
        setSubView('EDITAR');
    }
  };

  const statusLabel = status === 'ao_vivo' ? 'Ao Vivo' : status === 'futuro' ? 'Programado' : 'Encerrado';
  const statusColor =
    status === 'ao_vivo'
      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
      : status === 'futuro'
        ? 'bg-[#FFD300]/10 text-[#FFD300] border-[#FFD300]/20'
        : 'bg-zinc-800/60 text-zinc-400 border-white/5';

  // ── KPI card helper ──────────────────────────────────────────────────────
  const KpiCard = ({
    label,
    value,
    icon: Icon,
    accent,
    badges,
    progress,
  }: {
    label: string;
    value: string;
    icon: React.FC<{ size?: number; className?: string }>;
    accent?: boolean;
    badges?: { label: string; value: number; color: string }[];
    progress?: { current: number; max: number };
  }) => (
    <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 flex flex-col gap-1.5 min-w-0">
      <div className="flex items-center gap-1.5">
        <Icon size="0.75rem" className={`shrink-0 ${accent ? 'text-[#FFD300]' : 'text-zinc-400'}`} />
        <p className="text-[0.5625rem] text-zinc-400 font-bold uppercase tracking-wider truncate">{label}</p>
      </div>
      <p className={`text-xl font-bold leading-none truncate ${accent ? 'text-[#FFD300]' : 'text-white'}`}>{value}</p>
      {badges && badges.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-0.5">
          {badges.map(b => (
            <span
              key={b.label}
              className="text-[0.4375rem] font-bold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: `${b.color}20`, color: b.color }}
            >
              {b.label} {b.value}
            </span>
          ))}
        </div>
      )}
      {progress && progress.max > 0 && (
        <div className="mt-0.5">
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FFD300] rounded-full transition-all"
              style={{ width: `${Math.min(Math.round((progress.current / progress.max) * 100), 100)}%` }}
            />
          </div>
          <p className="text-[0.4375rem] text-zinc-400 mt-0.5">
            {progress.current}/{progress.max}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative shrink-0">
        <div className="aspect-[16/7] max-h-[15rem] w-full">
          {evento.foto ? (
            <OptimizedImage src={evento.foto} width={500} alt={evento.nome} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
              <Calendar size="2rem" className="text-zinc-800" />
            </div>
          )}
        </div>
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, #0A0A0A 0%, rgba(10,10,10,0.4) 50%, rgba(10,10,10,0.15) 100%)',
          }}
        />

        <button
          aria-label="Voltar"
          onClick={onBack}
          className="absolute top-4 left-4 w-9 h-9 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
        >
          <ArrowLeft size="1rem" className="text-white" />
        </button>

        <div className="absolute top-4 right-4">
          <span
            className={`text-[0.5rem] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusColor}`}
          >
            {status === 'ao_vivo' && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1 align-middle" />
            )}
            {statusLabel}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-6 pb-5">
          <h1 style={TYPOGRAPHY.screenTitle} className="text-xl italic leading-tight text-white mb-2 line-clamp-2">
            {evento.nome}
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1">
              <Clock size="0.625rem" className="text-[#FFD300]/70" />
              <span className="text-zinc-400 text-[0.625rem] font-semibold">
                {fmtData(evento.dataInicio)} · {fmtHora(evento.dataInicio)}
              </span>
            </div>
            {evento.local && (
              <div className="flex items-center gap-1">
                <MapPin size="0.625rem" className="text-zinc-400" />
                <span className="text-zinc-400 text-[0.625rem] truncate max-w-[9.375rem]">{evento.local}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Série Recorrente ─────────────────────────────────────────────── */}
      {evento && (
        <div className="shrink-0 px-6 pt-2 max-w-3xl mx-auto w-full">
          <SerieChips
            eventoId={eventoId}
            eventoOrigemId={evento.eventoOrigemId}
            recorrencia={evento.recorrencia}
            onSelectOcorrencia={id => onNavigateEvento?.(id)}
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-6 max-w-3xl mx-auto w-full">
        {/* ── 6 KPIs ──────────────────────────────────────────────────────── */}
        {dataLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 size="1.25rem" className="text-zinc-400 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-5 -mt-1">
            <KpiCard
              label="Vendidos"
              value={String(kpis.totalVendidos)}
              icon={Ticket}
              badges={[
                { label: 'Ant', value: vendasCanal.antecipado, color: '#FFD300' },
                { label: 'Porta', value: vendasCanal.porta, color: '#60a5fa' },
                ...(vendasCanal.cortesia > 0 ? [{ label: 'Cort', value: vendasCanal.cortesia, color: '#f472b6' }] : []),
              ]}
              progress={{ current: kpis.totalVendidos, max: kpis.capacidade }}
            />
            <KpiCard
              label="Check-ins"
              value={String(kpis.totalCheckins)}
              icon={UserCheck}
              accent={status === 'ao_vivo'}
            />
            <KpiCard label="Receita" value={fmtBRL(kpis.receitaBruta)} icon={DollarSign} accent />
            <KpiCard label="Líquida" value={fmtBRL(kpis.receitaLiquida)} icon={TrendingUp} />
            <KpiCard
              label="Ticket Méd"
              value={kpis.ticketMedio > 0 ? fmtBRL(kpis.ticketMedio) : '—'}
              icon={BarChart2}
            />
            <KpiCard label="Cortesias" value={String(kpis.cortesias)} icon={Gift} />
          </div>
        )}

        {/* ── Resumo Financeiro completo ──────────────────────────────── */}
        {(resumoFin || resumoLoading) && (
          <div className="mb-5">
            <ResumoFinanceiroCard resumo={resumoFin!} loading={resumoLoading} titulo="Financeiro do Evento" />
          </div>
        )}

        {/* ── Barra de ocupação ──────────────────────────────────────────── */}
        {!dataLoading && kpis.capacidade > 0 && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest">Ocupação</p>
              <p className="text-[0.625rem] text-zinc-400 font-semibold">{kpis.ocupacao}%</p>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${kpis.ocupacao > 80 ? 'bg-red-500' : kpis.ocupacao > 50 ? 'bg-amber-400' : 'bg-[#FFD300]'}`}
                style={{ width: `${Math.min(kpis.ocupacao, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* ── Alertas ao vivo ─────────────────────────────────────────── */}
        {alertasAoVivo.length > 0 && (
          <div className="space-y-2 mb-5">
            {alertasAoVivo.map(a => (
              <div
                key={a.id}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border ${
                  a.severity === 'critical'
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                }`}
              >
                <AlertTriangle size="0.875rem" className="shrink-0" />
                <p className="text-[0.6875rem] font-bold leading-tight">{a.msg}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Gráficos ───────────────────────────────────────────────────── */}
        {!dataLoading && vendasLog.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
            {/* Vendas por Dia */}
            {chartVendasDia.length > 1 && (
              <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4">
                <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-3">Vendas por Dia</p>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={chartVendasDia}>
                    <XAxis dataKey="dia" tick={{ fill: '#52525b', fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        background: '#18181b',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 8,
                        fontSize: 11,
                      }}
                      labelStyle={{ color: '#a1a1aa' }}
                      itemStyle={{ color: '#FFD300' }}
                    />
                    <Bar dataKey="vendas" fill="#FFD300" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Origem dos Ingressos */}
            {chartOrigem.length > 0 && (
              <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4">
                <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-3">Origem</p>
                <VantaPieChart data={chartOrigem} height={140} />
              </div>
            )}

            {/* Vendas por Variação */}
            {chartVariacao.length > 0 && (
              <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4">
                <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-3">Por Variação</p>
                <div className="space-y-2">
                  {chartVariacao.map(v => (
                    <div key={v.label}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[0.625rem] text-zinc-400 font-semibold truncate">{v.label}</span>
                        <span className="text-[0.625rem] text-zinc-400 font-bold shrink-0 ml-2">{v.qtd}</span>
                      </div>
                      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-[#FFD300] rounded-full" style={{ width: `${v.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vendas Acumuladas (linha) */}
            {chartAcumulado.length > 1 && (
              <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4">
                <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-3">
                  Vendas Acumuladas
                </p>
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart data={chartAcumulado}>
                    <XAxis dataKey="dia" tick={{ fill: '#52525b', fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        background: '#18181b',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 8,
                        fontSize: 11,
                      }}
                      labelStyle={{ color: '#a1a1aa' }}
                      itemStyle={{ color: '#34d399' }}
                    />
                    <Line type="monotone" dataKey="acumulado" stroke="#34d399" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Check-in ao Vivo + Pico de Vendas */}
            <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest">Check-in</p>
                {status === 'ao_vivo' && (
                  <span className="flex items-center gap-1 text-[0.4375rem] font-black uppercase text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Ao Vivo
                  </span>
                )}
              </div>
              <div className="flex items-end gap-4">
                <div>
                  <p className="text-3xl font-bold text-white leading-none">{kpis.totalCheckins}</p>
                  <p className="text-[0.5625rem] text-zinc-400 mt-1">presentes</p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[0.5625rem] text-zinc-400 font-semibold">Ocupação</span>
                    <span className="text-[0.5625rem] text-zinc-400 font-bold">{kpis.ocupacao}%</span>
                  </div>
                  <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${kpis.ocupacao > 80 ? 'bg-red-500' : kpis.ocupacao > 50 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                      style={{ width: `${Math.min(kpis.ocupacao, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
              {picoVendas && (
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
                  <Zap size="0.75rem" className="text-amber-400 shrink-0" />
                  <p className="text-[0.5625rem] text-zinc-400">
                    Pico: <span className="text-white font-bold">{picoVendas.hora}</span> — {picoVendas.quantidade}{' '}
                    vendas
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Editar Evento — atalhos rápidos ────────────────────────────── */}
        <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-3">Editar Evento</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
          <button
            onClick={() => setSubView('EDITAR')}
            className="flex items-center gap-2.5 p-3 bg-zinc-900/50 border border-white/5 rounded-xl active:bg-white/5 transition-all"
          >
            <Pencil size="0.8125rem" className="text-[#FFD300] shrink-0" />
            <span className="text-xs font-bold text-white truncate">Geral</span>
          </button>
          <button
            onClick={() => setSubView('EDITAR_LOTES')}
            className="flex items-center gap-2.5 p-3 bg-zinc-900/50 border border-white/5 rounded-xl active:bg-white/5 transition-all"
          >
            <Ticket size="0.8125rem" className="text-[#60a5fa] shrink-0" />
            <span className="text-xs font-bold text-white truncate">Lotes</span>
          </button>
          <button
            onClick={() => setSubView('EDITAR_LISTA')}
            className="flex items-center gap-2.5 p-3 bg-zinc-900/50 border border-white/5 rounded-xl active:bg-white/5 transition-all"
          >
            <List size="0.8125rem" className="text-[#a78bfa] shrink-0" />
            <span className="text-xs font-bold text-white truncate">Lista</span>
          </button>
          <button
            onClick={() => setSubView('DUPLICAR')}
            className="flex items-center gap-2.5 p-3 bg-zinc-900/50 border border-white/5 rounded-xl active:bg-white/5 transition-all"
          >
            <Copy size="0.8125rem" className="text-purple-400 shrink-0" />
            <span className="text-xs font-bold text-white truncate">Duplicar</span>
          </button>
          <button
            onClick={() => setSubView('COMEMORACAO_CONFIG')}
            className="flex items-center gap-2.5 p-3 bg-zinc-900/50 border border-white/5 rounded-xl active:bg-white/5 transition-all"
          >
            <Cake size="0.8125rem" className="text-pink-400 shrink-0" />
            <span className="text-xs font-bold text-white truncate">Comemoração</span>
          </button>
        </div>

        {/* ── Módulos — Vendas e Ingressos ────────────────────────────── */}
        <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-3">Vendas e Ingressos</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mb-5">
          {(
            [
              {
                key: 'PEDIDOS',
                label: 'Pedidos',
                sub: 'Lista de vendas',
                icon: ShoppingBag,
                color: '#f59e0b',
                action: () => setSubView('PEDIDOS'),
              },
              {
                key: 'LOTACAO',
                label: 'Lotação',
                sub: 'Lotes e variações',
                icon: BarChart2,
                color: '#60a5fa',
                action: () => openTab('LOTACAO' as Tab),
              },
              {
                key: 'CUPONS',
                label: 'Cupons',
                sub: 'Códigos promo',
                icon: Tag,
                color: '#10b981',
                action: () => setSubView('CUPONS'),
              },
            ] as const
          ).map(m => {
            const ativo = moduleStatus[m.key] !== false;
            return (
              <button
                key={m.key}
                onClick={() => (ativo ? m.action() : ativarFeature(m.key))}
                className="relative flex flex-col p-4 bg-zinc-900/40 border border-white/5 rounded-xl active:bg-white/5 transition-all text-left"
              >
                {!ativo && (
                  <span className="absolute top-2 right-2 text-[0.4375rem] font-black text-[#FFD300] bg-[#FFD300]/10 border border-[#FFD300]/20 rounded px-1.5 py-0.5 uppercase tracking-wider">
                    Ativar
                  </span>
                )}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${!ativo ? 'opacity-30' : ''}`}
                  style={{ backgroundColor: `${m.color}15`, border: `1px solid ${m.color}30` }}
                >
                  <m.icon size="0.875rem" style={{ color: m.color }} />
                </div>
                <p className={`text-xs font-bold leading-tight mb-0.5 ${ativo ? 'text-white' : 'text-zinc-400'}`}>
                  {m.label}
                </p>
                <p className="text-zinc-400 text-[0.5625rem] font-medium">{m.sub}</p>
              </button>
            );
          })}
        </div>

        {/* ── Módulos — Operacional ──────────────────────────────────── */}
        <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-3">Operacional</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mb-5">
          {(
            [
              {
                key: 'LISTA',
                label: 'Lista',
                sub: 'Convidados',
                icon: List,
                color: '#34d399',
                action: () => openTab('LISTA' as Tab),
              },
              {
                key: 'EQUIPE',
                label: 'Equipe',
                sub: 'Staff do evento',
                icon: Users,
                color: '#a78bfa',
                action: () => openTab('EQUIPE' as Tab),
              },
              {
                key: 'CORTESIAS',
                label: 'Cortesias',
                sub: 'Ingressos grátis',
                icon: Gift,
                color: '#f472b6',
                action: () => openTab('CORTESIAS' as Tab),
              },
              {
                key: 'PARTICIPANTES',
                label: 'Participantes',
                sub: 'Lista e exportar',
                icon: UserCheck,
                color: '#06b6d4',
                action: () => setSubView('PARTICIPANTES'),
              },
              {
                key: 'MESAS',
                label: 'Mesas',
                sub: 'Camarotes',
                icon: LayoutGrid,
                color: '#fb923c',
                action: () => openTab('MESAS' as Tab),
              },
            ] as const
          ).map(m => {
            const ativo = moduleStatus[m.key] !== false;
            return (
              <button
                key={m.key}
                onClick={() => (ativo ? m.action() : ativarFeature(m.key))}
                className="relative flex flex-col p-4 bg-zinc-900/40 border border-white/5 rounded-xl active:bg-white/5 transition-all text-left"
              >
                {!ativo && (
                  <span className="absolute top-2 right-2 text-[0.4375rem] font-black text-[#FFD300] bg-[#FFD300]/10 border border-[#FFD300]/20 rounded px-1.5 py-0.5 uppercase tracking-wider">
                    Ativar
                  </span>
                )}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${!ativo ? 'opacity-30' : ''}`}
                  style={{ backgroundColor: `${m.color}15`, border: `1px solid ${m.color}30` }}
                >
                  <m.icon size="0.875rem" style={{ color: m.color }} />
                </div>
                <p className={`text-xs font-bold leading-tight mb-0.5 ${ativo ? 'text-white' : 'text-zinc-400'}`}>
                  {m.label}
                </p>
                <p className="text-zinc-400 text-[0.5625rem] font-medium">{m.sub}</p>
              </button>
            );
          })}
        </div>

        {/* ── Módulos — Financeiro ───────────────────────────────────── */}
        <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-3">Financeiro</p>
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          {(
            [
              {
                key: 'CAIXA',
                label: 'Caixa',
                sub: 'Vendas e receita',
                icon: TrendingUp,
                color: '#FFD300',
                action: () => openTab('RESUMO' as Tab),
              },
              {
                key: 'RELATORIO',
                label: 'Relatório',
                sub: 'Detalhado',
                icon: BarChart2,
                color: '#FFD300',
                action: () => setSubView('RELATORIO'),
              },
            ] as const
          ).map(m => {
            const ativo = moduleStatus[m.key] !== false;
            return (
              <button
                key={m.key}
                onClick={() => (ativo ? m.action() : ativarFeature(m.key))}
                className="relative flex flex-col p-4 bg-zinc-900/40 border border-white/5 rounded-xl active:bg-white/5 transition-all text-left"
              >
                {!ativo && (
                  <span className="absolute top-2 right-2 text-[0.4375rem] font-black text-[#FFD300] bg-[#FFD300]/10 border border-[#FFD300]/20 rounded px-1.5 py-0.5 uppercase tracking-wider">
                    Ativar
                  </span>
                )}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${!ativo ? 'opacity-30' : ''}`}
                  style={{ backgroundColor: `${m.color}15`, border: `1px solid ${m.color}30` }}
                >
                  <m.icon size="0.875rem" style={{ color: m.color }} />
                </div>
                <p className={`text-xs font-bold leading-tight mb-0.5 ${ativo ? 'text-white' : 'text-zinc-400'}`}>
                  {m.label}
                </p>
                <p className="text-zinc-400 text-[0.5625rem] font-medium">{m.sub}</p>
              </button>
            );
          })}
        </div>

        {/* ── Módulos — Analytics ────────────────────────────────────── */}
        <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-3">Analytics</p>
        <div className="grid grid-cols-2 gap-2.5">
          {(
            [
              {
                key: 'ANALYTICS',
                label: 'Analytics',
                sub: 'Perfil do público',
                icon: PieChart,
                color: '#8b5cf6',
                action: () => setSubView('ANALYTICS'),
              },
              {
                key: 'CARGOS_PERM',
                label: 'Funções',
                sub: 'Cargos e permissões',
                icon: Settings2,
                color: '#fb923c',
                action: () => openTab('CARGOS_PERM' as Tab),
              },
            ] as const
          ).map(m => {
            const ativo = moduleStatus[m.key] !== false;
            return (
              <button
                key={m.key}
                onClick={() => (ativo ? m.action() : ativarFeature(m.key))}
                className="relative flex flex-col p-4 bg-zinc-900/40 border border-white/5 rounded-xl active:bg-white/5 transition-all text-left"
              >
                {!ativo && (
                  <span className="absolute top-2 right-2 text-[0.4375rem] font-black text-[#FFD300] bg-[#FFD300]/10 border border-[#FFD300]/20 rounded px-1.5 py-0.5 uppercase tracking-wider">
                    Ativar
                  </span>
                )}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${!ativo ? 'opacity-30' : ''}`}
                  style={{ backgroundColor: `${m.color}15`, border: `1px solid ${m.color}30` }}
                >
                  <m.icon size="0.875rem" style={{ color: m.color }} />
                </div>
                <p className={`text-xs font-bold leading-tight mb-0.5 ${ativo ? 'text-white' : 'text-zinc-400'}`}>
                  {m.label}
                </p>
                <p className="text-zinc-400 text-[0.5625rem] font-medium">{m.sub}</p>
              </button>
            );
          })}
        </div>

        {/* ── Reviews (só para eventos encerrados) ───────────────── */}
        {status === 'encerrado' && reviewsMedia.count > 0 && (
          <div className="mt-5">
            <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-3">Reviews do Público</p>
            <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4 mb-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star
                      key={i}
                      size="1rem"
                      className={
                        i <= Math.round(reviewsMedia.media) ? 'text-[#FFD300] fill-[#FFD300]' : 'text-zinc-700'
                      }
                    />
                  ))}
                </div>
                <p className="text-white font-bold text-lg leading-none">{reviewsMedia.media.toFixed(1)}</p>
                <p className="text-zinc-400 text-[0.625rem] font-semibold">({reviewsMedia.count} avaliações)</p>
              </div>
            </div>
            {reviews.length > 0 && (
              <div className="space-y-2">
                {reviews.map(r => (
                  <div key={r.id} className="bg-zinc-900/30 border border-white/5 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star
                            key={i}
                            size="0.625rem"
                            className={i <= r.rating ? 'text-[#FFD300] fill-[#FFD300]' : 'text-zinc-700'}
                          />
                        ))}
                      </div>
                      <p className="text-zinc-400 text-[0.5625rem]">
                        {new Date(r.criadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                    {r.comentario && (
                      <p className="text-zinc-400 text-[0.6875rem] leading-relaxed line-clamp-3">{r.comentario}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Inteligência Temporal ─────────────────────────────── */}
        {evento && (
          <div className="mt-5">
            {status === 'futuro' && (
              <PreEventoView evento={evento} analytics={eventAnalytics} loading={analyticsLoading} />
            )}
            {status === 'ao_vivo' && (
              <OperacaoView evento={evento} analytics={eventAnalytics} loading={analyticsLoading} />
            )}
            {status === 'encerrado' && (
              <PosEventoView evento={evento} analytics={eventAnalytics} loading={analyticsLoading} />
            )}
          </div>
        )}

        {evento.descricao && (
          <div className="mt-5 bg-zinc-900/40 border border-white/5 rounded-xl p-4">
            <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-2">Descrição</p>
            <p className="text-zinc-400 text-xs leading-relaxed line-clamp-4">{evento.descricao}</p>
          </div>
        )}

        {/* Badge status cancelado/finalizado */}
        {status === 'cancelado' && (
          <div className="mt-5 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
            <p className="text-red-400 font-black text-xs uppercase tracking-widest">Evento Cancelado</p>
          </div>
        )}

        {/* Gerenciar Evento */}
        {eventoAtivo && (
          <div className="mt-5 bg-zinc-900/40 border border-white/5 rounded-xl p-4 space-y-3">
            <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest">Gerenciar Evento</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEncerrarModal(true)}
                className="flex-1 min-h-[2.75rem] bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-[0.625rem] font-bold uppercase tracking-wider active:scale-95 transition-all"
              >
                Encerrar Evento
              </button>
              <button
                onClick={() => setShowCancelarModal(true)}
                className="flex-1 min-h-[2.75rem] bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[0.625rem] font-bold uppercase tracking-wider active:scale-95 transition-all"
              >
                Cancelar Evento
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Encerrar Evento */}
      {showEncerrarModal && (
        <div
          className="absolute inset-0 z-50 flex items-end justify-center bg-black/85"
          onClick={() => setShowEncerrarModal(false)}
        >
          <div
            className="w-full bg-zinc-900 rounded-t-3xl p-6 space-y-4"
            style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 1.5rem))' }}
            onClick={e => e.stopPropagation()}
          >
            <p className="text-white font-bold text-sm text-center">Encerrar este evento?</p>
            <p className="text-zinc-400 text-xs text-center">
              O evento será marcado como finalizado. Não será mais possível vender ingressos.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEncerrarModal(false)}
                className="flex-1 min-h-[2.75rem] bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold"
              >
                Voltar
              </button>
              <button
                disabled={actionLoading}
                onClick={async () => {
                  setActionLoading(true);
                  await eventosAdminService.encerrarEvento(eventoId, currentUserId, adminNome);
                  setActionLoading(false);
                  setShowEncerrarModal(false);
                }}
                className="flex-1 min-h-[2.75rem] bg-amber-500 text-black rounded-xl text-xs font-bold disabled:opacity-50"
              >
                {actionLoading ? 'Encerrando...' : 'Confirmar Encerramento'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cancelar Evento */}
      {showCancelarModal && (
        <div
          className="absolute inset-0 z-50 flex items-end justify-center bg-black/85"
          onClick={() => {
            setShowCancelarModal(false);
            setCancelMotivo('');
          }}
        >
          <div
            className="w-full bg-zinc-900 rounded-t-3xl p-6 space-y-4"
            style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 1.5rem))' }}
            onClick={e => e.stopPropagation()}
          >
            <p className="text-white font-bold text-sm text-center">Cancelar este evento?</p>
            <p className="text-red-400 text-xs text-center">
              Compradores serão notificados. Esta ação não pode ser desfeita.
            </p>
            <input
              type="text"
              value={cancelMotivo}
              onChange={e => setCancelMotivo(e.target.value)}
              placeholder="Motivo do cancelamento (obrigatório)"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-500 outline-none focus:border-red-500/50"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelarModal(false);
                  setCancelMotivo('');
                }}
                className="flex-1 min-h-[2.75rem] bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold"
              >
                Voltar
              </button>
              <button
                disabled={actionLoading || !cancelMotivo.trim()}
                onClick={async () => {
                  setActionLoading(true);
                  await eventosAdminService.solicitarCancelamento(
                    eventoId,
                    cancelMotivo.trim(),
                    currentUserId,
                    adminNome,
                  );
                  setActionLoading(false);
                  setShowCancelarModal(false);
                  setCancelMotivo('');
                }}
                className="flex-1 min-h-[2.75rem] bg-red-500 text-white rounded-xl text-xs font-bold disabled:opacity-50"
              >
                {actionLoading ? 'Cancelando...' : 'Confirmar Cancelamento'}
              </button>
            </div>
          </div>
        </div>
      )}

      {subView === 'DUPLICAR' && (
        <DuplicarModal
          evento={evento}
          onClose={() => setSubView('DASHBOARD')}
          onSuccess={() => setSubView('DASHBOARD')}
        />
      )}
    </div>
  );
};
