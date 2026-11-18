/**
 * Rotas e adaptação de dados do blog: filtros, paginação e props do `CardPost`.
 *
 * Rotas geradas (todas estáticas):
 *   /blog                      /blog/pagina/2
 *   /blog/coluna/paroco        /blog/coluna/paroco/pagina/2
 *   /blog/coluna/juventude     /blog/coluna/juventude/pagina/2
 *   /blog/videos               /blog/videos/pagina/2
 *   /blog/<slug-do-post>
 */
import { minutosDeLeitura } from './sanity.ts';
import type { FiltroBlog, PostResumo } from './sanity.tipos.ts';
import { extrairIdYouTube } from './youtube.ts';

/** Filtros que têm rota própria. Colunas "outras" aparecem só em "Tudo". */
export type FiltroRota = Exclude<FiltroBlog, 'outra'>;

export const FILTROS_BLOG: { id: FiltroRota; rotulo: string }[] = [
  { id: 'tudo', rotulo: 'Tudo' },
  { id: 'paroco', rotulo: 'Palavra do Pároco' },
  { id: 'juventude', rotulo: 'Juventude' },
  { id: 'videos', rotulo: 'Vídeos' },
];

/** Segmentos que o blog usa em rotas fixas: nenhum post pode ter esses slugs. */
export const SLUGS_RESERVADOS_BLOG = ['coluna', 'videos', 'pagina'];

/** "/blog", "/blog/pagina/2", "/blog/coluna/paroco/pagina/3", "/blog/videos". */
export function hrefBlog(filtro: FiltroRota, pagina = 1): string {
  const base =
    filtro === 'tudo' ? '/blog' : filtro === 'videos' ? '/blog/videos' : `/blog/coluna/${filtro}`;
  return pagina > 1 ? `${base}/pagina/${pagina}` : base;
}

/** Props do `CardPost` a partir do resumo do Sanity. Link do YouTube inválido vira post de texto. */
export function propsCardPost(post: PostResumo) {
  const idVideo = post.youtube ? extrairIdYouTube(post.youtube) : null;
  return {
    href: `/blog/${post.slug}`,
    coluna: post.colunaNome,
    colunaTipo: post.coluna,
    titulo: post.titulo,
    resumo: post.resumo,
    autor: post.autor?.nome ?? '',
    data: post.data,
    minutosLeitura: idVideo ? undefined : minutosDeLeitura(post.palavras),
    video: idVideo ? { id: idVideo, duracao: post.duracaoVideo } : undefined,
  };
}
