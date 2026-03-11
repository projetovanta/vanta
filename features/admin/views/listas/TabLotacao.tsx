import React from 'react';
import type { ListaEvento } from '../../../../types';
import { listasService } from '../../services/listasService';

export const TabLotacao: React.FC<{ lista: ListaEvento }> = ({ lista }) => {
  const total = lista.convidados.length;
  const pct = lista.tetoGlobalTotal > 0 ? Math.round((total / lista.tetoGlobalTotal) * 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
      <div className="p-6 bg-zinc-900/40 border border-white/5 rounded-3xl">
        <p className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-widest mb-4">Lotação Global</p>
        <div className="flex items-end justify-between mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-white font-black text-5xl leading-none">{total}</span>
            <span className="text-zinc-400 text-xl font-light">/{lista.tetoGlobalTotal}</span>
          </div>
          <div className="text-right pb-1">
            <p className="text-[#FFD300] font-black text-3xl leading-none">{pct}%</p>
            <p className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-widest">preenchido</p>
          </div>
        </div>
        <div className="w-full h-4 bg-zinc-800 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-[#FFD300] rounded-full transition-all"
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <p className="text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest">
          {lista.tetoGlobalTotal - total} vagas restantes
        </p>
      </div>

      <p className="text-zinc-700 text-[0.5625rem] font-black uppercase tracking-widest px-1">Por categoria</p>
      {lista.regras.map(r => {
        const usado = listasService.totalPorRegra(lista, r.id);
        const alocado = lista.cotas.filter(c => c.regraId === r.id).reduce((a, c) => a + c.alocado, 0);
        const pctR = r.tetoGlobal > 0 ? Math.round((usado / r.tetoGlobal) * 100) : 0;
        const cor = r.cor || '#71717a';
        return (
          <div key={r.id} className="p-5 bg-zinc-900/30 border border-white/5 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cor }} />
                <p className="text-white text-sm font-bold truncate">{r.label}</p>
              </div>
              <div className="flex items-baseline gap-1 shrink-0">
                <span className="font-black text-2xl leading-none" style={{ color: cor }}>
                  {usado}
                </span>
                <span className="text-zinc-400 font-light text-base">/{r.tetoGlobal}</span>
              </div>
            </div>
            <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden mb-2.5">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${Math.min(pctR, 100)}%`, backgroundColor: cor }}
              />
            </div>
            <div className="flex justify-between text-[0.5625rem] font-black uppercase tracking-widest">
              <span className="text-zinc-400">Banco: {r.saldoBanco}</span>
              <span className="text-zinc-400">Alocado: {alocado}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
