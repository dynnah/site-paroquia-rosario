import type { APIRoute } from 'astro';
import { bloquearBuscadores, textoRobots } from '../lib/seo';

/**
 * robots.txt: tudo liberado, com o endereço do sitemap. O sitemap vem do
 * `@astrojs/sitemap` (`sitemap-index.xml`); precisa de `SITE_URL` para ter endereço absoluto.
 * Com `BLOQUEAR_BUSCADORES=true` (site em teste) nada é liberado e não há sitemap.
 */
export const GET: APIRoute = ({ site }) => {
  const bloquear = bloquearBuscadores(import.meta.env.BLOQUEAR_BUSCADORES);
  return new Response(textoRobots(site, bloquear), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
