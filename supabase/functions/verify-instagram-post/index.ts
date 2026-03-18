/**
 * verify-instagram-post — Supabase Edge Function (MV3)
 *
 * Verifica automaticamente se um post/story contém as menções obrigatórias.
 * Usa Instagram Graph API quando configurada, senão retorna placeholder.
 *
 * POST /functions/v1/verify-instagram-post
 * Body: { reservaId: string; postUrl: string; requiredMentions: string[] }
 * Response: { verified: boolean; reason?: string; placeholder?: boolean }
 *
 * Variáveis de ambiente:
 *   META_ACCESS_TOKEN      — Token de acesso longa duração (Graph API)
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const META_ACCESS_TOKEN = Deno.env.get('META_ACCESS_TOKEN') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

function getCorsOrigin(req: Request): string {
  const origin = req.headers.get('origin') ?? '';
  if (origin === 'http://localhost:5173' || origin === 'http://localhost:5174') return origin;
  return 'https://maisvanta.com';
}
let corsHeaders = { 'Access-Control-Allow-Origin': 'https://maisvanta.com', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };

serve(async (req: Request) => {
  corsHeaders = { 'Access-Control-Allow-Origin': getCorsOrigin(req), 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
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

    // ── 2. Parsear body ──
    const { postUrl, requiredMentions } = await req.json() as {
      reservaId: string;
      postUrl: string;
      requiredMentions: string[];
    };

    if (!postUrl) {
      return new Response(JSON.stringify({ error: 'postUrl obrigatório.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── 3. Verificar se Meta API está configurada ──
    if (!META_ACCESS_TOKEN) {
      return new Response(JSON.stringify({
        verified: false,
        placeholder: true,
        message: 'Meta API não configurada. Use verificação manual. Configure META_ACCESS_TOKEN no Dashboard do Supabase.',
      }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── 4. Verificar via Instagram oEmbed + Graph API ──
    // Step 1: Resolver media ID via oEmbed
    const oembedUrl = `https://graph.facebook.com/v19.0/instagram_oembed?url=${encodeURIComponent(postUrl)}&access_token=${META_ACCESS_TOKEN}`;
    const oembedRes = await fetch(oembedUrl);

    if (!oembedRes.ok) {
      return new Response(JSON.stringify({
        verified: false,
        reason: 'Não foi possível acessar o post. Verifique se o perfil é público.',
      }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const oembedData = await oembedRes.json();
    const caption = (oembedData.title ?? '').toLowerCase();

    // Step 2: Verificar menções na caption
    const mentions = requiredMentions ?? ['@maisvanta'];
    const missingMentions = mentions.filter(m => !caption.includes(m.toLowerCase()));

    // Step 3: Verificar hashtags obrigatórias (#publi ou #parceria)
    const hasPubliTag = caption.includes('#publi') || caption.includes('#parceria');

    if (missingMentions.length > 0) {
      return new Response(JSON.stringify({
        verified: false,
        reason: `Menções faltando: ${missingMentions.join(', ')}`,
      }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!hasPubliTag) {
      return new Response(JSON.stringify({
        verified: false,
        reason: 'Hashtag obrigatória faltando: #publi ou #parceria (CONAR)',
      }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      verified: true,
      reason: 'Post verificado automaticamente via Meta API.',
    }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[verify-instagram-post] Erro:', err);
    return new Response(JSON.stringify({ verified: false, reason: 'Erro interno.' }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
