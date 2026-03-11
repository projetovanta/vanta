import React from 'react';
import { Check, X } from 'lucide-react';
import { fmtBRL } from '../../../../utils';
import type { ContractedFees } from '../../services/eventosAdminService';

interface Props {
  valorSaque: string;
  setValorSaque: (v: string) => void;
  valorMax: number;
  valorNum: number;
  podeConfirmar: boolean;
  pixTipo: string;
  pixChave: string;
  contractedFees: ContractedFees;
  totalIngressosEvento: number;
  taxaPercentValor: number;
  taxaFixaValor: number;
  liquidoValor: number;
  onClose: () => void;
  onConfirmar: () => void;
}

export const ModalSaque: React.FC<Props> = ({
  valorSaque,
  setValorSaque,
  valorMax,
  valorNum,
  podeConfirmar,
  pixTipo,
  pixChave,
  contractedFees,
  totalIngressosEvento,
  taxaPercentValor,
  taxaFixaValor,
  liquidoValor,
  onClose,
  onConfirmar,
}) => (
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

      <div>
        <p className="text-zinc-400 text-[0.5rem] font-black uppercase tracking-widest">Solicitar Saque</p>
        <p className="text-white font-bold text-base mt-0.5">Disponível: {fmtBRL(valorMax)}</p>
        <p className="text-zinc-400 text-[0.625rem] mt-0.5">
          PIX {pixTipo}: {pixChave}
        </p>
      </div>

      <div className="space-y-1.5">
        <p className="text-zinc-400 text-[0.5rem] font-black uppercase tracking-widest">Valor a sacar (R$)</p>
        <input
          value={valorSaque}
          onChange={e => setValorSaque(e.target.value.replace(/[^0-9.,]/g, ''))}
          placeholder="0,00"
          inputMode="decimal"
          className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3 text-white text-lg font-black outline-none focus:border-[#FFD300]/30 placeholder-zinc-700"
          autoFocus
        />
        {valorNum > valorMax && (
          <p className="text-red-400 text-[0.5625rem] font-black uppercase tracking-widest">
            Excede o saldo disponível
          </p>
        )}
      </div>

      {/* Detalhamento de taxas */}
      {valorNum > 0 && (
        <div className="rounded-xl p-4 space-y-2 border bg-zinc-900/60 border-white/5">
          <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-3">Detalhamento</p>
          <div className="flex justify-between items-center">
            <p className="text-zinc-400 text-[0.625rem]">Bruto solicitado</p>
            <p className="text-zinc-300 text-[0.625rem] font-bold">{fmtBRL(valorNum)}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-zinc-400 text-[0.625rem]">
              Taxa de Serviço ({(contractedFees.feePercent * 100).toFixed(1)}%)
            </p>
            <p className="text-[0.625rem] font-bold text-[#FFD300]/70">(cobrada do cliente)</p>
          </div>
          {taxaFixaValor > 0 && (
            <div className="flex justify-between items-center">
              <p className="text-zinc-400 text-[0.625rem]">Taxa Fixa ({totalIngressosEvento} ingressos)</p>
              <p className="text-[0.625rem] font-bold text-[#FFD300]/70">(cobrada do cliente)</p>
            </div>
          )}
          <div className="border-t border-white/5 pt-2 flex justify-between items-center">
            <p className="text-zinc-300 text-[0.625rem] font-black uppercase tracking-wider">Líquido a receber</p>
            <p className="text-emerald-400 text-sm font-black">{fmtBRL(liquidoValor)}</p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center active:scale-90 transition-all shrink-0"
        >
          <X size="1rem" className="text-zinc-400" />
        </button>
        <button
          onClick={onConfirmar}
          disabled={!podeConfirmar}
          className="flex-1 h-12 rounded-xl font-black text-[0.625rem] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-30 disabled:pointer-events-none"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', color: '#fff' }}
        >
          <Check size="0.875rem" /> Confirmar
        </button>
      </div>
    </div>
  </div>
);
