import { HeartIcon } from '@sanity/icons/Heart';
import { defineField, defineType } from 'sanity';
import { campoSlug } from '../campos';

export const sacramento = defineType({
  name: 'sacramento',
  title: 'Sacramento',
  type: 'document',
  icon: HeartIcon,
  fields: [
    defineField({
      name: 'nome',
      title: 'Nome',
      type: 'string',
      description: 'Ex.: Batismo, Primeira Eucaristia, Crisma, Matrimônio.',
      validation: (regra) => regra.required().max(60),
    }),
    campoSlug('nome'),
    defineField({
      name: 'ordem',
      title: 'Posição na lista',
      type: 'number',
      description: 'Número menor aparece primeiro.',
      validation: (regra) => regra.integer().min(0),
    }),
    defineField({
      name: 'resumo',
      title: 'Resumo',
      type: 'text',
      rows: 2,
      description: 'Uma ou duas frases para a lista de sacramentos.',
      validation: (regra) => regra.required().max(200),
    }),
    defineField({
      name: 'sobre',
      title: 'Sobre o sacramento',
      type: 'textoRico',
    }),
    defineField({
      name: 'requisitos',
      title: 'Requisitos',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Um item por linha.',
    }),
    defineField({
      name: 'documentos',
      title: 'Documentos necessários',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Um item por linha.',
    }),
    defineField({
      name: 'proximasTurmas',
      title: 'Próximas turmas',
      type: 'array',
      of: [{ type: 'turma' }],
    }),
    defineField({
      name: 'contato',
      title: 'Contato',
      type: 'string',
      description: 'Só contato institucional, como "secretaria paroquial".',
      validation: (regra) => regra.max(120),
    }),
  ],
  orderings: [{ title: 'Posição', name: 'ordem', by: [{ field: 'ordem', direction: 'asc' }] }],
  preview: { select: { title: 'nome', subtitle: 'resumo' } },
});
