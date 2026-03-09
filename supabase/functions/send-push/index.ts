/**
 * send-push — Supabase Edge Function
 *
 * Envia push notifications via Firebase Cloud Messaging (HTTP v1 API).
 * Chamada pelo backend (notificações automáticas) ou por admin autenticado.
 *
 * POST /functions/v1/send-push
 * Body: { userIds: string[]; title: string; body: string; data?: Record<string, string> }
 *
 * Variáveis de ambiente (configurar no Dashboard do Supabase):
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_CLIENT_EMAIL
 *   FIREBASE_PRIVATE_KEY
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const FIREBASE_PROJECT_ID = Deno.env.get('FIREBASE_PROJECT_ID') ?? '';
const FIREBASE_CLIENT_EMAIL = Deno.env.get('FIREBASE_CLIENT_EMAIL') ?? '';
const FIREBASE_PRIVATE_KEY = (Deno.env.get('FIREBASE_PRIVATE_KEY') ?? '').replace(/\\n/g, '\n');
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
  };
}

// ── JWT para OAuth2 do Google ────────────────────────────────────────────────

function base64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let str = '';
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(new TextEncoder().encode(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
  const payload = base64url(new TextEncoder().encode(JSON.stringify({
    iss: FIREBASE_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })));

  const unsigned = `${header}.${payload}`;

  // Import RSA private key
  const pemBody = FIREBASE_PRIVATE_KEY
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');
  const keyBuf = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    'pkcs8', keyBuf, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']
  );

  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned));
  const jwt = `${unsigned}.${base64url(sig)}`;

  // Trocar JWT por access token
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const json = await res.json();
  return json.access_token;
}

// ── Handler ──────────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(req) });
  }

  try {
    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Não autorizado.' }), {
        status: 401, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);

    if (authErr || !user) {
      return new Response(JSON.stringify({ error: 'Token inválido.' }), {
        status: 401, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    // Verificar role — apenas masteradm pode enviar push
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'vanta_masteradm') {
      return new Response(JSON.stringify({ error: 'Acesso restrito a masteradm.' }), {
        status: 403, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    // Parsear body
    const { userIds, title, body, data } = await req.json() as {
      userIds: string[];
      title: string;
      body: string;
      data?: Record<string, string>;
    };

    console.log('[send-push] invoked', { targetCount: userIds?.length ?? 0, title });

    if (!userIds?.length || !title?.trim() || !body?.trim()) {
      return new Response(JSON.stringify({ error: 'userIds, title e body são obrigatórios.' }), {
        status: 400, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
      return new Response(JSON.stringify({ ok: true, sent: 0, reason: 'Firebase não configurado. Apenas in-app.' }), {
        status: 200, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    // Buscar tokens FCM dos destinatários
    const { data: subs, error: subsErr } = await supabase
      .from('push_subscriptions')
      .select('fcm_token')
      .in('user_id', userIds);

    if (subsErr || !subs?.length) {
      return new Response(JSON.stringify({ ok: true, sent: 0, reason: 'Nenhum token FCM registrado.' }), {
        status: 200, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    // Obter access token OAuth2
    const accessToken = await getAccessToken();
    const fcmUrl = `https://fcm.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/messages:send`;

    // Enviar push para cada token
    let sent = 0;
    const tokens = subs.map((s: { fcm_token: string }) => s.fcm_token);

    const deadTokens: string[] = [];

    for (const fcmToken of tokens) {
      const res = await fetch(fcmUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            token: fcmToken,
            notification: { title, body, image: '/icon-192.png' },
            data: data ?? {},
          },
        }),
      });

      if (res.ok) {
        sent++;
      } else {
        try {
          const errBody = await res.json();
          const code = errBody?.error?.details?.[0]?.errorCode ?? errBody?.error?.status ?? '';
          if (code === 'UNREGISTERED' || code === 'NOT_FOUND' || code === 'INVALID_ARGUMENT') {
            deadTokens.push(fcmToken);
          }
        } catch (err) {
          console.error('[send-push] erro ao parsear resposta FCM:', err);
        }
      }
    }

    // Cleanup: remover tokens mortos do banco
    if (deadTokens.length > 0) {
      await supabase.from('push_subscriptions').delete().in('fcm_token', deadTokens);
    }

    // Atualizar last_used_at dos tokens que receberam push com sucesso
    const aliveTokens = tokens.filter(t => !deadTokens.includes(t));
    if (aliveTokens.length > 0) {
      await supabase.from('push_subscriptions').update({ last_used_at: new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00' }).in('fcm_token', aliveTokens);
    }

    const failed = tokens.length - sent - deadTokens.length;
    console.log('[send-push] results', { sent, failed, deadTokens: deadTokens.length, total: tokens.length });

    return new Response(JSON.stringify({ ok: true, sent, total: tokens.length, cleaned: deadTokens.length }), {
      status: 200, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[send-push] Erro:', err);
    return new Response(JSON.stringify({ error: 'Erro interno.' }), {
      status: 500, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
    });
  }
});
