/**
 * eventosAdminCore — Cache local, refresh do Supabase, helpers internos.
 *
 * Exporta estado mutavel (EVENTOS_ADMIN, _version, _refreshed) e funcoes de acesso
 * para que os outros sub-modulos possam ler/escrever o cache.
 */

import { EventoAdmin, VariacaoIngresso, LoteMaisVanta, SocioEvento } from '../../../types';
import { supabase } from '../../../services/supabaseClient';
import type { Database, Json } from '../../../types/supabase';

type EventoRow = Database['public']['Tables']['eventos_admin']['Row'];
type LoteRow = Database['public']['Tables']['lotes']['Row'];
type VariacaoRow = Database['public']['Tables']['variacoes_ingresso']['Row'];
type EquipeRow = Pick<
  Database['public']['Tables']['equipe_evento']['Row'],
  'evento_id' | 'membro_id' | 'papel' | 'permissoes'
>;

// ── Lazy ref para rbacService (resolve ciclo) ───────────────────────────────

let _rbacRef: (typeof import('./rbacService'))['rbacService'] | null = null;

export const getRbac = (): (typeof import('./rbacService'))['rbacService'] => {
  if (!_rbacRef) {
    try {
      _rbacRef = (globalThis as any).__rbacService;
    } catch {
      /* fallback abaixo */
    }
  }
  return _rbacRef!;
};

/** Chamado pelo rbacService apos sua inicializacao para registrar a referencia global */
export const _registerRbac = (ref: (typeof import('./rbacService'))['rbacService']) => {
  _rbacRef = ref;
};

// ── Helpers ─────────────────────────────────────────────────────────────────

export const ts = (): string => {
  const d = new Date();
  return new Date(d.getTime() - 3 * 60 * 60 * 1000).toISOString().replace('Z', '-03:00');
};

export const varLabel = (v: VariacaoIngresso): string => {
  const area = v.area === 'OUTRO' ? v.areaCustom || 'Outro' : v.area;
  const gen = v.genero === 'MASCULINO' ? 'Masc.' : v.genero === 'FEMININO' ? 'Fem.' : 'Unisex';
  return `${area} · ${gen}`;
};

/** Retorna o userId do membro com cargo SOCIO no evento, via lazy ref (evita ciclo). */
export const getSocioId = (eventoId: string, fallback = ''): string => {
  const rbac = getRbac();
  if (!rbac) return fallback;
  const atribs = rbac.getAtribuicoesTenant('EVENTO', eventoId);
  return atribs.find(a => a.cargo === 'SOCIO')?.userId ?? fallback;
};

// ── Cache local (mutavel — compartilhado entre sub-modulos) ─────────────────

export let EVENTOS_ADMIN: EventoAdmin[] = [];
export let _version = 0;
export let _refreshed = false;

const setEventosAdmin = (arr: EventoAdmin[]) => {
  EVENTOS_ADMIN = arr;
};
export const bumpVersion = () => {
  _version++;
};
const markRefreshed = () => {
  _refreshed = true;
};

// ── rowToEventoAdmin ────────────────────────────────────────────────────────

