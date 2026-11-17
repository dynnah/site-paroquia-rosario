import vue from '@astrojs/vue';
import { defineConfig } from 'astro/config';

// Saída 100% estática (Cloudflare Pages). Vue só em ilhas interativas.
// TODO(paroquia): definir `site` (domínio final .org.br) quando o domínio for registrado;
// ele é necessário para o sitemap e o Open Graph (Fase 6).
export default defineConfig({
  output: 'static',
  integrations: [vue()],
});
