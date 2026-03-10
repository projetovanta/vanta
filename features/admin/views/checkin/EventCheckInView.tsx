import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ArrowLeft, Search, Check, QrCode, X, List, HardDrive, Clock, WifiOff, RefreshCw } from 'lucide-react';
import { TYPOGRAPHY } from '../../../../constants';
import { supabase } from '../../../../services/supabaseClient';
import { offlineEventService } from '../../../../services/offlineEventService';
import type { CachedTicket } from '../../../../services/offlineDB';
import { useConnectivity } from '../../../../hooks/useConnectivity';
import type { Modo, FeedbackTela } from './checkinTypes';
import { FeedbackOverlay } from './FeedbackOverlay';
import { QRScanner } from './QRScanner';

export const EventCheckInView: React.FC<{
  eventoId: string;
  eventoNome: string;
  onBack: () => void;
  modoFixo?: 'LISTA' | 'QR';
}> = ({ eventoId, eventoNome, onBack, modoFixo }) => {
  const [search, setSearch] = useState('');
  const [modo, setModo] = useState<Modo>(modoFixo ?? 'LISTA');
  const [confirming, setConfirming] = useState<CachedTicket | null>(null);
  const [feedbackTela, setFeedbackTela] = useState<FeedbackTela | null>(null);
  const [feedbackNome, setFeedbackNome] = useState<string | undefined>(undefined);

  const [tickets, setTickets] = useState<CachedTicket[]>([]);
  const { isOnline, pendingSyncCount, syncing, refreshPendingCount } = useConnectivity();

  const loadTickets = useCallback(() => {
    void offlineEventService.loadTickets(eventoId).then(setTickets);
  }, [eventoId]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    if (!isOnline) return;
    const channel = supabase
      .channel(`checkin-tickets-${eventoId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets_caixa',
          filter: `evento_id=eq.${eventoId}`,
        },
        () => {
          loadTickets();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventoId, isOnline, loadTickets]);

  useEffect(() => {
    if (isOnline) loadTickets();
  }, [isOnline, loadTickets]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return tickets;
    return tickets.filter(t => (t.nomeTitular ?? '').toLowerCase().includes(q) || t.email.toLowerCase().includes(q));
  }, [tickets, search]);

  const usados = tickets.filter(t => t.status === 'USADO').length;
  const total = tickets.length;
  const pct = total > 0 ? Math.round((usados / total) * 100) : 0;

  const showFeedback = useCallback((f: FeedbackTela, nome?: string) => {
    setFeedbackNome(nome);
    setFeedbackTela(f);
    setTimeout(() => setFeedbackTela(null), 3000);
  }, []);

  const handleValidateAndBurn = useCallback(
    async (ticketId: string, evId: string) => {
      const result = await offlineEventService.validateAndBurn(ticketId, evId);
      void refreshPendingCount();

      // Check-in MV: marcar resgate como USADO para tiers convidado/presenca
      if (result.resultado === 'VALIDO') {
        supabase
          .from('tickets_caixa')
          .select('owner_id')
          .eq('id', ticketId)
          .maybeSingle()
          .then(({ data: tk }) => {
            if (!tk?.owner_id) return;
            const userId = tk.owner_id as string;
            // Verificar tier do membro
            supabase
              .from('membros_clube')
              .select('tier')
              .eq('user_id', userId)
              .maybeSingle()
              .then(({ data: membro }) => {
                if (!membro) return;
                const tier = membro.tier as string;
                if (tier !== 'convidado' && tier !== 'presenca') return;
                // Marcar resgates RESGATADO como USADO
                supabase
                  .from('resgates_mv_evento')
                  .update({ status: 'USADO' })
                  .eq('evento_id', evId)
                  .eq('user_id', userId)
                  .eq('status', 'RESGATADO')
                  .then(() => {});
              });
          });
      }

      return result;
    },
    [refreshPendingCount],
  );

  const handleEntrada = async (ticket: CachedTicket) => {
    const { resultado } = await handleValidateAndBurn(ticket.id, eventoId);
    setConfirming(null);
    if (resultado === 'VALIDO') {
      showFeedback('VERDE', ticket.nomeTitular ?? ticket.email);
      loadTickets();
    } else if (resultado === 'JA_UTILIZADO') {
      showFeedback('AMARELO');
    } else {
      showFeedback('VERMELHO');
    }
  };

  return (
    <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col overflow-hidden">
      {feedbackTela && (
        <FeedbackOverlay tipo={feedbackTela} nome={feedbackNome} onDismiss={() => setFeedbackTela(null)} />
      )}

      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-8 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <button
            aria-label="Voltar"
            onClick={onBack}
            className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all shrink-0"
          >
            <ArrowLeft size={18} className="text-zinc-400" />
          </button>
          <div className="flex-1 min-w-0">
            <p style={TYPOGRAPHY.sectionKicker} className="mb-0.5">
              Portaria · Check-in
            </p>
            <h1 style={TYPOGRAPHY.screenTitle} className="text-base italic truncate leading-none">
              {eventoNome}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mb-4">
          {syncing ? (
            <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1">
              <RefreshCw size={9} className="text-blue-400 shrink-0 animate-spin" />
              <span className="text-blue-400 text-[8px] font-black uppercase tracking-widest">
                Sincronizando {pendingSyncCount}...
              </span>
            </div>
          ) : isOnline ? (
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
              <HardDrive size={9} className="text-emerald-500 shrink-0" />
              <span className="text-emerald-500 text-[8px] font-black uppercase tracking-widest">Realtime ativo</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1">
              <WifiOff size={9} className="text-amber-400 shrink-0" />
              <span className="text-amber-400 text-[8px] font-black uppercase tracking-widest">
                Offline{pendingSyncCount > 0 ? ` · ${pendingSyncCount} pendente${pendingSyncCount > 1 ? 's' : ''}` : ''}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest mb-1.5">Presentes</p>
            <div className="flex items-baseline gap-2">
              <span className="text-emerald-400 font-black text-5xl leading-none">{usados}</span>
              <span className="text-zinc-400 text-2xl font-light">/{total}</span>
            </div>
          </div>
          <div className="text-right pb-1">
            <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest">Frequência</p>
            <p className="text-white font-black text-3xl leading-none">{pct}%</p>
          </div>
        </div>

        <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden mb-4">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${pct}%`,
              background: usados > 0 ? 'linear-gradient(to right, #059669, #10b981)' : '#3f3f46',
            }}
          />
        </div>

        {!modoFixo && (
          <div className="flex gap-1 p-1 bg-zinc-900/60 rounded-xl border border-white/5 mb-3">
            <button
              onClick={() => setModo('LISTA')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                modo === 'LISTA'
                  ? 'bg-white/10 text-white border border-white/10'
                  : 'text-zinc-400 active:text-zinc-400'
              }`}
            >
              <List size={11} /> Lista
            </button>
            <button
              onClick={() => setModo('QR')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                modo === 'QR'
                  ? 'bg-[#FFD300]/10 text-[#FFD300] border border-[#FFD300]/20'
                  : 'text-zinc-400 active:text-zinc-400'
              }`}
            >
              <QrCode size={11} /> QR Code
            </button>
          </div>
        )}

        {modo === 'LISTA' && (
          <div className="flex items-center gap-3 bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3">
            <Search size={14} className="text-zinc-400 shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome ou e-mail..."
              className="flex-1 bg-transparent text-white text-sm outline-none placeholder-zinc-700"
            />
            {search.length > 0 && (
              <button onClick={() => setSearch('')} className="shrink-0 active:scale-90 transition-all">
                <X size={13} className="text-zinc-400" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar max-w-3xl mx-auto w-full">
        {modo === 'QR' && (
          <QRScanner
            eventoId={eventoId}
            onFeedback={showFeedback}
            onValidated={loadTickets}
            onValidateAndBurn={handleValidateAndBurn}
          />
        )}

        {modo === 'LISTA' && (
          <div className="p-4 space-y-2">
            {filtered.length === 0 && (
              <div className="flex flex-col items-center py-16 gap-3">
                <QrCode size={28} className="text-zinc-700" />
                <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest text-center">
                  {search ? 'Nenhum ingresso encontrado.' : 'Nenhum ingresso vendido para este evento.'}
                </p>
              </div>
            )}

            {filtered.map(ticket => {
              const nome = ticket.nomeTitular ?? ticket.email;
              const inicial = nome.charAt(0).toUpperCase();
              const isUsado = ticket.status === 'USADO';
              const isCancelado = ticket.status === 'CANCELADO';
              const disabled = isUsado || isCancelado;

              return (
                <button
                  key={ticket.id}
                  onClick={() => !disabled && setConfirming(ticket)}
                  disabled={disabled}
                  className={`w-full flex items-center gap-3 p-4 border rounded-2xl transition-all text-left ${
                    isUsado
                      ? 'bg-emerald-500/5 border-emerald-500/15 cursor-default'
                      : isCancelado
                        ? 'bg-zinc-900/20 border-white/5 cursor-default opacity-40'
                        : 'bg-zinc-900/50 border-white/5 active:border-[#FFD300]/20 active:bg-[#FFD300]/5'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-black text-lg ${
                      isUsado ? 'bg-zinc-800/50 text-zinc-400' : 'bg-zinc-800 text-white'
                    }`}
                  >
                    {inicial}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-bold text-base leading-tight truncate ${isUsado ? 'text-zinc-400' : 'text-white'}`}
                    >
                      {nome}
                    </p>
                    <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest truncate mt-0.5">
                      {ticket.variacaoLabel}
                    </p>
                    {isUsado && ticket.usadoEm && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock size={8} className="text-zinc-700 shrink-0" />
                        <p className="text-zinc-700 text-[8px] truncate">
                          {new Date(ticket.usadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    )}
                  </div>

                  {isUsado ? (
                    <div className="flex flex-col items-center gap-0.5 shrink-0">
                      <div className="w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                        <Check size={15} className="text-emerald-400" />
                      </div>
                      <p className="text-emerald-700 text-[7px] font-black uppercase tracking-wider">Entrou</p>
                    </div>
                  ) : isCancelado ? (
                    <span className="text-[8px] font-black uppercase tracking-wider px-2 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 shrink-0">
                      Cancelado
                    </span>
                  ) : (
                    <div className="px-4 py-2.5 bg-[#FFD300] rounded-xl shrink-0 active:scale-95 transition-all">
                      <p className="text-black font-black text-[9px] uppercase tracking-widest leading-none">Entrada</p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {confirming && (
        <div
          className="absolute inset-0 z-50 flex items-end justify-center bg-black/85 backdrop-blur-md"
          onClick={() => setConfirming(null)}
        >
          <div
            className="w-full bg-[#111111] border border-white/10 rounded-t-[2.5rem] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-zinc-700" />
            </div>
            <div className="px-6 pt-4 pb-5 flex flex-col items-center">
              <div className="w-24 h-24 rounded-3xl bg-zinc-800 border border-white/10 flex items-center justify-center mb-4">
                <span className="text-white font-black text-5xl leading-none">
                  {(confirming.nomeTitular ?? confirming.email).charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest mb-2">Confirmar entrada</p>
              <h2
                style={TYPOGRAPHY.screenTitle}
                className="text-2xl italic text-center leading-tight mb-1 truncate max-w-full px-4"
              >
                {confirming.nomeTitular ?? confirming.email}
              </h2>
              <p className="text-zinc-400 text-[10px] mb-3 truncate max-w-full px-4">{confirming.email}</p>
              <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFD300]/10 border border-[#FFD300]/30">
                <span className="w-2 h-2 rounded-full bg-[#FFD300]" />
                <span className="text-[#FFD300] text-[9px] font-black uppercase tracking-widest">
                  {confirming.variacaoLabel}
                </span>
              </span>
            </div>
            <div
              className="flex gap-2 px-6"
              style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom, 2.5rem))' }}
            >
              <button
                onClick={() => setConfirming(null)}
                className="w-14 h-14 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center active:scale-90 transition-all shrink-0"
              >
                <X size={18} className="text-zinc-400" />
              </button>
              <button
                onClick={() => handleEntrada(confirming)}
                className="flex-1 h-14 bg-[#FFD300] text-black rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 active:scale-[0.97] transition-all"
              >
                <Check size={16} /> Confirmar Entrada
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
