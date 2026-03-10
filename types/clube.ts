// ── Clube de Influência (MAIS VANTA) ─────────────────────────────────────
export type TierMaisVanta = 'desconto' | 'convidado' | 'presenca' | 'creator' | 'vanta_black';

export interface MembroClubeVanta {
  userId: string;
  tier: TierMaisVanta;
  instagramHandle?: string;
  instagramSeguidores?: number;
  instagramVerificado: boolean; // bio check passou na solicitação
  instagramVerificadoEm?: string; // ISO 8601 -03:00
  aprovadoPor: string; // masteradm userId
  aprovadoEm: string; // ISO 8601 -03:00
  convidadoPor?: string; // userId de quem convidou
  ativo: boolean;
  comunidadeOrigem?: string; // MV4: comunidade onde foi aprovado originalmente
  metaUserId?: string; // MV3: Instagram Business Account ID (Graph API)
  castigoAte?: string; // @deprecated — usar bloqueioAte
  castigoMotivo?: string; // @deprecated — usar infrações
  bloqueioNivel: number; // 0=limpo, 1=1º bloqueio, 2=2º bloqueio, 3=banido
  bloqueioAte?: string; // ISO — se set e > now, bloqueado
  banidoPermanente: boolean; // true = excluído definitivamente do MAIS VANTA
  banidoEm?: string; // ISO — quando foi banido
  tags?: string[]; // tags livres (free text)
  notaInterna?: string; // nota interna visível só para admin
  status?: string; // 'ativo' | 'bloqueado' | 'banido' etc.
}

export interface LoteMaisVanta {
  id: string;
  eventoId: string;
  tierMinimo: TierMaisVanta; // @deprecated: legado — usar tierId
  tierId?: string; // tier específico deste lote (ex: 'convidado')
  quantidade: number; // total de vagas
  reservados: number; // já reservados
  prazo?: string; // deadline para reserva (ISO)
  descricao?: string; // ex: "2 ingressos VIP + mesa"
  comAcompanhante?: boolean; // @deprecated: legado — usar acompanhantes
  acompanhantes: number; // número de acompanhantes permitidos (0, 1, 2, 3...)
  tipoAcesso: string; // 'Pista', 'VIP', 'Camarote', etc.
}

export interface ReservaMaisVanta {
  id: string;
  loteMaisVantaId: string;
  eventoId: string;
  userId: string;
  reservadoEm: string; // ISO 8601 -03:00
  status: 'RESERVADO' | 'USADO' | 'CANCELADO' | 'PENDENTE_POST' | 'NO_SHOW';
  postVerificado: boolean; // masteradm confirmou que membro postou
  postUrl?: string; // link/evidência do post
  postDeadlineEm?: string; // ISO 8601 -03:00 — T+24h quando infração será registrada
  postAviso24hEnviado?: boolean; // flag para não reenviar lembrete em T+12h
  infractionRegisteredEm?: string; // ISO 8601 -03:00 — quando infração foi registrada
}

export interface NotificacaoClubePayload {
  userId: string;
  tipo: 'CONFIRMACAO_PRESENCA' | 'EVENTO_INICIOU' | 'EVENTO_TERMINOU' | 'AVISO_FINAL_12H' | 'INFRACACAO_REGISTRADA';
  eventoId: string;
  eventoNome: string;
  reservaId: string;
  titulo: string;
  corpo: string;
  data?: Record<string, string>; // metadados opcionais
}

export interface SolicitacaoClube {
  id: string;
  userId: string;
  instagramHandle: string;
  instagramSeguidores?: number;
  instagramVerificado: boolean; // bio check passou
  instagramVerificadoEm?: string; // ISO 8601 -03:00
  codigoVerificacao?: string; // ex: 'VANTA-K8M2' (para auditoria)
  convidadoPor?: string;
  status: 'PENDENTE' | 'APROVADO' | 'REJEITADO' | 'CONVIDADO';
  criadoEm: string; // ISO 8601 -03:00
  resolvidoEm?: string;
  resolvidoPor?: string;
  tierAtribuido?: TierMaisVanta;
  tierPreAtribuido?: TierMaisVanta; // tier escolhido pelo master ao convidar
  profissao?: string;
  comoConheceu?: string;
}

// ── MV2: Assinatura SaaS MAIS VANTA ────────────────────────────────────────
export type PlanoMaisVanta = 'BASICO' | 'PRO' | 'ENTERPRISE'; // legado, manter para compat
export type StatusAssinatura = 'PENDENTE' | 'ATIVA' | 'CANCELADA' | 'EXPIRADA';

/** Plano dinâmico criado/editado pelo master */
export interface PlanoMaisVantaDef {
  id: string;
  nome: string;
  descricao: string;
  precoMensal: number;
  limiteEventosMV: number; // -1 = ilimitado
  limiteMembros: number; // -1 = ilimitado
  limiteVagasEvento: number;
  tierMinimo: string; // id do tier mínimo (ex: 'desconto')
  acompanhante: boolean;
  prazoPostHoras: number;
  precoAvulso: number;
  ativo: boolean;
  destaque: boolean;
  ordem: number;
  criadoEm: string;
  atualizadoEm: string;
}

/** Tier dinâmico criado/editado pelo master */
export interface TierMaisVantaDef {
  id: string;
  nome: string;
  cor: string;
  ordem: number;
  beneficios: BeneficioId[];
  limiteMensal: number; // -1 = ilimitado
  ativo: boolean;
  criadoEm: string;
}