/** Converte row do Supabase + lotes/variacoes para EventoAdmin */
const rowToEventoAdmin = (
  row: EventoRow,
  lotes: LoteRow[],
  variacoes: VariacaoRow[],
  equipe: EquipeRow[],
): EventoAdmin => {
  const eventoId = row.id;

  // Monta lotes com variacoes embutidas
  const lotesAgrupados = lotes
    .filter(l => l.evento_id === eventoId)
    .map(l => {
      const loteId = l.id;
      const vars = variacoes
        .filter(v => v.lote_id === loteId)
        .map(v => ({
          id: v.id,
          area: v.area as VariacaoIngresso['area'],
          areaCustom: v.area_custom ?? undefined,
          genero: v.genero as VariacaoIngresso['genero'],
          valor: Number(v.valor ?? 0),
          limite: Number(v.limite ?? 100),
          vendidos: Number(v.vendidos ?? 0),
        }));
      return {
        id: loteId,
        nome: l.nome,
        limitTotal: vars.reduce((s, v) => s + v.limite, 0),
        dataValidade: l.data_validade ?? undefined,
        variacoes: vars,
        vendidos: vars.reduce((s, v) => s + v.vendidos, 0),
        ativo: l.ativo ?? true,
        virarPct: l.virar_pct != null ? Number(l.virar_pct) : undefined,
      };
    });

  // Monta equipe readonly (com permissoes 10p)
  const equipeEvento = equipe
    .filter(e => e.evento_id === eventoId)
    .map(e => ({
      id: e.membro_id,
      nome: '',
      papel: e.papel as import('../../../types').PapelEquipeEvento,
      permissoes: Array.isArray(e.permissoes) && e.permissoes.length > 0 ? (e.permissoes as string[]) : undefined,
    }));

  // Resolve comunidade info
  const comunidadeId = row.comunidade_id ?? '';

  return {
    id: eventoId,
    comunidadeId,
    foto: row.foto ?? '',
    nome: row.nome ?? '',
    descricao: row.descricao ?? '',
    dataInicio: row.data_inicio ?? '',
    dataFim: row.data_fim ?? '',
    local: row.local ?? '',
    endereco: row.endereco ?? '',
    cidade: row.cidade ?? '',
    coords: row.coords as unknown as { lat: number; lng: number } | undefined,
    lotes: lotesAgrupados,
    equipe: equipeEvento,
    comunidade: { id: comunidadeId, nome: '', foto: '' },
    criadoEm: row.created_at ?? '',
    publicado: row.publicado ?? false,
    caixaAtivo: row.caixa_ativo ?? false,
    taxaOverride: row.taxa_override != null ? Number(row.taxa_override) : undefined,
    vanta_fee_percent: row.vanta_fee_percent != null ? Number(row.vanta_fee_percent) : undefined,
    vanta_fee_fixed: row.vanta_fee_fixed != null ? Number(row.vanta_fee_fixed) : undefined,
    gateway_fee_mode: (row.gateway_fee_mode as 'ABSORVER' | 'REPASSAR') ?? 'ABSORVER',
    taxa_processamento_percent:
      row.taxa_processamento_percent != null ? Number(row.taxa_processamento_percent) : undefined,
    taxa_porta_percent: row.taxa_porta_percent != null ? Number(row.taxa_porta_percent) : undefined,
    taxa_minima: row.taxa_minima != null ? Number(row.taxa_minima) : undefined,
    taxa_fixa_evento: row.taxa_fixa_evento != null ? Number(row.taxa_fixa_evento) : undefined,
    quem_paga_servico: (row.quem_paga_servico as EventoAdmin['quem_paga_servico']) ?? undefined,
    cota_nomes_lista: row.cota_nomes_lista != null ? Number(row.cota_nomes_lista) : undefined,
    taxa_nome_excedente: row.taxa_nome_excedente != null ? Number(row.taxa_nome_excedente) : undefined,
    cota_cortesias: row.cota_cortesias != null ? Number(row.cota_cortesias) : undefined,
    taxa_cortesia_excedente_pct:
      row.taxa_cortesia_excedente_pct != null ? Number(row.taxa_cortesia_excedente_pct) : undefined,
    prazo_pagamento_dias: row.prazo_pagamento_dias != null ? Number(row.prazo_pagamento_dias) : undefined,
    cortesiasEnviadas: 0,
    criadorId: row.created_by ?? undefined,
    motivoRejeicao: row.motivo_rejeicao ?? undefined,
    rejeicaoCampos: row.rejeicao_campos as Record<string, string> | undefined,
    rodadaRejeicao: row.rodada_rejeicao ?? 0,
    tipoFluxo: (row.tipo_fluxo as 'COM_SOCIO' | 'FESTA_DA_CASA') ?? undefined,
    statusEvento: (row.status_evento as EventoAdmin['statusEvento']) ?? undefined,
    socioConvidadoId: row.socio_convidado_id ?? undefined,
    splitProdutor: row.split_produtor != null ? Number(row.split_produtor) : undefined,
    splitSocio: row.split_socio != null ? Number(row.split_socio) : undefined,
    permissoesProdutor: row.permissoes_produtor ?? undefined,
    rodadaNegociacao: row.rodada_negociacao != null ? Number(row.rodada_negociacao) : undefined,
    mensagemNegociacao: undefined,
    formato: row.formato ?? row.categoria ?? undefined,
    estilos: row.estilos ?? undefined,
    experiencias: row.experiencias ?? undefined,
    categoria: row.categoria ?? undefined,
    subcategorias: row.subcategorias ?? undefined,
    edicaoPendente:
      row.edicao_pendente != null ? (row.edicao_pendente as unknown as Record<string, unknown>) : undefined,
    edicaoStatus: (row.edicao_status as EventoAdmin['edicaoStatus']) ?? undefined,
    edicaoMotivo: row.edicao_motivo ?? undefined,
    vendaVanta: row.venda_vanta ?? true,
    linkExterno: row.link_externo ?? undefined,
    plataformaExterna: row.plataforma_externa ?? undefined,
    comissaoVanta: row.comissao_vanta != null ? Number(row.comissao_vanta) : undefined,
    codigoAfiliado: row.codigo_afiliado ?? undefined,
    propostaStatus: (row.proposta_status as EventoAdmin['propostaStatus']) ?? undefined,
    propostaRodada: row.proposta_rodada != null ? Number(row.proposta_rodada) : undefined,
    propostaMensagem: row.proposta_mensagem ?? undefined,
    recorrencia: (row.recorrencia as EventoAdmin['recorrencia']) ?? 'UNICO',
    recorrenciaAte: row.recorrencia_ate ?? undefined,
    eventoOrigemId: row.evento_origem_id ?? undefined,
  };
};

// ── refresh ─────────────────────────────────────────────────────────────────

