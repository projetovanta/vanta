/**
 * send-reembolso-email — Supabase Edge Function
 *
 * Envia e-mail de notificação de reembolso (aprovado/rejeitado) via Resend.
 * Chamada automaticamente quando master aprova/rejeita reembolso manual.
 *
 * POST /functions/v1/send-reembolso-email
 * Body: {
 *   email: string;
 *   nome: string;
 *   eventoNome: string;
 *   valor: number;
 *   status: 'APROVADO' | 'REJEITADO';
 *   motivo?: string;
 * }
 *
 * Variáveis de ambiente (configurar no Dashboard do Supabase):
 *   RESEND_API_KEY  — chave da API do Resend (re_xxxxxxx)
 *   APP_URL         — URL do app (ex: https://vanta.app)
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const APP_URL        = Deno.env.get('APP_URL') ?? 'https://vanta.app';
const SUPABASE_URL   = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

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

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(req) });
  }

  try {
    // ── Auth gate — rejeita requests sem JWT válido ──
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      });
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    const { email, nome, eventoNome, valor, status, motivo } = await req.json() as {
      email: string;
      nome: string;
      eventoNome: string;
      valor: number;
      status: 'APROVADO' | 'REJEITADO';
      motivo?: string;
    };

    if (!email?.trim() || !nome?.trim() || !eventoNome?.trim() || !valor) {
      return new Response(JSON.stringify({ error: 'Parâmetros obrigatórios faltando.' }), {
        status: 400, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    const fmtBRL = (n: number) => new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(n);

    // Sanitizar inputs
    const escapeHtml = (s: string): string =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
       .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    const nomeSafe = escapeHtml(nome.trim());
    const eventoSafe = escapeHtml(eventoNome.trim());
    const motivoSafe = motivo ? escapeHtml(motivo.trim()) : '';
    const isAprovado = status === 'APROVADO';
    const valorFormatado = fmtBRL(valor);

    const assunto = isAprovado
      ? `Seu reembolso foi aprovado — ${eventoSafe}`
      : `Seu reembolso foi rejeitado — ${eventoSafe}`;

    const corBg = isAprovado ? '#10B981' : '#EF4444'; // verde : vermelho
    const corLabel = isAprovado ? '#D1FAE5' : '#FEE2E2'; // verde light : vermelho light
    const corText = isAprovado ? '#059669' : '#DC2626'; // verde dark : vermelho dark
    const statusText = isAprovado ? 'APROVADO' : 'REJEITADO';

    const emailHtml = `
<!DOCTYPE html>
<html lang="pt-BR" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="dark only" />
  <meta name="supported-color-schemes" content="dark only" />
  <style>
    :root { color-scheme: dark only; }
    body, .bg-dark { background-color: #000000 !important; }
    .card-bg { background-color: #0D0D0D !important; }
    .status-bg { background-color: ${isAprovado ? '#064E3B' : '#7F1D1D'} !important; }
    u + .body { background-color: #000000 !important; }
  </style>
</head>
<body class="body bg-dark" style="margin:0;padding:0;background-color:#000000;font-family:-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div class="bg-dark" style="background-color:#000000;width:100%;table-layout:fixed;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#000000" style="background-color:#000000;">
    <tr>
      <td align="center" bgcolor="#000000" style="background-color:#000000;padding:32px 16px;">

        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
          <!-- Barra topo -->
          <tr><td height="3" style="font-size:0;line-height:0;background-color:${corBg};">&nbsp;</td></tr>

          <!-- Card -->
          <tr>
            <td class="card-bg" bgcolor="#0D0D0D" style="background-color:#0D0D0D;padding:44px 36px 36px;">

              <!-- Logo VANTA -->
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-family:Georgia,'Times New Roman',serif;font-weight:900;font-size:14px;letter-spacing:0.35em;color:#FFD300;text-transform:uppercase;padding-bottom:10px;border-bottom:1px solid #2A2200;">
                    VANTA
                  </td>
                </tr>
              </table>

              <!-- Espacamento -->
              <table role="presentation" cellpadding="0" cellspacing="0"><tr><td height="32" style="font-size:0;line-height:0;">&nbsp;</td></tr></table>

              <!-- Saudacao -->
              <p style="margin:0 0 4px;font-size:22px;font-weight:300;color:#FFFFFF;line-height:1.3;">
                ${nomeSafe},
              </p>
              <p style="margin:0;font-size:11px;color:#555555;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;">
                Status do seu reembolso
              </p>

              <!-- Espacamento -->
              <table role="presentation" cellpadding="0" cellspacing="0"><tr><td height="28" style="font-size:0;line-height:0;">&nbsp;</td></tr></table>

              <!-- Card status -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="status-bg" style="background-color:${isAprovado ? '#064E3B' : '#7F1D1D'};padding:24px;border-radius:10px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <p style="margin:0 0 12px;font-size:12px;color:${corLabel};letter-spacing:0.1em;text-transform:uppercase;font-weight:700;">
                            ${isAprovado ? '✓ Reembolso Aprovado' : '✕ Reembolso Rejeitado'}
                          </p>
                          <p style="margin:0 0 20px;font-size:18px;color:${corText};font-weight:600;">
                            ${valorFormatado}
                          </p>
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${isAprovado ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'};padding-top:16px;">
                            <tr>
                              <td style="font-size:12px;color:#999999;line-height:1.6;">
                                <strong style="color:#FFFFFF;">Evento:</strong> ${eventoSafe}<br />
                                <strong style="color:#FFFFFF;">Data:</strong> ${new Date().toLocaleDateString('pt-BR')}<br />
                                ${!isAprovado && motivoSafe ? `<strong style="color:#FFFFFF;">Motivo:</strong> ${motivoSafe}` : ''}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Espacamento -->
              <table role="presentation" cellpadding="0" cellspacing="0"><tr><td height="32" style="font-size:0;line-height:0;">&nbsp;</td></tr></table>

              <!-- Mensagem contextual -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:14px;color:#D4D4D8;line-height:1.7;">
                    ${isAprovado
                      ? '<p style="margin:0;">Seu reembolso foi aprovado! O valor será devolvido à sua conta de origem em até 5 dias úteis.</p>'
                      : '<p style="margin:0;">Infelizmente seu reembolso não foi aprovado. Se você tem dúvidas, entre em contato com o produtor.</p>'
                    }
                  </td>
                </tr>
              </table>

              <!-- Espacamento -->
              <table role="presentation" cellpadding="0" cellspacing="0"><tr><td height="32" style="font-size:0;line-height:0;">&nbsp;</td></tr></table>

              <!-- CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td bgcolor="#FFD300" style="background-color:#FFD300;padding:14px 40px;border-radius:8px;">
                          <a href="${APP_URL}" style="font-size:11px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:#000000;text-decoration:none;display:inline-block;">
                            Abrir carteira
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Espacamento -->
              <table role="presentation" cellpadding="0" cellspacing="0"><tr><td height="32" style="font-size:0;line-height:0;">&nbsp;</td></tr></table>

              <!-- Divisor -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr><td bgcolor="#1A1A1A" height="1" style="font-size:0;line-height:0;background-color:#1A1A1A;">&nbsp;</td></tr>
              </table>

              <!-- Rodape -->
              <p style="margin:20px 0 0;font-size:11px;color:#444444;line-height:1.6;">
                Esta é uma notificação automática do sistema VANTA. Por favor, não responda este e-mail.
              </p>
            </td>
          </tr>

          <!-- Barra fundo -->
          <tr><td height="1" style="font-size:0;line-height:0;background-color:#B8960F;">&nbsp;</td></tr>
        </table>

      </td>
    </tr>
  </table>
  </div>
</body>
</html>`;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:    'VANTA <reembolsos@maisvanta.com>',
        to:      [email.trim()],
        subject: assunto,
        html:    emailHtml,
      }),
    });

    if (!resendRes.ok) {
      const resendError = await resendRes.json();
      console.error('[send-reembolso-email] Resend error:', resendError);
      return new Response(JSON.stringify({ error: 'Falha ao enviar e-mail.' }), {
        status: 502, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    const resendData = await resendRes.json();

    return new Response(JSON.stringify({ ok: true, id: resendData.id }), {
      status: 200, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[send-reembolso-email] Erro:', err);
    return new Response(JSON.stringify({ error: 'Erro interno.' }), {
      status: 500, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
    });
  }
});
