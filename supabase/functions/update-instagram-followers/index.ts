/**
 * update-instagram-followers — Supabase Edge Function (MV3)
 *
 * Atualiza instagram_seguidores + instagram_verificado_em de todos os membros do clube.
 * Usa Instagram Graph API quando configurada, senão usa Edge Function instagram-followers existente.
 *
 * POST /functions/v1/update-instagram-followers
 * Body: {} (sem parâmetros — processa todos os membros ativos)
 * Response: { updated: number; total: number; method: 'graph_api' | 'scraping' | 'placeholder' }
 *
 * Variáveis de ambiente:
 *   META_ACCESS_TOKEN      — Token Graph API (opcional — fallback para scraping)
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const META_ACCESS_TOKEN = Deno.env.get('META_ACCESS_TOKEN') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const tsBR = () => new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/** Parseia string de seguidores: "54,7 mi" → 54700000, "1.2K" → 1200 */
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

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ── 1. Autenticação ──
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Não autorizado.' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: 'Token inválido.' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── 2. Buscar membros ativos com instagram_handle ──
    const { data: membros } = await supabase
      .from('membros_clube')
      .select('id, user_id, instagram_handle, meta_user_id')
      .eq('ativo', true)
      .not('instagram_handle', 'is', null);

    if (!membros?.length) {
      return new Response(JSON.stringify({ updated: 0, total: 0, method: 'none' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const now = tsBR();
    let updated = 0;
    let method: 'graph_api' | 'scraping' = 'scraping';

    for (const membro of membros) {
      const handle = membro.instagram_handle;
      if (!handle) continue;

      let followers: number | null = null;

      // Tentar Graph API primeiro (se meta_user_id + token configurados)
      if (META_ACCESS_TOKEN && membro.meta_user_id) {
        method = 'graph_api';
        try {
          const res = await fetch(
            `https://graph.instagram.com/v19.0/${membro.meta_user_id}?fields=followers_count&access_token=${META_ACCESS_TOKEN}`
          );
          if (res.ok) {
            const data = await res.json();
            followers = data.followers_count ?? null;
          }
        } catch (err) {
          console.error('[ig-followers] Graph API falhou:', err);
        }
      }

      // Fallback 1: API interna do Instagram (scraping server-side)
      if (followers === null) {
        method = 'scraping';
        try {
          const igUrl = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(handle)}`;
          const igRes = await fetch(igUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
              'x-ig-app-id': '936619743392459',
              'x-requested-with': 'XMLHttpRequest',
            },
          });
          if (igRes.ok) {
            const igData = await igRes.json();
            followers = igData?.data?.user?.edge_followed_by?.count ?? null;
          }
        } catch (err) {
          console.error('[ig-followers] scraping API falhou:', err);
        }
      }

      // Fallback 2: HTML parsing da página pública
      if (followers === null) {
        try {
          const htmlRes = await fetch(`https://www.instagram.com/${encodeURIComponent(handle)}/`, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml',
              'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
            },
          });
          if (htmlRes.ok) {
            const html = await htmlRes.text();
            const metaMatch = html.match(/content="([\d,.]+[KkMm]?)\s+Followers/i)
              || html.match(/content="([\d,.]+[KkMm]?)\s+seguidores/i);
            if (metaMatch) {
              followers = parseFollowerString(metaMatch[1]);
            }
            if (followers === null) {
              const jsonMatch = html.match(/"edge_followed_by":\s*\{\s*"count":\s*(\d+)\s*\}/);
              if (jsonMatch) followers = parseInt(jsonMatch[1], 10);
            }
            if (followers === null) {
              const spanMatch = html.match(/(\d[\d.,]*)\s*(?:&nbsp;)?\s*(mil|mi|[KkMm])\b/);
              if (spanMatch) followers = parseFollowerString(spanMatch[1] + spanMatch[2]);
            }
          }
        } catch (err) {
          console.error('[ig-followers] HTML parsing falhou:', err);
        }
      }

      if (followers !== null) {
        await supabase.from('membros_clube').update({
          instagram_seguidores: followers,
          instagram_verificado_em: now,
        }).eq('id', membro.id);
        updated++;
      }

      // Rate limit: esperar 1s entre requests para evitar ban
      await new Promise(r => setTimeout(r, 1000));
    }

    return new Response(JSON.stringify({ updated, total: membros.length, method }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[update-instagram-followers] Erro:', err);
    return new Response(JSON.stringify({ error: 'Erro interno.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
