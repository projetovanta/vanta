import type { TierMaisVanta, SolicitacaoClube } from '../../../../types';
import { supabase } from '../../../../services/supabaseClient';
import { comunidadesService } from '../comunidadesService';
import { notificationsService } from '../notificationsService';
import { notifyMany } from '../../../../services/notifyService';
import { tsBR } from '../../../../utils';
import { TIER_ORDER, _membros, _solicitacoes, _passports, bump, rowToSolicitacao } from './clubeCache';
import { _fetchAndUpdateFollowers } from './clubeInstagramService';
import { gerarConvitesIniciais, buscarConvitePorCodigo, usarConvite } from './clubeConvitesIndicacaoService';
import { getConfig } from './clubeConfigService';

export function getSolicitacoesPendentes(): SolicitacaoClube[] {
  return _solicitacoes.filter(s => s.status === 'PENDENTE');
}

export function getSolicitacoes(): SolicitacaoClube[] {
  return [..._solicitacoes];
}

export function getAllSolicitacoes(): SolicitacaoClube[] {
  return [..._solicitacoes];
}

export function getSolicitacaoByUserId(userId: string): SolicitacaoClube | null {
  return _solicitacoes.find(s => s.userId === userId) ?? null;
}

function calcularBalde(seguidores?: number): string {
  if (seguidores && seguidores >= 200_000) return 'provavel_creator';
  if (seguidores && seguidores >= 5_000) return 'provavel_presenca';
  return 'sem_fit_claro';
}

export async function solicitarEntrada(
  userId: string,
  instagramHandle: string,
  seguidores?: number,
  verificacao?: {
    verificado: boolean;
    verificadoEm?: string;
    codigo?: string;
    comoConheceu?: string;
    profissao?: string;
    indicadoPor?: string;
    cidade?: string;
    conviteCodigo?: string;
    frequencia?: string;
  },
): Promise<SolicitacaoClube> {
  // Se veio por convite de indicação, buscar dados do convite
  let indicadoPorId: string | null = null;
  let conviteId: string | null = null;
  if (verificacao?.conviteCodigo) {
    const convite = await buscarConvitePorCodigo(verificacao.conviteCodigo);
    if (convite) {
      indicadoPorId = convite.membroId;
      conviteId = convite.id;
      await usarConvite(verificacao.conviteCodigo, userId);
      // Atualizar contadores do membro que indicou
      const indicador = _membros.get(indicadoPorId);
      if (indicador) {
        const novosUsados = (indicador.convitesUsados ?? 0) + 1;
        const novosDisp = Math.max(0, (indicador.convitesDisponiveis ?? 0) - 1);
        await supabase
          .from('membros_clube')
          .update({ convites_usados: novosUsados, convites_disponiveis: novosDisp })
          .eq('user_id', indicadoPorId);
        indicador.convitesUsados = novosUsados;
        indicador.convitesDisponiveis = novosDisp;
      }
    }
  }

  // Calcular balde — se indicado por creator/black, usar balde especial
  let balde = calcularBalde(seguidores);
  if (indicadoPorId) {
    const indicador = _membros.get(indicadoPorId);
    if (indicador && (indicador.tier === 'creator' || indicador.tier === 'black')) {
      balde = 'indicado_tier_alto';
    }
  }

  const row = {
    user_id: userId,
    instagram_handle: instagramHandle,
    instagram_seguidores: seguidores ?? null,
    instagram_verificado: verificacao?.verificado ?? false,
    instagram_verificado_em: verificacao?.verificadoEm ?? null,
    codigo_verificacao: verificacao?.codigo ?? null,
    como_conheceu: verificacao?.comoConheceu ?? null,
    profissao: verificacao?.profissao ?? null,
    indicado_por_texto: verificacao?.indicadoPor ?? null,
    indicado_por: indicadoPorId,
    convite_id: conviteId,
    cidade: verificacao?.cidade ?? null,
    frequencia: verificacao?.frequencia ?? null,
    balde_sugerido: balde,
    status: 'PENDENTE',
    criado_em: tsBR(),
  };
  const { data, error } = await supabase.from('solicitacoes_clube').insert(row).select().single();
  if (error) throw error;
  const sol = rowToSolicitacao(data);
  _solicitacoes.unshift(sol);
  bump();

  // Notificar masters sobre nova solicitação MV
  try {
    const { data: masters } = await supabase.from('profiles').select('id').eq('role', 'vanta_masteradm');
    const masterIds = (masters ?? []).map((m: { id: string }) => m.id);
    if (masterIds.length > 0) {
      void notifyMany(masterIds, {
        titulo: 'Nova solicitação MAIS VANTA',
        mensagem: `@${instagramHandle} quer entrar no MAIS VANTA.`,
        tipo: 'MAIS_VANTA',
        link: 'ADMIN_HUB',
      });
    }
  } catch {
    /* silencioso */
  }

  return sol;
}

