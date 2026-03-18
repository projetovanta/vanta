/**
 * verify-instagram-bio — Supabase Edge Function
 *
 * Verifica se um código de verificação VANTA está presente na bio
 * de um perfil público do Instagram (scraping server-side, sem CORS).
 *
 * POST /functions/v1/verify-instagram-bio
 * Body: { username: string, code: string }
 * Response: { verified: boolean, reason: 'FOUND' | 'NOT_FOUND' | 'UNAVAILABLE' }
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

function getCorsOrigin(req: Request): string {
  const origin = req.headers.get('origin') ?? '';
  if (origin === 'http://localhost:5173' || origin === 'http://localhost:5174') return origin;
  return 'https://maisvanta.com';
}
let corsHeaders = { 'Access-Control-Allow-Origin': 'https://maisvanta.com', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

serve(async (req: Request) => {
  corsHeaders = { 'Access-Control-Allow-Origin': getCorsOrigin(req), 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ── 1. Autenticação ──────────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Não autorizado.' }, 401);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);

    if (authErr || !user) {
      return jsonResponse({ error: 'Token inválido.' }, 401);
    }

    // ── 2. Parsear body ──────────────────────────────────────────────────────
    const { username, code } = await req.json() as { username: string; code: string };
    const clean = username?.replace(/^@/, '').trim();
    const cleanCode = code?.trim().toUpperCase();

    if (!clean) {
      return jsonResponse({ error: 'Username obrigatório.' }, 400);
    }
    if (!cleanCode || !cleanCode.startsWith('VANTA-')) {
      return jsonResponse({ error: 'Código de verificação inválido.' }, 400);
    }

    // ── 3. Fetch página do Instagram ─────────────────────────────────────────
    let pageContent = '';

    // Método 1: API interna (retorna JSON com biografia)
    try {
      const igUrl = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(clean)}`;
      const igRes = await fetch(igUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
          'x-ig-app-id': '936619743392459',
          'x-requested-with': 'XMLHttpRequest',
          'Accept': '*/*',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        },
      });
      if (igRes.ok) {
        const igData = await igRes.json();
        const biography = igData?.data?.user?.biography ?? '';
        if (biography) {
          pageContent = biography;
        }
      }
    } catch (e) {
      console.warn(`[verify-instagram-bio] API interna falhou para @${clean}:`, e);
    }

    // Método 2: HTML scraping (fallback)
    if (!pageContent) {
      try {
        const htmlRes = await fetch(`https://www.instagram.com/${encodeURIComponent(clean)}/`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml',
            'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
          },
        });
        if (htmlRes.ok) {
          pageContent = await htmlRes.text();
        }
      } catch (e) {
        console.warn(`[verify-instagram-bio] HTML fetch falhou para @${clean}:`, e);
      }
    }

    // ── 4. Verificar código na bio ───────────────────────────────────────────
    if (!pageContent) {
      return jsonResponse({ verified: false, reason: 'UNAVAILABLE' });
    }

    // Busca case-insensitive do código no conteúdo (bio via API ou HTML inteiro)
    const found = pageContent.toUpperCase().includes(cleanCode);

    return jsonResponse({
      verified: found,
      reason: found ? 'FOUND' : 'NOT_FOUND',
    });

  } catch (err) {
    console.error('[verify-instagram-bio] Erro:', err);
    return jsonResponse({ verified: false, reason: 'UNAVAILABLE' });
  }
});
