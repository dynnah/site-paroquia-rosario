// Copia o design system (fonte da verdade, em /design-system) para o site.
// Roda sozinho antes de `dev` e `build`. Não edite os arquivos gerados em
// site/src/styles/ nem em site/public/: altere o design system e rode de novo.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const designSystem = resolve(raiz, 'design-system');
const estilos = resolve(raiz, 'site/src/styles');
const publico = resolve(raiz, 'site/public');

const aviso = (origem) =>
  `/* Cópia gerada de ${origem} por scripts/sync-design-system.mjs. Não editar aqui. */\n`;

await mkdir(estilos, { recursive: true });
await mkdir(publico, { recursive: true });

// 1) tokens.css: cópia fiel.
const tokens = await readFile(resolve(designSystem, 'tokens.css'), 'utf8');
await writeFile(resolve(estilos, 'tokens.css'), tokens);

// 2) bundle.css: cópia sem o @import do Google Fonts. As fontes são carregadas
//    pelo BaseLayout (<link> com preconnect), que não bloqueia a renderização.
const bundle = await readFile(resolve(designSystem, 'components/bundle.css'), 'utf8');
const bundleSemFontes = bundle
  .split('\n')
  .filter((linha) => !linha.trimStart().startsWith('@import'))
  .join('\n');
await writeFile(
  resolve(estilos, 'bundle.css'),
  aviso('design-system/components/bundle.css') + bundleSemFontes,
);

// 3) Logo e ícones, gerados a partir do logo transparente (nunca recolorir).
const logo = resolve(designSystem, 'assets/Logos/logo-fachada-transparente.png');
const fundo = tokens.match(/--fundo:\s*(#[0-9a-fA-F]{6})/)?.[1];
if (!fundo) throw new Error('Token --fundo não encontrado em design-system/tokens.css');

const transparente = { r: 0, g: 0, b: 0, alpha: 0 };
const bufferLogo = await readFile(logo);

await writeFile(resolve(publico, 'logo-fachada-transparente.png'), bufferLogo);

// favicon: logo transparente em 64px
await sharp(bufferLogo)
  .resize(64, 64, { fit: 'contain', background: transparente })
  .png()
  .toFile(resolve(publico, 'favicon.png'));

// ícone do iOS não aceita transparência: logo sobre o fundo creme da página
await sharp(bufferLogo)
  .resize(132, 132, { fit: 'contain', background: transparente })
  .extend({ top: 24, bottom: 24, left: 24, right: 24, background: fundo })
  .png()
  .toFile(resolve(publico, 'apple-touch-icon.png'));

console.log('design-system sincronizado: tokens.css, bundle.css, logo e ícones.');