export interface AssinaturaMaisVanta {
  id: string;
  comunidadeId: string;
  planoId?: string; // referência ao plano dinâmico
  plano: PlanoMaisVanta; // legado (derivado do snapshot)
  planoSnapshot?: PlanoMaisVantaDef;
  status: StatusAssinatura;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  valorMensal: number;
  eventosMVUsados: number;
  inicio?: string;
  fim?: string;
  criadoEm: string;
  criadoPor: string;
}

// ── MV4: Passaporte Regional por Cidade ────────────────────────────────────
export interface PassportAprovacao {
  id: string;
  userId: string;
  /** @deprecated Use `cidade` — passaportes agora são regionais por cidade */
  comunidadeId?: string;
  /** Cidade do passaporte regional (campo principal pós-migração) */
  cidade?: string;
  status: 'PENDENTE' | 'APROVADO' | 'REJEITADO';
  solicitadoEm: string;
  resolvidoEm?: string;
  resolvidoPor?: string;
}

// ── Configuração do Clube MAIS VANTA ──────────────────────────────────────
/** IDs de benefícios selecionáveis por tier */
export type BeneficioId =
  | 'INGRESSO_CORTESIA'
  | 'ACOMPANHANTE'
  | 'PRIORIDADE'
  | 'RESERVA_ANTECIPADA'
  | 'PASSPORT_GLOBAL';

export interface ClubeConfig {
  id: string;
  comunidadeId: string;
  /** Benefícios por tier (convidado/presenca/creator/vanta_black) */
  beneficiosConvidado: BeneficioId[];
  beneficiosPresenca: BeneficioId[];
  beneficiosCreator: BeneficioId[];
  beneficiosVantaBlack: BeneficioId[];
  limiteConvidado: number;
  limitePresenca: number;
  limiteCreator: number;
  limiteVantaBlack: number;
  prazoPostHoras: number;
  infracoesLimite: number; // quantas infrações até próximo bloqueio (default 3)
  bloqueio1Dias: number; // dias do 1º bloqueio (default 30)
  bloqueio2Dias: number; // dias do 2º bloqueio/reincidência (default 60)
}

// ── Infrações MAIS VANTA ──────────────────────────────────────────────────
export interface InfracaoMaisVanta {
  id: string;
  userId: string;
  tipo: 'NO_SHOW' | 'NAO_POSTOU';
  eventoId?: string;
  eventoNome?: string;
  criadoEm: string;
  criadoPor?: string;
}

// ── MAIS VANTA v2 — Deals Marketplace ─────────────────────────────────────

export type CategoriaMembro = 'LIFESTYLE' | 'INFLUENCER' | 'CREATOR' | 'VIP';
export type AlcanceMembro = 'NANO' | 'MICRO' | 'MACRO' | 'MEGA';
export type GeneroMembro = 'M' | 'F' | 'NB';
export type TipoParceiro = 'RESTAURANTE' | 'BAR' | 'CLUB' | 'GYM' | 'SALAO' | 'HOTEL' | 'LOJA' | 'OUTRO';
export type PlanoParceiro = 'STARTER' | 'PRO' | 'ELITE';
export type TipoDeal = 'BARTER' | 'DESCONTO';
export type StatusDeal = 'RASCUNHO' | 'ATIVO' | 'PAUSADO' | 'ENCERRADO' | 'EXPIRADO';
export type StatusResgate =
  | 'APLICADO'
  | 'SELECIONADO'
  | 'RECUSADO'
  | 'CHECK_IN'
  | 'PENDENTE_POST'
  | 'CONCLUIDO'
  | 'NO_SHOW'
  | 'EXPIRADO'
  | 'CANCELADO';

export interface CidadeMaisVanta {
  id: string;
  nome: string;
  estado?: string;
  pais: string;
  ativo: boolean;
  gerenteId?: string;
  criadoEm: string;
  criadoPor: string;
}

export interface ParceiroMaisVanta {
  id: string;
  nome: string;
  tipo: TipoParceiro;
  descricao?: string;
  fotoUrl?: string;
  endereco?: string;
  cidadeId: string;
  instagramHandle?: string;
  contatoNome?: string;
  contatoTelefone?: string;
  contatoEmail?: string;
  plano: PlanoParceiro;
  planoInicio?: string;
  planoFim?: string;
  resgatesMesLimite: number;
  resgatesMesUsados: number;
  trialAtivo: boolean;
  userId?: string;
  ativo: boolean;
  criadoEm: string;
  criadoPor: string;
}

export interface DealMaisVanta {
  id: string;
  parceiroId: string;
  cidadeId: string;
  titulo: string;
  descricao?: string;
  fotoUrl?: string;
  tipo: TipoDeal;
  obrigacaoBarter?: string;
  descontoPercentual?: number;
  descontoValor?: number;
  filtroGenero?: GeneroMembro;
  filtroAlcance: string[];
  filtroCategoria: string[];
  vagas: number;
  vagasPreenchidas: number;
  inicio: string;
  fim?: string;
  status: StatusDeal;
  criadoEm: string;
  atualizadoEm?: string;
  // Joined
  parceiroNome?: string;
  parceiroFotoUrl?: string;
  cidadeNome?: string;
}

export interface ResgateMaisVanta {
  id: string;
  dealId: string;
  userId: string;
  parceiroId: string;
  status: StatusResgate;
  qrToken: string;
  aplicadoEm: string;
  selecionadoEm?: string;
  selecionadoPor?: string;
  checkinEm?: string;
  postUrl?: string;
  postVerificado: boolean;
  postVerificadoEm?: string;
  concluidoEm?: string;
  // Joined
  dealTitulo?: string;
  parceiroNome?: string;
  userName?: string;
  userInstagram?: string;
}
