/**
 * pushTemplatesService — CRUD de templates de push + agendamento.
 * Acesso: somente vanta_masteradm (RLS).
 */
import { supabase } from '../../../services/supabaseClient';
import { tsBR } from '../../../utils';
import type { CanalCampanha } from './campanhasService';

// ── Types ─────────────────────────────────────────────────────────────────

export interface PushTemplate {
  id: string;
  nome: string;
  titulo: string;
  mensagem: string;
  canais: CanalCampanha[];
  tipo_acao: string;
  acao_valor: string;
  criado_em: string;
  atualizado_em: string;
}

export interface PushAgendado {
  id: string;
  titulo: string;
  mensagem: string;
  canais: CanalCampanha[];
  segmento_tipo: string;
  segmento_valor: string;
  tipo_acao: string;
  acao_valor: string;
  link_notif: string;
  agendar_para: string;
  status: 'PENDENTE' | 'ENVIADO' | 'CANCELADO' | 'ERRO';
  resultado: Record<string, unknown> | null;
  criado_em: string;
  enviado_em: string | null;
}

// ── Templates ─────────────────────────────────────────────────────────────

export const pushTemplatesService = {
  async listar(): Promise<PushTemplate[]> {
    const { data, error } = await supabase
      .from('push_templates')
      .select('*')
      .order('atualizado_em', { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as PushTemplate[];
  },

  async criar(
    template: Pick<PushTemplate, 'nome' | 'titulo' | 'mensagem' | 'canais' | 'tipo_acao' | 'acao_valor'>,
    userId: string,
  ): Promise<PushTemplate> {
    const now = tsBR();
    const { data, error } = await supabase
      .from('push_templates')
      .insert({
        ...template,
        criado_por: userId,
        criado_em: now,
        atualizado_em: now,
      })
      .select()
      .single();
    if (error) throw error;
    return data as unknown as PushTemplate;
  },

  async atualizar(
    id: string,
    updates: Partial<Pick<PushTemplate, 'nome' | 'titulo' | 'mensagem' | 'canais' | 'tipo_acao' | 'acao_valor'>>,
  ): Promise<void> {
    const { error } = await supabase
      .from('push_templates')
      .update({ ...updates, atualizado_em: tsBR() })
      .eq('id', id);
    if (error) throw error;
  },

  async deletar(id: string): Promise<void> {
    const { error } = await supabase.from('push_templates').delete().eq('id', id);
    if (error) throw error;
  },
};

// ── Agendados ─────────────────────────────────────────────────────────────

export const pushAgendadosService = {
  async listar(): Promise<PushAgendado[]> {
    const { data, error } = await supabase
      .from('push_agendados')
      .select('*')
      .order('agendar_para', { ascending: true });
    if (error) throw error;
    return (data ?? []) as unknown as PushAgendado[];
  },

  async agendar(
    campanha: {
      titulo: string;
      mensagem: string;
      canais: CanalCampanha[];
      segmento_tipo: string;
      segmento_valor: string;
      tipo_acao: string;
      acao_valor: string;
      link_notif: string;
      agendar_para: string;
    },
    userId: string,
  ): Promise<PushAgendado> {
    const { data, error } = await supabase
      .from('push_agendados')
      .insert({
        ...campanha,
        status: 'PENDENTE',
        criado_por: userId,
        criado_em: tsBR(),
      })
      .select()
      .single();
    if (error) throw error;
    return data as unknown as PushAgendado;
  },

  async cancelar(id: string): Promise<void> {
    const { error } = await supabase
      .from('push_agendados')
      .update({ status: 'CANCELADO' })
      .eq('id', id)
      .eq('status', 'PENDENTE');
    if (error) throw error;
  },

  /** Envio imediato para grupo — agenda com data = agora (processado pelo cron) */
  async enviarAgora(
    campanha: {
      titulo: string;
      mensagem: string;
      canais: CanalCampanha[];
      segmento_tipo: string;
      segmento_valor: string;
      tipo_acao: string;
      acao_valor: string;
      link_notif: string;
    },
    userId: string,
  ): Promise<PushAgendado> {
    return this.agendar({ ...campanha, agendar_para: tsBR() }, userId);
  },
};
