/**
 * MyTicketsView — Carteira Digital de Ingressos.
 *
 * Busca ingressos do usuário via vantaService.getMyTickets(userId).
 * Supabase: tickets_caixa WHERE owner_id = userId JOIN eventos_admin.
 *
 * Cards de status:
 *   DISPONIVEL — borda verde + badge "Disponível"
 *   USADO      — borda zinc + badge "Utilizado" (cinza)
 *
 * Ao clicar num card → abre modal com QR Code anti-print.
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, QrCode, Sparkles, Clock, Ticket, RefreshCw, User, Check, Loader2 } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { vantaService } from '../../../services/vantaService';
import { MyTicket } from '../../admin/services/IVantaService';
import { fmtBRL } from '../../../utils';

const fmtDate = (iso: string) => {
  try {
    return new Date(iso)
      .toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
      .toUpperCase();
  } catch {
    return iso;
  }
};

// ── Formatador de CPF ────────────────────────────────────────────────────────
const formatCPF = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

// ── Modal de Titular (Nome + CPF) ────────────────────────────────────────────
const TitularModalMyTickets: React.FC<{
  ticket: MyTicket;
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
            {ticket.variacaoLabel ? `${ticket.eventoNome} · ${ticket.variacaoLabel}` : ticket.eventoNome}
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

// ── Modal de QR Code ──────────────────────────────────────────────────────────
const QRModal: React.FC<{ ticket: MyTicket; onClose: () => void }> = ({ ticket, onClose }) => {
  const [qrNonce, setQrNonce] = useState(() => Math.random().toString(36).slice(2, 8).toUpperCase());
  const [clockTime, setClockTime] = useState(() =>
    new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  );

  useEffect(() => {
    const nonceId = setInterval(() => setQrNonce(Math.random().toString(36).slice(2, 8).toUpperCase()), 30_000);
    const clockId = setInterval(
      () =>
        setClockTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })),
      1_000,
    );
    return () => {
      clearInterval(nonceId);
      clearInterval(clockId);
    };
  }, []);

  const isUsado = ticket.status === 'USADO';

  return (
    <div
      className="absolute inset-0 z-[300] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <style>{`
        @keyframes shimmerTicket {
          0%   { transform: translateX(-100%) rotate(15deg); }
          100% { transform: translateX(250%) rotate(15deg); }
        }
      `}</style>
      <div
        className="w-full max-w-[300px] rounded-3xl p-px animate-in zoom-in-95 duration-200"
        style={{
          background: isUsado
            ? 'linear-gradient(135deg, #3f3f46, #52525b)'
            : 'linear-gradient(135deg, #FFD300 0%, #ff9500 100%)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-zinc-950 rounded-[calc(1.5rem-1px)] overflow-hidden">
          <div className="px-6 pt-6 pb-4 flex flex-col items-center text-center">
            <p className="text-[8px] font-black uppercase tracking-[0.35em] text-zinc-400 mb-5">
              {isUsado ? 'Ingresso Utilizado' : 'Ingresso Disponível'}
            </p>

            {/* QR anti-print */}
            <div
              className={`relative w-36 h-36 rounded-2xl flex items-center justify-center border border-white/5 mb-3 overflow-hidden ${isUsado ? 'bg-zinc-900/50' : 'bg-zinc-900'}`}
            >
              <QrCode size={96} className={isUsado ? 'text-zinc-600' : 'text-zinc-300'} strokeWidth={1.2} />
              <div
                className={`absolute w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center border ${isUsado ? 'border-zinc-700' : 'border-[#FFD300]/30'}`}
              >
                <Sparkles size={18} className={isUsado ? 'text-zinc-600' : 'text-[#FFD300]'} />
              </div>
              {!isUsado && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(105deg, transparent 30%, rgba(255,211,0,0.22) 50%, transparent 70%)',
                    animation: 'shimmerTicket 2.4s ease-in-out infinite',
                  }}
                />
              )}
              <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 opacity-35">
                <Clock size={7} className={isUsado ? 'text-zinc-500' : 'text-[#FFD300]'} />
                <span className={`text-[6px] font-black tabular-nums ${isUsado ? 'text-zinc-500' : 'text-[#FFD300]'}`}>
                  {clockTime}
                </span>
              </div>
              {isUsado && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 rotate-[-20deg] border border-zinc-600 px-2 py-1 rounded">
                    Utilizado
                  </span>
                </div>
              )}
            </div>

            {/* Nonce anti-screenshot */}
            <p className="text-[7px] font-black text-zinc-600 uppercase tracking-[0.25em] mb-3">#{qrNonce}</p>

            <p className="text-white font-black text-sm leading-none">{ticket.variacaoLabel}</p>
            <p
              className={`font-black text-lg mt-1 ${isUsado ? 'text-zinc-500' : ''}`}
              style={
                isUsado
                  ? {}
                  : {
                      background: 'linear-gradient(135deg, #FFD300, #ff9500)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }
              }
            >
              {fmtBRL(ticket.valor)}
            </p>
            <p className="text-zinc-500 text-[10px] mt-1 truncate max-w-full">{ticket.email}</p>
            <p className="text-zinc-700 text-[8px] font-black uppercase tracking-widest mt-1 truncate max-w-full">
              {ticket.eventoNome}
            </p>
          </div>

          {/* Separador */}
          <div className="relative flex items-center px-4">
            <div className="w-5 h-5 rounded-full bg-black shrink-0 -ml-4 border-r border-white/5" />
            <div className="flex-1 border-t border-dashed border-white/10 mx-1" />
            <div className="w-5 h-5 rounded-full bg-black shrink-0 -mr-4 border-l border-white/5" />
          </div>

          {/* Rodapé */}
          <div className="px-6 py-4 text-center space-y-1">
            {isUsado && ticket.usadoEm ? (
              <p className="text-zinc-600 text-[9px]">Utilizado em {fmtDate(ticket.usadoEm)}</p>
            ) : (
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border"
                style={{ background: 'rgba(255,211,0,0.08)', borderColor: 'rgba(255,211,0,0.25)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-emerald-400">Válido</span>
              </div>
            )}
            <p className="text-zinc-800 text-[7px] font-black tracking-widest">{ticket.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── View principal ─────────────────────────────────────────────────────────────
export const MyTicketsView: React.FC<{
  userId: string;
  onBack: () => void;
}> = ({ userId, onBack }) => {
  const [tickets, setTickets] = useState<MyTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<MyTicket | null>(null);
  const [titularTarget, setTitularTarget] = useState<MyTicket | null>(null);

  const load = async () => {
    setLoading(true);
    const data = await vantaService.getMyTickets(userId).catch(() => []);
    setTickets(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const disponíveis = tickets.filter(t => t.status === 'DISPONIVEL');
  const utilizados = tickets.filter(t => t.status === 'USADO');

  const needsTitular = (t: MyTicket) => !t.nomeTitular?.trim() || !t.cpf?.trim();

  const handleTicketClick = (t: MyTicket) => {
    if (t.status === 'DISPONIVEL' && needsTitular(t)) {
      setTitularTarget(t);
    } else {
      setSelectedTicket(t);
    }
  };

  const handleSaveTitular = async (nome: string, cpf: string) => {
    if (!titularTarget) return;
    const res = await vantaService.updateTicketTitular(titularTarget.id, nome, cpf);
    if (!res.ok) throw new Error(res.erro ?? 'Erro');
    setTickets(prev => prev.map(t => (t.id === titularTarget.id ? { ...t, nomeTitular: nome, cpf } : t)));
    setTitularTarget(null);
  };

  return (
    <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-8 pb-5 shrink-0 flex justify-between items-start">
        <div>
          <p style={TYPOGRAPHY.sectionKicker} className="mb-1.5">
            Carteira
          </p>
          <h1 style={TYPOGRAPHY.screenTitle} className="text-xl italic">
            Meus Ingressos
          </h1>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={load}
            className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
          >
            <RefreshCw size={15} className={`text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onBack}
            className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
          >
            <ArrowLeft size={18} className="text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw size={24} className="text-zinc-700 animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center">
              <Ticket size={28} className="text-zinc-700" />
            </div>
            <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest text-center">
              Nenhum ingresso
            </p>
            <p className="text-zinc-800 text-[9px] text-center leading-relaxed">
              Seus ingressos comprados aparecerão aqui.
            </p>
          </div>
        ) : (
          <>
            {/* Disponíveis */}
            {disponíveis.length > 0 && (
              <div>
                <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-3 px-1">
                  Disponíveis ({disponíveis.length})
                </p>
                <div className="space-y-2">
                  {disponíveis.map(t => (
                    <button
                      key={t.id}
                      onClick={() => handleTicketClick(t)}
                      className="w-full flex items-center gap-4 p-4 bg-zinc-900/40 border border-emerald-500/20 rounded-2xl active:bg-emerald-500/5 transition-all text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <QrCode size={18} className="text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm truncate">{t.eventoNome}</p>
                        <p className="text-zinc-500 text-[10px] truncate">
                          {t.variacaoLabel} · {fmtBRL(t.valor)}
                        </p>
                        <p className="text-zinc-700 text-[9px]">{fmtDate(t.eventoDataInicio)}</p>
                      </div>
                      <span
                        className={`shrink-0 text-[7px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                          needsTitular(t) ? 'bg-[#FFD300]/15 text-[#FFD300]' : 'bg-emerald-500/15 text-emerald-400'
                        }`}
                      >
                        {needsTitular(t) ? 'Preencher' : 'Disponível'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Utilizados */}
            {utilizados.length > 0 && (
              <div>
                <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-3 px-1">
                  Utilizados ({utilizados.length})
                </p>
                <div className="space-y-2">
                  {utilizados.map(t => (
                    <button
                      key={t.id}
                      onClick={() => handleTicketClick(t)}
                      className="w-full flex items-center gap-4 p-4 bg-zinc-900/20 border border-white/5 rounded-2xl active:bg-white/5 transition-all text-left opacity-60"
                    >
                      <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0">
                        <QrCode size={18} className="text-zinc-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-zinc-400 font-bold text-sm truncate">{t.eventoNome}</p>
                        <p className="text-zinc-600 text-[10px] truncate">
                          {t.variacaoLabel} · {fmtBRL(t.valor)}
                        </p>
                        <p className="text-zinc-700 text-[9px]">{fmtDate(t.eventoDataInicio)}</p>
                      </div>
                      <span className="shrink-0 text-[7px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-zinc-800 text-zinc-500">
                        Utilizado
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de QR */}
      {selectedTicket && <QRModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />}
      {/* Modal de Titular */}
      {titularTarget && (
        <TitularModalMyTickets
          ticket={titularTarget}
          onSave={handleSaveTitular}
          onClose={() => setTitularTarget(null)}
        />
      )}
    </div>
  );
};
