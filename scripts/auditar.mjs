/**
 * Auditoria de acessibilidade do site já construído (`site/dist`), no Chrome.
 *
 * Para cada página e cada largura (360, 768 e 1280 px) confere:
 *  1. axe-core (WCAG 2.0/2.1 A e AA, mais as boas práticas): contraste, nomes de botões e
 *     links, rótulos, landmarks, hierarquia de títulos, `lang`, etc.
 *  2. Rolagem horizontal (a página não pode ser mais larga que a tela).
 *  3. Um único `h1` por página.
 *  4. Alvos de toque (links e botões fora de texto corrido): falha se a altura for menor que
 *     44px ou a largura menor que 24px (WCAG 2.2, critério 2.5.8). Largura entre 24 e 44px
 *     entra como AVISO, que não reprova: é o caso dos links de uma palavra do menu, com 44px
 *     de altura e espaço entre eles.
 *  5. Menu do celular (360 px): abre a gaveta, confere que o foco entra nela, roda o axe com a
 *     gaveta aberta e confere que Esc a fecha e devolve o foco ao botão "Menu".
 *  6. Teclado (só em 1280 px): percorre a página com Tab e confere que todo elemento que
 *     recebe o foco mostra um contorno ou sombra visível.
 *
 * Como usar:
 *   npm run build -w site
 *   npx astro preview --root site --port 4321 &     # serve site/dist
 *   node scripts/auditar.mjs                        # todas as páginas
 *   node scripts/auditar.mjs /liturgia/ /blog/      # só estas
 *
 * Variáveis: BASE (padrão http://localhost:4321), CHROME_PATH (padrão /usr/bin/google-chrome).
 * Sai com código 1 se achar qualquer problema.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(raiz, 'site', 'dist');
const BASE = (process.env.BASE ?? 'http://localhost:4321').replace(/\/$/, '');
const CHROME = process.env.CHROME_PATH ?? '/usr/bin/google-chrome';
const LARGURAS = [360, 768, 1280];
const AXE = readFileSync(join(raiz, 'node_modules', 'axe-core', 'axe.min.js'), 'utf8');
const MAX_TABS = 80;

/** Rotas ("/liturgia/") de todas as páginas .html de site/dist; a 404 vai como /404.html. */
function rotasDoDist(pasta = dist) {
  const rotas = [];
  for (const nome of readdirSync(pasta)) {
    const caminho = join(pasta, nome);
    if (statSync(caminho).isDirectory()) {
      rotas.push(...rotasDoDist(caminho));
    } else if (nome === 'index.html') {
      const rel = relative(dist, pasta).split('\\').join('/');
      rotas.push(rel ? `/${rel}/` : '/');
    } else if (nome === '404.html') {
      rotas.push('/404.html');
    }
  }
  return rotas.sort();
}

const rotas = process.argv.slice(2).length > 0 ? process.argv.slice(2) : rotasDoDist();

/** Roda dentro da página: devolve o que está fora do esperado, sem axe. */
function conferirLayout() {
  const problemas = [];
  const avisos = [];

  if (document.documentElement.scrollWidth > window.innerWidth + 1) {
    problemas.push(
      `rolagem horizontal: página com ${document.documentElement.scrollWidth}px em tela de ${window.innerWidth}px`,
    );
  }

  const h1 = document.querySelectorAll('h1').length;
  if (h1 !== 1) problemas.push(`${h1} elementos h1 (esperado 1)`);

  const descricao = (el) => {
    const texto = (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 40);
    return `<${el.tagName.toLowerCase()}${el.className ? `.${String(el.className).split(' ')[0]}` : ''}> "${texto}"`;
  };

  // Alvos de toque. Link dentro de parágrafo (texto corrido) é isento, como no WCAG 2.2.
  for (const el of document.querySelectorAll(
    'a[href], button, summary, [role="button"], input, select',
  )) {
    const caixa = el.getBoundingClientRect();
    if (caixa.width === 0 || caixa.height === 0) continue; // escondido
    if (getComputedStyle(el).visibility === 'hidden') continue;
    if (el.closest('.pular') && !el.matches(':focus')) continue; // "Pular para o conteúdo" só aparece com o foco
    const emTextoCorrido =
      el.tagName === 'A' &&
      el.closest('p, li > span, .ros-artigo__texto') &&
      getComputedStyle(el).display === 'inline';
    if (emTextoCorrido) continue;
    const medida = `${Math.round(caixa.width)}×${Math.round(caixa.height)}px`;
    if (caixa.height < 44 - 0.5 || caixa.width < 24) {
      problemas.push(`alvo de toque pequeno (${medida}): ${descricao(el)}`);
    } else if (caixa.width < 44 - 0.5) {
      avisos.push(`alvo estreito (${medida}): ${descricao(el)}`);
    }
  }
  return { problemas, avisos };
}

/** Roda dentro da página: o elemento em foco tem contorno ou sombra visível? */
function focoVisivel() {
  const el = document.activeElement;
  if (!el || el === document.body) return null;
  const estilo = getComputedStyle(el);
  const contorno = estilo.outlineStyle !== 'none' && parseFloat(estilo.outlineWidth) > 0;
  const sombra = estilo.boxShadow && estilo.boxShadow !== 'none';
  const texto = (el.textContent ?? el.getAttribute('aria-label') ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 40);
  return { ok: contorno || Boolean(sombra), alvo: `<${el.tagName.toLowerCase()}> "${texto}"` };
}

