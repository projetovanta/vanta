/**
 * condicoesService — CRUD de condições comerciais por comunidade.
 * Fluxo: master define → sócio aceita/recusa → expiração automática 7 dias.
 */
import { supabase } from '../../../services/supabaseClient';
import type { CondicaoComercial, CondicaoStatus } from '../../../types/eventos';
import { notificationsService } from './notificationsService';
import { comunidadesService } from './comunidadesService';

// ── Helpers ─────────────────────────────────────────────────────────────────

const now = () => new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00';

interface CondicaoRow {
  id: string;
  comunidade_id: string;
  taxa_servico_percent: number | null;
  taxa_processamento_percent: number | null;
  taxa_porta_percent: number | null;
  taxa_minima: number | null;
  taxa_fixa_evento: number | null;
  quem_paga_servico: string | null;
  cota_nomes_lista: number | null;
  taxa_nome_excedente: number | null;
  cota_cortesias: number | null;
  taxa_cortesia_excedente_pct: number | null;
  prazo_pagamento_dias: number | null;
  definido_por: string;
  definido_em: string;
  status: string;
  aceito_por: string | null;
  aceito_em: string | null;
  expira_em: string;
  motivo_recusa: string | null;
  observacoes: string | null;
  created_at: string;
}

const rowToModel = (r: CondicaoRow): CondicaoComercial => ({
  id: r.id,
  comunidadeId: r.comunidade_id,
  taxaServicoPercent: r.taxa_servico_percent,
  taxaProcessamentoPercent: r.taxa_processamento_percent,
  taxaPortaPercent: r.taxa_porta_percent,
  taxaMinima: r.taxa_minima,
  taxaFixaEvento: r.taxa_fixa_evento,
  quemPagaServico: (r.quem_paga_servico ?? 'PRODUTOR_ESCOLHE') as CondicaoComercial['quemPagaServico'],
  cotaNomesLista: r.cota_nomes_lista,
  taxaNomeExcedente: r.taxa_nome_excedente,
  cotaCortesias: r.cota_cortesias,
  taxaCortesiaExcedentePct: r.taxa_cortesia_excedente_pct,
  prazoPagamentoDias: r.prazo_pagamento_dias,
  definidoPor: r.definido_por,
  definidoEm: r.definido_em,
  status: r.status as CondicaoStatus,
  aceitoPor: r.aceito_por,
  aceitoEm: r.aceito_em,
  expiraEm: r.expira_em,
  motivoRecusa: r.motivo_recusa,
  observacoes: r.observacoes,
});

// ── Buscar responsável da comunidade (dono) ─────────────────────────────────

function getResponsavelComunidade(comunidadeId: string): string | null {
  const com = comunidadesService.get(comunidadeId);
  return com?.donoId ?? null;
}

// ── Service ─────────────────────────────────────────────────────────────────

export interface DefinirCondicoesInput {
  taxaServicoPercent?: number;
  taxaProcessamentoPercent?: number;
  taxaPortaPercent?: number;
  taxaMinima?: number;
  taxaFixaEvento?: number;
  quemPagaServico?: 'PRODUTOR_ABSORVE' | 'COMPRADOR_PAGA' | 'PRODUTOR_ESCOLHE';
  cotaNomesLista?: number;
  taxaNomeExcedente?: number;
  cotaCortesias?: number;
  taxaCortesiaExcedentePct?: number;
  prazoPagamentoDias?: number;
}

