import React, { useState, useMemo, useEffect } from 'react';
import { ChevronRight, ArrowLeft, User, Layers } from 'lucide-react';
import { VantaPieChart, PieSlice } from '../../components/VantaPieChart';
import { EventoAdmin, ListaEvento, ConvidadoLista } from '../../../../types';

const fmt = (v: number) => v.toLocaleString('pt-BR');
const fmtR$ = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const pct = (v: number, total: number) => (total > 0 ? Math.round((v / total) * 100) : 0);

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

/** Slice estendido com receita */
interface RichSlice extends PieSlice {
  receita: number;
}

interface DrillLevel {
  title: string;
  slices: RichSlice[];
  totalReceita: number;
  /** ao clicar numa fatia, retorna o próximo nível ou null (= último nível, mostra pessoas) */
  onDrill: (sliceName: string) => DrillLevel | null;
  /** pessoas para mostrar no último nível (quando onDrill retorna null) */
  people?: (sliceName: string) => PersonRow[];
  /** se true, mostra toggle pra ver por lote */
  hasLoteToggle?: boolean;
  /** alternativa por lote (quando toggle ativo) */
  loteAlternative?: DrillLevel;
}

export interface CortesiaLogItem {
  variacaoLabel: string;
  remetente: string;
  destinatario: string;
}

const varLabel = (v: { area: string; areaCustom?: string; genero: string }) => `${v.areaCustom || v.area} ${v.genero}`;
const generoLabel = (g: string) => (g === 'MASCULINO' ? 'Masculino' : g === 'FEMININO' ? 'Feminino' : 'Unissex');

// ─── Helpers ────────────────────────────────────────────────────────────────

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

// ─── Nível 4: Promoter (listas) ─────────────────────────────────────────────

