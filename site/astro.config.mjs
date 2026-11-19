import sitemap from '@astrojs/sitemap';
import vue from '@astrojs/vue';
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

// O endereço final do site (com https://, sem barra no fim) vem da variável SITE_URL, em
// `site/.env` ou no Cloudflare Pages. Ele vira o endereço canônico, o Open Graph, o
// sitemap.xml e o robots.txt. Sem a variável o build funciona, mas com endereços de
// teste: por isso o aviso abaixo.
// TODO(paroquia): definir SITE_URL quando o domínio .org.br for registrado (Fase 8).
const { SITE_URL } = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
const site = (process.env.SITE_URL ?? SITE_URL ?? '').trim().replace(/\/+$/, '');

if (!site && process.argv.includes('build')) {
  console.warn(
    '\n[seo] SITE_URL não definida: sitemap, canonical e Open Graph usam http://localhost:4321.\n' +
      '      Defina SITE_URL com o endereço final do site antes de publicar.\n',
  );
}

// Estas duas mudam todo dia de conteúdo: ficam fora do sitemap (a página /liturgia vale por elas).
const FORA_DO_SITEMAP = ['/liturgia/ontem/', '/liturgia/amanha/'];

// Saída 100% estática (Cloudflare Pages). Vue só em ilhas interativas.
export default defineConfig({
  site: site || 'http://localhost:4321',
  output: 'static',
  // O CSS vai dentro de cada página: quem chega do Instagram ou do WhatsApp quase sempre é a
  // primeira visita, e uma requisição a menos adianta a primeira tela.
  build: { inlineStylesheets: 'always' },
  integrations: [
    vue(),
    sitemap({
      filter: (pagina) => !FORA_DO_SITEMAP.some((fora) => pagina.endsWith(fora)),
    }),
  ],
});
