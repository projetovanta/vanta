/**
 * clubeResgatesService — Aplicação, seleção, check-in e conclusão de deals.
 * Fluxo: APLICADO → SELECIONADO → CHECK_IN → PENDENTE_POST → CONCLUIDO
 * Trigger no banco garante: 1 deal ativo por vez por membro.
 */
import { supabase } from '../../../../services/supabaseClient';
import { tsBR } from '../../../../utils';
import type { ResgateMaisVanta, StatusResgate } from '../../../../types';

function rowToResgate(r: Record<string, unknown>): ResgateMaisVanta {
  return {
    id: r.id as string,
    dealId: r.deal_id as string,
    userId: r.user_id as string,
    parceiroId: r.parceiro_id as string,
    status: r.status as StatusResgate,
    qrToken: r.qr_token as string,
    aplicadoEm: r.aplicado_em as string,
    selecionadoEm: (r.selecionado_em as string) ?? undefined,
    selecionadoPor: (r.selecionado_por as string) ?? undefined,
    checkinEm: (r.checkin_em as string) ?? undefined,
    postUrl: (r.post_url as string) ?? undefined,
    postVerificado: (r.post_verificado as boolean) ?? false,
    postVerificadoEm: (r.post_verificado_em as string) ?? undefined,
    concluidoEm: (r.concluido_em as string) ?? undefined,
    // Joined
    dealTitulo: (r.deal_titulo as string) ?? undefined,
    parceiroNome: (r.parceiro_nome as string) ?? undefined,
    userName: (r.user_name as string) ?? undefined,
    userInstagram: (r.user_instagram as string) ?? undefined,
  };
}

function rowWithJoinToResgate(r: Record<string, unknown>): ResgateMaisVanta {
  const deal = r.deals_mais_vanta as Record<string, unknown> | null;
  const parceiro = r.parceiros_mais_vanta as Record<string, unknown> | null;
  const profile = r.profiles as Record<string, unknown> | null;
  const resgate = rowToResgate(r);
  if (deal) resgate.dealTitulo = deal.titulo as string;
  if (parceiro) resgate.parceiroNome = parceiro.nome as string;
  if (profile) {
    resgate.userName = profile.nome_completo as string;
    resgate.userInstagram = (profile.instagram_handle as string) ?? undefined;
  }
  return resgate;
}

