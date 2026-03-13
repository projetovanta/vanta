/**
 * create-ticket-checkout — Supabase Edge Function
 *
 * Cria sessão Stripe Checkout para compra de ingressos.
 * Valida preços server-side, cria pedido pendente, retorna URL do Stripe.
 *
 * POST /functions/v1/create-ticket-checkout
 * Body: {
 *   evento_id: string;
 *   lote_id: string;
 *   itens: { variacao_id: string; quantidade: number }[];
 *   cupom_codigo?: string;
 *   mesa_id?: string;
 *   acompanhantes?: Record<number, string>;
 *   ref_code?: string;
 * }
 * Response: { url: string; pedido_id: string } | { error: string }
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
const SITE_URL = 'https://maisvanta.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ── 1. Autenticação ──
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return jsonResponse({ error: 'Não autorizado.' }, 401);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) return jsonResponse({ error: 'Token inválido.' }, 401);

    // ── 2. Verificar Stripe ──
    if (!STRIPE_SECRET_KEY) {
      return jsonResponse({
        error: 'Pagamento online não está disponível no momento. Tente novamente mais tarde.',
      }, 503);
    }

    // ── 3. Parsear body ──
    const body = await req.json() as {
      evento_id: string;
      lote_id: string;
      itens: { variacao_id: string; quantidade: number }[];
      cupom_codigo?: string;
      mesa_id?: string;
      acompanhantes?: Record<number, string>;
      ref_code?: string;
    };

    const { evento_id, lote_id, itens, cupom_codigo, mesa_id, acompanhantes, ref_code } = body;

    if (!evento_id || !lote_id || !itens || itens.length === 0) {
      return jsonResponse({ error: 'Dados da compra incompletos.' }, 400);
    }

    // ── 4. Buscar evento ──
    const { data: evento, error: evtErr } = await supabase
      .from('eventos_admin')
      .select('id, nome, publicado')
      .eq('id', evento_id)
      .eq('publicado', true)
      .maybeSingle();

    if (evtErr || !evento) {
      return jsonResponse({ error: 'Evento não encontrado ou não publicado.' }, 404);
    }

    // ── 5. Buscar variações e validar preços server-side ──
    const variacaoIds = itens.map(i => i.variacao_id);
    const { data: variacoes, error: varErr } = await supabase
      .from('variacoes_ingresso')
      .select('id, area, area_custom, genero, valor, limite, vendidos, lote_id')
      .in('id', variacaoIds)
      .eq('lote_id', lote_id);

    if (varErr || !variacoes || variacoes.length !== variacaoIds.length) {
      return jsonResponse({ error: 'Variação de ingresso não encontrada.' }, 400);
    }

    // Validar vagas disponíveis
    for (const item of itens) {
      const v = variacoes.find((x: Record<string, unknown>) => x.id === item.variacao_id);
      if (!v) return jsonResponse({ error: `Variação ${item.variacao_id} não encontrada.` }, 400);
      const disponivel = (v.limite as number) - (v.vendidos as number);
      if (item.quantidade > disponivel) {
        const area = (v.area as string) === 'OUTRO' ? (v.area_custom as string ?? 'Outro') : v.area as string;
        return jsonResponse({ error: `${area}: apenas ${disponivel} ingresso(s) disponível(is).` }, 400);
      }
    }

    // ── 6. Calcular total server-side ──
    let subtotalCentavos = 0;
    const lineItems: { name: string; amount: number; quantity: number }[] = [];

    for (const item of itens) {
      const v = variacoes.find((x: Record<string, unknown>) => x.id === item.variacao_id)!;
      const valorCentavos = Math.round((v.valor as number) * 100);
      subtotalCentavos += valorCentavos * item.quantidade;

      const area = (v.area as string) === 'OUTRO' ? (v.area_custom as string ?? 'Outro') : v.area as string;
      const genero = (v.genero as string) === 'MASCULINO' ? 'Masc.' : (v.genero as string) === 'FEMININO' ? 'Fem.' : 'Unisex';
      lineItems.push({
        name: `${evento.nome} — ${area} · ${genero}`,
        amount: valorCentavos,
        quantity: item.quantidade,
      });
    }

    // Mesa (se selecionada)
    let mesaValorCentavos = 0;
    if (mesa_id) {
      const { data: mesa } = await supabase
        .from('mesas')
        .select('id, label, valor')
        .eq('id', mesa_id)
        .eq('evento_id', evento_id)
        .maybeSingle();

      if (mesa) {
        mesaValorCentavos = Math.round((mesa.valor as number) * 100);
        subtotalCentavos += mesaValorCentavos;
        lineItems.push({
          name: `Mesa: ${mesa.label}`,
          amount: mesaValorCentavos,
          quantity: 1,
        });
      }
    }

    // Cupom (se fornecido)
    let descontoCentavos = 0;
    let cupomId: string | null = null;
    if (cupom_codigo) {
      const { data: cupom } = await supabase
        .from('cupons')
        .select('id, tipo, valor, percentual, limite_usos, usos, ativo, evento_id')
        .eq('codigo', cupom_codigo.toUpperCase())
        .eq('ativo', true)
        .maybeSingle();

      if (cupom) {
        const cupomEventoId = cupom.evento_id as string | null;
        const limiteUsos = cupom.limite_usos as number | null;
        const usos = cupom.usos as number;
        const valido = (!cupomEventoId || cupomEventoId === evento_id) &&
                       (!limiteUsos || usos < limiteUsos);

        if (valido) {
          cupomId = cupom.id as string;
          if (cupom.tipo === 'PERCENTUAL') {
            descontoCentavos = Math.round(subtotalCentavos * ((cupom.percentual as number) / 100));
          } else {
            descontoCentavos = Math.round((cupom.valor as number) * 100);
          }
          descontoCentavos = Math.min(descontoCentavos, subtotalCentavos);
        }
      }
    }

    const totalCentavos = subtotalCentavos - descontoCentavos;

    if (totalCentavos <= 0) {
      return jsonResponse({ error: 'Total é zero ou negativo. Use o fluxo gratuito.' }, 400);
    }

    // ── 7. Criar pedido pendente ──
    const dadosCompra = {
      itens: itens.map(i => {
        const v = variacoes.find((x: Record<string, unknown>) => x.id === i.variacao_id)!;
        return {
          variacao_id: i.variacao_id,
          quantidade: i.quantidade,
          valor_unit: v.valor as number,
        };
      }),
      cupom_id: cupomId,
      mesa_id: mesa_id ?? null,
      acompanhantes: acompanhantes ?? null,
      ref_code: ref_code ?? null,
      email: user.email ?? '',
    };

    const { data: pedido, error: pedErr } = await supabase
      .from('pedidos_checkout')
      .insert({
        user_id: user.id,
        evento_id,
        lote_id,
        dados_compra: dadosCompra,
        valor_total_centavos: totalCentavos,
        status: 'PENDENTE',
      })
      .select('id')
      .single();

    if (pedErr || !pedido) {
      console.error('[create-ticket-checkout] insert pedido failed:', pedErr?.message);
      return jsonResponse({ error: 'Erro ao criar pedido.' }, 500);
    }

    // ── 8. Criar Stripe Checkout Session ──
    const params = new URLSearchParams();
    params.set('mode', 'payment');
    params.set('currency', 'brl');
    params.set('customer_email', user.email ?? '');
    params.set('success_url', `${SITE_URL}/checkout/sucesso?pedido_id=${pedido.id}`);
    params.set('cancel_url', `${SITE_URL}/checkout/${evento_id}?cancelado=true`);
    params.set('expires_at', String(Math.floor(Date.now() / 1000) + 30 * 60)); // 30 min
    params.set('metadata[type]', 'ingresso');
    params.set('metadata[pedido_id]', pedido.id);
    params.set('metadata[evento_id]', evento_id);
    params.set('metadata[user_id]', user.id);
    params.set('payment_method_types[0]', 'card');

    // Line items
    lineItems.forEach((li, i) => {
      params.set(`line_items[${i}][price_data][currency]`, 'brl');
      params.set(`line_items[${i}][price_data][product_data][name]`, li.name);
      params.set(`line_items[${i}][price_data][unit_amount]`, String(li.amount));
      params.set(`line_items[${i}][quantity]`, String(li.quantity));
    });

    // Desconto como coupon se houver
    if (descontoCentavos > 0) {
      // Criar cupom Stripe temporário
      const couponRes = await fetch('https://api.stripe.com/v1/coupons', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'amount_off': String(descontoCentavos),
          'currency': 'brl',
          'duration': 'once',
          'name': `Cupom ${cupom_codigo}`,
        }),
      });
      const couponData = await couponRes.json();
      if (couponData.id) {
        params.set('discounts[0][coupon]', couponData.id);
      }
    }

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const session = await stripeRes.json();

    if (!stripeRes.ok || !session.url) {
      console.error('[create-ticket-checkout] Stripe error:', session);
      // Limpar pedido
      await supabase.from('pedidos_checkout').delete().eq('id', pedido.id);
      return jsonResponse({ error: 'Erro ao criar sessão de pagamento.' }, 500);
    }

    // Atualizar pedido com session_id
    await supabase
      .from('pedidos_checkout')
      .update({ stripe_session_id: session.id })
      .eq('id', pedido.id);

    console.log('[create-ticket-checkout] session created', {
      pedidoId: pedido.id,
      sessionId: session.id,
      totalCentavos,
      itensCount: itens.length,
    });

    return jsonResponse({ url: session.url, pedido_id: pedido.id });

  } catch (err) {
    console.error('[create-ticket-checkout] Erro:', err);
    return jsonResponse({ error: 'Erro interno.' }, 500);
  }
});
