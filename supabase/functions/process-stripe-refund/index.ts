/**
 * process-stripe-refund — Supabase Edge Function
 *
 * Processa refund real no Stripe quando um reembolso é aprovado.
 * Regra: automático até R$100, manual acima (notifica admin).
 *
 * POST /functions/v1/process-stripe-refund
 * Body: { reembolso_id: string }
 *
 * Variáveis de ambiente:
 *   STRIPE_SECRET_KEY
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const THRESHOLD_AUTO_REFUND = 10000; // R$100 em centavos

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const tsBR = () =>
  new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { reembolso_id } = await req.json();
    if (!reembolso_id) {
      return jsonResponse({ error: 'reembolso_id obrigatório' }, 400);
    }

    if (!STRIPE_SECRET_KEY) {
      return jsonResponse({ error: 'STRIPE_SECRET_KEY não configurada' }, 500);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Buscar reembolso
    const { data: reembolso, error: reembolsoErr } = await supabase
      .from('reembolsos')
      .select('id, ticket_id, valor, status, stripe_refund_id')
      .eq('id', reembolso_id)
      .single();

    if (reembolsoErr || !reembolso) {
      return jsonResponse({ error: 'Reembolso não encontrado' }, 404);
    }

    if (reembolso.status !== 'APROVADO') {
      return jsonResponse({ error: `Reembolso com status ${reembolso.status}, esperado APROVADO` }, 400);
    }

    // Idempotência: se já tem stripe_refund_id, não reprocessar
    if (reembolso.stripe_refund_id) {
      return jsonResponse({ ok: true, refund_id: reembolso.stripe_refund_id, message: 'Já processado' });
    }

    // 2. Verificar threshold: automático até R$100
    const valorCentavos = Math.round(reembolso.valor * 100);
    if (valorCentavos > THRESHOLD_AUTO_REFUND) {
      // Marcar como pendente de aprovação manual
      await supabase
        .from('reembolsos')
        .update({ refund_automatico: false })
        .eq('id', reembolso_id);

      return jsonResponse({
        ok: false,
        motivo: 'Valor acima de R$100 — requer aprovação manual no Stripe Dashboard',
        valor: reembolso.valor,
      });
    }

    // 3. Buscar payment_intent via ticket → pedido
    const { data: ticket } = await supabase
      .from('tickets_caixa')
      .select('evento_id, owner_id')
      .eq('id', reembolso.ticket_id)
      .single();

    if (!ticket) {
      return jsonResponse({ error: 'Ticket não encontrado' }, 404);
    }

    const { data: pedido } = await supabase
      .from('pedidos_checkout')
      .select('stripe_payment_intent_id')
      .eq('evento_id', ticket.evento_id)
      .eq('user_id', ticket.owner_id)
      .eq('status', 'PAGO')
      .order('paid_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!pedido?.stripe_payment_intent_id) {
      return jsonResponse({ error: 'Payment intent não encontrado — refund manual necessário' }, 404);
    }

    // 4. Criar refund parcial no Stripe (API REST)
    const refundResponse = await fetch('https://api.stripe.com/v1/refunds', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        payment_intent: pedido.stripe_payment_intent_id,
        amount: valorCentavos.toString(),
      }),
    });

    const refundData = await refundResponse.json();

    if (!refundResponse.ok || refundData.error) {
      console.error('[process-stripe-refund] Stripe error:', refundData);
      return jsonResponse({
        error: 'Erro ao processar refund no Stripe',
        stripe_error: refundData.error?.message,
      }, 500);
    }

    // 5. Registrar refund ID no reembolso
    const nowBRT = tsBR();
    await supabase
      .from('reembolsos')
      .update({
        stripe_refund_id: refundData.id,
        processado_em: nowBRT,
        refund_automatico: true,
      })
      .eq('id', reembolso_id);

    console.log('[process-stripe-refund] Refund processado', {
      reembolso_id,
      refund_id: refundData.id,
      valor: reembolso.valor,
    });

    return jsonResponse({
      ok: true,
      refund_id: refundData.id,
      valor: reembolso.valor,
    });

  } catch (err) {
    console.error('[process-stripe-refund] Erro inesperado:', err);
    return jsonResponse({ error: 'Erro interno' }, 500);
  }
});