function buildPromoterDrill(
  convidados: ConvidadoLista[],
  regraMap: Map<string, { label: string; valor?: number; genero: string }>,
  titulo: string,
): DrillLevel {
  const byPromoter = groupBy(convidados, c => c.inseridoPor || '_sem_promoter');
  const entries = Object.entries(byPromoter)
    .map(([pid, cs]) => {
      const receita = cs.reduce((acc, c) => {
        const regra = regraMap.get(c.regraId);
        return acc + (regra?.valor ?? 0);
      }, 0);
      return { pid, cs, nome: cs[0]?.inseridoPorNome || pid.slice(0, 8), receita };
    })
    .sort((a, b) => b.cs.length - a.cs.length);

  const totalReceita = entries.reduce((a, e) => a + e.receita, 0);
  const slices: RichSlice[] = entries.map((e, i) => ({
    name: e.nome,
    value: e.cs.length,
    color: pickColor('', i),
    receita: e.receita,
  }));

  return {
    title: `${titulo} — Promoters`,
    slices,
    totalReceita,
    onDrill: () => null,
    people(sliceName: string): PersonRow[] {
      const entry = entries.find(e => e.nome === sliceName);
      return (entry?.cs ?? []).map(c => ({
        nome: c.nome,
        sub: c.checkedInEm
          ? `Check-in: ${new Date(c.checkedInEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
          : 'Na lista',
        extra: c.checkedInPorNome,
      }));
    },
  };
}

// ─── Nível 3: Gênero (listas) ───────────────────────────────────────────────

function buildGeneroListaDrill(
  convidados: ConvidadoLista[],
  regraMap: Map<string, { label: string; valor?: number; genero: string }>,
  titulo: string,
): DrillLevel {
  const byGenero = groupBy(convidados, c => {
    const regra = regraMap.get(c.regraId);
    return generoLabel(regra?.genero ?? 'UNISSEX');
  });

  const entries = Object.entries(byGenero)
    .map(([genero, cs]) => {
      const receita = cs.reduce((acc, c) => acc + (regraMap.get(c.regraId)?.valor ?? 0), 0);
      return { genero, cs, receita };
    })
    .sort((a, b) => b.cs.length - a.cs.length);

  const totalReceita = entries.reduce((a, e) => a + e.receita, 0);
  const slices: RichSlice[] = entries.map((e, i) => ({
    name: e.genero,
    value: e.cs.length,
    color: pickColor(e.genero, i),
    receita: e.receita,
  }));

  return {
    title: `${titulo} — Gênero`,
    slices,
    totalReceita,
    onDrill(sliceName: string): DrillLevel | null {
      const entry = entries.find(e => e.genero === sliceName);
      if (!entry || entry.cs.length === 0) return null;
      return buildPromoterDrill(entry.cs, regraMap, `${titulo} ${sliceName}`);
    },
    people(sliceName: string): PersonRow[] {
      const entry = entries.find(e => e.genero === sliceName);
      return (entry?.cs ?? []).map(c => ({
        nome: c.nome,
        sub: c.checkedInEm
          ? `Check-in: ${new Date(c.checkedInEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
          : 'Na lista',
      }));
    },
  };
}

// ─── Nível 2: Variação/Regra (listas) ───────────────────────────────────────

function buildListaVariacaoDrill(
  convidados: ConvidadoLista[],
  regraMap: Map<string, { label: string; valor?: number; genero: string }>,
  titulo: string,
): DrillLevel {
  const byRegra = groupBy(convidados, c => c.regraId);
  const entries = Object.entries(byRegra)
    .map(([rid, cs]) => {
      const regra = regraMap.get(rid);
      const receita = cs.length * (regra?.valor ?? 0);
      return { rid, cs, label: regra?.label ?? rid.slice(0, 8), receita };
    })
    .sort((a, b) => b.cs.length - a.cs.length);

  const totalReceita = entries.reduce((a, e) => a + e.receita, 0);
  const slices: RichSlice[] = entries.map((e, i) => ({
    name: e.label,
    value: e.cs.length,
    color: pickColor('', i),
    receita: e.receita,
  }));

  return {
    title: `${titulo} — Variação`,
    slices,
    totalReceita,
    onDrill(sliceName: string): DrillLevel | null {
      const entry = entries.find(e => e.label === sliceName);
      if (!entry || entry.cs.length === 0) return null;
      return buildGeneroListaDrill(entry.cs, regraMap, `${titulo} ${sliceName}`);
    },
    people(sliceName: string): PersonRow[] {
      const entry = entries.find(e => e.label === sliceName);
      return (entry?.cs ?? []).map(c => ({
        nome: c.nome,
        sub: `${regraMap.get(c.regraId)?.label ?? ''} — ${fmtR$(regraMap.get(c.regraId)?.valor ?? 0)}`,
      }));
    },
  };
}

// ─── Nível 3: Gênero (ingressos app) ────────────────────────────────────────

function buildGeneroIngressosDrill(
  vars: { area: string; areaCustom?: string; genero: string; valor: number; vendidos: number }[],
  titulo: string,
): DrillLevel {
  const byGenero = groupBy(vars, v => generoLabel(v.genero));
  const entries = Object.entries(byGenero)
    .map(([genero, vs]) => {
      const qtd = vs.reduce((a, v) => a + v.vendidos, 0);
      const receita = vs.reduce((a, v) => a + v.vendidos * v.valor, 0);
      return { genero, qtd, receita, vars: vs };
    })
    .sort((a, b) => b.qtd - a.qtd);

  const totalReceita = entries.reduce((a, e) => a + e.receita, 0);
  const slices: RichSlice[] = entries.map((e, i) => ({
    name: e.genero,
    value: e.qtd,
    color: pickColor(e.genero, i),
    receita: e.receita,
  }));

  return {
    title: `${titulo} — Gênero`,
    slices,
    totalReceita,
    onDrill: () => null,
    people(sliceName: string): PersonRow[] {
      const entry = entries.find(e => e.genero === sliceName);
      if (!entry) return [];
      return entry.vars
        .filter(v => v.vendidos > 0)
        .map(v => ({
          nome: `${varLabel(v)}: ${fmt(v.vendidos)} vendidos`,
          sub: `${fmtR$(v.valor)} cada — Total: ${fmtR$(v.vendidos * v.valor)}`,
          extra: generoLabel(v.genero),
        }));
    },
  };
}

// ─── Nível 2: Variação (ingressos app, agrupado de todos lotes) ─────────────

function buildVariacaoAgrupada(evento: EventoAdmin): DrillLevel {
  const allVar = evento.lotes.flatMap(l => l.variacoes).filter(v => v.vendidos > 0);
  // Agrupar variações iguais (mesmo area+genero) de lotes diferentes
  const grouped = groupBy(allVar, v => varLabel(v));
  const entries = Object.entries(grouped)
    .map(([label, vs]) => {
      const qtd = vs.reduce((a, v) => a + v.vendidos, 0);
      const receita = vs.reduce((a, v) => a + v.vendidos * v.valor, 0);
      return { label, qtd, receita, vars: vs };
    })
    .sort((a, b) => b.qtd - a.qtd);

  const totalReceita = entries.reduce((a, e) => a + e.receita, 0);
  const slices: RichSlice[] = entries.map((e, i) => ({
    name: e.label,
    value: e.qtd,
    color: pickColor(
      e.vars[0]?.genero === 'MASCULINO' ? 'Masculino' : e.vars[0]?.genero === 'FEMININO' ? 'Feminino' : e.label,
      i,
    ),
    receita: e.receita,
  }));

  return {
    title: 'Ingressos — Variação',
    slices,
    totalReceita,
    hasLoteToggle: true,
    loteAlternative: buildVariacaoPorLote(evento),
    onDrill(sliceName: string): DrillLevel | null {
      const entry = entries.find(e => e.label === sliceName);
      if (!entry) return null;
      return buildGeneroIngressosDrill(entry.vars, sliceName);
    },
    people(sliceName: string): PersonRow[] {
      const entry = entries.find(e => e.label === sliceName);
      if (!entry) return [];
      return entry.vars.map(v => ({
        nome: `${fmt(v.vendidos)} vendidos`,
        sub: `${fmtR$(v.valor)} cada — Total: ${fmtR$(v.vendidos * v.valor)}`,
        extra: generoLabel(v.genero),
      }));
    },
  };
}

// ─── Nível 2 alternativo: por Lote → Variação ──────────────────────────────

function buildVariacaoPorLote(evento: EventoAdmin): DrillLevel {
  const lotes = evento.lotes.filter(l => l.vendidos > 0);
  const totalReceita = lotes.reduce((a, l) => a + l.variacoes.reduce((b, v) => b + v.vendidos * v.valor, 0), 0);

  const slices: RichSlice[] = lotes.map((l, i) => ({
    name: l.nome,
    value: l.vendidos,
    color: pickColor('', i),
    receita: l.variacoes.reduce((a, v) => a + v.vendidos * v.valor, 0),
  }));

  return {
    title: 'Ingressos — por Lote',
    slices,
    totalReceita,
    onDrill(sliceName: string): DrillLevel | null {
      const lote = lotes.find(l => l.nome === sliceName);
      if (!lote) return null;
      const vars = lote.variacoes.filter(v => v.vendidos > 0);
      if (vars.length === 0) return null;

      const loteReceita = vars.reduce((a, v) => a + v.vendidos * v.valor, 0);
      const varSlices: RichSlice[] = vars.map((v, i) => ({
        name: varLabel(v),
        value: v.vendidos,
        color: pickColor(
          v.genero === 'MASCULINO' ? 'Masculino' : v.genero === 'FEMININO' ? 'Feminino' : varLabel(v),
          i,
        ),
        receita: v.vendidos * v.valor,
      }));

      return {
        title: `${lote.nome} — Variações`,
        slices: varSlices,
        totalReceita: loteReceita,
        onDrill(varName: string): DrillLevel | null {
          const v = vars.find(x => varLabel(x) === varName);
          if (!v) return null;
          return buildGeneroIngressosDrill([v], varName);
        },
        people(varName: string): PersonRow[] {
          const v = vars.find(x => varLabel(x) === varName);
          if (!v) return [];
          return [
            {
              nome: `${fmt(v.vendidos)} ingressos vendidos`,
              sub: `${fmtR$(v.valor)} cada — Total: ${fmtR$(v.vendidos * v.valor)}`,
              extra: generoLabel(v.genero),
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
          nome: `${varLabel(v)}: ${fmt(v.vendidos)} vendidos`,
          sub: `${fmtR$(v.valor)} cada — ${fmtR$(v.vendidos * v.valor)}`,
          extra: generoLabel(v.genero),
        }));
    },
  };
}

// ─── Drill-down Cortesias: Variação → Gênero → Remetente ────────────────────

function buildCortesiaRemetenteDrill(items: CortesiaLogItem[], titulo: string): DrillLevel {
  const byRemetente = groupBy(items, c => c.remetente || 'Desconhecido');
  const entries = Object.entries(byRemetente)
    .map(([nome, cs]) => ({ nome, qtd: cs.length, items: cs }))
    .sort((a, b) => b.qtd - a.qtd);

  const slices: RichSlice[] = entries.map((e, i) => ({
    name: e.nome,
    value: e.qtd,
    color: pickColor('', i),
    receita: 0,
  }));

  return {
    title: `${titulo} — Enviado por`,
    slices,
    totalReceita: 0,
    onDrill: () => null,
    people(sliceName: string): PersonRow[] {
      const entry = entries.find(e => e.nome === sliceName);
      return (entry?.items ?? []).map(c => ({
        nome: c.destinatario || 'Convidado',
        sub: `Enviado por ${c.remetente}`,
        extra: c.variacaoLabel,
      }));
    },
  };
}

function buildCortesiaGeneroDrill(items: CortesiaLogItem[], titulo: string): DrillLevel {
  const byGenero = groupBy(items, c => {
    const label = c.variacaoLabel.toUpperCase();
    if (label.includes('FEMININO') || label.includes('FEM')) return 'Feminino';
    if (label.includes('MASCULINO') || label.includes('MASC')) return 'Masculino';
    return 'Unissex';
  });

  const entries = Object.entries(byGenero)
    .map(([genero, cs]) => ({ genero, qtd: cs.length, items: cs }))
    .sort((a, b) => b.qtd - a.qtd);

  const slices: RichSlice[] = entries.map((e, i) => ({
    name: e.genero,
    value: e.qtd,
    color: pickColor(e.genero, i),
    receita: 0,
  }));

  return {
    title: `${titulo} — Gênero`,
    slices,
    totalReceita: 0,
    onDrill(sliceName: string): DrillLevel | null {
      const entry = entries.find(e => e.genero === sliceName);
      if (!entry || entry.items.length === 0) return null;
      return buildCortesiaRemetenteDrill(entry.items, `${titulo} ${sliceName}`);
    },
    people(sliceName: string): PersonRow[] {
      const entry = entries.find(e => e.genero === sliceName);
      return (entry?.items ?? []).map(c => ({
        nome: c.destinatario || 'Convidado',
        sub: `Enviado por ${c.remetente}`,
        extra: c.variacaoLabel,
      }));
    },
  };
}

function buildCortesiaDrilldown(items: CortesiaLogItem[]): DrillLevel {
  const byVariacao = groupBy(items, c => c.variacaoLabel || 'Sem variação');
  const entries = Object.entries(byVariacao)
    .map(([label, cs]) => ({ label, qtd: cs.length, items: cs }))
    .sort((a, b) => b.qtd - a.qtd);

  const slices: RichSlice[] = entries.map((e, i) => ({
    name: e.label,
    value: e.qtd,
    color: pickColor('', i),
    receita: 0,
  }));

  return {
    title: 'Cortesias — Variação',
    slices,
    totalReceita: 0,
    onDrill(sliceName: string): DrillLevel | null {
      const entry = entries.find(e => e.label === sliceName);
      if (!entry || entry.items.length === 0) return null;
      return buildCortesiaGeneroDrill(entry.items, sliceName);
    },
    people(sliceName: string): PersonRow[] {
      const entry = entries.find(e => e.label === sliceName);
      return (entry?.items ?? []).map(c => ({
        nome: c.destinatario || 'Convidado',
        sub: `Enviado por ${c.remetente}`,
      }));
    },
  };
}

// ─── Nível 2: Tipo de Ingresso (pago vs cortesia) ───────────────────────────

function buildTipoIngressoDrill(evento: EventoAdmin, cortesiasLog: CortesiaLogItem[]): DrillLevel {
  const allVar = evento.lotes.flatMap(l => l.variacoes);
  const totalPagos = allVar.reduce((a, v) => a + v.vendidos, 0);
  const receitaPagos = allVar.reduce((a, v) => a + v.vendidos * v.valor, 0);
  const cortesias = evento.cortesiasEnviadas ?? 0;

  const slices: RichSlice[] = [
    { name: 'Pagos', value: totalPagos, color: '#FFD300', receita: receitaPagos },
    { name: 'Cortesia', value: cortesias, color: '#A855F7', receita: 0 },
  ].filter(s => s.value > 0);

  const totalReceita = receitaPagos;

  return {
    title: 'Ingressos — Tipo',
    slices,
    totalReceita,
    onDrill(sliceName: string): DrillLevel | null {
      if (sliceName === 'Pagos') return buildVariacaoAgrupada(evento);
      if (sliceName === 'Cortesia' && cortesiasLog.length > 0) return buildCortesiaDrilldown(cortesiasLog);
      return null;
    },
    people(sliceName: string): PersonRow[] {
      if (sliceName === 'Cortesia') {
        if (cortesiasLog.length > 0) {
          return cortesiasLog.map(c => ({
            nome: c.destinatario || 'Convidado',
            sub: `Enviado por ${c.remetente}`,
            extra: c.variacaoLabel,
          }));
        }
        return Array.from({ length: cortesias }, (_, i) => ({
          nome: `Cortesia #${i + 1}`,
          sub: 'Detalhes na aba Carteira',
        }));
      }
      if (sliceName === 'Pagos') {
        return allVar
          .filter(v => v.vendidos > 0)
          .map(v => ({
            nome: `${varLabel(v)}: ${fmt(v.vendidos)} vendidos`,
            sub: `${fmtR$(v.valor)} cada — ${fmtR$(v.vendidos * v.valor)}`,
            extra: generoLabel(v.genero),
          }));
      }
      return [];
    },
  };
}

// ─── Nível 2: Tipo de Lista (VIP vs pagante) ────────────────────────────────

function buildTipoListaDrill(
  listaGratis: ConvidadoLista[],
  listaPagante: ConvidadoLista[],
  regraMap: Map<string, { label: string; valor?: number; genero: string }>,
): DrillLevel {
  const receitaListaPagante = listaPagante.reduce((a, c) => a + (regraMap.get(c.regraId)?.valor ?? 0), 0);

  const slices: RichSlice[] = [
    { name: 'Lista VIP', value: listaGratis.length, color: '#10B981', receita: 0 },
    { name: 'Lista Pagante', value: listaPagante.length, color: '#3B82F6', receita: receitaListaPagante },
  ].filter(s => s.value > 0);

  return {
    title: 'Lista — Tipo',
    slices,
    totalReceita: receitaListaPagante,
    onDrill(sliceName: string): DrillLevel | null {
      if (sliceName === 'Lista VIP') return buildListaVariacaoDrill(listaGratis, regraMap, 'Lista VIP');
      if (sliceName === 'Lista Pagante') return buildListaVariacaoDrill(listaPagante, regraMap, 'Lista Pagante');
      return null;
    },
    people(sliceName: string): PersonRow[] {
      const cs = sliceName === 'Lista VIP' ? listaGratis : listaPagante;
      return cs.map(c => ({
        nome: c.nome,
        sub: c.checkedInEm
          ? `Check-in: ${new Date(c.checkedInEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
          : 'Na lista',
      }));
    },
  };
}

// ─── Raiz: Público por Origem (2 fatias: Ingresso + Lista) ──────────────────

export function buildPublicoTree(
  evento: EventoAdmin,
  lista?: ListaEvento,
  cortesiasLog: CortesiaLogItem[] = [],
): DrillLevel {
  const regraMap = buildRegraMap(lista);
  const allVar = evento.lotes.flatMap(l => l.variacoes);
  const totalIngressos = allVar.reduce((a, v) => a + v.vendidos, 0);
  const receitaIngressos = allVar.reduce((a, v) => a + v.vendidos * v.valor, 0);
  const cortesias = evento.cortesiasEnviadas ?? 0;
  const totalPorIngresso = totalIngressos + cortesias;

  // Classificar convidados da lista
  const convidados = lista?.convidados.filter(c => c.checkedIn) ?? [];
  const listaGratis: ConvidadoLista[] = [];
  const listaPagante: ConvidadoLista[] = [];
  for (const c of convidados) {
    const regra = regraMap.get(c.regraId);
    if (regra?.valor && regra.valor > 0) listaPagante.push(c);
    else listaGratis.push(c);
  }
  const totalPorLista = convidados.length;
  const receitaLista = listaPagante.reduce((a, c) => a + (regraMap.get(c.regraId)?.valor ?? 0), 0);
  const totalReceita = receitaIngressos + receitaLista;

  const rawSlices: RichSlice[] = [
    { name: 'Ingresso', value: totalPorIngresso, color: '#FFD300', receita: receitaIngressos },
    { name: 'Lista', value: totalPorLista, color: '#10B981', receita: receitaLista },
  ].filter(s => s.value > 0);

  return {
    title: 'Público por Origem',
    slices: rawSlices,
    totalReceita,
    onDrill(sliceName: string): DrillLevel | null {
      if (sliceName === 'Ingresso') return buildTipoIngressoDrill(evento, cortesiasLog);
      if (sliceName === 'Lista') return buildTipoListaDrill(listaGratis, listaPagante, regraMap);
      return null;
    },
    people(sliceName: string): PersonRow[] {
      if (sliceName === 'Ingresso') {
        return allVar
          .filter(v => v.vendidos > 0)
          .map(v => ({
            nome: `${varLabel(v)}: ${fmt(v.vendidos)}`,
            sub: `${fmtR$(v.valor)} cada — ${fmtR$(v.vendidos * v.valor)}`,
          }));
      }
      if (sliceName === 'Lista') {
        return convidados.map(c => ({
          nome: c.nome,
          sub: c.checkedInEm
            ? `Check-in: ${new Date(c.checkedInEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
            : 'Na lista',
        }));
      }
      return [];
    },
  };
}

// ─── Componente Visual ───────────────────────────────────────────────────────

export const PublicoDrilldown: React.FC<{
  evento: EventoAdmin;
  lista?: ListaEvento;
  cortesiasLog?: CortesiaLogItem[];
}> = ({ evento, lista, cortesiasLog = [] }) => {
  const rootLevel = useMemo(() => buildPublicoTree(evento, lista, cortesiasLog), [evento, lista, cortesiasLog]);

  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([{ label: 'Público', key: '_root' }]);
  const [currentLevel, setCurrentLevel] = useState<DrillLevel>(rootLevel);
  const [peopleList, setPeopleList] = useState<PersonRow[] | null>(null);
  const [selectedSlice, setSelectedSlice] = useState<string | null>(null);
  const [showByLote, setShowByLote] = useState(false);

  // Sincronizar quando rootLevel muda (ex: cortesiasLog carregou)
  useEffect(() => {
    if (breadcrumb.length === 1) {
      setCurrentLevel(rootLevel);
    }
  }, [rootLevel, breadcrumb.length]);

  const activeLevel = showByLote && currentLevel.loteAlternative ? currentLevel.loteAlternative : currentLevel;

  const handleSliceClick = (name: string) => {
    setSelectedSlice(prev => (prev === name ? null : name));

    const next = activeLevel.onDrill(name);
    if (next) {
      setBreadcrumb(prev => [...prev, { label: name, key: name }]);
      setCurrentLevel(next);
      setSelectedSlice(null);
      setPeopleList(null);
      setShowByLote(false);
    } else {
      const people = activeLevel.people?.(name) ?? [];
      setPeopleList(people);
      setBreadcrumb(prev => [...prev, { label: name, key: name }]);
    }
  };

  const goBack = () => {
    if (breadcrumb.length <= 1) return;
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
    setShowByLote(false);
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
    setShowByLote(false);
  };

  const total = activeLevel.slices.reduce((a, s) => a + s.value, 0);

  return (
    <div className="space-y-3">
      {/* Breadcrumb */}
      {breadcrumb.length > 1 && (
        <div className="flex items-center gap-1 flex-wrap">
          <button
            aria-label="Voltar"
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
                  i === breadcrumb.length - 1 ? 'text-[#FFD300]' : 'text-zinc-400 active:text-zinc-400'
                }`}
              >
                {bc.label}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Conteúdo */}
      {peopleList ? (
        <div className="space-y-1.5 max-h-64 overflow-y-auto no-scrollbar">
          {peopleList.length === 0 && (
            <p className="text-zinc-700 text-[10px] italic text-center py-4">Sem dados detalhados.</p>
          )}
          {peopleList.map((p, i) => (
            <div key={i} className="flex items-center gap-2.5 p-2.5 bg-zinc-900/40 border border-white/5 rounded-xl">
              <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                <User size={12} className="text-zinc-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-[11px] font-bold truncate">{p.nome}</p>
                <p className="text-zinc-400 text-[9px] truncate">{p.sub}</p>
              </div>
              {p.extra && <p className="text-zinc-400 text-[8px] shrink-0">{p.extra}</p>}
            </div>
          ))}
        </div>
      ) : (
        <div>
          {/* Cabeçalho + toggle lote */}
          <div className="text-center mb-1">
            <p className="text-zinc-400 text-[8px] font-black uppercase tracking-widest">{activeLevel.title}</p>
            <p className="text-white font-black text-xl">{fmt(total)}</p>
            {activeLevel.totalReceita > 0 && (
              <p className="text-[#FFD300] text-[10px] font-bold">{fmtR$(activeLevel.totalReceita)}</p>
            )}
          </div>

          {/* Toggle Variação / Lote */}
          {currentLevel.hasLoteToggle && (
            <div className="flex justify-center mb-2">
              <button
                onClick={() => setShowByLote(prev => !prev)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800/60 border border-white/5 text-[9px] font-bold uppercase tracking-wider text-zinc-400 active:scale-95 transition-all"
              >
                <Layers size={10} />
                {showByLote ? 'Ver por Variação' : 'Ver por Lote'}
              </button>
            </div>
          )}

          <VantaPieChart
            data={activeLevel.slices}
            onSliceClick={handleSliceClick}
            selectedName={selectedSlice}
            height={160}
          />

          {/* Legenda financeira */}
          <div className="mt-3 space-y-1">
            {activeLevel.slices.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSliceClick(s.name)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-zinc-800/40 active:bg-zinc-800/60 transition-all text-left"
              >
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-white text-[10px] font-bold flex-1 min-w-0 truncate">{s.name}</span>
                <span className="text-zinc-400 text-[9px] shrink-0">{fmt(s.value)}</span>
                {s.receita > 0 && (
                  <span className="text-[#FFD300] text-[9px] font-bold shrink-0">{fmtR$(s.receita)}</span>
                )}
                <span className="text-zinc-600 text-[8px] shrink-0 w-7 text-right">{pct(s.value, total)}%</span>
                <ChevronRight size={10} className="text-zinc-700 shrink-0" />
              </button>
            ))}
          </div>

          <p className="text-zinc-700 text-[8px] text-center mt-2 italic">Toque em uma fatia para detalhar</p>
        </div>
      )}
    </div>
  );
};
