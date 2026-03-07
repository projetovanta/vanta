import type { EventoAdmin, ListaEvento } from '../../../../types';
import { exportExcel } from '../../../../utils/exportUtils';
import type { ExcelSheet } from '../../../../utils/exportUtils';

const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const exportRelatorioComExcel = async (
  comunidadeNome: string,
  eventos: EventoAdmin[],
  listasMap: Map<string, ListaEvento[]>,
): Promise<void> => {
  const sheets: ExcelSheet[] = [];

  // ── Sheet 1: Comparativo ──────────────────────────────────────────────────
  sheets.push({
    nome: 'Comparativo',
    headers: ['Evento', 'Data', 'Convidados', 'Check-ins', '% Conversão', 'Ingressos', 'GMV', 'Ticket Médio'],
    rows: eventos
      .sort((a, b) => a.dataInicio.localeCompare(b.dataInicio))
      .map(ev => {
        const listas = listasMap.get(ev.id) ?? [];
        const convidados = listas.flatMap(l => l.convidados);
        const checkins = convidados.filter(c => c.checkedIn).length;
        const variacoes = ev.lotes.flatMap(l => l.variacoes);
        const vendidos = variacoes.reduce((s, v) => s + v.vendidos, 0);
        const gmv = variacoes.reduce((s, v) => s + v.vendidos * v.valor, 0);
        return [
          ev.nome,
          new Date(ev.dataInicio).toLocaleDateString('pt-BR'),
          convidados.length,
          checkins,
          convidados.length > 0 ? `${((checkins / convidados.length) * 100).toFixed(1)}%` : '0%',
          vendidos,
          fmtBRL(gmv),
          vendidos > 0 ? fmtBRL(gmv / vendidos) : fmtBRL(0),
        ];
      }),
  });

  // ── Sheet 2: Top Promoters ────────────────────────────────────────────────
  const promoterMap = new Map<string, { nome: string; total: number; checkins: number; eventos: Set<string> }>();
  for (const ev of eventos) {
    const listas = listasMap.get(ev.id) ?? [];
    for (const l of listas) {
      for (const c of l.convidados) {
        const cur = promoterMap.get(c.inseridoPor) ?? {
          nome: c.inseridoPorNome || 'Desconhecido',
          total: 0,
          checkins: 0,
          eventos: new Set(),
        };
        cur.total++;
        if (c.checkedIn) cur.checkins++;
        cur.eventos.add(ev.id);
        promoterMap.set(c.inseridoPor, cur);
      }
    }
  }

  sheets.push({
    nome: 'Promoters',
    headers: ['Promoter', 'Convidados', 'Check-ins', '% Conversão', 'Eventos'],
    rows: [...promoterMap.entries()]
      .sort((a, b) => b[1].total - a[1].total)
      .map(([, p]) => [
        p.nome,
        p.total,
        p.checkins,
        p.total > 0 ? `${((p.checkins / p.total) * 100).toFixed(1)}%` : '0%',
        p.eventos.size,
      ]),
  });

  await exportExcel(`Relatorio_${comunidadeNome.replace(/\s+/g, '_')}`, sheets);
};
