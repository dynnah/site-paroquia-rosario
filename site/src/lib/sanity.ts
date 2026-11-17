/**
 * Cliente do Sanity e consultas GROQ tipadas, uma por necessidade das páginas.
 *
 * O site é estático: tudo isto roda no build, nunca no navegador. O dataset
 * do plano Free é público, então só `PUBLIC_SANITY_PROJECT_ID` e
 * `PUBLIC_SANITY_DATASET` são necessários; o token de leitura é opcional.
 *
 * Sem projeto configurado: em desenvolvimento as listas voltam vazias (e os
 * documentos únicos, nulos) com um aviso no terminal; no build de produção
 * falha com mensagem clara, para nunca publicar um site vazio por engano.
 */
import { createClient, type SanityClient } from '@sanity/client';
import { partesData } from './formatacao.ts';
import type {
  Aviso,
  Configuracoes,
  Evento,
  EventoDetalhe,
  FiltroBlog,
  Horarios,
  Pagina,
  PaginaDePosts,
  Pastoral,
  PastoralDetalhe,
  Post,
  PostResumo,
  Sacramento,
  SacramentoDetalhe,
  Santo,
  SantoDetalhe,
} from './sanity.tipos.ts';

export type * from './sanity.tipos.ts';

export const POSTS_POR_PAGINA = 12;
const PALAVRAS_POR_MINUTO = 200;

// ── Utilitários puros ────────────────────────────────────────────────────────────

/** Tempo de leitura em minutos (mínimo 1). */
export function minutosDeLeitura(palavras: number | undefined): number {
  return Math.max(1, Math.ceil((palavras ?? 0) / PALAVRAS_POR_MINUTO));
}

const dois = (n: number) => String(n).padStart(2, '0');

/** "2026-11-17", no fuso de São Paulo. */
export function dataISO(agora: Date): string {
  const { ano, mes, dia } = partesData(agora);
  return `${ano}-${dois(mes)}-${dois(dia)}`;
}

/** "11-17", no fuso de São Paulo: a chave dos santos do dia. */
export function mesDia(agora: Date): string {
  return dataISO(agora).slice(5);
}

// ── Consultas GROQ ───────────────────────────────────────────────────────────────

const LINK = '{ rotulo, href }';

/** `linhas` de um grupo de horários, sempre com `horas` e `linhas` presentes. */
const grupo = (campo: string) =>
  `"${campo}": {
    "linhas": coalesce(${campo}.linhas, [])[]{ rotulo, dias, "horas": coalesce(horas, []), nota },
    "observacao": ${campo}.observacao
  }`;

const COLUNA_NOME = `select(
  coluna == "paroco" => "Palavra do Pároco",
  coluna == "juventude" => "Juventude",
  coalesce(colunaNome, "Outras")
)`;

const POST_RESUMO = `{
  _id, "slug": slug.current, coluna, "colunaNome": ${COLUNA_NOME},
  titulo, resumo, "autor": autor->{ nome, funcao }, data, youtube, duracaoVideo,
  "palavras": coalesce(length(string::split(pt::text(corpo), " ")), 0)
}`;

/** Posts publicados: aprovados e já na data de publicação. */
const POSTS_VISIVEIS = `_type == "post" && statusRevisao == "aprovado" && dateTime(data) <= dateTime($agora)
  && ($coluna == "" || coluna == $coluna) && (!$soVideos || defined(youtube))`;

const EVENTO = `{
  _id, "slug": slug.current, titulo, destaque, inicio, fim, local, categoria, inscricaoUrl
}`;

const PASTORAL = `{
  _id, "slug": slug.current, nome, familia, categoria, descricao, encontros, contato, responsavel,
  link${LINK}
}`;

const SACRAMENTO = `{
  _id, "slug": slug.current, nome, resumo, contato,
  "requisitos": coalesce(requisitos, []),
  "documentos": coalesce(documentos, []),
  "proximasTurmas": coalesce(proximasTurmas, [])[coalesce(fim, inicio) >= $hoje]
    { nome, inicio, fim, horario, inscricaoUrl }
}`;

const SANTO = `{ _id, dia, nome, destaque, grau, familia, datasDeVida, bio }`;

