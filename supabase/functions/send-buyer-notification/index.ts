/**
 * send-buyer-notification — Supabase Edge Function
 *
 * Envia notificação (push + in-app) para todos os compradores de um evento.
 * Usado pelo admin para comunicação direta com o público.
 *
 * POST /functions/v1/send-buyer-notification
 * Headers: Authorization: Bearer <jwt>
 * Body: { eventoId: string; title: string; message: string }
 *
 * Variáveis de ambiente:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
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

function corsHeaders(req: Request) {
  return {
    'Access-Control-Allow-Origin': getCorsOrigin(req),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

/** Timestamp BRT -03:00 */
const nowBRT = () =>
  new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(req) });
  }

  try {
    // Autenticar chamador
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authErr } = await supabaseAuth.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: 'Não autorizado.' }), {
        status: 401, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    // Verificar se é admin (masteradm, gerente ou sócio)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const allowedRoles = ['vanta_masteradm', 'vanta_gerente', 'vanta_socio'];
    if (!profile || !allowedRoles.includes(profile.role)) {
      return new Response(JSON.stringify({ error: 'Sem permissão.' }), {
        status: 403, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    // Parsear body
    const { eventoId, title, message } = await req.json() as {
      eventoId: string;
      title: string;
      message: string;
    };

    if (!eventoId || !title?.trim() || !message?.trim()) {
      return new Response(JSON.stringify({ error: 'eventoId, title e message são obrigatórios.' }), {
        status: 400, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    // Buscar compradores únicos do evento
    const { data: tickets } = await supabase
      .from('tickets_caixa')
      .select('owner_id')
      .eq('evento_id', eventoId)
      .in('status', ['DISPONIVEL', 'USADO'])
      .not('owner_id', 'is', null);

    if (!tickets?.length) {
      return new Response(JSON.stringify({ ok: true, sent: 0, reason: 'Nenhum comprador encontrado.' }), {
        status: 200, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    const uniqueUserIds = [...new Set(tickets.map(t => t.owner_id!))];

    // Buscar nome do evento
    const { data: evento } = await supabase
      .from('eventos_admin')
      .select('nome')
      .eq('id', eventoId)
      .maybeSingle();

    const eventoNome = evento?.nome ?? 'Evento';

    // Inserir notificações in-app
    const notifs = uniqueUserIds.map(uid => ({
      user_id: uid,
      tipo: 'COMUNICACAO_EVENTO',
      titulo: title,
      mensagem: message,
      lida: false,
      link: `/evento/${eventoId}`,
    }));

    const { error: insertErr } = await supabase
      .from('notifications')
      .insert(notifs);

    if (insertErr) {
      console.error('[send-buyer-notification] insert notifs error:', insertErr.message);
    }

    // Enviar push via send-push (invocação interna)
    let pushSent = 0;
    try {
      const { data: pushResult } = await supabase.functions.invoke('send-push', {
        body: {
          userIds: uniqueUserIds,
          title,
          body: message,
          data: { type: 'COMUNICACAO_EVENTO', eventoId },
        },
      });
      pushSent = pushResult?.sent ?? 0;
    } catch (pushErr) {
      console.error('[send-buyer-notification] push error:', pushErr);
    }

    console.log('[send-buyer-notification] sent', {
      eventoId,
      buyers: uniqueUserIds.length,
      pushSent,
    });

    return new Response(JSON.stringify({
      ok: true,
      buyers: uniqueUserIds.length,
      notificacoesInApp: uniqueUserIds.length,
      pushEnviados: pushSent,
    }), {
      status: 200, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[send-buyer-notification] error:', err);
    return new Response(JSON.stringify({ error: 'Erro interno.' }), {
      status: 500, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
    });
  }
});
