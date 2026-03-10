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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // ── 2. Parsear body ──
    const { reservaId, postUrl } = await req.json() as {
      reservaId: string;
      postUrl: string;
    };

    if (!postUrl || !reservaId) {
      return new Response(JSON.stringify({ error: 'reservaId e postUrl obrigatórios.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── 3. Buscar instagram do evento via reserva ──
    const { data: reserva, error: errReserva } = await supabase
      .from('reservas_mais_vanta')
      .select('evento_id')
      .eq('id', reservaId)
      .maybeSingle();

    if (errReserva || !reserva) {
      return new Response(JSON.stringify({ verified: false, reason: 'Reserva não encontrada.' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: evento } = await supabase
      .from('eventos_admin')
      .select('instagram')
      .eq('id', (reserva as { evento_id: string }).evento_id)
      .maybeSingle();

    // ── 4. Montar marcações obrigatórias (imutáveis) ──
    const FIXED_REQUIRED: string[] = ['@maisvanta', '#publi'];
    const eventoInstagram = (evento as { instagram?: string } | null)?.instagram;
    if (eventoInstagram) {
      FIXED_REQUIRED.push(`@${eventoInstagram.replace(/^@/, '')}`);
    }

    // ── 5. Verificar se Meta API está configurada ──
    if (!META_ACCESS_TOKEN) {
      return new Response(JSON.stringify({
        verified: false,
        placeholder: true,
        requiredMentions: FIXED_REQUIRED,
        message: 'Meta API não configurada. Use verificação manual.',
      }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── 6. Verificar via Instagram oEmbed ──
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

    const oembedData = await oembedRes.json() as { title?: string; html?: string };
    // Verificar caption (title) e HTML do embed para cobertura máxima
    const searchText = `${(oembedData.title ?? '')} ${(oembedData.html ?? '')}`.toLowerCase();

    // ── 7. Verificar todas as marcações obrigatórias ──
    const missing = FIXED_REQUIRED.filter(m => !searchText.includes(m.toLowerCase()));

    if (missing.length > 0) {
      return new Response(JSON.stringify({
        verified: false,
        reason: `Faltando: ${missing.join(', ')}`,
        missing,
      }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── 8. Marcar post como verificado no banco ──
    await supabase
      .from('reservas_mais_vanta')
      .update({ post_verificado: true })
      .eq('id', reservaId);

    return new Response(JSON.stringify({
      verified: true,
      reason: 'Post verificado automaticamente.',
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
