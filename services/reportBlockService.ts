import { supabase } from '../services/supabaseClient';

// --- Tipos ---

interface CriarDenunciaParams {
  tipo: 'USUARIO' | 'EVENTO' | 'COMUNIDADE' | 'CHAT';
  alvoUserId?: string;
  alvoEventoId?: string;
  alvoComunidadeId?: string;
  motivo: 'OFENSIVO' | 'SPAM' | 'PERFIL_FALSO' | 'ASSEDIO' | 'OUTRO';
  descricao?: string;
}

interface ServiceResult {
  success: boolean;
  error?: string;
}

// --- Helpers ---

function now(): string {
  return new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00';
}

async function getAuthUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// --- Cache local de bloqueados ---

let bloqueadosCache: Set<string> | null = null;
let bloqueadosCacheUserId: string | null = null;

async function ensureCache(userId: string): Promise<Set<string>> {
  if (bloqueadosCache && bloqueadosCacheUserId === userId) return bloqueadosCache;

  const { data } = await supabase.from('bloqueios').select('bloqueado_id').eq('bloqueador_id', userId);

  bloqueadosCache = new Set((data ?? []).map(r => r.bloqueado_id));
  bloqueadosCacheUserId = userId;
  return bloqueadosCache;
}

// --- Denúncias ---

export async function criarDenuncia(params: CriarDenunciaParams): Promise<ServiceResult> {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: 'Usuário não autenticado' };

  const { error } = await supabase.from('denuncias').insert({
    reporter_id: userId,
    tipo: params.tipo,
    alvo_user_id: params.alvoUserId ?? null,
    alvo_evento_id: params.alvoEventoId ?? null,
    alvo_comunidade_id: params.alvoComunidadeId ?? null,
    motivo: params.motivo,
    descricao: params.descricao ?? null,
    criado_em: now(),
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// --- Bloqueios ---

export async function bloquearUsuario(bloqueadoId: string): Promise<ServiceResult> {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: 'Usuário não autenticado' };

  const { error } = await supabase.from('bloqueios').insert({
    bloqueador_id: userId,
    bloqueado_id: bloqueadoId,
    criado_em: now(),
  });

  if (error) return { success: false, error: error.message };

  const cache = await ensureCache(userId);
  cache.add(bloqueadoId);

  return { success: true };
}

export async function desbloquearUsuario(bloqueadoId: string): Promise<ServiceResult> {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: 'Usuário não autenticado' };

  const { error } = await supabase
    .from('bloqueios')
    .delete()
    .eq('bloqueador_id', userId)
    .eq('bloqueado_id', bloqueadoId);

  if (error) return { success: false, error: error.message };

  const cache = await ensureCache(userId);
  cache.delete(bloqueadoId);

  return { success: true };
}

export async function listarBloqueados(): Promise<string[]> {
  const userId = await getAuthUserId();
  if (!userId) return [];

  const cache = await ensureCache(userId);
  return Array.from(cache);
}

export async function isUsuarioBloqueado(targetId: string): Promise<boolean> {
  const userId = await getAuthUserId();
  if (!userId) return false;

  const cache = await ensureCache(userId);
  return cache.has(targetId);
}
