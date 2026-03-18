import React, { useState, useMemo, useRef } from 'react';
import {
  Ticket,
  ArrowLeft,
  ShieldCheck,
  Calendar,
  ChevronRight,
  Gift,
  Check,
  X,
  ArrowRightLeft,
  Crown,
  Send,
} from 'lucide-react';
import { Ingresso, Evento, ReservaMaisVanta } from '../../types';
import { TYPOGRAPHY } from '../../constants';
import { sortEvents, todayBR } from '../../utils';
import { clubeService } from '../../features/admin/services/clubeService';
import { TicketList } from './components/TicketList';
import { PresencaList } from './components/PresencaList';
import { WalletLockScreen } from './components/WalletLockScreen';
import { EventTicketsCarousel, EventoGroup } from './components/EventTicketsCarousel';
import { useAuthStore } from '../../stores/authStore';
import { useTicketsStore } from '../../stores/ticketsStore';
import { useExtrasStore } from '../../stores/extrasStore';
import { TicketCardSkeleton } from '../../components/Skeleton';
import { EmptyState } from '../../components/EmptyState';

interface WalletViewProps {
  onGoToHome: () => void;
  isSubView?: boolean;
  onDevolverCortesia?: (ticket: Ingresso) => void;
  onTransferirIngresso?: (ticket: Ingresso, destinatarioId: string, destinatarioNome: string) => void;
  onSuccess?: (msg: string) => void;
}

type WalletTab = 'UPCOMING' | 'PAST';

