import React, { useState, useEffect } from 'react';
import { Search, X, Check, UserPlus, Loader2 } from 'lucide-react';
import { TYPOGRAPHY } from '../../../../constants';
import { Comunidade, TipoCargo } from '../../../../types';
import { authService } from '../../../../services/authService';
import { rbacService } from '../../services/rbacService';
import { CARGO_LABEL } from './types';

export const AdicionarMembroModal: React.FC<{
  comunidade: Comunidade;
  onAdd: (membroId: string, tipo: TipoCargo) => void;
  onClose: () => void;
}> = ({ comunidade, onAdd, onClose }) => {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [cargo, setCargo] = useState<TipoCargo>('GERENTE');
  const [filtrados, setFiltrados] = useState<import('../../../../types').Membro[]>([]);
  const [searching, setSearching] = useState(false);

  // Carrega lista inicial (sem filtro) e refaz ao digitar
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      if (cancelled) return;
      setSearching(true);
      try {
        const existingIds = rbacService.getAtribuicoesTenant('COMUNIDADE', comunidade.id).map(a => a.userId);
        const todos = await authService.buscarMembros(query, 20);
        if (cancelled) return;
        setFiltrados(todos.filter(m => !existingIds.includes(m.id)));
      } catch (err) {
        console.error('[AdicionarMembroModal] erro buscarMembros:', err);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, comunidade.id]);

  return (
    <div
      className="absolute inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-[#111111] border border-white/10 rounded-t-[2.5rem] overflow-hidden max-h-[88vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-zinc-700" />
        </div>

        <div className="px-6 pt-3 pb-4 border-b border-white/5 shrink-0">
          <h2 style={TYPOGRAPHY.screenTitle} className="text-base italic">
            Adicionar à Equipe Fixa
          </h2>
        </div>

        {/* Cargo picker */}
        <div className="px-6 pt-4 pb-3 shrink-0">
          <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-2">Função na comunidade</p>
          <div className="flex gap-1.5 flex-wrap">
            {(Object.keys(CARGO_LABEL) as TipoCargo[]).map(t => (
              <button
                key={t}
                onClick={() => setCargo(t)}
                className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                  cargo === t
                    ? 'bg-[#FFD300] text-black'
                    : 'bg-zinc-900 border border-white/5 text-zinc-500 active:text-zinc-300'
                }`}
              >
                {CARGO_LABEL[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Busca */}
        <div className="px-6 pb-3 shrink-0">
          <div className="flex items-center gap-2 bg-zinc-900/60 border border-white/5 rounded-xl px-3 py-2 focus-within:border-[#FFD300]/20">
            {searching ? (
              <Loader2 size={13} className="text-zinc-500 shrink-0 animate-spin" />
            ) : (
              <Search size={13} className="text-zinc-600 shrink-0" />
            )}
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar por nome ou email..."
              className="flex-1 bg-transparent text-white text-sm outline-none placeholder-zinc-700"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-zinc-600 active:text-zinc-400">
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Lista de membros */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-3 space-y-2">
          {searching && filtrados.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="text-zinc-600 animate-spin" />
            </div>
          )}
          {!searching &&
            filtrados.map(m => (
              <button
                key={m.id}
                onClick={() => setSelected(selected === m.id ? null : m.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  selected === m.id
                    ? 'bg-[#FFD300]/10 border-[#FFD300]/30'
                    : 'bg-zinc-900/30 border-white/5 active:bg-zinc-900/60'
                }`}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                  <img loading="lazy" src={m.foto} alt={m.nome} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-bold truncate">{m.nome}</p>
                  <p className="text-zinc-600 text-[10px] truncate">{m.email}</p>
                </div>
                {selected === m.id && <Check size={14} className="text-[#FFD300] shrink-0" />}
              </button>
            ))}
          {!searching && filtrados.length === 0 && (
            <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest text-center py-8">
              {query ? 'Nenhum membro encontrado.' : 'Digite para buscar membros.'}
            </p>
          )}
        </div>

        <div
          className="px-6 pt-3 border-t border-white/5 shrink-0"
          style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 2rem))' }}
        >
          <button
            onClick={() => selected && onAdd(selected, cargo)}
            disabled={!selected}
            className={`w-full py-4 font-bold text-[10px] uppercase tracking-[0.3em] rounded-xl flex items-center justify-center gap-2 transition-all ${
              selected ? 'bg-[#FFD300] text-black active:scale-[0.98]' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            }`}
          >
            <UserPlus size={13} /> Adicionar à Equipe
          </button>
        </div>
      </div>
    </div>
  );
};
