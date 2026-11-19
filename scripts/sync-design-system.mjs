// Copia o design system (fonte da verdade, em /design-system) para o site.
// Roda sozinho antes de `dev` e `build`. Não edite os arquivos gerados em
// site/src/styles/, site/src/assets/ nem em site/public/: altere o design system e rode de novo.

import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const designSystem = resolve(raiz, 'design-system');
const estilos = resolve(raiz, 'site/src/styles');
const publico = resolve(raiz, 'site/public');
const imagens = resolve(raiz, 'site/src/assets');

const aviso = (origem) =>
  `/* Cópia gerada de ${origem} por scripts/sync-design-system.mjs. Não editar aqui. */\n`;

/**
 * Grava só se o conteúdo mudou, e por troca de arquivo (grava ao lado e renomeia).
 * Regravar o mesmo arquivo o esvazia por um instante: com o `astro dev` aberto, o servidor lia o
 * logo vazio, não achava a imagem (ImageNotFound) e a página inicial dava erro 500 até reiniciar.
 * Assim, rodar `build` ou `dev` sem mudar o design system não toca em nada.
 */
const atualizados = [];
async function gravarSeMudou(caminho, conteudo) {
  const novo = Buffer.isBuffer(conteudo) ? conteudo : Buffer.from(conteudo);
  try {
    if ((await readFile(caminho)).equals(novo)) return;
  } catch {
    // ainda não existe: grava
  }
  const temporario = `${caminho}.novo`;
  await writeFile(temporario, novo);
  await rename(temporario, caminho);
  atualizados.push(caminho.slice(raiz.length + 1));
}

await mkdir(estilos, { recursive: true });
await mkdir(publico, { recursive: true });
await mkdir(imagens, { recursive: true });

// 1) tokens.css: cópia fiel.
const tokens = await readFile(resolve(designSystem, 'tokens.css'), 'utf8');
await gravarSeMudou(resolve(estilos, 'tokens.css'), tokens);

// 2) bundle.css: cópia sem o @import do Google Fonts. As fontes são carregadas
//    pelo BaseLayout (<link> com preconnect), que não bloqueia a renderização.
const bundle = await readFile(resolve(designSystem, 'components/bundle.css'), 'utf8');
const bundleSemFontes = bundle
  .split('\n')
  .filter((linha) => !linha.trimStart().startsWith('@import'))
  .join('\n');
await gravarSeMudou(
  resolve(estilos, 'bundle.css'),
  aviso('design-system/components/bundle.css') + bundleSemFontes,
);

// 3) Logo e ícones, gerados a partir do logo transparente (nunca recolorir).
const logo = resolve(designSystem, 'assets/Logos/logo-fachada-transparente.png');
const fundo = tokens.match(/--fundo:\s*(#[0-9a-fA-F]{6})/)?.[1];
if (!fundo) throw new Error('Token --fundo não encontrado em design-system/tokens.css');

const transparente = { r: 0, g: 0, b: 0, alpha: 0 };
const bufferLogo = await readFile(logo);

// O logo fica em src/assets: o `<Image>` do astro:assets gera as versões WebP nos tamanhos usados.
await gravarSeMudou(resolve(imagens, 'logo-fachada-transparente.png'), bufferLogo);

// favicon: logo transparente em 64px
await gravarSeMudou(
  resolve(publico, 'favicon.png'),
  await sharp(bufferLogo)
    .resize(64, 64, { fit: 'contain', background: transparente })
    .png()
    .toBuffer(),
);

// ícone do iOS não aceita transparência: logo sobre o fundo creme da página
await gravarSeMudou(
  resolve(publico, 'apple-touch-icon.png'),
  await sharp(bufferLogo)
    .resize(132, 132, { fit: 'contain', background: transparente })
    .extend({ top: 24, bottom: 24, left: 24, right: 24, background: fundo })
    .png()
    .toBuffer(),
);

console.log(
  atualizados.length > 0
    ? `design-system sincronizado: ${atualizados.join(', ')} atualizado(s).`
    : 'design-system sincronizado: nada mudou.',
);
