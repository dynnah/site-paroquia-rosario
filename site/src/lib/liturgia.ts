/**
 * Liturgia do dia.
 *
 * Fonte: API aberta `liturgia-diaria` (v2). A escolha e os riscos estão em
 * `docs/liturgia.md`. O site só lê a API no build (nunca no navegador do fiel).
 *
 * Direitos autorais: o texto das leituras (tradução CNBB) não pode ser publicado
 * sem autorização. Com `LITURGIA_TEXTO_INTEGRAL` falsa (o padrão) o adaptador
 * descarta o texto e o refrão da resposta antes de montar qualquer coisa: o
 * resto do site nem chega a vê-los. Ficam só o nome da celebração, a cor e as
 * referências bíblicas (que são fatos do calendário litúrgico).
 *
 * Se a API falhar, `buscarLiturgia` devolve `null` e a página mostra a data e o
 * link da liturgia oficial. O build nunca quebra por causa dela.
 */
import { dataISO } from './formatacao.ts';
import type { CorLiturgica } from './tipos.ts';

/** Fonte oficial: o texto integral das leituras (tradução CNBB) não é publicado aqui sem autorização. */
export const LITURGIA_OFICIAL = {
  rotulo: 'Liturgia Diária',
  href: 'https://www.cnbb.org.br/liturgia-diaria/',
} as const;

export const LITURGIA_API = 'https://liturgia.up.railway.app/v2/';

// ── Tipos ────────────────────────────────────────────────────────────────────────

export type TempoLiturgico = 'Advento' | 'Natal' | 'Quaresma' | 'Páscoa' | 'Tempo Comum';
export type GrauCelebracao = 'memoria' | 'memoria-facultativa' | 'festa' | 'solenidade';

/** Os ids são os do componente `LiturgiaDoDia` (o CSS depende deles). */
export type IdLeitura = 'l1' | 'sl' | 'l2' | 'ev';

export interface LeituraDoDia {
  id: IdLeitura;
  /** "1ª Leitura", "Salmo", "2ª Leitura", "Evangelho" */
  rotulo: string;
  /** "Lc 19,11-28". Com opções (forma longa e breve), "Lc 2,22-40 ou Lc 2,22.39-40". */
  referencia: string;
  /** Parágrafos. Só existe com `LITURGIA_TEXTO_INTEGRAL=true`. */
  texto?: string[];
  /** Refrão do salmo. Só existe com `LITURGIA_TEXTO_INTEGRAL=true`. */
  refrao?: string;
}

export interface LiturgiaDoDia {
  /** "2026-11-18" */
  data: string;
  /** Nome da celebração sem o grau: "4ª feira", "Santo André, Apóstolo", "1º Domingo do Advento". */
  nome: string;
  /** "33ª Semana do Tempo Comum". Só nos dias comuns; festas e memórias não trazem semana. */
  semana?: string;
  tempo?: TempoLiturgico;
  grau?: GrauCelebracao;
  cor: CorLiturgica;
  leituras: LeituraDoDia[];
  /**
   * Dias com mais do que cabe nas abas (Vigília Pascal, leituras extras, muitas
   * opções): a página avisa e manda para a liturgia oficial.
   */
  temLeiturasEspeciais: boolean;
}

// ── Interpretação do nome da celebração ──────────────────────────────────────────

const GRAUS: ReadonlyArray<readonly [RegExp, GrauCelebracao]> = [
  [/[,.]\s*Memória Facultativa\s*$/i, 'memoria-facultativa'],
  [/[,.]\s*Memória\s*$/i, 'memoria'],
  [/[,.]\s*Festa\s*$/i, 'festa'],
  [/[,.]\s*Solenidade\s*$/i, 'solenidade'],
];

/** Só palavras explícitas no nome: se não diz o tempo, não adivinhamos. */
const TEMPOS: ReadonlyArray<readonly [RegExp, TempoLiturgico]> = [
  [/\bAdvento\b/, 'Advento'],
  [/\bQuaresma\b|\bCinzas\b/, 'Quaresma'],
  [/\bPáscoa\b/, 'Páscoa'],
  [/\bTempo Comum\b/, 'Tempo Comum'],
  [/\bNatal\b/, 'Natal'],
];

// "4ª feira da 33ª Semana do Tempo Comum", "2ª feira da 3ª Semana da Páscoa"
const DIA_E_SEMANA = /^(.+?)\s+d[aoe]s?\s+(\d+ª\s+Semana\s+d[aoe]s?\s+.+)$/i;

