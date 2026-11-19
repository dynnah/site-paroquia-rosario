/**
 * Santos do dia.
 *
 * Fonte: feed público do Evangelizo.org (`feed.evangelizo.org/v2/reader.php`), que a
 * própria documentação do feed diz servir para "exibir a leitura diária, o santo do
 * dia etc." em outros sites. A escolha e as ressalvas estão em `docs/liturgia.md`.
 * O site só lê o feed no build (nunca no navegador do fiel).
 *
 * O feed devolve os santos do dia em ordem de importância ("S. Roque Gonzales e
 * comp., mártires, +1628"), alguns com link para uma biografia. O primeiro santo
 * vira o card "Santo do dia"; os demais entram em "Também hoje". Santo cadastrado
 * no Studio (Sanity) tem prioridade sobre este feed (ver `LiturgiaPagina.astro`).
 *
 * Se o feed falhar, `buscarSantos` devolve `null` e a página simplesmente não mostra
 * o card. O build nunca quebra por causa dele.
 */

export const EVANGELIZO = { rotulo: 'Evangelizo.org', href: 'https://evangelizo.org' } as const;

const FEED = 'https://feed.evangelizo.org/v2/reader.php';
const PAGINA_SANTO = 'https://feed.evangelizo.org/v2/display_saint.php';

// ── Tipos ────────────────────────────────────────────────────────────────────────

export interface SantoDoFeed {
  /** "São Roque Gonzales e companheiros" */
  nome: string;
  /** "mártires", "bispo, doutor da Igreja" */
  funcao?: string;
  /** "† 1628" ou "século V" */
  epoca?: string;
  /** Código da biografia no Evangelizo, quando existe. */
  id?: string;
}

export interface Biografia {
  /** Duas ou três frases. */
  texto: string;
  /** Página da biografia completa. */
  href: string;
}

export interface SantosDoDia {
  principal: SantoDoFeed & { biografia?: Biografia };
  /** Os outros santos do dia, só os nomes. */
  outros: SantoDoFeed[];
}

// ── Texto e HTML ─────────────────────────────────────────────────────────────────

const ENTIDADES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  mdash: '—',
  ndash: '–',
  hellip: '…',
  laquo: '«',
  raquo: '»',
  ldquo: '“',
  rdquo: '”',
  lsquo: '‘',
  rsquo: '’',
  ordm: 'º',
  ordf: 'ª',
  ccedil: 'ç',
  Ccedil: 'Ç',
  ntilde: 'ñ',
};
// áéíóú àèìòù âêîôû ãõ äëïöü, em minúscula e maiúscula
for (const [sufixo, letras] of [
  ['acute', 'áéíóú'],
  ['grave', 'àèìòù'],
  ['circ', 'âêîôû'],
  ['tilde', 'ãõ'],
  ['uml', 'äëïöü'],
] as const) {
  for (const letra of letras) {
    const base = letra.normalize('NFD')[0] as string;
    ENTIDADES[`${base}${sufixo}`] = letra;
    ENTIDADES[`${base.toUpperCase()}${sufixo}`] = letra.toUpperCase();
  }
}

export function decodificar(texto: string): string {
  return texto.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+\d*);/gi, (inteiro, nome: string) => {
    if (nome.startsWith('#x') || nome.startsWith('#X')) {
      return String.fromCodePoint(Number.parseInt(nome.slice(2), 16));
    }
    if (nome.startsWith('#')) return String.fromCodePoint(Number.parseInt(nome.slice(1), 10));
    return ENTIDADES[nome] ?? inteiro;
  });
}

const espacos = (texto: string) => texto.replace(/[ \t\u00a0]+/g, ' ').trim();

/** Linhas de texto de um trecho de HTML (cada bloco ou `<br>` vira uma linha). */
function linhasDoHtml(html: string): string[] {
  const semCabeca = html
    .replace(/<head[\s\S]*?<\/head>/gi, '')
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '');
  return decodificar(
    semCabeca
      .replace(/<\/?(p|div|br|h\d|tr|li|table|center|hr)\b[^>]*>/gi, '\n')
      .replace(/<[^>]+>/g, ''),
  )
    .split('\n')
    .map(espacos)
    .filter(Boolean);
}

// ── Lista de santos ──────────────────────────────────────────────────────────────

/** "S. Paulo" → "São Paulo"; só quando a abreviação é seguida de um nome. */
function expandirAbreviacoes(texto: string): string {
  return texto
    .replace(/\bSS\.\s+(?=\p{Lu})/gu, 'Santos ')
    .replace(/\bS\.\s+(?=\p{Lu})/gu, 'São ')
    .replace(/\bSta\.\s+(?=\p{Lu})/gu, 'Santa ')
    .replace(/\bSto\.\s+(?=\p{Lu})/gu, 'Santo ')
    .replace(/\be comp\.(?=\s|,|$)/g, 'e companheiros');
}

