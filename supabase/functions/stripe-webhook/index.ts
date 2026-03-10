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
        const metadataType = session.metadata?.type;

        // ── 4a. Pagamento de INGRESSO ──
        if (metadataType === 'ingresso') {
          const pedidoId = session.metadata?.pedido_id;
          const userId = session.metadata?.user_id;
          if (!pedidoId) {
            console.error('[stripe-webhook] ingresso sem pedido_id');
            break;
          }

          // Idempotência: checar se já processado
          const { data: pedido } = await supabase
            .from('pedidos_checkout')
            .select('id, status, dados_compra, evento_id, lote_id')
            .eq('id', pedidoId)
            .maybeSingle();

          if (!pedido) {
            console.error('[stripe-webhook] pedido não encontrado:', pedidoId);
            break;
          }
          if (pedido.status === 'pago') {
            console.log('[stripe-webhook] pedido já processado (idempotente):', pedidoId);
            break;
          }

          const dados = pedido.dados_compra as {
            itens: { variacao_id: string; quantidade: number; valor_unit: number }[];
            cupom_id?: string;
            email: string;
            ref_code?: string;
          };

          // Processar cada item via RPC
          let allOk = true;
          for (const item of dados.itens) {
            const { data: rpcResult, error: rpcErr } = await supabase.rpc('processar_compra_checkout', {
              p_evento_id: pedido.evento_id,
              p_lote_id: pedido.lote_id,
              p_variacao_id: item.variacao_id,
              p_email: dados.email,
              p_valor_unit: item.valor_unit,
              p_quantidade: item.quantidade,
              p_comprador_id: userId,
              p_ref_code: dados.ref_code || null,
            });

            if (rpcErr) {
              console.error('[stripe-webhook] RPC failed:', { pedidoId, variacaoId: item.variacao_id, error: rpcErr.message });
              allOk = false;
              break;
            }
            const result = rpcResult as { ok: boolean; erro?: string };
            if (!result?.ok) {
              console.error('[stripe-webhook] RPC not ok:', { pedidoId, variacaoId: item.variacao_id, erro: result?.erro });
              allOk = false;
              break;
            }
          }

          // Registrar uso do cupom
          if (allOk && dados.cupom_id) {
            await supabase.rpc('incrementar_usos_cupom', { cupom_id: dados.cupom_id });
          }

          // Atualizar pedido
          const now = new Date(Date.now() - 3 * 3600000).toISOString().replace('Z', '-03:00');
          await supabase
            .from('pedidos_checkout')
            .update({
              status: allOk ? 'pago' : 'cancelado',
              paid_at: allOk ? now : null,
              stripe_payment_intent_id: session.payment_intent || null,
            })
            .eq('id', pedidoId);

          // Notificar user (in-app)
          if (allOk && userId) {
            const { data: evtData } = await supabase
              .from('eventos_admin')
              .select('nome')
              .eq('id', pedido.evento_id)
              .maybeSingle();

            const totalItens = dados.itens.reduce((s, i) => s + i.quantidade, 0);
            await supabase.from('notifications').insert({
              user_id: userId,
              tipo: 'COMPRA_CONFIRMADA',
              titulo: 'Compra confirmada!',
              mensagem: `${totalItens} ingresso(s) para ${evtData?.nome ?? 'evento'}. Confira na sua carteira.`,
              link: 'WALLET',
              lida: false,
              timestamp: now,
            });
          }

          console.log('[stripe-webhook] ingresso processed', { pedidoId, allOk });
          break;
        }

        // ── 4b. Assinatura MAIS VANTA (existente) ──
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

      case 'checkout.session.expired': {
        // Expirar pedidos de ingresso quando a session Stripe expira
        const expiredSession = event.data.object;
        if (expiredSession.metadata?.type === 'ingresso' && expiredSession.metadata?.pedido_id) {
          await supabase
            .from('pedidos_checkout')
            .update({ status: 'expirado' })
            .eq('id', expiredSession.metadata.pedido_id)
            .eq('status', 'pendente');
          console.log('[stripe-webhook] session expired, pedido:', expiredSession.metadata.pedido_id);
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
