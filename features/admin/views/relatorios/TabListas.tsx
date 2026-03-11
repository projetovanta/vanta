import React, { useState, useMemo } from 'react';
import { Users, List, Shield, UserCheck } from 'lucide-react';
import type { ListaEvento, ConvidadoLista, RegraLista } from '../../../../types';

type SubTab = 'PROMOTERS' | 'POR_LISTA' | 'PORTARIA' | 'CONVIDADOS';

interface Props {
  listas: ListaEvento[];
  role: 'gerente' | 'promoter' | 'portaria_lista' | 'portaria_antecipado';
  currentUserId: string;
}

export const TabListas: React.FC<Props> = ({ listas, role, currentUserId }) => {
  const [subTab, setSubTab] = useState<SubTab>('PROMOTERS');

  const todosConvidados = useMemo(() => listas.flatMap(l => l.convidados), [listas]);

  const todasRegras = useMemo(() => listas.flatMap(l => l.regras), [listas]);

  // Filtro por role: promoter vê só seus nomes
  const convidadosFiltrados = useMemo(() => {
    if (role === 'promoter') return todosConvidados.filter(c => c.inseridoPor === currentUserId);
    return todosConvidados;
  }, [todosConvidados, role, currentUserId]);

  const SUB_TABS: { id: SubTab; label: string; icon: React.ReactNode }[] = [
    { id: 'PROMOTERS', label: 'Promoters', icon: <Users size="0.6875rem" /> },
    { id: 'POR_LISTA', label: 'Por Lista', icon: <List size="0.6875rem" /> },
    { id: 'PORTARIA', label: 'Portaria', icon: <Shield size="0.6875rem" /> },
    { id: 'CONVIDADOS', label: 'Convidados', icon: <UserCheck size="0.6875rem" /> },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Sub-tabs */}
      <div className="flex border-b border-white/5 mb-4 gap-0 overflow-x-auto no-scrollbar shrink-0">
        {SUB_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`py-2.5 px-3 text-[0.5625rem] font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              subTab === t.id
                ? 'border-[#FFD300] text-[#FFD300]'
                : 'border-transparent text-zinc-400 active:text-zinc-400'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
        {subTab === 'PROMOTERS' && <PromotersReport convidados={convidadosFiltrados} regras={todasRegras} />}
        {subTab === 'POR_LISTA' && <PorListaReport convidados={convidadosFiltrados} regras={todasRegras} />}
        {subTab === 'PORTARIA' && <PortariaReport convidados={convidadosFiltrados} />}
        {subTab === 'CONVIDADOS' && <ConvidadosReport convidados={convidadosFiltrados} />}
      </div>
    </div>
  );
};

/* ── Sub-componentes inline ────────────────────────────────────────────────── */

const PromotersReport: React.FC<{ convidados: ConvidadoLista[]; regras: RegraLista[] }> = ({ convidados, regras }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const porPromoter = useMemo(() => {
    const map = new Map<
      string,
      { nome: string; total: number; checkins: number; porRegra: Map<string, { label: string; count: number }> }
    >();
    for (const c of convidados) {
      const cur = map.get(c.inseridoPor) ?? {
        nome: c.inseridoPorNome || 'Desconhecido',
        total: 0,
        checkins: 0,
        porRegra: new Map(),
      };
      cur.total++;
      if (c.checkedIn) cur.checkins++;
      const regraCur = cur.porRegra.get(c.regraId) ?? { label: c.regraLabel || 'Sem categoria', count: 0 };
      regraCur.count++;
      cur.porRegra.set(c.regraId, regraCur);
      map.set(c.inseridoPor, cur);
    }
    return [...map.entries()].sort((a, b) => b[1].total - a[1].total);
  }, [convidados]);

  if (porPromoter.length === 0) return <EmptyState text="Nenhum promoter" />;

  return (
    <div className="space-y-2">
      {porPromoter.map(([id, p]) => {
        const isExpanded = expandedId === id;
        const regrasArr = [...p.porRegra.entries()].sort((a, b) => b[1].count - a[1].count);
        const genMap = new Map<string, number>();
        for (const c of convidados.filter(c => c.inseridoPor === id)) {
          const regra = regras.find(r => r.id === c.regraId);
          const g = regra?.genero ?? 'U';
          genMap.set(g, (genMap.get(g) ?? 0) + 1);
        }
        const genStr = [...genMap.entries()].map(([g, n]) => `${n}${g}`).join(' · ');
        return (
          <button
            key={id}
            onClick={() => setExpandedId(isExpanded ? null : id)}
            className="w-full text-left bg-zinc-900/30 border border-white/5 rounded-xl p-3 active:bg-white/5 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-zinc-300 text-xs font-bold truncate">{p.nome}</p>
                <p className="text-zinc-400 text-[0.5625rem]">
                  {p.checkins}/{p.total} check-ins · {genStr}
                </p>
              </div>
              <p className="text-[#FFD300] font-black text-sm shrink-0">{p.total}</p>
            </div>
            {isExpanded && (
              <div className="mt-2 pt-2 border-t border-white/5 space-y-1">
                {regrasArr.map(([rId, r]) => (
                  <div key={rId} className="flex items-center justify-between">
                    <p className="text-zinc-400 text-[0.5625rem] truncate flex-1 min-w-0">{r.label}</p>
                    <p className="text-zinc-400 text-[0.5625rem] font-bold shrink-0 ml-2">{r.count}</p>
                  </div>
                ))}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

const PorListaReport: React.FC<{ convidados: ConvidadoLista[]; regras: RegraLista[] }> = ({ convidados, regras }) => {
  const porRegra = useMemo(() => {
    const map = new Map<string, { label: string; genero: string; total: number; checkins: number }>();
    for (const c of convidados) {
      const regra = regras.find(r => r.id === c.regraId);
      const cur = map.get(c.regraId) ?? {
        label: c.regraLabel || 'Sem categoria',
        genero: regra?.genero ?? 'U',
        total: 0,
        checkins: 0,
      };
      cur.total++;
      if (c.checkedIn) cur.checkins++;
      map.set(c.regraId, cur);
    }
    return [...map.entries()].sort((a, b) => b[1].total - a[1].total);
  }, [convidados, regras]);

  if (porRegra.length === 0) return <EmptyState text="Nenhuma lista" />;

  const totalCheckins = convidados.filter(c => c.checkedIn).length;

  return (
    <div className="space-y-2">
      {porRegra.map(([id, r]) => {
        const pctPropria = r.total > 0 ? ((r.checkins / r.total) * 100).toFixed(1) : '0';
        const pctTotal = totalCheckins > 0 ? ((r.checkins / totalCheckins) * 100).toFixed(1) : '0';
        const genLabel = r.genero === 'M' ? 'Masc' : r.genero === 'F' ? 'Fem' : 'Uni';
        return (
          <div key={id} className="bg-zinc-900/30 border border-white/5 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <p className="text-zinc-300 text-xs font-bold truncate">{r.label}</p>
                <span className="text-[0.4375rem] text-zinc-400 font-black uppercase tracking-wider px-1.5 py-0.5 bg-zinc-800 rounded-full shrink-0">
                  {genLabel}
                </span>
              </div>
              <p className="text-zinc-400 text-[0.625rem] shrink-0 ml-2">
                {r.checkins}/{r.total}
              </p>
            </div>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FFD300] rounded-full transition-all"
                style={{ width: `${Math.min(Number(pctPropria), 100)}%` }}
              />
            </div>
            <div className="flex gap-4">
              <p className="text-zinc-400 text-[0.5rem]">{pctPropria}% conversão própria</p>
              <p className="text-zinc-400 text-[0.5rem]">{pctTotal}% do total</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const PortariaReport: React.FC<{ convidados: ConvidadoLista[] }> = ({ convidados }) => {
  const porPorteiro = useMemo(() => {
    const checados = convidados.filter(c => c.checkedIn);
    const map = new Map<string, number>();
    for (const c of checados) {
      const nome = c.checkedInPorNome || 'Não registrado';
      map.set(nome, (map.get(nome) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [convidados]);

  const totalCheckins = convidados.filter(c => c.checkedIn).length;

  if (totalCheckins === 0) return <EmptyState text="Nenhum check-in realizado" />;

  return (
    <div className="space-y-2">
      {porPorteiro.map(([nome, count]) => {
        const pct = totalCheckins > 0 ? ((count / totalCheckins) * 100).toFixed(1) : '0';
        return (
          <div key={nome} className="flex items-center gap-3 p-3 bg-zinc-900/30 border border-white/5 rounded-xl">
            <div className="flex-1 min-w-0">
              <p className="text-zinc-300 text-xs font-bold truncate">{nome}</p>
              <p className="text-zinc-400 text-[0.5625rem]">{pct}% dos check-ins</p>
            </div>
            <p className="text-[#FFD300] font-black text-sm shrink-0">{count}</p>
          </div>
        );
      })}
    </div>
  );
};

const ConvidadosReport: React.FC<{ convidados: ConvidadoLista[] }> = ({ convidados }) => {
  const [busca, setBusca] = useState('');
  const [filtroCheckin, setFiltroCheckin] = useState<'TODOS' | 'SIM' | 'NAO'>('TODOS');

  const filtrados = useMemo(() => {
    let list = convidados;
    if (busca) {
      const q = busca.toLowerCase();
      list = list.filter(c => c.nome.toLowerCase().includes(q) || c.regraLabel.toLowerCase().includes(q));
    }
    if (filtroCheckin === 'SIM') list = list.filter(c => c.checkedIn);
    if (filtroCheckin === 'NAO') list = list.filter(c => !c.checkedIn);
    return list;
  }, [convidados, busca, filtroCheckin]);

  return (
    <div className="space-y-3">
      {/* Busca */}
      <input
        value={busca}
        onChange={e => setBusca(e.target.value)}
        placeholder="Buscar nome ou lista..."
        className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-3 py-2.5 text-sm text-white outline-none placeholder-zinc-700 focus:border-[#FFD300]/30"
      />

      {/* Filtros toggle */}
      <div className="flex gap-1.5">
        {(
          [
            ['TODOS', 'Todos'],
            ['SIM', 'Check-in'],
            ['NAO', 'Sem check-in'],
          ] as const
        ).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFiltroCheckin(val)}
            className={`px-3 py-1.5 rounded-lg text-[0.5625rem] font-black uppercase tracking-wider transition-all ${
              filtroCheckin === val
                ? 'bg-[#FFD300]/10 border border-[#FFD300]/30 text-[#FFD300]'
                : 'bg-zinc-900/60 border border-white/5 text-zinc-400 active:text-zinc-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-widest">
        {filtrados.length} convidados
      </p>

      <div className="space-y-1.5">
        {filtrados.slice(0, 100).map(c => (
          <div key={c.id} className="flex items-center gap-3 p-2.5 bg-zinc-900/30 border border-white/5 rounded-xl">
            <div className={`w-2 h-2 rounded-full shrink-0 ${c.checkedIn ? 'bg-emerald-400' : 'bg-zinc-700'}`} />
            <div className="flex-1 min-w-0">
              <p className="text-zinc-300 text-[0.6875rem] font-bold truncate">{c.nome}</p>
              <p className="text-zinc-400 text-[0.5rem] truncate">
                {c.regraLabel} · {c.inseridoPorNome || 'Desconhecido'}
              </p>
            </div>
            {c.checkedIn && c.checkedInPorNome && (
              <p className="text-zinc-400 text-[0.5rem] shrink-0">{c.checkedInPorNome}</p>
            )}
          </div>
        ))}
        {filtrados.length > 100 && (
          <p className="text-zinc-400 text-[0.5625rem] text-center py-2">+ {filtrados.length - 100} convidados...</p>
        )}
      </div>
    </div>
  );
};

const EmptyState: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex flex-col items-center py-10 opacity-40">
    <p className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-widest">{text}</p>
  </div>
);
