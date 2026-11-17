import { defineField, defineType } from 'sanity';
import { ESQUEMAS_LINK } from '../validacoes';

/** Botão ou link com verbo: "Ver horários", "Quero participar". */
export const linkSimples = defineType({
  name: 'linkSimples',
  title: 'Link',
  type: 'object',
  fields: [
    defineField({
      name: 'rotulo',
      title: 'Texto do botão',
      type: 'string',
      description: 'Comece com um verbo: "Quero participar", "Ver horários".',
      validation: (regra) => regra.required().max(40),
    }),
    defineField({
      name: 'href',
      title: 'Endereço',
      type: 'url',
      description: 'Para inscrições, use um link do Google Forms.',
      validation: (regra) => regra.required().uri({ scheme: ESQUEMAS_LINK, allowRelative: true }),
    }),
  ],
  preview: { select: { title: 'rotulo', subtitle: 'href' } },
});
