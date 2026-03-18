/**
 * instagram-followers — Supabase Edge Function
 *
 * Retorna a contagem de seguidores de um perfil público do Instagram.
 * Faz fetch server-side no endpoint interno do Instagram (sem CORS).
 *
 * POST /functions/v1/instagram-followers
 * Body: { username: string }
 * Response: { followers: number | null, formatted: string }
 *
 * Requer usuário autenticado (qualquer role com acesso ao painel).
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

/** Parseia string de seguidores do Instagram: "54,7 mi" → 54700000, "1.2K" → 1200, "820 mil" → 820000 */
function parseFollowerString(raw: string): number | null {
  const clean = raw.replace(/\s/g, '').replace(/&nbsp;/g, '').replace(/,/g, '.');
  const match = clean.match(/^([\d.]+)\s*(mi|mil|[mM]|[kK])?$/);
  if (!match) return null;
  const num = parseFloat(match[1]);
  if (isNaN(num)) return null;
  const suffix = (match[2] || '').toLowerCase();
  if (suffix === 'mi' || suffix === 'm') return Math.round(num * 1_000_000);
  if (suffix === 'mil' || suffix === 'k') return Math.round(num * 1_000);
  return Math.round(num);
}

/** Formata número de seguidores: 1200 → "1.2K", 820000 → "820K", 1500000 → "1.5M" */
function formatFollowers(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return m % 1 === 0 ? `${m}M` : `${m.toFixed(1)}M`;
  }
  if (n >= 1_000) {
    const k = n / 1_000;
    return k % 1 === 0 ? `${k}K` : `${k.toFixed(1)}K`;
  }
  return String(n);
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
      return new Response(JSON.stringify({ error: 'Não autorizado.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);

    if (authErr || !user) {
      return new Response(JSON.stringify({ error: 'Token inválido.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── 2. Parsear body ──────────────────────────────────────────────────────
    const { username } = await req.json() as { username: string };
    const clean = username?.replace(/^@/, '').trim();

    if (!clean) {
      return new Response(JSON.stringify({ error: 'Username obrigatório.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── 3. Fetch Instagram — Método 1: API interna ────────────────────────────
    let followerCount: number | null = null;

    const igUrl = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(clean)}`;
    try {
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
        followerCount = igData?.data?.user?.edge_followed_by?.count ?? null;
      } else {
        console.warn(`[instagram-followers] API interna retornou ${igRes.status} para @${clean}`); // audit-ok: error handling
      }
    } catch (e) {
      console.warn(`[instagram-followers] API interna falhou para @${clean}:`, e);
    }

    // ── 4. Fallback: HTML parsing da página pública ──────────────────────────
    if (followerCount === null) {
      try {
        const htmlRes = await fetch(`https://www.instagram.com/${encodeURIComponent(clean)}/`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml',
            'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
          },
        });
        if (htmlRes.ok) {
          const html = await htmlRes.text();
          // Método A: meta tag og:description ("X Followers, Y Following, Z Posts")
          const metaMatch = html.match(/content="([\d,.]+[KkMm]?)\s+Followers/i)
            || html.match(/content="([\d,.]+[KkMm]?)\s+seguidores/i);
          if (metaMatch) {
            followerCount = parseFollowerString(metaMatch[1]);
          }
          // Método B: JSON embutido (window._sharedData ou similar)
          if (followerCount === null) {
            const jsonMatch = html.match(/"edge_followed_by":\s*\{\s*"count":\s*(\d+)\s*\}/);
            if (jsonMatch) {
              followerCount = parseInt(jsonMatch[1], 10);
            }
          }
          // Método C: span com classe conhecida (ex: "54,7 mi" / "1.2K")
          if (followerCount === null) {
            const spanMatch = html.match(/(\d[\d.,]*)\s*(?:&nbsp;)?\s*(mil|mi|[KkMm])\b/);
            if (spanMatch) {
              followerCount = parseFollowerString(spanMatch[1] + spanMatch[2]);
            }
          }
        }
      } catch (e) {
        console.warn(`[instagram-followers] HTML parsing falhou para @${clean}:`, e);
      }
    }

    if (followerCount === null) {
      return new Response(JSON.stringify({ followers: null, formatted: '—', error: 'Não foi possível extrair seguidores.' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      followers: followerCount,
      formatted: formatFollowers(followerCount),
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[instagram-followers] Erro:', err);
    return new Response(JSON.stringify({ followers: null, formatted: '—', error: 'Erro interno.' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
