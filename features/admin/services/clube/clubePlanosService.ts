import { supabase } from '../../../../services/supabaseClient';
import { tsBR } from '../../../../utils';
import type { PlanoProdutor, ProdutorPlano, TierMaisVanta } from '../../../../types';

function rowToPlano(r: Record<string, unknown>): PlanoProdutor {
  return {
    id: r.id as string,
    nome: r.nome as string,
    descricao: (r.descricao as string) ?? '',
    precoMensal: Number(r.preco_mensal ?? 0),
    limiteEventosMes: (r.limite_eventos_mes as number) ?? 5,
    limiteResgatesEvento: (r.limite_resgates_evento as number) ?? 20,
    tiersAcessiveis: (r.tiers_acessiveis as TierMaisVanta[]) ?? ['lista', 'presenca'],
    limiteNotificacoesMes: (r.limite_notificacoes_mes as number) ?? 3,
    precoEventoExtra: Number(r.preco_evento_extra ?? 0),
    precoNotificacaoExtra: Number(r.preco_notificacao_extra ?? 0),
    ativo: (r.ativo as boolean) ?? true,
    personalizadoPara: r.personalizado_para as string | undefined,
    ordem: (r.ordem as number) ?? 0,
    criadoEm: r.criado_em as string,
    atualizadoEm: r.atualizado_em as string | undefined,
  };
}

function rowToAtribuicao(r: Record<string, unknown>): ProdutorPlano {
  const plano = r.planos_produtor as Record<string, unknown> | null;
  const produtor = r.profiles as Record<string, unknown> | null;
  return {
    id: r.id as string,
    produtorId: r.produtor_id as string,
    planoId: r.plano_id as string,
    inicio: r.inicio as string,
    fim: r.fim as string | undefined,
    status: (r.status as ProdutorPlano['status']) ?? 'ATIVO',
    criadoEm: r.criado_em as string,
    planoNome: plano?.nome as string | undefined,
    produtorNome: produtor?.nome as string | undefined,
  };
}

// ── Planos CRUD ─────────────────────────────────────────────────────────────

export async function listarPlanos(): Promise<PlanoProdutor[]> {
  const { data, error } = await supabase.from('planos_produtor').select('*').order('ordem').order('criado_em');
  if (error) throw error;
  return (data ?? []).map(r => rowToPlano(r as Record<string, unknown>));
}

export async function criarPlano(plano: Partial<Omit<PlanoProdutor, 'id' | 'criadoEm'>>): Promise<PlanoProdutor> {
  const now = tsBR();
  const row: Record<string, unknown> = {
    nome: plano.nome ?? 'Novo Plano',
    descricao: plano.descricao ?? '',
    preco_mensal: plano.precoMensal ?? 0,
    limite_eventos_mes: plano.limiteEventosMes ?? 5,
    limite_resgates_evento: plano.limiteResgatesEvento ?? 20,
    tiers_acessiveis: plano.tiersAcessiveis ?? ['lista', 'presenca'],
    limite_notificacoes_mes: plano.limiteNotificacoesMes ?? 3,
    preco_evento_extra: plano.precoEventoExtra ?? 0,
    preco_notificacao_extra: plano.precoNotificacaoExtra ?? 0,
    ativo: plano.ativo ?? true,
    personalizado_para: plano.personalizadoPara ?? null,
    ordem: plano.ordem ?? 0,
    criado_em: now,
    atualizado_em: now,
  };
  const { data, error } = await supabase
    .from('planos_produtor')
    .insert(row as never)
    .select()
    .single();
  if (error) throw error;
  return rowToPlano(data as Record<string, unknown>);
}

export async function atualizarPlano(
  planoId: string,
  changes: Partial<Omit<PlanoProdutor, 'id' | 'criadoEm'>>,
): Promise<void> {
  const row: Record<string, unknown> = { atualizado_em: tsBR() };
  if (changes.nome !== undefined) row.nome = changes.nome;
  if (changes.descricao !== undefined) row.descricao = changes.descricao;
  if (changes.precoMensal !== undefined) row.preco_mensal = changes.precoMensal;
  if (changes.limiteEventosMes !== undefined) row.limite_eventos_mes = changes.limiteEventosMes;
  if (changes.limiteResgatesEvento !== undefined) row.limite_resgates_evento = changes.limiteResgatesEvento;
  if (changes.tiersAcessiveis !== undefined) row.tiers_acessiveis = changes.tiersAcessiveis;
  if (changes.limiteNotificacoesMes !== undefined) row.limite_notificacoes_mes = changes.limiteNotificacoesMes;
  if (changes.precoEventoExtra !== undefined) row.preco_evento_extra = changes.precoEventoExtra;
  if (changes.precoNotificacaoExtra !== undefined) row.preco_notificacao_extra = changes.precoNotificacaoExtra;
  if (changes.ativo !== undefined) row.ativo = changes.ativo;
  if (changes.personalizadoPara !== undefined) row.personalizado_para = changes.personalizadoPara;
  if (changes.ordem !== undefined) row.ordem = changes.ordem;
  const { error } = await supabase.from('planos_produtor').update(row).eq('id', planoId);
  if (error) throw error;
}