let _inflight: Promise<void> | null = null;

/**
 * Carrega todos os eventos do Supabase com lotes, variacoes e equipe.
 * Single-flight: chamadas concorrentes reusam a mesma promise em andamento.
 */
export const refresh = (): Promise<void> => {
  if (_inflight) {
    console.debug('[eventosAdminCore] refresh already in-flight, reusing');
    return _inflight;
  }
  _inflight = _doRefresh().finally(() => {
    _inflight = null;
  });
  return _inflight;
};

const _doRefresh = async (): Promise<void> => {
  try {
    // P1: eventos recentes (90 dias) ou não-finalizados + comunidades + profiles
    const cutoff = new Date(Date.now() - 90 * 86400000).toISOString();
    const [evRes, comRes, profRes] = await Promise.all([
      supabase
        .from('eventos_admin')
        .select('*')
        .or(`data_inicio.gte.${cutoff},status_evento.neq.FINALIZADO`)
        .order('data_inicio', { ascending: false })
        .limit(500),
      supabase.from('comunidades').select('id, nome, foto').eq('ativa', true).limit(500),
      supabase.from('profiles').select('id, nome').limit(2000),
    ]);

    const eventos = evRes.data ?? [];
    const eventoIds = eventos.map(e => e.id);

    // P2: dados relacionados — só dos eventos carregados
    let lotesData: any[] = [],
      variacoesData: any[] = [],
      equipeData: any[] = [],
      sociosData: any[] = [];

    if (eventoIds.length > 0) {
      const [lotesRes, equipeRes, sociosRes] = await Promise.all([
        supabase.from('lotes').select('*').in('evento_id', eventoIds).limit(2000),
        supabase
          .from('equipe_evento')
          .select('evento_id, membro_id, papel, permissoes')
          .in('evento_id', eventoIds)
          .limit(2000),
        supabase.from('socios_evento').select('*').in('evento_id', eventoIds).limit(2000),
      ]);
      lotesData = lotesRes.data ?? [];
      equipeData = equipeRes.data ?? [];
      sociosData = sociosRes.data ?? [];
      // Variações depende dos lotes carregados
      const loteIds = lotesData.map((l: { id: string }) => l.id);
      if (loteIds.length > 0) {
        const varRes = await supabase.from('variacoes_ingresso').select('*').in('lote_id', loteIds).limit(5000);
        variacoesData = varRes.data ?? [];
      }
    }

    const comunidades = comRes.data ?? [];
    const profiles = profRes.data ?? [];

    // Lookup de socios por evento_id
    const sociosMap = new Map<string, SocioEvento[]>();
    for (const s of sociosData) {
      const evId = s.evento_id ?? '';
      if (!sociosMap.has(evId)) sociosMap.set(evId, []);
      sociosMap.get(evId)!.push({
        id: s.id,
        eventoId: evId,
        socioId: s.socio_id,
        splitPercentual: s.split_percentual ?? 0,
        permissoes: (s.permissoes as string[]) ?? [],
        status: s.status as SocioEvento['status'],
        rodadaNegociacao: s.rodada_negociacao ?? 1,
        mensagemNegociacao: s.mensagem_negociacao ?? undefined,
        motivoRejeicao: s.motivo_rejeicao ?? undefined,
      });
    }

    // lotes_mais_vanta dropada — mais_vanta_config_evento será carregado na Fase 2
    const lotesMvMap = new Map<string, LoteMaisVanta>();

    // Lookup de profiles (criadorNome)
    const profMap = new Map<string, string>();
    for (const p of profiles) {
      profMap.set(p.id, p.nome ?? '');
    }

    // Lookup de comunidades
    const comMap = new Map<string, { nome: string; foto: string }>();
    for (const c of comunidades) {
      comMap.set(c.id, { nome: c.nome, foto: c.foto ?? '' });
    }

    EVENTOS_ADMIN = eventos.map(row => {
      const ev = rowToEventoAdmin(row, lotesData, variacoesData, equipeData);
      const com = comMap.get(ev.comunidadeId);
      if (com) ev.comunidade = { id: ev.comunidadeId, ...com };
      if (ev.criadorId) ev.criadorNome = profMap.get(ev.criadorId) ?? undefined;
      const lmv = lotesMvMap.get(ev.id);
      if (lmv) ev.loteMaisVanta = lmv;
      const socios = sociosMap.get(ev.id);
      if (socios?.length) {
        ev.socios = socios.map(s => ({ ...s, nome: profMap.get(s.socioId) ?? '' }));
        // Retrocompat: preencher campos legados do primeiro socio
        ev.socioConvidadoId = socios[0].socioId;
        ev.splitSocio = socios.reduce((sum, s) => sum + s.splitPercentual, 0);
        ev.splitProdutor = 100 - ev.splitSocio;
      }
      return ev;
    });

    _refreshed = true;
    _version++;
  } catch (err) {
    console.error('[eventosAdminService] refresh falhou:', err);
  }
};