export const condicoesService = {
  /**
   * Master define novas condições para uma comunidade.
   * Cancela qualquer condição PENDENTE anterior.
   */
  async definirCondicoes(
    comunidadeId: string,
    input: DefinirCondicoesInput,
    masterId: string,
    observacoes?: string,
  ): Promise<CondicaoComercial> {
    // Cancelar pendentes anteriores (marcar como EXPIRADO)
    await supabase
      .from('condicoes_comerciais')
      .update({ status: 'EXPIRADO' })
      .eq('comunidade_id', comunidadeId)
      .eq('status', 'PENDENTE');

    // Inserir nova condição
    const { data, error } = await supabase
      .from('condicoes_comerciais')
      .insert({
        comunidade_id: comunidadeId,
        taxa_servico_percent: input.taxaServicoPercent ?? null,
        taxa_processamento_percent: input.taxaProcessamentoPercent ?? null,
        taxa_porta_percent: input.taxaPortaPercent ?? null,
        taxa_minima: input.taxaMinima ?? null,
        taxa_fixa_evento: input.taxaFixaEvento ?? null,
        quem_paga_servico: input.quemPagaServico ?? 'PRODUTOR_ESCOLHE',
        cota_nomes_lista: input.cotaNomesLista ?? null,
        taxa_nome_excedente: input.taxaNomeExcedente ?? null,
        cota_cortesias: input.cotaCortesias ?? null,
        taxa_cortesia_excedente_pct: input.taxaCortesiaExcedentePct ?? null,
        prazo_pagamento_dias: input.prazoPagamentoDias ?? null,
        definido_por: masterId,
        definido_em: now(),
        observacoes: observacoes ?? null,
      })
      .select()
      .single();

    if (error) throw new Error(`Erro ao definir condições: ${error.message}`);

    // Atualizar status na comunidade
    await supabase.from('comunidades').update({ condicoes_status: 'PENDENTE' }).eq('id', comunidadeId);

    // Notificar responsável
    const responsavelId = await getResponsavelComunidade(comunidadeId);
    if (responsavelId) {
      await notificationsService.add(
        {
          titulo: 'Novas condições comerciais',
          mensagem: 'O master definiu novas condições para sua comunidade. Você tem 7 dias para aceitar.',
          tipo: 'SISTEMA',
          lida: false,
          link: 'CONDICOES_COMERCIAIS',
          timestamp: now(),
        },
        responsavelId,
      );
    }

    return rowToModel(data as unknown as CondicaoRow);
  },

  /** Sócio/gerente aceita as condições */
  async aceitarCondicoes(condicaoId: string, userId: string): Promise<void> {
    const { data: cond, error: fetchErr } = await supabase
      .from('condicoes_comerciais')
      .select('comunidade_id, definido_por')
      .eq('id', condicaoId)
      .single();

    if (fetchErr || !cond) throw new Error('Condição não encontrada');

    const { error } = await supabase
      .from('condicoes_comerciais')
      .update({
        status: 'ACEITO',
        aceito_por: userId,
        aceito_em: now(),
      })
      .eq('id', condicaoId)
      .eq('status', 'PENDENTE');

    if (error) throw new Error(`Erro ao aceitar: ${error.message}`);

    // Atualizar comunidade
    await supabase
      .from('comunidades')
      .update({ condicoes_status: 'ACEITO', condicoes_aceitas_em: now() })
      .eq('id', cond.comunidade_id);

    // Aplicar taxas na comunidade (copiar snapshot)
    const { data: fullCond } = await supabase.from('condicoes_comerciais').select('*').eq('id', condicaoId).single();

    if (fullCond) {
      await supabase
        .from('comunidades')
        .update({
          vanta_fee_percent: fullCond.taxa_servico_percent,
          taxa_processamento_percent: fullCond.taxa_processamento_percent,
          taxa_porta_percent: fullCond.taxa_porta_percent,
          taxa_minima: fullCond.taxa_minima,
          cota_nomes_lista: fullCond.cota_nomes_lista,
          taxa_nome_excedente: fullCond.taxa_nome_excedente,
          cota_cortesias: fullCond.cota_cortesias,
          taxa_cortesia_excedente_pct: fullCond.taxa_cortesia_excedente_pct,
        })
        .eq('id', cond.comunidade_id);
    }

    // Notificar master
    await notificationsService.add(
      {
        titulo: 'Condições aceitas',
        mensagem: 'O responsável aceitou as condições comerciais.',
        tipo: 'SISTEMA',
        lida: false,
        link: '',
        timestamp: now(),
      },
      cond.definido_por,
    );
  },

  /** Sócio/gerente recusa as condições */
  async recusarCondicoes(condicaoId: string, userId: string, motivo: string): Promise<void> {
    const { data: cond, error: fetchErr } = await supabase
      .from('condicoes_comerciais')
      .select('comunidade_id, definido_por')
      .eq('id', condicaoId)
      .single();

    if (fetchErr || !cond) throw new Error('Condição não encontrada');

    const { error } = await supabase
      .from('condicoes_comerciais')
      .update({
        status: 'RECUSADO',
        aceito_por: userId,
        aceito_em: now(),
        motivo_recusa: motivo,
      })
      .eq('id', condicaoId)
      .eq('status', 'PENDENTE');

    if (error) throw new Error(`Erro ao recusar: ${error.message}`);

    // Notificar master
    await notificationsService.add(
      {
        titulo: 'Condições recusadas',
        mensagem: `O responsável recusou as condições: "${motivo}"`,
        tipo: 'SISTEMA',
        lida: false,
        link: '',
        timestamp: now(),
      },
      cond.definido_por,
    );
  },

  /** Buscar condição pendente de uma comunidade */
  async getCondicaoPendente(comunidadeId: string): Promise<CondicaoComercial | null> {
    const { data } = await supabase
      .from('condicoes_comerciais')
      .select('*')
      .eq('comunidade_id', comunidadeId)
      .eq('status', 'PENDENTE')
      .order('definido_em', { ascending: false })
      .limit(1)
      .maybeSingle();

    return data ? rowToModel(data as unknown as CondicaoRow) : null;
  },

  /** Histórico completo de condições de uma comunidade */
  async getHistorico(comunidadeId: string): Promise<CondicaoComercial[]> {
    const { data, error } = await supabase
      .from('condicoes_comerciais')
      .select('*')
      .eq('comunidade_id', comunidadeId)
      .order('definido_em', { ascending: false });

    if (error) return [];
    return (data ?? []).map(r => rowToModel(r as unknown as CondicaoRow));
  },

  /** Resumo global: todas as comunidades com status de condição */
  async getResumoGlobal(): Promise<
    { comunidadeId: string; comunidadeNome: string; status: string; ultimaAtualizacao: string | null }[]
  > {
    const { data, error } = await supabase
      .from('comunidades')
      .select('id, nome, condicoes_status, condicoes_aceitas_em')
      .order('nome');

    if (error) return [];
    return (data ?? []).map(c => ({
      comunidadeId: c.id,
      comunidadeNome: c.nome,
      status: c.condicoes_status ?? 'SEM_CONDICOES',
      ultimaAtualizacao: c.condicoes_aceitas_em ?? null,
    }));
  },
};
