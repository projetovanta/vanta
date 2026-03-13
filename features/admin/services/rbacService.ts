/**
 * rbacService — RBAC Multi-Tenant com Supabase como fonte da verdade.
 *
 * Padrão: cache local síncrono + refresh async do Supabase.
 * Mutações vão direto para o Supabase e atualizam o cache local.
 * Views consomem a API síncrona (getAtribuicoes, etc.) e chamam refresh() no useEffect.
 */

import type { Database } from '../../../types/supabase';
import {
  AtribuicaoRBAC,
  CargoUnificado,
  PermissaoVanta,
  TipoTenant,
  AccessNode,
  DefinicaoCargoCustom,
  EventoAdmin,
} from '../../../types';
import { supabase } from '../../../services/supabaseClient';
import type { Json } from '../../../types/supabase';
import { notify } from '../../../services/notifyService';

import { tsBR } from '../../../utils';
import { _registerRbac, eventosAdminService as _eaSvc } from './eventosAdminService';

// ── Mapeamentos internos ─────────────────────────────────────────────────────

export const CARGO_TO_PORTAL: Record<CargoUnificado, AccessNode['portalRole']> = {
  GERENTE: 'vanta_gerente',
  SOCIO: 'vanta_socio',
  PROMOTER: 'vanta_promoter',
  GER_PORTARIA_LISTA: 'vanta_ger_portaria_lista',
  PORTARIA_LISTA: 'vanta_portaria_lista',
  GER_PORTARIA_ANTECIPADO: 'vanta_ger_portaria_antecipado',
  PORTARIA_ANTECIPADO: 'vanta_portaria_antecipado',
  CAIXA: 'vanta_caixa',
};

export const CARGO_LABELS: Record<CargoUnificado, string> = {
  GERENTE: 'Gerente',
  SOCIO: 'Sócio',
  PROMOTER: 'Promoter',
  GER_PORTARIA_LISTA: 'Ger. Portaria (Lista)',
  PORTARIA_LISTA: 'Portaria (Lista)',
  GER_PORTARIA_ANTECIPADO: 'Ger. Portaria (Antecipado)',
  PORTARIA_ANTECIPADO: 'Portaria (Antecipado)',
  CAIXA: 'Caixa',
};

/** Mapa único de permissões por cargo — fonte da verdade */
export const CARGO_PERMISSOES: Record<CargoUnificado, PermissaoVanta[]> = {
  GERENTE: [
    'VER_FINANCEIRO',
    'GERIR_EQUIPE',
    'GERIR_LISTAS',
    'INSERIR_LISTA',
    'CRIAR_REGRA_LISTA',
    'VER_LISTA',
    'CHECKIN_LISTA',
    'VALIDAR_QR',
    'VALIDAR_ENTRADA',
  ],
  SOCIO: ['VER_FINANCEIRO', 'GERIR_EQUIPE', 'GERIR_LISTAS', 'INSERIR_LISTA', 'CRIAR_REGRA_LISTA', 'VER_LISTA'],
  PROMOTER: ['INSERIR_LISTA'],
  GER_PORTARIA_LISTA: ['CHECKIN_LISTA', 'VER_LISTA', 'INSERIR_LISTA', 'CRIAR_REGRA_LISTA', 'GERIR_EQUIPE'],
  PORTARIA_LISTA: ['CHECKIN_LISTA', 'VER_LISTA'],
  GER_PORTARIA_ANTECIPADO: ['VALIDAR_QR', 'GERIR_EQUIPE'],
  PORTARIA_ANTECIPADO: ['VALIDAR_QR'],
  CAIXA: ['VENDER_PORTA'],
};

// ── Cache local (populado via refresh) ───────────────────────────────────────

let ATRIBUICOES: AtribuicaoRBAC[] = [];
let _refreshed = false;

