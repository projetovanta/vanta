import { supabase } from './supabaseClient';
import type { Json } from '../types/supabase';
import { notify, notifyMany } from './notifyService';

export interface EventoPrivadoForm {
  comunidade_id: string;
  nome_completo: string;
  empresa: string;
  email: string;
  telefone: string;
  instagram: string;
  data_evento?: string;
  data_estimativa?: string;
  faixa_capacidade: string;
  horario: 'DIURNO' | 'NOTURNO' | 'DIA_INTEIRO';
  formatos: string[];
  atracoes: string[];
  descricao: string;
}

export interface EventoPrivado {
  id: string;
  comunidade_id: string;
  solicitante_id: string;
  status: 'ENVIADA' | 'VISUALIZADA' | 'EM_ANALISE' | 'APROVADA' | 'RECUSADA' | 'CONVERTIDA';
  nome_completo: string;
  empresa: string;
  email: string;
  telefone: string;
  instagram: string;
  data_evento: string | null;
  data_estimativa: string | null;
  faixa_capacidade: string;
  horario: string;
  formatos: string[];
  atracoes: string[];
  descricao: string;
  evento_id: string | null;
  avaliado_por: string | null;
  avaliado_em: string | null;
  motivo_recusa: string | null;
  mensagem_gerente: string | null;
  visualizado_em: string | null;
  em_analise_em: string | null;
  created_at: string;
  solicitante?: { nome: string; foto: string };
}

function brNow(): string {
  return new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00';
}

