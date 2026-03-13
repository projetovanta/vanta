/**
 * clubeConviteEspecialService — Convite especial do Vanta para membros em eventos
 * V3 S6: Admin seleciona membros (individual ou por filtro) e envia notificação
 */
import { supabase } from '../../../../services/supabaseClient';
import { tsBR } from '../../../../utils';
import { notificationsService } from '../notificationsService';
import type { TierMaisVanta } from '../../../../types';

interface ConviteEspecialMV {
  id: string;
  eventoId: string;
  userId: string;
  beneficioId?: string;
  enviadoPor: string;
  mensagem: string;
  status: 'ENVIADO' | 'VISTO' | 'RESGATADO' | 'IGNORADO';
  criadoEm: string;
}

export interface FiltroMembros {
  tier?: TierMaisVanta;
  cidade?: string;
  tags?: string[];
  creatorSublevelMinimo?: string;
}

/** Buscar membros elegíveis por filtro */
export async function buscarMembrosPorFiltro(
  filtro: FiltroMembros,
): Promise<{ userId: string; nome: string; tier: string; cidade?: string }[]> {
  let q = (supabase as any)
    .from('membros_clube')
    .select(
      'user_id, tier, creator_sublevel, cidade_principal, cidades_ativas, profiles!membros_clube_user_id_fkey(nome)',
    )
    .eq('ativo', true);
  if (filtro.tier) q = q.eq('tier', filtro.tier);
  if (filtro.cidade) q = q.contains('cidades_ativas', [filtro.cidade]);
  if (filtro.tags && filtro.tags.length > 0) q = q.contains('tags', filtro.tags);
  const { data } = (await q) as { data: Record<string, unknown>[] | null };
  const membros = (data ?? []).map(r => ({
    userId: r.user_id as string,
    nome: ((r.profiles as Record<string, unknown> | null)?.nome as string) ?? '',
    tier: r.tier as string,
    cidade: r.cidade_principal as string | undefined,
    creatorSublevel: r.creator_sublevel as string | undefined,
  }));
  // Filtrar por creator sublevel se especificado
  if (filtro.creatorSublevelMinimo) {
    const subOrder = ['creator_200k', 'creator_500k', 'creator_1m'];
    const minimoIdx = subOrder.indexOf(filtro.creatorSublevelMinimo);
    return membros.filter(m => {
      if (m.tier !== 'creator') return false;
      const idx = subOrder.indexOf(m.creatorSublevel ?? '');
      return idx >= minimoIdx;
    });
  }
  return membros;
}

/** Enviar convite especial para membros selecionados */
export async function enviarConvitesEspeciais(
  eventoId: string,
  eventoNome: string,
  userIds: string[],
  adminId: string,
  mensagem: string,
  beneficioId?: string,
): Promise<{ enviados: number; erros: number }> {
  const now = tsBR();
  let enviados = 0;
  let erros = 0;

  for (const userId of userIds) {
    const { error } = await supabase.from('mv_convites_especiais').insert({
      evento_id: eventoId,
      user_id: userId,
      beneficio_id: beneficioId ?? null,
      enviado_por: adminId,
      mensagem,
      status: 'ENVIADO',
      criado_em: now,
    } as never);

    if (error) {
      erros++;
      continue;
    }
    enviados++;

    // Enviar notificação in-app
    notificationsService
      .add(
        {
          titulo: 'Convite especial MAIS VANTA',
          mensagem: mensagem || `Você foi convidado para o evento ${eventoNome}. Confira seu benefício!`,
          tipo: 'MV_CONVITE_ESPECIAL' as never,
          lida: false,
          link: `EVENTO:${eventoId}`,
          timestamp: now,
        },
        userId,
      )
      .catch(() => {});
  }

  return { enviados, erros };
}

/** Listar convites especiais de um evento */
export async function listarConvitesEspeciaisEvento(eventoId: string): Promise<ConviteEspecialMV[]> {
  const { data } = await supabase
    .from('mv_convites_especiais')
    .select('*')
    .eq('evento_id', eventoId)
    .order('criado_em', { ascending: false });
  return (data ?? []).map(r => {
    const row = r as Record<string, unknown>;
    return {
      id: row.id as string,
      eventoId: row.evento_id as string,
      userId: row.user_id as string,
      beneficioId: row.beneficio_id as string | undefined,
      enviadoPor: row.enviado_por as string,
      mensagem: (row.mensagem as string) ?? '',
      status: row.status as ConviteEspecialMV['status'],
      criadoEm: row.criado_em as string,
    };
  });
}
