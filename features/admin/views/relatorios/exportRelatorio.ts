/**
 * exportRelatorio — monta dados e chama exportExcel
 * para o relatório de um evento.
 */
import type { EventoAdmin, ListaEvento } from '../../../../types';
import type { TicketCaixa } from '../../services/eventosAdminTypes';
import { exportExcel } from '../../../../utils/exportUtils';
import type { ExcelSheet } from '../../../../utils/exportUtils';

const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtData = (iso: string) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ── Excel (.xlsx) ───────────────────────────────────────────────────────────

export const exportRelatorioExcel = async (
  evento: EventoAdmin,
  listas: ListaEvento[],
  tickets: TicketCaixa[],
): Promise<void> => {
  const todosConvidados = listas.flatMap(l => l.convidados);
  const todasRegras = listas.flatMap(l => l.regras);

  const sheets: ExcelSheet[] = [];

  // ── Sheet 1: Resumo ───────────────────────────────────────────────────────
  const variacoes = evento.lotes.flatMap(l => l.variacoes);
  const totalVendidos = variacoes.reduce((s, v) => s + v.vendidos, 0);
  const totalLimite = variacoes.reduce((s, v) => s + v.limite, 0);
  const gmv = variacoes.reduce((s, v) => s + v.vendidos * v.valor, 0);
  const totalCheckins = todosConvidados.filter(c => c.checkedIn).length;

  sheets.push({
    nome: 'Resumo',
    headers: ['Indicador', 'Valor'],
    rows: [
      ['Evento', evento.nome],
      ['Local', evento.local],
      ['Data', new Date(evento.dataInicio).toLocaleDateString('pt-BR')],
      ['Convidados (lista)', todosConvidados.length],
      ['Check-ins (lista)', totalCheckins],
      [
        '% Conversão lista',
        todosConvidados.length > 0 ? `${((totalCheckins / todosConvidados.length) * 100).toFixed(1)}%` : '0%',
      ],
      ['Ingressos vendidos', totalVendidos],
      ['Limite ingressos', totalLimite],
      ['GMV', fmtBRL(gmv)],
      ['Ticket médio', totalVendidos > 0 ? fmtBRL(gmv / totalVendidos) : fmtBRL(0)],
    ],
  });

  // ── Sheet 2: Por Promoter ─────────────────────────────────────────────────
  const promoterMap = new Map<
    string,
    { nome: string; total: number; checkins: number; porRegra: Map<string, number> }
  >();
  for (const c of todosConvidados) {
    const cur = promoterMap.get(c.inseridoPor) ?? {
      nome: c.inseridoPorNome || 'Desconhecido',
      total: 0,
      checkins: 0,
      porRegra: new Map(),
    };
    cur.total++;
    if (c.checkedIn) cur.checkins++;
    cur.porRegra.set(c.regraId, (cur.porRegra.get(c.regraId) ?? 0) + 1);
    promoterMap.set(c.inseridoPor, cur);
  }
  const regraIds = [...new Set(todosConvidados.map(c => c.regraId))];
  const regraLabels = regraIds.map(id => todasRegras.find(r => r.id === id)?.label ?? 'Sem categoria');

  sheets.push({
    nome: 'Por Promoter',
    headers: ['Promoter', 'Total', 'Check-ins', ...regraLabels],
    rows: [...promoterMap.entries()]
      .sort((a, b) => b[1].total - a[1].total)
      .map(([, p]) => [p.nome, p.total, p.checkins, ...regraIds.map(id => p.porRegra.get(id) ?? 0)]),
  });

  // ── Sheet 3: Por Lista ────────────────────────────────────────────────────
  const regraMap = new Map<string, { label: string; genero: string; total: number; checkins: number }>();
  for (const c of todosConvidados) {
    const regra = todasRegras.find(r => r.id === c.regraId);
    const cur = regraMap.get(c.regraId) ?? {
      label: c.regraLabel || 'Sem categoria',
      genero: regra?.genero ?? 'U',
      total: 0,
      checkins: 0,
    };
    cur.total++;
    if (c.checkedIn) cur.checkins++;
    regraMap.set(c.regraId, cur);
  }

  sheets.push({
    nome: 'Por Lista',
    headers: ['Lista', 'Gênero', 'Convidados', 'Check-ins', '% Conversão', '% do Total'],
    rows: [...regraMap.entries()]
      .sort((a, b) => b[1].total - a[1].total)
      .map(([, r]) => [
        r.label,
        r.genero === 'M' ? 'Masculino' : r.genero === 'F' ? 'Feminino' : 'Unisex',
        r.total,
        r.checkins,
        r.total > 0 ? `${((r.checkins / r.total) * 100).toFixed(1)}%` : '0%',
        totalCheckins > 0 ? `${((r.checkins / totalCheckins) * 100).toFixed(1)}%` : '0%',
      ]),
  });

  // ── Sheet 4: Portaria ─────────────────────────────────────────────────────
  const porteiroMap = new Map<string, number>();
  for (const c of todosConvidados.filter(c => c.checkedIn)) {
    const nome = c.checkedInPorNome || 'Não registrado';
    porteiroMap.set(nome, (porteiroMap.get(nome) ?? 0) + 1);
  }

  sheets.push({
    nome: 'Portaria',
    headers: ['Porteiro', 'Check-ins', '% do Total'],
    rows: [...porteiroMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([nome, count]) => [
        nome,
        count,
        totalCheckins > 0 ? `${((count / totalCheckins) * 100).toFixed(1)}%` : '0%',
      ]),
  });

  // ── Sheet 5: Convidados ───────────────────────────────────────────────────
  sheets.push({
    nome: 'Convidados',
    headers: ['Nome', 'Lista', 'Gênero', 'Promoter', 'Data Cadastro', 'Check-in', 'Porteiro'],
    rows: todosConvidados.map(c => {
      const regra = todasRegras.find(r => r.id === c.regraId);
      const gen = regra?.genero === 'M' ? 'Masculino' : regra?.genero === 'F' ? 'Feminino' : 'Unisex';
      return [
        c.nome,
        c.regraLabel,
        gen,
        c.inseridoPorNome || '-',
        fmtData(c.inseridoEm),
        c.checkedIn ? 'Sim' : 'Não',
        c.checkedInPorNome || '-',
      ];
    }),
  });

  // ── Sheet 6: Ingressos ────────────────────────────────────────────────────
  const ticketsAtivos = tickets.filter(t => t.status === 'DISPONIVEL' || t.status === 'USADO');
  sheets.push({
    nome: 'Ingressos',
    headers: ['Variação', 'Valor', 'Status', 'Emitido em'],
    rows: ticketsAtivos.map(t => [
      t.variacaoLabel,
      fmtBRL(t.valor),
      t.status === 'USADO' ? 'Usado' : 'Disponível',
      fmtData(t.emitidoEm),
    ]),
  });

  const dataStr = new Date(evento.dataInicio)
    .toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    .replace('/', '-');
  await exportExcel(`Relatorio_${evento.nome.replace(/\s+/g, '_')}_${dataStr}`, sheets);
};
