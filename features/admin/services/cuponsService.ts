import { supabase } from '../../../services/supabaseClient';
import type { Cupom } from '../../../types';

const rowToCupom = (r: Record<string, unknown>): Cupom => ({
  id: r.id as string,
  codigo: r.codigo as string,
  tipo: (r.tipo as Cupom['tipo']) ?? 'PERCENTUAL',
  valor: Number(r.valor),
  limiteUsos: r.limite_usos != null ? (r.limite_usos as number) : undefined,
  usos: (r.usos as number) ?? 0,
  eventoId: (r.evento_id as string) ?? undefined,
  comunidadeId: (r.comunidade_id as string) ?? undefined,
  validoAte: (r.valido_ate as string) ?? undefined,
  ativo: (r.ativo as boolean) ?? true,
  criadoPor: r.criado_por as string,
  criadoEm: r.criado_em as string,
});

export const cuponsService = {
  /** Valida cupom por código + eventoId. Retorna cupom se válido ou erro descritivo. */
  async validarCupom(codigo: string, eventoId: string): Promise<{ valido: boolean; cupom?: Cupom; erro?: string }> {
    const { data, error } = await supabase
      .from('cupons')
      .select(
        'id, codigo, tipo, valor, limite_usos, usos, evento_id, comunidade_id, valido_ate, ativo, criado_por, criado_em',
      )
      .ilike('codigo', codigo.trim())
      .maybeSingle();

    if (error || !data) return { valido: false, erro: 'Cupom não encontrado' };

    const cupom = rowToCupom(data);

    if (!cupom.ativo) return { valido: false, erro: 'Cupom desativado' };

    if (cupom.validoAte && new Date(cupom.validoAte) < new Date()) return { valido: false, erro: 'Cupom expirado' };

    if (cupom.limiteUsos != null && cupom.usos >= cupom.limiteUsos) return { valido: false, erro: 'Cupom esgotado' };

    // Cupom vinculado a evento específico
    if (cupom.eventoId && cupom.eventoId !== eventoId)
      return { valido: false, erro: 'Cupom não válido para este evento' };

    // Cupom global (comunidade) — verificar se evento pertence à comunidade
    if (!cupom.eventoId && cupom.comunidadeId) {
      const { data: ev } = await supabase
        .from('eventos_admin')
        .select('comunidade_id')
        .eq('id', eventoId)
        .maybeSingle();
      if (!ev || (ev.comunidade_id as string) !== cupom.comunidadeId)
        return { valido: false, erro: 'Cupom não válido para este evento' };
    }

    return { valido: true, cupom };
  },

  /** Incrementa contador de usos do cupom (atômico via RPC) */
  async usarCupom(cupomId: string): Promise<void> {
    const { error } = await supabase.rpc('incrementar_usos_cupom', { cupom_id: cupomId });
    if (error) {
      // Fallback não-atômico caso RPC ainda não exista no ambiente
      const { data } = await supabase.from('cupons').select('usos').eq('id', cupomId).maybeSingle();
      if (data) {
        await supabase
          .from('cupons')
          .update({ usos: (data.usos as number) + 1 })
          .eq('id', cupomId);
      }
    }
  },

  /** Calcula valor do desconto (sem mutar) */
  calcDesconto(cupom: Cupom, subtotal: number): number {
    if (cupom.tipo === 'PERCENTUAL') {
      return Math.round(((subtotal * cupom.valor) / 100) * 100) / 100;
    }
    // FIXO — nunca desconto > subtotal
    return Math.min(cupom.valor, subtotal);
  },

  /** Cria novo cupom */
  async criarCupom(cupom: Omit<Cupom, 'id' | 'usos' | 'criadoEm'>): Promise<Cupom | null> {
    const { data, error } = await supabase
      .from('cupons')
      .insert({
        codigo: cupom.codigo.trim().toUpperCase(),
        tipo: cupom.tipo,
        valor: cupom.valor,
        limite_usos: cupom.limiteUsos ?? null,
        evento_id: cupom.eventoId ?? null,
        comunidade_id: cupom.comunidadeId ?? null,
        valido_ate: cupom.validoAte ?? null,
        ativo: cupom.ativo,
        criado_por: cupom.criadoPor,
      })
      .select()
      .maybeSingle();

    if (error || !data) return null;
    return rowToCupom(data);
  },

  /** Lista cupons de um evento (ou todos se eventoId undefined) */
  async getCupons(eventoId?: string): Promise<Cupom[]> {
    let q = supabase
      .from('cupons')
      .select(
        'id, codigo, tipo, valor, limite_usos, usos, evento_id, comunidade_id, valido_ate, ativo, criado_por, criado_em',
      )
      .order('criado_em', { ascending: false })
      .limit(1000);
    if (eventoId) q = q.eq('evento_id', eventoId);
    const { data } = await q;
    return (data ?? []).map(rowToCupom);
  },

  /** Cupons de uma comunidade (vale pra todos os eventos dela) */
  async getCuponsByComunidade(comunidadeId: string): Promise<Cupom[]> {
    const { data } = await supabase
      .from('cupons')
      .select(
        'id, codigo, tipo, valor, limite_usos, usos, evento_id, comunidade_id, valido_ate, ativo, criado_por, criado_em',
      )
      .eq('comunidade_id', comunidadeId)
      .is('evento_id', null)
      .order('criado_em', { ascending: false });
    return (data ?? []).map(rowToCupom);
  },

  /** Ativa/desativa cupom */
  async toggleCupom(cupomId: string, ativo: boolean): Promise<void> {
    const { error } = await supabase.from('cupons').update({ ativo }).eq('id', cupomId);
    if (error) console.error('[cuponsService] toggleCupom:', error);
  },

  /** Remove cupom */
  async removeCupom(cupomId: string): Promise<void> {
    const { error } = await supabase.from('cupons').delete().eq('id', cupomId);
    if (error) console.error('[cuponsService] removeCupom:', error);
  },
};
