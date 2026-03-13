/**
 * comunidadesService — CRUD de comunidades via Supabase.
 * Cache local síncrono + refresh async.
 */

import { Comunidade, DefinicaoCargoCustom, HorarioSemanal, HorarioOverride, TierMaisVanta } from '../../../types';
import { supabase } from '../../../services/supabaseClient';
import type { Database, Json } from '../../../types/supabase';
import { generateSlug } from '../../../utils/slug';
import { notifyMany } from '../../../services/notifyService';
import { auditService } from './auditService';

type ComunidadeRow = Database['public']['Tables']['comunidades']['Row'];

let _comunidades: Comunidade[] = [];
let _ready = false;

const rowToComunidade = (r: ComunidadeRow): Comunidade => ({
  id: r.id,
  nome: r.nome ?? '',
  foto: r.foto ?? '',
  fotoCapa: r.foto_capa ?? '',
  descricao: r.descricao ?? '',
  cidade: r.cidade ?? '',
  estado: r.estado ?? '',
  cep: r.cep ?? undefined,
  endereco: r.endereco ?? '',
  coords: r.coords as { lat: number; lng: number } | undefined,
  capacidadeMax: r.capacidade_max ?? undefined,
  cargos: [],
  eventoIds: [],
  ativa: r.ativa ?? true,
  cargosCustomizados: (r.cargos_customizados as unknown as DefinicaoCargoCustom[]) ?? [],
  vanta_fee_percent: r.vanta_fee_percent ?? undefined,
  vanta_fee_fixed: r.vanta_fee_fixed ?? undefined,
  gateway_fee_mode: (r.gateway_fee_mode as 'ABSORVER' | 'REPASSAR') ?? undefined,
  taxa_processamento_percent: r.taxa_processamento_percent != null ? Number(r.taxa_processamento_percent) : undefined,
  taxa_porta_percent: r.taxa_porta_percent != null ? Number(r.taxa_porta_percent) : undefined,
  taxa_minima: r.taxa_minima != null ? Number(r.taxa_minima) : undefined,
  cota_nomes_lista: r.cota_nomes_lista != null ? Number(r.cota_nomes_lista) : undefined,
  taxa_nome_excedente: r.taxa_nome_excedente != null ? Number(r.taxa_nome_excedente) : undefined,
  cota_cortesias: r.cota_cortesias != null ? Number(r.cota_cortesias) : undefined,
  taxa_cortesia_excedente_pct:
    r.taxa_cortesia_excedente_pct != null ? Number(r.taxa_cortesia_excedente_pct) : undefined,
  donoId: r.dono_id ?? undefined,
  tierMinimoMaisVanta: (r.tier_minimo_mais_vanta as TierMaisVanta) ?? undefined,
  horarioFuncionamento: (r.horario_funcionamento as unknown as HorarioSemanal[]) ?? [],
  horarioOverrides: (r.horario_overrides as unknown as HorarioOverride[]) ?? [],
  vanta_fee_repasse_percent: r.vanta_fee_repasse_percent ?? undefined,
  cnpj: r.cnpj ?? undefined,
  razaoSocial: r.razao_social ?? undefined,
  telefone: r.telefone ?? undefined,
  slug: r.slug ?? undefined,
  evento_privado_ativo: r.evento_privado_ativo ?? false,
  evento_privado_texto: r.evento_privado_texto ?? undefined,
  evento_privado_fotos: (r.evento_privado_fotos as unknown as string[]) ?? [],
  evento_privado_formatos: (r.evento_privado_formatos as unknown as string[]) ?? [],
  evento_privado_atracoes: (r.evento_privado_atracoes as unknown as string[]) ?? [],
  evento_privado_faixas_capacidade: (r.evento_privado_faixas_capacidade as unknown as string[]) ?? [],
});

