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
  desconto: 0,
  convidado: 1,
  presenca: 2,
  creator: 3,
  vanta_black: 4,
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
  tier: (r.tier as TierMaisVanta) ?? 'desconto',
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
  tierMinimo: 'convidado' as TierMaisVanta,
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
  status: 'RESERVADO',
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
});

export const rowToConfig = (r: ClubeConfigRow) => ({
  id: r.id,
  comunidadeId: r.comunidade_id,
  beneficiosBronze: (r.beneficios_bronze as BeneficioId[]) ?? [],
  beneficiosPrata: (r.beneficios_prata as BeneficioId[]) ?? [],
  beneficiosOuro: (r.beneficios_ouro as BeneficioId[]) ?? [],
  beneficiosDiamante: (r.beneficios_diamante as BeneficioId[]) ?? [],
  limiteBronze: r.limite_bronze ?? 0,
  limitePrata: r.limite_prata ?? 0,
  limiteOuro: r.limite_ouro ?? 0,
  limiteDiamante: r.limite_diamante ?? 0,
  prazoPostHoras: r.prazo_post_horas ?? 12,
  infracoesLimite: r.infracoes_limite ?? 3,
  bloqueio1Dias: r.bloqueio1_dias ?? 30,
  bloqueio2Dias: r.bloqueio2_dias ?? 60,
});