export const CONSULTAS = {
  configuracoes: `*[_type == "configuracoes" && _id == "configuracoes"][0]{
    nome, assinatura, endereco, mapaUrl, telefone, whatsapp, email, instagram, youtube, pixChave, pixTitular
  }`,

  horarios: `*[_type == "horarios" && _id == "horarios"][0]{
    ${grupo('missa')}, ${grupo('confissao')}, ${grupo('adoracao')}, ${grupo('secretaria')}
  }`,

  avisosAtivos: `*[_type == "aviso" && dateTime(inicio) <= dateTime($agora)
    && (!defined(fim) || dateTime(fim) >= dateTime($agora))]
    | order(inicio desc){ _id, titulo, texto, tipo, link${LINK} }`,

  eventosProximos: `*[_type == "evento" && dateTime(coalesce(fim, inicio)) >= dateTime($agora)]
    | order(inicio asc)[0...$limite]${EVENTO}`,

  evento: `*[_type == "evento" && slug.current == $slug][0]{
    _id, "slug": slug.current, titulo, destaque, inicio, fim, local, categoria, inscricaoUrl, descricao
  }`,

  pastorais: `*[_type == "pastoral"] | order(nome asc)${PASTORAL}`,

  pastoral: `*[_type == "pastoral" && slug.current == $slug][0]{
    _id, "slug": slug.current, nome, familia, categoria, descricao, encontros, contato, responsavel,
    link${LINK}, sobre
  }`,

  sacramentos: `*[_type == "sacramento"] | order(coalesce(ordem, 999) asc, nome asc)${SACRAMENTO}`,

  sacramento: `*[_type == "sacramento" && slug.current == $slug][0]{
    _id, "slug": slug.current, nome, resumo, contato, sobre,
    "requisitos": coalesce(requisitos, []),
    "documentos": coalesce(documentos, []),
    "proximasTurmas": coalesce(proximasTurmas, [])[coalesce(fim, inicio) >= $hoje]
      { nome, inicio, fim, horario, inscricaoUrl }
  }`,

  posts: `*[${POSTS_VISIVEIS}] | order(data desc)[$de...$ate]${POST_RESUMO}`,

  totalPosts: `count(*[${POSTS_VISIVEIS}])`,

  post: `*[_type == "post" && statusRevisao == "aprovado" && dateTime(data) <= dateTime($agora)
    && slug.current == $slug][0]{
    _id, "slug": slug.current, coluna, "colunaNome": ${COLUNA_NOME},
    titulo, resumo, "autor": autor->{ nome, funcao }, data, youtube, duracaoVideo,
    "palavras": coalesce(length(string::split(pt::text(corpo), " ")), 0), corpo
  }`,

  /** Solenidade antes de festa, festa antes de memória. */
  santosDoDia: `*[_type == "santo" && dia == $dia]
    | order(select(grau == "solenidade" => 0, grau == "festa" => 1, 2) asc, nome asc)${SANTO}`,

  santo: `*[_type == "santo" && _id == $id][0]{ _id, dia, nome, destaque, grau, familia, datasDeVida, bio, historia }`,

  pagina: `*[_type == "pagina" && slug.current == $slug][0]{
    _id, "slug": slug.current, titulo, resumo, corpo
  }`,

  slugs: `*[_type == $tipo && defined(slug.current)].slug.current`,

  /** Só posts que o site realmente publica: senão o getStaticPaths geraria páginas vazias. */
  slugsPosts: `*[${POSTS_VISIVEIS}].slug.current`,
} as const;

// ── Fonte de dados ───────────────────────────────────────────────────────────────

/** Executa uma consulta GROQ. `vazio` é o que devolver se o Sanity não estiver configurado (só em dev). */
export type Buscar = <T>(consulta: string, params: Record<string, unknown>, vazio: T) => Promise<T>;

type AmbienteSite = Record<string, string | boolean | undefined>;
// Em `astro dev`/`build` o Vite preenche `import.meta.env`; nos testes (Node puro) ele não existe.
const env = (import.meta.env ?? {}) as AmbienteSite;

const API_VERSION = '2025-01-01';

let cliente: SanityClient | undefined;
let avisou = false;
const memoria = new Map<string, Promise<unknown>>();

