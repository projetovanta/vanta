import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ArrowLeft, Search, Download, ChevronDown, X, Loader2, RotateCcw, Ban, Send, Eye } from 'lucide-react';
import { eventosAdminService } from '../../services/eventosAdminService';
import type { TicketCaixa } from '../../services/eventosAdminTypes';
import { fmtBRL } from '../../../../utils';

type StatusFilter = 'TODOS' | 'DISPONIVEL' | 'USADO' | 'CANCELADO' | 'REEMBOLSADO';

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'DISPONIVEL', label: 'Disponível' },
  { value: 'USADO', label: 'Usado' },
  { value: 'CANCELADO', label: 'Cancelado' },
  { value: 'REEMBOLSADO', label: 'Reembolsado' },
];

const STATUS_COLORS: Record<string, string> = {
  DISPONIVEL: 'text-emerald-400 bg-emerald-400/10',
  USADO: 'text-blue-400 bg-blue-400/10',
  CANCELADO: 'text-red-400 bg-red-400/10',
  REEMBOLSADO: 'text-amber-400 bg-amber-400/10',
};

export const PedidosSubView: React.FC<{
  eventoId: string;
  eventoNome: string;
  onBack: () => void;
}> = ({ eventoId, eventoNome, onBack }) => {
  const [tickets, setTickets] = useState<TicketCaixa[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('TODOS');
  const [variacaoFilter, setVariacaoFilter] = useState<string>('TODOS');
  const [showStatusDrop, setShowStatusDrop] = useState(false);
  const [showVarDrop, setShowVarDrop] = useState(false);
  const [detalheTicket, setDetalheTicket] = useState<TicketCaixa | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmarCancelarId, setConfirmarCancelarId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await eventosAdminService.getTicketsCaixaByEvento(eventoId);
      setTickets(data);
    } catch (err) {
      console.error('[Pedidos] erro:', err);
    } finally {
      setLoading(false);
    }
  }, [eventoId]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const variacoes = useMemo(() => {
    const set = new Set(tickets.map(t => t.variacaoLabel));
    return Array.from(set).sort();
  }, [tickets]);

  const filtered = useMemo(() => {
    let list = tickets;
    if (statusFilter !== 'TODOS') list = list.filter(t => t.status === statusFilter);
    if (variacaoFilter !== 'TODOS') list = list.filter(t => t.variacaoLabel === variacaoFilter);
    if (busca.trim()) {
      const q = busca.trim().toLowerCase();
      list = list.filter(
        t => t.nomeTitular.toLowerCase().includes(q) || t.email.toLowerCase().includes(q) || t.cpf.includes(q),
      );
    }
    return list;
  }, [tickets, statusFilter, variacaoFilter, busca]);

  const resumo = useMemo(
    () => ({
      total: filtered.length,
      receita: filtered.reduce((s, t) => s + t.valor, 0),
      disponiveis: filtered.filter(t => t.status === 'DISPONIVEL').length,
      usados: filtered.filter(t => t.status === 'USADO').length,
      cancelados: filtered.filter(t => t.status === 'CANCELADO').length,
    }),
    [filtered],
  );

  const handleCancelar = async (ticketId: string) => {
    setConfirmarCancelarId(null);
    setActionLoading(ticketId);
    try {
      await eventosAdminService.cancelarIngresso(ticketId);
      await fetchTickets();
    } catch (err) {
      console.error('[Pedidos] cancelar erro:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReenviar = async (ticketId: string) => {
    setActionLoading(ticketId);
    try {
      await eventosAdminService.reenviarIngresso(ticketId);
      setFeedback('Ingresso reenviado!');
      setTimeout(() => setFeedback(''), 3000);
    } catch (err) {
      console.error('[Pedidos] reenviar erro:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const exportCSV = useCallback(() => {
    if (filtered.length === 0) return;
    const header = 'Nome,Email,CPF,Variação,Valor,Status,Emitido Em\n';
    const rows = filtered
      .map(
        t =>
          `"${t.nomeTitular}","${t.email}","${t.cpf}","${t.variacaoLabel}",${t.valor},"${t.status}","${t.emitidoEm}"`,
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pedidos-${eventoNome.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filtered, eventoNome]);

  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    return (
      d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }) +
      ' ' +
      d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    );
  };

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-[#0A0A0A]">
      {/* Header */}
      <div
        className="shrink-0 flex items-center gap-3 px-4 pb-3 border-b border-white/5"
        style={{ paddingTop: '0.75rem' }}
      >
        <button
          aria-label="Voltar"
          onClick={onBack}
          className="w-9 h-9 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
        >
          <ArrowLeft size="1rem" className="text-white" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-bold truncate">Pedidos</p>
          <p className="text-zinc-400 text-[0.5625rem] font-bold uppercase tracking-widest truncate">{eventoNome}</p>
        </div>
        {filtered.length > 0 && (
          <button
            aria-label="Baixar"
            onClick={exportCSV}
            className="w-9 h-9 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
          >
            <Download size="1rem" className="text-zinc-400" />
          </button>
        )}
      </div>

      {/* Resumo rápido */}
      {!loading && (
        <div className="shrink-0 grid grid-cols-2 md:grid-cols-4 gap-2 px-4 py-3">
          <div className="bg-zinc-900/50 border border-white/5 rounded-lg px-3 py-2">
            <p className="text-[0.5rem] text-zinc-400 font-bold uppercase">Total</p>
            <p className="text-white text-lg font-bold">{resumo.total}</p>
          </div>
          <div className="bg-zinc-900/50 border border-white/5 rounded-lg px-3 py-2">
            <p className="text-[0.5rem] text-zinc-400 font-bold uppercase">Receita</p>
            <p className="text-[#FFD300] text-lg font-bold">{fmtBRL(resumo.receita)}</p>
          </div>
          <div className="bg-zinc-900/50 border border-white/5 rounded-lg px-3 py-2">
            <p className="text-[0.5rem] text-emerald-500 font-bold uppercase">Disponíveis</p>
            <p className="text-white text-lg font-bold">{resumo.disponiveis}</p>
          </div>
          <div className="bg-zinc-900/50 border border-white/5 rounded-lg px-3 py-2">
            <p className="text-[0.5rem] text-blue-400 font-bold uppercase">Usados</p>
            <p className="text-white text-lg font-bold">{resumo.usados}</p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="shrink-0 flex items-center gap-2 px-4 pb-3 flex-wrap">
        <div className="flex-1 min-w-32 relative">
          <Search size="0.875rem" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar nome, email, CPF..."
            className="w-full pl-9 pr-8 py-2 bg-zinc-900 border border-white/5 rounded-lg text-white text-xs placeholder:text-zinc-700 outline-none focus:border-[#FFD300]/30"
          />
          {busca && (
            <button onClick={() => setBusca('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <X size="0.75rem" className="text-zinc-400" />
            </button>
          )}
        </div>

        {/* Status dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowStatusDrop(!showStatusDrop);
              setShowVarDrop(false);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900 border border-white/5 rounded-lg text-xs text-zinc-400 active:bg-white/5"
          >
            {STATUS_OPTIONS.find(o => o.value === statusFilter)?.label}
            <ChevronDown size="0.75rem" />
          </button>
          {showStatusDrop && (
            <div className="absolute top-full right-0 mt-1 bg-zinc-900 border border-white/10 rounded-lg shadow-xl z-20 min-w-28">
              {STATUS_OPTIONS.map(o => (
                <button
                  key={o.value}
                  onClick={() => {
                    setStatusFilter(o.value);
                    setShowStatusDrop(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs hover-real:bg-white/5 ${statusFilter === o.value ? 'text-[#FFD300]' : 'text-zinc-400'}`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Variação dropdown */}
        {variacoes.length > 1 && (
          <div className="relative">
            <button
              onClick={() => {
                setShowVarDrop(!showVarDrop);
                setShowStatusDrop(false);
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900 border border-white/5 rounded-lg text-xs text-zinc-400 active:bg-white/5"
            >
              {variacaoFilter === 'TODOS' ? 'Variação' : variacaoFilter}
              <ChevronDown size="0.75rem" />
            </button>
            {showVarDrop && (
              <div className="absolute top-full right-0 mt-1 bg-zinc-900 border border-white/10 rounded-lg shadow-xl z-20 min-w-32">
                <button
                  onClick={() => {
                    setVariacaoFilter('TODOS');
                    setShowVarDrop(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs hover-real:bg-white/5 ${variacaoFilter === 'TODOS' ? 'text-[#FFD300]' : 'text-zinc-400'}`}
                >
                  Todas
                </button>
                {variacoes.map(v => (
                  <button
                    key={v}
                    onClick={() => {
                      setVariacaoFilter(v);
                      setShowVarDrop(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover-real:bg-white/5 truncate ${variacaoFilter === v ? 'text-[#FFD300]' : 'text-zinc-400'}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size="1.25rem" className="text-zinc-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <p className="text-zinc-400 text-xs">Nenhum pedido encontrado</p>
            {(busca || statusFilter !== 'TODOS' || variacaoFilter !== 'TODOS') && (
              <button
                onClick={() => {
                  setBusca('');
                  setStatusFilter('TODOS');
                  setVariacaoFilter('TODOS');
                }}
                className="flex items-center gap-1 text-[#FFD300] text-xs"
              >
                <RotateCcw size="0.75rem" /> Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(t => (
              <div key={t.id} className="bg-zinc-900/40 border border-white/5 rounded-xl p-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-bold truncate">{t.nomeTitular || '—'}</p>
                    <p className="text-zinc-400 text-[0.625rem] truncate">{t.email}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[0.5625rem] text-zinc-400 font-semibold">{t.variacaoLabel}</span>
                      <span className="text-[0.5625rem] text-zinc-400">·</span>
                      <span className="text-[0.5625rem] text-[#FFD300] font-bold">{fmtBRL(t.valor)}</span>
                      <span className="text-[0.5625rem] text-zinc-400">·</span>
                      <span className="text-[0.5625rem] text-zinc-400">{fmtDate(t.emitidoEm)}</span>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 text-[0.5rem] font-black uppercase px-2 py-0.5 rounded-full ${STATUS_COLORS[t.status] ?? 'text-zinc-400 bg-zinc-800'}`}
                  >
                    {t.status}
                  </span>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => setDetalheTicket(t)}
                    className="flex items-center gap-1 text-[0.5625rem] text-zinc-400 hover-real:text-white transition-colors"
                  >
                    <Eye size="0.6875rem" /> Detalhes
                  </button>
                  {t.status === 'DISPONIVEL' && (
                    <>
                      <button
                        onClick={() => handleReenviar(t.id)}
                        disabled={actionLoading === t.id}
                        className="flex items-center gap-1 text-[0.5625rem] text-zinc-400 hover-real:text-blue-400 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === t.id ? (
                          <Loader2 size="0.6875rem" className="animate-spin" />
                        ) : (
                          <Send size="0.6875rem" />
                        )}{' '}
                        Reenviar
                      </button>
                      <button
                        onClick={() => setConfirmarCancelarId(t.id)}
                        disabled={actionLoading === t.id}
                        className="flex items-center gap-1 text-[0.5625rem] text-zinc-400 hover-real:text-red-400 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === t.id ? (
                          <Loader2 size="0.6875rem" className="animate-spin" />
                        ) : (
                          <Ban size="0.6875rem" />
                        )}{' '}
                        Cancelar
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalhe */}
      {detalheTicket && (
        <div
          className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setDetalheTicket(null)}
        >
          <div
            className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-sm p-5"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-white text-sm font-bold">Detalhe do Pedido</p>
              <button onClick={() => setDetalheTicket(null)}>
                <X size="1rem" className="text-zinc-400" />
              </button>
            </div>
            <div className="space-y-3">
              {(
                [
                  ['Titular', detalheTicket.nomeTitular || '—'],
                  ['Email', detalheTicket.email],
                  ['CPF', detalheTicket.cpf],
                  ['Variação', detalheTicket.variacaoLabel],
                  ['Valor', fmtBRL(detalheTicket.valor)],
                  ['Status', detalheTicket.status],
                  ['Emitido em', fmtDate(detalheTicket.emitidoEm)],
                  ...(detalheTicket.usadoEm ? [['Usado em', fmtDate(detalheTicket.usadoEm)]] : []),
                ] as [string, string][]
              ).map(([label, val]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[0.625rem] text-zinc-400 font-semibold">{label}</span>
                  <span className="text-[0.625rem] text-white font-bold truncate max-w-[60%] text-right">{val}</span>
                </div>
              ))}
            </div>
            {detalheTicket.selfieUrl && (
              <div className="mt-4">
                <p className="text-[0.5rem] text-zinc-400 font-bold uppercase mb-1">Selfie</p>
                <img
                  loading="lazy"
                  src={detalheTicket.selfieUrl}
                  alt="Selfie"
                  className="w-20 h-20 rounded-lg object-cover"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {confirmarCancelarId && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6">
          <div className="w-full max-w-sm bg-[#121212] border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-bold text-sm mb-2">Cancelar ingresso?</h3>
            <p className="text-zinc-400 text-xs leading-relaxed mb-4">
              Esta ação não pode ser desfeita. O ingresso será marcado como cancelado.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmarCancelarId(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold active:scale-95"
              >
                Voltar
              </button>
              <button
                onClick={() => handleCancelar(confirmarCancelarId)}
                className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold active:scale-95"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {feedback && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-4 py-2.5 rounded-xl animate-pulse">
          {feedback}
        </div>
      )}
    </div>
  );
};
