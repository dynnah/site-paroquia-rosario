import { DocumentTextIcon } from '@sanity/icons/DocumentText';
import { defineField, defineType } from 'sanity';
import { campoSlug } from '../campos';
import { validarDuracao, validarYouTube } from '../validacoes';

const temVideo = (documento: unknown) => Boolean((documento as { youtube?: string })?.youtube);

export const post = defineType({
  name: 'post',
  title: 'Post do blog',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'statusRevisao',
      title: 'Status de revisão',
      type: 'string',
      description:
        'O site só publica posts "Aprovado". Quem escreve deixa em "Rascunho" ou "Em revisão"; o pároco ou a comunicação aprova.',
      options: {
        list: [
          { title: 'Rascunho', value: 'rascunho' },
          { title: 'Em revisão', value: 'em-revisao' },
          { title: 'Aprovado', value: 'aprovado' },
        ],
        layout: 'radio',
      },
      initialValue: 'rascunho',
      validation: (regra) => regra.required(),
    }),
    defineField({
      name: 'coluna',
      title: 'Coluna',
      type: 'string',
      options: {
        list: [
          { title: 'Palavra do Pároco', value: 'paroco' },
          { title: 'Juventude', value: 'juventude' },
          { title: 'Outra coluna', value: 'outra' },
        ],
        layout: 'radio',
      },
      initialValue: 'paroco',
      validation: (regra) => regra.required(),
    }),
    defineField({
      name: 'colunaNome',
      title: 'Nome da coluna',
      type: 'string',
      description: 'Ex.: Catequese, Liturgia.',
      hidden: ({ document }) => document?.coluna !== 'outra',
      validation: (regra) =>
        regra
          .max(40)
          .custom((nome, contexto) =>
            (contexto.document as { coluna?: string } | undefined)?.coluna === 'outra' && !nome
              ? 'Informe o nome da coluna.'
              : true,
          ),
    }),
    defineField({
      name: 'titulo',
      title: 'Título',
      type: 'string',
      validation: (regra) => regra.required().max(120),
    }),
    campoSlug(),
    defineField({
      name: 'autor',
      title: 'Autor',
      type: 'reference',
      to: [{ type: 'autor' }],
      validation: (regra) => regra.required(),
    }),
    defineField({
      name: 'data',
      title: 'Data de publicação',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      description: 'Posts com data futura só aparecem depois dela.',
      validation: (regra) => regra.required(),
    }),
    defineField({
      name: 'resumo',
      title: 'Resumo',
      type: 'text',
      rows: 3,
      description:
        'Uma ou duas frases. Aparece nos cards e no Instagram/WhatsApp. Máximo de 220 caracteres.',
      validation: (regra) =>
        regra
          .max(220)
          .custom((resumo, contexto) =>
            !resumo && !temVideo(contexto.document)
              ? 'Escreva um resumo (só é opcional em posts de vídeo).'
              : true,
          ),
    }),
    defineField({
      name: 'youtube',
      title: 'Link do YouTube (posts de vídeo)',
      type: 'url',
      description:
        'Cole o endereço do vídeo. O site mostra a miniatura e só carrega o player ao clicar.',
      validation: (regra) => regra.uri({ scheme: ['http', 'https'] }).custom(validarYouTube),
    }),
    defineField({
      name: 'duracaoVideo',
      title: 'Duração do vídeo',
      type: 'string',
      description: 'Opcional. Ex.: 6:40.',
      hidden: ({ document }) => !temVideo(document),
      validation: (regra) => regra.custom(validarDuracao),
    }),
    defineField({
      name: 'corpo',
      title: 'Texto',
      type: 'textoRico',
      validation: (regra) =>
        regra.custom((corpo, contexto) =>
          (!corpo || (corpo as unknown[]).length === 0) && !temVideo(contexto.document)
            ? 'Escreva o texto (só é opcional em posts de vídeo).'
            : true,
        ),
    }),
  ],
  orderings: [
    { title: 'Mais recentes', name: 'dataDesc', by: [{ field: 'data', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'titulo', status: 'statusRevisao', autor: 'autor.nome', youtube: 'youtube' },
    prepare: ({ title, status, autor, youtube }) => {
      const rotulo: Record<string, string> = {
        rascunho: 'Rascunho',
        'em-revisao': 'Em revisão',
        aprovado: 'Aprovado',
      };
      return {
        title,
        subtitle: [rotulo[status as string] ?? status, autor, youtube ? 'vídeo' : undefined]
          .filter(Boolean)
          .join(' · '),
      };
    },
  },
});
