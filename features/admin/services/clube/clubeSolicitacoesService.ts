import type { TierMaisVanta, SolicitacaoClube } from '../../../../types';
import { supabase } from '../../../../services/supabaseClient';
import { comunidadesService } from '../comunidadesService';
import { notificationsService } from '../notificationsService';
import { tsBR } from '../../../../utils';
import { TIER_ORDER, _membros, _solicitacoes, _passports, bump, rowToSolicitacao } from './clubeCache';
import { _fetchAndUpdateFollowers } from './clubeInstagramService';

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

export async function solicitarEntrada(
  userId: string,
  instagramHandle: string,
  seguidores?: number,
  verificacao?: { verificado: boolean; verificadoEm?: string; codigo?: string; comoConheceu?: string },
): Promise<SolicitacaoClube> {
  const row = {
    user_id: userId,
    instagram_handle: instagramHandle,
    instagram_seguidores: seguidores ?? null,
    instagram_verificado: verificacao?.verificado ?? false,
    instagram_verificado_em: verificacao?.verificadoEm ?? null,
    codigo_verificacao: verificacao?.codigo ?? null,
    como_conheceu: verificacao?.comoConheceu ?? null,
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

export async function convidarParaMaisVanta(
  masterId: string,
  membroUserId: string,
  tier: TierMaisVanta,
  enviarNotificacaoClube: (p: {
    userId: string;
    titulo: string;
    corpo: string;
    data?: Record<string, string>;
  }) => Promise<void>,
): Promise<SolicitacaoClube> {
  const { data: profileData } = await supabase
    .from('profiles')
    .select('instagram')
    .eq('id', membroUserId)
    .maybeSingle();
  const igHandle = (profileData?.instagram as string) ?? '';

  const row = {
    user_id: membroUserId,
    instagram_handle: igHandle,
    convidado_por: masterId,
    tier_pre_atribuido: tier,
    status: 'CONVIDADO',
    criado_em: tsBR(),
  };
  const { data, error } = await supabase.from('solicitacoes_clube').insert(row).select().single();
  if (error) throw error;
  const sol = rowToSolicitacao(data);
  _solicitacoes.unshift(sol);
  bump();

  const now = tsBR();
  notificationsService
    .add(
      {
        titulo: 'Convite MAIS VANTA!',
        mensagem: 'Você foi convidado para participar do MAIS VANTA. Toque para aceitar.',
        tipo: 'MAIS_VANTA' as any,
        lida: false,
        link: `CLUBE_CONVITE:${sol.id}`,
        timestamp: now,
      },
      membroUserId,
    )
    .catch(() => {});

  enviarNotificacaoClube({
    userId: membroUserId,
    titulo: 'Convite MAIS VANTA!',
    corpo: 'Você foi convidado para participar do MAIS VANTA. Toque para aceitar.',
    data: { tipo: 'MAIS_VANTA_CONVITE', solicitacaoId: sol.id },
  }).catch(() => {});

  return sol;
}

export async function aceitarConviteMaisVanta(
  solId: string,
  instagramHandle: string,
  verificacao?: { verificado: boolean; verificadoEm?: string; codigo?: string },
  enviarNotificacaoClube?: (p: {
    userId: string;
    titulo: string;
    corpo: string;
    data?: Record<string, string>;
  }) => Promise<void>,
): Promise<void> {
  const sol = _solicitacoes.find(s => s.id === solId);
  if (!sol || sol.status !== 'CONVIDADO') throw new Error('Convite inválido ou já processado');

  const updatePayload: Record<string, unknown> = {
    instagram_handle: instagramHandle,
    instagram_verificado: verificacao?.verificado ?? false,
    instagram_verificado_em: verificacao?.verificadoEm ?? null,
    codigo_verificacao: verificacao?.codigo ?? null,
  };
  const { error: errSol } = await supabase.from('solicitacoes_clube').update(updatePayload).eq('id', solId);
  if (errSol) {
    console.error('[clubeSolicitacoes] completarInstagram:', errSol);
    return;
  }

  sol.instagramHandle = instagramHandle;
  sol.instagramVerificado = verificacao?.verificado ?? false;
  sol.instagramVerificadoEm = verificacao?.verificadoEm;
  sol.codigoVerificacao = verificacao?.codigo;

  const tier = sol.tierPreAtribuido ?? ('desconto' as TierMaisVanta);
  const masterId = sol.convidadoPor ?? '';
  await aprovarSolicitacao(solId, tier, masterId, undefined, enviarNotificacaoClube);
}

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
}

export async function rejeitarSolicitacao(solId: string, masterId: string): Promise<void> {
  const now = tsBR();
  await supabase
    .from('solicitacoes_clube')
    .update({ status: 'REJEITADO', resolvido_em: now, resolvido_por: masterId })
    .eq('id', solId);
  const sol = _solicitacoes.find(s => s.id === solId);
  if (sol) {
    sol.status = 'REJEITADO';
    sol.resolvidoEm = now;
    sol.resolvidoPor = masterId;
    notificationsService
      .add(
        {
          titulo: 'Solicitação não aprovada',
          mensagem:
            'Sua solicitação ao MAIS VANTA não foi aprovada neste momento. Você pode tentar novamente no futuro.',
          tipo: 'MAIS_VANTA' as any,
          lida: false,
          link: 'CLUBE',
          timestamp: now,
        },
        sol.userId,
      )
      .catch(() => {});
  }
  bump();
}