export const WalletView: React.FC<WalletViewProps> = ({
  onGoToHome,
  isSubView,
  onDevolverCortesia,
  onTransferirIngresso,
  onSuccess,
}) => {
  const userId = useAuthStore(s => s.currentAccount.id);
  const isMembro = useMemo(() => (userId ? clubeService.isMembro(userId) : false), [userId]);
  const tickets = useTicketsStore(s => s.myTickets);
  const presencaIds = useTicketsStore(s => s.myPresencas);
  const cortesiasPendentes = useTicketsStore(s => s.cortesiasPendentes);
  const transferenciasPendentes = useTicketsStore(s => s.transferenciasPendentes);
  const onUpdateTitular = useTicketsStore(s => s.updateTicketTitular);
  const onAceitarCortesia = (id: string) => void useTicketsStore.getState().aceitarCortesiaPendente(id);
  const onRecusarCortesia = (id: string) => void useTicketsStore.getState().recusarCortesiaPendente(id);
  const onAceitarTransferencia = (id: string) => void useTicketsStore.getState().aceitarTransferencia(id);
  const onRecusarTransferencia = (id: string) => void useTicketsStore.getState().recusarTransferencia(id);
  const allEvents = useExtrasStore(s => s.allEvents);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<WalletTab>('UPCOMING');
  const [carouselGrupo, setCarouselGrupo] = useState<EventoGroup | null>(null);
  const [mvPostUrl, setMvPostUrl] = useState('');
  const ticketsLoaded = useRef(false);
  if (tickets.length > 0) ticketsLoaded.current = true;
  const isFirstLoad = !ticketsLoaded.current;

  const reservasMV = useMemo<ReservaMaisVanta[]>(() => {
    if (!userId) return [];
    return clubeService.getReservasUsuario(userId).filter(r => r.status !== 'CANCELADO');
  }, [userId]);

  const handleEnviarPostMV = async (reservaId: string) => {
    if (!mvPostUrl.trim()) return;
    try {
      await clubeService.confirmarPost(reservaId, mvPostUrl.trim());
      setMvPostUrl('');
      onSuccess?.('Comprovação enviada!');
    } catch {
      onSuccess?.('Erro ao enviar');
    }
  };

  const todayISO = useMemo(() => todayBR(), []);

  // Um ingresso vai para PAST se:
  // 1. status explicitamente USADO / Utilizado / Cancelado, OU
  // 2. data do evento já expirou
  const { upcoming, past } = useMemo(() => {
    const evList = allEvents ?? [];
    const isPassado = (t: Ingresso): boolean => {
      if (
        t.status === 'USADO' ||
        t.status === 'CANCELADO' ||
        t.status === 'TRANSFERIDO' ||
        t.status === 'EXPIRADO' ||
        t.status === 'REEMBOLSADO'
      )
        return true;
      const ev = evList.find(e => e.id === t.eventoId);
      return ev ? ev.dataReal < todayISO : false;
    };

    const allPresencas = presencaIds.map(id => evList.find(e => e.id === id)).filter((e): e is Evento => !!e);

    return {
      upcoming: {
        tickets: tickets.filter(t => !isPassado(t)),
        presencas: sortEvents(allPresencas.filter(e => e.dataReal >= todayISO)),
      },
      past: {
        tickets: tickets.filter(t => isPassado(t)),
        presencas: sortEvents(allPresencas.filter(e => e.dataReal < todayISO)),
      },
    };
  }, [tickets, presencaIds, todayISO, allEvents]);

  // Agrupamento por eventoId — aba UPCOMING mostra 1 card por evento
  const groupedUpcoming = useMemo<EventoGroup[]>(() => {
    const evList = allEvents ?? [];
    const map = new Map<string, EventoGroup>();
    upcoming.tickets.forEach(t => {
      if (!map.has(t.eventoId)) {
        const ev = evList.find(e => e.id === t.eventoId);
        map.set(t.eventoId, {
          eventoId: t.eventoId,
          titulo: t.tituloEvento,
          data: t.dataEvento,
          imagem: t.eventoImagem ?? ev?.imagem,
          tickets: [],
        });
      }
      map.get(t.eventoId)!.tickets.push(t);
    });
    return [...map.values()];
  }, [upcoming.tickets, allEvents]);

  // ── Lock screen ──────────────────────────────────────────────────────────
  if (!isUnlocked) {
    return (
      <div
        className={`${isSubView ? 'absolute inset-0 flex flex-col overflow-hidden' : 'min-h-full flex flex-col pt-24'} bg-[#0a0a0a]`}
      >
        <div
          className={`flex-1 overflow-y-auto no-scrollbar flex flex-col`}
          style={isSubView ? { paddingTop: '2rem' } : undefined}
        >
          {isSubView && (
            <button
              aria-label="Voltar"
              onClick={onGoToHome}
              className="ml-6 mb-4 w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-transform shrink-0"
            >
              <ArrowLeft size="1.125rem" className="text-white" />
            </button>
          )}
          <WalletLockScreen onUnlock={() => setIsUnlocked(true)} onExit={onGoToHome} userId={userId ?? ''} />
        </div>
      </div>
    );
  }

  // ── Carrossel de evento ───────────────────────────────────────────────────
  if (carouselGrupo) {
    return (
      <EventTicketsCarousel
        grupo={carouselGrupo}
        onBack={() => setCarouselGrupo(null)}
        onTransferirIngresso={onTransferirIngresso}
        onDevolverCortesia={onDevolverCortesia}
        onUpdateTitular={onUpdateTitular}
        userId={userId}
        onReembolsoSucesso={() => onSuccess?.('Reembolso solicitado com sucesso!')}
      />
    );
  }

  const upcomingEmpty = groupedUpcoming.length === 0 && upcoming.presencas.length === 0;
  const pastEmpty = past.tickets.length === 0 && past.presencas.length === 0;
  const isEmpty = activeTab === 'UPCOMING' ? upcomingEmpty : pastEmpty;

  return (
    <div
      className={`${isSubView ? 'absolute inset-0 overflow-y-auto no-scrollbar' : 'pt-24'} bg-[#0a0a0a] animate-in fade-in duration-500 px-6 pb-4 flex flex-col`}
      style={isSubView ? { paddingTop: '2rem' } : undefined}
    >
      <div className="flex items-center justify-between mb-8">
        {isSubView && (
          <button
            aria-label="Voltar"
            onClick={onGoToHome}
            className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-transform"
          >
            <ArrowLeft size="1.125rem" className="text-white" />
          </button>
        )}
        <div className="flex items-center gap-2 bg-[#FFD300]/10 px-3 py-1.5 rounded-full border border-[#FFD300]/20">
          <ShieldCheck size="0.75rem" className="text-[#FFD300]" />
          <span className="text-[0.5rem] font-black text-[#FFD300] uppercase tracking-widest">Conexão Segura</span>
        </div>
      </div>

      <h1 style={TYPOGRAPHY.screenTitle} className="text-3xl mb-2 text-[#FFD300]">
        Minha Experiência
      </h1>
      <p className="text-zinc-400 text-xs uppercase tracking-widest mb-6 italic">Ingressos, presenças e benefícios</p>

      {/* Benefícios disponíveis — só membros MV */}
      {isMembro && (
        <button
          onClick={onGoToHome}
          className="w-full flex items-center gap-3 px-4 py-3.5 bg-[#FFD300]/5 border border-[#FFD300]/15 rounded-xl mb-8 active:scale-[0.98] transition-all"
        >
          <Crown size="1.125rem" className="text-[#FFD300] shrink-0" />
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm text-white font-bold">Seus benefícios</p>
            <p className="text-[0.625rem] text-zinc-400">Explore lugares e vantagens exclusivas</p>
          </div>
          <ChevronRight size="0.875rem" className="text-zinc-600 shrink-0" />
        </button>
      )}

      {/* Abas */}
      <div className="flex p-1 bg-zinc-900/50 rounded-2xl border border-white/5 mb-8">
        {(['UPCOMING', 'PAST'] as WalletTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 rounded-xl text-[0.625rem] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
              activeTab === tab
                ? 'bg-[#FFD300] text-black shadow-lg shadow-[#FFD300]/10'
                : 'text-zinc-400 active:text-zinc-300'
            }`}
          >
            {tab === 'UPCOMING' ? 'Próximos' : 'Passados'}
          </button>
        ))}
      </div>

      {/* Cortesias Pendentes */}
      {cortesiasPendentes && cortesiasPendentes.length > 0 && activeTab === 'UPCOMING' && (
        <div className="mb-8">
          <h2 style={TYPOGRAPHY.uiLabel} className="mb-4 text-emerald-400">
            Cortesias Pendentes
          </h2>
          <div className="space-y-3">
            {cortesiasPendentes.map(cp => (
              <div key={cp.id} className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Gift size="1.125rem" className="text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate">{cp.eventoNome}</p>
                    <p className="text-zinc-400 text-[0.625rem] mt-0.5">
                      Enviado por {cp.remetenteNome} · {cp.variacaoLabel}
                      {cp.quantidade > 1 && ` · x${cp.quantidade}`}
                    </p>
                    <p className="text-zinc-400 text-[0.5625rem] mt-0.5">{cp.eventoData}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onAceitarCortesia?.(cp.id)}
                    className="flex-1 py-2.5 bg-emerald-500 text-black text-[0.5625rem] font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-transform"
                  >
                    <Check size="0.75rem" /> Aceitar
                  </button>
                  <button
                    onClick={() => onRecusarCortesia?.(cp.id)}
                    className="flex-1 py-2.5 bg-zinc-900 text-zinc-400 text-[0.5625rem] font-black uppercase tracking-wider rounded-xl border border-white/5 flex items-center justify-center gap-1 active:scale-95 transition-transform"
                  >
                    <X size="0.75rem" /> Recusar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transferências Pendentes (Ingressos Recebidos) */}
      {transferenciasPendentes && transferenciasPendentes.length > 0 && activeTab === 'UPCOMING' && (
        <div className="mb-8">
          <h2 style={TYPOGRAPHY.uiLabel} className="mb-4 text-purple-400">
            Ingressos Recebidos
          </h2>
          <div className="space-y-3">
            {transferenciasPendentes.map(tp => (
              <div key={tp.id} className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                    <ArrowRightLeft size="1.125rem" className="text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate">{tp.tituloEvento}</p>
                    <p className="text-zinc-400 text-[0.625rem] mt-0.5">
                      Enviado por {tp.remetenteNome}
                      {tp.variacaoLabel && ` · ${tp.variacaoLabel}`}
                    </p>
                    {tp.dataEvento && <p className="text-zinc-400 text-[0.5625rem] mt-0.5">{tp.dataEvento}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onAceitarTransferencia?.(tp.id)}
                    className="flex-1 py-2.5 bg-purple-500 text-white text-[0.5625rem] font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-transform"
                  >
                    <Check size="0.75rem" /> Aceitar
                  </button>
                  <button
                    onClick={() => onRecusarTransferencia?.(tp.id)}
                    className="flex-1 py-2.5 bg-zinc-900 text-zinc-400 text-[0.5625rem] font-black uppercase tracking-wider rounded-xl border border-white/5 flex items-center justify-center gap-1 active:scale-95 transition-transform"
                  >
                    <X size="0.75rem" /> Recusar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reservas MAIS VANTA */}
      {reservasMV.length > 0 && activeTab === 'UPCOMING' && (
        <div className="mb-8">
          <h2 style={TYPOGRAPHY.uiLabel} className="mb-4 text-[#FFD300]">
            Experiências MAIS VANTA
          </h2>
          <div className="space-y-3">
            {reservasMV.map(r => (
              <div key={r.id} className="bg-[#FFD300]/5 border border-[#FFD300]/15 rounded-2xl p-4">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#FFD300]/10 flex items-center justify-center shrink-0">
                    <Crown size="1.125rem" className="text-[#FFD300]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate">Experiência</p>
                    <span
                      className={`text-[0.5rem] font-black uppercase px-2 py-0.5 rounded ${
                        r.postVerificado
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : r.postUrl
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {r.postVerificado ? 'Post verificado' : r.postUrl ? 'Aguardando verificação' : 'Post pendente'}
                    </span>
                  </div>
                </div>
                {!r.postVerificado && !r.postUrl && (
                  <div className="flex gap-2 mt-2">
                    <input
                      value={mvPostUrl}
                      onChange={e => setMvPostUrl(e.target.value)}
                      placeholder="Link do post..."
                      className="flex-1 bg-black/40 border border-white/10 rounded-lg text-xs text-white px-3 py-2"
                    />
                    <button
                      onClick={() => handleEnviarPostMV(r.id)}
                      className="px-3 py-2 bg-[#FFD300] text-black rounded-lg active:scale-90 transition-transform"
                    >
                      <Send size="0.75rem" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {isEmpty && isFirstLoad ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <TicketCardSkeleton key={i} />
          ))}
        </div>
      ) : isEmpty ? (
        <EmptyState
          icon={activeTab === 'UPCOMING' ? Ticket : Calendar}
          title={activeTab === 'UPCOMING' ? 'A noite te espera' : 'Nenhum histórico'}
          subtitle={
            activeTab === 'UPCOMING'
              ? 'Quando garantir seu ingresso, ele aparece aqui.'
              : 'Seus eventos passados aparecerão aqui.'
          }
        />
      ) : (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* ── UPCOMING: um card por evento (agrupado) ── */}
          {activeTab === 'UPCOMING' && groupedUpcoming.length > 0 && (
            <div>
              <h2 style={TYPOGRAPHY.uiLabel} className="mb-4 text-[#FFD300]/80">
                Ingressos
              </h2>
              <div className="space-y-3">
                {groupedUpcoming.map(grupo => {
                  const count = grupo.tickets.length;
                  const temCortesia = grupo.tickets.some(t => t.tipo === 'CORTESIA');
                  const temRegular = grupo.tickets.some(t => t.tipo !== 'CORTESIA');

                  return (
                    <button
                      key={grupo.eventoId}
                      onClick={() => setCarouselGrupo(grupo)}
                      className="w-full flex items-center gap-4 p-4 bg-zinc-900/40 border border-white/5 rounded-2xl active:border-purple-500/20 active:bg-purple-500/5 transition-all text-left"
                    >
                      {/* Capa */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-white/5">
                        {grupo.imagem ? (
                          <img
                            loading="lazy"
                            src={grupo.imagem}
                            alt={grupo.titulo}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Ticket size="1.25rem" className="text-zinc-700" />
                          </div>
                        )}
                      </div>

                      {/* Dados */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm leading-tight truncate mb-1">{grupo.titulo}</p>
                        <p className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-widest">
                          {grupo.data}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          {count > 1 && (
                            <span className="text-[0.5rem] font-black px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/25 text-purple-300">
                              x{count} ingressos
                            </span>
                          )}
                          {temCortesia && (
                            <span className="text-[0.5rem] font-black px-2 py-0.5 rounded-full bg-[#FFD300]/10 border border-[#FFD300]/20 text-[#FFD300] flex items-center gap-1">
                              <Gift size="0.5rem" /> Cortesia
                            </span>
                          )}
                          {temRegular && count === 1 && !temCortesia && (
                            <span className="text-[0.5rem] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                              Ativo
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronRight size="1rem" className="text-zinc-400 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'UPCOMING' && upcoming.presencas.length > 0 && (
            <PresencaList events={upcoming.presencas} isPast={false} />
          )}

          {/* ── PAST: lista plana com overlay "UTILIZADO" ── */}
          {activeTab === 'PAST' && past.tickets.length > 0 && (
            <TicketList tickets={past.tickets} onSelectTicket={() => {}} isPast={true} />
          )}
          {activeTab === 'PAST' && past.presencas.length > 0 && <PresencaList events={past.presencas} isPast={true} />}
        </div>
      )}
    </div>
  );
};
