/**
 * notif-evento-finalizou — Supabase Edge Function
 *
 * Cron job (a cada 10 min): Detecta eventos que terminaram.
 * Envia alerta para quem não postou ainda (T+0).
 * Agenda deadline T+24h para registrar infração.
 *
 * POST /functions/v1/notif-evento-finalizou
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

    // Query: eventos que terminaram nos últimos 10 min
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60000);

    const { data: eventos } = await supabase
      .from('eventos_admin')
      .select('id, nome, data_fim')
      .gte('data_fim', tenMinutesAgo.toISOString())
      .lte('data_fim', now.toISOString());

    if (!eventos || eventos.length === 0) {
      return new Response(JSON.stringify({ ok: true, avisos_enviados: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let avisosEnviados = 0;
    const FIREBASE_PROJECT_ID = Deno.env.get('FIREBASE_PROJECT_ID') ?? '';
    let accessToken = '';

    if (FIREBASE_PROJECT_ID) {
      accessToken = await getFirebaseAccessToken();
    }

    for (const evento of eventos) {
      const eventoId = (evento as { id: string }).id;
      const eventoNome = (evento as { nome: string }).nome;
      const dataFim = (evento as { data_fim: string }).data_fim;

      // Deadline: T+24h
      const deadline = new Date(new Date(dataFim).getTime() + 24 * 3600000 - 3 * 3600000).toISOString().replace('Z', '-03:00');

      // Buscar reservas: status USADO (compareceu) mas post não verificado
      const { data: comCheckIn } = await supabase
        .from('reservas_mais_vanta')
        .select('id, user_id')
        .eq('evento_id', eventoId)
        .eq('status', 'USADO')
        .eq('post_verificado', false);

      if (comCheckIn && comCheckIn.length > 0) {
        const userIds = [...new Set((comCheckIn as Array<{ user_id: string }>).map(r => r.user_id))];

        // Buscar tokens FCM
        const { data: subs } = await supabase
          .from('push_subscriptions')
          .select('fcm_token, user_id')
          .in('user_id', userIds);

        if (subs && subs.length > 0 && FIREBASE_PROJECT_ID) {
          const titulo = 'Opa! 📸';
          const corpo = `Vimos que você não postou ainda sobre o ${eventoNome}. Sem problema! Você ainda tem 12h pra postar marcando @maisvanta. Queremos compartilhar essa experiência com vocês!`;

          const fcmUrl = `https://fcm.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/messages:send`;

          for (const sub of subs) {
            const fcmToken = (sub as { fcm_token: string }).fcm_token;
            const userId = (sub as { user_id: string }).user_id;

            const res = await fetch(fcmUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                message: {
                  token: fcmToken,
                  notification: { title: titulo, body: corpo, image: '/icon-192.png' },
                  data: { eventoId, tipo: 'EVENTO_TERMINOU' },
                },
              }),
            });

            if (res.ok) avisosEnviados++;
          }

          // Log
          try {
            await supabase.from('notificacoes_posevento').insert({
              evento_id: eventoId,
              tipo: 'EVENTO_TERMINOU',
              membro_id: userIds[0],
              status: 'ENVIADA',
              canal: 'PUSH',
              corpo_mensagem: corpo,
            });
          } catch (_e) {
            // ignorar
          }
        }

        // UPDATE reservas: set post_deadline_em (agenda lembrete T+12h e infração T+24h)
        for (const reserva of comCheckIn) {
          await supabase
            .from('reservas_mais_vanta')
            .update({ post_deadline_em: deadline })
            .eq('id', (reserva as { id: string }).id);
        }
      }
    }

    return new Response(JSON.stringify({ ok: true, avisos_enviados: avisosEnviados }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[notif-evento-finalizou] Erro:', err);
    return new Response(JSON.stringify({ error: 'Erro interno.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
