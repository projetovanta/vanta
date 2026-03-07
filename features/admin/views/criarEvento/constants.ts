import type { AreaIngresso, PapelEquipeEvento } from '../../../../types';
import type { PermissaoToggle } from './types';

export { inputCls } from '../../../../constants';
export const inputSmCls =
  'bg-zinc-800 border border-white/5 rounded-lg px-2 py-2 text-white text-[11px] outline-none focus:border-[#FFD300]/30 placeholder-zinc-700';
export const inputDateCls =
  'bg-zinc-900/60 border border-white/5 rounded-lg px-2.5 py-2 text-white text-xs outline-none focus:border-[#FFD300]/30 block w-full min-w-0';
export { labelCls } from '../../../../constants';

export const COR_PALETTE = [
  '#FFD300',
  '#FF6B35',
  '#E91E8C',
  '#10b981',
  '#3F51B5',
  '#00BCD4',
  '#9C27B0',
  '#F44336',
  '#FF9800',
  '#607D8B',
  '#4CAF50',
  '#FF5722',
];

export const AREA_LABELS: { id: AreaIngresso; label: string }[] = [
  { id: 'VIP', label: 'Área VIP' },
  { id: 'PISTA', label: 'Pista' },
  { id: 'CAMAROTE', label: 'Camarote' },
  { id: 'BACKSTAGE', label: 'Backstage' },
  { id: 'OUTRO', label: 'Outro' },
];

export const PAPEIS_CASA: { id: PapelEquipeEvento; label: string; desc: string }[] = [
  { id: 'PROMOTER', label: 'Promoter', desc: 'Insere convidados com cota' },
  { id: 'GER_PORTARIA_LISTA', label: 'Ger. Portaria (Lista)', desc: 'Gerente de portaria - lista' },
  { id: 'PORTARIA_LISTA', label: 'Portaria (Lista)', desc: 'Faz check-in por lista' },
  { id: 'GER_PORTARIA_ANTECIPADO', label: 'Ger. Portaria (Antecipado)', desc: 'Gerente de portaria - QR' },
  { id: 'PORTARIA_ANTECIPADO', label: 'Portaria (Antecipado)', desc: 'Faz check-in antecipado' },
  { id: 'CAIXA', label: 'Caixa', desc: 'Venda na porta do evento' },
];

export const PERMISSOES_TOGGLE: { id: PermissaoToggle; label: string; desc: string }[] = [
  { id: 'VER_FINANCEIRO', label: 'Ver Financeiro', desc: 'Acesso a relatórios e dados financeiros do evento' },
  { id: 'GERIR_LISTAS', label: 'Gerir Listas', desc: 'Gerenciar listas de convidados e cotas' },
  { id: 'EMITIR_CORTESIAS', label: 'Emitir Cortesias', desc: 'Enviar cortesias para convidados especiais' },
];
