import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, DollarSign, Package, TrendingUp, ChevronDown, ArrowRight } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { useAuthStore } from '../../../stores/authStore';
import { eventosAdminService } from '../services/eventosAdminService';
import { getVendasLog } from '../services/eventosAdminTickets';
import { fmtBRL } from '../../../utils';
import type { AccessNode } from '../../../types';

interface CaixaDashProps {
  onBack: () => void;
  currentUserId: string;
  onOpenCaixa: (eventoId: string) => void;
}

interface EventoMetrica {
  eventoId: string;
  eventoNome: string;
  vendasQtd: number;
  vendasValor: number;
  lotesDisponiveis: number;
}

export const CaixaDashboardView: React.FC<CaixaDashProps> = ({ onBack, currentUserId, onOpenCaixa }) => {
  const accessNodes = useAuthStore(s => s.accessNodes);
  const [metricas, setMetricas] = useState<EventoMetrica[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEventoId, setFiltroEventoId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Filtra apenas AccessNodes do cargo CAIXA
  const caixaNodes = useMemo(
    () => accessNodes.filter((n: AccessNode) => n.portalRole === 'vanta_caixa'),
    [accessNodes],
  );

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const results: EventoMetrica[] = [];

      for (const node of caixaNodes) {
        if (node.tipo !== 'EVENTO') continue;
        try {
          const vendas = await getVendasLog(node.contextId);
          const evento = eventosAdminService.getEventos().find(e => e.id === node.contextId);
          const lotes = evento?.lotes ?? [];
          const lotesDisponiveis = lotes.reduce(
            (acc, l) => acc + Math.max(0, (l.limitTotal ?? 0) - (l.vendidos ?? 0)),
            0,
          );

          results.push({
            eventoId: node.contextId,
            eventoNome: node.contextNome,
            vendasQtd: vendas.length,
            vendasValor: vendas.reduce((acc, v) => acc + (v.valor ?? 0), 0),
            lotesDisponiveis,
          });
        } catch {
          results.push({
            eventoId: node.contextId,
            eventoNome: node.contextNome,
            vendasQtd: 0,
            vendasValor: 0,
            lotesDisponiveis: 0,
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
  }, [caixaNodes]);

  // Métricas filtradas ou consolidadas
  const dados = useMemo(() => {
    const lista = filtroEventoId ? metricas.filter(m => m.eventoId === filtroEventoId) : metricas;
    const totalVendas = lista.reduce((a, m) => a + m.vendasQtd, 0);
    const totalValor = lista.reduce((a, m) => a + m.vendasValor, 0);
    const totalDisp = lista.reduce((a, m) => a + m.lotesDisponiveis, 0);
    const media = metricas.length > 0 ? metricas.reduce((a, m) => a + m.vendasQtd, 0) / metricas.length : 0;
    return { totalVendas, totalValor, totalDisp, media, lista };
  }, [metricas, filtroEventoId]);

  const eventoSelecionado = filtroEventoId ? metricas.find(m => m.eventoId === filtroEventoId) : null;

  const tendencia =
    eventoSelecionado && dados.media > 0 ? (eventoSelecionado.vendasQtd >= dados.media ? 'acima' : 'abaixo') : null;

  return (
    <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-6 pt-6 pb-4">
        <button onClick={onBack} className="text-zinc-400 text-xs mb-2">
          &larr; Voltar
        </button>
        <h1 style={TYPOGRAPHY.screenTitle} className="text-xl italic leading-none text-white">
          Dashboard Caixa
        </h1>
        <p className="text-[10px] text-zinc-400 font-black uppercase tracking-wider mt-1">
          {caixaNodes.length} evento{caixaNodes.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filtro por evento */}
      {metricas.length > 1 && (
        <div className="shrink-0 px-6 pb-3 relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full flex items-center justify-between bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
          >
            <span>
              {filtroEventoId ? metricas.find(m => m.eventoId === filtroEventoId)?.eventoNome : 'Todos os eventos'}
            </span>
            <ChevronDown size={14} className="text-zinc-400" />
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

      {/* Conteudo rolavel */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-6">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-5 h-5 border-2 border-[#FFD300] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <ShoppingCart size={11} className="text-[#FFD300] shrink-0" />
                  <p className="text-[8px] text-zinc-400 font-black uppercase tracking-wider">Vendas</p>
                </div>
                <p className="text-lg font-bold text-[#FFD300] leading-none">{dados.totalVendas}</p>
              </div>
              <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <DollarSign size={11} className="text-emerald-400 shrink-0" />
                  <p className="text-[8px] text-zinc-400 font-black uppercase tracking-wider">Valor Total</p>
                </div>
                <p className="text-lg font-bold text-emerald-400 leading-none truncate">{fmtBRL(dados.totalValor)}</p>
              </div>
              <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={11} className="text-purple-400 shrink-0" />
                  <p className="text-[8px] text-zinc-400 font-black uppercase tracking-wider">Média/evento</p>
                </div>
                <p className="text-lg font-bold text-white leading-none">{dados.media.toFixed(0)}</p>
              </div>
              <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <Package size={11} className="text-blue-400 shrink-0" />
                  <p className="text-[8px] text-zinc-400 font-black uppercase tracking-wider">Disponíveis</p>
                </div>
                <p className="text-lg font-bold text-white leading-none">{dados.totalDisp}</p>
              </div>
            </div>

            {/* Indicador de média */}
            {tendencia && (
              <div
                className={`mb-4 px-4 py-3 rounded-xl border ${
                  tendencia === 'acima'
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : 'bg-orange-500/5 border-orange-500/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className={tendencia === 'acima' ? 'text-emerald-400' : 'text-orange-400'} />
                  <p className={`text-xs font-bold ${tendencia === 'acima' ? 'text-emerald-400' : 'text-orange-400'}`}>
                    {tendencia === 'acima' ? 'Acima' : 'Abaixo'} da média
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    ({eventoSelecionado?.vendasQtd} vendas vs média {dados.media.toFixed(0)})
                  </p>
                </div>
              </div>
            )}

            {/* Comparativo evento a evento */}
            {metricas.length > 1 && !filtroEventoId && (
              <div className="mb-4">
                <p className="text-[8px] text-zinc-400 font-black uppercase tracking-wider mb-2">
                  Comparativo por Evento
                </p>
                <div className="space-y-2">
                  {metricas.map(m => {
                    const pct = dados.media > 0 ? (m.vendasQtd / dados.media) * 100 : 0;
                    return (
                      <div key={m.eventoId} className="bg-zinc-900/50 border border-white/5 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-white font-bold truncate flex-1 min-w-0">{m.eventoNome}</p>
                          <p className="text-xs text-[#FFD300] font-bold shrink-0 ml-2">{m.vendasQtd} vendas</p>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#FFD300] rounded-full transition-all"
                            style={{ width: `${Math.min(pct, 200)}%` }}
                          />
                        </div>
                        <p className="text-[9px] text-zinc-400 mt-1">{fmtBRL(m.vendasValor)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Atalhos */}
            <div className="space-y-2">
              <p className="text-[8px] text-zinc-400 font-black uppercase tracking-wider">Ações rápidas</p>
              {(filtroEventoId ? [metricas.find(m => m.eventoId === filtroEventoId)!] : metricas).map(
                m =>
                  m && (
                    <button
                      key={m.eventoId}
                      onClick={() => onOpenCaixa(m.eventoId)}
                      className="w-full flex items-center justify-between bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 active:scale-[0.98] transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <ShoppingCart size={16} className="text-[#FFD300] shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-white font-bold truncate">Abrir Caixa</p>
                          <p className="text-[10px] text-zinc-400 truncate">{m.eventoNome}</p>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-zinc-400 shrink-0" />
                    </button>
                  ),
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
