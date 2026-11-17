import { defineArrayMember, defineField, defineType } from 'sanity';
import { ESQUEMAS_LINK } from '../validacoes';

/**
 * Texto formatado (Portable Text) para posts, páginas e descrições.
 * Sem título de nível 1 (a página já tem o <h1>) e sem imagens: o dataset do
 * plano Free é público e as fotos entram só pela Fase 6.
 */
export const textoRico = defineType({
  name: 'textoRico',
  title: 'Texto',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Parágrafo', value: 'normal' },
        { title: 'Título', value: 'h2' },
        { title: 'Subtítulo', value: 'h3' },
        { title: 'Citação', value: 'blockquote' },
      ],
      lists: [
        { title: 'Lista com marcadores', value: 'bullet' },
        { title: 'Lista numerada', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Negrito', value: 'strong' },
          { title: 'Itálico', value: 'em' },
        ],
        annotations: [
          defineArrayMember({
            name: 'link',
            title: 'Link',
            type: 'object',
            fields: [
              defineField({
                name: 'href',
                title: 'Endereço',
                type: 'url',
                validation: (regra) =>
                  regra.required().uri({ scheme: ESQUEMAS_LINK, allowRelative: true }),
              }),
            ],
          }),
        ],
      },
    }),
  ],
});
