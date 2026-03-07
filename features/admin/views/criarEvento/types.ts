import type { AreaIngresso, GeneroIngresso, PapelEquipeEvento } from '../../../../types';

// ── Tipos do formulário ─────────────────────────────────────────────────────
export interface VariacaoForm {
  id: string;
  area: AreaIngresso;
  areaCustom: string;
  genero: GeneroIngresso;
  valor: string;
  limite: string;
  requerComprovante: boolean;
  tipoComprovante: string;
  /** Quantidade já vendida — usado para travar preço em edição pós-publicação */
  vendidos?: number;
}

export interface LoteForm {
  id: string;
  dataValidade: string;
  horaValidade: string;
  virarPct: string;
  variacoes: VariacaoForm[];
  aberto: boolean;
}

export type TipoLista = 'VIP' | 'CONSUMO' | 'ENTRADA' | 'OUTRO';
export type GeneroLista = 'MASCULINO' | 'FEMININO' | 'UNISEX';
export type ValidadeTipo = 'NOITE_TODA' | 'HORARIO';

export type AreaLista = 'PISTA' | 'CAMAROTE' | 'AREA_VIP' | 'BACKSTAGE' | string;

export interface VarListaForm {
  id: string;
  tipo: TipoLista;
  cor: string;
  genero: GeneroLista;
  area: AreaLista;
  validadeTipo: ValidadeTipo;
  validadeHora: string;
  ababoraAtivo: boolean;
  ababoraAlvoId: string;
  limite: string;
  valor: string;
}

export interface QuotaForm {
  varListaId: string;
  quantidade: string;
}

export interface EquipeForm {
  id: string;
  membroId: string;
  nome: string;
  email: string;
  foto: string;
  papel: PapelEquipeEvento;
  liberarLista: boolean;
  quotas: QuotaForm[];
}

// ── Novos tipos: fluxo de evento ────────────────────────────────────────────
export type TipoFluxoEvento = 'COM_SOCIO' | 'FESTA_DA_CASA';
export type PermissaoToggle = 'VER_FINANCEIRO' | 'GERIR_LISTAS' | 'EMITIR_CORTESIAS';

export interface SocioConviteForm {
  membroId: string;
  nome: string;
  email: string;
  foto: string;
  permissoes: PermissaoToggle[];
}

export interface SplitForm {
  percentProdutor: string;
  percentSocio: string;
}
