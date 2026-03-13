/**
 * clubeCache — Estado compartilhado do Clube de Influência (MAIS VANTA).
 * Todos os sub-services importam daqui para ler/escrever cache.
 */
import type {
  TierMaisVanta,
  TierMaisVantaDef,
  MembroClubeVanta,
  LoteMaisVanta,
  ReservaMaisVanta,
  SolicitacaoClube,
  PassportAprovacao,
  BeneficioId,
} from '../../../../types';
import type { Database } from '../../../../types/supabase';

type TierRow = Database['public']['Tables']['tiers_mais_vanta']['Row'];
type MembroRow = Database['public']['Tables']['membros_clube']['Row'];
type SolicitacaoRow = Database['public']['Tables']['solicitacoes_clube']['Row'];
type PassportRow = Database['public']['Tables']['passport_aprovacoes']['Row'];
type ClubeConfigRow = Database['public']['Tables']['clube_config']['Row'];

// ── Hierarquia de tiers (legado para compat) ─────────────────────────────────
/** @deprecated Use clubeService.getTiers() para tiers dinâmicos */
export const TIER_ORDER: Record<TierMaisVanta, number> = {
  lista: 0,
  presenca: 1,
  social: 2,
  creator: 3,
  black: 4,
};

// ── Cache de tiers dinâmicos ─────────────────────────────────────────────────
export const _tiersDef = new Map<string, TierMaisVantaDef>();

// ── Cache local ──────────────────────────────────────────────────────────────
export const _membros = new Map<string, MembroClubeVanta>();
export const _lotes: LoteMaisVanta[] = [];
export const _reservas: ReservaMaisVanta[] = [];
export const _solicitacoes: SolicitacaoClube[] = [];
export const _passports: PassportAprovacao[] = [];

let _version = 0;
export const bump = () => {
  _version++;
};
export const getCacheVersion = () => _version;

// ── Mappers ──────────────────────────────────────────────────────────────────
export const rowToTierDef = (r: TierRow): TierMaisVantaDef => ({
  id: r.id ?? '',
  nome: r.nome ?? '',
  cor: r.cor ?? '#CD7F32',
  ordem: r.ordem ?? 1,
  beneficios: (r.beneficios as BeneficioId[]) ?? [],
  limiteMensal: r.limite_mensal ?? 5,
  ativo: r.ativo ?? true,
  criadoEm: r.criado_em ?? '',
});

export const rowToMembro = (r: MembroRow): MembroClubeVanta => ({
  userId: r.user_id ?? '',
  tier: (r.tier as TierMaisVanta) ?? 'lista',
  creatorSublevel: (r as Record<string, unknown>).creator_sublevel as MembroClubeVanta['creatorSublevel'],
  instagramHandle: r.instagram_handle ?? undefined,
  instagramSeguidores: r.instagram_seguidores ?? undefined,
  aprovadoPor: r.aprovado_por ?? '',
  aprovadoEm: r.aprovado_em ?? '',
  convidadoPor: r.convidado_por ?? undefined,
  ativo: r.ativo ?? true,
  comunidadeOrigem: r.comunidade_origem ?? undefined,
  metaUserId: r.meta_user_id ?? undefined,
  castigoAte: r.castigo_ate ?? undefined,
  castigoMotivo: r.castigo_motivo ?? undefined,
  bloqueioNivel: r.bloqueio_nivel ?? 0,
  bloqueioAte: r.bloqueio_ate ?? undefined,
  banidoPermanente: r.banido_permanente ?? false,
  banidoEm: r.banido_em ?? undefined,
  instagramVerificado: r.instagram_verificado ?? false,
  instagramVerificadoEm: r.instagram_verificado_em ?? undefined,
  tags: (r.tags as string[]) ?? undefined,
  notaInterna: r.nota_interna ?? undefined,
  status: (r.status as MembroClubeVanta['status']) ?? undefined,
  cidadePrincipal: (r as Record<string, unknown>).cidade_principal as string | undefined,
  cidadesAtivas: (r as Record<string, unknown>).cidades_ativas as string[] | undefined,
  convitesDisponiveis: (r as Record<string, unknown>).convites_disponiveis as number | undefined,
  convitesUsados: (r as Record<string, unknown>).convites_usados as number | undefined,
});

