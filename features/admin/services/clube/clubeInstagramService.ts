import { supabase } from '../../../../services/supabaseClient';
import { maisVantaConfigService } from '../maisVantaConfigService';
import { tsBR } from '../../../../utils';
import { _membros } from './clubeCache';

export async function verificarPerfilInstagram(
  handle: string,
): Promise<{ followers: number | null; formatted: string }> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error('Não autenticado');
  const res = await supabase.functions.invoke('instagram-followers', { body: { username: handle } });
  if (res.error) throw res.error;
  return { followers: res.data?.followers ?? null, formatted: res.data?.formatted ?? '—' };
}

export async function verificarBioInstagram(
  handle: string,
  code: string,
): Promise<{ verified: boolean; reason: string }> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error('Não autenticado');
  const res = await supabase.functions.invoke('verify-instagram-bio', { body: { username: handle, code } });
  if (res.error) throw res.error;
  return { verified: res.data?.verified ?? false, reason: res.data?.reason ?? 'UNAVAILABLE' };
}

export async function _fetchAndUpdateFollowers(userId: string, handle: string): Promise<void> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;
    const res = await supabase.functions.invoke('instagram-followers', { body: { username: handle } });
    const followers = res.data?.followers;
    if (typeof followers === 'number' && followers > 0) {
      await supabase
        .from('membros_clube')
        .update({ instagram_seguidores: followers, instagram_verificado_em: tsBR() })
        .eq('user_id', userId);
      const cached = _membros.get(userId);
      if (cached) cached.instagramSeguidores = followers;
    }
  } catch {
    // silencioso — não bloqueia fluxo
  }
}

export async function verificarPostAutomatico(
  reservaId: string,
  postUrl: string,
  requiredMentions?: string[],
): Promise<{ verified: boolean; placeholder?: boolean; reason?: string }> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return { verified: false, reason: 'Sessão expirada' };
    const mentions = requiredMentions ?? maisVantaConfigService.getConfig().mencoesObrigatorias;
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-instagram-post`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ reservaId, postUrl, requiredMentions: mentions }),
    });
    return await res.json();
  } catch {
    return { verified: false, reason: 'Erro de conexão' };
  }
}

export async function atualizarSeguidores(): Promise<{ updated: number; total: number; method: string }> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return { updated: 0, total: 0, method: 'error' };
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-instagram-followers`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: '{}',
    });
    return await res.json();
  } catch {
    return { updated: 0, total: 0, method: 'error' };
  }
}
