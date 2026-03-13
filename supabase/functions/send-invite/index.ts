/**
 * send-invite — Supabase Edge Function
 *
 * Envia e-mail de convite VANTA via Resend.
 * Chamada por usuários autenticados (masteradm, produtor, socio).
 *
 * POST /functions/v1/send-invite
 * Body: { nome: string; email: string; masterNome?: string; assunto?: string; mensagem?: string; tipo?: 'broadcast' | 'invite' }
 *
 * Variáveis de ambiente (configurar no Dashboard do Supabase):
 *   RESEND_API_KEY  — chave da API do Resend (re_xxxxxxx)
 *   APP_URL         — URL do app (ex: https://vanta.app)
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const APP_URL        = Deno.env.get('APP_URL') ?? 'https://vanta.app';
const SUPABASE_URL   = Deno.env.get('SUPABASE_URL') ?? '';
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

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(req) });
  }

  try {
    // ── 1. Verificar autenticação e role do solicitante ────────────────────────
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

    // Verifica role do usuário solicitante
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, nome')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile) {
      return new Response(JSON.stringify({ error: 'Acesso restrito.' }), {
        status: 403, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    // Master tem acesso total; demais precisam de cargo RBAC
    if (profile.role !== 'vanta_masteradm') {
      const { data: atribuicao } = await supabase
        .from('atribuicoes_rbac')
        .select('id')
        .eq('user_id', user.id)
        .eq('ativo', true)
        .in('cargo', ['GERENTE', 'SOCIO'])
        .limit(1)
        .maybeSingle();

      if (!atribuicao) {
        return new Response(JSON.stringify({ error: 'Acesso restrito.' }), {
          status: 403, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
        });
      }
    }

    // ── 2. Parsear body ────────────────────────────────────────────────────────
    const { nome, email, masterNome, mensagem, tipo, assunto } = await req.json() as {
      nome: string;
      email: string;
      masterNome?: string;
      mensagem?: string;
      tipo?: 'broadcast' | 'invite';
      assunto?: string;
    };

    if (!nome?.trim() || !email?.trim()) {
      return new Response(JSON.stringify({ error: 'Nome e e-mail são obrigatórios.' }), {
        status: 400, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    // Sanitizar inputs para prevenir XSS no HTML do email
    const escapeHtml = (s: string): string =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
       .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    const nomeSafe = escapeHtml(nome.trim());
    const remetenteSafe = escapeHtml((masterNome ?? profile.nome ?? 'Equipe VANTA').trim());
    const mensagemSafe = mensagem ? escapeHtml(mensagem.trim()) : '';
    const isBroadcast = tipo === 'broadcast';

    if (isBroadcast && !mensagem?.trim()) {
      return new Response(JSON.stringify({ error: 'Mensagem é obrigatória para broadcast.' }), {
        status: 400, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    // ── 3. Montar HTML do email ─────────────────────────────────────────────────
    // Técnica: bgcolor em TODOS os elementos (Gmail ignora CSS background no body/table)
    // Sem gradients CSS (não suportado em email). Cores sólidas + bgcolor atributo.
    const emailHtml = isBroadcast ? `
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
    .msg-bg { background-color: #141414 !important; }
    u + .body { background-color: #000000 !important; }
  </style>
</head>
<body class="body bg-dark" style="margin:0;padding:0;background-color:#000000;font-family:-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div class="bg-dark" style="background-color:#000000;width:100%;table-layout:fixed;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#000000" style="background-color:#000000;">
    <tr>
      <td align="center" bgcolor="#000000" style="background-color:#000000;padding:32px 16px;">

        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
          <!-- Barra dourada topo -->
          <tr><td bgcolor="#FFD300" height="3" style="font-size:0;line-height:0;background-color:#FFD300;">&nbsp;</td></tr>

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
                temos algo para voc&ecirc;
              </p>

              <!-- Espacamento -->
              <table role="presentation" cellpadding="0" cellspacing="0"><tr><td height="28" style="font-size:0;line-height:0;">&nbsp;</td></tr></table>

              <!-- Mensagem -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="3" bgcolor="#FFD300" style="background-color:#FFD300;font-size:0;line-height:0;">&nbsp;</td>
                  <td class="msg-bg" bgcolor="#141414" style="background-color:#141414;padding:20px 24px;">
                    <p style="margin:0;font-size:15px;color:#D4D4D8;line-height:1.75;white-space:pre-line;">${mensagemSafe}</p>
                  </td>
                </tr>
              </table>

              <!-- Espacamento -->
              <table role="presentation" cellpadding="0" cellspacing="0"><tr><td height="32" style="font-size:0;line-height:0;">&nbsp;</td></tr></table>

              <!-- CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td bgcolor="#FFD300" style="background-color:#FFD300;padding:14px 40px;border-radius:8px;">
                    <a href="${APP_URL}" style="font-size:11px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:#000000;text-decoration:none;display:inline-block;">
                      Abrir o app
                    </a>
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
                Enviado por ${remetenteSafe} via VANTA
              </p>
            </td>
          </tr>

          <!-- Barra dourada fundo -->
          <tr><td bgcolor="#B8960F" height="1" style="font-size:0;line-height:0;background-color:#B8960F;">&nbsp;</td></tr>
        </table>

      </td>
    </tr>
  </table>
  </div>
</body>
</html>` : `
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
    .invite-bg { background-color: #141414 !important; }
    u + .body { background-color: #000000 !important; }
  </style>
</head>
<body class="body bg-dark" style="margin:0;padding:0;background-color:#000000;font-family:-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div class="bg-dark" style="background-color:#000000;width:100%;table-layout:fixed;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#000000" style="background-color:#000000;">
    <tr>
      <td align="center" bgcolor="#000000" style="background-color:#000000;padding:32px 16px;">

        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
          <!-- Barra dourada topo -->
          <tr><td bgcolor="#FFD300" height="3" style="font-size:0;line-height:0;background-color:#FFD300;">&nbsp;</td></tr>

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
                voc&ecirc; foi convidado
              </p>

              <!-- Espacamento -->
              <table role="presentation" cellpadding="0" cellspacing="0"><tr><td height="28" style="font-size:0;line-height:0;">&nbsp;</td></tr></table>

              <!-- Card convite -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="invite-bg" bgcolor="#141414" style="background-color:#141414;padding:28px 24px;border-radius:10px;">
                    <p style="margin:0 0 4px;font-size:10px;color:#555555;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;">Convidado por</p>
                    <p style="margin:0 0 14px;font-size:17px;color:#FFFFFF;font-weight:600;">${remetenteSafe}</p>
                    <p style="margin:0;font-size:14px;color:#999999;line-height:1.65;">
                      para fazer parte da <span style="color:#FFD300;font-weight:600;">VANTA</span> &mdash; a plataforma de experi&ecirc;ncias exclusivas.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Espacamento -->
              <table role="presentation" cellpadding="0" cellspacing="0"><tr><td height="32" style="font-size:0;line-height:0;">&nbsp;</td></tr></table>

              <!-- CTA centralizado -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td bgcolor="#FFD300" style="background-color:#FFD300;padding:16px 48px;border-radius:8px;">
                          <a href="${APP_URL}" style="font-size:11px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:#000000;text-decoration:none;display:inline-block;">
                            Criar minha conta
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
                Se voc&ecirc; n&atilde;o esperava este e-mail, pode ignor&aacute;-lo.
              </p>
            </td>
          </tr>

          <!-- Barra dourada fundo -->
          <tr><td bgcolor="#B8960F" height="1" style="font-size:0;line-height:0;background-color:#B8960F;">&nbsp;</td></tr>
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
        from:    'VANTA <convites@maisvanta.com>',
        to:      [email.trim()],
        subject: assunto?.trim() || (isBroadcast ? `Mensagem da VANTA para você` : `${remetenteSafe} te convidou para a VANTA`),
        html:    emailHtml,
      }),
    });

    if (!resendRes.ok) {
      const resendError = await resendRes.json();
      console.error('[send-invite] Resend error:', resendError);
      return new Response(JSON.stringify({ error: 'Falha ao enviar e-mail.' }), {
        status: 502, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    const resendData = await resendRes.json();

    return new Response(JSON.stringify({ ok: true, id: resendData.id }), {
      status: 200, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[send-invite] Erro:', err);
    return new Response(JSON.stringify({ error: 'Erro interno.' }), {
      status: 500, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
    });
  }
});