const navegador = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox'],
});

/** A gaveta do menu no celular: abre, foco dentro, axe com ela aberta, Esc fecha e devolve o foco. */
async function conferirGaveta() {
  const achados = [];
  const pagina = await navegador.newPage();
  await pagina.setCacheEnabled(false);
  await pagina.setViewport({ width: 360, height: 800, deviceScaleFactor: 1 });
  await pagina.goto(`${BASE}/`, { waitUntil: 'networkidle0', timeout: 60000 });

  const botao = await pagina.$('.ros-menu-btn');
  if (!botao) {
    await pagina.close();
    return ['botão "Menu" não encontrado em /'];
  }
  await botao.click();
  const abriu = await pagina
    .waitForSelector('dialog[open]', { timeout: 3000 })
    .then(() => true)
    .catch(() => false);
  if (!abriu) {
    achados.push('a gaveta não abriu ao tocar em "Menu"');
  } else {
    const estado = await pagina.evaluate(() => ({
      focoDentro: Boolean(document.activeElement?.closest('dialog')),
      expandido: document.querySelector('.ros-menu-btn')?.getAttribute('aria-expanded'),
    }));
    if (!estado.focoDentro) achados.push('gaveta aberta, mas o foco ficou fora dela');
    if (estado.expandido !== 'true')
      achados.push('"Menu" sem aria-expanded="true" com a gaveta aberta');

    await pagina.evaluate(AXE);
    const axe = await pagina.evaluate(async () =>
      axe.run(document, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'],
        },
      }),
    );
    for (const v of axe.violations) {
      achados.push(
        `gaveta aberta, axe ${v.id} (${v.impact}): ${v.help} → ${v.nodes[0]?.target.join(' ')}`,
      );
    }

    await pagina.keyboard.press('Escape');
    const fechou = await pagina
      .waitForFunction(() => !document.querySelector('dialog[open]'), { timeout: 3000 })
      .then(() => true)
      .catch(() => false);
    if (!fechou) achados.push('Esc não fechou a gaveta');
    const focoVoltou = await pagina.evaluate(() =>
      document.activeElement?.classList.contains('ros-menu-btn'),
    );
    if (fechou && !focoVoltou)
      achados.push('a gaveta fechou, mas o foco não voltou ao botão "Menu"');
  }
  await pagina.close();
  return achados;
}

let total = 0;
const avisosUnicos = new Set();

try {
  for (const rota of rotas) {
    for (const largura of LARGURAS) {
      const pagina = await navegador.newPage();
      await pagina.setCacheEnabled(false); // sem 304 do servidor de teste
      await pagina.setViewport({ width: largura, height: 800, deviceScaleFactor: 1 });
      const resposta = await pagina.goto(`${BASE}${rota}`, {
        waitUntil: 'networkidle0',
        timeout: 60000,
      });
      const esperado = rota === '/404.html' ? 404 : 200;
      const achados = [];
      if (resposta?.status() !== esperado && !(rota === '/404.html' && resposta?.ok())) {
        achados.push(`resposta HTTP ${resposta?.status()}`);
      }

      await pagina.evaluate(AXE);
      const axe = await pagina.evaluate(async () =>
        axe.run(document, {
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'],
          },
        }),
      );
      for (const v of axe.violations) {
        const alvos = v.nodes
          .slice(0, 3)
          .map((n) => n.target.join(' '))
          .join(' | ');
        achados.push(
          `axe ${v.id} (${v.impact}): ${v.help} → ${alvos}${v.nodes.length > 3 ? ` (+${v.nodes.length - 3})` : ''}`,
        );
      }

      const layout = await pagina.evaluate(conferirLayout);
      achados.push(...layout.problemas);
      for (const aviso of layout.avisos) avisosUnicos.add(`${aviso}`);

      if (largura === 1280) {
        const vistos = new Set();
        for (let i = 0; i < MAX_TABS; i++) {
          await pagina.keyboard.press('Tab');
          const foco = await pagina.evaluate(focoVisivel);
          if (!foco) break;
          if (vistos.has(foco.alvo)) continue;
          vistos.add(foco.alvo);
          if (!foco.ok) achados.push(`foco sem contorno visível: ${foco.alvo}`);
        }
        if (vistos.size === 0) achados.push('o teclado não alcançou nenhum elemento');
      }

      total += achados.length;
      console.log(
        `${achados.length === 0 ? '✔' : '✖'} ${rota} · ${largura}px${achados.length ? ` (${achados.length})` : ''}`,
      );
      for (const a of achados) console.log(`    - ${a}`);
      await pagina.close();
    }
  }
  const achadosGaveta = rotas.includes('/') ? await conferirGaveta() : [];
  total += achadosGaveta.length;
  if (rotas.includes('/')) {
    console.log(`${achadosGaveta.length === 0 ? '✔' : '✖'} menu do celular (gaveta) · 360px`);
    for (const a of achadosGaveta) console.log(`    - ${a}`);
  }
} finally {
  await navegador.close();
}

if (avisosUnicos.size > 0) {
  console.log(`\nAvisos (não reprovam), ${avisosUnicos.size} distintos:`);
  for (const aviso of avisosUnicos) console.log(`  - ${aviso}`);
}

console.log(
  `\n${rotas.length} páginas × ${LARGURAS.length} larguras: ${total === 0 ? 'nenhum problema' : `${total} problema(s)`}.`,
);
process.exit(total === 0 ? 0 : 1);
