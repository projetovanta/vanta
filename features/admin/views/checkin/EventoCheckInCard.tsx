import React, { useState, useEffect } from 'react';
import { QrCode, ChevronRight, List } from 'lucide-react';
import { eventosAdminService, TicketCaixa } from '../../services/eventosAdminService';

export const EventoCheckInCard: React.FC<{
  ev: { id: string; nome: string; dataInicio: string; dataFim: string; local: string };
  svcVersion: number;
  onSelect: (id: string) => void;
  modoFixo?: 'LISTA' | 'QR';
}> = ({ ev, svcVersion, onSelect, modoFixo }) => {
  const [evTickets, setEvTickets] = useState<TicketCaixa[]>([]);

  useEffect(() => {
    eventosAdminService.getTicketsCaixaByEvento(ev.id).then(setEvTickets);
  }, [ev.id, svcVersion]);

  const now = new Date();
  const inicio = new Date(ev.dataInicio);
  const fim = new Date(ev.dataFim);
  const antesDoInicio = now < inicio;
  const depoisDoFim = now > fim;
  const bloqueado = antesDoInicio || depoisDoFim;

  const usados = evTickets.filter(t => t.status === 'USADO').length;
  const total = evTickets.length;
  const aguardando = total - usados;
  const pct = total > 0 ? Math.round((usados / total) * 100) : 0;
  const dataLabel = new Date(ev.dataInicio)
    .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    .toUpperCase();

  return (
    <button
      onClick={() => {
        if (!bloqueado) onSelect(ev.id);
      }}
      disabled={bloqueado}
      className={`w-full text-left rounded-3xl overflow-hidden bg-zinc-900/30 border border-white/5 transition-all ${bloqueado ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.98]'}`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0 mr-4">
            <p className="text-[#FFD300] text-[8px] font-black uppercase tracking-[0.3em] mb-0.5">{dataLabel}</p>
            <p className="text-white font-black text-xl italic leading-tight truncate">{ev.nome}</p>
            <p className="text-zinc-500 text-[10px] mt-1 truncate">{ev.local}</p>
            {antesDoInicio && (
              <span className="inline-block mt-1.5 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                Aguardando início
              </span>
            )}
            {depoisDoFim && (
              <span className="inline-block mt-1.5 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-zinc-800 border border-white/5 text-zinc-500">
                Encerrado
              </span>
            )}
          </div>
          <div
            className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 ${
              usados > 0 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-zinc-900 border border-white/5'
            }`}
          >
            <p className={`font-black text-2xl leading-none ${usados > 0 ? 'text-emerald-400' : 'text-zinc-600'}`}>
              {usados}
            </p>
            <p
              className={`text-[7px] font-black uppercase tracking-wider ${usados > 0 ? 'text-emerald-700' : 'text-zinc-700'}`}
            >
              in
            </p>
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

        <div className="flex items-stretch">
          <div className="flex-1 text-center py-1">
            <p className={`font-black text-xl leading-none ${usados > 0 ? 'text-emerald-400' : 'text-zinc-600'}`}>
              {usados}
            </p>
            <p className="text-zinc-600 text-[8px] font-black uppercase tracking-widest mt-1">Entraram</p>
          </div>
          <div className="w-px bg-zinc-800" />
          <div className="flex-1 text-center py-1">
            <p className="text-zinc-300 font-black text-xl leading-none">{aguardando}</p>
            <p className="text-zinc-600 text-[8px] font-black uppercase tracking-widest mt-1">Aguardam</p>
          </div>
          <div className="w-px bg-zinc-800" />
          <div className="flex-1 text-center py-1">
            <p className="text-zinc-500 font-black text-xl leading-none">{total}</p>
            <p className="text-zinc-600 text-[8px] font-black uppercase tracking-widest mt-1">Total</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-3 bg-zinc-900/50 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {(!modoFixo || modoFixo === 'LISTA') && (
            <div className="flex items-center gap-1">
              <List size={10} className="text-zinc-600" />
              <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">Lista</p>
            </div>
          )}
          {!modoFixo && <span className="w-1 h-1 rounded-full bg-zinc-700" />}
          {(!modoFixo || modoFixo === 'QR') && (
            <div className="flex items-center gap-1">
              <QrCode size={10} className="text-zinc-600" />
              <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">QR Code</p>
            </div>
          )}
        </div>
        <ChevronRight size={14} className="text-zinc-600" />
      </div>
    </button>
  );
};
