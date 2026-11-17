import { StarIcon } from '@sanity/icons/Star';
import { defineField, defineType } from 'sanity';
import { validarMesDia } from '../validacoes';

/** Santo do dia. Só texto: sem imagens de santos baixadas da internet. */
export const santo = defineType({
  name: 'santo',
  title: 'Santo do dia',
  type: 'document',
  icon: StarIcon,
  fields: [
    defineField({
      name: 'dia',
      title: 'Dia da celebração',
      type: 'string',
      description: 'Mês e dia no formato MM-DD. Ex.: 11-17 para 17 de novembro.',
      validation: (regra) => regra.required().custom(validarMesDia),
    }),
    defineField({
      name: 'nome',
      title: 'Nome',
      type: 'string',
      description: 'Ex.: "Santa Isabel".',
      validation: (regra) => regra.required().max(60),
    }),
    defineField({
      name: 'destaque',
      title: 'Complemento em itálico',
      type: 'string',
      description: 'Opcional. Ex.: "da Hungria".',
      validation: (regra) => regra.max(40),
    }),
    defineField({
      name: 'grau',
      title: 'Grau da celebração',
      type: 'string',
      options: {
        list: [
          { title: 'Memória', value: 'memoria' },
          { title: 'Festa', value: 'festa' },
          { title: 'Solenidade', value: 'solenidade' },
        ],
        layout: 'radio',
      },
      initialValue: 'memoria',
      validation: (regra) => regra.required(),
    }),
    defineField({
      name: 'familia',
      title: 'Família',
      type: 'string',
      options: {
        list: [
          { title: 'Franciscana', value: 'franciscana' },
          { title: 'Mariana', value: 'mariana' },
          { title: 'Nenhuma', value: 'nenhuma' },
        ],
        layout: 'radio',
      },
      initialValue: 'nenhuma',
      validation: (regra) => regra.required(),
    }),
    defineField({
      name: 'datasDeVida',
      title: 'Datas de vida',
      type: 'string',
      description: 'Ex.: 1207–1231.',
      validation: (regra) => regra.max(40),
    }),
    defineField({
      name: 'bio',
      title: 'Bio curta',
      type: 'text',
      rows: 3,
      description: 'Duas ou três frases, escritas pela paróquia. Máximo de 320 caracteres.',
      validation: (regra) => regra.required().max(320),
    }),
    defineField({
      name: 'historia',
      title: 'História completa',
      type: 'textoRico',
    }),
  ],
  orderings: [{ title: 'Dia do ano', name: 'dia', by: [{ field: 'dia', direction: 'asc' }] }],
  preview: {
    select: { title: 'nome', dia: 'dia', grau: 'grau' },
    prepare: ({ title, dia, grau }) => ({
      title,
      subtitle: [dia ? `${String(dia).slice(3)}/${String(dia).slice(0, 2)}` : undefined, grau]
        .filter(Boolean)
        .join(' · '),
    }),
  },
});