// Lookup tables para resolver tenant nome/foto (populadas junto com refresh)
const _comunidadeCache = new Map<string, { nome: string; foto?: string }>();
const _eventoCache = new Map<string, { nome: string; foto?: string; comunidadeId: string }>();

// ── Cache de permissões de plataforma (RBAC V2) ─────────────────────────────
let _permissoesPlataforma: string[] = [];

/** Converte row do Supabase para AtribuicaoRBAC com ContextoTenant */
type AtribuicaoRow = Database['public']['Tables']['atribuicoes_rbac']['Row'];

const rowToAtribuicao = (row: AtribuicaoRow): AtribuicaoRBAC => {
  const tenantType = row.tenant_type as TipoTenant;
  const tenantId = row.tenant_id;
  const cargo = row.cargo as CargoUnificado;

  // Resolver nome/foto do tenant a partir dos caches
  let tenantNome = '';
  let tenantFoto: string | undefined;
  if (tenantType === 'COMUNIDADE') {
    const c = _comunidadeCache.get(tenantId);
    tenantNome = c?.nome ?? '';
    tenantFoto = c?.foto;
  } else {
    const e = _eventoCache.get(tenantId);
    tenantNome = e?.nome ?? '';
    tenantFoto = e?.foto;
  }

  return {
    id: row.id,
    userId: row.user_id,
    tenant: { tipo: tenantType, id: tenantId, nome: tenantNome, foto: tenantFoto },
    cargo,
    permissoes: (row.permissoes ?? CARGO_PERMISSOES[cargo] ?? []) as PermissaoVanta[],
    atribuidoPor: row.atribuido_por ?? '',
    atribuidoEm: row.atribuido_em ?? '',
    ativo: row.ativo ?? true,
  };
};

// ── Soberania — cache local ──────────────────────────────────────────────────

const tenantKey = (tipo: TipoTenant, tenantId: string) => `${tipo}_${tenantId}`;

// ── Cargos customizados — cache local ────────────────────────────────────────
const CARGOS_CUSTOM: Map<string, DefinicaoCargoCustom[]> = new Map();

/** Carrega cargos customizados do JSONB de comunidades */
const refreshCargosCustom = async (): Promise<void> => {
  try {
    const { data } = await supabase.from('comunidades').select('id, cargos_customizados').eq('ativa', true).limit(1000);
    if (!data) return;
    CARGOS_CUSTOM.clear();
    for (const row of data) {
      const id = row.id as string;
      const cargos = (row.cargos_customizados as unknown as DefinicaoCargoCustom[] | null) ?? [];
      if (cargos.length > 0) {
        CARGOS_CUSTOM.set(tenantKey('COMUNIDADE', id), cargos);
      }
    }
  } catch {
    // silencioso
  }
};

// ── Serviço público ───────────────────────────────────────────────────────────

