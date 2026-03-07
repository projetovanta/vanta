import { TipoCargo, ComunidadeLog } from '../../../../types';
import { tsBR } from '../../../../utils';

// ── Helpers ────────────────────────────────────────────────────────────────────
export const CARGO_LABEL: Record<TipoCargo, string> = {
  GERENTE: 'Gerente',
  GER_PORTARIA_LISTA: 'Ger. Portaria (Lista)',
  PORTARIA_LISTA: 'Portaria (Lista)',
  GER_PORTARIA_ANTECIPADO: 'Ger. Portaria (Antecipado)',
  PORTARIA_ANTECIPADO: 'Portaria (Antecipado)',
  CAIXA: 'Caixa',
  PROMOTER: 'Promoter',
};

export const addLog = (comunidadeId: string, atorNome: string, acao: string): ComunidadeLog => {
  const log: ComunidadeLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    atorNome,
    acao,
    timestamp: tsBR(),
  };
  // logs locais (não persistidos no Supabase por ora)
  void comunidadeId;
  return log;
};

// ── Tipos locais ──────────────────────────────────────────────────────────────
export type CaixaTipo = 'INGRESSOS' | 'LISTA' | 'FREQUENCIA' | 'LOTES';
export type DetalheTab = 'EVENTOS' | 'EQUIPE' | 'LOGS' | 'CAIXA' | 'RELATORIO' | 'PRIVADOS' | 'COMEMORACOES';
export type EventoTab = 'CRIAR' | 'PROXIMOS' | 'ENCERRADOS';

export const CAIXA_TITLE: Record<CaixaTipo, string> = {
  INGRESSOS: 'Ingressos',
  LISTA: 'Lista de Convidados',
  FREQUENCIA: 'Frequência',
  LOTES: 'Ranking de Lotes',
};