export const clubeResgatesService = {
  /** Membro aplica para um deal (trigger valida 1 ativo por vez) */
  async aplicar(dealId: string, userId: string, parceiroId: string): Promise<{ ok: boolean; erro?: string }> {
    const { error } = await supabase.from('resgates_mais_vanta').insert({
      deal_id: dealId,
      user_id: userId,
      parceiro_id: parceiroId,
      status: 'APLICADO',
      aplicado_em: tsBR(),
    });
    if (error) {
      if (error.message?.includes('deal ativo')) {
        return { ok: false, erro: 'Você já possui um deal ativo. Conclua ou cancele antes de aplicar para outro.' };
      }
      return { ok: false, erro: error.message };
    }
    return { ok: true };
  },

  /** Master/gerente seleciona membro para o deal */
  async selecionar(resgateId: string, selecionadoPor: string): Promise<boolean> {
    const { error } = await supabase
      .from('resgates_mais_vanta')
      .update({
        status: 'SELECIONADO',
        selecionado_em: tsBR(),
        selecionado_por: selecionadoPor,
      })
      .eq('id', resgateId)
      .eq('status', 'APLICADO');
    return !error;
  },

  /** Master/gerente recusa candidatura */
  async recusar(resgateId: string): Promise<boolean> {
    const { error } = await supabase
      .from('resgates_mais_vanta')
      .update({ status: 'RECUSADO' })
      .eq('id', resgateId)
      .eq('status', 'APLICADO');
    return !error;
  },

  /** Portaria escaneia QR → registra check-in */
  async checkin(qrToken: string): Promise<{ ok: boolean; resgate?: ResgateMaisVanta; erro?: string }> {
    const { data } = await supabase
      .from('resgates_mais_vanta')
      .select('*, deals_mais_vanta(titulo), parceiros_mais_vanta(nome), profiles(nome_completo, instagram_handle)')
      .eq('qr_token', qrToken)
      .maybeSingle();
    if (!data) return { ok: false, erro: 'QR inválido' };
    const resgate = rowWithJoinToResgate(data as Record<string, unknown>);
    if (resgate.status !== 'SELECIONADO') {
      return { ok: false, erro: `Status atual: ${resgate.status}. Esperado: SELECIONADO.`, resgate };
    }
    const { error } = await supabase
      .from('resgates_mais_vanta')
      .update({ status: 'CHECK_IN', checkin_em: tsBR() })
      .eq('id', resgate.id);
    if (error) return { ok: false, erro: error.message };
    resgate.status = 'CHECK_IN';
    resgate.checkinEm = tsBR();
    return { ok: true, resgate };
  },

  /** Membro envia URL do post (barter) */
  async enviarPost(resgateId: string, postUrl: string): Promise<boolean> {
    const { error } = await supabase
      .from('resgates_mais_vanta')
      .update({ post_url: postUrl, status: 'PENDENTE_POST' })
      .eq('id', resgateId)
      .in('status', ['CHECK_IN', 'PENDENTE_POST']);
    return !error;
  },

  /** Master verifica post e conclui deal */
  async verificarPost(resgateId: string): Promise<boolean> {
    const now = tsBR();
    const { error } = await supabase
      .from('resgates_mais_vanta')
      .update({
        post_verificado: true,
        post_verificado_em: now,
        status: 'CONCLUIDO',
        concluido_em: now,
      })
      .eq('id', resgateId);
    return !error;
  },

  /** Concluir deal de desconto (sem post) */
  async concluir(resgateId: string): Promise<boolean> {
    const { error } = await supabase
      .from('resgates_mais_vanta')
      .update({ status: 'CONCLUIDO', concluido_em: tsBR() })
      .eq('id', resgateId);
    return !error;
  },

  /** Marcar no-show */
  async noShow(resgateId: string): Promise<boolean> {
    const { error } = await supabase.from('resgates_mais_vanta').update({ status: 'NO_SHOW' }).eq('id', resgateId);
    return !error;
  },

  /** Membro cancela aplicação */
  async cancelar(resgateId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('resgates_mais_vanta')
      .update({ status: 'CANCELADO' })
      .eq('id', resgateId)
      .eq('user_id', userId)
      .in('status', ['APLICADO', 'SELECIONADO']);
    return !error;
  },

  /** Listar resgates de um deal (com joins) */
  async listarPorDeal(dealId: string): Promise<ResgateMaisVanta[]> {
    const { data } = await supabase
      .from('resgates_mais_vanta')
      .select('*, deals_mais_vanta(titulo), parceiros_mais_vanta(nome), profiles(nome_completo, instagram_handle)')
      .eq('deal_id', dealId)
      .order('aplicado_em', { ascending: false });
    return (data ?? []).map(r => rowWithJoinToResgate(r as Record<string, unknown>));
  },

  /** Listar resgates de um membro (com joins) */
  async listarPorUsuario(userId: string): Promise<ResgateMaisVanta[]> {
    const { data } = await supabase
      .from('resgates_mais_vanta')
      .select('*, deals_mais_vanta(titulo), parceiros_mais_vanta(nome)')
      .eq('user_id', userId)
      .order('aplicado_em', { ascending: false });
    return (data ?? []).map(r => rowWithJoinToResgate(r as Record<string, unknown>));
  },

  /** Checa se membro tem deal ativo */
  async temDealAtivo(userId: string): Promise<boolean> {
    const { count } = await supabase
      .from('resgates_mais_vanta')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('status', ['APLICADO', 'SELECIONADO', 'CHECK_IN', 'PENDENTE_POST']);
    return (count ?? 0) > 0;
  },

  /** Buscar resgate por QR token */
  async buscarPorQrToken(qrToken: string): Promise<ResgateMaisVanta | null> {
    const { data } = await supabase
      .from('resgates_mais_vanta')
      .select('*, deals_mais_vanta(titulo), parceiros_mais_vanta(nome), profiles(nome_completo, instagram_handle)')
      .eq('qr_token', qrToken)
      .maybeSingle();
    return data ? rowWithJoinToResgate(data as Record<string, unknown>) : null;
  },
};
