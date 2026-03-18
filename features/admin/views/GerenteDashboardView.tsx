import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Calendar,
  MapPin,
  Clock,
  Radio,
  RefreshCw,
  AlertCircle,
  Check,
  X,
  MessageSquare,
  DollarSign,
  UserCheck,
  Ticket,
  Users,
  TrendingUp,
  Star,
  Percent,
  Link,
  ChevronDown,
} from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { TYPOGRAPHY } from '../../../constants';
import { OptimizedImage } from '../../../components/OptimizedImage';
import { Notificacao, Comunidade, EventoAdmin, ContaVantaLegacy } from '../../../types';
import { eventosAdminService } from '../services/eventosAdminService';
import { getAcessoComunidades } from '../permissoes';
import { comunidadesService } from '../services/comunidadesService';
import { rbacService } from '../services/rbacService';
import { reviewsService } from '../services/reviewsService';
import { globalToast } from '../../../components/Toast';
import { fmtBRL, tsBR } from '../../../utils';
import { CriarEventoView } from './CriarEventoView';
import { EventoDashboard } from './eventoDashboard';

type Aba = 'FUTUROS' | 'PASSADOS' | 'CANCELADOS';

const fmtData = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
};

const fmtHora = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

// ── Permissões disponíveis ────────────────────────────────────────────────────

const STATUS_BADGES: Record<string, { label: string; cls: string }> = {
  RASCUNHO: { label: 'Rascunho', cls: 'bg-zinc-500/20 text-zinc-400' },
  PENDENTE: { label: 'Aguardando Master', cls: 'bg-cyan-500/20 text-cyan-400' },
  CANCELADO: { label: 'Cancelado', cls: 'bg-zinc-700/60 text-zinc-400' },
};

// Card visual de evento (foto + gradiente + info)
const EventoCard: React.FC<{
  ev: EventoAdmin;
  badge?: 'ao_vivo' | 'encerrado';
  onClick: () => void;
}> = ({ ev, badge, onClick }) => {
  const statusInfo = !ev.publicado && ev.statusEvento ? STATUS_BADGES[ev.statusEvento] : null;
  return (
    <button
      onClick={onClick}
      className="w-full text-left relative rounded-2xl overflow-hidden active:scale-[0.98] transition-all"
    >
      <div className="aspect-[16/6] max-h-[11.25rem] w-full">
        {ev.foto ? (
          <OptimizedImage src={ev.foto} width={500} alt={ev.nome} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
            <Calendar size="1.5rem" className="text-zinc-800" />
          </div>
        )}
      </div>
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.3) 65%, transparent 100%)' }}
      />
      <div className="absolute inset-0 flex flex-col justify-center px-5">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <Clock size="0.5625rem" className="text-[#FFD300]/70" />
          <p className="text-[#FFD300] text-[0.5rem] font-black uppercase tracking-[0.15em]">
            {fmtData(ev.dataInicio)} · {fmtHora(ev.dataInicio)}
          </p>
          {badge === 'ao_vivo' && (
            <span className="text-[0.4375rem] bg-emerald-500/20 text-emerald-400 font-black uppercase tracking-wider px-1.5 py-0.5 rounded flex items-center gap-1">
              <Radio size="0.4375rem" className="animate-pulse" />
              Ao Vivo
            </span>
          )}
          {badge === 'encerrado' && (
            <span className="text-[0.4375rem] bg-zinc-700/60 text-zinc-400 font-black uppercase tracking-wider px-1.5 py-0.5 rounded">
              Encerrado
            </span>
          )}
          {statusInfo && (
            <span
              className={`text-[0.4375rem] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${statusInfo.cls}`}
            >
              {statusInfo.label}
            </span>
          )}
        </div>
        <p className="text-white font-bold text-sm leading-tight truncate">{ev.nome}</p>
        {ev.local && (
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin size="0.5rem" className="text-zinc-400" />
            <p className="text-zinc-400 text-[0.625rem] truncate">{ev.local}</p>
          </div>
        )}
      </div>
    </button>
  );
};

