export const fmtData = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }).replace('.', '');
};

export const fmtHora = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

export const CORES_GENERO = ['#60a5fa', '#f472b6', '#a1a1aa'];
export const CORES_IDADE = ['#34d399', '#60a5fa', '#a78bfa', '#f472b6', '#fb923c', '#a1a1aa'];
export const CORES_CIDADE = ['#FFD300', '#60a5fa', '#34d399', '#a78bfa', '#f472b6', '#a1a1aa'];

export const calcIdade = (nascISO: string): number => {
  const hoje = new Date();
  const nasc = new Date(nascISO);
  let age = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) age--;
  return age;
};

export const faixaEtaria = (idade: number): string => {
  if (idade < 18) return '<18';
  if (idade <= 24) return '18-24';
  if (idade <= 34) return '25-34';
  if (idade <= 44) return '35-44';
  return '45+';
};

// ── Helpers para gráficos do EventoDashboard ─────────────────────────────────

import type { VendaLog } from '../../services/eventosAdminTypes';
import type { PieSlice } from '../../components/VantaPieChart';

interface VendaDia {
  dia: string;
  vendas: number;
}
interface VendaVariacaoBar {
  label: string;
  qtd: number;
  receita: number;
  pct: number;
}

export const agruparPorDia = (logs: VendaLog[]): VendaDia[] => {
  const map: Record<string, number> = {};
  for (const v of logs) {
    const dia = v.ts.slice(0, 10); // YYYY-MM-DD
    map[dia] = (map[dia] ?? 0) + 1;
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dia, vendas]) => ({ dia: dia.slice(5), vendas })); // MM-DD
};

const CORES_ORIGEM: Record<string, string> = {
  ANTECIPADO: '#FFD300',
  PORTA: '#60a5fa',
  CORTESIA: '#f472b6',
  LISTA: '#34d399',
};

export const agruparPorOrigem = (logs: VendaLog[]): PieSlice[] => {
  const map: Record<string, number> = {};
  for (const v of logs) {
    const key = v.origem ?? 'PORTA';
    map[key] = (map[key] ?? 0) + 1;
  }
  return Object.entries(map).map(([name, value]) => ({
    name,
    value,
    color: CORES_ORIGEM[name] ?? '#a1a1aa',
  }));
};

export const agruparPorVariacao = (logs: VendaLog[]): VendaVariacaoBar[] => {
  const map: Record<string, { qtd: number; receita: number }> = {};
  for (const v of logs) {
    const key = v.variacaoLabel || 'Ingresso';
    if (!map[key]) map[key] = { qtd: 0, receita: 0 };
    map[key].qtd++;
    map[key].receita += v.valor;
  }
  const entries = Object.entries(map).sort(([, a], [, b]) => b.qtd - a.qtd);
  const maxQtd = entries.length > 0 ? entries[0][1].qtd : 1;
  return entries.map(([label, { qtd, receita }]) => ({
    label,
    qtd,
    receita,
    pct: Math.round((qtd / maxQtd) * 100),
  }));
};

// ── Vendas acumuladas (linha temporal) ──────────────────────────────────────
interface VendaAcumulada {
  dia: string;
  acumulado: number;
}

export const agruparAcumulado = (logs: VendaLog[]): VendaAcumulada[] => {
  const porDia = agruparPorDia(logs);
  let acc = 0;
  return porDia.map(d => {
    acc += d.vendas;
    return { dia: d.dia, acumulado: acc };
  });
};

// ── Pico de vendas (horário com mais vendas) ────────────────────────────────
interface PicoVendas {
  hora: string;
  quantidade: number;
}

export const calcPicoVendas = (logs: VendaLog[]): PicoVendas | null => {
  if (logs.length === 0) return null;
  const map: Record<string, number> = {};
  for (const v of logs) {
    const h = v.ts.slice(11, 13) + ':00'; // HH:00
    map[h] = (map[h] ?? 0) + 1;
  }
  const entries = Object.entries(map).sort(([, a], [, b]) => b - a);
  return entries.length > 0 ? { hora: entries[0][0], quantidade: entries[0][1] } : null;
};

// ── Vendas por canal (breakdown) ────────────────────────────────────────────
interface VendasPorCanal {
  antecipado: number;
  porta: number;
  cortesia: number;
  lista: number;
}

export const contarPorCanal = (logs: VendaLog[]): VendasPorCanal => {
  const result: VendasPorCanal = { antecipado: 0, porta: 0, cortesia: 0, lista: 0 };
  for (const v of logs) {
    const o = v.origem ?? 'PORTA';
    if (o === 'ANTECIPADO') result.antecipado++;
    else if (o === 'PORTA') result.porta++;
    else if (o === 'CORTESIA') result.cortesia++;
    else if (o === 'LISTA') result.lista++;
  }
  return result;
};