export const rowToPassport = (r: PassportRow): PassportAprovacao => ({
  id: r.id ?? '',
  userId: r.user_id ?? '',
  comunidadeId: r.comunidade_id ?? undefined,
  cidade: r.cidade ?? undefined,
  status: (r.status as PassportAprovacao['status']) ?? 'PENDENTE',
  solicitadoEm: r.solicitado_em ?? '',
  resolvidoEm: r.resolvido_em ?? undefined,
  resolvidoPor: r.resolvido_por ?? undefined,
});

/** @deprecated lotes_mais_vanta dropada — substituída por mais_vanta_lotes_evento */
export const rowToLote = (_r: Record<string, unknown>): LoteMaisVanta => ({
  id: '',
  eventoId: '',
  tierMinimo: 'lista' as TierMaisVanta,
  quantidade: 0,
  reservados: 0,
  acompanhantes: 0,
  tipoAcesso: 'Pista',
});

/** @deprecated reservas_mais_vanta dropada */
export const rowToReserva = (_r: Record<string, unknown>): ReservaMaisVanta => ({
  id: '',
  loteMaisVantaId: '',
  eventoId: '',
  userId: '',
  reservadoEm: '',
  status: 'RESGATADO',
  postVerificado: false,
});

export const rowToSolicitacao = (r: SolicitacaoRow): SolicitacaoClube => ({
  id: r.id ?? '',
  userId: r.user_id ?? '',
  instagramHandle: r.instagram_handle ?? '',
  instagramSeguidores: r.instagram_seguidores ?? undefined,
  instagramVerificado: r.instagram_verificado ?? false,
  instagramVerificadoEm: r.instagram_verificado_em ?? undefined,
  codigoVerificacao: r.codigo_verificacao ?? undefined,
  convidadoPor: r.convidado_por ?? undefined,
  status: (r.status as SolicitacaoClube['status']) ?? 'PENDENTE',
  criadoEm: r.criado_em ?? '',
  resolvidoEm: r.resolvido_em ?? undefined,
  resolvidoPor: r.resolvido_por ?? undefined,
  tierAtribuido: (r.tier_atribuido as TierMaisVanta) ?? undefined,
  tierPreAtribuido: (r.tier_pre_atribuido as TierMaisVanta) ?? undefined,
  profissao: (r as Record<string, unknown>).profissao as string | undefined,
  comoConheceu: (r as Record<string, unknown>).como_conheceu as string | undefined,
  indicadoPorTexto: (r as Record<string, unknown>).indicado_por_texto as string | undefined,
  indicadoPor: (r as Record<string, unknown>).indicado_por as string | undefined,
  conviteId: (r as Record<string, unknown>).convite_id as string | undefined,
  cidade: (r as Record<string, unknown>).cidade as string | undefined,
  baldeSugerido: (r as Record<string, unknown>).balde_sugerido as string | undefined,
});

export const rowToConfig = (r: ClubeConfigRow) => ({
  id: r.id,
  comunidadeId: r.comunidade_id,
  // DB columns bronze/prata/ouro/diamante → app tiers lista/presenca/social/creator/black
  beneficiosLista: (r.beneficios_bronze as BeneficioId[]) ?? [],
  beneficiosPresenca: (r.beneficios_prata as BeneficioId[]) ?? [],
  beneficiosCreator: (r.beneficios_ouro as BeneficioId[]) ?? [],
  beneficiosBlack: (r.beneficios_diamante as BeneficioId[]) ?? [],
  limiteLista: r.limite_bronze ?? 0,
  limitePresenca: r.limite_prata ?? 0,
  limiteCreator: r.limite_ouro ?? 0,
  limiteBlack: r.limite_diamante ?? 0,
  prazoPostHoras: r.prazo_post_horas ?? 12,
  infracoesLimite: r.infracoes_limite ?? 3,
  bloqueio1Dias: r.bloqueio1_dias ?? 30,
  bloqueio2Dias: r.bloqueio2_dias ?? 60,
  convitesLista: ((r as Record<string, unknown>).convites_lista as number) ?? 1,
  convitesPresenca: ((r as Record<string, unknown>).convites_presenca as number) ?? 3,
  convitesSocial: ((r as Record<string, unknown>).convites_social as number) ?? 5,
  convitesCreator: ((r as Record<string, unknown>).convites_creator as number) ?? 7,
  convitesBlack: ((r as Record<string, unknown>).convites_black as number) ?? 10,
});
