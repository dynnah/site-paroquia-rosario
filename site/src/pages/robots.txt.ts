import type { APIRoute } from 'astro';

/**
 * robots.txt: tudo liberado, com o endereço do sitemap. O sitemap vem do
 * `@astrojs/sitemap` (`sitemap-index.xml`); precisa de `SITE_URL` para ter endereço absoluto.
 */
export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('sitemap-index.xml', site).href;
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
