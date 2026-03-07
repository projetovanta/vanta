import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Sparkles,
  ArrowRightLeft,
  RotateCcw,
  Gift,
  X,
  Check,
  User,
  Loader2,
  Shield,
  Lock,
  Clock,
  RotateCcw as ReembolsoIcon,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Ingresso, Membro } from '../../../types';
import { TYPOGRAPHY } from '../../../constants';
import { authService } from '../../../services/authService';
import { signTicketToken } from '../../../features/admin/services/jwtService';
import { TicketQRModal } from './TicketQRModal';
import {
  podeReembolsoAutomatico,
  solicitarReembolsoAutomatico,
} from '../../../features/admin/services/reembolsoService';

export interface EventoGroup {
  eventoId: string;
  titulo: string;
  data: string;
  imagem?: string;
  tickets: Ingresso[];
}

interface Props {
  grupo: EventoGroup;
  onBack: () => void;
  onTransferirIngresso?: (ticket: Ingresso, destinatarioId: string, destinatarioNome: string) => void;
  onDevolverCortesia?: (ticket: Ingresso) => void;
  onUpdateTitular?: (ticketId: string, nome: string, cpf: string) => Promise<boolean>;
  userId?: string;
  onReembolsoSucesso?: () => void;
}

// ── Modal de Reembolso ──────────────────────────────────────────────────────────
const ReembolsoModal: React.FC<{
  ticket: Ingresso;
  userId: string;
  onConfirmar: () => void;
  onClose: () => void;
}> = ({ ticket, userId, onConfirmar, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [elegibilidade, setElegibilidade] = useState<{ pode: boolean; motivo?: string } | null>(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const validar = async () => {
      const result = await podeReembolsoAutomatico(ticket.id, ticket.eventoId);
      setElegibilidade(result);
    };
    validar();
  }, [ticket.id, ticket.eventoId]);

  const handleConfirmar = async () => {
    if (!elegibilidade?.pode || loading) return;
    setLoading(true);
    setErro('');
    try {
      const result = await solicitarReembolsoAutomatico(ticket.id, ticket.eventoId, userId);
      if (result.success) {
        onConfirmar();
      } else {
        setErro(result.error || 'Erro ao processar reembolso');
      }
    } catch (e) {
      setErro('Erro ao processar reembolso');
    }
    setLoading(false);
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

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
            <ReembolsoIcon size={18} className="text-orange-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-zinc-600 text-[8px] font-black uppercase tracking-widest">Solicitar Reembolso</p>
            <p className="text-white font-bold text-base mt-0.5 truncate">{ticket.tituloEvento}</p>
            {ticket.variacaoLabel && <p className="text-zinc-500 text-xs mt-0.5">{ticket.variacaoLabel}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 text-zinc-600 active:text-white transition-colors">
            <X size={14} />
          </button>
        </div>

        {elegibilidade && !elegibilidade.pode && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 space-y-2">
            <p className="text-red-400 font-bold text-sm">Não elegível para reembolso automático</p>
            <p className="text-zinc-400 text-[9px]">{elegibilidade.motivo}</p>
            <p className="text-zinc-600 text-[9px] mt-3">
              Entre em contato com o produtor se você acha que isso é um erro.
            </p>
          </div>
        )}

        {elegibilidade?.pode && (
          <>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 space-y-2">
              <p className="text-emerald-400 font-bold text-sm">Você está elegível para reembolso</p>
              <p className="text-zinc-400 text-[9px]">
                Direito de arrependimento (CDC Art. 49) — você tem 7 dias a partir da compra e no mínimo 48h antes do
                evento.
              </p>
            </div>

            {erro && <p className="text-red-400 text-[10px] font-black uppercase tracking-widest">{erro}</p>}

            <button
              onClick={handleConfirmar}
              disabled={loading}
              className="w-full py-4 bg-orange-500 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Processando...
                </>
              ) : (
                <>
                  <Check size={14} /> Solicitar Reembolso
                </>
              )}
            </button>
          </>
        )}

        {!elegibilidade && (
          <div className="flex justify-center py-4">
            <div className="w-4 h-4 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};

// ── Modal de transferência ────────────────────────────────────────────────────
const TransferirModal: React.FC<{
  ticket: Ingresso;
  onConfirmar: (destinatarioId: string, destinatarioNome: string) => void;
  onClose: () => void;
}> = ({ ticket, onConfirmar, onClose }) => {
  const [query, setQuery] = useState('');
  const [destinatario, setDest] = useState<Membro | null>(null);

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
        console.error('[EventTicketsCarousel] busca:', err);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

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
            <p className="text-zinc-600 text-[8px] font-black uppercase tracking-widest">Transferir Ingresso</p>
            <p className="text-white font-bold text-base mt-0.5 truncate">{ticket.tituloEvento}</p>
            {ticket.variacaoLabel && <p className="text-zinc-500 text-xs mt-0.5">{ticket.variacaoLabel}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 text-zinc-600 active:text-white transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-zinc-600 text-[8px] font-black uppercase tracking-widest">Para quem?</p>
          <input
            type="text"
            placeholder="Buscar membro por nome..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setDest(null);
            }}
            className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700"
            autoFocus
          />
          {resultados.length > 0 && !destinatario && (
            <div className="bg-zinc-900 border border-white/5 rounded-xl overflow-hidden">
              {resultados.map(m => (
                <button
                  key={m.id}
                  onClick={() => {
                    setDest(m);
                    setQuery(m.nome);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 active:bg-zinc-800 transition-colors border-b border-white/5 last:border-0"
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
              <Check size={14} className="text-[#FFD300] shrink-0" />
            </div>
          )}
        </div>

        <button
          onClick={() => destinatario && onConfirmar(destinatario.id, destinatario.nome)}
          disabled={!destinatario}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] text-white active:scale-95 transition-all disabled:opacity-30 disabled:scale-100"
        >
          Transferir Ingresso
        </button>
        <p className="text-center text-zinc-700 text-[8px]">
          Após a transferência, o ingresso sai da sua carteira permanentemente.
        </p>
      </div>
    </div>
  );
};

// ── Modal Nome/CPF ──────────────────────────────────────────────────────────
const formatCPF = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

const TitularModal: React.FC<{
  ticket: Ingresso;
  onSave: (nome: string, cpf: string) => Promise<void>;
  onClose: () => void;
}> = ({ ticket, onSave, onClose }) => {
  const [nome, setNome] = useState(ticket.nomeTitular ?? '');
  const [cpf, setCpf] = useState(ticket.cpf ?? '');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const cpfDigits = cpf.replace(/\D/g, '');
  const valid = nome.trim().length >= 3 && cpfDigits.length === 11;

  const handleSave = async () => {
    if (!valid) return;
    setLoading(true);
    setErro('');
    try {
      await onSave(nome.trim(), cpfDigits);
    } catch {
      setErro('Erro ao salvar. Tente novamente.');
    }
    setLoading(false);
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

        <div>
          <p className="text-zinc-600 text-[8px] font-black uppercase tracking-widest">Dados do Titular</p>
          <p className="text-white font-bold text-base mt-0.5">Preencha para usar o ingresso</p>
          <p className="text-zinc-500 text-xs mt-1">
            {ticket.variacaoLabel ? `${ticket.tituloEvento} · ${ticket.variacaoLabel}` : ticket.tituloEvento}
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-1.5">Nome completo</p>
            <input
              type="text"
              placeholder="Nome do titular do ingresso"
              value={nome}
              onChange={e => setNome(e.target.value)}
              className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700"
              autoFocus
            />
          </div>
          <div>
            <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-1.5">CPF</p>
            <input
              type="text"
              inputMode="numeric"
              placeholder="000.000.000-00"
              value={formatCPF(cpf)}
              onChange={e => setCpf(e.target.value)}
              className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700"
            />
          </div>
          {erro && <p className="text-red-400 text-[10px] font-black uppercase tracking-widest">{erro}</p>}
        </div>

        <button
          onClick={handleSave}
          disabled={!valid || loading}
          className="w-full py-4 bg-[#FFD300] text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-30 disabled:pointer-events-none"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Salvando...
            </>
          ) : (
            <>
              <Check size={14} /> Confirmar Titular
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ── Mini QR dinâmico anti-fraude (renova a cada 15s) ──────────────────────────
const MiniQR: React.FC<{ ticketId: string; accentBorder: string }> = ({ ticketId, accentBorder }) => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      const jwt = await signTicketToken(ticketId);
      if (mounted) setToken(jwt);
    };
    refresh();
    const interval = setInterval(refresh, 15_000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [ticketId]);

  if (!token)
    return (
      <div className="w-full h-full bg-zinc-900 flex items-center justify-center rounded-2xl">
        <div className="w-4 h-4 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="relative w-full h-full bg-white rounded-2xl p-2 flex items-center justify-center">
      <QRCodeSVG value={token} size={112} level="L" bgColor="#FFFFFF" fgColor="#000000" />
      <div
        className="absolute w-8 h-8 bg-zinc-950 rounded-lg flex items-center justify-center border"
        style={{ borderColor: accentBorder }}
      >
        <Shield size={12} className="text-emerald-400" />
      </div>
    </div>
  );
};

// ── Carrossel de ingressos de um evento ───────────────────────────────────────
export const EventTicketsCarousel: React.FC<Props> = ({
  grupo,
  onBack,
  onTransferirIngresso,
  onDevolverCortesia,
  onUpdateTitular,
  userId,
  onReembolsoSucesso,
}) => {
  const { tickets, titulo, data } = grupo;
  const [activeDot, setActiveDot] = useState(0);
  const [activeTicket, setActiveTicket] = useState<Ingresso | null>(null);
  const [transferTarget, setTransfer] = useState<Ingresso | null>(null);
  const [titularTarget, setTitularTarget] = useState<Ingresso | null>(null);
  const [reembolsoTarget, setReembolsoTarget] = useState<Ingresso | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || el.clientWidth === 0) return;
    setActiveDot(Math.round(el.scrollLeft / el.clientWidth));
  };

  const handleConfirmarTransfer = (destinatarioId: string, destinatarioNome: string) => {
    if (!transferTarget) return;
    onTransferirIngresso?.(transferTarget, destinatarioId, destinatarioNome);
    setTransfer(null);
    onBack();
  };

  const needsTitular = (t: Ingresso) => !t.nomeTitular?.trim() || !t.cpf?.trim();

  // Verifica se o ingresso está na janela de validade (entre início e fim do evento)
  const isForaDaJanela = (t: Ingresso): 'ANTES' | 'DEPOIS' | null => {
    const now = new Date();
    if (t.eventoDataInicioISO && new Date(t.eventoDataInicioISO) > now) return 'ANTES';
    if (t.eventoDataFimISO && new Date(t.eventoDataFimISO) < now) return 'DEPOIS';
    return null;
  };

  const handleQRPress = (ticket: Ingresso) => {
    const janela = isForaDaJanela(ticket);
    if (janela) return; // Não abre QR fora da janela
    if (needsTitular(ticket)) {
      setTitularTarget(ticket);
    } else {
      setActiveTicket(ticket);
    }
  };

  const handleSaveTitular = async (nome: string, cpf: string) => {
    if (!titularTarget) return;
    if (onUpdateTitular) {
      const ok = await onUpdateTitular(titularTarget.id, nome, cpf);
      if (!ok) throw new Error('Falha ao salvar');
    }
    // Atualiza localmente no grupo
    const idx = tickets.findIndex(t => t.id === titularTarget.id);
    if (idx >= 0) {
      tickets[idx] = { ...tickets[idx], nomeTitular: nome, cpf };
    }
    setTitularTarget(null);
  };

  return (
    <div className="min-h-full bg-[#0A0A0A] flex flex-col">
      {/* Header */}
      <div className="px-6 pt-8 pb-5 border-b border-white/5 bg-[#0A0A0A] shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all shrink-0"
          >
            <ArrowLeft size={18} className="text-zinc-400" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-0.5">
              {tickets.length === 1 ? '1 ingresso' : `${tickets.length} ingressos`}
            </p>
            <h1 style={TYPOGRAPHY.screenTitle} className="text-base italic truncate leading-none">
              {titulo}
            </h1>
            <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mt-0.5">{data}</p>
          </div>
        </div>
      </div>

      {/* Carrossel + dots */}
      <div className="flex-1 flex flex-col justify-center py-8">
        {/* Scroll container horizontal */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto no-scrollbar"
          style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
        >
          {tickets.map(ticket => {
            const isCortesia = ticket.tipo === 'CORTESIA';
            const grad = isCortesia
              ? 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)'
              : 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)';
            const accentColor = isCortesia ? '#F59E0B' : '#a78bfa';
            const accentBg = isCortesia ? 'rgba(217,119,6,0.08)' : 'rgba(139,92,246,0.08)';
            const accentBorder = isCortesia ? 'rgba(217,119,6,0.25)' : 'rgba(139,92,246,0.25)';
            const statusLabel =
              ticket.status === 'DISPONIVEL'
                ? 'Disponível'
                : ticket.status === 'USADO'
                  ? 'Utilizado'
                  : ticket.status === 'TRANSFERIDO'
                    ? 'Transferido'
                    : ticket.status === 'EXPIRADO'
                      ? 'Não utilizado'
                      : ticket.status === 'REEMBOLSADO'
                        ? 'Reembolsado'
                        : ticket.status === 'CANCELADO'
                          ? 'Cancelado'
                          : ticket.status;

            return (
              <div
                key={ticket.id}
                className="flex-none w-full flex items-center justify-center px-6"
                style={{ scrollSnapAlign: 'start' }}
              >
                {/* Ticket Neon */}
                <div className="w-full max-w-[300px] rounded-3xl p-px" style={{ background: grad }}>
                  <div className="bg-zinc-950 rounded-[calc(1.5rem-1px)] overflow-hidden">
                    {/* Topo */}
                    <div className="px-6 pt-6 pb-4 flex flex-col items-center text-center">
                      <p
                        className="text-[8px] font-black uppercase tracking-[0.35em] mb-1"
                        style={{ color: accentColor, opacity: 0.7 }}
                      >
                        {isCortesia ? 'Cortesia Digital' : 'Ingresso Digital'}
                      </p>
                      {ticket.isMeiaEntrada && (
                        <span className="inline-block mb-3 text-[7px] font-black uppercase tracking-widest text-cyan-300 bg-cyan-500/20 border border-cyan-400/30 px-2 py-0.5 rounded-full">
                          Meia-entrada
                        </span>
                      )}
                      {!ticket.isMeiaEntrada && <div className="mb-4" />}

                      {/* QR — bloqueado fora da janela início–fim do evento */}
                      {(() => {
                        const janela = isForaDaJanela(ticket);
                        if (janela === 'ANTES')
                          return (
                            <>
                              <div className="relative w-36 h-36 rounded-2xl flex items-center justify-center border border-white/5 mb-3 bg-zinc-900">
                                <div className="flex flex-col items-center gap-2">
                                  <Clock size={28} className="text-zinc-600" />
                                  <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600 px-2 text-center">
                                    Disponível no início do evento
                                  </p>
                                </div>
                              </div>
                              <p className="text-[8px] font-black uppercase tracking-widest text-zinc-700 mb-4">
                                QR liberado no horário de início
                              </p>
                            </>
                          );
                        if (janela === 'DEPOIS' || ticket.status === 'EXPIRADO')
                          return (
                            <>
                              <div className="relative w-36 h-36 rounded-2xl flex items-center justify-center border border-white/5 mb-3 bg-zinc-900">
                                <div className="flex flex-col items-center gap-2">
                                  <Lock size={28} className="text-zinc-700" />
                                  <p className="text-[8px] font-black uppercase tracking-widest text-zinc-700 px-2 text-center">
                                    Evento encerrado
                                  </p>
                                </div>
                              </div>
                              <p className="text-[8px] font-black uppercase tracking-widest text-zinc-700 mb-4">
                                Ingresso expirado
                              </p>
                            </>
                          );
                        return (
                          <>
                            <button
                              onClick={() => handleQRPress(ticket)}
                              className="relative w-36 h-36 rounded-2xl flex items-center justify-center border border-white/5 mb-3 active:scale-95 transition-all overflow-hidden"
                              style={{ background: needsTitular(ticket) ? '#18181b' : '#fff' }}
                            >
                              {needsTitular(ticket) ? (
                                <div className="absolute inset-0 bg-zinc-900/80 rounded-2xl flex flex-col items-center justify-center gap-2 z-10">
                                  <User size={28} className="text-[#FFD300]" />
                                  <p className="text-[8px] font-black uppercase tracking-widest text-[#FFD300]">
                                    Preencher dados
                                  </p>
                                </div>
                              ) : (
                                <MiniQR ticketId={ticket.id} accentBorder={accentBorder} />
                              )}
                            </button>
                            <p className="text-[8px] font-black uppercase tracking-widest text-zinc-700 mb-4">
                              {needsTitular(ticket)
                                ? 'Preencha nome e CPF para usar'
                                : 'Toque para ampliar · Anti-fraude'}
                            </p>
                          </>
                        );
                      })()}

                      <p className="text-white font-black text-base leading-none">
                        {ticket.variacaoLabel ?? (isCortesia ? 'Cortesia' : 'Acesso Geral')}
                      </p>
                      {ticket.nomeTitular?.trim() && (
                        <p className="text-zinc-400 text-[9px] font-bold mt-1 truncate max-w-full">
                          {ticket.nomeTitular}
                        </p>
                      )}
                      <p className="text-zinc-700 text-[8px] font-black uppercase tracking-widest mt-1 truncate max-w-full">
                        {titulo}
                      </p>
                    </div>

                    {/* Separador perfurado */}
                    <div className="relative flex items-center px-4">
                      <div className="w-5 h-5 rounded-full bg-black shrink-0 -ml-4 border-r border-white/5" />
                      <div className="flex-1 border-t border-dashed border-white/10 mx-1" />
                      <div className="w-5 h-5 rounded-full bg-black shrink-0 -mr-4 border-l border-white/5" />
                    </div>

                    {/* Rodapé */}
                    <div className="px-6 py-4 flex flex-col items-center gap-3">
                      <span
                        className="text-[8px] font-black uppercase tracking-[0.3em] px-3 py-1.5 rounded-full border"
                        style={{ background: accentBg, borderColor: accentBorder, color: accentColor }}
                      >
                        {statusLabel}
                      </span>

                      {/* Ações — apenas para ingressos DISPONÍVEIS/Ativos dentro da janela */}
                      {ticket.status !== 'USADO' &&
                        ticket.status !== 'CANCELADO' &&
                        ticket.status !== 'EXPIRADO' &&
                        ticket.status !== 'TRANSFERIDO' &&
                        ticket.status !== 'REEMBOLSADO' &&
                        !isForaDaJanela(ticket) && (
                          <div className="flex gap-2 w-full flex-wrap justify-center">
                            {userId && (
                              <button
                                onClick={() => setReembolsoTarget(ticket)}
                                className="flex-none py-2.5 px-3 bg-orange-950/40 border border-orange-500/20 text-orange-400 rounded-xl text-[9px] font-black uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1.5"
                              >
                                <ReembolsoIcon size={10} /> Reembolsar
                              </button>
                            )}
                            {onTransferirIngresso && (
                              <button
                                onClick={() => setTransfer(ticket)}
                                className="flex-1 py-2.5 bg-purple-950/40 border border-purple-500/20 text-purple-400 rounded-xl text-[9px] font-black uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1.5"
                              >
                                <ArrowRightLeft size={10} /> Transferir
                              </button>
                            )}
                            {isCortesia && onDevolverCortesia && (
                              <button
                                onClick={() => {
                                  onDevolverCortesia(ticket);
                                  onBack();
                                }}
                                className="flex-1 py-2.5 bg-red-950/40 border border-red-500/20 text-red-400 rounded-xl text-[9px] font-black uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1.5"
                              >
                                <RotateCcw size={10} /> Devolver
                              </button>
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dots de paginação */}
        {tickets.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {tickets.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === activeDot ? '20px' : '6px',
                  height: '6px',
                  background: i === activeDot ? '#FFD300' : 'rgba(255,255,255,0.15)',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {activeTicket && <TicketQRModal ticket={activeTicket} onClose={() => setActiveTicket(null)} />}
      {transferTarget && (
        <TransferirModal
          ticket={transferTarget}
          onConfirmar={handleConfirmarTransfer}
          onClose={() => setTransfer(null)}
        />
      )}
      {titularTarget && (
        <TitularModal ticket={titularTarget} onSave={handleSaveTitular} onClose={() => setTitularTarget(null)} />
      )}
      {reembolsoTarget && userId && (
        <ReembolsoModal
          ticket={reembolsoTarget}
          userId={userId}
          onConfirmar={() => {
            setReembolsoTarget(null);
            onReembolsoSucesso?.();
            onBack();
          }}
          onClose={() => setReembolsoTarget(null)}
        />
      )}
    </div>
  );
};
