/**
 * stripe-webhook — Supabase Edge Function (MV2)
 *
 * Recebe webhooks do Stripe para atualizar status de assinaturas MAIS VANTA.
 *
 * POST /functions/v1/stripe-webhook
 * Headers: stripe-signature
 *
 * Variáveis de ambiente:
 *   STRIPE_WEBHOOK_SECRET  — signing secret do endpoint
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, stripe-signature',
};

/** HMAC-SHA256 via Web Crypto API (Deno) */
async function verifyStripeSignature(
  payload: string,
  sigHeader: string,
  secret: string,
): Promise<boolean> {
  const pairs = sigHeader.split(',').reduce(
    (acc, part) => {
      const [k, v] = part.split('=');
      if (k === 't') acc.timestamp = v;
      if (k === 'v1') acc.signatures.push(v);
      return acc;
    },
    { timestamp: '', signatures: [] as string[] },
  );

  if (!pairs.timestamp || pairs.signatures.length === 0) return false;

  // Tolerância de 5 minutos
  const ts = parseInt(pairs.timestamp, 10);
  if (Math.abs(Date.now() / 1000 - ts) > 300) return false;

  const signedPayload = `${pairs.timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload));
  const expected = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return pairs.signatures.some((s) => s === expected);
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ── 1. Verificar se webhook está configurado ──
    if (!STRIPE_WEBHOOK_SECRET) {
      return new Response(
        JSON.stringify({ error: 'STRIPE_WEBHOOK_SECRET não configurado.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // ── 2. Validar assinatura Stripe ──
    const body = await req.text();
    const sig = req.headers.get('stripe-signature') ?? '';

    const valid = await verifyStripeSignature(body, sig, STRIPE_WEBHOOK_SECRET);
    if (!valid) {
      console.warn('[stripe-webhook] invalid signature');
      return new Response(JSON.stringify({ error: 'Assinatura inválida.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── 3. Parsear body ──
    const event = JSON.parse(body);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log('[stripe-webhook] received', { type: event.type, id: event.id });

    // ── 4. Processar eventos ──
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const comunidadeId = session.metadata?.comunidade_id;
        const plano = session.metadata?.plano;
        if (comunidadeId) {
          const now = new Date(Date.now() - 3 * 3600000).toISOString().replace('Z', '-03:00');
          const { error: errUpsert } = await supabase.from('assinaturas_mais_vanta').upsert(
            {
              comunidade_id: comunidadeId,
              plano: plano || 'BASICO',
              status: 'ATIVA',
              stripe_customer_id: session.customer,
              stripe_subscription_id: session.subscription,
              inicio: now,
              criado_por: session.metadata?.user_id || null,
            },
            { onConflict: 'comunidade_id' },
          );
          if (errUpsert) console.error('[stripe-webhook] upsert assinatura:', errUpsert.message);
          console.log('[stripe-webhook] checkout.session.completed processed', { comunidadeId, plano: plano || 'BASICO', subscriptionId: session.subscription });
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        if (subscriptionId) {
          const { error: errPaid } = await supabase
            .from('assinaturas_mais_vanta')
            .update({ status: 'ATIVA' })
            .eq('stripe_subscription_id', subscriptionId);
          if (errPaid) console.error('[stripe-webhook] invoice.paid update:', errPaid.message);
          console.log('[stripe-webhook] invoice.paid processed', { subscriptionId });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const comunidadeId = subscription.metadata?.comunidade_id;
        if (comunidadeId) {
          const { error: errCancel } = await supabase
            .from('assinaturas_mais_vanta')
            .update({
              status: 'CANCELADA',
              fim: new Date(Date.now() - 3 * 3600000).toISOString().replace('Z', '-03:00'),
            })
            .eq('comunidade_id', comunidadeId);
          if (errCancel) console.error('[stripe-webhook] subscription.deleted update:', errCancel.message);
          console.log('[stripe-webhook] subscription.deleted processed', { comunidadeId });
        }
        break;
      }

      default:
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[stripe-webhook] Erro:', err);
    return new Response(JSON.stringify({ error: 'Erro interno.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
