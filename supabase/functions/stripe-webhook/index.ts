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

const tsBR = () => new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00';

function getCorsOrigin(req: Request): string {
  const origin = req.headers.get('origin') ?? '';
  if (origin === 'http://localhost:5173' || origin === 'http://localhost:5174') return origin;
  return 'https://maisvanta.com';
}
let corsHeaders = { 'Access-Control-Allow-Origin': 'https://maisvanta.com', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature' };

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
  corsHeaders = { 'Access-Control-Allow-Origin': getCorsOrigin(req), 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature' };
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
        const metaType = session.metadata?.type;

        // ── Ingresso (compra de tickets) ──
        if (metaType === 'ingresso') {
          const pedidoId = session.metadata?.pedido_id;
          if (!pedidoId) {
            console.error('[stripe-webhook] ingresso: pedido_id ausente no metadata');
            break;
          }

          // Buscar pedido
          // Buscar pedido — aceita PENDENTE (primeira tentativa) ou FALHA_PROCESSAMENTO (retry do Stripe)
          const { data: pedido, error: pedidoErr } = await supabase
            .from('pedidos_checkout')
            .select('*')
            .eq('id', pedidoId)
            .in('status', ['PENDENTE', 'FALHA_PROCESSAMENTO'])
            .maybeSingle();

          if (pedidoErr || !pedido) {
            console.error('[stripe-webhook] ingresso: pedido não encontrado ou já processado', { pedidoId, err: pedidoErr?.message });
            break;
          }

          const dadosCompra = pedido.dados_compra as { itens?: { variacao_id: string; quantidade: number; valor_unit: number }[]; cupom_id?: string; mesa_id?: string; ref_code?: string };
          const itens = dadosCompra?.itens ?? [];
          let allOk = true;

          for (const item of itens) {
            const { data: result, error: rpcErr } = await supabase.rpc('processar_compra_checkout', {
              p_evento_id: pedido.evento_id,
              p_lote_id: pedido.lote_id,
              p_variacao_id: item.variacao_id,
              p_email: pedido.email ?? session.customer_email ?? '',
              p_valor_unit: item.valor_unit,
              p_quantidade: item.quantidade,
              p_comprador_id: pedido.user_id,
              p_ref_code: dadosCompra?.ref_code ?? null,
            });

            if (rpcErr) {
              console.error('[stripe-webhook] ingresso: RPC erro', { item, err: rpcErr.message });
              allOk = false;
            } else if (result && !result.ok) {
              console.error('[stripe-webhook] ingresso: RPC negou', { item, result });
              allOk = false;
            } else {
              console.log('[stripe-webhook] ingresso: ticket(s) criado(s)', { variacao: item.variacao_id, qty: item.quantidade });
            }
          }

          // Atualizar pedido — FIX C2: FALHA_PROCESSAMENTO quando RPC falha (retry do Stripe vai retentar)
          const nowBRT = tsBR();
          const { error: updErr } = await supabase
            .from('pedidos_checkout')
            .update({
              status: allOk ? 'PAGO' : 'FALHA_PROCESSAMENTO',
              paid_at: allOk ? nowBRT : null,
              stripe_session_id: session.id,
              stripe_payment_intent_id: session.payment_intent,
            })
            .eq('id', pedidoId);

          if (updErr) console.error('[stripe-webhook] ingresso: update pedido erro', updErr.message);

          // FIX A30: Decrementar usos do cupom (só quando tickets foram criados com sucesso)
          if (allOk && dadosCompra?.cupom_id) {
            const { error: cupomErr } = await supabase.rpc('incrementar_usos_cupom', {
              cupom_id: dadosCompra.cupom_id,
            });
            if (cupomErr) {
              console.error('[stripe-webhook] cupom: erro ao incrementar usos', {
                cupom_id: dadosCompra.cupom_id,
                err: cupomErr.message,
              });
            }
          }

          // Notificar comprador (in-app + push + email)
          if (allOk && pedido.user_id) {
            const totalQty = itens.reduce((s: number, i: { quantidade: number }) => s + i.quantidade, 0);
            const { data: evt } = await supabase
              .from('eventos_admin')
              .select('nome')
              .eq('id', pedido.evento_id)
              .maybeSingle();
            const eventoNome = (evt?.nome as string) ?? 'evento';

            // In-app notification
            await supabase.from('notifications').insert({
              user_id: pedido.user_id,
              tipo: 'COMPRA_CONFIRMADA',
              titulo: 'Compra confirmada!',
              mensagem: `${totalQty} ingresso(s) para ${eventoNome}. Confira na sua carteira.`,
              link: 'WALLET',
            });

            // Push (fire-and-forget)
            fetch(`${SUPABASE_URL}/functions/v1/send-push`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                user_id: pedido.user_id,
                title: 'Compra confirmada!',
                body: `${totalQty} ingresso(s) para ${eventoNome}. Confira na sua carteira.`,
                data: { link: 'WALLET' },
              }),
            }).catch(e => console.warn('[stripe-webhook] push error', e));

            // Email (fire-and-forget)
            fetch(`${SUPABASE_URL}/functions/v1/send-notification-email`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                user_id: pedido.user_id,
                subject: 'Compra confirmada!',
                body: `Seus ${totalQty} ingresso(s) para "${eventoNome}" estão disponíveis na sua carteira VANTA.`,
              }),
            }).catch(e => console.warn('[stripe-webhook] email error', e));
          }

          console.log('[stripe-webhook] ingresso processado', { pedidoId, itens: itens.length, allOk });
          break;
        }

        // ── Assinatura MAIS VANTA ──
        const comunidadeId = session.metadata?.comunidade_id;
        const plano = session.metadata?.plano;
        if (comunidadeId) {
          const now = tsBR();
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
              fim: tsBR(),
            })
            .eq('comunidade_id', comunidadeId);
          if (errCancel) console.error('[stripe-webhook] subscription.deleted update:', errCancel.message);
          console.log('[stripe-webhook] subscription.deleted processed', { comunidadeId });
        }
        break;
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object;
        const paymentIntent = dispute.payment_intent as string | undefined;
        const reason = (dispute.reason as string) ?? 'unknown';
        const disputeId = dispute.id as string;

        if (paymentIntent) {
          // Buscar pedido pelo payment_intent
          const { data: pedido } = await supabase
            .from('pedidos_checkout')
            .select('id, evento_id, user_id')
            .eq('stripe_payment_intent_id', paymentIntent)
            .maybeSingle();

          if (pedido) {
            // Buscar tickets do comprador nesse evento
            const { data: tickets } = await supabase
              .from('tickets_caixa')
              .select('id, evento_id, valor')
              .eq('evento_id', pedido.evento_id)
              .eq('owner_id', pedido.user_id)
              .in('status', ['DISPONIVEL', 'USADO']);

            for (const ticket of tickets ?? []) {
              await supabase.from('chargebacks').insert({
                ticket_id: ticket.id,
                evento_id: ticket.evento_id,
                valor: ticket.valor ?? 0,
                motivo: reason,
                gateway_ref: disputeId,
                status: 'ABERTO',
              });

              await supabase
                .from('tickets_caixa')
                .update({ status: 'CANCELADO' })
                .eq('id', ticket.id);
            }
            console.log('[stripe-webhook] charge.dispute.created processed', { disputeId, pedidoId: pedido.id, tickets: (tickets ?? []).length });
          } else {
            console.warn('[stripe-webhook] charge.dispute: pedido não encontrado', { paymentIntent });
          }
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