const CORES: Record<string, CorLiturgica> = {
  verde: 'verde',
  roxo: 'roxo',
  branco: 'branco',
  vermelho: 'vermelho',
  rosa: 'rosa',
};

export function interpretarCelebracao(texto: string): {
  nome: string;
  semana?: string;
  tempo?: TempoLiturgico;
  grau?: GrauCelebracao;
} {
  let nome = texto.replace(/\s+/g, ' ').trim();

  let grau: GrauCelebracao | undefined;
  for (const [padrao, valor] of GRAUS) {
    if (padrao.test(nome)) {
      grau = valor;
      nome = nome.replace(padrao, '').trim();
      break;
    }
  }

  const tempo = TEMPOS.find(([padrao]) => padrao.test(nome))?.[1];

  const diaESemana = DIA_E_SEMANA.exec(nome);
  if (diaESemana?.[1] && diaESemana[2]) {
    return { nome: diaESemana[1], semana: diaESemana[2], tempo, grau };
  }
  return { nome, tempo, grau };
}

const ROTULOS_GRAU = {
  memoria: 'Memória',
  'memoria-facultativa': 'Memória facultativa',
  festa: 'Festa',
  solenidade: 'Solenidade',
} as const satisfies Record<GrauCelebracao, string>;

export function rotuloGrau(grau: GrauCelebracao): (typeof ROTULOS_GRAU)[GrauCelebracao] {
  return ROTULOS_GRAU[grau];
}

/** Título do card: a semana do tempo litúrgico ou, sem semana, o nome da celebração. */
export function tituloDaLiturgia(l: Pick<LiturgiaDoDia, 'nome' | 'semana'>): string {
  return l.semana ?? l.nome;
}

/**
 * Linha abaixo do título, ao lado da bolinha da cor: o dia ("4ª feira"), o grau
 * ("Festa") ou, quando não há nenhum dos dois, o nome da cor (a cor nunca vai só).
 */
export function linhaDaCelebracao(
  l: Pick<LiturgiaDoDia, 'nome' | 'semana' | 'grau' | 'cor'>,
): string {
  if (l.semana) return l.grau ? `${l.nome} · ${rotuloGrau(l.grau)}` : l.nome;
  if (l.grau) return rotuloGrau(l.grau);
  return `Cor litúrgica: ${l.cor}`;
}

// ── Leituras ─────────────────────────────────────────────────────────────────────

const SLOTS = [
  { chave: 'primeiraLeitura', id: 'l1', rotulo: '1ª Leitura' },
  { chave: 'salmo', id: 'sl', rotulo: 'Salmo' },
  { chave: 'segundaLeitura', id: 'l2', rotulo: '2ª Leitura' },
  { chave: 'evangelho', id: 'ev', rotulo: 'Evangelho' },
] as const;

/** Acima disso (Vigília Pascal tem 8 salmos) não são mais alternativas: mostramos a primeira e avisamos. */
const MAX_OPCOES = 4;

/**
 * "Lc 2, 22-40 (mais longo)" → "Lc 2,22-40". Tira o complemento entre parênteses
 * depois de espaço ("(R. 11b)") e deixa o que vem colado ("Sl 118(119)").
 */
export function limparReferencia(referencia: string): string {
  return referencia
    .replace(/\s+/g, ' ')
    .replace(/\s\(.*\)\s*$/, '')
    .replace(/(\d),\s+(?=\d)/g, '$1,')
    .trim();
}

