import { DocumentIcon } from '@sanity/icons/Document';
import { defineField, defineType } from 'sanity';
import { campoSlug } from '../campos';

/** Páginas de texto: Nossa história, Contribua etc. */
export const pagina = defineType({
  name: 'pagina',
  title: 'Página de texto',
  type: 'document',
  icon: DocumentIcon,
  fields: [
    defineField({
      name: 'titulo',
      title: 'Título',
      type: 'string',
      validation: (regra) => regra.required().max(90),
    }),
    campoSlug(),
    defineField({
      name: 'resumo',
      title: 'Resumo para buscadores e redes sociais',
      type: 'text',
      rows: 2,
      description: 'Opcional. Máximo de 160 caracteres.',
      validation: (regra) => regra.max(160),
    }),
    defineField({
      name: 'corpo',
      title: 'Texto',
      type: 'textoRico',
      validation: (regra) => regra.required(),
    }),
  ],
  preview: { select: { title: 'titulo', subtitle: 'slug.current' } },
});
