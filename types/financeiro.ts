// ── Mesas/Camarotes ────────────────────────────────────────────────────────
export interface Mesa {
  id: string;
  eventoId: string;
  label: string;
  x: number; // posição relativa 0-100 (% da largura)
  y: number; // posição relativa 0-100 (% da altura)
  capacidade: number;
  valor: number;
  status: 'DISPONIVEL' | 'RESERVADA' | 'OCUPADA';
  reservadoPor?: string;
}

// ── Cortesias ──────────────────────────────────────────────────────────────
export interface CortesiaEvento {
  limite: number; // total geral (soma dos limites por tipo)
  variacoes: string[]; // labels dos tipos disponíveis (ex: 'Pista · Masc.')
  limitesPorTipo?: Record<string, number>; // limite individual por variação label
}

export interface TransferenciaCortesiaLog {
  id: string;
  remetenteNome: string;
  destinatarioNome: string;
  variacaoLabel: string;
  quantidade: number;
  ts: string; // ISO 8601 -03:00
}

// ── Transferência de Ingresso ──────────────────────────────────────────────
export interface TransferenciaPendente {
  id: string;
  ticketId: string;
  eventoId: string;
  remetenteId: string;
  remetenteNome: string;
  destinatarioId: string;
  destinatarioNome: string;
  variacaoLabel?: string;
  tituloEvento?: string;
  dataEvento?: string;
  eventoLocal?: string;
  eventoImagem?: string;
  status: 'PENDENTE' | 'ACEITO' | 'RECUSADO';
  criadoEm: string;
}
