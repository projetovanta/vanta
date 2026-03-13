/**
 * supabaseClient — instância singleton do Supabase para toda a aplicação.
 *
 * Variáveis de ambiente (obrigatórias em .env):
 *   VITE_SUPABASE_URL      — URL do projeto Supabase
 *   VITE_SUPABASE_ANON_KEY — chave pública (anon) do projeto
 *
 * Em produção, as variáveis são injetadas via CI/CD ou painel do host.
 * Nunca commitar valores reais no repositório.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string)?.trim();
const supabaseKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string)?.trim();

const isMissing =
  !supabaseUrl ||
  supabaseUrl === '[INSIRA_A_SUA_URL_AQUI]' ||
  !supabaseKey ||
  supabaseKey === '[INSIRA_A_SUA_ANON_KEY_AQUI]';

if (isMissing && import.meta.env.PROD) {
  throw new Error('[VANTA] VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias em produção.');
}
if (isMissing) {
  console.warn('[VANTA] Supabase não configurado — defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.local'); // audit-ok: aviso de config
}

import { wrapSupabaseWithLogging } from './supabaseProxy';

const _supabaseRaw = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-anon-key',
);

export const supabase = wrapSupabaseWithLogging(_supabaseRaw);

// ── Keep-alive: ping leve a cada 4 min para manter o connection pool quente ──
// Evita cold start de ~5s no Supabase após inatividade.
// Em dev, não roda pra não poluir DevLog com queries de ping.
if (!isMissing && import.meta.env.PROD) {
  const KEEP_ALIVE_MS = 4 * 60 * 1000; // 4 minutos
  setInterval(() => {
    void _supabaseRaw.from('profiles').select('id', { count: 'exact', head: true }).limit(0);
  }, KEEP_ALIVE_MS);
}

// supabaseAdmin REMOVIDO (2026-03-03)
// Todas as tabelas possuem RLS policies de leitura para admin roles.
// Service role key NUNCA deve entrar no bundle client.
// Se precisar de bypass RLS no futuro → usar Edge Functions.