const ROMANOS = '[IVXL]+';
const EPOCA = new RegExp(
  `^(?:\\+\\s*\\d+|†\\s*\\d+|séc\\.?\\s*${ROMANOS}(?:\\s*(?:ou|e|-)\\s*${ROMANOS})?|c\\.\\s*\\d+)$`,
  'i',
);

function formatarEpoca(parte: string): string {
  const morte = /^[+†]\s*(\d+)$/.exec(parte);
  if (morte) return `† ${morte[1]}`;
  return parte.replace(/^séc\.?\s*/i, 'século ');
}

/** "S. Roque Gonzales e comp., mártires, +1628" → nome, função e época. */
export function interpretarSanto(linha: string, id?: string): SantoDoFeed | null {
  const partes = expandirAbreviacoes(espacos(linha))
    .split(',')
    .map((parte) => parte.trim())
    .filter(Boolean);
  const nome = partes.shift();
  if (!nome) return null;

  let epoca: string | undefined;
  const ultima = partes[partes.length - 1];
  if (ultima && EPOCA.test(ultima)) {
    epoca = formatarEpoca(ultima);
    partes.pop();
  }
  const funcao = partes.join(', ') || undefined;
  return { nome, funcao, epoca, ...(id ? { id } : {}) };
}

/**
 * O feed mistura solenidades e festas do Senhor e de Nossa Senhora com os santos
 * ("Santíssimo Rei do Universo"). Elas não são o "santo do dia".
 */
const NAO_E_SANTO =
  /^(sant[ií]ssim|sagrad|nossa senhora|nosso senhor|senhor\b|jesus\b|cristo\b|natal\b|epifania|batismo do senhor|pentecostes|domingo\b|corpo e sangue|todos os santos|fi[eé]is defuntos|santa maria\s*(,|$)|santo nome|santa cruz|santo sepulcro|apresenta[çc]|anuncia[çc]|visita[çc]|assun[çc]|imaculad|dedica[çc]|c[áa]tedra|convers[ãa]o|transfigura[çc]|exalta[çc])/i;

/**
 * Alguns itens são o santo "na dedicação das suas basílicas" (18/11: "São Pedro e São Paulo, na
 * dedicação das suas basílicas"). É a festa da dedicação, não o santo do dia: o que vem depois
 * da vírgula entra em `funcao`.
 */
const FESTA_DE_DEDICACAO = /\bdedica[çc]/i;

export function ehSanto(santo: SantoDoFeed): boolean {
  return !NAO_E_SANTO.test(santo.nome) && !FESTA_DE_DEDICACAO.test(santo.funcao ?? '');
}

const LINK_DE_SANTO = /<a\b[^>]*?[?&;]id=([0-9a-f-]{36})[^>]*>([\s\S]*?)<\/a>/gi;

/** Lê a resposta de `type=saint`: uma linha por santo; alguns com link para a biografia. */
export function lerSantos(html: string): SantoDoFeed[] {
  const marcado = html.replace(
    LINK_DE_SANTO,
    (_inteiro, id: string, texto: string) => `\n@@${id}@@${texto}\n`,
  );
  const santos: SantoDoFeed[] = [];
  for (const linha of linhasDoHtml(marcado)) {
    const comId = /^@@([0-9a-f-]{36})@@(.+)$/i.exec(linha);
    const santo = comId ? interpretarSanto(comId[2] ?? '', comId[1]) : interpretarSanto(linha);
    if (santo) santos.push(santo);
  }
  return santos;
}

// ── Biografia ────────────────────────────────────────────────────────────────────

const ABREVIATURAS =
  /\b(?:S\.?J|O\.?F\.?M|O\.?P|Sto|Sta|Pe|Fr|Dr|Sr|Sra|Mons|séc|aprox|cf|a\.C|d\.C|nº)\.$/i;

