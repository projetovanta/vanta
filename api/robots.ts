/**
 * Vercel Serverless Function: /api/robots
 *
 * Serve robots.txt para crawlers de busca.
 */

const SITE_URL = 'https://maisvanta.com';

export default function handler(_req: any, res: any) {
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=86400');
  return res.status(200).send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /checkout
Disallow: /parceiro

Sitemap: ${SITE_URL}/sitemap.xml
`);
}
