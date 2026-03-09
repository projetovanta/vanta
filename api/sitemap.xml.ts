/**
 * Vercel Serverless Function: /api/sitemap.xml
 *
 * Gera sitemap XML dinâmico com eventos públicos do Supabase.
 * Mesmo padrão de acesso do api/og.ts (REST API direto, anon key).
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? '';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY ?? '';
const SITE_URL = 'https://maisvanta.com';

export default async function handler(_req: any, res: any) {
  let eventPages: { url: string; lastmod?: string }[] = [];

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/eventos_admin?publicado=eq.true&select=id,slug,updated_at,data_inicio&order=data_inicio.desc&limit=1000`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      },
    );

    if (response.ok) {
      const eventos = (await response.json()) as {
        id: string;
        slug: string | null;
        updated_at: string | null;
        data_inicio: string | null;
      }[];

      eventPages = (eventos ?? []).map(e => ({
        url: e.slug ? `/e/${e.slug}` : `/evento/${e.id}`,
        lastmod: e.updated_at ? e.updated_at.split('T')[0] : undefined,
      }));
    }
  } catch {
    // Retorna sitemap mínimo em caso de erro
  }

  const staticPages = [{ url: '/', changefreq: 'daily', priority: '1.0' }];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
  .map(
    p => `  <url>
    <loc>${SITE_URL}${p.url}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`,
  )
  .join('\n')}
${eventPages
  .map(
    p => `  <url>
    <loc>${SITE_URL}${p.url}</loc>
${p.lastmod ? `    <lastmod>${p.lastmod}</lastmod>` : ''}
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
  return res.status(200).send(xml);
}
