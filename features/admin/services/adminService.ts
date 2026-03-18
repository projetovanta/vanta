/**
 * adminService — curadoria, VANTA Indica, níveis de prestígio.
 *
 * Todas as fontes de dados: Supabase (fonte única da verdade).
 */

import { VantaIndicaCard, Membro, AcaoIndicaCard, TipoIndicaCard } from '../../../types';
import { supabase } from '../../../services/supabaseClient';
import type { Database, Json } from '../../../types/supabase';
import { profileToMembro } from '../../../services/authService';

type IndicaRow = Database['public']['Tables']['vanta_indica']['Row'];

const getTimestampBR = (): string => {
  const d = new Date();
  const local = new Date(d.getTime() - 3 * 60 * 60 * 1000);
  return local.toISOString().replace('Z', '-03:00');
};

// ── Cache local de indica cards ──────────────────────────────────────────────
let _indicaCards: VantaIndicaCard[] = [];
let _indicaLastFetch = 0;
const INDICA_CACHE_TTL = 5 * 60_000; // 5min — cards mudam raramente

const rowToIndicaCard = (row: IndicaRow): VantaIndicaCard => ({
  id: row.id,
  tipo: (row.tipo as TipoIndicaCard) ?? 'DESTAQUE_EVENTO',
  imagem: row.imagem || undefined,
  badge: row.badge ?? '',
  titulo: row.titulo ?? '',
  subtitulo: row.subtitulo ?? '',
  ativo: row.ativo ?? true,
  alvoLocalidades: row.alvo_localidades ?? ['GLOBAL'],
  acaoLink: row.acao_link ?? '',
  acao: (row.acao as unknown as AcaoIndicaCard) ?? undefined,
  imgPosition: row.img_position ?? 'center',
  textAlign: row.text_align ?? 'end',
  layoutConfig: (row.layout_config as unknown as VantaIndicaCard['layoutConfig']) ?? undefined,
  criadoPor: row.criado_por ?? '',
  criadoEm: row.criado_em ?? '',
});

// ── Curadoria de Membros — Supabase ─────────────────────────────────────────

/** Retorna membros pendentes de curadoria (curadoria_concluida = false ou null) */
const getMembrosParaCuradoria = async (): Promise<Membro[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, nome, email, avatar_url, instagram, instagram_followers, cidade, estado, genero, data_nascimento, created_at, curadoria_concluida, notas_admin, role, destaque_curadoria',
    )
    .or('curadoria_concluida.is.null,curadoria_concluida.eq.false')
    .not('email', 'is', null)
    .not('nome', 'is', null)
    .order('created_at', { ascending: false })
    .limit(200);

  if (error || !data) return [];
  return data.map(row => {
    const m = profileToMembro(row);
    m.curadoriaConcluida = false;
    m.cadastradoEm = (row.created_at as string | undefined) ?? '';
    return m;
  });
};

/** @deprecated tags_curadoria movida para membros_clube.tags — manter stub para compat */
const setTagsCuradoria = async (_membroId: string, _tags: string[]): Promise<{ error: unknown }> => {
  return { error: null };
};

/** Conclui curadoria — membro migra para a lista de Membros */
const concluirCuradoria = async (membroId: string): Promise<void> => {
  const { error } = await supabase.from('profiles').update({ curadoria_concluida: true }).eq('id', membroId);
  if (error) console.error('[adminService] concluirCuradoria:', error);
};

/** Conclui curadoria com tags selecionadas */
const concluirCuradoriaComTags = async (_membroId: string, _tagIds: string[], _tagNomes: string[]): Promise<void> => {
  const { error } = await supabase.from('profiles').update({ curadoria_concluida: true }).eq('id', _membroId);
  if (error) console.error('[adminService] concluirCuradoriaComTags:', error);
};

/** Retorna membros classificados (curadoria_concluida = true) */
const getMembrosClassificados = async (): Promise<Membro[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, nome, email, avatar_url, instagram, instagram_followers, cidade, estado, genero, data_nascimento, created_at, curadoria_concluida, notas_admin, role, destaque_curadoria',
    )
    .eq('curadoria_concluida', true)
    .not('email', 'is', null)
    .not('nome', 'is', null)
    .order('nome', { ascending: true })
    .limit(500);

  if (error || !data) return [];
  return data.map(row => {
    const m = profileToMembro(row);
    m.curadoriaConcluida = true;
    m.notas = (row.notas_admin as string | undefined) ?? '';
    m.cadastradoEm = (row.created_at as string | undefined) ?? '';
    return m;
  });
};

/** Salva nota do admin no Supabase */
const setNota = async (membroId: string, nota: string): Promise<void> => {
  const { error } = await supabase.from('profiles').update({ notas_admin: nota }).eq('id', membroId);
  if (error) console.error('[adminService] setNota:', error);
};

/** Toggle destaque do membro (curadoria) */
const toggleDestaque = async (membroId: string, valor: boolean): Promise<void> => {
  const { error } = await supabase.from('profiles').update({ destaque_curadoria: valor }).eq('id', membroId);
  if (error) console.error('[adminService] toggleDestaque:', error);
};

