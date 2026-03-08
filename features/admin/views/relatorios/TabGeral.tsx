import React, { useState, useMemo } from 'react';
import { ChevronLeft } from 'lucide-react';
import type { EventoAdmin, ListaEvento } from '../../../../types';
import { VantaPieChart } from '../../components/VantaPieChart';
import type { PieSlice } from '../../components/VantaPieChart';

interface Props {
  evento: EventoAdmin;
  listas: ListaEvento[];
}

// Cores fixas
const COR_INGRESSOS = '#FFD300';
const COR_LISTAS = '#10b981';
const CORES_TIPO = [
  '#6366f1',
  '#f59e0b',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#8b5cf6',
  '#06b6d4',
  '#ef4444',
  '#84cc16',
  '#a855f7',
];
const CORES_GENERO: Record<string, string> = { M: '#3b82f6', F: '#ec4899', U: '#a78bfa' };
const LABEL_GENERO: Record<string, string> = {
  M: 'Masculino',
  F: 'Feminino',
  U: 'Unisex',
  MASCULINO: 'Masculino',
  FEMININO: 'Feminino',
  UNISEX: 'Unisex',
};

type DrillLevel = 'ROOT' | 'LISTAS_TIPO' | 'LISTAS_GENERO' | 'INGRESSOS_LOTE' | 'INGRESSOS_GENERO';

interface DrillState {
  level: DrillLevel;
  selectedTipoId?: string; // regraId selecionada
  selectedLoteId?: string; // loteId selecionado
}

