import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Search, Plus, Check, Users, ChevronRight, X, Clock } from 'lucide-react';
import type { ListaEvento, ConvidadoLista } from '../../../../types';
import { isRegraAbobora, type RoleListaNova } from './listasUtils';
import { ModalInserirLote } from './ModalInserirLote';
import { listasService } from '../../services/listasService';

const Toast: React.FC<{ msg: string; onDone: () => void }> = ({ msg, onDone }) => {
  React.useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="absolute bottom-6 left-4 right-4 z-[200] flex items-center gap-3 bg-[#1a1a1a] border border-[#FFD300]/30 rounded-2xl px-5 py-4 shadow-2xl">
      <div className="w-7 h-7 rounded-full bg-[#FFD300]/10 flex items-center justify-center shrink-0">
        <Check size={14} className="text-[#FFD300]" />
      </div>
      <p className="text-white text-sm font-semibold flex-1 min-w-0">{msg}</p>
    </div>
  );
};

const CHUNK = 100;

const ConvidadosList: React.FC<{
  convs: ConvidadoLista[];
  abobora: boolean;
}> = ({ convs, abobora }) => {
  const [visible, setVisible] = useState(CHUNK);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 60) {
      setVisible(prev => Math.min(prev + CHUNK, convs.length));
    }
  }, [convs.length]);

  const shown = convs.slice(0, visible);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="border-t border-white/5 max-h-[60vh] overflow-y-auto no-scrollbar"
    >
      {shown.map((c, idx) => (
        <div
          key={c.id}
          className={`flex items-center gap-3 px-4 py-3 ${idx < shown.length - 1 ? 'border-b border-white/5' : ''}`}
        >
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0">
            <span className="text-zinc-400 text-[10px] font-black">{c.nome.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{c.nome}</p>
            <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest truncate">
              por {c.inseridoPorNome}
            </p>
          </div>
          {c.checkedIn ? (
            <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5 shrink-0">
              <Check size={9} className="text-emerald-400" />
              <span className="text-emerald-400 text-[8px] font-black">Dentro</span>
            </div>
          ) : abobora ? (
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 shrink-0" />
          )}
        </div>
      ))}
      {visible < convs.length && (
        <p className="text-center text-zinc-400 text-[9px] font-black uppercase tracking-widest py-3">
          {convs.length - visible} restantes · role para ver mais
        </p>
      )}
    </div>
  );
};

export const TabNomes: React.FC<{
  lista: ListaEvento;
  role: RoleListaNova;
  userId: string;
  userNome: string;
  onRefresh: () => void;
}> = ({ lista, role, userId, userNome, onRefresh }) => {
  const [busca, setBusca] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());

  const handleConfirm = useCallback(
    (count: number) => {
      setModalOpen(false);
      setToast(`${count} nome${count > 1 ? 's' : ''} adicionado${count > 1 ? 's' : ''} com sucesso!`);
      onRefresh();
    },
    [onRefresh],
  );

  const convidados: ConvidadoLista[] = useMemo(() => {
    const base = role === 'promoter' ? lista.convidados.filter(c => c.inseridoPor === userId) : lista.convidados;
    if (!busca.trim()) return base;
    const q = busca.toLowerCase();
    return base.filter(c => c.nome.toLowerCase().includes(q));
  }, [lista.convidados, role, userId, busca]);

  const porRegra = useMemo(() => {
    const map = new Map<string, ConvidadoLista[]>();
    for (const c of convidados) {
      const arr = map.get(c.regraId) ?? [];
      arr.push(c);
      map.set(c.regraId, arr);
    }
    return map;
  }, [convidados]);

  const toggleExpand = (regraId: string) => {
    setExpandidos(prev => {
      const next = new Set(prev);
      if (next.has(regraId)) next.delete(regraId);
      else next.add(regraId);
      return next;
    });
  };

  const totalInseridos = role === 'promoter' ? lista.convidados.filter(c => c.inseridoPor === userId).length : 0;
  const totalEntraram =
    role === 'promoter' ? lista.convidados.filter(c => c.inseridoPor === userId && c.checkedIn).length : 0;

  return (
    <div className="relative flex-1 flex flex-col min-h-0">
      {role === 'promoter' && (
        <div className="flex gap-3 mb-4 shrink-0">
          <div className="flex-1 bg-zinc-900/40 border border-white/5 rounded-2xl p-4 text-center">
            <p className="text-white font-black text-2xl">{totalInseridos}</p>
            <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest mt-1">Inseridos</p>
          </div>
          <div className="flex-1 bg-zinc-900/40 border border-white/5 rounded-2xl p-4 text-center">
            <p className="text-[#FFD300] font-black text-2xl">{totalEntraram}</p>
            <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest mt-1">Entraram</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mb-4 shrink-0">
        <div className="flex-1 flex items-center gap-2 bg-zinc-900/60 border border-white/5 rounded-xl px-3 py-2.5 focus-within:border-[#FFD300]/30">
          <Search size={13} className="text-zinc-400 shrink-0" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome..."
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-zinc-700"
          />
          {busca && (
            <button onClick={() => setBusca('')}>
              <X size={12} className="text-zinc-400" />
            </button>
          )}
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2.5 bg-[#FFD300] text-black font-black text-[10px] uppercase tracking-wider rounded-xl shrink-0 active:scale-95 transition-all"
        >
          <Plus size={12} />
          Adicionar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
        {convidados.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-3">
            <Users size={28} className="text-zinc-800" />
            <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest">
              {busca ? 'Nenhum resultado' : 'Nenhum convidado ainda'}
            </p>
          </div>
        )}
        {lista.regras.map(regra => {
          const convs = porRegra.get(regra.id);
          if (!convs || convs.length === 0) return null;
          const abobora = isRegraAbobora(regra);
          const expandido = expandidos.has(regra.id);
          const checkins = convs.filter(c => c.checkedIn).length;
          return (
            <div key={regra.id} className="bg-zinc-900/30 border border-white/5 rounded-2xl overflow-hidden">
              <button
                className="w-full flex items-center gap-3 p-4 active:bg-white/5 transition-all"
                onClick={() => toggleExpand(regra.id)}
              >
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: regra.cor ?? '#71717a' }} />
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-white text-sm font-bold truncate">{regra.label}</p>
                  <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest mt-0.5">
                    {convs.length} nome{convs.length > 1 ? 's' : ''} · {checkins} dentro
                  </p>
                </div>
                {abobora && (
                  <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2 py-1 shrink-0">
                    <Clock size={9} className="text-amber-400" />
                    <span className="text-amber-400 text-[8px] font-black">
                      {regra.valor ? `R$${regra.valor}` : `Expirou ${regra.horaCorte}`}
                    </span>
                  </div>
                )}
                <ChevronRight
                  size={14}
                  className={`text-zinc-700 shrink-0 transition-transform ${expandido ? 'rotate-90' : ''}`}
                />
              </button>

              {expandido && <ConvidadosList convs={convs} abobora={abobora} />}
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <ModalInserirLote
          lista={lista}
          role={role}
          userId={userId}
          userNome={userNome}
          onClose={() => setModalOpen(false)}
          onConfirm={handleConfirm}
        />
      )}

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
};
