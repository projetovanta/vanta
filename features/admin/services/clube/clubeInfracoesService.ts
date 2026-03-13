import type { InfracaoMaisVanta } from '../../../../types';
import { supabase } from '../../../../services/supabaseClient';
import { tsBR } from '../../../../utils';
import { _membros, _reservas, bump } from './clubeCache';

export function estaBloqueado(userId: string): boolean {
  const m = _membros.get(userId);
  if (!m) return false;
  if (m.banidoPermanente) return true;
  if (m.bloqueioAte && new Date(m.bloqueioAte) > new Date()) return true;
  return false;
}

export function isBanidoPermanente(userId: string): boolean {
  return _membros.get(userId)?.banidoPermanente ?? false;
}

export function getFlagReincidencia(userId: string): boolean {
  const m = _membros.get(userId);
  return !!m && m.banidoPermanente;
}

export function getBloqueioAte(userId: string): string | null {
  const m = _membros.get(userId);
  if (!m?.bloqueioAte) return null;
  if (new Date(m.bloqueioAte) <= new Date()) return null;
  return m.bloqueioAte;
}

export function temDividaSocial(userId: string): boolean {
  return _reservas.some(
    r => r.userId === userId && (r.status === 'PENDENTE_POST' || (r.status === 'RESGATADO' && !r.postVerificado)),
  );
}

export async function getInfracoes(userId: string): Promise<InfracaoMaisVanta[]> {
  const { data } = await supabase
    .from('infracoes_mais_vanta')
    .select('*')
    .eq('user_id', userId)
    .order('criado_em', { ascending: false })
    .limit(500);
  if (!data) return [];
  return data.map((r: Record<string, unknown>) => ({
    id: (r.id as string) ?? '',
    userId: (r.user_id as string) ?? '',
    tipo: (r.tipo as 'NO_SHOW' | 'NAO_POSTOU') ?? 'NO_SHOW',
    eventoId: (r.evento_id as string) ?? undefined,
    eventoNome: (r.evento_nome as string) ?? undefined,
    criadoEm: (r.criado_em as string) ?? '',
    criadoPor: (r.criado_por as string) ?? undefined,
  }));
}

export async function getInfracoesCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from('infracoes_mais_vanta')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  return count ?? 0;
}

export async function registrarInfracao(
  userId: string,
  tipo: 'NO_SHOW' | 'NAO_POSTOU',
  adminId: string,
  config: { limite: number; bloqueio1Dias: number; bloqueio2Dias: number },
  eventoId?: string,
  eventoNome?: string,
): Promise<{ acao: 'AVISO' | 'BLOQUEIO_1' | 'BLOQUEIO_2' | 'BAN_PERMANENTE'; count: number }> {
  const { error: errInf } = await supabase.from('infracoes_mais_vanta').insert({
    user_id: userId,
    tipo,
    evento_id: eventoId ?? null,
    evento_nome: eventoNome ?? null,
    criado_por: adminId,
  });
  if (errInf) console.error('[clubeInfracoes] registrarInfracao:', errInf);

  const count = await getInfracoesCount(userId);
  const m = _membros.get(userId);
  if (!m) return { acao: 'AVISO', count };

  const limite = config.limite || 3;

  if (count >= limite && m.bloqueioNivel === 0) {
    const ate = new Date(Date.now() + config.bloqueio1Dias * 24 * 3600000 - 3 * 3600000)
      .toISOString()
      .replace('Z', '-03:00');
    const { error: errB1 } = await supabase
      .from('membros_clube')
      .update({ bloqueio_nivel: 1, bloqueio_ate: ate })
      .eq('user_id', userId);
    if (errB1) console.error('[clubeInfracoes] bloqueio nivel 1:', errB1);
    m.bloqueioNivel = 1;
    m.bloqueioAte = ate;
    bump();
    return { acao: 'BLOQUEIO_1', count };
  }

  if (count >= limite * 2 && m.bloqueioNivel === 1) {
    const ate = new Date(Date.now() + config.bloqueio2Dias * 24 * 3600000 - 3 * 3600000)
      .toISOString()
      .replace('Z', '-03:00');
    const { error: errB2 } = await supabase
      .from('membros_clube')
      .update({ bloqueio_nivel: 2, bloqueio_ate: ate })
      .eq('user_id', userId);
    if (errB2) console.error('[clubeInfracoes] bloqueio nivel 2:', errB2);
    m.bloqueioNivel = 2;
    m.bloqueioAte = ate;
    bump();
    return { acao: 'BLOQUEIO_2', count };
  }

  if (count > limite * 2 && m.bloqueioNivel === 2) {
    const agora = tsBR();
    await supabase
      .from('membros_clube')
      .update({ bloqueio_nivel: 3, banido_permanente: true, banido_em: agora, ativo: false })
      .eq('user_id', userId);
    m.bloqueioNivel = 3;
    m.banidoPermanente = true;
    m.banidoEm = agora;
    m.ativo = false;
    bump();
    return { acao: 'BAN_PERMANENTE', count };
  }

  bump();
  return { acao: 'AVISO', count };
}

/** @deprecated Manter compat — usar estaBloqueado() */
export function temCastigoNoShow(userId: string): boolean {
  return estaBloqueado(userId);
}

/** @deprecated Manter compat — usar registrarInfracao() */
export async function aplicarCastigoNoShow(userId: string, eventoNome: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  await registrarInfracao(
    userId,
    'NO_SHOW',
    user?.id ?? '',
    { limite: 3, bloqueio1Dias: 30, bloqueio2Dias: 60 },
    undefined,
    eventoNome,
  );
}

/** @deprecated Manter compat — usar getBloqueioAte() */
export function getCastigoAte(userId: string): string | null {
  return getBloqueioAte(userId);
}
