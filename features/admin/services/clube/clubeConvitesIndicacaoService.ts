import { supabase } from '../../../../services/supabaseClient';
import type { ConviteClube } from '../../../../types';
import { tsBR } from '../../../../utils';

function rowToConvite(r: Record<string, unknown>): ConviteClube {
  return {
    id: r.id as string,
    membroId: r.membro_id as string,
    codigo: r.codigo as string,
    usadoPor: r.usado_por as string | undefined,
    usadoEm: r.usado_em as string | undefined,
    status: (r.status as ConviteClube['status']) ?? 'DISPONIVEL',
    criadoEm: r.criado_em as string,
  };
}

export async function gerarConvite(membroId: string): Promise<ConviteClube> {
  const { data, error } = await supabase
    .from('convites_clube')
    .insert({ membro_id: membroId, criado_em: tsBR() })
    .select()
    .single();
  if (error) throw error;
  return rowToConvite(data as Record<string, unknown>);
}

export async function listarConvitesMembro(membroId: string): Promise<ConviteClube[]> {
  const { data, error } = await supabase
    .from('convites_clube')
    .select('*')
    .eq('membro_id', membroId)
    .order('criado_em', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(r => rowToConvite(r as Record<string, unknown>));
}

export async function buscarConvitePorCodigo(codigo: string): Promise<ConviteClube | null> {
  const { data, error } = await supabase
    .from('convites_clube')
    .select('*')
    .eq('codigo', codigo)
    .eq('status', 'DISPONIVEL')
    .maybeSingle();
  if (error) return null;
  if (!data) return null;
  return rowToConvite(data as Record<string, unknown>);
}

export async function usarConvite(codigo: string, usadoPor: string): Promise<void> {
  const now = tsBR();
  const { error } = await supabase
    .from('convites_clube')
    .update({ usado_por: usadoPor, usado_em: now, status: 'USADO' })
    .eq('codigo', codigo)
    .eq('status', 'DISPONIVEL');
  if (error) throw error;
}

export async function gerarConvitesIniciais(membroId: string, quantidade: number): Promise<void> {
  if (quantidade <= 0) return;
  const rows = Array.from({ length: quantidade }, () => ({
    membro_id: membroId,
    criado_em: tsBR(),
  }));
  const { error } = await supabase.from('convites_clube').insert(rows);
  if (error) throw error;
}

export async function adicionarConvite(membroId: string): Promise<void> {
  await gerarConvitesIniciais(membroId, 1);
}

export function getLinkConvite(codigo: string): string {
  return `${window.location.origin}/mais-vanta?convite=${codigo}`;
}