export const TabGeral: React.FC<Props> = ({ evento, listas }) => {
  const [drill, setDrill] = useState<DrillState>({ level: 'ROOT' });

  const variacoes = evento.lotes.flatMap(l => l.variacoes);
  const totalIngressos = variacoes.reduce((s, v) => s + v.vendidos, 0);
  const totalLista = listas.reduce((s, l) => s + l.convidados.length, 0);
  const checkInsLista = listas.reduce((s, l) => s + l.convidados.filter(c => c.checkedIn).length, 0);
  const totalLimite = variacoes.reduce((s, v) => s + v.limite, 0);
  const pctCheckin = totalLista > 0 ? ((checkInsLista / totalLista) * 100).toFixed(1) : '0';

  // ── Dados por nível ─────────────────────────────────────────────────────────

  const rootSlices = useMemo((): PieSlice[] => {
    const slices: PieSlice[] = [];
    if (totalIngressos > 0) slices.push({ name: 'Ingressos', value: totalIngressos, color: COR_INGRESSOS });
    if (totalLista > 0) slices.push({ name: 'Listas', value: totalLista, color: COR_LISTAS });
    return slices;
  }, [totalIngressos, totalLista]);

  const listasTipoSlices = useMemo((): PieSlice[] => {
    const map = new Map<string, { label: string; count: number }>();
    for (const l of listas) {
      for (const c of l.convidados) {
        const cur = map.get(c.regraId) ?? { label: c.regraLabel || 'Sem categoria', count: 0 };
        cur.count++;
        map.set(c.regraId, cur);
      }
    }
    return [...map.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .map(([, d], i) => ({ name: d.label, value: d.count, color: CORES_TIPO[i % CORES_TIPO.length] }));
  }, [listas]);

  const listasGeneroSlices = useMemo((): PieSlice[] => {
    if (!drill.selectedTipoId) return [];
    const map = new Map<string, number>();
    for (const l of listas) {
      const regra = l.regras.find(r => r.id === drill.selectedTipoId);
      const gen = regra?.genero ?? 'U';
      const count = l.convidados.filter(c => c.regraId === drill.selectedTipoId).length;
      if (count > 0) map.set(gen, (map.get(gen) ?? 0) + count);
    }
    return [...map.entries()].map(([g, v]) => ({
      name: LABEL_GENERO[g] ?? g,
      value: v,
      color: CORES_GENERO[g] ?? '#888',
    }));
  }, [listas, drill.selectedTipoId]);

  const ingressosLoteSlices = useMemo((): PieSlice[] => {
    return evento.lotes
      .filter(l => l.variacoes.reduce((s, v) => s + v.vendidos, 0) > 0)
      .map((l, i) => ({
        name: l.nome,
        value: l.variacoes.reduce((s, v) => s + v.vendidos, 0),
        color: CORES_TIPO[i % CORES_TIPO.length],
      }));
  }, [evento.lotes]);

  const ingressosGeneroSlices = useMemo((): PieSlice[] => {
    if (!drill.selectedLoteId) return [];
    const lote = evento.lotes.find(l => l.id === drill.selectedLoteId);
    if (!lote) return [];
    const map = new Map<string, number>();
    for (const v of lote.variacoes.filter(v => v.vendidos > 0)) {
      const g = v.genero;
      map.set(g, (map.get(g) ?? 0) + v.vendidos);
    }
    return [...map.entries()].map(([g, val]) => ({
      name: LABEL_GENERO[g] ?? g,
      value: val,
      color: CORES_GENERO[g === 'MASCULINO' ? 'M' : g === 'FEMININO' ? 'F' : 'U'] ?? '#888',
    }));
  }, [evento.lotes, drill.selectedLoteId]);

  // ── Qual pizza renderizar ───────────────────────────────────────────────────

  let slices: PieSlice[] = [];
  let titulo = 'Público Esperado';
  let breadcrumbs: { label: string; state: DrillState }[] = [];

  switch (drill.level) {
    case 'ROOT':
      slices = rootSlices;
      titulo = 'Público Esperado';
      break;
    case 'LISTAS_TIPO':
      slices = listasTipoSlices;
      titulo = 'Listas — Por Tipo';
      breadcrumbs = [{ label: 'Público', state: { level: 'ROOT' } }];
      break;
    case 'LISTAS_GENERO': {
      slices = listasGeneroSlices;
      const selRegra = listas.flatMap(l => l.regras).find(r => r.id === drill.selectedTipoId);
      titulo = `Gênero — ${selRegra?.label ?? 'Lista'}`;
      breadcrumbs = [
        { label: 'Público', state: { level: 'ROOT' } },
        { label: 'Listas', state: { level: 'LISTAS_TIPO' } },
      ];
      break;
    }
    case 'INGRESSOS_LOTE':
      slices = ingressosLoteSlices;
      titulo = 'Ingressos — Por Lote';
      breadcrumbs = [{ label: 'Público', state: { level: 'ROOT' } }];
      break;
    case 'INGRESSOS_GENERO': {
      slices = ingressosGeneroSlices;
      const selLote = evento.lotes.find(l => l.id === drill.selectedLoteId);
      titulo = `Gênero — ${selLote?.nome ?? 'Lote'}`;
      breadcrumbs = [
        { label: 'Público', state: { level: 'ROOT' } },
        { label: 'Ingressos', state: { level: 'INGRESSOS_LOTE' } },
      ];
      break;
    }
  }

  // ── Handlers de clique ──────────────────────────────────────────────────────

  const handleSliceClick = (name: string) => {
    switch (drill.level) {
      case 'ROOT':
        if (name === 'Listas') setDrill({ level: 'LISTAS_TIPO' });
        if (name === 'Ingressos') setDrill({ level: 'INGRESSOS_LOTE' });
        break;
      case 'LISTAS_TIPO': {
        // Encontrar regraId pelo label
        for (const l of listas) {
          const regra = l.regras.find(r => r.label === name);
          if (regra) {
            setDrill({ level: 'LISTAS_GENERO', selectedTipoId: regra.id });
            return;
          }
        }
        break;
      }
      case 'INGRESSOS_LOTE': {
        const lote = evento.lotes.find(l => l.nome === name);
        if (lote) setDrill({ level: 'INGRESSOS_GENERO', selectedLoteId: lote.id });
        break;
      }
      default:
        break;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar space-y-5 pb-10">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4">
          <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest">Ingressos Vendidos</p>
          <p className="text-white font-black text-xl mt-1">{totalIngressos}</p>
          <p className="text-zinc-400 text-[9px] mt-0.5">/ {totalLimite} limite</p>
        </div>
        <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4">
          <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest">Check-ins Lista</p>
          <p className="text-white font-black text-xl mt-1">
            {checkInsLista}/{totalLista}
          </p>
          <p className="text-zinc-400 text-[9px] mt-0.5">{pctCheckin}% conversão</p>
        </div>
      </div>

      {/* Pizza drill-down */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
        {/* Breadcrumb */}
        {breadcrumbs.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {breadcrumbs.map((b, i) => (
              <React.Fragment key={i}>
                <button
                  onClick={() => setDrill(b.state)}
                  className="text-[9px] text-zinc-400 font-bold active:text-[#FFD300] transition-colors"
                >
                  {b.label}
                </button>
                <ChevronLeft size={10} className="text-zinc-700 rotate-180" />
              </React.Fragment>
            ))}
            <p className="text-[9px] text-[#FFD300] font-bold">{titulo}</p>
          </div>
        )}

        {/* Título (sem breadcrumb no root) */}
        {breadcrumbs.length === 0 && (
          <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest">{titulo}</p>
        )}

        {slices.length === 0 ? (
          <p className="text-zinc-700 text-xs text-center py-6">Sem dados ainda</p>
        ) : (
          <VantaPieChart
            data={slices}
            onSliceClick={
              drill.level !== 'LISTAS_GENERO' && drill.level !== 'INGRESSOS_GENERO' ? handleSliceClick : undefined
            }
            height={200}
          />
        )}

        {/* Dica de interação */}
        {slices.length > 0 && drill.level !== 'LISTAS_GENERO' && drill.level !== 'INGRESSOS_GENERO' && (
          <p className="text-zinc-700 text-[8px] text-center">Toque numa fatia para detalhar</p>
        )}
      </div>
    </div>
  );
};
