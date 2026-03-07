/**
 * mesasService — CRUD de mesas/camarotes + upload de planta.
 */
import { Mesa } from '../../../types';
import { supabase } from '../../../services/supabaseClient';
import type { Database } from '../../../types/supabase';

type MesaRow = Database['public']['Tables']['mesas']['Row'];

const rowToMesa = (r: MesaRow): Mesa => ({
  id: r.id,
  eventoId: r.evento_id,
  label: r.label ?? '',
  x: r.x ?? 50,
  y: r.y ?? 50,
  capacidade: r.capacidade ?? 4,
  valor: r.valor ?? 0,
  status: (r.status as Mesa['status']) ?? 'DISPONIVEL',
  reservadoPor: r.reservado_por ?? undefined,
});

export const mesasService = {
  async getMesas(eventoId: string): Promise<Mesa[]> {
    const { data, error } = await supabase
      .from('mesas')
      .select('*')
      .eq('evento_id', eventoId)
      .order('created_at', { ascending: true })
      .limit(500);
    if (error) {
      console.error('[mesasService] getMesas:', error);
      return [];
    }
    return (data ?? []).map(r => rowToMesa(r));
  },

  async addMesa(
    eventoId: string,
    mesa: { label: string; x: number; y: number; capacidade: number; valor: number },
  ): Promise<Mesa | null> {
    const { data, error } = await supabase
      .from('mesas')
      .insert({
        evento_id: eventoId,
        label: mesa.label,
        x: mesa.x,
        y: mesa.y,
        capacidade: mesa.capacidade,
        valor: mesa.valor,
        status: 'DISPONIVEL',
      })
      .select('*')
      .single();
    if (error || !data) {
      console.error('[mesasService] addMesa:', error);
      return null;
    }
    return rowToMesa(data);
  },

  async updateMesa(
    mesaId: string,
    fields: Partial<Pick<Mesa, 'label' | 'x' | 'y' | 'capacidade' | 'valor'>>,
  ): Promise<void> {
    const { error } = await supabase.from('mesas').update(fields).eq('id', mesaId);
    if (error) console.error('[mesasService] updateMesa:', error);
  },

  async removeMesa(mesaId: string): Promise<void> {
    const { error } = await supabase.from('mesas').delete().eq('id', mesaId);
    if (error) console.error('[mesasService] removeMesa:', error);
  },

  async reservarMesa(mesaId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('mesas')
      .update({ status: 'RESERVADA', reservado_por: userId })
      .eq('id', mesaId)
      .eq('status', 'DISPONIVEL'); // só reserva se ainda disponível (optimistic lock)
    if (error) {
      console.error('[mesasService] reservarMesa:', error);
      return false;
    }
    return true;
  },

  async liberarMesa(mesaId: string): Promise<void> {
    const { error } = await supabase
      .from('mesas')
      .update({ status: 'DISPONIVEL', reservado_por: null })
      .eq('id', mesaId);
    if (error) console.error('[mesasService] liberarMesa:', error);
  },

  async uploadPlanta(eventoId: string, file: File): Promise<string> {
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `plantas/${eventoId}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('eventos')
      .upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) {
      console.error('[mesasService] uploadPlanta:', upErr);
      return '';
    }
    const { data } = supabase.storage.from('eventos').getPublicUrl(path);
    const url = data.publicUrl;
    // Salvar URL na tabela eventos_admin
    await supabase.from('eventos_admin').update({ planta_mesas: url }).eq('id', eventoId);
    return url;
  },

  async toggleMesasAtivo(eventoId: string, ativo: boolean): Promise<void> {
    const { error } = await supabase.from('eventos_admin').update({ mesas_ativo: ativo }).eq('id', eventoId);
    if (error) console.error('[mesasService] toggleMesasAtivo:', error);
  },
};
