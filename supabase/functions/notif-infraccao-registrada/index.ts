/**
 * notif-infraccao-registrada — Supabase Edge Function
 *
 * Cron job (1x/dia 03:00 UTC = 00:00 BRT): Registra infrações para posts vencidos.
 * Verifica reservas com T+24h expirado e post ainda não verificado.
 * Chama clubeService.registrarInfracao() e envia notificação contextualizada.
 *
 * POST /functions/v1/notif-infraccao-registrada
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

async function enviarNotificacao(
  supabase: any,
  userId: string,
  titulo: string,
  corpo: string,
  accessToken: string,
  FIREBASE_PROJECT_ID: string
): Promise<boolean> {
  // Buscar token FCM
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('fcm_token')
    .eq('user_id', userId);

  if (!subs || subs.length === 0) return false;

  const fcmToken = (subs[0] as { fcm_token: string }).fcm_token;
  const fcmUrl = `https://fcm.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/messages:send`;

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
        data: { tipo: 'INFRACCAO_REGISTRADA' },
      },
    }),
  });

  return res.ok;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok');
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Query: reservas com deadline expirado, post não verificado, infração ainda não registrada
    const { data: reservasVencidas } = await supabase
      .from('reservas_mais_vanta')
      .select('id, user_id, evento_id')
      .not('post_deadline_em', 'is', null)
      .lte('post_deadline_em', new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00')
      .is('infraction_registered_em', null)
      .eq('post_verificado', false);

    if (!reservasVencidas || reservasVencidas.length === 0) {
      return new Response(JSON.stringify({ ok: true, infraccoes_registradas: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const FIREBASE_PROJECT_ID = Deno.env.get('FIREBASE_PROJECT_ID') ?? '';
    let accessToken = '';
    if (FIREBASE_PROJECT_ID) {
      accessToken = await getFirebaseAccessToken();
    }

    let infraccoesCriadas = 0;

    // Buscar config de infrações
    const { data: configData } = await supabase
      .from('clube_config')
      .select('infracoes_limite, bloqueio1_dias, bloqueio2_dias')
      .limit(1)
      .maybeSingle();

    const config = configData ? {
      limite: (configData as { infracoes_limite: number }).infracoes_limite ?? 3,
      bloqueio1Dias: (configData as { bloqueio1_dias: number }).bloqueio1_dias ?? 30,
      bloqueio2Dias: (configData as { bloqueio2_dias: number }).bloqueio2_dias ?? 60,
    } : {
      limite: 3,
      bloqueio1Dias: 30,
      bloqueio2Dias: 60,
    };

    for (const reserva of reservasVencidas) {
      const userId = (reserva as { user_id: string }).user_id;
      const eventoId = (reserva as { evento_id: string }).evento_id;
      const reservaId = (reserva as { id: string }).id;

      // Buscar evento para nome
      const { data: eventoData } = await supabase
        .from('eventos_admin')
        .select('nome')
        .eq('id', eventoId)
        .maybeSingle();

      const eventoNome = eventoData ? (eventoData as { nome: string }).nome : 'Evento';

      // Buscar total de infrações do usuário
      const { data: infraccoes } = await supabase
        .from('infracoes_mais_vanta')
        .select('id')
        .eq('user_id', userId)
        .eq('tipo', 'NAO_POSTOU');

      const countInfracoes = (infraccoes?.length ?? 0) + 1; // +1 = a que vamos criar

      // Criar infração
      const now = new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00';
      const { data: novaInfracao } = await supabase
        .from('infracoes_mais_vanta')
        .insert({
          user_id: userId,
          tipo: 'NAO_POSTOU',
          criado_por: 'SYSTEM_AUTO_NOTIF',
          evento_id: eventoId,
          evento_nome: eventoNome,
          criado_em: now,
        })
        .select()
        .single();

      if (!novaInfracao) continue;

      infraccoesCriadas++;

      // Determinar ação baseada em contagem
      let acao = 'AVISO';
      let proximaBloqueio = null;

      if (countInfracoes === config.limite) {
        // 3ª infração = bloqueio 1º
        acao = 'BLOQUEIO_1';
        const bloqueioAte = new Date(Date.now() + config.bloqueio1Dias * 24 * 3600000)
          .toISOString().replace('Z', '-03:00');
        proximaBloqueio = bloqueioAte;

        // Atualizar membro
        await supabase
          .from('membros_clube')
          .update({ bloqueio_nivel: 1, bloqueio_ate: bloqueioAte })
          .eq('user_id', userId);
      } else if (countInfracoes === config.limite * 2) {
        // 6ª infração = bloqueio 2º
        acao = 'BLOQUEIO_2';
        const bloqueioAte = new Date(Date.now() + config.bloqueio2Dias * 24 * 3600000)
          .toISOString().replace('Z', '-03:00');
        proximaBloqueio = bloqueioAte;

        await supabase
          .from('membros_clube')
          .update({ bloqueio_nivel: 2, bloqueio_ate: bloqueioAte })
          .eq('user_id', userId);
      } else if (countInfracoes === config.limite * 3) {
        // 9ª infração = ban permanente
        acao = 'BAN_PERMANENTE';

        await supabase
          .from('membros_clube')
          .update({ banido_permanente: true, banido_em: now })
          .eq('user_id', userId);
      }

      // Construir mensagem contextualizada
      let titulo = '';
      let corpo = '';

      if (acao === 'AVISO') {
        titulo = 'Opa! 📝';
        corpo = `Não conseguimos detectar seu post sobre o ${eventoNome}. Tudo bem! Acontece. ` +
                `Apenas pra você saber que registramos como uma falta de confirmação. ` +
                `Se isso se repetir em próximos eventos, pode levar a uma suspensão temporária do benefício. Mas sem pressa agora! 😊`;
      } else if (acao === 'BLOQUEIO_1') {
        const dataBloqueio = proximaBloqueio ? new Date(proximaBloqueio).toLocaleDateString('pt-BR') : '30 dias';
        titulo = 'Você foi bloqueado 🔒';
        corpo = `Você foi suspendido por 30 dias do MAIS VANTA até ${dataBloqueio}. ` +
                `Você poderá participar novamente após essa data. Próxima ausência de post resultará em suspensão estendida (60 dias).`;
      } else if (acao === 'BLOQUEIO_2') {
        const dataBloqueio = proximaBloqueio ? new Date(proximaBloqueio).toLocaleDateString('pt-BR') : '60 dias';
        titulo = 'Suspensão estendida ⚠️';
        corpo = `Sua suspensão foi estendida para 60 dias até ${dataBloqueio}. ` +
                `Próxima ausência de post resultará em suspensão permanente do programa.`;
      } else if (acao === 'BAN_PERMANENTE') {
        titulo = 'Acesso encerrado 🚫';
        corpo = `Sua participação no Clube de Influência (MAIS VANTA) foi encerrada permanentemente. ` +
                `Você não poderá mais acessar eventos e benefícios do programa.`;
      }

      // Enviar notificação
      if (FIREBASE_PROJECT_ID && accessToken) {
        await enviarNotificacao(supabase, userId, titulo, corpo, accessToken, FIREBASE_PROJECT_ID);
      }

      // Marcar como processada
      await supabase
        .from('reservas_mais_vanta')
        .update({ infraction_registered_em: now })
        .eq('id', reservaId);

      // Log
      try {
        await supabase.from('notificacoes_posevento').insert({
          evento_id: eventoId,
          tipo: 'INFRACCAO_REGISTRADA',
          membro_id: userId,
          status: 'ENVIADA',
          canal: 'PUSH',
          corpo_mensagem: corpo,
        });
      } catch (_e) {
        // ignorar
      }
    }

    return new Response(JSON.stringify({ ok: true, infraccoes_registradas: infraccoesCriadas }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[notif-infraccao-registrada] Erro:', err);
    return new Response(JSON.stringify({ error: 'Erro interno.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