export const buscarNoSanity: Buscar = async (consulta, params, vazio) => {
  const projectId = env.PUBLIC_SANITY_PROJECT_ID as string | undefined;

  if (!projectId) {
    if (env.PROD) {
      throw new Error(
        'Sanity não configurado: defina PUBLIC_SANITY_PROJECT_ID (e PUBLIC_SANITY_DATASET) no ambiente do build. Veja site/.env.example.',
      );
    }
    if (!avisou) {
      avisou = true;
      console.warn(
        '[sanity] PUBLIC_SANITY_PROJECT_ID vazio: devolvendo conteúdo vazio. Crie site/.env a partir de site/.env.example.',
      );
    }
    return vazio;
  }

  cliente ??= createClient({
    projectId,
    dataset: (env.PUBLIC_SANITY_DATASET as string | undefined) || 'production',
    apiVersion: API_VERSION,
    // Build estático: queremos o dado mais novo, não o da CDN.
    useCdn: false,
    perspective: 'published',
    token: (env.SANITY_API_READ_TOKEN as string | undefined) || undefined,
  });

  // No build, a mesma consulta se repete em várias páginas: busca uma vez só.
  if (!env.PROD) return cliente.fetch<typeof vazio>(consulta, params);
  const chave = consulta + JSON.stringify(params);
  let pendente = memoria.get(chave) as Promise<typeof vazio> | undefined;
  if (!pendente) {
    pendente = cliente.fetch<typeof vazio>(consulta, params);
    memoria.set(chave, pendente);
  }
  return pendente;
};

// ── API de conteúdo ──────────────────────────────────────────────────────────────

export type TipoComSlug = 'evento' | 'pastoral' | 'sacramento' | 'post' | 'pagina';

/**
 * Cria as funções de leitura sobre uma fonte de dados.
 * `buscar` e `agora` são injetáveis para testar as consultas sem rede.
 */
export function criarConteudo(buscar: Buscar, agora: () => Date = () => new Date()) {
  /** "Agora" arredondado ao minuto: consultas repetidas no build caem no mesmo cache. */
  const instante = () => {
    const data = new Date(agora());
    data.setSeconds(0, 0);
    return data.toISOString();
  };

  return {
    configuracoes: () => buscar<Configuracoes | null>(CONSULTAS.configuracoes, {}, null),

    horarios: () => buscar<Horarios | null>(CONSULTAS.horarios, {}, null),

    /** Avisos dentro do período de exibição, do mais recente para o mais antigo. */
    avisosAtivos: () => buscar<Aviso[]>(CONSULTAS.avisosAtivos, { agora: instante() }, []),

    eventosProximos: (limite = 3) =>
      buscar<Evento[]>(CONSULTAS.eventosProximos, { agora: instante(), limite }, []),

    evento: (slug: string) => buscar<EventoDetalhe | null>(CONSULTAS.evento, { slug }, null),

    pastorais: () => buscar<Pastoral[]>(CONSULTAS.pastorais, {}, []),

    pastoral: (slug: string) => buscar<PastoralDetalhe | null>(CONSULTAS.pastoral, { slug }, null),

    sacramentos: () => buscar<Sacramento[]>(CONSULTAS.sacramentos, { hoje: dataISO(agora()) }, []),

    sacramento: (slug: string) =>
      buscar<SacramentoDetalhe | null>(
        CONSULTAS.sacramento,
        { slug, hoje: dataISO(agora()) },
        null,
      ),

    /** Página `pagina` (1 = primeira) de posts publicados, já filtrada. */
    async posts(
      filtro: FiltroBlog = 'tudo',
      pagina = 1,
      porPagina = POSTS_POR_PAGINA,
    ): Promise<PaginaDePosts> {
      const params = {
        agora: instante(),
        coluna: filtro === 'tudo' || filtro === 'videos' ? '' : filtro,
        soVideos: filtro === 'videos',
      };
      const total = await buscar<number>(CONSULTAS.totalPosts, params, 0);
      const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
      const atual = Math.min(Math.max(1, pagina), totalPaginas);
      const de = (atual - 1) * porPagina;
      const posts = await buscar<PostResumo[]>(
        CONSULTAS.posts,
        { ...params, de, ate: de + porPagina },
        [],
      );
      return { posts, total, pagina: atual, totalPaginas, porPagina };
    },

    post: (slug: string) => buscar<Post | null>(CONSULTAS.post, { slug, agora: instante() }, null),

    /** Santos celebrados hoje (São Paulo), do mais solene para o menos. */
    santosDoDia: (data: Date = agora()) =>
      buscar<Santo[]>(CONSULTAS.santosDoDia, { dia: mesDia(data) }, []),

    santo: (id: string) => buscar<SantoDetalhe | null>(CONSULTAS.santo, { id }, null),

    pagina: (slug: string) => buscar<Pagina | null>(CONSULTAS.pagina, { slug }, null),

    /** Para `getStaticPaths`. */
    slugs: (tipo: TipoComSlug) =>
      tipo === 'post'
        ? buscar<string[]>(
            CONSULTAS.slugsPosts,
            { agora: instante(), coluna: '', soVideos: false },
            [],
          )
        : buscar<string[]>(CONSULTAS.slugs, { tipo }, []),
  };
}

export const conteudo = criarConteudo(buscarNoSanity);