export const GerenteDashboardView: React.FC<{
  onBack: () => void;
  currentUserId?: string;
  addNotification?: (n: Omit<Notificacao, 'id'>) => void;
  comunidadeId?: string;
  adminRole?: ContaVantaLegacy;
}> = ({ onBack, currentUserId = '', addNotification, comunidadeId, adminRole = 'vanta_gerente' }) => {
  const [aba, setAba] = useState<Aba>('FUTUROS');
  const [criandoEvento, setCriandoEvento] = useState<Comunidade | null>(null);
  const [eventoAberto, setEventoAberto] = useState<EventoAdmin | null>(null);
  const [filtroEventoId, setFiltroEventoId] = useState<string | null>(null);
  const [showFiltroDropdown, setShowFiltroDropdown] = useState(false);
  const [respondendoProposta, setRespondendoProposta] = useState<string | null>(null);

  // Polling de versão (reatividade após criar/editar evento)
  const [svcVersion, setSvcVersion] = useState(() => eventosAdminService.getVersion());
  useEffect(() => {
    const id = setInterval(() => setSvcVersion(eventosAdminService.getVersion()), 2_000);
    return () => clearInterval(id);
  }, []);

  // Comunidade atual
  const comunidade = useMemo(() => {
    if (comunidadeId) return comunidadesService.getAll().find(c => c.id === comunidadeId) ?? null;
    const coms = getAcessoComunidades(currentUserId, 'vanta_gerente');
    return coms[0] ?? null;
  }, [currentUserId, comunidadeId]);

  const comunidadeNome = comunidade?.nome ?? 'Comunidade';

  // Equipe da comunidade (atribuições ativas no tenant COMUNIDADE)
  const equipeTotalCount = useMemo(() => {
    if (!comunidade) return 0;
    return rbacService.getAtribuicoesTenant('COMUNIDADE', comunidade.id).length;
  }, [comunidade]);

  // Reviews da comunidade
  const [reviewsCom, setReviewsCom] = useState<{ media: number; count: number }>({ media: 0, count: 0 });
  useEffect(() => {
    if (!comunidade) return;
    let cancelled = false;
    reviewsService.getMediaComunidade(comunidade.id).then(r => {
      if (!cancelled) setReviewsCom(r);
    });
    return () => {
      cancelled = true;
    };
  }, [comunidade]);

  // KPIs agregados (async — receita e check-ins de todos os eventos)
  const [kpisAgg, setKpisAgg] = useState<{
    receitaTotal: number;
    checkinsTotal: number;
    receitaPorDia: { dia: string; valor: number }[];
    porEvento: { eventoId: string; eventoNome: string; receita: number; checkins: number }[];
    loading: boolean;
  }>({ receitaTotal: 0, checkinsTotal: 0, receitaPorDia: [], porEvento: [], loading: true });

  useEffect(() => {
    if (!comunidade) return;
    let cancelled = false;
    const fetchAgg = async () => {
      try {
        const allEvts = eventosAdminService.getEventosByComunidade(comunidade.id);
        const results = await Promise.all(
          allEvts.map(async ev => {
            const [vendas, ci] = await Promise.all([
              eventosAdminService.getVendasLog(ev.id),
              eventosAdminService.getCheckinsIngresso(ev.id),
            ]);
            return { vendas, checkins: ci };
          }),
        );
        if (cancelled) return;
        let receita = 0;
        let checkins = 0;
        const diaMap = new Map<string, number>();
        const porEvento: { eventoId: string; eventoNome: string; receita: number; checkins: number }[] = [];
        for (let i = 0; i < results.length; i++) {
          const r = results[i];
          const ev = allEvts[i];
          let evReceita = 0;
          checkins += r.checkins;
          for (const v of r.vendas) {
            receita += v.valor;
            evReceita += v.valor;
            const d = new Date(v.ts).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            diaMap.set(d, (diaMap.get(d) ?? 0) + v.valor);
          }
          porEvento.push({ eventoId: ev.id, eventoNome: ev.nome, receita: evReceita, checkins: r.checkins });
        }
        // Últimos 30 dias
        const entries = Array.from(diaMap.entries())
          .sort((a, b) => {
            const [da, ma] = a[0].split('/').map(Number);
            const [db, mb] = b[0].split('/').map(Number);
            return ma !== mb ? ma - mb : da - db;
          })
          .slice(-30);
        setKpisAgg({
          receitaTotal: receita,
          checkinsTotal: checkins,
          receitaPorDia: entries.map(([dia, valor]) => ({ dia, valor: Math.round(valor) })),
          porEvento,
          loading: false,
        });
      } catch {
        if (!cancelled) setKpisAgg(prev => ({ ...prev, loading: false }));
      }
    };
    fetchAgg();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comunidade?.id]);

  // KPIs filtrados por evento (quando filtro ativo)
  const kpisFiltrados = useMemo(() => {
    if (!filtroEventoId) return { receita: kpisAgg.receitaTotal, checkins: kpisAgg.checkinsTotal };
    const ev = kpisAgg.porEvento.find(e => e.eventoId === filtroEventoId);
    return { receita: ev?.receita ?? 0, checkins: ev?.checkins ?? 0 };
  }, [kpisAgg, filtroEventoId]);

  const mediaReceitaEvento =
    kpisAgg.porEvento.length > 0 ? kpisAgg.porEvento.reduce((a, e) => a + e.receita, 0) / kpisAgg.porEvento.length : 0;

  const eventoFiltrado = filtroEventoId ? kpisAgg.porEvento.find(e => e.eventoId === filtroEventoId) : null;
  const tendenciaGerente =
    eventoFiltrado && mediaReceitaEvento > 0
      ? eventoFiltrado.receita >= mediaReceitaEvento
        ? 'acima'
        : 'abaixo'
      : null;

  // Eventos separados: ao vivo / futuros / passados / em negociação
  const { aoVivo, futuros, passados, emNegociacao, cancelados } = useMemo(() => {
    const agora = new Date();
    const all = comunidadeId
      ? eventosAdminService.getEventosByComunidade(comunidadeId)
      : getAcessoComunidades(currentUserId, 'vanta_gerente').flatMap(c =>
          eventosAdminService.getEventosByComunidade(c.id),
        );

    const live: EventoAdmin[] = [];
    const fut: EventoAdmin[] = [];
    const pas: EventoAdmin[] = [];
    const negociando: EventoAdmin[] = [];
    const cancelados: EventoAdmin[] = [];
    for (const ev of all) {
      // Eventos cancelados vão pra aba separada
      if (ev.statusEvento === 'CANCELADO') {
        cancelados.push(ev);
        continue;
      }
      // Eventos não-publicados com status de negociação
      if (!ev.publicado && (ev.statusEvento === 'RASCUNHO' || ev.statusEvento === 'PENDENTE')) {
        negociando.push(ev);
        continue;
      }
      const dInicio = new Date(ev.dataInicio);
      const dFim = new Date(ev.dataFim);
      if (dInicio <= agora && dFim > agora) live.push(ev);
      else if (dInicio > agora) fut.push(ev);
      else pas.push(ev);
    }
    live.sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime());
    fut.sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime());
    pas.sort((a, b) => new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime());
    cancelados.sort((a, b) => new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime());
    return { aoVivo: live, futuros: fut, passados: pas, emNegociacao: negociando, cancelados };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, comunidadeId, svcVersion]);

  // Sub-views
  if (criandoEvento) {
    return (
      <CriarEventoView comunidade={criandoEvento} onBack={() => setCriandoEvento(null)} currentUserId={currentUserId} />
    );
  }
  if (eventoAberto) {
    return (
      <EventoDashboard
        eventoId={eventoAberto.id}
        onBack={() => setEventoAberto(null)}
        currentUserId={currentUserId}
        currentUserRole={adminRole}
        onNavigateEvento={id => {
          const ev = eventosAdminService.getEvento(id);
          if (ev) setEventoAberto(ev);
        }}
      />
    );
  }

  const listaAtual = aba === 'FUTUROS' ? futuros : aba === 'CANCELADOS' ? cancelados : passados;

  // Próximo evento
  const proxEvento = futuros[0] ?? aoVivo[0] ?? null;
  const proxEventoLabel = proxEvento
    ? `${new Date(proxEvento.dataInicio).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }).replace('.', '')} · ${new Date(proxEvento.dataInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    : 'Nenhum';

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden w-full max-w-3xl mx-auto">
        {/* Hero da comunidade */}
        <div className="relative shrink-0">
          <div className="h-28 w-full">
            {comunidade?.foto ? (
              <OptimizedImage
                src={comunidade.foto}
                width={80}
                alt={comunidadeNome}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-zinc-900" />
            )}
          </div>
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, #0A0A0A 0%, rgba(10,10,10,0.5) 60%, rgba(10,10,10,0.2) 100%)',
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-4">
            <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-[0.2em] mb-1">
              Painel da Comunidade
            </p>
            <h1 style={TYPOGRAPHY.screenTitle} className="text-xl leading-none text-white truncate">
              {comunidadeNome}
            </h1>
          </div>
        </div>

        {/* Conteúdo rolável */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-6">
          {/* KPIs agregados */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4 -mt-1">
            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <DollarSign size="0.6875rem" className="text-[#FFD300] shrink-0" />
                <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-wider">Receita Total</p>
              </div>
              <p className="text-lg font-bold text-[#FFD300] leading-none truncate">
                {kpisAgg.loading ? '...' : fmtBRL(kpisFiltrados.receita)}
              </p>
            </div>
            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <UserCheck size="0.6875rem" className="text-emerald-400 shrink-0" />
                <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-wider">Check-ins</p>
              </div>
              <p className="text-lg font-bold text-white leading-none">
                {kpisAgg.loading ? '...' : String(kpisFiltrados.checkins)}
              </p>
            </div>
            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <Ticket size="0.6875rem" className="text-purple-400 shrink-0" />
                <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-wider">Próx. Evento</p>
              </div>
              <p className="text-[0.6875rem] font-bold text-white leading-tight truncate">{proxEventoLabel}</p>
            </div>
            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <Users size="0.6875rem" className="text-blue-400 shrink-0" />
                <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-wider">Equipe</p>
              </div>
              <p className="text-lg font-bold text-white leading-none">{equipeTotalCount}</p>
              <p className="text-[0.5rem] text-zinc-400">{aoVivo.length + futuros.length} eventos ativos</p>
            </div>
            {reviewsCom.count > 0 && (
              <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 flex flex-col gap-1 col-span-2 md:col-span-1">
                <div className="flex items-center gap-1.5">
                  <Star size="0.6875rem" className="text-[#FFD300] shrink-0" />
                  <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-wider">Reviews</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold text-[#FFD300] leading-none">{reviewsCom.media.toFixed(1)}</p>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star
                        key={i}
                        size="0.5625rem"
                        className={
                          i <= Math.round(reviewsCom.media) ? 'text-[#FFD300] fill-[#FFD300]' : 'text-zinc-700'
                        }
                      />
                    ))}
                  </div>
                </div>
                <p className="text-[0.5rem] text-zinc-400">{reviewsCom.count} avaliações</p>
              </div>
            )}
          </div>

          {/* Mini-gráfico receita 30d */}
          {!kpisAgg.loading && kpisAgg.receitaPorDia.length > 1 && (
            <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest">
                  Receita Últimos 30 Dias
                </p>
                <div className="flex items-center gap-1">
                  <TrendingUp size="0.625rem" className="text-[#FFD300]" />
                  <p className="text-[0.625rem] text-[#FFD300] font-bold">{fmtBRL(kpisAgg.receitaTotal)}</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={80}>
                <BarChart data={kpisAgg.receitaPorDia}>
                  <XAxis
                    dataKey="dia"
                    tick={{ fill: '#52525b', fontSize: 8 }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#18181b',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      fontSize: 11,
                    }}
                    labelStyle={{ color: '#a1a1aa' }}
                    formatter={(v: number) => [fmtBRL(v), 'Receita']}
                  />
                  <Bar dataKey="valor" fill="#FFD300" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Filtro por evento */}
          {!kpisAgg.loading && kpisAgg.porEvento.length > 1 && (
            <div className="mb-4 relative">
              <button
                onClick={() => setShowFiltroDropdown(!showFiltroDropdown)}
                className="w-full flex items-center justify-between bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
              >
                <span>
                  {filtroEventoId
                    ? kpisAgg.porEvento.find(e => e.eventoId === filtroEventoId)?.eventoNome
                    : 'Todos os eventos'}
                </span>
                <ChevronDown size="0.875rem" className="text-zinc-400" />
              </button>
              {showFiltroDropdown && (
                <div className="absolute left-0 right-0 top-full z-20 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-xl mt-1">
                  <button
                    onClick={() => {
                      setFiltroEventoId(null);
                      setShowFiltroDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-white hover:bg-zinc-800 border-b border-white/5"
                  >
                    Todos os eventos
                  </button>
                  {kpisAgg.porEvento.map(ev => (
                    <button
                      key={ev.eventoId}
                      onClick={() => {
                        setFiltroEventoId(ev.eventoId);
                        setShowFiltroDropdown(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-white hover:bg-zinc-800 border-b border-white/5 last:border-0"
                    >
                      {ev.eventoNome}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tendência (quando evento selecionado) */}
          {tendenciaGerente && (
            <div
              className={`mb-4 px-4 py-3 rounded-xl border ${
                tendenciaGerente === 'acima'
                  ? 'bg-emerald-500/5 border-emerald-500/20'
                  : 'bg-orange-500/5 border-orange-500/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp
                  size="0.875rem"
                  className={tendenciaGerente === 'acima' ? 'text-emerald-400' : 'text-orange-400'}
                />
                <p
                  className={`text-xs font-bold ${tendenciaGerente === 'acima' ? 'text-emerald-400' : 'text-orange-400'}`}
                >
                  {tendenciaGerente === 'acima' ? 'Acima' : 'Abaixo'} da média
                </p>
                <p className="text-[0.625rem] text-zinc-400">
                  ({fmtBRL(eventoFiltrado?.receita ?? 0)} vs média {fmtBRL(mediaReceitaEvento)})
                </p>
              </div>
            </div>
          )}

          {/* Comparativo por evento */}
          {!kpisAgg.loading && kpisAgg.porEvento.length > 1 && !filtroEventoId && (
            <div className="mb-4">
              <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-wider mb-2">
                Comparativo por Evento
              </p>
              <div className="space-y-2">
                {kpisAgg.porEvento.map(ev => {
                  const pct = mediaReceitaEvento > 0 ? (ev.receita / mediaReceitaEvento) * 100 : 0;
                  return (
                    <div key={ev.eventoId} className="bg-zinc-900/50 border border-white/5 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-white font-bold truncate flex-1 min-w-0">{ev.eventoNome}</p>
                        <p className="text-xs text-[#FFD300] font-bold shrink-0 ml-2">{fmtBRL(ev.receita)}</p>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#FFD300] rounded-full transition-all"
                          style={{ width: `${Math.min(pct, 200)}%` }}
                        />
                      </div>
                      <p className="text-[0.5625rem] text-zinc-400 mt-1">{ev.checkins} check-ins</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Botão Criar Novo Evento */}
          <button
            onClick={() => comunidade && setCriandoEvento(comunidade)}
            disabled={!comunidade}
            className="w-full flex items-center justify-between p-4 bg-[#FFD300] rounded-2xl active:scale-[0.97] transition-all disabled:opacity-40 mb-5"
          >
            <div>
              <p className="text-black font-black text-sm uppercase tracking-wider leading-none">Criar Novo Evento</p>
              <p className="text-black/50 text-[0.625rem] font-bold mt-1">{comunidadeNome}</p>
            </div>
            <div className="w-10 h-10 bg-black/10 rounded-xl flex items-center justify-center shrink-0">
              <Plus size="1.125rem" className="text-black" />
            </div>
          </button>
          {/* Seção Ao Vivo (só aparece se houver eventos acontecendo) */}
          {aoVivo.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[0.5625rem] font-black uppercase tracking-[0.2em] text-emerald-400">
                  Acontecendo Agora ({aoVivo.length})
                </p>
              </div>
              <div className="space-y-3">
                {aoVivo.map(ev => (
                  <EventoCard key={ev.id} ev={ev} badge="ao_vivo" onClick={() => setEventoAberto(ev)} />
                ))}
              </div>
            </div>
          )}

          {/* Seção Em Negociação (convites pendentes/recusados) */}
          {emNegociacao.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size="0.75rem" className="text-amber-400" />
                <p className="text-[0.5625rem] font-black uppercase tracking-[0.2em] text-amber-400">
                  Em Negociação ({emNegociacao.length})
                </p>
              </div>
              <div className="space-y-3">
                {emNegociacao.map(ev => (
                  <div key={ev.id} className="rounded-2xl border border-white/5 bg-zinc-900/40 overflow-hidden">
                    <EventoCard ev={ev} onClick={() => setEventoAberto(ev)} />
                    {/* Mensagem do sócio (contra-proposta) */}
                    {ev.mensagemNegociacao && ev.statusEvento === 'PENDENTE' && (
                      <div className="px-4 py-3 border-t border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare size="0.625rem" className="text-cyan-400" />
                          <p className="text-[0.5rem] text-cyan-400 font-black uppercase tracking-widest">
                            Msg do Sócio
                          </p>
                        </div>
                        <p className="text-zinc-400 text-[0.625rem] leading-relaxed italic">
                          "{ev.mensagemNegociacao}"
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Propostas VANTA pendentes (eventos SEM VENDA) */}
          {(() => {
            const propostasVanta = emNegociacao.filter(
              ev => ev.vendaVanta === false && ev.propostaStatus === 'ENVIADA',
            );
            if (propostasVanta.length === 0) return null;
            return (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Percent size="0.75rem" className="text-[#FFD300]" />
                  <p className="text-[0.5625rem] font-black uppercase tracking-[0.2em] text-[#FFD300]">
                    Propostas VANTA ({propostasVanta.length})
                  </p>
                </div>
                <div className="space-y-3">
                  {propostasVanta.map(ev => (
                    <div
                      key={`pv-${ev.id}`}
                      className="rounded-2xl border border-[#FFD300]/15 bg-zinc-900/40 overflow-hidden"
                    >
                      <EventoCard ev={ev} onClick={() => setEventoAberto(ev)} />
                      <div className="px-4 py-3 border-t border-white/5 space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Link size="0.625rem" className="text-[#FFD300]" />
                          <p className="text-[0.5rem] text-[#FFD300] font-black uppercase tracking-widest">
                            Proposta de Parceria
                          </p>
                          {ev.propostaRodada && (
                            <span className="text-[0.4375rem] text-zinc-400 font-bold">
                              Rodada {ev.propostaRodada}/3
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-zinc-950/50 rounded-lg px-2.5 py-1.5">
                            <p className="text-[0.4375rem] text-zinc-400 font-black uppercase tracking-widest">
                              Comissão
                            </p>
                            <p className="text-[#FFD300] text-sm font-bold">{ev.comissaoVanta ?? 0}%</p>
                          </div>
                          <div className="bg-zinc-950/50 rounded-lg px-2.5 py-1.5">
                            <p className="text-[0.4375rem] text-zinc-400 font-black uppercase tracking-widest">
                              Cód. Afiliado
                            </p>
                            <p className="text-white text-xs font-bold truncate">{ev.codigoAfiliado ?? '—'}</p>
                          </div>
                        </div>
                        {ev.propostaMensagem && (
                          <p className="text-zinc-400 text-[0.625rem] leading-relaxed italic">
                            "{ev.propostaMensagem}"
                          </p>
                        )}
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={async () => {
                              setRespondendoProposta(ev.id);
                              const result = await eventosAdminService.recusarPropostaVanta(ev.id, currentUserId);
                              setRespondendoProposta(null);
                              if (result.ok && result.definitivo && addNotification) {
                                addNotification({
                                  titulo: 'Proposta recusada',
                                  mensagem: `Evento "${ev.nome}" publicado sem acordo VANTA.`,
                                  tipo: 'SISTEMA',
                                  link: ev.id,
                                  lida: false,
                                  timestamp: tsBR(),
                                });
                              }
                            }}
                            disabled={respondendoProposta === ev.id}
                            className="flex-1 py-2.5 bg-zinc-900 border border-red-500/20 text-red-400 font-bold text-[0.5625rem] uppercase tracking-widest rounded-xl flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all disabled:opacity-40"
                          >
                            <X size="0.75rem" /> Recusar
                          </button>
                          <button
                            onClick={async () => {
                              setRespondendoProposta(ev.id);
                              const ok = await eventosAdminService.aceitarPropostaVanta(ev.id, currentUserId);
                              setRespondendoProposta(null);
                              if (ok && addNotification) {
                                addNotification({
                                  titulo: 'Proposta aceita!',
                                  mensagem: `"${ev.nome}" aprovado com parceria VANTA.`,
                                  tipo: 'EVENTO_APROVADO',
                                  link: ev.id,
                                  lida: false,
                                  timestamp: tsBR(),
                                });
                              }
                            }}
                            disabled={respondendoProposta === ev.id}
                            className="flex-1 py-2.5 bg-[#FFD300] text-black font-bold text-[0.5625rem] uppercase tracking-widest rounded-xl flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all disabled:opacity-40"
                          >
                            {respondendoProposta === ev.id ? (
                              <RefreshCw size="0.75rem" className="animate-spin" />
                            ) : (
                              <Check size="0.75rem" />
                            )}
                            Aceitar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Abas Futuros / Passados / Cancelados */}
          <div className="flex gap-1 mb-4">
            {(['FUTUROS', 'PASSADOS', 'CANCELADOS'] as Aba[]).map(tab => (
              <button
                key={tab}
                onClick={() => setAba(tab)}
                className={`flex-1 py-2.5 rounded-xl text-[0.5625rem] font-black uppercase tracking-wider transition-all border ${
                  aba === tab
                    ? 'bg-[#FFD300]/10 border-[#FFD300]/30 text-[#FFD300]'
                    : 'bg-zinc-900/40 border-white/5 text-zinc-400 active:border-white/20'
                }`}
              >
                {tab === 'FUTUROS'
                  ? `Futuros (${futuros.length})`
                  : tab === 'CANCELADOS'
                    ? `Cancelados (${cancelados.length})`
                    : `Passados (${passados.length})`}
              </button>
            ))}
          </div>

          {/* Lista de eventos da aba selecionada */}
          {listaAtual.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Calendar size="1.75rem" className="text-zinc-800" />
              <p className="text-zinc-400 text-xs font-semibold">
                {aba === 'FUTUROS'
                  ? 'Nenhum evento futuro'
                  : aba === 'CANCELADOS'
                    ? 'Nenhum evento cancelado'
                    : 'Nenhum evento passado'}
              </p>
              <p className="text-zinc-700 text-[0.625rem] font-black uppercase tracking-widest">
                {aba === 'FUTUROS'
                  ? 'Crie seu primeiro evento acima'
                  : aba === 'CANCELADOS'
                    ? 'Eventos cancelados aparecem aqui'
                    : 'Eventos encerrados aparecem aqui'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {listaAtual.map(ev => (
                <EventoCard
                  key={ev.id}
                  ev={ev}
                  badge={aba === 'PASSADOS' ? 'encerrado' : aba === 'CANCELADOS' ? 'cancelado' : undefined}
                  onClick={() => setEventoAberto(ev)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