export const rbacService = {
  /** Indica se o cache já foi populado pelo menos uma vez */
  get isReady(): boolean {
    return _refreshed;
  },

  /**
   * Carrega todas as atribuições do Supabase e popula o cache local.
   * Deve ser chamado no início do app e após mutações que afetam outros usuários.
   */
  async refresh(knownUserId?: string, knownRole?: string): Promise<void> {
    try {
      const userId = knownUserId || (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;

      // Verificar se é masteradm (carrega tudo) ou usuário normal (filtra por tenant)
      let isMaster: boolean;
      if (knownRole) {
        isMaster = knownRole === 'vanta_masteradm';
      } else {
        const { data: profileData } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
        isMaster = profileData?.role === 'vanta_masteradm';
      }

      // Carregar atribuições RBAC do usuário (ou todas se master)
      const atribQuery = supabase.from('atribuicoes_rbac').select('*').eq('ativo', true);
      if (!isMaster) atribQuery.eq('user_id', userId);

      // Carregar permissões de plataforma (RBAC V2)
      const platQuery = supabase
        .from('atribuicoes_plataforma')
        .select('cargo_id, cargos_plataforma(permissoes)')
        .eq('user_id', userId)
        .eq('ativo', true);

      const [atribRes, platRes] = await Promise.all([atribQuery, platQuery, refreshCargosCustom()]);

      // Popula permissões de plataforma
      _permissoesPlataforma = [];
      if (platRes.data) {
        for (const row of platRes.data) {
          const cargo = row.cargos_plataforma as unknown as { permissoes: string[] } | null;
          if (cargo?.permissoes) {
            for (const p of cargo.permissoes) {
              if (!_permissoesPlataforma.includes(p)) _permissoesPlataforma.push(p);
            }
          }
        }
      }

      // Popula atribuições
      if (atribRes.data) {
        ATRIBUICOES = (atribRes.data ?? []).map(rowToAtribuicao);
      }

      // Extrair tenant IDs relevantes para carregar apenas comunidades/eventos necessários
      const comunidadeIds = new Set<string>();
      const eventoIds = new Set<string>();
      for (const a of ATRIBUICOES) {
        if (a.tenant.tipo === 'COMUNIDADE') comunidadeIds.add(a.tenant.id);
        else eventoIds.add(a.tenant.id);
      }

      // Carregar comunidades e eventos filtrados (master = tudo, normal = só seus tenants)
      const comQuery = supabase.from('comunidades').select('id, nome, foto').eq('ativa', true);
      if (!isMaster && comunidadeIds.size > 0) comQuery.in('id', [...comunidadeIds]);
      else if (!isMaster && comunidadeIds.size === 0) comQuery.limit(0);

      const evQuery = supabase.from('eventos_admin').select('id, nome, foto, comunidade_id');
      if (!isMaster && eventoIds.size > 0) evQuery.in('id', [...eventoIds]);
      else if (!isMaster && eventoIds.size === 0) evQuery.limit(0);

      const [comRes, evRes] = await Promise.all([comQuery, evQuery]);

      // Popula cache de comunidades
      _comunidadeCache.clear();
      if (comRes.data) {
        for (const c of comRes.data) {
          _comunidadeCache.set(c.id as string, { nome: c.nome as string, foto: c.foto as string | undefined });
        }
      }

      // Popula cache de eventos
      _eventoCache.clear();
      if (evRes.data) {
        for (const e of evRes.data) {
          _eventoCache.set(e.id as string, {
            nome: e.nome as string,
            foto: e.foto as string | undefined,
            comunidadeId: e.comunidade_id as string,
          });
        }
      }

      // Master: também carregar eventos das comunidades (cascata GERENTE → eventos da comunidade)
      if (isMaster || comunidadeIds.size > 0) {
        const comIds = isMaster ? [..._comunidadeCache.keys()] : [...comunidadeIds];
        if (comIds.length > 0) {
          const { data: evComData } = await supabase
            .from('eventos_admin')
            .select('id, nome, foto, comunidade_id')
            .in('comunidade_id', comIds);
          if (evComData) {
            for (const e of evComData) {
              if (!_eventoCache.has(e.id as string)) {
                _eventoCache.set(e.id as string, {
                  nome: e.nome as string,
                  foto: e.foto as string | undefined,
                  comunidadeId: e.comunidade_id as string,
                });
              }
            }
          }
        }
      }

      _refreshed = true;
    } catch (err) {
      console.error('[rbacService] refresh falhou:', err);
    }
  },

  /** Todas as atribuições ativas de um usuário (cache síncrono) */
  getAtribuicoes(userId: string): AtribuicaoRBAC[] {
    return ATRIBUICOES.filter(a => a.ativo && a.userId === userId);
  },

  /** Atribuição ativa em contexto específico (ou undefined) */
  getAtribuicao(userId: string, tipo: TipoTenant, tenantId: string): AtribuicaoRBAC | undefined {
    return ATRIBUICOES.find(a => a.ativo && a.userId === userId && a.tenant.tipo === tipo && a.tenant.id === tenantId);
  },

  /** Verifica permissão granular em um contexto exato */
  temPermissao(userId: string, tipo: TipoTenant, tenantId: string, p: PermissaoVanta): boolean {
    const a = this.getAtribuicao(userId, tipo, tenantId);
    return a?.permissoes.includes(p) ?? false;
  },

  /** Retorna o comunidadeId de um evento (via cache interno) */
  getComunidadeDoEvento(eventoId: string): string | undefined {
    return _eventoCache.get(eventoId)?.comunidadeId;
  },

  /** Verifica permissão com contexto flexível (communityId/eventId) + cascata comunidade→evento.
   *  GERENTE/SOCIO em comunidade dá acesso aos eventos dessa comunidade.
   *  Operacionais (PROMOTER, PORTARIA, CAIXA) só atuam onde foram explicitamente atribuídos.
   */
  temPermissaoCtx(userId: string, p: PermissaoVanta, ctx?: { communityId?: string; eventId?: string }): boolean {
    const atribs = this.getAtribuicoes(userId);
    for (const a of atribs) {
      const perms = CARGO_PERMISSOES[a.cargo];
      if (!perms?.includes(p)) continue;

      // Sem contexto → basta ter a permissão em qualquer lugar
      if (!ctx) return true;

      // Match direto por comunidade
      if (a.tenant.tipo === 'COMUNIDADE' && ctx.communityId && a.tenant.id === ctx.communityId) return true;

      // Match direto por evento
      if (a.tenant.tipo === 'EVENTO' && ctx.eventId && a.tenant.id === ctx.eventId) return true;

      // Cascata: cargo de comunidade dá acesso a eventos dessa comunidade
      // EXCETO operacionais (precisam recrutamento explícito)
      if (a.tenant.tipo === 'COMUNIDADE' && ctx.eventId) {
        const isOperacional = [
          'PROMOTER',
          'PORTARIA_LISTA',
          'PORTARIA_ANTECIPADO',
          'GER_PORTARIA_LISTA',
          'GER_PORTARIA_ANTECIPADO',
          'CAIXA',
        ].includes(a.cargo);
        if (!isOperacional) {
          const ev = _eventoCache.get(ctx.eventId);
          if (ev && ev.comunidadeId === a.tenant.id) return true;
        }
      }

      // Cascata inversa: cargo de EVENTO dá acesso ao contexto da COMUNIDADE pai
      // (sócio tem cargo no evento, mas painel entra pelo contexto comunidade)
      if (a.tenant.tipo === 'EVENTO' && ctx.communityId && !ctx.eventId) {
        const ev = _eventoCache.get(a.tenant.id);
        if (ev && ev.comunidadeId === ctx.communityId) return true;
      }
    }
    return false;
  },

  // ── Permissões de Plataforma (RBAC V2) ──────────────────────────────────────

  /** Retorna permissões de plataforma do usuário logado (cache síncrono) */
  getPermissoesPlataforma(): string[] {
    return _permissoesPlataforma;
  },

  /** Verifica se o usuário logado tem uma permissão de plataforma específica */
  temPermissaoPlataforma(permissao: string): boolean {
    return _permissoesPlataforma.includes(permissao);
  },

  // ── Cargos Customizados ────────────────────────────────────────────────────

  /** Lista cargos customizados de um tenant (cache síncrono) */
  getCargosCustomizados(tenantTipo: TipoTenant, tenantId: string): DefinicaoCargoCustom[] {
    return CARGOS_CUSTOM.get(tenantKey(tenantTipo, tenantId)) ?? [];
  },

  /** Upsert de cargo customizado — persiste no Supabase (comunidades.cargos_customizados JSONB) */
  async criarCargoCustom(
    tenantTipo: TipoTenant,
    tenantId: string,
    cargo: DefinicaoCargoCustom,
  ): Promise<DefinicaoCargoCustom> {
    const key = tenantKey(tenantTipo, tenantId);
    const lista = [...(CARGOS_CUSTOM.get(key) ?? [])];
    const idx = lista.findIndex(c => c.id === cargo.id);
    if (idx >= 0) lista[idx] = cargo;
    else lista.push(cargo);
    CARGOS_CUSTOM.set(key, lista);

    // Persiste no Supabase
    if (tenantTipo === 'COMUNIDADE') {
      await supabase
        .from('comunidades')
        .update({ cargos_customizados: lista as unknown as Json })
        .eq('id', tenantId);
    }

    return cargo;
  },

  /**
   * Eventos importáveis para reutilizar equipe: filtra por comunidade E criador.
   */
  getEventosImportaveis(comunidadeId: string, criadorUserId: string): EventoAdmin[] {
    return _eaSvc.getEventos().filter((ev: EventoAdmin) => {
      if (ev.comunidadeId !== comunidadeId) return false;
      if (ev.criadorId) return ev.criadorId === criadorUserId;
      return rbacService
        .getAtribuicoesTenant('EVENTO', ev.id)
        .some(a => a.cargo === 'SOCIO' && a.userId === criadorUserId);
    });
  },

  /**
   * Atribui cargo — persiste no Supabase via upsert + atualiza cache local.
   */
  async atribuir(args: Omit<AtribuicaoRBAC, 'id' | 'atribuidoEm'>): Promise<AtribuicaoRBAC> {
    const atribuidoEm = new Date(Date.now() - 3 * 3600000).toISOString().replace('Z', '-03:00');

    // Upsert no Supabase (constraint: user_id, tenant_type, tenant_id, cargo)
    const { data, error } = await supabase
      .from('atribuicoes_rbac')
      .upsert(
        {
          user_id: args.userId,
          tenant_type: args.tenant.tipo,
          tenant_id: args.tenant.id,
          cargo: args.cargo,
          permissoes: args.permissoes,
          atribuido_por: args.atribuidoPor || null,
          ativo: args.ativo,
        },
        { onConflict: 'user_id,tenant_type,tenant_id,cargo' },
      )
      .select()
      .single();

    if (error) {
      console.error('[rbacService] atribuir erro:', error, { args });
      throw new Error(`[rbacService] atribuir falhou: ${error.message}`);
    }

    const id = (data?.id as string) ?? `rbac_local_${Date.now()}`;

    const entry: AtribuicaoRBAC = {
      ...args,
      id,
      atribuidoEm,
    };

    // Atualiza cache local
    const idx = ATRIBUICOES.findIndex(
      a =>
        a.userId === args.userId &&
        a.tenant.tipo === args.tenant.tipo &&
        a.tenant.id === args.tenant.id &&
        a.cargo === args.cargo,
    );
    if (idx >= 0) ATRIBUICOES[idx] = entry;
    else ATRIBUICOES.push(entry);

    // Notificação ao membro (3 canais: in-app + push + email)
    const cargoLabel = CARGO_LABELS[args.cargo] ?? args.cargo;
    const tenantLabel = args.tenant.tipo === 'COMUNIDADE' ? 'comunidade' : 'evento';
    void notify({
      userId: args.userId,
      titulo: `Novo cargo: ${cargoLabel}`,
      mensagem: `Você recebeu o cargo de ${cargoLabel} em um(a) ${tenantLabel}.`,
      tipo: 'CARGO_ATRIBUIDO',
      link:
        args.tenant.tipo === 'COMUNIDADE' ? `/admin/comunidade/${args.tenant.id}` : `/admin/evento/${args.tenant.id}`,
    });

    return entry;
  },

  /** Revoga atribuição — delete no Supabase + remove do cache + notifica membro */
  async revogar(id: string): Promise<void> {
    // Buscar info antes de remover (para notificação)
    const match = ATRIBUICOES.find(a => a.id === id);

    // Atualiza no Supabase (soft delete: ativo = false)
    const { error: errRev } = await supabase.from('atribuicoes_rbac').update({ ativo: false }).eq('id', id);
    if (errRev) {
      console.error('[rbacService] revogar:', errRev);
      return;
    }

    // Remove do cache local
    ATRIBUICOES = ATRIBUICOES.filter(a => a.id !== id);

    // Notificação ao membro (3 canais)
    if (match) {
      const cargoLabel = CARGO_LABELS[match.cargo] ?? match.cargo;
      const tenantLabel = match.tenant.tipo === 'COMUNIDADE' ? 'comunidade' : 'evento';
      void notify({
        userId: match.userId,
        titulo: `Cargo removido: ${cargoLabel}`,
        mensagem: `Seu cargo de ${cargoLabel} em um(a) ${tenantLabel} foi removido.`,
        tipo: 'CARGO_REMOVIDO',
      });
    }
  },

  /** Lista todas as atribuições ativas de um tenant (cache síncrono) */
  getAtribuicoesTenant(tipo: TipoTenant, tenantId: string): AtribuicaoRBAC[] {
    return ATRIBUICOES.filter(a => a.ativo && a.tenant.tipo === tipo && a.tenant.id === tenantId);
  },

  // ── Recrutamento (baseado em AtribuicaoRBAC) ──────────────────────────────

  /** Cargos recrutáveis para evento */
  RECRUITABLE_CARGOS: ['PROMOTER', 'PORTARIA_LISTA', 'PORTARIA_ANTECIPADO', 'CAIXA'] as CargoUnificado[],

  /** Lista membros elegíveis da comunidade para um cargo (não recrutados ainda para o evento) */
  getElegiveis(comunidadeId: string, eventoId: string, cargo: CargoUnificado): AtribuicaoRBAC[] {
    const comMembers = ATRIBUICOES.filter(
      a => a.ativo && a.tenant.tipo === 'COMUNIDADE' && a.tenant.id === comunidadeId && a.cargo === cargo,
    );
    const recrutados = new Set(
      ATRIBUICOES.filter(
        a => a.ativo && a.tenant.tipo === 'EVENTO' && a.tenant.id === eventoId && a.cargo === cargo,
      ).map(a => a.userId),
    );
    return comMembers.filter(a => !recrutados.has(a.userId));
  },

  /** Lista staff recrutado para um evento */
  getRecrutados(eventoId: string, cargo?: CargoUnificado): AtribuicaoRBAC[] {
    return ATRIBUICOES.filter(
      a => a.ativo && a.tenant.tipo === 'EVENTO' && a.tenant.id === eventoId && (cargo ? a.cargo === cargo : true),
    );
  },

  /** Recruta membro da comunidade para atuar em evento */
  async recrutar(args: {
    userId: string;
    cargo: CargoUnificado;
    eventoId: string;
    eventoNome: string;
    atribuidoPor: string;
  }): Promise<AtribuicaoRBAC> {
    return this.atribuir({
      userId: args.userId,
      tenant: { tipo: 'EVENTO', id: args.eventoId, nome: args.eventoNome },
      cargo: args.cargo,
      permissoes: CARGO_PERMISSOES[args.cargo] ?? [],
      atribuidoPor: args.atribuidoPor,
      ativo: true,
    });
  },

  /** Remove recrutamento de staff de um evento */
  async desrecrutar(userId: string, eventoId: string, cargo: CargoUnificado): Promise<void> {
    const match = ATRIBUICOES.find(
      a =>
        a.ativo && a.userId === userId && a.cargo === cargo && a.tenant.tipo === 'EVENTO' && a.tenant.id === eventoId,
    );
    if (match) await this.revogar(match.id);
  },
};

// Registra referência para import lazy em eventosAdminService (resolve ciclo)
_registerRbac(rbacService);
