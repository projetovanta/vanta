/**
 * Vercel Edge Function: /api/og?slug=...
 *
 * Retorna HTML com OG tags para bots de social media (Facebook, Twitter, WhatsApp, etc.)
 * Usado em conjunto com o vercel.json rewrite para /e/:slug
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? '';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY ?? '';
const SITE_URL = 'https://maisvanta.com';

export default async function handler(req: any, res: any) {
  const slug = req.query.slug as string;
  if (!slug) {
    return res.redirect(302, SITE_URL);
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/eventos_admin?slug=eq.${encodeURIComponent(slug)}&select=nome,descricao,foto,data_inicio,local,cidade&publicado=eq.true&limit=1`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      },
    );

    const data = await response.json();
    const evento = data?.[0];

    if (!evento) {
      return res.redirect(302, `${SITE_URL}/e/${slug}`);
    }

    const title = evento.nome ?? 'Evento VANTA';
    const description = evento.descricao
      ? evento.descricao.substring(0, 200)
      : `${evento.local ?? ''} — ${evento.cidade ?? ''}`;
    const image = evento.foto ?? `${SITE_URL}/og-default.png`;
    const url = `${SITE_URL}/e/${slug}`;

    const dataFormatada = evento.data_inicio
      ? new Date(evento.data_inicio).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })
      : '';

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(image)}" />
  <meta property="og:url" content="${escapeHtml(url)}" />
  <meta property="og:site_name" content="VANTA" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(image)}" />
  ${dataFormatada ? `<meta property="event:start_date" content="${evento.data_inicio}" />` : ''}
  <meta http-equiv="refresh" content="0;url=${escapeHtml(url)}" />
</head>
<body>
  <p>Redirecionando para <a href="${escapeHtml(url)}">${escapeHtml(title)}</a>...</p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).send(html);
  } catch {
    return res.redirect(302, `${SITE_URL}/e/${slug}`);
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
