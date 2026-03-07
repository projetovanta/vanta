import React, { useState, useMemo } from 'react';
import { ChevronRight, ArrowLeft, User } from 'lucide-react';
import { VantaPieChart, PieSlice } from '../../components/VantaPieChart';
import { EventoAdmin, ListaEvento, ConvidadoLista } from '../../../../types';

const fmt = (v: number) => v.toLocaleString('pt-BR');
const fmtR$ = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Cores por origem

const PALETTE = [
  '#FFD300',
  '#F59E0B',
  '#10B981',
  '#3B82F6',
  '#A855F7',
  '#EC4899',
  '#EF4444',
  '#8B5CF6',
  '#06B6D4',
  '#84CC16',
];
const CORES_MAP: Record<string, string> = {
  'Ingressos App': '#FFD300',
  'Caixa (Porta)': '#F59E0B',
  'Lista VIP': '#10B981',
  'Lista Pagante': '#3B82F6',
  Cortesia: '#A855F7',
  Masculino: '#3B82F6',
  Feminino: '#EC4899',
  Unissex: '#6B7280',
};

const pickColor = (name: string, idx: number): string => CORES_MAP[name] ?? PALETTE[idx % PALETTE.length];

interface BreadcrumbItem {
  label: string;
  key: string;
}

interface PersonRow {
  nome: string;
  sub: string;
  extra?: string;
}

interface DrillLevel {
  title: string;
  slices: PieSlice[];
  /** ao clicar numa fatia, retorna o próximo nível ou null (= último nível, mostra pessoas) */
  onDrill: (sliceName: string) => DrillLevel | null;
  /** pessoas para mostrar no último nível (quando onDrill retorna null) */
  people?: (sliceName: string) => PersonRow[];
}

const varLabel = (v: { area: string; areaCustom?: string; genero: string }) => `${v.areaCustom || v.area} ${v.genero}`;

// ─── Helpers de dados ────────────────────────────────────────────────────────

const buildRegraMap = (lista?: ListaEvento) =>
  new Map(lista?.regras.map(r => [r.id, { label: r.label, valor: r.valor, genero: r.genero }]) ?? []);

const groupBy = <T,>(arr: T[], key: (t: T) => string): Record<string, T[]> => {
  const m: Record<string, T[]> = {};
  for (const item of arr) {
    const k = key(item);
    (m[k] ??= []).push(item);
  }
  return m;
};

// ─── Gerador de árvore de drill-down ─────────────────────────────────────────

export function buildPublicoTree(evento: EventoAdmin, lista?: ListaEvento): DrillLevel {
  const regraMap = buildRegraMap(lista);
  const allVar = evento.lotes.flatMap(l => l.variacoes);
  const totalIngressos = allVar.reduce((a, v) => a + v.vendidos, 0);
  const cortesias = evento.cortesiasEnviadas ?? 0;

  // Classificar convidados
  const convidados = lista?.convidados.filter(c => c.checkedIn) ?? [];
  const listaGratis: ConvidadoLista[] = [];
  const listaPagante: ConvidadoLista[] = [];
  for (const c of convidados) {
    const regra = regraMap.get(c.regraId);
    if (regra?.valor && regra.valor > 0) listaPagante.push(c);
    else listaGratis.push(c);
  }

  // TODO: quando tivermos tickets_caixa separados, diferenciar app vs caixa
  // Por ora: todo ingresso vendido = app (não temos breakdown caixa vs app nos lotes)

  return {
    title: 'Publico por Origem',
    slices: [
      { name: 'Ingressos App', value: totalIngressos, color: CORES_MAP['Ingressos App'] },
      { name: 'Lista VIP', value: listaGratis.length, color: CORES_MAP['Lista VIP'] },
      { name: 'Lista Pagante', value: listaPagante.length, color: CORES_MAP['Lista Pagante'] },
      { name: 'Cortesia', value: cortesias, color: CORES_MAP['Cortesia'] },
    ].filter(s => s.value > 0),
    onDrill(sliceName: string): DrillLevel | null {
      if (sliceName === 'Ingressos App') return buildIngressosDrill(evento);
      if (sliceName === 'Lista VIP') return buildListaDrill(listaGratis, regraMap, 'Lista VIP');
      if (sliceName === 'Lista Pagante') return buildListaDrill(listaPagante, regraMap, 'Lista Pagante');
      if (sliceName === 'Cortesia') return null; // último nível (sem dados granulares de cortesia por enquanto)
      return null;
    },
    people(sliceName: string): PersonRow[] {
      if (sliceName === 'Cortesia') {
        return Array.from({ length: cortesias }, (_, i) => ({
          nome: `Cortesia #${i + 1}`,
          sub: 'Detalhes na aba Carteira',
        }));
      }
      return [];
    },
  };
}

