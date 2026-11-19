/**
 * Gera `site/public/og-padrao.png`, a imagem que aparece quando um link do site é colado
 * no WhatsApp, no Instagram ou no Facebook (1200 × 630): o logo da fachada, sem recolorir,
 * sobre o fundo creme do design system.
 *
 * Só precisa rodar de novo se o logo ou o tom de fundo mudarem:
 *   node scripts/gerar-og.mjs
 *
 * Quando a paróquia mandar uma foto boa da fachada, ela pode substituir este arquivo
 * (mesmo nome, 1200 × 630).
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tokens = readFileSync(resolve(raiz, 'design-system/tokens.css'), 'utf8');
const fundo = /--fundo:\s*(#[0-9a-f]{6})/i.exec(tokens)?.[1];
if (!fundo) throw new Error('Não achei --fundo em design-system/tokens.css');

const LARGURA = 1200;
const ALTURA = 630;
const TAMANHO_LOGO = 440;

const logo = await sharp(resolve(raiz, 'design-system/assets/Logos/logo-fachada-transparente.png'))
  .resize(TAMANHO_LOGO, TAMANHO_LOGO)
  .toBuffer();

const destino = resolve(raiz, 'site/public/og-padrao.png');
await sharp({ create: { width: LARGURA, height: ALTURA, channels: 3, background: fundo } })
  .composite([
    {
      input: logo,
      left: Math.round((LARGURA - TAMANHO_LOGO) / 2),
      top: Math.round((ALTURA - TAMANHO_LOGO) / 2),
    },
  ])
  .png({ compressionLevel: 9 })
  .toFile(destino);

console.log(`Gerado: ${destino} (fundo ${fundo})`);