export const comunidadesService = {
  get isReady(): boolean {
    return _ready;
  },

  async refresh(): Promise<void> {
    try {
      // RBAC V2: usar view admin (banco filtra por acesso do usuário)
      // View retorna mesmas colunas que comunidades, com filtro RLS embutido
      const { data, error } = await (supabase
        .from('comunidades_admin' as any)
        .select('*')
        .order('nome', { ascending: true })
        .limit(1000) as unknown as Promise<{ data: ComunidadeRow[] | null; error: any }>);

      if (error) {
        console.error('[comunidadesService] refresh erro:', error);
        return;
      }
      _comunidades = (data ?? []).map(r => rowToComunidade(r));
      _ready = true;
    } catch (err) {
      console.error('[comunidadesService] refresh falhou:', err);
    }
  },

  getAll: (): Comunidade[] => [..._comunidades],

  getAtivas: (): Comunidade[] => _comunidades.filter(c => c.ativa),

  get: (id: string): Comunidade | undefined => _comunidades.find(c => c.id === id),

  getByIds: (ids: string[]): Comunidade[] => _comunidades.filter(c => ids.includes(c.id)),

  async criar(data: {
    nome: string;
    descricao: string;
    cidade: string;
    estado?: string;
    cep?: string;
    endereco: string;
    foto?: string;
    fotoCapa?: string;
    coords?: { lat: number; lng: number };
    capacidadeMax?: number;
    horarioFuncionamento?: HorarioSemanal[];
    createdBy?: string;
    donoId?: string;
    cnpj?: string;
    razaoSocial?: string;
    telefone?: string;
  }): Promise<string> {
    const { data: inserted, error } = await supabase
      .from('comunidades')
      .insert({
        nome: data.nome,
        descricao: data.descricao,
        cidade: data.cidade,
        estado: data.estado ?? null,
        cep: data.cep ?? null,
        endereco: data.endereco,
        foto: data.foto ?? null,
        foto_capa: data.fotoCapa ?? null,
        coords: (data.coords ?? null) as unknown as Json,
        capacidade_max: data.capacidadeMax ?? null,
        horario_funcionamento: (data.horarioFuncionamento ?? []) as unknown as Json,
        created_by: data.createdBy ?? null,
        dono_id: data.donoId ?? data.createdBy ?? null,
        slug: generateSlug(data.nome),
        cnpj: data.cnpj ?? null,
        razao_social: data.razaoSocial ?? null,
        telefone: data.telefone ?? null,
      })
      .select('*')
      .single();

    if (error || !inserted) {
      console.error('[comunidadesService] criar erro:', error);
      return '';
    }

    const nova = rowToComunidade(inserted);
    _comunidades.push(nova);
    return nova.id;
  },

  async atualizar(
    id: string,
    updates: Partial<{
      nome: string;
      descricao: string;
      cidade: string;
      estado: string;
      cep: string;
      endereco: string;
      foto: string;
      fotoCapa: string;
      coords: { lat: number; lng: number };
      capacidadeMax: number;
      ativa: boolean;
      cargosCustomizados: DefinicaoCargoCustom[];
      vanta_fee_percent: number;
      vanta_fee_fixed: number;
      gateway_fee_mode: 'ABSORVER' | 'REPASSAR';
      taxa_processamento_percent: number;
      taxa_porta_percent: number;
      taxa_minima: number;
      cota_nomes_lista: number;
      taxa_nome_excedente: number;
      cota_cortesias: number;
      taxa_cortesia_excedente_pct: number;
      donoId: string;
      horarioFuncionamento: HorarioSemanal[];
      horarioOverrides: HorarioOverride[];
      cnpj: string;
      razaoSocial: string;
      telefone: string;
      vanta_fee_repasse_percent: number;
      evento_privado_ativo: boolean;
      evento_privado_texto: string;
      evento_privado_fotos: string[];
      evento_privado_formatos: string[];
      evento_privado_atracoes: string[];
      evento_privado_faixas_capacidade: string[];
    }>,
  ): Promise<boolean> {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.nome !== undefined) dbUpdates.nome = updates.nome;
    if (updates.descricao !== undefined) dbUpdates.descricao = updates.descricao;
    if (updates.cidade !== undefined) dbUpdates.cidade = updates.cidade;
    if (updates.estado !== undefined) dbUpdates.estado = updates.estado;
    if (updates.cep !== undefined) dbUpdates.cep = updates.cep;
    if (updates.endereco !== undefined) dbUpdates.endereco = updates.endereco;
    if (updates.foto !== undefined) dbUpdates.foto = updates.foto;
    if (updates.fotoCapa !== undefined) dbUpdates.foto_capa = updates.fotoCapa;
    if (updates.coords !== undefined) dbUpdates.coords = updates.coords;
    if (updates.capacidadeMax !== undefined) dbUpdates.capacidade_max = updates.capacidadeMax;
    if (updates.ativa !== undefined) dbUpdates.ativa = updates.ativa;
    if (updates.cargosCustomizados !== undefined) dbUpdates.cargos_customizados = updates.cargosCustomizados;
    if (updates.vanta_fee_percent !== undefined) dbUpdates.vanta_fee_percent = updates.vanta_fee_percent;
    if (updates.vanta_fee_fixed !== undefined) dbUpdates.vanta_fee_fixed = updates.vanta_fee_fixed;
    if (updates.gateway_fee_mode !== undefined) dbUpdates.gateway_fee_mode = updates.gateway_fee_mode;
    if (updates.taxa_processamento_percent !== undefined)
      dbUpdates.taxa_processamento_percent = updates.taxa_processamento_percent;
    if (updates.taxa_porta_percent !== undefined) dbUpdates.taxa_porta_percent = updates.taxa_porta_percent;
    if (updates.taxa_minima !== undefined) dbUpdates.taxa_minima = updates.taxa_minima;
    if (updates.cota_nomes_lista !== undefined) dbUpdates.cota_nomes_lista = updates.cota_nomes_lista;
    if (updates.taxa_nome_excedente !== undefined) dbUpdates.taxa_nome_excedente = updates.taxa_nome_excedente;
    if (updates.cota_cortesias !== undefined) dbUpdates.cota_cortesias = updates.cota_cortesias;
    if (updates.taxa_cortesia_excedente_pct !== undefined)
      dbUpdates.taxa_cortesia_excedente_pct = updates.taxa_cortesia_excedente_pct;
    if (updates.donoId !== undefined) dbUpdates.dono_id = updates.donoId;
    if (updates.horarioFuncionamento !== undefined) dbUpdates.horario_funcionamento = updates.horarioFuncionamento;
    if (updates.horarioOverrides !== undefined) dbUpdates.horario_overrides = updates.horarioOverrides;
    if (updates.cnpj !== undefined) dbUpdates.cnpj = updates.cnpj;
    if (updates.razaoSocial !== undefined) dbUpdates.razao_social = updates.razaoSocial;
    if (updates.telefone !== undefined) dbUpdates.telefone = updates.telefone;
    if (updates.vanta_fee_repasse_percent !== undefined)
      dbUpdates.vanta_fee_repasse_percent = updates.vanta_fee_repasse_percent;
    if (updates.evento_privado_ativo !== undefined) dbUpdates.evento_privado_ativo = updates.evento_privado_ativo;
    if (updates.evento_privado_texto !== undefined) dbUpdates.evento_privado_texto = updates.evento_privado_texto;
    if (updates.evento_privado_fotos !== undefined) dbUpdates.evento_privado_fotos = updates.evento_privado_fotos;
    if (updates.evento_privado_formatos !== undefined)
      dbUpdates.evento_privado_formatos = updates.evento_privado_formatos;
    if (updates.evento_privado_atracoes !== undefined)
      dbUpdates.evento_privado_atracoes = updates.evento_privado_atracoes;
    if (updates.evento_privado_faixas_capacidade !== undefined)
      dbUpdates.evento_privado_faixas_capacidade = updates.evento_privado_faixas_capacidade;

    const { error } = await supabase.from('comunidades').update(dbUpdates).eq('id', id);
    if (error) {
      console.error('[comunidadesService] atualizar erro:', error);
      return false;
    }

    // Atualiza cache
    const idx = _comunidades.findIndex(c => c.id === id);
    if (idx !== -1) {
      _comunidades[idx] = { ..._comunidades[idx], ...updates };
    }
    return true;
  },

  /** Soft delete — desativa comunidade, notifica todos os membros. */
  async desativar(id: string, executadoPor: { id: string; nome: string }): Promise<boolean> {
    const com = _comunidades.find(c => c.id === id);
    if (!com) return false;

    const { error } = await supabase.from('comunidades').update({ ativa: false }).eq('id', id);
    if (error) {
      console.error('[comunidadesService] desativar erro:', error);
      return false;
    }

    // Atualiza cache
    const idx = _comunidades.findIndex(c => c.id === id);
    if (idx !== -1) _comunidades[idx] = { ..._comunidades[idx], ativa: false };

    // Audit log
    auditService.log(
      executadoPor.id,
      'INTERVENCAO_MASTER',
      'comunidade',
      id,
      { comunidadeNome: com.nome, acao: 'DESATIVAR' },
      undefined,
      executadoPor.nome,
    );

    // Notificar todos os membros (atribuições RBAC da comunidade)
    const { data: atribuicoes } = await supabase
      .from('atribuicoes_rbac')
      .select('user_id')
      .eq('tenant_type', 'COMUNIDADE')
      .eq('tenant_id', id)
      .eq('ativo', true)
      .limit(1000);

    if (atribuicoes && atribuicoes.length > 0) {
      const userIds = atribuicoes.map(a => a.user_id as string);
      void notifyMany(userIds, {
        tipo: 'CARGO_REMOVIDO',
        titulo: 'Comunidade desativada',
        mensagem: `A comunidade "${com.nome}" foi desativada. Seu acesso foi encerrado.`,
        link: '',
      });
    }

    // Revogar atribuições
    await supabase
      .from('atribuicoes_rbac')
      .update({ ativo: false })
      .eq('tenant_type', 'COMUNIDADE')
      .eq('tenant_id', id);

    return true;
  },

  /** Upload de foto para Supabase Storage. Retorna URL pública. */
  async uploadFoto(comunidadeId: string, tipo: 'perfil' | 'capa', dataUrl: string): Promise<string> {
    const ext = 'jpg';
    const path = `${comunidadeId}/${tipo}.${ext}`;
    const [header, base64] = dataUrl.split(',');
    const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
    const binary = atob(base64);
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) buffer[i] = binary.charCodeAt(i);
    const blob = new Blob([buffer], { type: mime });

    const { error } = await supabase.storage
      .from('comunidades')
      .upload(path, blob, { contentType: 'image/jpeg', upsert: true });

    if (error) {
      console.error(`[comunidadesService] uploadFoto ${tipo} erro:`, error);
      return dataUrl; // fallback: retorna base64 original
    }

    const { data } = supabase.storage.from('comunidades').getPublicUrl(path);
    return `${data.publicUrl}?t=${Date.now()}`;
  },
};
