/**
 * notif-pedir-review — Supabase Edge Function
 *
 * Cron diário (14h BRT = 17:00 UTC): Detecta eventos que terminaram
 * nas últimas 24h e envia pedido de review para quem fez check-in.
 *
 * POST /functions/v1/notif-pedir-review
 * Body: {} (vazio, chamado por cron)
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

async function getFirebaseAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const FIREBASE_CLIENT_EMAIL = Deno.env.get('FIREBASE_CLIENT_EMAIL') ?? '';
  const FIREBASE_PRIVATE_KEY = (Deno.env.get('FIREBASE_PRIVATE_KEY') ?? '').replace(/\\n/g, '\n');

  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const payload = btoa(JSON.stringify({
    iss: FIREBASE_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const pemBody = FIREBASE_PRIVATE_KEY
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');
  const keyBuf = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    'pkcs8', keyBuf, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']
  );

  const unsigned = `${header}.${payload}`;
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const jwt = `${unsigned}.${sigB64}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenJson = await tokenRes.json() as { access_token: string };
  return tokenJson.access_token;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok');
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const now = new Date();

    // Eventos que terminaram entre 12h e 36h atrás (janela para pedir review às 14h BRT)
    const from = new Date(now.getTime() - 36 * 3600000);
    const to = new Date(now.getTime() - 12 * 3600000);

    const { data: eventos, error: errEventos } = await supabase
      .from('eventos_admin')
      .select('id, nome')
      .gte('data_fim', from.toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00')
      .lte('data_fim', to.toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00')
      .eq('publicado', true);
    if (errEventos) console.error('[edge/notif-pedir-review] eventos:', errEventos.message);

    if (!eventos || eventos.length === 0) {
      return new Response(JSON.stringify({ ok: true, reviews_pedidos: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let reviewsPedidos = 0;
    const FIREBASE_PROJECT_ID = Deno.env.get('FIREBASE_PROJECT_ID') ?? '';
    let accessToken = '';

    if (FIREBASE_PROJECT_ID) {
      accessToken = await getFirebaseAccessToken();
    }

    const nowBrt = new Date(now.getTime() - 3 * 3600000).toISOString().replace('Z', '-03:00');

    for (const evento of eventos) {
      const eventoId = (evento as { id: string }).id;
      const eventoNome = (evento as { nome: string }).nome;

      // Verificar se já pediu review para este evento (evitar duplicatas)
      const { data: jaEnviado, error: errJa } = await supabase
        .from('notificacoes_posevento')
        .select('id')
        .eq('evento_id', eventoId)
        .eq('tipo', 'PEDIR_REVIEW')
        .limit(1);
      if (errJa) console.error('[edge/notif-pedir-review] check duplicata:', errJa.message);

      if (jaEnviado && jaEnviado.length > 0) continue;

      // Buscar usuários que fizeram check-in (ingressos com status USADO)
      const { data: tickets, error: errTk } = await supabase
        .from('tickets_caixa')
        .select('user_id')
        .eq('evento_id', eventoId)
        .eq('status', 'USADO');
      if (errTk) console.error('[edge/notif-pedir-review] tickets:', errTk.message);

      // Buscar check-ins de lista também
      const { data: listas, error: errListas } = await supabase
        .from('listas_evento')
        .select('id')
        .eq('evento_id', eventoId);
      if (errListas) console.error('[edge/notif-pedir-review] listas:', errListas.message);

      const listaIds = (listas ?? []).map((l: { id: string }) => l.id);
      let listaUserIds: string[] = [];
      if (listaIds.length > 0) {
        const { data: convidados, error: errConv } = await supabase
          .from('convidados_lista')
          .select('user_id')
          .in('lista_id', listaIds)
          .eq('checked_in', true)
          .not('user_id', 'is', null);
        if (errConv) console.error('[edge/notif-pedir-review] convidados:', errConv.message);
        listaUserIds = (convidados ?? []).map((c: { user_id: string }) => c.user_id);
      }

      // Unificar user IDs
      const ticketUserIds = (tickets ?? []).map((t: { user_id: string }) => t.user_id);
      const allUserIds = [...new Set([...ticketUserIds, ...listaUserIds])];

      if (allUserIds.length === 0) continue;

      // Excluir quem já avaliou
      const { data: jaAvaliou, error: errRev } = await supabase
        .from('reviews_evento')
        .select('user_id')
        .eq('evento_id', eventoId)
        .in('user_id', allUserIds);
      if (errRev) console.error('[edge/notif-pedir-review] reviews:', errRev.message);

      const jaAvalSet = new Set((jaAvaliou ?? []).map((r: { user_id: string }) => r.user_id));
      const userIds = allUserIds.filter(uid => !jaAvalSet.has(uid));

      if (userIds.length === 0) continue;

      // Inserir notificação in-app para cada usuário
      const notifs = userIds.map(uid => ({
        user_id: uid,
        tipo: 'PEDIR_REVIEW',
        titulo: 'Como foi? ⭐',
        mensagem: `Conta pra gente como foi o ${eventoNome}! Sua opinião ajuda outros a escolher.`,
        link: eventoId,
        lida: false,
        criado_em: nowBrt,
      }));

      const { error: errNotifs } = await supabase.from('notifications').insert(notifs);
      if (errNotifs) console.error('[edge/notif-pedir-review] insert notifications:', errNotifs.message);

      // Push FCM
      if (FIREBASE_PROJECT_ID && accessToken) {
        const { data: subs, error: errSubs } = await supabase
          .from('push_subscriptions')
          .select('fcm_token, user_id')
          .in('user_id', userIds);
        if (errSubs) console.error('[edge/notif-pedir-review] push_subscriptions:', errSubs.message);

        if (subs && subs.length > 0) {
          const fcmUrl = `https://fcm.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/messages:send`;
          const titulo = 'Como foi? ⭐';
          const corpo = `Conta pra gente como foi o ${eventoNome}!`;

          for (const sub of subs) {
            const fcmToken = (sub as { fcm_token: string }).fcm_token;
            await fetch(fcmUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                message: {
                  token: fcmToken,
                  notification: { title: titulo, body: corpo },
                  data: { eventoId, tipo: 'PEDIR_REVIEW' },
                },
              }),
            });
          }
        }
      }

      // Log na tabela de pós-evento
      try {
        await supabase.from('notificacoes_posevento').insert({
          evento_id: eventoId,
          tipo: 'PEDIR_REVIEW',
          membro_id: userIds[0],
          status: 'ENVIADA',
          canal: 'PUSH_INAPP',
          corpo_mensagem: `Review pedido para ${userIds.length} usuários`,
        });
      } catch (_e) {
        // ignorar
      }

      reviewsPedidos += userIds.length;
    }

    return new Response(JSON.stringify({ ok: true, reviews_pedidos: reviewsPedidos }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: (err as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
