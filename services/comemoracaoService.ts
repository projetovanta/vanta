import { supabase } from './supabaseClient';
import type { Json } from '../types/supabase';
import { notify, notifyMany } from './notifyService';

export interface ComemoracaoForm {
  comunidade_id: string;
  evento_id?: string;
  motivo: 'ANIVERSARIO' | 'DESPEDIDA' | 'OUTRO';
  motivo_outro?: string;
  nome_completo: string;
  data_aniversario?: string;
  data_comemoracao: string;
  celular: string;
  instagram: string;
}

export interface Comemoracao {
  id: string;
  comunidade_id: string;
  evento_id: string | null;
  solicitante_id: string;
  status: 'ENVIADA' | 'VISUALIZADA' | 'EM_ANALISE' | 'APROVADA' | 'RECUSADA';
  motivo: string;
  motivo_outro: string | null;
  nome_completo: string;
  data_aniversario: string | null;
  data_comemoracao: string;
  celular: string;
  instagram: string;
  ref_code: string | null;
  vendas_count: number;
  avaliado_por: string | null;
  avaliado_em: string | null;
  motivo_recusa: string | null;
  mensagem_gerente: string | null;
  visualizado_em: string | null;
  em_analise_em: string | null;
  created_at: string;
  solicitante?: { nome: string; foto: string };
}

export interface ComemoracaoFaixa {
  id: string;
  config_id: string;
  min_vendas: number;
  cortesias: number;
  beneficio_consumo: string | null;
  ordem: number;
}

export interface ComemoracaoConfig {
  id: string;
  evento_id: string | null;
  comunidade_id: string;
  habilitado: boolean;
  limite_comemoracoes: number | null;
  deadline_hora: string | null;
  datas_bloqueadas: string[];
  faixas: ComemoracaoFaixa[];
}

function brNow(): string {
  return new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00';
}