function frases(texto: string): string[] {
  const brutas = texto.split(/(?<=[.!?…])\s+(?=[\p{Lu}«"“])/u);
  const juntas: string[] = [];
  for (const frase of brutas) {
    const ultima = juntas[juntas.length - 1];
    if (ultima !== undefined && ABREVIATURAS.test(ultima)) {
      juntas[juntas.length - 1] = `${ultima} ${frase}`;
    } else {
      juntas.push(frase);
    }
  }
  return juntas;
}

/**
 * Até 3 frases inteiras que caibam em `max` caracteres (a primeira entra sempre).
 * Tira o que está entre parênteses (datas de nascimento e morte, pronúncia), que
 * pesa na leitura e não faz falta no card.
 */
export function resumir(texto: string, max = 420): string {
  const limpo = espacos(texto.replace(/\s*\([^)]*\)/g, '').replace(/\[\d+\]/g, ''));
  let saida = '';
  for (const frase of frases(limpo).slice(0, 3)) {
    const proxima = saida ? `${saida} ${frase}` : frase;
    if (saida && proxima.length > max) break;
    saida = proxima;
  }
  if (saida.length > max * 1.6) {
    const corte = saida.lastIndexOf(' ', max);
    saida = `${saida.slice(0, corte > 0 ? corte : max).replace(/[,;:\s]+$/, '')}…`;
  }
  return saida;
}

/**
 * Algumas páginas repetem o título do santo colado ao primeiro parágrafo, sem ponto
 * ("Santo André Dung Lac e companheiros, presbíteros, séc. XVIII e XIX No dia 9…").
 * Só tiramos esse começo quando ele abre com o nome do santo e termina na época.
 */
const TITULO_COLADO =
  /^[^.!?]{0,160}?(?:séc\.?\s*[IVXL]+(?:\s*(?:ou|e|-)\s*[IVXL]+)?|[+†]\s*\d{3,4})\s+(?=\p{Lu})/iu;

export function tirarTituloColado(texto: string, nome?: string): string {
  if (!nome || !texto.toLowerCase().startsWith(nome.toLowerCase())) return texto;
  return texto.replace(TITULO_COLADO, '');
}

/** A biografia vem em uma página HTML: pegamos as primeiras linhas que são texto corrido. */
export function lerBiografia(html: string, nome?: string): string | undefined {
  const corridas = linhasDoHtml(html).filter((linha) => linha.length >= 80 && /[.!?]/.test(linha));
  const juntas = tirarTituloColado(corridas.slice(0, 2).join(' '), nome);
  return juntas ? resumir(juntas) : undefined;
}

export const urlDaBiografia = (id: string): string => `${PAGINA_SANTO}?id=${id}&language=PT`;

// ── Busca ────────────────────────────────────────────────────────────────────────

export interface OpcoesBusca {
  fetcher?: typeof fetch;
  timeoutMs?: number;
  tentativas?: number;
  /** Espera entre tentativas, multiplicada pelo número da tentativa. */
  esperaMs?: number;
  aviso?: (mensagem: string) => void;
}

const esperar = (ms: number) => new Promise<void>((resolver) => setTimeout(resolver, ms));

/** O texto de uma URL; tenta de novo em erro de rede, timeout, 429 e 5xx. Nunca lança. */
async function baixar(url: string, opcoes: OpcoesBusca): Promise<string | null> {
  const {
    fetcher = fetch,
    timeoutMs = 10_000,
    tentativas = 3,
    esperaMs = 1_000,
    aviso = (mensagem: string) => console.warn(mensagem),
  } = opcoes;

  let motivo = 'sem resposta';
  for (let tentativa = 1; tentativa <= tentativas; tentativa++) {
    try {
      const resposta = await fetcher(url, { signal: AbortSignal.timeout(timeoutMs) });
      if (resposta.status >= 400 && resposta.status < 500 && resposta.status !== 429) {
        aviso(`[santos] HTTP ${resposta.status} em ${url}`);
        return null;
      }
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
      return await resposta.text();
    } catch (erro) {
      motivo = erro instanceof Error ? erro.message : String(erro);
      if (tentativa < tentativas) await esperar(esperaMs * tentativa);
    }
  }
  aviso(`[santos] sem resposta (${motivo}) em ${url}`);
  return null;
}

/** "2026-11-19" → "20261119" */
const dataDoFeed = (iso: string): string => iso.replaceAll('-', '');

/**
 * Os santos de um dia "AAAA-MM-DD": o primeiro santo (com biografia, se o feed tiver)
 * e os nomes dos outros. `null` quando o feed falha ou não traz nenhum santo.
 */
export async function buscarSantos(
  iso: string,
  opcoes: OpcoesBusca = {},
): Promise<SantosDoDia | null> {
  const html = await baixar(`${FEED}?date=${dataDoFeed(iso)}&type=saint&lang=PT`, opcoes);
  if (!html) return null;

  const santos = lerSantos(html).filter(ehSanto);
  const [principal, ...outros] = santos;
  if (!principal) return null;

  let biografia: Biografia | undefined;
  if (principal.id) {
    const pagina = await baixar(urlDaBiografia(principal.id), opcoes);
    const texto = pagina ? lerBiografia(pagina, principal.nome) : undefined;
    if (texto) biografia = { texto, href: urlDaBiografia(principal.id) };
  }
  return { principal: { ...principal, biografia }, outros };
}

// ── Uso no site (guarda o resultado por data) ────────────────────────────────────

const memoria = new Map<string, Promise<SantosDoDia | null>>();
// Em `astro dev`/`build` o Vite preenche `import.meta.env`; nos testes (Node puro) ele não existe.
const emProducao = Boolean((import.meta.env as { PROD?: boolean } | undefined)?.PROD);

/** Os santos de um dia, com um resultado por data: a navegação ‹ › não repete a consulta. */
export function santosDoDia(iso: string): Promise<SantosDoDia | null> {
  let pendente = memoria.get(iso);
  if (!pendente) {
    pendente = buscarSantos(iso);
    memoria.set(iso, pendente);
    if (!emProducao) {
      void pendente.then((resultado) => {
        if (!resultado) memoria.delete(iso);
      });
    }
  }
  return pendente;
}
