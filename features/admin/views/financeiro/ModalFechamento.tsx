import React from 'react';
import { Check, Flag, X } from 'lucide-react';
import { fmtBRL } from '../../../../utils';
import { useModalBack } from '../../../../hooks/useModalStack';

interface Props {
  eventoNome: string;
  checkinsEvento: number;
  receitaBrutaEvento: number;
  saldoTransferir: number;
  onClose: () => void;
  onEncerrar: () => void;
}

export const ModalFechamento: React.FC<Props> = ({
  eventoNome,
  checkinsEvento,
  receitaBrutaEvento,
  saldoTransferir,
  onClose,
  onEncerrar,
}) => {
  useModalBack(true, onClose, 'modal-fechamento');
  return (
    <div
      className="absolute inset-0 z-50 flex items-end bg-black/85 backdrop-blur-md"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="w-full bg-[#111] border-t border-white/10 rounded-t-3xl p-6 space-y-5 animate-in slide-in-from-bottom duration-300"
        style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom, 2.5rem))' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto" />

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <Flag size={16} className="text-white/40" />
          </div>
          <div>
            <p className="text-zinc-400 text-[8px] font-black uppercase tracking-widest">Relatório Final</p>
            <p className="text-white font-bold text-base mt-0.5 truncate">{eventoNome}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-zinc-900/60 border border-white/5 divide-y divide-white/5">
          <div className="flex justify-between items-center px-4 py-3">
            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-wider">Check-ins realizados</p>
            <p className="text-white font-black text-sm">{checkinsEvento}</p>
          </div>
          <div className="flex justify-between items-center px-4 py-3">
            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-wider">Receita Bruta</p>
            <p className="text-zinc-300 font-black text-sm">{fmtBRL(receitaBrutaEvento)}</p>
          </div>
          <div className="flex justify-between items-center px-4 py-3">
            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-wider">Saldo a Transferir</p>
            <p className="text-emerald-400 font-black text-base">{fmtBRL(saldoTransferir)}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center active:scale-90 transition-all shrink-0"
          >
            <X size={16} className="text-zinc-400" />
          </button>
          <button
            onClick={onEncerrar}
            className="flex-1 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-[0.97] transition-all"
            style={{ background: 'linear-gradient(135deg, #059669, #10b981)', color: '#fff' }}
          >
            <Check size={14} /> Confirmar Encerramento
          </button>
        </div>
      </div>
    </div>
  );
};