export async function deletarPlano(planoId: string): Promise<{ ok: boolean; reason?: string }> {
  // Verificar se há produtores ativos neste plano
  const { data: ativos } = await supabase
    .from('produtor_plano')
    .select('id')
    .eq('plano_id', planoId)
    .eq('status', 'ATIVO')
    .limit(1);
  if (ativos && ativos.length > 0) {
    return { ok: false, reason: 'Existem produtores ativos neste plano. Desative-o primeiro.' };
  }
  const { error } = await supabase
    .from('planos_produtor')
    .update({ ativo: false, atualizado_em: tsBR() })
    .eq('id', planoId);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

// ── Atribuição produtor→plano ───────────────────────────────────────────────

export async function listarAtribuicoes(): Promise<ProdutorPlano[]> {
  const { data, error } = await supabase
    .from('produtor_plano')
    .select('*, planos_produtor(nome), profiles!produtor_plano_produtor_id_fkey(nome)')
    .order('criado_em', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(r => rowToAtribuicao(r as Record<string, unknown>));
}

export async function atribuirPlano(produtorId: string, planoId: string): Promise<ProdutorPlano> {
  // Cancelar plano ativo anterior
  await supabase
    .from('produtor_plano')
    .update({ status: 'CANCELADO', fim: tsBR() })
    .eq('produtor_id', produtorId)
    .eq('status', 'ATIVO');

  const now = tsBR();
  const { data, error } = await supabase
    .from('produtor_plano')
    .insert({ produtor_id: produtorId, plano_id: planoId, inicio: now, status: 'ATIVO', criado_em: now })
    .select('*, planos_produtor(nome), profiles!produtor_plano_produtor_id_fkey(nome)')
    .single();
  if (error) throw error;
  return rowToAtribuicao(data as Record<string, unknown>);
}

export async function cancelarPlanoProdutor(produtorId: string): Promise<void> {
  await supabase
    .from('produtor_plano')
    .update({ status: 'CANCELADO', fim: tsBR() })
    .eq('produtor_id', produtorId)
    .eq('status', 'ATIVO');
}

export async function getPlanoAtivoProdutor(
  produtorId: string,
): Promise<{ plano: PlanoProdutor; atribuicao: ProdutorPlano } | null> {
  const { data } = await supabase
    .from('produtor_plano')
    .select('*, planos_produtor(*)')
    .eq('produtor_id', produtorId)
    .eq('status', 'ATIVO')
    .maybeSingle();
  if (!data) return null;
  const r = data as Record<string, unknown>;
  return {
    plano: rowToPlano(r.planos_produtor as Record<string, unknown>),
    atribuicao: rowToAtribuicao(r),
  };
}

/** Verifica se o produtor pode ativar MV num evento (limite de eventos/mês) */
export async function verificarLimiteEventos(
  produtorId: string,
): Promise<{ ok: boolean; reason?: string; plano?: PlanoProdutor }> {
  const result = await getPlanoAtivoProdutor(produtorId);
  if (!result) return { ok: false, reason: 'Você não possui um plano MAIS VANTA ativo.' };
  const { plano } = result;
  // Contar eventos com MV ativo neste mês
  const now = new Date();
  const inicioMes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  // Buscar IDs dos eventos do produtor
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: evts } = (await (supabase as any).from('eventos_admin').select('id').eq('criado_por', produtorId)) as {
    data: { id: string }[] | null;
  };
  const evtIds = (evts ?? []).map(e => e.id);
  if (evtIds.length === 0) return { ok: true, plano };
  // Contar configs MV criadas neste mês para eventos do produtor
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: configs } = (await (supabase as any)
    .from('mais_vanta_config_evento')
    .select('evento_id')
    .gte('created_at', inicioMes)) as { data: { evento_id: string }[] | null };
  const eventosMvEsteMes = new Set((configs ?? []).map(c => c.evento_id as string));
  const count = evtIds.filter(id => eventosMvEsteMes.has(id)).length;
  if (count >= plano.limiteEventosMes) {
    return {
      ok: false,
      reason: `Você atingiu o limite de ${plano.limiteEventosMes} eventos com MAIS VANTA este mês.`,
      plano,
    };
  }
  return { ok: true, plano };
}
