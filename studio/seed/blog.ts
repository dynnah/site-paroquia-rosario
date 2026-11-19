/**
 * Posts do blog tirados do canal da paróquia no YouTube (https://www.youtube.com/@IgrejadoRos%C3%A1rioJP).
 *
 * Título, duração e data de publicação são os do próprio YouTube (conferidos em 19/11/2026); nada
 * foi escrito além disso: sem resumo (opcional em post de vídeo) e sem copiar a descrição do vídeo.
 * TODO(paroquia): confirmar quem assina cada vídeo (hoje, o próprio canal) e escrever um resumo curto.
 *
 * Os IDs são fixos (`blog-…`): importar de novo com `--replace` atualiza o mesmo documento.
 */
import type { DocumentoSeed } from './exemplos.ts';

export const CANAL_YOUTUBE = 'https://www.youtube.com/@IgrejadoRos%C3%A1rioJP';

const AUTOR = 'blog-autor-canal';

interface Video {
  slug: string;
  titulo: string;
  coluna: 'paroco' | 'outra';
  colunaNome?: string;
  /** ID do vídeo no YouTube. */
  id: string;
  /** "18:29" */
  duracao: string;
  /** Data de publicação no YouTube, em UTC. */
  data: string;
}

export const VIDEOS: Video[] = [
  {
    slug: 'podcast-tempo-liturgico-da-quaresma-episodio-final',
    titulo: 'Podcast: Tempo Litúrgico da Quaresma - Episódio Final',
    coluna: 'outra',
    colunaNome: 'Podcast',
    id: 'W0AVInuQxs4',
    duracao: '18:29',
    data: '2025-04-17T15:00:06Z',
  },
  {
    slug: 'agradecimento-pela-restauracao',
    titulo: 'Frei Francisco Robério OFM: agradecimento pela restauração na Paróquia do Rosário JP',
    coluna: 'paroco',
    id: 'oHNfMD-lG4c',
    duracao: '4:26',
    data: '2025-01-08T15:05:48Z',
  },
  {
    slug: 'simplesmente-amar-ministerio-adoremos',
    titulo: 'Simplesmente Amar - Ministério Adoremos',
    coluna: 'outra',
    colunaNome: 'Música',
    id: 'v0vr8qcsuEw',
    duracao: '3:34',
    data: '2021-12-25T15:22:23Z',
  },
  {
    slug: 'homilia-dominical-20-06-2021',
    titulo: 'Homilia Dominical - 20/06/2021',
    coluna: 'paroco',
    id: 'vbkeeir1E14',
    duracao: '26:40',
    data: '2021-06-21T21:00:18Z',
  },
];

export function gerarBlog(): DocumentoSeed[] {
  return [
    {
      _id: AUTOR,
      _type: 'autor',
      nome: 'Igreja do Rosário JP',
      funcao: 'Canal da paróquia no YouTube',
    },
    ...VIDEOS.map((v) => ({
      _id: `blog-${v.slug}`,
      _type: 'post',
      statusRevisao: 'aprovado',
      coluna: v.coluna,
      ...(v.colunaNome ? { colunaNome: v.colunaNome } : {}),
      titulo: v.titulo,
      slug: { _type: 'slug', current: v.slug },
      autor: { _type: 'reference', _ref: AUTOR },
      data: v.data,
      youtube: `https://www.youtube.com/watch?v=${v.id}`,
      duracaoVideo: v.duracao,
    })),
  ];
}
