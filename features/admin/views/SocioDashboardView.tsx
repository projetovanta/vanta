import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  Ticket,
  TrendingUp,
  ChevronDown,
  ArrowRight,
  ClipboardList,
  UserCheck,
  Percent,
  MapPin,
  Calendar,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { useAuthStore } from '../../../stores/authStore';
import { eventosAdminService } from '../services/eventosAdminService';
import { getVendasLog, getCheckinsIngresso } from '../services/eventosAdminTickets';
import { listasService } from '../services/listasService';
import { fmtBRL } from '../../../utils';
import { formatRelativeTime } from '../../../src/utils/formatDate';
import type { AccessNode, EventoAdmin } from '../../../types';

interface SocioDashProps {
  onBack: () => void;
  currentUserId: string;
  onNavigate: (view: string) => void;
}

interface EventoMetrica {
  eventoId: string;
  eventoNome: string;
  eventoLocal: string;
  eventoDataInicio: string;
  eventoStatus: string;
  eventoFoto: string;
  receitaBruta: number;
  vendidos: number;
  checkins: number;
  capacidade: number;
  convidadosLista: number;
  splitIndividual: number;
  splitConsolidado: number;
}

export const SocioDashboardView: React.FC<SocioDashProps> = ({ onBack, currentUserId, onNavigate }) => {
  const accessNodes = useAuthStore(s => s.accessNodes);
  const [metricas, setMetricas] = useState<EventoMetrica[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEventoId, setFiltroEventoId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const socioNodes = useMemo(
    () => accessNodes.filter((n: AccessNode) => n.portalRole === 'vanta_socio'),
    [accessNodes],
  );

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const results: EventoMetrica[] = [];
      const allEventos = eventosAdminService.getEventos();

      for (const node of socioNodes) {
        if (node.tipo !== 'EVENTO') continue;
        try {
          const [vendas, checkins] = await Promise.all([
            getVendasLog(node.contextId),
            getCheckinsIngresso(node.contextId),
          ]);
          const evento: EventoAdmin | undefined = allEventos.find(e => e.id === node.contextId);
          const capacidade = evento?.lotes?.reduce((a, l) => a + (l.limitTotal ?? 0), 0) ?? 0;
          const listas = listasService.getListasByEvento(node.contextId);
          const convidadosLista = listas.reduce((a, l) => a + (l.convidados?.length ?? 0), 0);

          // Split INDIVIDUAL deste sócio (não o consolidado)
          const meuSocio = evento?.socios?.find(s => s.socioId === currentUserId);
          const splitIndividual = meuSocio?.splitPercentual ?? evento?.splitSocio ?? 0;
          const splitConsolidado = evento?.splitSocio ?? 0;

          results.push({
            eventoId: node.contextId,
            eventoNome: node.contextNome,
            eventoLocal: evento?.local ?? '',
            eventoDataInicio: evento?.dataInicio ?? '',
            eventoStatus: evento?.statusEvento ?? '',
            eventoFoto: evento?.foto ?? '',
            receitaBruta: vendas.reduce((a, v) => a + (v.valor ?? 0), 0),
            vendidos: vendas.length,
            checkins,
            capacidade,
            convidadosLista,
            splitIndividual,
            splitConsolidado,
          });
        } catch {
          results.push({
            eventoId: node.contextId,
            eventoNome: node.contextNome,
            eventoLocal: '',
            eventoDataInicio: '',
            eventoStatus: '',
            eventoFoto: '',
            receitaBruta: 0,
            vendidos: 0,
            checkins: 0,
            capacidade: 0,
            convidadosLista: 0,
            splitIndividual: 0,
            splitConsolidado: 0,
          });
        }
      }

      if (!cancelled) {
        setMetricas(results);
        setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [socioNodes, currentUserId]);

  const dados = useMemo(() => {
    const lista = filtroEventoId ? metricas.filter(m => m.eventoId === filtroEventoId) : metricas;
    const receitaBruta = lista.reduce((a, m) => a + m.receitaBruta, 0);
    const totalVendidos = lista.reduce((a, m) => a + m.vendidos, 0);
    const totalCheckins = lista.reduce((a, m) => a + m.checkins, 0);
    const totalCapacidade = lista.reduce((a, m) => a + m.capacidade, 0);
    const totalConvidados = lista.reduce((a, m) => a + m.convidadosLista, 0);
    const ocupacao = totalCapacidade > 0 ? Math.round((totalVendidos / totalCapacidade) * 100) : 0;
    const splitMedio = lista.length > 0 ? lista.reduce((a, m) => a + m.splitIndividual, 0) / lista.length : 0;
    const valorSplit = receitaBruta * (splitMedio / 100);
    const mediaVendas = metricas.length > 0 ? metricas.reduce((a, m) => a + m.vendidos, 0) / metricas.length : 0;
    const temVendas = totalVendidos > 0;
    return {
      receitaBruta,
      totalVendidos,
      totalCheckins,
      totalCapacidade,
      totalConvidados,
      ocupacao,
      splitMedio,
      valorSplit,
      mediaVendas,
      temVendas,
    };
  }, [metricas, filtroEventoId]);

  const eventoSelecionado = filtroEventoId ? metricas.find(m => m.eventoId === filtroEventoId) : null;
  // Se só tem 1 evento, mostrar info dele mesmo sem filtro
  const eventoUnico = metricas.length === 1 ? metricas[0] : null;
  const eventoDestaque = eventoSelecionado ?? eventoUnico;
  const tendencia =
    eventoSelecionado && dados.mediaVendas > 0
      ? eventoSelecionado.vendidos >= dados.mediaVendas
        ? 'acima'
        : 'abaixo'
      : null;

  const fmtData = (iso: string) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'America/Sao_Paulo',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col overflow-hidden">
      <div className="shrink-0 px-6 pt-6 pb-4">
        <button onClick={onBack} className="text-zinc-400 text-xs mb-2">
          &larr; Voltar
        </button>
        <h1 style={TYPOGRAPHY.screenTitle} className="text-xl italic leading-none text-white">
          Dashboard Sócio
        </h1>
        <p className="text-[0.625rem] text-zinc-400 font-black uppercase tracking-wider mt-1">
          {socioNodes.length} evento{socioNodes.length !== 1 ? 's' : ''}
        </p>
      </div>

      {metricas.length > 1 && (
        <div className="shrink-0 px-6 pb-3 relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full flex items-center justify-between bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
          >
            <span>
              {filtroEventoId ? metricas.find(m => m.eventoId === filtroEventoId)?.eventoNome : 'Todos os eventos'}
            </span>
            <ChevronDown size="0.875rem" className="text-zinc-400" />
          </button>
          {showDropdown && (
            <div className="absolute left-6 right-6 top-full z-20 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-xl">
              <button
                onClick={() => {
                  setFiltroEventoId(null);
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-3 text-sm text-white hover:bg-zinc-800 border-b border-white/5"
              >
                Todos os eventos
              </button>
              {metricas.map(m => (
                <button
                  key={m.eventoId}
                  onClick={() => {
                    setFiltroEventoId(m.eventoId);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-white hover:bg-zinc-800 border-b border-white/5 last:border-0"
                >
                  {m.eventoNome}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-6">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-5 h-5 border-2 border-[#FFD300] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Card do evento em destaque */}
            {eventoDestaque && (
              <div className="mb-4 bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
                {eventoDestaque.eventoFoto && (
                  <div className="h-20 w-full overflow-hidden">
                    <img src={eventoDestaque.eventoFoto} alt="" className="w-full h-full object-cover opacity-60" />
                  </div>
                )}
                <div className="p-4">
                  <h2 className="text-sm font-black text-white truncate">{eventoDestaque.eventoNome}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    {eventoDestaque.eventoDataInicio && (
                      <div className="flex items-center gap-1">
                        <Calendar size="0.625rem" className="text-zinc-400 shrink-0" />
                        <p className="text-[0.625rem] text-zinc-400">{fmtData(eventoDestaque.eventoDataInicio)}</p>
                      </div>
                    )}
                    {eventoDestaque.eventoLocal && (
                      <div className="flex items-center gap-1 min-w-0">
                        <MapPin size="0.625rem" className="text-zinc-400 shrink-0" />
                        <p className="text-[0.625rem] text-zinc-400 truncate">{eventoDestaque.eventoLocal}</p>
                      </div>
                    )}
                  </div>
                  {eventoDestaque.eventoStatus && (
                    <div className="mt-2">
                      <span
                        className={`text-[0.5625rem] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          eventoDestaque.eventoStatus === 'ATIVO'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : eventoDestaque.eventoStatus === 'RASCUNHO'
                              ? 'bg-amber-500/10 text-amber-400'
                              : eventoDestaque.eventoStatus === 'CANCELADO'
                                ? 'bg-red-500/10 text-red-400'
                                : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {eventoDestaque.eventoStatus}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* KPIs financeiros */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <DollarSign size="0.6875rem" className="text-[#FFD300] shrink-0" />
                  <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-wider">Receita Bruta</p>
                </div>
                <p className="text-lg font-bold text-[#FFD300] leading-none truncate">{fmtBRL(dados.receitaBruta)}</p>
              </div>
              <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <Percent size="0.6875rem" className="text-emerald-400 shrink-0" />
                  <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-wider">Sua Parte</p>
                </div>
                <p className="text-lg font-bold text-emerald-400 leading-none truncate">{fmtBRL(dados.valorSplit)}</p>
                <p className="text-[0.5625rem] text-zinc-400">Seu split: {dados.splitMedio.toFixed(0)}%</p>
              </div>
            </div>

            {/* Empty state */}
            {!dados.temVendas && (
              <div className="mb-4 px-4 py-6 rounded-2xl border border-dashed border-white/10 bg-zinc-900/30 text-center">
                <Sparkles size="1.5rem" className="text-[#FFD300]/40 mx-auto mb-2" />
                <p className="text-sm font-bold text-zinc-400">Nenhuma venda ainda</p>
                <p className="text-[0.625rem] text-zinc-400 mt-1">
                  {eventoDestaque?.eventoDataInicio
                    ? `Evento ${formatRelativeTime(eventoDestaque.eventoDataInicio)}`
                    : 'As vendas aparecerão aqui em tempo real'}
                </p>
              </div>
            )}

            {/* KPIs operacionais */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <Ticket size="0.6875rem" className="text-purple-400 shrink-0" />
                  <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-wider">Vendidos</p>
                </div>
                <p className="text-lg font-bold text-white leading-none">{dados.totalVendidos}</p>
                {dados.totalCapacidade > 0 && (
                  <p className="text-[0.5625rem] text-zinc-400">{dados.ocupacao}% ocupação</p>
                )}
              </div>
              <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <UserCheck size="0.6875rem" className="text-cyan-400 shrink-0" />
                  <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-wider">Check-ins</p>
                </div>
                <p className="text-lg font-bold text-white leading-none">{dados.totalCheckins}</p>
              </div>
              <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <ClipboardList size="0.6875rem" className="text-orange-400 shrink-0" />
                  <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-wider">Lista</p>
                </div>
                <p className="text-lg font-bold text-white leading-none">{dados.totalConvidados}</p>
              </div>
              <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <TrendingUp size="0.6875rem" className="text-blue-400 shrink-0" />
                  <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-wider">Média/evento</p>
                </div>
                <p className="text-lg font-bold text-white leading-none">{dados.mediaVendas.toFixed(0)}</p>
              </div>
            </div>

            {/* Tendência */}
            {tendencia && (
              <div
                className={`mb-4 px-4 py-3 rounded-xl border ${
                  tendencia === 'acima'
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : 'bg-orange-500/5 border-orange-500/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <TrendingUp
                    size="0.875rem"
                    className={tendencia === 'acima' ? 'text-emerald-400' : 'text-orange-400'}
                  />
                  <p className={`text-xs font-bold ${tendencia === 'acima' ? 'text-emerald-400' : 'text-orange-400'}`}>
                    {tendencia === 'acima' ? 'Acima' : 'Abaixo'} da média
                  </p>
                  <p className="text-[0.625rem] text-zinc-400">
                    ({eventoSelecionado?.vendidos} vendas vs média {dados.mediaVendas.toFixed(0)})
                  </p>
                </div>
              </div>
            )}

            {/* Comparativo */}
            {metricas.length > 1 && !filtroEventoId && (
              <div className="mb-4">
                <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-wider mb-2">
                  Comparativo por Evento
                </p>
                <div className="space-y-2">
                  {metricas.map(m => {
                    const pct = dados.mediaVendas > 0 ? (m.vendidos / dados.mediaVendas) * 100 : 0;
                    return (
                      <div key={m.eventoId} className="bg-zinc-900/50 border border-white/5 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-white font-bold truncate flex-1 min-w-0">{m.eventoNome}</p>
                          <p className="text-xs text-[#FFD300] font-bold shrink-0 ml-2">{fmtBRL(m.receitaBruta)}</p>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#FFD300] rounded-full transition-all"
                            style={{ width: `${Math.min(pct, 200)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-[0.5625rem] text-zinc-400">
                            {m.vendidos} vendidos · {m.splitIndividual}% seu split
                          </p>
                          <p className="text-[0.5625rem] text-emerald-500">
                            {fmtBRL(m.receitaBruta * (m.splitIndividual / 100))}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Atalhos */}
            <div className="space-y-2">
              <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-wider">Ações rápidas</p>
              {[
                { id: 'MEUS_EVENTOS', icon: BarChart3, label: 'Painel do Evento', color: 'text-purple-400' },
                { id: 'FINANCEIRO', icon: DollarSign, label: 'Ver Financeiro', color: 'text-[#FFD300]' },
                { id: 'LISTAS', icon: ClipboardList, label: 'Gerenciar Listas', color: 'text-orange-400' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="w-full flex items-center justify-between bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 active:scale-[0.98] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <item.icon size="1rem" className={`${item.color} shrink-0`} />
                    <p className="text-sm text-white font-bold">{item.label}</p>
                  </div>
                  <ArrowRight size="0.875rem" className="text-zinc-400 shrink-0" />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
