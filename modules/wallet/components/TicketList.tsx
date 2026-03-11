import React, { useState, useEffect } from 'react';
import { QrCode, Lock, Gift, RotateCcw, ArrowRightLeft, X, Check, UserPlus } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { Ingresso, Membro } from '../../../types';
import { authService } from '../../../services/authService';

interface TicketListProps {
  tickets: Ingresso[];
  onSelectTicket: (ticket: Ingresso) => void;
  onDevolverCortesia?: (ticket: Ingresso) => void;
  onTransferirIngresso?: (ticket: Ingresso, destinatarioId: string, destinatarioNome: string) => void;
  isPast?: boolean;
}

// ── Modal de Transferência ───────────────────────────────────────────────────
const TransferirModal: React.FC<{
  ticket: Ingresso;
  onConfirmar: (destinatarioId: string, destinatarioNome: string) => void;
  onClose: () => void;
}> = ({ ticket, onConfirmar, onClose }) => {
  const [query, setQuery] = useState('');
  const [destinatario, setDestinatario] = useState<Membro | null>(null);

  const [resultados, setResultados] = useState<Membro[]>([]);
  useEffect(() => {
    if (query.length < 2) {
      setResultados([]);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      if (cancelled) return;
      try {
        const r = await authService.buscarMembros(query, 4);
        if (cancelled) return;
        setResultados(r);
      } catch (err) {
        console.error('[TicketList] busca:', err);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  const handleSelect = (m: Membro) => {
    setDestinatario(m);
    setQuery(m.nome);
  };

  return (
    <div
      className="absolute inset-0 z-50 flex items-end bg-black/80 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="w-full bg-[#111] border-t border-white/10 rounded-t-3xl p-6 space-y-5 animate-in slide-in-from-bottom duration-300"
        style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom, 2.5rem))' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto" />

        <div className="flex items-start justify-between">
          <div>
            <p className="text-zinc-400 text-[0.5rem] font-black uppercase tracking-widest">Transferir Ingresso</p>
            <p className="text-white font-bold text-base mt-0.5 truncate">{ticket.tituloEvento}</p>
            {ticket.variacaoLabel && <p className="text-zinc-400 text-xs mt-0.5">{ticket.variacaoLabel}</p>}
          </div>
          <button
            onClick={onClose}
            className="min-w-[2.75rem] min-h-[2.75rem] flex items-center justify-center text-zinc-400 active:opacity-70 transition-opacity -mr-2"
          >
            <X size="0.875rem" />
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-zinc-400 text-[0.5rem] font-black uppercase tracking-widest">Para quem?</p>
          <input
            type="text"
            placeholder="Buscar membro por nome..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setDestinatario(null);
            }}
            className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700"
            autoFocus
          />
          {resultados.length > 0 && !destinatario && (
            <div className="bg-zinc-900 border border-white/5 rounded-xl overflow-hidden">
              {resultados.map(m => (
                <button
                  key={m.id}
                  onClick={() => handleSelect(m)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/60 active:bg-zinc-800 transition-colors border-b border-white/5 last:border-0"
                >
                  <img
                    loading="lazy"
                    src={m.foto}
                    alt={m.nome}
                    className="w-7 h-7 rounded-full object-cover shrink-0"
                  />
                  <p className="text-white text-sm text-left truncate">{m.nome}</p>
                </button>
              ))}
            </div>
          )}
          {destinatario && (
            <div className="flex items-center gap-3 px-4 py-3 bg-zinc-900/60 border border-[#FFD300]/20 rounded-xl">
              <img
                src={destinatario.foto}
                alt={destinatario.nome}
                className="w-7 h-7 rounded-full object-cover shrink-0"
              />
              <p className="text-white text-sm flex-1 truncate">{destinatario.nome}</p>
              <Check size="0.875rem" className="text-[#FFD300] shrink-0" />
            </div>
          )}
        </div>

        <button
          onClick={() => destinatario && onConfirmar(destinatario.id, destinatario.nome)}
          disabled={!destinatario}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-[0.625rem] uppercase tracking-[0.2em] text-white active:scale-95 transition-all disabled:opacity-30 disabled:scale-100"
        >
          Transferir Ingresso
        </button>

        <p className="text-center text-zinc-700 text-[0.5rem]">
          Após a transferência, o ingresso sai da sua carteira permanentemente.
        </p>
      </div>
    </div>
  );
};

// ── TicketList ───────────────────────────────────────────────────────────────
export const TicketList: React.FC<TicketListProps> = React.memo(
  ({ tickets, onSelectTicket, onDevolverCortesia, onTransferirIngresso, isPast }) => {
    const [transferTarget, setTransferTarget] = useState<Ingresso | null>(null);

    const regular = tickets.filter(t => t.tipo !== 'CORTESIA');
    const cortesias = tickets.filter(t => t.tipo === 'CORTESIA');

    const handleConfirmarTransfer = (destinatarioId: string, destinatarioNome: string) => {
      if (!transferTarget) return;
      onTransferirIngresso?.(transferTarget, destinatarioId, destinatarioNome);
      setTransferTarget(null);
    };

    return (
      <div className={isPast ? 'opacity-60 grayscale-[0.5]' : ''}>
        {regular.length > 0 && (
          <div className={cortesias.length > 0 ? 'mb-8' : ''}>
            <h2 style={TYPOGRAPHY.uiLabel} className="mb-4 text-[#FFD300]/80">
              Ingressos Comprados
            </h2>
            <div className="space-y-4">
              {regular.map(ticket => (
                <div
                  key={ticket.id}
                  onClick={() => !isPast && onSelectTicket(ticket)}
                  className={`bg-zinc-900 border border-white/10 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden transition-all shadow-lg ${isPast ? 'cursor-default' : 'cursor-pointer active:scale-95'}`}
                >
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1.5 ${isPast ? 'bg-zinc-700' : 'bg-gradient-to-b from-purple-500 to-pink-500'}`}
                  />
                  <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center shrink-0 border border-white/5">
                    {isPast ? (
                      <Lock size="1.25rem" className="text-zinc-400" />
                    ) : (
                      <QrCode size="1.25rem" className="text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm truncate">{ticket.tituloEvento}</h3>
                    <p className="text-zinc-400 text-xs mt-0.5">
                      {ticket.dataEvento}
                      {ticket.variacaoLabel ? ` · ${ticket.variacaoLabel}` : ''}
                    </p>
                    {ticket.isAcompanhante && ticket.nomeTitular && (
                      <p className="text-cyan-400/80 text-[0.5625rem] mt-1 flex items-center gap-1 font-bold">
                        <UserPlus size="0.5625rem" /> Acompanhante · {ticket.nomeTitular}
                      </p>
                    )}
                    <span
                      className={`inline-block mt-2 text-[0.5625rem] px-2 py-0.5 rounded border uppercase font-bold tracking-wider ${
                        ticket.status === 'TRANSFERIDO'
                          ? 'bg-purple-900/30 text-purple-400 border-purple-500/20'
                          : isPast
                            ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                            : 'bg-green-900/30 text-green-400 border-green-500/20'
                      }`}
                    >
                      {ticket.status === 'TRANSFERIDO'
                        ? 'Transferido'
                        : ticket.status === 'EXPIRADO'
                          ? 'Não utilizado'
                          : ticket.status === 'USADO'
                            ? 'Utilizado'
                            : ticket.status === 'REEMBOLSADO'
                              ? 'Reembolsado'
                              : isPast
                                ? 'Encerrado'
                                : 'Disponível'}
                    </span>
                  </div>
                  {!isPast && onTransferirIngresso && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setTransferTarget(ticket);
                      }}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-purple-950/40 border border-purple-500/20 text-purple-400 rounded-xl text-[0.5625rem] font-black uppercase tracking-wider active:scale-90 transition-all"
                    >
                      <ArrowRightLeft size="0.625rem" />
                      Transferir
                    </button>
                  )}
                  {/* Carimbo para ingressos queimados ou transferidos */}
                  {ticket.status === 'USADO' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded-2xl">
                      <span
                        className="text-[0.5625rem] font-black uppercase tracking-[0.3em] px-5 py-1.5 border-2 border-emerald-500/40 text-emerald-500/40 rounded"
                        style={{ transform: 'rotate(-22deg)' }}
                      >
                        UTILIZADO
                      </span>
                    </div>
                  )}
                  {ticket.status === 'TRANSFERIDO' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded-2xl">
                      <span
                        className="text-[0.5625rem] font-black uppercase tracking-[0.3em] px-5 py-1.5 border-2 border-yellow-500/40 text-yellow-500/40 rounded"
                        style={{ transform: 'rotate(-22deg)' }}
                      >
                        TRANSFERIDO
                      </span>
                    </div>
                  )}
                  {ticket.status === 'EXPIRADO' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded-2xl">
                      <span
                        className="text-[0.5625rem] font-black uppercase tracking-[0.3em] px-5 py-1.5 border-2 border-red-500/40 text-red-500/40 rounded"
                        style={{ transform: 'rotate(-22deg)' }}
                      >
                        NÃO UTILIZADO
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {cortesias.length > 0 && (
          <div>
            <h2 style={TYPOGRAPHY.uiLabel} className="mb-4 text-[#FFD300]/80">
              Cortesias Recebidas
            </h2>
            <div className="space-y-4">
              {cortesias.map(ticket => (
                <div
                  key={ticket.id}
                  className="bg-zinc-900 border border-[#FFD300]/15 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden shadow-lg"
                >
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1.5 ${isPast ? 'bg-zinc-700' : 'bg-gradient-to-b from-[#FFD300] to-amber-500'}`}
                  />
                  <div
                    onClick={() => !isPast && onSelectTicket(ticket)}
                    className={`w-12 h-12 bg-black rounded-xl flex items-center justify-center shrink-0 border border-white/5 ${!isPast ? 'cursor-pointer active:scale-90 transition-transform' : ''}`}
                  >
                    {isPast ? (
                      <Lock size="1.25rem" className="text-zinc-400" />
                    ) : (
                      <Gift size="1.25rem" className="text-[#FFD300]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm truncate">{ticket.tituloEvento}</h3>
                    <p className="text-zinc-400 text-xs mt-0.5">{ticket.dataEvento}</p>
                    <span
                      className={`inline-block mt-2 text-[0.5625rem] px-2 py-0.5 rounded border uppercase font-bold tracking-wider ${isPast ? 'bg-zinc-800 text-zinc-400 border-zinc-700' : 'bg-[#FFD300]/10 text-[#FFD300] border-[#FFD300]/20'}`}
                    >
                      {isPast ? 'Encerrado' : 'Cortesia'}
                    </span>
                  </div>
                  {!isPast && onDevolverCortesia && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onDevolverCortesia(ticket);
                      }}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-red-950/40 border border-red-500/20 text-red-400 rounded-xl text-[0.5625rem] font-black uppercase tracking-wider active:scale-90 transition-all"
                    >
                      <RotateCcw size="0.625rem" />
                      Devolver
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {transferTarget && (
          <TransferirModal
            ticket={transferTarget}
            onConfirmar={handleConfirmarTransfer}
            onClose={() => setTransferTarget(null)}
          />
        )}
      </div>
    );
  },
);
