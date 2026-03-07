/**
 * notif-evento-iniciou — Supabase Edge Function
 *
 * Cron job (a cada 5 min): Detecta eventos que começaram e envia notificação.
 * POST /functions/v1/notif-evento-iniciou
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

    // Query: eventos que começaram nos últimos 5 min
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);

    const { data: eventos } = await supabase
      .from('eventos_admin')
      .select('id, nome, data_inicio')
      .gte('data_inicio', fiveMinutesAgo.toISOString())
      .lte('data_inicio', now.toISOString());

    if (!eventos || eventos.length === 0) {
      return new Response(JSON.stringify({ ok: true, enviadas: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let totalEnviadas = 0;

    for (const evento of eventos) {
      const eventoId = (evento as { id: string }).id;
      const eventoNome = (evento as { nome: string }).nome;

      // Buscar todas as reservas MAIS VANTA deste evento
      const { data: reservas } = await supabase
        .from('reservas_mais_vanta')
        .select('user_id, id')
        .eq('evento_id', eventoId);

      if (!reservas || reservas.length === 0) continue;

      const userIds = [...new Set((reservas as Array<{ user_id: string }>).map(r => r.user_id))];

      // Buscar tokens FCM
      const { data: subs } = await supabase
        .from('push_subscriptions')
        .select('fcm_token')
        .in('user_id', userIds);

      if (!subs || subs.length === 0) continue;

      // Template
      const titulo = 'Tá rolando! 🎉';
      const corpo = `${eventoNome} começou agora! Não esqueça de postar marcando @maisvanta. Pode ser agora, depois... mas marca a gente! 🎊`;

      // Enviar via Firebase
      const FIREBASE_PROJECT_ID = Deno.env.get('FIREBASE_PROJECT_ID') ?? '';
      if (FIREBASE_PROJECT_ID) {
        const accessToken = await getFirebaseAccessToken();
        const fcmUrl = `https://fcm.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/messages:send`;

        for (const sub of subs) {
          const fcmToken = (sub as { fcm_token: string }).fcm_token;
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
                data: { eventoId, tipo: 'EVENTO_INICIOU' },
              },
            }),
          });

          if (res.ok) totalEnviadas++;
        }
      }

      // Log
      try {
        await supabase.from('notificacoes_posevento').insert({
          evento_id: eventoId,
          tipo: 'EVENTO_INICIOU',
          membro_id: userIds[0], // placeholder (deveria ser batch)
          status: 'ENVIADA',
          canal: 'PUSH',
          corpo_mensagem: corpo,
        });
      } catch (_e) {
        // ignorar
      }
    }

    return new Response(JSON.stringify({ ok: true, enviadas: totalEnviadas }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[notif-evento-iniciou] Erro:', err);
    return new Response(JSON.stringify({ error: 'Erro interno.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