function buildIngressosDrill(evento: EventoAdmin): DrillLevel {
  const lotes = evento.lotes.filter(l => l.vendidos > 0);
  return {
    title: 'Ingressos por Lote',
    slices: lotes.map((l, i) => ({
      name: l.nome,
      value: l.vendidos,
      color: pickColor(l.nome, i),
    })),
    onDrill(sliceName: string): DrillLevel | null {
      const lote = lotes.find(l => l.nome === sliceName);
      if (!lote) return null;
      const vars = lote.variacoes.filter(v => v.vendidos > 0);
      if (vars.length <= 1) return null;
      return {
        title: `${lote.nome} — Variacoes`,
        slices: vars.map((v, i) => ({
          name: varLabel(v),
          value: v.vendidos,
          color: pickColor(
            v.genero === 'MASCULINO' ? 'Masculino' : v.genero === 'FEMININO' ? 'Feminino' : varLabel(v),
            i,
          ),
        })),
        onDrill: () => null,
        people(varName: string): PersonRow[] {
          const v = vars.find(x => varLabel(x) === varName);
          if (!v) return [];
          return [
            {
              nome: `${v.vendidos} ingressos vendidos`,
              sub: `${fmtR$(v.valor)} cada — Total: ${fmtR$(v.vendidos * v.valor)}`,
              extra: v.genero,
            },
          ];
        },
      };
    },
    people(sliceName: string): PersonRow[] {
      const lote = lotes.find(l => l.nome === sliceName);
      if (!lote) return [];
      return lote.variacoes
        .filter(v => v.vendidos > 0)
        .map(v => ({
          nome: `${varLabel(v)}: ${v.vendidos} vendidos`,
          sub: `${fmtR$(v.valor)} cada — ${fmtR$(v.vendidos * v.valor)}`,
          extra: v.genero,
        }));
    },
  };
}

