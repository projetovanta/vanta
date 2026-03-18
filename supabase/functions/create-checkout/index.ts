/**
 * create-checkout — Supabase Edge Function (MV2)
 *
 * Cria sessão Stripe Checkout para assinatura MAIS VANTA.
 * REGRA APPLE: retorna URL para abrir em navegador externo (nunca dentro do app).
 *
 * POST /functions/v1/create-checkout
 * Body: { comunidadeId: string; plano: 'BASICO' | 'PRO' | 'ENTERPRISE'; returnUrl: string }
 * Response: { url: string | null; placeholder?: boolean; message?: string }
 *
 * Variáveis de ambiente (configurar no Dashboard do Supabase):
 *   STRIPE_SECRET_KEY       — chave secreta do Stripe
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

function getCorsOrigin(req: Request): string {
  const origin = req.headers.get('origin') ?? '';
  if (origin === 'http://localhost:5173' || origin === 'http://localhost:5174') return origin;
  return 'https://maisvanta.com';
}
let corsHeaders = { 'Access-Control-Allow-Origin': 'https://maisvanta.com', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };

const PLANO_PRICES: Record<string, number> = {
  BASICO: 19900,     // R$ 199,00 em centavos
  PRO: 49900,        // R$ 499,00
  ENTERPRISE: 99900, // R$ 999,00
};

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
    const { comunidadeId, plano, returnUrl } = await req.json() as {
      comunidadeId: string; plano: string; returnUrl: string;
    };

    if (!comunidadeId || !plano || !PLANO_PRICES[plano]) {
      return new Response(JSON.stringify({ error: 'comunidadeId e plano são obrigatórios.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── 3. Verificar se Stripe está configurado ──
    if (!STRIPE_SECRET_KEY) {
      // PLACEHOLDER: Stripe não configurado
      // Cria registro PENDENTE no banco para futura ativação
      await supabase.from('assinaturas_mais_vanta').upsert({
        comunidade_id: comunidadeId,
        plano,
        status: 'PENDENTE',
        valor_mensal: PLANO_PRICES[plano] / 100,
        criado_por: user.id,
      }, { onConflict: 'comunidade_id' });

      return new Response(JSON.stringify({
        url: null,
        placeholder: true,
        message: 'Stripe não configurado. Assinatura registrada como PENDENTE. Configure STRIPE_SECRET_KEY no Dashboard do Supabase.',
      }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── 4. Criar Stripe Checkout Session ──
    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode': 'subscription',
        'success_url': returnUrl || 'https://maisvanta.com/admin?checkout=success',
        'cancel_url': returnUrl || 'https://maisvanta.com/admin?checkout=cancel',
        'line_items[0][price_data][currency]': 'brl',
        'line_items[0][price_data][product_data][name]': `MAIS VANTA — Plano ${plano}`,
        'line_items[0][price_data][unit_amount]': String(PLANO_PRICES[plano]),
        'line_items[0][price_data][recurring][interval]': 'month',
        'line_items[0][quantity]': '1',
        'metadata[comunidade_id]': comunidadeId,
        'metadata[plano]': plano,
        'metadata[user_id]': user.id,
        'client_reference_id': comunidadeId,
      }),
    });

    const session = await stripeRes.json();

    if (!stripeRes.ok || !session.url) {
      console.error('[create-checkout] Stripe error:', session);
      return new Response(JSON.stringify({ error: 'Erro ao criar sessão Stripe.' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[create-checkout] Erro:', err);
    return new Response(JSON.stringify({ error: 'Erro interno.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
