import React, { useState, useMemo } from 'react';
import { Search, Check, Users, X } from 'lucide-react';
import type { ListaEvento, ConvidadoLista } from '../../../../types';
import { listasService } from '../../services/listasService';
import { isRegraAbobora } from './listasUtils';

export const TabCheckin: React.FC<{
  lista: ListaEvento;
  onRefresh: () => void;
  userNome: string;
}> = ({ lista, onRefresh, userNome }) => {
  const [busca, setBusca] = useState('');

  const convidados: ConvidadoLista[] = useMemo(() => {
    const q = busca.toLowerCase();
    const todos = q ? lista.convidados.filter(c => c.nome.toLowerCase().includes(q)) : lista.convidados;
    return [...todos].sort((a, b) => {
      if (a.checkedIn === b.checkedIn) return 0;
      return a.checkedIn ? 1 : -1;
    });
  }, [lista.convidados, busca]);

  const handleCheckin = async (convidadoId: string) => {
    await listasService.checkIn(lista.id, convidadoId, userNome);
    onRefresh();
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center gap-2 bg-zinc-900/60 border border-white/5 rounded-xl px-3 py-2.5 focus-within:border-[#FFD300]/30 mb-4 shrink-0">
        <Search size={13} className="text-zinc-600 shrink-0" />
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por nome..."
          className="flex-1 bg-transparent text-white text-sm outline-none placeholder-zinc-700"
        />
        {busca && (
          <button onClick={() => setBusca('')}>
            <X size={12} className="text-zinc-600" />
          </button>
        )}
      </div>

      <div className="flex gap-3 mb-4 shrink-0">
        <div className="flex-1 bg-zinc-900/40 border border-white/5 rounded-xl p-3 text-center">
          <p className="text-white font-black text-xl">{lista.convidados.filter(c => !c.checkedIn).length}</p>
          <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mt-0.5">Aguardando</p>
        </div>
        <div className="flex-1 bg-zinc-900/40 border border-white/5 rounded-xl p-3 text-center">
          <p className="text-emerald-400 font-black text-xl">{lista.convidados.filter(c => c.checkedIn).length}</p>
          <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mt-0.5">Dentro</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
        {convidados.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-3">
            <Users size={28} className="text-zinc-800" />
            <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest">
              {busca ? 'Nenhum resultado' : 'Nenhum convidado'}
            </p>
          </div>
        )}
        {convidados.map(c => {
          const regra = lista.regras.find(r => r.id === c.regraId);
          const abobora = regra ? isRegraAbobora(regra) : false;
          return (
            <div
              key={c.id}
              className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                c.checkedIn ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-zinc-900/30 border-white/5'
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0">
                <span className="text-zinc-500 text-xs font-black">{c.nome.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-bold truncate">{c.nome}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {regra && (
                    <span className="flex items-center gap-1">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: regra.cor ?? '#71717a' }}
                      />
                      <span className="text-zinc-600 text-[9px] font-black truncate">{regra.label}</span>
                    </span>
                  )}
                  {abobora && !c.checkedIn && (
                    <span className="text-amber-400 text-[8px] font-black">
                      {regra?.valor ? `R$${regra.valor}` : `⚠ ${regra?.horaCorte}`}
                    </span>
                  )}
                </div>
              </div>
              {c.checkedIn ? (
                <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1 shrink-0">
                  <Check size={10} className="text-emerald-400" />
                  <span className="text-emerald-400 text-[9px] font-black">Dentro</span>
                </div>
              ) : (
                <button
                  onClick={() => handleCheckin(c.id)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-zinc-300 text-[10px] font-black uppercase tracking-wider active:bg-[#FFD300]/10 active:border-[#FFD300]/30 active:text-[#FFD300] transition-all shrink-0"
                >
                  <Check size={11} />
                  Confirmar
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