function buildListaDrill(
  convidados: ConvidadoLista[],
  regraMap: Map<string, { label: string; valor?: number; genero: string }>,
  titulo: string,
): DrillLevel {
  // Nível 1: por promoter
  const byPromoter = groupBy(convidados, c => c.inseridoPor || '_sem_promoter');
  const promoterSlices = Object.entries(byPromoter)
    .map(([pid, cs], i) => ({
      name: cs[0]?.inseridoPorNome || pid.slice(0, 8),
      value: cs.length,
      color: pickColor('', i),
      _pid: pid,
      _convidados: cs,
    }))
    .sort((a, b) => b.value - a.value);

  return {
    title: `${titulo} — Promoters`,
    slices: promoterSlices.map(p => ({ name: p.name, value: p.value, color: p.color })),
    onDrill(sliceName: string): DrillLevel | null {
      const pSlice = promoterSlices.find(p => p.name === sliceName);
      if (!pSlice) return null;
      // Nível 2: por regra
      const byRegra = groupBy(pSlice._convidados, c => c.regraId);
      const regraSlices = Object.entries(byRegra)
        .map(([rid, cs], i) => {
          const regra = regraMap.get(rid);
          return {
            name: regra?.label ?? rid.slice(0, 8),
            value: cs.length,
            color: pickColor('', i),
            _convidados: cs,
          };
        })
        .sort((a, b) => b.value - a.value);

      if (regraSlices.length <= 1) {
        // Só uma regra — ir direto pra pessoas
        return null;
      }

      return {
        title: `${pSlice.name} — Regras`,
        slices: regraSlices.map(r => ({ name: r.name, value: r.value, color: r.color })),
        onDrill: () => null,
        people(regraName: string): PersonRow[] {
          const rSlice = regraSlices.find(r => r.name === regraName);
          return (rSlice?._convidados ?? []).map(c => ({
            nome: c.nome,
            sub: c.checkedInEm
              ? `Check-in: ${new Date(c.checkedInEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
              : 'Na lista',
            extra: c.checkedInPorNome,
          }));
        },
      };
    },
    people(sliceName: string): PersonRow[] {
      const pSlice = promoterSlices.find(p => p.name === sliceName);
      return (pSlice?._convidados ?? []).map(c => ({
        nome: c.nome,
        sub: c.checkedInEm
          ? `Check-in: ${new Date(c.checkedInEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
          : 'Na lista',
        extra: c.checkedInPorNome,
      }));
    },
  };
}

// ─── Componente Visual ───────────────────────────────────────────────────────

export const PublicoDrilldown: React.FC<{
  evento: EventoAdmin;
  lista?: ListaEvento;
}> = ({ evento, lista }) => {
  const rootLevel = useMemo(() => buildPublicoTree(evento, lista), [evento, lista]);

  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([{ label: 'Publico', key: '_root' }]);
  const [currentLevel, setCurrentLevel] = useState<DrillLevel>(rootLevel);
  const [peopleList, setPeopleList] = useState<PersonRow[] | null>(null);
  const [selectedSlice, setSelectedSlice] = useState<string | null>(null);

  const handleSliceClick = (name: string) => {
    setSelectedSlice(prev => (prev === name ? null : name));

    const next = currentLevel.onDrill(name);
    if (next) {
      // Tem mais níveis — drill down
      setBreadcrumb(prev => [...prev, { label: name, key: name }]);
      setCurrentLevel(next);
      setSelectedSlice(null);
      setPeopleList(null);
    } else {
      // Último nível — mostrar pessoas
      const people = currentLevel.people?.(name) ?? [];
      setPeopleList(people);
      setBreadcrumb(prev => [...prev, { label: name, key: name }]);
    }
  };

  const goBack = () => {
    if (breadcrumb.length <= 1) return;
    // Rebuild desde a raiz até o nível anterior
    const newBc = breadcrumb.slice(0, -1);
    let level = rootLevel;
    for (let i = 1; i < newBc.length; i++) {
      const next = level.onDrill(newBc[i].key);
      if (next) level = next;
    }
    setBreadcrumb(newBc);
    setCurrentLevel(level);
    setPeopleList(null);
    setSelectedSlice(null);
  };

  const goTo = (idx: number) => {
    if (idx === breadcrumb.length - 1) return;
    const newBc = breadcrumb.slice(0, idx + 1);
    let level = rootLevel;
    for (let i = 1; i < newBc.length; i++) {
      const next = level.onDrill(newBc[i].key);
      if (next) level = next;
    }
    setBreadcrumb(newBc);
    setCurrentLevel(level);
    setPeopleList(null);
    setSelectedSlice(null);
  };

  const total = currentLevel.slices.reduce((a, s) => a + s.value, 0);

  return (
    <div className="space-y-3">
      {/* Breadcrumb */}
      {breadcrumb.length > 1 && (
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={goBack}
            className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 active:scale-90 transition-all"
          >
            <ArrowLeft size={12} className="text-zinc-400" />
          </button>
          {breadcrumb.map((bc, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight size={10} className="text-zinc-700 shrink-0" />}
              <button
                onClick={() => goTo(i)}
                className={`text-[8px] font-black uppercase tracking-widest transition-all ${
                  i === breadcrumb.length - 1 ? 'text-[#FFD300]' : 'text-zinc-600 active:text-zinc-400'
                }`}
              >
                {bc.label}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Donut ou Lista de pessoas */}
      {peopleList ? (
        <div className="space-y-1.5 max-h-64 overflow-y-auto no-scrollbar">
          {peopleList.length === 0 && (
            <p className="text-zinc-700 text-[10px] italic text-center py-4">Sem dados detalhados.</p>
          )}
          {peopleList.map((p, i) => (
            <div key={i} className="flex items-center gap-2.5 p-2.5 bg-zinc-900/40 border border-white/5 rounded-xl">
              <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                <User size={12} className="text-zinc-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-[11px] font-bold truncate">{p.nome}</p>
                <p className="text-zinc-600 text-[9px] truncate">{p.sub}</p>
              </div>
              {p.extra && <p className="text-zinc-600 text-[8px] shrink-0">{p.extra}</p>}
            </div>
          ))}
        </div>
      ) : (
        <div>
          {/* Número central */}
          <div className="text-center mb-1">
            <p className="text-zinc-600 text-[8px] font-black uppercase tracking-widest">{currentLevel.title}</p>
            <p className="text-white font-black text-xl">{fmt(total)}</p>
          </div>
          <VantaPieChart
            data={currentLevel.slices}
            onSliceClick={handleSliceClick}
            selectedName={selectedSlice}
            height={160}
          />
          <p className="text-zinc-700 text-[8px] text-center mt-2 italic">Toque em uma fatia para detalhar</p>
        </div>
      )}
    </div>
  );
};
