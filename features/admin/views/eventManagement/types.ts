import { VendaLog } from '../../services/eventosAdminService';

export type Tab =
  | 'LOTACAO'
  | 'EQUIPE'
  | 'LISTA'
  | 'LOGS'
  | 'RESUMO'
  | 'CORTESIAS'
  | 'CARGOS_PERM'
  | 'RELATORIO'
  | 'MESAS';
export type Papel = 'Promoter' | 'Portaria' | 'Staff' | 'Host' | 'Co-Sócio';

export { inputCls } from '../../../../constants';
export const PAPEIS: Papel[] = ['Promoter', 'Portaria', 'Staff', 'Host', 'Co-Sócio'];

// ── Período de filtro ────────────────────────────────────────────────────────
export type Periodo = 'HOJE' | 'SEMANA' | 'MES' | 'ANO' | 'TUDO';
export const PERIODOS: { id: Periodo; label: string }[] = [
  { id: 'HOJE', label: 'Hoje' },
  { id: 'SEMANA', label: '7d' },
  { id: 'MES', label: '30d' },
  { id: 'ANO', label: '1 ano' },
  { id: 'TUDO', label: 'Tudo' },
];

export const filtrarLog = (log: VendaLog[], periodo: Periodo) => {
  if (periodo === 'TUDO') return log;
  const agora = Date.now();
  const limites: Record<Periodo, number> = {
    HOJE: new Date(new Date().setHours(0, 0, 0, 0)).getTime(),
    SEMANA: agora - 7 * 24 * 60 * 60 * 1000,
    MES: agora - 30 * 24 * 60 * 60 * 1000,
    ANO: agora - 365 * 24 * 60 * 60 * 1000,
    TUDO: 0,
  };
  const limite = limites[periodo];
  return log.filter(v => new Date(v.ts).getTime() >= limite);
};

// ── Caixa constants ──────────────────────────────────────────────────────────
export const CORES_PIZZA = ['#FFD300', '#FF6B35', '#E91E8C', '#10b981', '#3F51B5', '#00BCD4', '#9C27B0'];
export const MEDALHAS = ['🥇', '🥈', '🥉'];

export type FechamentoPessoa = { nome: string; nomes: number; ci: number; receita: number };
