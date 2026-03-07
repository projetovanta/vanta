import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ArrowLeft, Users, MoreHorizontal, X, Mail, UserPen, Trash2, AlertTriangle, Download } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { eventosAdminService, TicketCaixa } from '../services/eventosAdminService';

type ModalType = 'TITULAR' | 'CANCELAR' | null;

const STATUS_STYLE: Record<TicketCaixa['status'], { label: string; cls: string }> = {
  DISPONIVEL: { label: 'Disponível', cls: 'bg-emerald-500/15 text-emerald-400' },
  USADO: { label: 'Usado', cls: 'bg-zinc-700/40 text-zinc-500' },
  CANCELADO: { label: 'Cancelado', cls: 'bg-red-500/15 text-red-400' },
  REEMBOLSADO: { label: 'Reembolsado', cls: 'bg-orange-500/15 text-orange-400' },
};

export const ParticipantesView: React.FC<{
  onBack: () => void;
  eventoId: string;
  eventoNome: string;
  addNotification?: (n: { tipo: 'sucesso' | 'erro' | 'info'; titulo: string; mensagem?: string }) => void;
}> = ({ onBack, eventoId, eventoNome, addNotification }) => {
  const [svcVersion, setSvcVersion] = useState(() => eventosAdminService.getVersion());

  useEffect(() => {
    const id = setInterval(() => setSvcVersion(eventosAdminService.getVersion()), 2_000);
    return () => clearInterval(id);
  }, []);

  const tickets = useMemo(
    () => eventosAdminService.getTicketsCaixaByEvento(eventoId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [eventoId, svcVersion],
  );

  // Controle de menu e modais
  const exportCSV = useCallback(() => {
    if (tickets.length === 0) return;
    const header = 'Nome,Email,CPF,Variação,Valor,Status,Emitido Em\n';
    const rows = tickets
      .map(
        t =>
          `"${(t.nomeTitular ?? '').replace(/"/g, '""')}","${t.email}","${(t.cpf ?? '').replace(/"/g, '""')}","${t.variacaoLabel}",${t.valor},${t.status},"${t.emitidoEm}"`,
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `participantes_${eventoId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [tickets, eventoId]);

  const [menuTicketId, setMenuTicketId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);

  // Campos do modal Titular
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');

  const openMenu = (id: string) => setMenuTicketId(prev => (prev === id ? null : id));

  const openTitular = (ticket: TicketCaixa) => {
    setActiveTicketId(ticket.id);
    setNome(ticket.nomeTitular ?? '');
    setEmail(ticket.email);
    setMenuTicketId(null);
    setModalType('TITULAR');
  };

  const openCancelar = (ticketId: string) => {
    setActiveTicketId(ticketId);
    setMenuTicketId(null);
    setModalType('CANCELAR');
  };

  const closeModal = () => {
    setModalType(null);
    setActiveTicketId(null);
    setNome('');
    setEmail('');
  };

  const handleReenviar = (ticket: TicketCaixa) => {
    setMenuTicketId(null);
    const ok = eventosAdminService.reenviarIngresso(ticket.id);
    if (ok) {
      addNotification?.({
        tipo: 'sucesso',
        titulo: 'E-mail reenviado',
        mensagem: `Ingresso enviado para ${ticket.email}`,
      });
    }
  };

  const handleSalvarTitular = () => {
    if (!activeTicketId) return;
    const ok = eventosAdminService.editarTitular(activeTicketId, nome, email);
    if (ok) {
      addNotification?.({ tipo: 'sucesso', titulo: 'Titular atualizado' });
      setSvcVersion(eventosAdminService.getVersion());
    }
    closeModal();
  };

  const handleCancelar = () => {
    if (!activeTicketId) return;
    const ok = eventosAdminService.cancelarIngresso(activeTicketId);
    if (ok) {
      addNotification?.({ tipo: 'sucesso', titulo: 'Ingresso cancelado', mensagem: 'Estoque devolvido ao lote.' });
      setSvcVersion(eventosAdminService.getVersion());
    }
    closeModal();
  };

  return (
    <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-8 pb-5 shrink-0">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1 mr-3">
            <p style={TYPOGRAPHY.sectionKicker} className="mb-1.5">
              Operacional
            </p>
            <h1 style={TYPOGRAPHY.screenTitle} className="text-xl italic truncate">
              Participantes
            </h1>
            <p className="text-zinc-600 text-[9px] truncate mt-0.5">{eventoNome}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0 mt-1">
            {tickets.length > 0 && (
              <button
                onClick={exportCSV}
                className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
              >
                <Download size={16} className="text-zinc-400" />
              </button>
            )}
            <button
              onClick={onBack}
              className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
            >
              <ArrowLeft size={18} className="text-zinc-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2 max-w-3xl mx-auto w-full">
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center">
              <Users size={28} className="text-zinc-700" />
            </div>
            <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest text-center">
              Nenhum ingresso emitido
            </p>
          </div>
        ) : (
          tickets.map(ticket => {
            const st = STATUS_STYLE[ticket.status];
            const isMenuOpen = menuTicketId === ticket.id;
            return (
              <div key={ticket.id} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-white text-sm font-bold truncate">
                        {ticket.nomeTitular || ticket.email}
                      </span>
                      <span
                        className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full shrink-0 ${st.cls}`}
                      >
                        {st.label}
                      </span>
                    </div>
                    {ticket.nomeTitular && <p className="text-zinc-500 text-[9px] truncate mb-0.5">{ticket.email}</p>}
                    <p className="text-zinc-600 text-[9px] truncate">
                      {ticket.variacaoLabel} · R$ {ticket.valor}
                    </p>
                    <p className="text-zinc-700 text-[8px] mt-0.5">
                      {new Date(ticket.emitidoEm).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {ticket.status !== 'CANCELADO' && (
                    <button
                      onClick={() => openMenu(ticket.id)}
                      className="w-8 h-8 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center active:scale-90 transition-all shrink-0"
                    >
                      <MoreHorizontal size={14} className="text-zinc-400" />
                    </button>
                  )}
                </div>

                {/* Menu inline */}
                {isMenuOpen && (
                  <div className="mt-3 pt-3 border-t border-white/5 flex flex-col gap-1">
                    <button
                      onClick={() => openTitular(ticket)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-zinc-800/60 active:bg-zinc-700/60 transition-all text-left"
                    >
                      <UserPen size={14} className="text-zinc-400 shrink-0" />
                      <span className="text-zinc-300 text-xs">Trocar Titular</span>
                    </button>
                    <button
                      onClick={() => handleReenviar(ticket)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-zinc-800/60 active:bg-zinc-700/60 transition-all text-left"
                    >
                      <Mail size={14} className="text-zinc-400 shrink-0" />
                      <span className="text-zinc-300 text-xs">Reenviar E-mail</span>
                    </button>
                    <button
                      onClick={() => openCancelar(ticket.id)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-red-500/10 active:bg-red-500/20 transition-all text-left"
                    >
                      <Trash2 size={14} className="text-red-400 shrink-0" />
                      <span className="text-red-400 text-xs">Cancelar Ingresso</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Trocar Titular */}
      {modalType === 'TITULAR' && (
        <div className="absolute inset-0 z-[200] bg-black/80 flex items-end">
          <div
            className="w-full bg-[#111] border-t border-white/10 rounded-t-3xl p-6"
            style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 2rem))' }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <p style={TYPOGRAPHY.sectionKicker} className="mb-0.5">
                  Operacional
                </p>
                <h2 className="text-white font-bold text-base">Trocar Titular</h2>
              </div>
              <button
                onClick={closeModal}
                className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center active:scale-90 transition-all"
              >
                <X size={16} className="text-zinc-400" />
              </button>
            </div>

            <div className="space-y-3 mb-5">
              <div>
                <label className="text-zinc-500 text-[9px] font-black uppercase tracking-widest block mb-1.5">
                  Nome do Titular
                </label>
                <input
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Nome completo"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-700 focus:outline-none focus:border-[#FFD300]/30"
                />
              </div>
              <div>
                <label className="text-zinc-500 text-[9px] font-black uppercase tracking-widest block mb-1.5">
                  E-mail
                </label>
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  type="email"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-700 focus:outline-none focus:border-[#FFD300]/30"
                />
              </div>
            </div>

            <button
              onClick={handleSalvarTitular}
              disabled={!nome.trim() && !email.trim()}
              className="w-full py-4 bg-[#FFD300] rounded-2xl text-black text-sm font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-40"
            >
              Salvar
            </button>
          </div>
        </div>
      )}

      {/* Modal Cancelar */}
      {modalType === 'CANCELAR' && (
        <div className="absolute inset-0 z-[200] bg-black/80 flex items-end">
          <div
            className="w-full bg-[#111] border-t border-white/10 rounded-t-3xl p-6"
            style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 2rem))' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-red-400" />
              </div>
              <div>
                <p style={TYPOGRAPHY.sectionKicker} className="mb-0.5">
                  Atenção
                </p>
                <h2 className="text-white font-bold text-base">Cancelar Ingresso</h2>
              </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-5">
              <p className="text-red-300 text-xs leading-relaxed">
                Esta ação é <strong>irreversível</strong>. Sem cancelamento parcial — o ingresso inteiro será anulado e
                o estoque devolvido ao lote.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 py-4 bg-zinc-800 rounded-2xl text-zinc-300 text-sm font-bold active:scale-95 transition-all"
              >
                Voltar
              </button>
              <button
                onClick={handleCancelar}
                className="flex-1 py-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-400 text-sm font-black uppercase tracking-widest active:scale-95 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
