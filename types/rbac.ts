// ── Listas e Promotoria ────────────────────────────────────────────────────
// ── Permissões granulares de cargos customizados ───────────────────────────
export type PermissaoVanta =
  | 'VER_FINANCEIRO'
  | 'VENDER_PORTA'
  | 'VALIDAR_ENTRADA' // legado — usar CHECKIN_LISTA ou VALIDAR_QR
  | 'CHECKIN_LISTA' // portaria lista: check-in por nome
  | 'VALIDAR_QR' // portaria antecipado: validar QR code
  | 'GERIR_LISTAS'
  | 'GERIR_EQUIPE'
  | 'INSERIR_LISTA' // Promoter: inserir nomes nas cotas pré-alocadas (distinto de GERIR_LISTAS)
  | 'CRIAR_REGRA_LISTA' // Criar novas variações/regras na lista, mas NÃO editar existentes
  | 'VER_LISTA'; // Portaria lista: visualizar nomes da lista (sem editar)

export interface CotaVariacaoConfig {
  variacaoLabel: string; // ex: 'VIP Fem', 'Pista Masc'
  limite: number; // quantos nomes pode inserir nesta variação
}

export interface PermissaoListaConfig {
  ativo: boolean;
  cotas: CotaVariacaoConfig[]; // populado dinamicamente na UI
}

export interface DefinicaoCargoCustom {
  id: string;
  nome: string;
  // Permissões por módulo — default false para todos
  modulos: {
    listas: PermissaoListaConfig; // INSERIR_LISTA com cotas configuráveis
    portaria: boolean; // VALIDAR_ENTRADA
    financeiro: boolean; // VER_FINANCEIRO
    caixa: boolean; // VENDER_PORTA
  };
}

// ── RBAC Multi-Tenant ──────────────────────────────────────────────────────
// Cargo unificado: merge de TipoCargo (comunidade) e PapelEquipeEvento (evento).
// TipoCargo e PapelEquipeEvento são mantidos para compatibilidade retroativa.
export type CargoUnificado =
  | 'GERENTE' // Comunidade/Evento → vanta_gerente
  | 'SOCIO' // Evento only        → vanta_socio
  | 'PROMOTER' // Evento only        → vanta_promoter
  | 'GER_PORTARIA_LISTA' // Ambos → vanta_ger_portaria_lista
  | 'PORTARIA_LISTA' // Ambos → vanta_portaria_lista
  | 'GER_PORTARIA_ANTECIPADO' // Ambos → vanta_ger_portaria_antecipado
  | 'PORTARIA_ANTECIPADO' // Ambos → vanta_portaria_antecipado
  | 'CAIXA'; // Ambos              → vanta_caixa

export type TipoTenant = 'COMUNIDADE' | 'EVENTO';

export interface ContextoTenant {
  tipo: TipoTenant;
  id: string;
  nome: string;
  foto?: string;
}

// Atribuição central: um usuário recebe um Cargo dentro de um Contexto (Boate ou Evento).
export interface AtribuicaoRBAC {
  id: string;
  userId: string;
  tenant: ContextoTenant;
  cargo: CargoUnificado;
  permissoes: PermissaoVanta[]; // granular; pode ser [] se apenas portalRole importar
  atribuidoPor: string; // userId do masteradm
  atribuidoEm: string; // ISO 8601 -03:00
  ativo: boolean;
  cargoCustomId?: string; // referência à DefinicaoCargoCustom quando cargo=PROMOTER customizado
  temAcessoFinanceiro?: boolean; // flag de permissão financeira (substitui vanta_financeiro como cargo)
}

export type RoleLista = 'vanta_gerente' | 'socio' | 'promoter' | 'portaria_lista' | 'portaria_antecipado';

export interface RegraLista {
  id: string;
  label: string; // 'VIP Feminino', 'Social Masculino', etc.
  tetoGlobal: number; // capacidade total desta regra
  saldoBanco: number; // disponível para distribuir (não alocado)
  cor?: string; // hex para identificação visual no check-in
  valor?: number; // preço da regra (0 = gratuito/VIP sem valor)
  horaCorte?: string; // 'HH:MM' — regra expira a partir deste horário (Efeito Abóbora)
  aboboraRegraId?: string; // ID da regra pagante vinculada (Efeito Abóbora)
  genero: 'M' | 'F' | 'U'; // Masculino, Feminino, Unisex — convidado herda da regra
  area?: string; // PISTA, CAMAROTE, AREA_VIP, BACKSTAGE ou valor personalizado
}

export interface CotaPromoter {
  promoterId: string;
  promoterNome: string;
  regraId: string;
  alocado: number; // total alocado ao promoter
  usado: number; // já inserido na lista
}

export interface ConvidadoLista {
  id: string;
  nome: string;
  telefone: string;
  regraId: string;
  regraLabel: string;
  inseridoPor: string; // promoterId
  inseridoPorNome: string;
  inseridoEm: string; // ISO 8601 -03:00
  checkedIn: boolean;
  checkedInEm?: string; // ISO 8601 -03:00 — preenchido ao fazer check-in
  checkedInPorNome?: string; // nome do porteiro que fez check-in
}

export interface ListaEvento {
  id: string;
  eventoId?: string;
  eventoNome: string;
  eventoData: string; // YYYY-MM-DD (início)
  eventoDataFim?: string; // YYYY-MM-DD (fim, opcional)
  eventoLocal: string;
  tetoGlobalTotal: number;
  regras: RegraLista[];
  cotas: CotaPromoter[];
  convidados: ConvidadoLista[];
}