function generateRefCode(nome: string): string {
  const clean = nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase()
    .slice(0, 10);
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${clean}-${rand}`;
}

export const comemoracaoService = {
  // ── Solicitante ────────────────────────────────────────
  async solicitar(form: ComemoracaoForm): Promise<string> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');

    const { data, error } = await supabase
      .from('comemoracoes')
      .insert({
        comunidade_id: form.comunidade_id,
        evento_id: form.evento_id ?? null,
        solicitante_id: user.id,
        motivo: form.motivo,
        motivo_outro: form.motivo_outro ?? null,
        nome_completo: form.nome_completo,
        data_aniversario: form.data_aniversario ?? null,
        data_comemoracao: form.data_comemoracao,
        celular: form.celular,
        instagram: form.instagram,
      })
      .select('id')
      .single();

    if (error) throw error;

    // Notificar responsáveis conforme origem da solicitação
    const notifPayload = {
      titulo: 'Nova comemoração solicitada',
      mensagem: `${form.nome_completo} quer comemorar ${form.motivo === 'ANIVERSARIO' ? 'aniversário' : form.motivo === 'DESPEDIDA' ? 'despedida' : (form.motivo_outro ?? 'evento')}`,
      tipo: 'COMEMORACAO_NOVA' as const,
      link: data.id,
    };

    if (form.evento_id) {
      // Solicitação no evento → notifica SOCIO + MASTER do evento
      const { data: equipeEvento } = await supabase
        .from('atribuicoes_rbac')
        .select('user_id')
        .eq('tenant_id', form.evento_id)
        .eq('tenant_type', 'EVENTO')
        .in('cargo', ['MASTER', 'SOCIO'])
        .eq('ativo', true);
      if (equipeEvento?.length) {
        notifyMany(
          equipeEvento.map(g => g.user_id),
          notifPayload,
        );
      }
    } else {
      // Solicitação na comunidade → notifica GERENTE + MASTER da comunidade
      const { data: gerentesCom } = await supabase
        .from('atribuicoes_rbac')
        .select('user_id')
        .eq('tenant_id', form.comunidade_id)
        .eq('tenant_type', 'COMUNIDADE')
        .in('cargo', ['MASTER', 'GERENTE'])
        .eq('ativo', true);
      if (gerentesCom?.length) {
        notifyMany(
          gerentesCom.map(g => g.user_id),
          notifPayload,
        );
      }
    }

    return data.id;
  },

  async minhasComemoracoes(): Promise<Comemoracao[]> {
    const { data, error } = await supabase
      .from('comemoracoes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) throw error;
    return (data ?? []) as unknown as Comemoracao[];
  },

  // ── Gerente ────────────────────────────────────────────
  async listarPorComunidade(comunidadeId: string): Promise<Comemoracao[]> {
    const { data, error } = await supabase
      .from('comemoracoes')
      .select('*, solicitante:profiles!solicitante_id(nome, avatar_url)')
      .eq('comunidade_id', comunidadeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map((r: Record<string, unknown>) => ({
      ...r,
      solicitante: (() => {
        const s = r.solicitante as { nome: string; avatar_url: string } | undefined;
        return s ? { nome: s.nome, foto: s.avatar_url } : undefined;
      })(),
    })) as unknown as Comemoracao[];
  },

  async marcarVisualizada(id: string): Promise<void> {
    const { error } = await supabase
      .from('comemoracoes')
      .update({ status: 'VISUALIZADA', visualizado_em: brNow() })
      .eq('id', id);
    if (error) throw error;
  },

  async marcarEmAnalise(id: string): Promise<void> {
    const { error } = await supabase
      .from('comemoracoes')
      .update({ status: 'EM_ANALISE', em_analise_em: brNow() })
      .eq('id', id);
    if (error) throw error;
  },

  async aprovar(id: string, mensagem?: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Buscar comemoracao pra gerar ref_code
    const { data: com } = await supabase
      .from('comemoracoes')
      .select('nome_completo, solicitante_id')
      .eq('id', id)
      .maybeSingle();
    const refCode = generateRefCode(com?.nome_completo ?? 'VANTA');

    const { error } = await supabase
      .from('comemoracoes')
      .update({
        status: 'APROVADA',
        avaliado_por: user?.id,
        avaliado_em: brNow(),
        mensagem_gerente: mensagem || null,
        ref_code: refCode,
      })
      .eq('id', id);
    if (error) throw error;
    if (com?.solicitante_id) {
      notify({
        userId: com.solicitante_id,
        titulo: 'Comemoração aprovada!',
        mensagem: mensagem || 'Sua comemoração foi aprovada. Compartilhe seu link!',
        tipo: 'COMEMORACAO_APROVADA',
        link: id,
      });
    }
  },

  async recusar(id: string, motivo: string, mensagem?: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: com } = await supabase.from('comemoracoes').select('solicitante_id').eq('id', id).maybeSingle();
    const { error } = await supabase
      .from('comemoracoes')
      .update({
        status: 'RECUSADA',
        avaliado_por: user?.id,
        avaliado_em: brNow(),
        motivo_recusa: motivo,
        mensagem_gerente: mensagem || null,
      })
      .eq('id', id);
    if (error) throw error;
    if (com?.solicitante_id) {
      notify({
        userId: com.solicitante_id,
        titulo: 'Comemoração recusada',
        mensagem: motivo,
        tipo: 'COMEMORACAO_RECUSADA',
        link: id,
      });
    }
  },

  // ── Config ────────────────────────────────────────────
  async getConfig(eventoId: string): Promise<ComemoracaoConfig | null> {
    const { data, error } = await supabase
      .from('comemoracoes_config')
      .select('*')
      .eq('evento_id', eventoId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const { data: faixas } = await supabase
      .from('comemoracoes_faixas')
      .select('*')
      .eq('config_id', data.id)
      .order('ordem');

    return {
      ...data,
      datas_bloqueadas: (data.datas_bloqueadas as string[]) ?? [],
      faixas: (faixas ?? []) as unknown as ComemoracaoFaixa[],
    } as ComemoracaoConfig;
  },

  async getConfigByComunidade(comunidadeId: string): Promise<ComemoracaoConfig[]> {
    const { data, error } = await supabase
      .from('comemoracoes_config')
      .select('*')
      .eq('comunidade_id', comunidadeId)
      .eq('habilitado', true);

    if (error) throw error;
    return (data ?? []) as unknown as ComemoracaoConfig[];
  },

  async salvarConfig(
    eventoId: string,
    comunidadeId: string,
    config: {
      habilitado: boolean;
      limite_comemoracoes: number | null;
      deadline_hora: string | null;
      datas_bloqueadas: string[];
    },
    faixas: { min_vendas: number; cortesias: number; beneficio_consumo: string | null }[],
  ): Promise<void> {
    // Upsert config
    const { data: existing } = await supabase
      .from('comemoracoes_config')
      .select('id')
      .eq('evento_id', eventoId)
      .maybeSingle();

    let configId: string;

    if (existing) {
      configId = existing.id;
      const { error } = await supabase
        .from('comemoracoes_config')
        .update({
          habilitado: config.habilitado,
          limite_comemoracoes: config.limite_comemoracoes,
          deadline_hora: config.deadline_hora,
          datas_bloqueadas: config.datas_bloqueadas as unknown as Json,
        })
        .eq('id', configId);
      if (error) throw error;
    } else {
      const { data, error } = await supabase
        .from('comemoracoes_config')
        .insert({
          evento_id: eventoId,
          comunidade_id: comunidadeId,
          habilitado: config.habilitado,
          limite_comemoracoes: config.limite_comemoracoes,
          deadline_hora: config.deadline_hora,
          datas_bloqueadas: config.datas_bloqueadas as unknown as Json,
        })
        .select('id')
        .single();
      if (error) throw error;
      configId = data.id;
    }

    // Recriar faixas
    const { error: errFaixas } = await supabase.from('comemoracoes_faixas').delete().eq('config_id', configId);
    if (errFaixas) console.error('[comemoracaoService] delete faixas:', errFaixas);

    if (faixas.length > 0) {
      const rows = faixas.map((f, i) => ({
        config_id: configId,
        min_vendas: f.min_vendas,
        cortesias: f.cortesias,
        beneficio_consumo: f.beneficio_consumo,
        ordem: i,
      }));
      const { error } = await supabase.from('comemoracoes_faixas').insert(rows);
      if (error) throw error;
    }
  },

  // ── Cortesias ────────────────────────────────────────────
  async getCortesias(comemoracaoId: string): Promise<
    {
      id: string;
      faixa_id: string;
      nome_convidado: string | null;
      celular_convidado: string | null;
      resgatado: boolean;
    }[]
  > {
    const { data, error } = await supabase
      .from('comemoracoes_cortesias')
      .select('*')
      .eq('comemoracao_id', comemoracaoId);

    if (error) throw error;
    return (data ?? []) as unknown as {
      id: string;
      faixa_id: string;
      nome_convidado: string | null;
      celular_convidado: string | null;
      resgatado: boolean;
    }[];
  },

  async atribuirCortesia(cortesiaId: string, nome: string, celular: string): Promise<void> {
    const { error } = await supabase
      .from('comemoracoes_cortesias')
      .update({ nome_convidado: nome, celular_convidado: celular })
      .eq('id', cortesiaId);
    if (error) throw error;
  },

  async resgatarCortesia(cortesiaId: string): Promise<{ ok: boolean; nome: string | null; erro?: string }> {
    const { data, error } = await supabase
      .from('comemoracoes_cortesias')
      .select('id, nome_convidado, resgatado, comemoracao_id')
      .eq('id', cortesiaId)
      .maybeSingle();

    if (error || !data) return { ok: false, nome: null, erro: 'Cortesia não encontrada' };
    if (data.resgatado) return { ok: false, nome: data.nome_convidado, erro: 'Já resgatada' };
    if (!data.nome_convidado) return { ok: false, nome: null, erro: 'Sem nome atribuído' };

    const { error: upErr } = await supabase
      .from('comemoracoes_cortesias')
      .update({ resgatado: true })
      .eq('id', cortesiaId);
    if (upErr) return { ok: false, nome: data.nome_convidado, erro: 'Erro ao resgatar' };

    // Notificar solicitante da comemoração
    const { data: com } = await supabase
      .from('comemoracoes')
      .select('solicitante_id, nome_completo')
      .eq('id', data.comemoracao_id)
      .maybeSingle();
    if (com?.solicitante_id) {
      notify({
        userId: com.solicitante_id,
        titulo: 'Cortesia resgatada!',
        mensagem: `${data.nome_convidado} resgatou a cortesia na portaria`,
        tipo: 'COMEMORACAO_FAIXA_ATINGIDA',
        link: data.comemoracao_id,
      });
    }

    return { ok: true, nome: data.nome_convidado };
  },
};