// Número de versículo colado na palavra: "1vi", "41quando". Não mexe em ordinais ("5ª").
const NUMERO_DE_VERSICULO = /(?<![\p{L}\p{N}])\d{1,3}(?=[\p{L}“"‘'(])(?![ªº°])/gu;

/** Parágrafos do texto, sem os números de versículo. */
export function paragrafos(texto: string): string[] {
  return texto
    .split(/\n+/)
    .map((p) =>
      p
        .replace(NUMERO_DE_VERSICULO, '')
        .replace(/\s{2,}/g, ' ')
        .trim(),
    )
    .filter(Boolean);
}

const ehObjeto = (valor: unknown): valor is Record<string, unknown> =>
  typeof valor === 'object' && valor !== null && !Array.isArray(valor);

const textoNaoVazio = (valor: unknown): string | undefined =>
  typeof valor === 'string' && valor.trim() ? valor : undefined;

function opcoesDoSlot(
  bruto: unknown,
): Array<{ referencia: string; texto?: string; refrao?: string }> {
  if (!Array.isArray(bruto)) return [];
  const opcoes: Array<{ referencia: string; texto?: string; refrao?: string }> = [];
  for (const item of bruto) {
    if (!ehObjeto(item)) continue;
    const referencia = textoNaoVazio(item.referencia);
    if (!referencia) continue;
    opcoes.push({
      referencia: limparReferencia(referencia),
      texto: textoNaoVazio(item.texto),
      refrao: textoNaoVazio(item.refrao),
    });
  }
  return opcoes;
}

export function montarLeituras(
  bruto: unknown,
  textoIntegral: boolean,
): { leituras: LeituraDoDia[]; temLeiturasEspeciais: boolean } {
  const leiturasBrutas = ehObjeto(bruto) ? bruto : {};
  const leituras: LeituraDoDia[] = [];
  let especiais = false;

  for (const slot of SLOTS) {
    const todas = opcoesDoSlot(leiturasBrutas[slot.chave]);
    if (todas.length === 0) continue;

    // Mesma referência repetida não é alternativa.
    const unicas = todas.filter(
      (o, i) => todas.findIndex((x) => x.referencia === o.referencia) === i,
    );
    const demais = unicas.length > MAX_OPCOES;
    if (demais) especiais = true;
    const opcoes = demais ? unicas.slice(0, 1) : unicas;

    const leitura: LeituraDoDia = {
      id: slot.id,
      rotulo: slot.rotulo,
      referencia: opcoes.map((o) => o.referencia).join(' ou '),
    };

    if (textoIntegral) {
      const paragrafosDoSlot = opcoes.flatMap((o) => {
        const corpo = o.texto ? paragrafos(o.texto) : [];
        return opcoes.length > 1 && corpo.length > 0 ? [o.referencia, ...corpo] : corpo;
      });
      if (paragrafosDoSlot.length > 0) leitura.texto = paragrafosDoSlot;
      const refrao = opcoes[0]?.refrao;
      if (slot.id === 'sl' && refrao) leitura.refrao = refrao;
    }

    leituras.push(leitura);
  }

  // Leituras extras com referência (Vigília Pascal, Natal): não cabem nas abas.
  const extras = leiturasBrutas.extras;
  if (Array.isArray(extras) && extras.some((e) => ehObjeto(e) && textoNaoVazio(e.referencia))) {
    especiais = true;
  }

  return { leituras, temLeiturasEspeciais: especiais };
}

// ── Resposta da API ──────────────────────────────────────────────────────────────

/** "2026-11-18" → "18/11/2026", o formato do campo `data` da API. */
function dataDaApi(iso: string): string {
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

/** Endereço da API para um dia "AAAA-MM-DD". */
export function urlLiturgia(iso: string): string {
  const [ano, mes, dia] = iso.split('-');
  return `${LITURGIA_API}?dia=${dia}&mes=${mes}&ano=${ano}`;
}

/**
 * Converte a resposta da API em `LiturgiaDoDia`. Devolve `null` se a resposta
 * não tiver a forma esperada ou se for de outro dia que não o pedido (melhor a
 * página de reserva do que a liturgia errada).
 */
export function converterLiturgia(
  resposta: unknown,
  iso: string,
  textoIntegral = false,
): LiturgiaDoDia | null {
  if (!ehObjeto(resposta)) return null;

  const celebracao = textoNaoVazio(resposta.liturgia);
  if (!celebracao) return null;
  if (resposta.data !== dataDaApi(iso)) return null;

  const { leituras, temLeiturasEspeciais } = montarLeituras(resposta.leituras, textoIntegral);
  const cor = CORES[String(resposta.cor ?? '').toLowerCase()] ?? 'branco';

  return { data: iso, ...interpretarCelebracao(celebracao), cor, leituras, temLeiturasEspeciais };
}

// ── Busca ────────────────────────────────────────────────────────────────────────

export interface OpcoesBusca {
  textoIntegral?: boolean;
  fetcher?: typeof fetch;
  timeoutMs?: number;
  tentativas?: number;
  /** Espera entre tentativas, multiplicada pelo número da tentativa. */
  esperaMs?: number;
  aviso?: (mensagem: string) => void;
}

const esperar = (ms: number) => new Promise<void>((resolver) => setTimeout(resolver, ms));

/**
 * Busca a liturgia de um dia "AAAA-MM-DD". Tenta de novo em erro de rede,
 * timeout, 429 e 5xx; 404 e demais 4xx não se repetem. Nunca lança: em qualquer
 * falha devolve `null`.
 */
export async function buscarLiturgia(
  iso: string,
  opcoes: OpcoesBusca = {},
): Promise<LiturgiaDoDia | null> {
  const {
    textoIntegral = false,
    fetcher = fetch,
    timeoutMs = 10_000,
    tentativas = 3,
    esperaMs = 1_000,
    aviso = (mensagem: string) => console.warn(mensagem),
  } = opcoes;

  let motivo = 'sem resposta';
  for (let tentativa = 1; tentativa <= tentativas; tentativa++) {
    try {
      const resposta = await fetcher(urlLiturgia(iso), {
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (resposta.status === 404) return null;
      if (resposta.status >= 400 && resposta.status < 500 && resposta.status !== 429) {
        aviso(`[liturgia] ${iso}: a API respondeu HTTP ${resposta.status}; usando a reserva.`);
        return null;
      }
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);

      const liturgia = converterLiturgia(await resposta.json(), iso, textoIntegral);
      if (!liturgia) aviso(`[liturgia] ${iso}: resposta inesperada da API; usando a reserva.`);
      return liturgia;
    } catch (erro) {
      motivo = erro instanceof Error ? erro.message : String(erro);
      if (tentativa < tentativas) await esperar(esperaMs * tentativa);
    }
  }

  aviso(`[liturgia] ${iso}: a API não respondeu (${motivo}); usando a reserva.`);
  return null;
}

// ── Uso no site (lê o ambiente e guarda o resultado por data) ────────────────────

type AmbienteLiturgia = { PROD?: boolean; LITURGIA_TEXTO_INTEGRAL?: string };
// Em `astro dev`/`build` o Vite preenche `import.meta.env`; nos testes (Node puro) ele não existe.
const env = (import.meta.env ?? {}) as AmbienteLiturgia;

/** A flag `LITURGIA_TEXTO_INTEGRAL`: só o valor "true" liga o texto integral. */
export function textoIntegralLigado(
  valor: string | undefined = env.LITURGIA_TEXTO_INTEGRAL,
): boolean {
  return valor?.trim().toLowerCase() === 'true';
}

const memoria = new Map<string, Promise<LiturgiaDoDia | null>>();

/**
 * A liturgia de um dia, com a flag do ambiente e um resultado por data: no build,
 * ontem/hoje/amanhã se consultam entre si (navegação ‹ ›) e a API é chamada uma
 * vez por dia. Falha só é lembrada no build; no `astro dev` a próxima recarga tenta de novo.
 */
export function liturgiaDoDia(iso: string): Promise<LiturgiaDoDia | null> {
  let pendente = memoria.get(iso);
  if (!pendente) {
    pendente = buscarLiturgia(iso, { textoIntegral: textoIntegralLigado() });
    memoria.set(iso, pendente);
    if (!env.PROD) {
      void pendente.then((resultado) => {
        if (!resultado) memoria.delete(iso);
      });
    }
  }
  return pendente;
}

/** Hoje (São Paulo), "AAAA-MM-DD". */
export const hojeIso = (): string => dataISO(new Date());

// ── Ligação com os componentes ───────────────────────────────────────────────────

export interface LeituraDoCard {
  id: IdLeitura;
  rotulo: string;
  referencia: string;
  texto?: string[];
}

/** As leituras no formato do `LiturgiaDoDia.astro`. O refrão do salmo abre o texto do salmo. */
export function leiturasDoCard(leituras: LeituraDoDia[]): LeituraDoCard[] {
  return leituras.map(({ id, rotulo, referencia, texto, refrao }) => ({
    id,
    rotulo,
    referencia,
    texto: texto ? (refrao ? [`R. ${refrao}`, ...texto] : texto) : undefined,
  }));
}

/** A leitura do Evangelho, para o resumo da página inicial. Ausente na Vigília Pascal. */
export function evangelhoDoDia(liturgia: LiturgiaDoDia | null): LeituraDoDia | undefined {
  return liturgia?.leituras.find((leitura) => leitura.id === 'ev');
}