export const adminService = {
  // ── Curadoria de Membros ───────────────────────────────────────────────────
  getMembrosParaCuradoria,
  setTagsCuradoria,
  concluirCuradoria,
  concluirCuradoriaComTags,

  // ── Indica Cards — Supabase ──────────────────────────────────────────────
  async refreshIndicaCards(force = false): Promise<void> {
    if (!force && _indicaCards.length > 0 && Date.now() - _indicaLastFetch < INDICA_CACHE_TTL) return;
    // force = admin precisa ver tudo; normal = só ativos (Home)
    let query = supabase.from('vanta_indica').select('*').order('criado_em', { ascending: false });
    if (!force) query = query.eq('ativo', true);
    const { data, error } = await query;
    if (error) {
      console.error('[adminService] refreshIndicaCards:', error);
      return;
    }
    _indicaCards = (data ?? []).map(r => rowToIndicaCard(r));
    _indicaLastFetch = Date.now();
  },

  getIndicaCards: (): VantaIndicaCard[] => [..._indicaCards],

  toggleAtivoCard: async (id: string): Promise<void> => {
    const card = _indicaCards.find(c => c.id === id);
    if (!card) return;
    const novoAtivo = !card.ativo;
    const { error } = await supabase.from('vanta_indica').update({ ativo: novoAtivo }).eq('id', id);
    if (error) {
      console.error('[adminService] toggleAtivoCard:', error);
      return;
    }
    const idx = _indicaCards.findIndex(c => c.id === id);
    if (idx !== -1) _indicaCards[idx] = { ..._indicaCards[idx], ativo: novoAtivo };
  },

  addCard: async (card: Omit<VantaIndicaCard, 'id' | 'criadoEm'>): Promise<void> => {
    const row = {
      tipo: card.tipo,
      imagem: card.imagem || null,
      badge: card.badge,
      titulo: card.titulo,
      subtitulo: card.subtitulo,
      ativo: card.ativo,
      alvo_localidades: card.alvoLocalidades,
      acao_link: card.acaoLink,
      acao: (card.acao ?? null) as unknown as Json,
      img_position: card.imgPosition ?? 'center',
      text_align: card.textAlign ?? 'end',
      layout_config: (card.layoutConfig ?? {}) as unknown as Json,
      criado_por: card.criadoPor && card.criadoPor.includes('-') ? card.criadoPor : null,
    };
    const { data, error } = await supabase.from('vanta_indica').insert(row).select('*').single();
    if (error || !data) {
      console.error('[adminService] addCard:', error);
      return;
    }
    _indicaCards.unshift(rowToIndicaCard(data));
    try {
      const { auditService } = await import('./auditService');
      auditService.log(card.criadoPor || 'sistema', 'CARD_CRIADO', 'indica_card', data.id as string, undefined, {
        titulo: card.titulo,
        tipo: card.tipo,
      });
    } catch {
      /* silencioso */
    }
  },

  updateCard: async (id: string, updates: Partial<Omit<VantaIndicaCard, 'id' | 'criadoEm'>>): Promise<void> => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.tipo !== undefined) dbUpdates.tipo = updates.tipo;
    if (updates.imagem !== undefined) dbUpdates.imagem = updates.imagem || null;
    if (updates.badge !== undefined) dbUpdates.badge = updates.badge;
    if (updates.titulo !== undefined) dbUpdates.titulo = updates.titulo;
    if (updates.subtitulo !== undefined) dbUpdates.subtitulo = updates.subtitulo;
    if (updates.ativo !== undefined) dbUpdates.ativo = updates.ativo;
    if (updates.alvoLocalidades !== undefined) dbUpdates.alvo_localidades = updates.alvoLocalidades;
    if (updates.acaoLink !== undefined) dbUpdates.acao_link = updates.acaoLink;
    if (updates.acao !== undefined) dbUpdates.acao = updates.acao ?? null;
    if (updates.imgPosition !== undefined) dbUpdates.img_position = updates.imgPosition;
    if (updates.textAlign !== undefined) dbUpdates.text_align = updates.textAlign;
    if (updates.layoutConfig !== undefined) dbUpdates.layout_config = updates.layoutConfig ?? {};
    if (updates.criadoPor !== undefined)
      dbUpdates.criado_por = updates.criadoPor && updates.criadoPor.includes('-') ? updates.criadoPor : null;

    const { error } = await supabase.from('vanta_indica').update(dbUpdates).eq('id', id);
    if (error) {
      console.error('[adminService] updateCard:', error);
      return;
    }
    const idx = _indicaCards.findIndex(c => c.id === id);
    if (idx !== -1) _indicaCards[idx] = { ..._indicaCards[idx], ...updates };
    try {
      const { auditService } = await import('./auditService');
      auditService.log('sistema', 'CARD_EDITADO', 'indica_card', id, undefined, updates as Record<string, unknown>);
    } catch {
      /* silencioso */
    }
  },

  deleteCard: async (id: string): Promise<void> => {
    const { error } = await supabase.from('vanta_indica').delete().eq('id', id);
    if (error) {
      console.error('[adminService] deleteCard:', error);
      return;
    }
    const idx = _indicaCards.findIndex(c => c.id === id);
    if (idx !== -1) _indicaCards.splice(idx, 1);
    try {
      const { auditService } = await import('./auditService');
      auditService.log('sistema', 'CARD_REMOVIDO', 'indica_card', id);
    } catch {
      /* silencioso */
    }
  },

  // ── Membros Classificados ──────────────────────────────────────────────────
  getMembrosClassificados,

  setNota,
  toggleDestaque,
};
