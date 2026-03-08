import React, { useState } from 'react';
import { Calculator, CreditCard, Zap } from 'lucide-react';
import { VANTA_FEE, calcGatewayCost } from '../../services/eventosAdminService';
import { fmtBRL } from '../../../../utils';

export const SimuladorGateway: React.FC = () => {
  const [simValor, setSimValor] = useState('200');
  const [simMetodo, setSimMetodo] = useState<'CREDITO' | 'PIX'>('CREDITO');
  const simValorNum = parseFloat(simValor.replace(',', '.')) || 0;
  const simTaxaVanta = Math.round(simValorNum * VANTA_FEE * 100) / 100;
  const simCustoGw = calcGatewayCost(simValorNum, simMetodo);
  const simLucroUnit = simTaxaVanta;
  const simLucro100 = Math.round(simLucroUnit * 100 * 100) / 100;
  const simLucro500 = Math.round(simLucroUnit * 500 * 100) / 100;

  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Calculator size={13} className="text-[#FFD300] shrink-0" />
        <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest">Simulador de Lucro Real</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <p className="text-[8px] text-zinc-700 font-black uppercase tracking-widest">Valor Ingresso (R$)</p>
          <input
            value={simValor}
            onChange={e => setSimValor(e.target.value.replace(/[^0-9.,]/g, ''))}
            inputMode="decimal"
            placeholder="200,00"
            className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-3 py-2.5 text-white text-sm font-bold outline-none focus:border-[#FFD300]/30 placeholder-zinc-700"
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-[8px] text-zinc-700 font-black uppercase tracking-widest">Método</p>
          <div className="flex gap-1.5">
            {(['CREDITO', 'PIX'] as const).map(m => (
              <button
                key={m}
                onClick={() => setSimMetodo(m)}
                className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${
                  simMetodo === m
                    ? 'bg-[#FFD300]/10 border border-[#FFD300]/30 text-[#FFD300]'
                    : 'bg-zinc-900/60 border border-white/5 text-zinc-400'
                }`}
              >
                {m === 'PIX' ? <Zap size={10} /> : <CreditCard size={10} />}
                {m === 'PIX' ? 'Pix' : 'Cartão'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {simValorNum > 0 && (
        <div className="space-y-2 pt-3 border-t border-white/5">
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] pt-1 border-t border-white/5">
              <span className="text-emerald-400 font-black uppercase tracking-wider">Lucro VANTA / ingresso</span>
              <span className="text-emerald-400 font-black">{fmtBRL(simLucroUnit)}</span>
            </div>
            <div className="flex justify-between text-[9px]">
              <span className="text-zinc-700">
                Gateway ({simMetodo === 'PIX' ? '1%' : '3.5% + R$0.39'}) — pago pelo produtor/comprador
              </span>
              <span className="text-zinc-700">{fmtBRL(simCustoGw)}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-3 text-center">
              <p className="text-zinc-400 text-[8px] font-black uppercase tracking-widest mb-1">100 ingressos</p>
              <p className="text-zinc-300 font-black text-sm leading-none">{fmtBRL(simLucro100)}</p>
            </div>
            <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-3 text-center">
              <p className="text-zinc-400 text-[8px] font-black uppercase tracking-widest mb-1">500 ingressos</p>
              <p className="text-emerald-400 font-black text-sm leading-none">{fmtBRL(simLucro500)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