export async function convidarAmigo(
  userId: string,
  amigoUserId: string,
  instagramHandle: string,
  seguidores?: number,
): Promise<SolicitacaoClube> {
  const row = {
    user_id: amigoUserId,
    instagram_handle: instagramHandle,
    instagram_seguidores: seguidores ?? null,
    convidado_por: userId,
    status: 'PENDENTE',
    criado_em: tsBR(),
  };
  const { data, error } = await supabase.from('solicitacoes_clube').insert(row).select().single();
  if (error) throw error;
  const sol = rowToSolicitacao(data);
  _solicitacoes.unshift(sol);
  bump();
  return sol;
}

/** @removed V3: convites agora são links de indicação membro→membro, não admin→membro */

export async function aprovarSolicitacao(
  solId: string,
  tier: TierMaisVanta,
  masterId: string,
  comunidadeId?: string,
  enviarNotificacaoClube?: (p: {
    userId: string;
    titulo: string;
    corpo: string;
    data?: Record<string, string>;
  }) => Promise<void>,
  tags?: string[],
  notaInterna?: string,
): Promise<void> {
  const sol = _solicitacoes.find(s => s.id === solId);
  if (!sol) return;

  const now = tsBR();

  await supabase
    .from('solicitacoes_clube')
    .update({ status: 'APROVADO', resolvido_em: now, resolvido_por: masterId, tier_atribuido: tier })
    .eq('id', solId);

  const membroRow: Record<string, unknown> = {
    user_id: sol.userId,
    tier,
    instagram_handle: sol.instagramHandle,
    instagram_seguidores: sol.instagramSeguidores ?? null,
    instagram_verificado: sol.instagramVerificado ?? false,
    instagram_verificado_em: sol.instagramVerificadoEm ?? null,
    aprovado_por: masterId,
    aprovado_em: now,
    convidado_por: sol.convidadoPor ?? null,
    ativo: true,
    comunidade_origem: comunidadeId ?? null,
    ...(tags && tags.length > 0 ? { tags } : {}),
    ...(notaInterna ? { nota_interna: notaInterna } : {}),
  };
  const { error: errMembro } = await supabase.from('membros_clube').insert(membroRow as never);
  if (errMembro) console.error('[clubeSolicitacoes] aprovar membro insert:', errMembro);

  if (comunidadeId) {
    const comOrigem = comunidadesService.getAll().find((c: { id: string }) => c.id === comunidadeId);
    const cidadeOrigem = comOrigem?.cidade;
    if (cidadeOrigem) {
      const { error: errPass } = await supabase.from('passport_aprovacoes').upsert(
        {
          user_id: sol.userId,
          cidade: cidadeOrigem,
          status: 'APROVADO',
          solicitado_em: now,
          resolvido_em: now,
          resolvido_por: masterId,
        },
        { onConflict: 'user_id,cidade' },
      );
      if (errPass) console.error('[clubeSolicitacoes] passport upsert:', errPass);
      _passports.push({
        id: `auto_${sol.userId}_${cidadeOrigem}`,
        userId: sol.userId,
        cidade: cidadeOrigem,
        status: 'APROVADO',
        solicitadoEm: now,
        resolvidoEm: now,
        resolvidoPor: masterId,
      });
    }
  }

  sol.status = 'APROVADO';
  sol.resolvidoEm = now;
  sol.resolvidoPor = masterId;
  sol.tierAtribuido = tier;

  _membros.set(sol.userId, {
    userId: sol.userId,
    tier,
    instagramHandle: sol.instagramHandle,
    instagramSeguidores: sol.instagramSeguidores,
    instagramVerificado: sol.instagramVerificado ?? false,
    instagramVerificadoEm: sol.instagramVerificadoEm,
    aprovadoPor: masterId,
    aprovadoEm: now,
    convidadoPor: sol.convidadoPor,
    ativo: true,
    comunidadeOrigem: comunidadeId,
    bloqueioNivel: 0,
    banidoPermanente: false,
  });
  bump();

  if (sol.instagramHandle) {
    _fetchAndUpdateFollowers(sol.userId, sol.instagramHandle).catch(() => {});
  }

  notificationsService
    .add(
      {
        titulo: 'Bem-vindo ao MAIS VANTA!',
        mensagem: 'Boas notícias! Você foi aprovado no MAIS VANTA e já pode aproveitar vantagens exclusivas.',
        tipo: 'MAIS_VANTA' as any,
        lida: false,
        link: 'CLUBE',
        timestamp: now,
      },
      sol.userId,
    )
    .catch(() => {});

  enviarNotificacaoClube?.({
    userId: sol.userId,
    titulo: 'Bem-vindo ao MAIS VANTA!',
    corpo: 'Boas notícias! Você foi aprovado no MAIS VANTA e já pode aproveitar vantagens exclusivas.',
    data: { tipo: 'MAIS_VANTA_APROVADO' },
  }).catch(() => {});

  // Gerar convites de indicação iniciais conforme config do tier
  if (comunidadeId) {
    getConfig(comunidadeId)
      .then(cfg => {
        if (!cfg) return;
        const convitesPorTier: Record<string, number> = {
          lista: cfg.convitesLista,
          presenca: cfg.convitesPresenca,
          social: cfg.convitesSocial,
          creator: cfg.convitesCreator,
          black: cfg.convitesBlack,
        };
        const qtd = convitesPorTier[tier] ?? 1;
        gerarConvitesIniciais(sol.userId, qtd)
          .then(() => {
            // Atualizar contadores no membro
            supabase
              .from('membros_clube')
              .update({ convites_disponiveis: qtd, convites_usados: 0 })
              .eq('user_id', sol.userId)
              .then(() => {});
          })
          .catch(() => {});
      })
      .catch(() => {});
  }

  // Notificar quem indicou (se veio por convite de outro membro)
  if (sol.indicadoPor) {
    const indicadorMembro = _membros.get(sol.indicadoPor);
    if (indicadorMembro) {
      notificationsService
        .add(
          {
            titulo: 'Sua indicação foi aprovada!',
            mensagem: 'Alguém que você indicou acabou de ser aprovado no MAIS VANTA!',
            tipo: 'MAIS_VANTA' as any,
            lida: false,
            link: 'CLUBE',
            timestamp: now,
          },
          sol.indicadoPor,
        )
        .catch(() => {});
      enviarNotificacaoClube?.({
        userId: sol.indicadoPor,
        titulo: 'Sua indicação foi aprovada!',
        corpo: 'Alguém que você indicou acabou de ser aprovado no MAIS VANTA!',
        data: { tipo: 'MV_INDICACAO_APROVADA' },
      }).catch(() => {});
    }
  }
}

/** @removed V3: não existe rejeição — todo mundo é aprovado em pelo menos LISTA */

/** Adiar solicitação — remove da fila de pendentes sem aprovar nem rejeitar */
export async function adiarSolicitacao(solId: string): Promise<void> {
  await supabase.from('solicitacoes_clube').update({ status: 'ADIADO' }).eq('id', solId);
  const sol = _solicitacoes.find(s => s.id === solId);
  if (sol) sol.status = 'ADIADO' as SolicitacaoClube['status'];
  bump();
}