export const eventoPrivadoService = {
  async solicitar(form: EventoPrivadoForm): Promise<string> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');

    const { data, error } = await supabase
      .from('eventos_privados')
      .insert({
        comunidade_id: form.comunidade_id,
        solicitante_id: user.id,
        nome_completo: form.nome_completo,
        empresa: form.empresa,
        email: form.email,
        telefone: form.telefone,
        instagram: form.instagram,
        data_evento: form.data_evento ?? null,
        data_estimativa: form.data_estimativa ?? null,
        faixa_capacidade: form.faixa_capacidade,
        horario: form.horario,
        formatos: form.formatos as unknown as Json,
        atracoes: form.atracoes as unknown as Json,
        descricao: form.descricao,
      })
      .select('id')
      .single();

    if (error) throw error;

    // Notificar gerentes da comunidade
    const { data: gerentes } = await supabase
      .from('atribuicoes_rbac')
      .select('user_id')
      .eq('tenant_id', form.comunidade_id)
      .eq('tenant_type', 'COMUNIDADE')
      .in('cargo', ['MASTER', 'GERENTE'])
      .eq('ativo', true);
    if (gerentes?.length) {
      notifyMany(
        gerentes.map(g => g.user_id),
        {
          titulo: 'Nova solicitação de evento privado',
          mensagem: `${form.nome_completo} solicitou um evento privado`,
          tipo: 'EVENTO_PRIVADO_NOVA',
          link: data.id,
        },
      );
    }

    return data.id;
  },

  async minhasSolicitacoes(): Promise<EventoPrivado[]> {
    const { data, error } = await supabase
      .from('eventos_privados')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as unknown as EventoPrivado[];
  },

  async listarPorComunidade(comunidadeId: string): Promise<EventoPrivado[]> {
    const { data, error } = await supabase
      .from('eventos_privados')
      .select('*, solicitante:profiles!solicitante_id(nome, foto)')
      .eq('comunidade_id', comunidadeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map((r: Record<string, unknown>) => ({
      ...r,
      solicitante: r.solicitante as { nome: string; foto: string } | undefined,
    })) as unknown as EventoPrivado[];
  },

  async aprovar(id: string, mensagem?: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: ep } = await supabase.from('eventos_privados').select('solicitante_id').eq('id', id).single();
    const { error } = await supabase
      .from('eventos_privados')
      .update({ status: 'APROVADA', avaliado_por: user?.id, avaliado_em: brNow(), mensagem_gerente: mensagem || null })
      .eq('id', id);
    if (error) throw error;
    if (ep?.solicitante_id) {
      notify({
        userId: ep.solicitante_id,
        titulo: 'Evento privado aprovado!',
        mensagem: mensagem || 'Sua solicitação foi aprovada pelo gerente',
        tipo: 'EVENTO_PRIVADO_APROVADO',
        link: id,
      });
    }
  },

  async recusar(id: string, motivo: string, mensagem?: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: ep } = await supabase.from('eventos_privados').select('solicitante_id').eq('id', id).single();
    const { error } = await supabase
      .from('eventos_privados')
      .update({
        status: 'RECUSADA',
        avaliado_por: user?.id,
        avaliado_em: brNow(),
        motivo_recusa: motivo,
        mensagem_gerente: mensagem || null,
      })
      .eq('id', id);
    if (error) throw error;
    if (ep?.solicitante_id) {
      notify({
        userId: ep.solicitante_id,
        titulo: 'Evento privado recusado',
        mensagem: motivo,
        tipo: 'EVENTO_PRIVADO_RECUSADO',
        link: id,
      });
    }
  },

  async marcarVisualizada(id: string): Promise<void> {
    const { error } = await supabase
      .from('eventos_privados')
      .update({ status: 'VISUALIZADA', visualizado_em: brNow() })
      .eq('id', id);
    if (error) throw error;
  },

  async marcarEmAnalise(id: string): Promise<void> {
    const { error } = await supabase
      .from('eventos_privados')
      .update({ status: 'EM_ANALISE', em_analise_em: brNow() })
      .eq('id', id);
    if (error) throw error;
  },

  async converter(id: string, eventoId: string): Promise<void> {
    const { error } = await supabase
      .from('eventos_privados')
      .update({ status: 'CONVERTIDA', evento_id: eventoId })
      .eq('id', id);
    if (error) throw error;
  },

  async getConfigComunidade(comunidadeId: string): Promise<{
    ativo: boolean;
    texto: string | null;
    fotos: string[];
    formatos: string[];
    atracoes: string[];
    faixas_capacidade: string[];
  }> {
    const { data, error } = await supabase
      .from('comunidades')
      .select(
        'evento_privado_ativo, evento_privado_texto, evento_privado_fotos, evento_privado_formatos, evento_privado_atracoes, evento_privado_faixas_capacidade',
      )
      .eq('id', comunidadeId)
      .single();

    if (error) throw error;
    return {
      ativo: data?.evento_privado_ativo ?? false,
      texto: data?.evento_privado_texto ?? null,
      fotos: (data?.evento_privado_fotos as string[]) ?? [],
      formatos: (data?.evento_privado_formatos as string[]) ?? [],
      atracoes: (data?.evento_privado_atracoes as string[]) ?? [],
      faixas_capacidade: (data?.evento_privado_faixas_capacidade as string[]) ?? [],
    };
  },

  async salvarConfig(
    comunidadeId: string,
    config: {
      evento_privado_ativo: boolean;
      evento_privado_texto: string | null;
      evento_privado_fotos: string[];
      evento_privado_formatos: string[];
      evento_privado_atracoes: string[];
      evento_privado_faixas_capacidade: string[];
    },
  ): Promise<void> {
    const { error } = await supabase
      .from('comunidades')
      .update({
        evento_privado_ativo: config.evento_privado_ativo,
        evento_privado_texto: config.evento_privado_texto,
        evento_privado_fotos: config.evento_privado_fotos as unknown as Json,
        evento_privado_formatos: config.evento_privado_formatos as unknown as Json,
        evento_privado_atracoes: config.evento_privado_atracoes as unknown as Json,
        evento_privado_faixas_capacidade: config.evento_privado_faixas_capacidade as unknown as Json,
      })
      .eq('id', comunidadeId);
    if (error) throw error;
  },
};
