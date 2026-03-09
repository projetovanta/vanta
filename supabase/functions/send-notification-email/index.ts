/**
 * Edge Function: send-notification-email
 * Envia email de notificação genérica via Resend API.
 *
 * Body: {
 *   email: string;
 *   nome: string;
 *   titulo: string;
 *   mensagem: string;
 *   link?: string;
 *   tipo?: string;
 * }
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const RESEND_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  try {
    // ── Auth gate — rejeita requests sem JWT válido ──
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }
    const { email, nome, titulo, mensagem, link, tipo } = await req.json() as {
      email: string;
      nome: string;
      titulo: string;
      mensagem: string;
      link?: string;
      tipo?: string;
    };

    if (!email?.trim() || !nome?.trim() || !titulo?.trim() || !mensagem?.trim()) {
      return new Response(JSON.stringify({ error: 'email, nome, titulo e mensagem são obrigatórios.' }), {
        status: 400,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const nomeSafe = escapeHtml(nome.trim());
    const tituloSafe = escapeHtml(titulo.trim());
    const mensagemSafe = escapeHtml(mensagem.trim()).replace(/\n/g, '<br/>');
    const linkSafe = link ? escapeHtml(link.trim()) : '';
    const tipoSafe = tipo ? escapeHtml(tipo.trim()) : 'notificacao';

    const ctaHtml = linkSafe
      ? `<tr><td style="padding:24px 0 0 0;" align="center">
           <a href="https://maisvanta.com${linkSafe}" style="display:inline-block;background-color:#FFD300;color:#000000;font-weight:700;font-size:14px;padding:12px 32px;border-radius:8px;text-decoration:none;letter-spacing:0.05em;">VER DETALHES</a>
         </td></tr>`
      : '';

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#000000;font-family:-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#0A0A0A;border-radius:16px;overflow:hidden;">
        <!-- Header -->
        <tr><td style="padding:24px 32px;border-bottom:1px solid #1A1A00;">
          <table role="presentation" width="100%"><tr>
            <td style="font-family:Georgia,'Times New Roman',serif;font-weight:900;font-size:14px;letter-spacing:0.35em;color:#FFD300;text-transform:uppercase;">VANTA</td>
          </tr></table>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px;">
          <h2 style="margin:0 0 16px;color:#FFFFFF;font-size:20px;font-weight:700;">${tituloSafe}</h2>
          <p style="margin:0 0 8px;color:#A3A3A3;font-size:13px;">Olá, <strong style="color:#FFFFFF;">${nomeSafe}</strong></p>
          <p style="margin:0;color:#D4D4D4;font-size:14px;line-height:1.6;">${mensagemSafe}</p>
          ${ctaHtml}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:16px 32px;border-top:1px solid #1A1A00;">
          <p style="margin:0;color:#525252;font-size:11px;text-align:center;">
            Esta é uma notificação automática do sistema VANTA. Por favor, não responda este e-mail.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const assunto = `${tituloSafe} — VANTA`;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'VANTA <notificacoes@maisvanta.com>',
        to: [email.trim()],
        subject: assunto,
        html,
      }),
    });

    if (!resendRes.ok) {
      const resendError = await resendRes.json();
      console.error('[send-notification-email] Resend error:', resendError);
      return new Response(JSON.stringify({ error: 'Falha ao enviar email.', detail: resendError }), {
        status: 502,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const resendData = await resendRes.json();

    return new Response(JSON.stringify({ ok: true, id: resendData.id }), {
      status: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[send-notification-email] Error:', err);
    return new Response(JSON.stringify({ error: 'Erro interno.' }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
