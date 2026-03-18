import { Membro, CargoUnificado, Notificacao, PermissaoListaConfig, PermissaoVanta } from '../../../../types';

// ── Props do componente principal ────────────────────────────────────────────
export interface DefinirCargosProps {
  onBack: () => void;
  currentUserId: string;
  addNotification: (n: Omit<Notificacao, 'id'>) => void;
  /** Quando true, esconde header próprio (usado dentro do CargosUnificadoView) */
  embedded?: boolean;
}

// ── Estado do cargo customizado ──────────────────────────────────────────────
export interface CargoCustomState {
  nome: string;
  listas: PermissaoListaConfig;
  portaria: boolean;
  financeiro: boolean;
  caixa: boolean;
}

export const cargoCustomVazio = (): CargoCustomState => ({
  nome: '',
  listas: { ativo: false, cotas: [] },
  portaria: false,
  financeiro: false,
  caixa: false,
});

// ── Membro para importação ───────────────────────────────────────────────────
export interface MembroImportacao {
  userId: string;
  nome: string;
  foto?: string;
  cargoOriginal: CargoUnificado;
  permissoes: PermissaoVanta[];
  selecionado: boolean;
  expandido: boolean;
}

// ── Destino (comunidade ou evento) ───────────────────────────────────────────
export interface DestinoOption {
  tipo: 'COMUNIDADE' | 'EVENTO';
  id: string;
  nome: string;
}

// ── Constantes de estilo (re-export do constants.ts global) ──────────────────
export { inputCls, labelCls } from '../../../../constants';

// ── Cargos pré-definidos ─────────────────────────────────────────────────────
export const CARGOS_PREDEFINIDOS: { id: CargoUnificado; label: string; desc: string }[] = [
  { id: 'GERENTE', label: 'Gerente', desc: 'Acesso total: financeiro, equipe, eventos e comunidade' },
  { id: 'SOCIO', label: 'Sócio', desc: 'Cria e gerencia eventos, vê financeiro dos seus eventos' },
  { id: 'PROMOTER', label: 'Promoter', desc: 'Gerencia listas e convites, vê relatório de vendas' },
  { id: 'GER_PORTARIA_LISTA', label: 'Ger. Portaria (Lista)', desc: 'Coordena equipe de portaria de listas' },
  { id: 'PORTARIA_LISTA', label: 'Portaria (Lista)', desc: 'Check-in de convidados da lista na entrada' },
  {
    id: 'GER_PORTARIA_ANTECIPADO',
    label: 'Ger. Portaria (Antecipado)',
    desc: 'Coordena equipe de portaria de antecipados',
  },
  { id: 'PORTARIA_ANTECIPADO', label: 'Portaria (Antecipado)', desc: 'Check-in de ingressos antecipados na entrada' },
  { id: 'CAIXA', label: 'Caixa', desc: 'Vende ingressos e registra consumação no evento' },
];

// ── Variações genéricas para destino COMUNIDADE ──────────────────────────────
export const VARIACOES_GENERICAS = ['VIP', 'Social', 'Open Bar', 'Camarote', 'Pista'];

// ── Labels de permissões ─────────────────────────────────────────────────────
export const PERM_LABELS: { id: PermissaoVanta; label: string; sub: string }[] = [
  { id: 'INSERIR_LISTA', label: 'Inserir na Lista', sub: 'Adicionar convidados' },
  { id: 'CRIAR_REGRA_LISTA', label: 'Criar Variações', sub: 'Criar novas regras na lista (sem editar existentes)' },
  { id: 'CHECKIN_LISTA', label: 'Check-in por Lista', sub: 'Validar entradas via lista' },
  { id: 'VALIDAR_QR', label: 'Validar QR Code', sub: 'Scanner de QR para antecipados' },
  { id: 'VER_FINANCEIRO', label: 'Financeiro', sub: 'Relatórios somente leitura' },
  { id: 'VENDER_PORTA', label: 'Venda na Porta', sub: 'Opera o caixa' },
  { id: 'GERIR_LISTAS', label: 'Gerir Listas', sub: 'Gerenciar cotas e promoters' },
  { id: 'GERIR_EQUIPE', label: 'Gerir Equipe', sub: 'Adicionar / remover membros' },
];
