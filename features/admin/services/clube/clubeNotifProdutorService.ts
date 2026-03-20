/**
 * clubeNotifProdutorService — Solicitações de notificação do produtor para membros MV
 * V3 S5.6: Produtor pede ao Vanta para notificar membros. Consome limite do plano.
 */
import { supabase } from '../../../../services/supabaseClient';
import { tsBR } from '../../../../utils';
import { getPlanoAtivoProdutor } from './clubePlanosService';

export interface SolicitacaoNotifMV {
  id: string;
  eventoId: string;
  produtorId: string;
  mensagem: string;
  status: 'PENDENTE' | 'APROVADA' | 'REJEITADA' | 'ENVIADA';
  membrosNotificados: number;
  resolvidoPor?: string;
  resolvidoEm?: string;
  criadoEm: string;
}

function rowToSolicitacao(r: Record<string, unknown>): SolicitacaoNotifMV {
  return {
    id: r.id as string,
    eventoId: r.evento_id as string,
    produtorId: r.produtor_id as string,
    mensagem: (r.mensagem as string) ?? '',
    status: r.status as SolicitacaoNotifMV['status'],
    membrosNotificados: (r.membros_notificados as number) ?? 0,
    resolvidoPor: r.resolvido_por as string | undefined,
    resolvidoEm: r.resolvido_em as string | undefined,
    criadoEm: r.criado_em as string,
  };
}

/** Produtor solicita notificação para membros MV de um evento */
export async function solicitarNotificacao(
  eventoId: string,
  produtorId: string,
  mensagem: string,
): Promise<{ ok: boolean; reason?: string; solicitacao?: SolicitacaoNotifMV }> {
  // Verificar plano ativo
  const planoResult = await getPlanoAtivoProdutor(produtorId);
  if (!planoResult) return { ok: false, reason: 'Você não possui um plano MAIS VANTA ativo.' };
  const { plano } = planoResult;

  // Contar notificações já solicitadas neste mês
  const now = new Date();
  const inicioMes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const { data: existentes } = await supabase
    .from('mv_solicitacoes_notificacao')
    .select('id')
    .eq('produtor_id', produtorId)
    .gte('criado_em', inicioMes);

  const usadas = (existentes ?? []).length;
  if (usadas >= plano.limiteNotificacoesMes) {
    return {
      ok: false,
      reason: `Você atingiu o limite de ${plano.limiteNotificacoesMes} notificações este mês.`,
    };
  }

  const { data, error } = await supabase
    .from('mv_solicitacoes_notificacao')
    .insert({
      evento_id: eventoId,
      produtor_id: produtorId,
      mensagem,
      status: 'PENDENTE',
      criado_em: tsBR(),
    } as never)
    .select()
    .single();
  if (error) return { ok: false, reason: error.message };
  return { ok: true, solicitacao: rowToSolicitacao(data as Record<string, unknown>) };
}

/** Listar solicitações de notificação de um evento */
export async function listarSolicitacoesEvento(eventoId: string): Promise<SolicitacaoNotifMV[]> {
  const { data } = await supabase
    .from('mv_solicitacoes_notificacao')
    .select('*')
    .eq('evento_id', eventoId)
    .order('criado_em', { ascending: false });
  return (data ?? []).map(r => rowToSolicitacao(r as Record<string, unknown>));
}

/** Admin: listar todas as pendentes */
export async function listarPendentes(): Promise<SolicitacaoNotifMV[]> {
  const { data } = await supabase
    .from('mv_solicitacoes_notificacao')
    .select('*')
    .eq('status', 'PENDENTE')
    .order('criado_em');
  return (data ?? []).map(r => rowToSolicitacao(r as Record<string, unknown>));
}

/** Admin: aprovar e marcar como enviada */
export async function aprovarSolicitacaoNotif(
  solId: string,
  adminId: string,
  membrosNotificados: number,
): Promise<void> {
  const now = tsBR();
  await supabase
    .from('mv_solicitacoes_notificacao')
    .update({
      status: 'ENVIADA',
      resolvido_por: adminId,
      resolvido_em: now,
      membros_notificados: membrosNotificados,
    } as never)
    .eq('id', solId);
}

/** Admin: rejeitar solicitação */
export async function rejeitarSolicitacaoNotif(solId: string, adminId: string): Promise<void> {
  await supabase
    .from('mv_solicitacoes_notificacao')
    .update({
      status: 'REJEITADA',
      resolvido_por: adminId,
      resolvido_em: tsBR(),
    } as never)
    .eq('id', solId);
}
