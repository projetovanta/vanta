import type { VariacaoForm, LoteForm, VarListaForm } from './types';
import { COR_PALETTE } from './constants';

export const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

export const novaVar = (): VariacaoForm => ({
  id: uid(),
  area: 'PISTA',
  areaCustom: '',
  genero: 'UNISEX',
  valor: '',
  limite: '',
  requerComprovante: false,
  tipoComprovante: '',
});

export const novoLote = (): LoteForm => ({
  id: uid(),
  dataValidade: '',
  horaValidade: '',
  virarPct: '',
  variacoes: [novaVar()],
  aberto: true,
});

export const novaVarLista = (count = 0): VarListaForm => ({
  id: uid(),
  tipo: 'ENTRADA',
  cor: COR_PALETTE[count % COR_PALETTE.length],
  genero: 'UNISEX',
  area: 'PISTA',
  validadeTipo: 'NOITE_TODA',
  validadeHora: '',
  ababoraAtivo: false,
  ababoraAlvoId: '',
  limite: '',
  valor: '',
});

export const buildLabel = (v: VarListaForm): string => {
  const tipo = v.tipo === 'VIP' ? 'VIP' : v.tipo === 'CONSUMO' ? 'Consumo' : v.tipo === 'ENTRADA' ? 'Entrada' : 'Outro';
  const gen = v.genero === 'MASCULINO' ? 'Masc.' : v.genero === 'FEMININO' ? 'Fem.' : 'Unissex';
  const hora = v.validadeTipo === 'HORARIO' && v.validadeHora ? ` até ${v.validadeHora}` : '';
  const val = v.tipo !== 'VIP' && v.valor ? ` R$${v.valor}` : '';
  return `${tipo} ${gen}${hora}${val}`;
};
