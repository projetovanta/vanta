import React from 'react';
import { X } from 'lucide-react';
import { TYPOGRAPHY } from '../../../../constants';
import { EventoAdmin, LoteAdmin, ListaEvento } from '../../../../types';
import { CaixaTipo, CAIXA_TITLE } from './types';

export const CaixaDrilldownModal: React.FC<{
  tipo: CaixaTipo;
  eventos: EventoAdmin[];
  listaMatches: { evento: EventoAdmin; lista: ListaEvento }[];
  allLotes: (LoteAdmin & { eventoNome: string })[];
  topPromoters: { nome: string; total: number }[];
  onClose: () => void;
}> = ({ tipo, eventos, listaMatches, allLotes, topPromoters, onClose }) => {
  const renderContent = () => {
    if (tipo === 'INGRESSOS') {
      return (
        <div className="space-y-3">
          <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Por evento</p>
          {eventos.map(e => {
            const totalVendidos = e.lotes.reduce((a, l) => a + l.vendidos, 0);
            const allVar = e.lotes.flatMap(l => l.variacoes);
            const mascVar = allVar.filter(v => v.genero === 'MASCULINO').length;
            const femVar = allVar.filter(v => v.genero === 'FEMININO').length;
            return (
              <div key={e.id} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4">
                <p className="text-white font-bold text-sm mb-3 truncate">{e.nome}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                  <div className="text-center">
                    <p className="text-[#FFD300] font-black text-xl">{totalVendidos}</p>
                    <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-wider">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-blue-400 font-black text-xl">{mascVar}</p>
                    <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-wider">Masc.</p>
                  </div>
                  <div className="text-center">
                    <p className="text-pink-400 font-black text-xl">{femVar}</p>
                    <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-wider">Fem.</p>
                  </div>
                </div>
              </div>
            );
          })}
          <p className="text-zinc-700 text-[9px] italic">
            * Gênero refere-se às variações de ingresso criadas por evento.
          </p>
        </div>
      );
    }

    if (tipo === 'LISTA') {
      return (
        <div className="space-y-4">
          {topPromoters.length > 0 && (
            <>
              <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Quem mais adicionou nomes</p>
              <div className="space-y-2">
                {topPromoters.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-zinc-900/40 border border-white/5 rounded-xl">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${i === 0 ? 'bg-[#FFD300] text-black' : 'bg-zinc-800 text-zinc-500'}`}
                    >
                      {i + 1}
                    </span>
                    <p className="text-white text-sm font-bold flex-1 min-w-0 truncate">{p.nome}</p>
                    <p className="text-[#FFD300] font-black text-sm">
                      {p.total} <span className="text-zinc-600 text-[9px] font-normal">nomes</span>
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
          <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Por evento</p>
          {listaMatches.length === 0 && (
            <p className="text-zinc-700 text-[10px] italic text-center py-4">Nenhuma lista vinculada.</p>
          )}
          {listaMatches.map(({ evento, lista }) => (
            <div key={evento.id} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4">
              <p className="text-white font-bold text-sm mb-2 truncate">{evento.nome}</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-zinc-900 rounded-xl text-center">
                  <p className="text-zinc-300 font-black text-lg">{lista.convidados.length}</p>
                  <p className="text-zinc-600 text-[8px] font-black uppercase tracking-widest">Na lista</p>
                </div>
                <div className="p-2.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-center">
                  <p className="text-emerald-400 font-black text-lg">
                    {lista.convidados.filter(c => c.checkedIn).length}
                  </p>
                  <p className="text-zinc-600 text-[8px] font-black uppercase tracking-widest">Entraram</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (tipo === 'FREQUENCIA') {
      const totalIngressos = eventos.reduce((acc, e) => acc + e.lotes.reduce((a, l) => a + l.vendidos, 0), 0);
      const totalLista = listaMatches.reduce((acc, x) => acc + x.lista.convidados.length, 0);
      const totalCheckedIn = listaMatches.reduce(
        (acc, x) => acc + x.lista.convidados.filter(c => c.checkedIn).length,
        0,
      );
      const naoFoi = totalLista - totalCheckedIn;
      const pct = totalLista > 0 ? Math.round((totalCheckedIn / totalLista) * 100) : 0;
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-center">
              <p className="text-emerald-400 font-black text-2xl">{totalCheckedIn}</p>
              <p className="text-zinc-400 text-xs font-bold mt-1">Foram</p>
            </div>
            <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl text-center">
              <p className="text-red-400 font-black text-2xl">{naoFoi}</p>
              <p className="text-zinc-400 text-xs font-bold mt-1">Não foram</p>
            </div>
          </div>
          <div className="p-4 bg-zinc-900/40 border border-white/5 rounded-2xl">
            <div className="flex justify-between items-center mb-2">
              <p className="text-zinc-400 text-xs">Taxa de comparecimento (lista)</p>
              <p className="text-emerald-400 font-black text-lg">{pct}%</p>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <p className="text-zinc-600 text-[9px] italic">
            * {totalIngressos} ingresso{totalIngressos !== 1 ? 's' : ''} vendido{totalIngressos !== 1 ? 's' : ''} via
            lote não possuem check-in individual rastreado.
          </p>
        </div>
      );
    }

    if (tipo === 'LOTES') {
      const sorted = [...allLotes].sort((a, b) => b.vendidos - a.vendidos);
      return (
        <div className="space-y-2">
          {sorted.map((lote, i) => (
            <div key={lote.id} className="flex items-center gap-3 p-3 bg-zinc-900/40 border border-white/5 rounded-xl">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${i === 0 ? 'bg-[#FFD300] text-black' : 'bg-zinc-800 text-zinc-500'}`}
              >
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-bold truncate">{lote.nome}</p>
                <p className="text-zinc-600 text-[9px] truncate">{lote.eventoNome}</p>
              </div>
              <p className="text-[#FFD300] font-black text-sm shrink-0">
                {lote.vendidos} <span className="text-zinc-600 text-[9px] font-normal">vendidos</span>
              </p>
            </div>
          ))}
          {sorted.length === 0 && (
            <p className="text-zinc-700 text-[10px] italic text-center py-8">Nenhum dado de vendas.</p>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className="absolute inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-[#111111] border border-white/10 rounded-t-[2.5rem] overflow-hidden max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-zinc-700" />
        </div>
        <div className="px-6 pt-3 pb-4 border-b border-white/5 flex items-center justify-between shrink-0">
          <h2 style={TYPOGRAPHY.screenTitle} className="text-base italic">
            {CAIXA_TITLE[tipo]}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10"
          >
            <X size={14} className="text-zinc-400" />
          </button>
        </div>
        <div
          className="flex-1 overflow-y-auto no-scrollbar p-6"
          style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 1.5rem))' }}
        >
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
