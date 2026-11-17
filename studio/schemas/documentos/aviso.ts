import { BellIcon } from '@sanity/icons/Bell';
import { defineField, defineType } from 'sanity';

/** Faixa de aviso no topo do site. Aparece entre `inicio` e `fim`. */
export const aviso = defineType({
  name: 'aviso',
  title: 'Aviso',
  type: 'document',
  icon: BellIcon,
  fields: [
    defineField({
      name: 'titulo',
      title: 'Título',
      type: 'string',
      validation: (regra) => regra.required().max(80),
    }),
    defineField({
      name: 'texto',
      title: 'Texto curto',
      type: 'text',
      rows: 2,
      description: 'Uma frase. Nada de parágrafos longos.',
      validation: (regra) => regra.max(160),
    }),
    defineField({
      name: 'tipo',
      title: 'Tipo',
      type: 'string',
      description:
        'Informativo: avisos da semana. Festa: novena e solenidades (um por vez). Mudança: horário alterado ou cancelado.',
      options: {
        list: [
          { title: 'Informativo', value: 'informativo' },
          { title: 'Festa', value: 'festa' },
          { title: 'Mudança de horário', value: 'mudanca' },
        ],
        layout: 'radio',
      },
      initialValue: 'informativo',
      validation: (regra) => regra.required(),
    }),
    defineField({
      name: 'inicio',
      title: 'Começa a aparecer em',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (regra) => regra.required(),
    }),
    defineField({
      name: 'fim',
      title: 'Deixa de aparecer em',
      type: 'datetime',
      description: 'Sem data final, o aviso fica até você apagar.',
      validation: (regra) =>
        regra.custom((fim, contexto) => {
          const inicio = (contexto.document as { inicio?: string } | undefined)?.inicio;
          return fim && inicio && fim <= inicio ? 'O fim precisa ser depois do início.' : true;
        }),
    }),
    defineField({
      name: 'link',
      title: 'Link (opcional)',
      type: 'linkSimples',
    }),
  ],
  orderings: [
    { title: 'Mais recentes', name: 'inicioDesc', by: [{ field: 'inicio', direction: 'desc' }] },
  ],
  preview: { select: { title: 'titulo', subtitle: 'tipo' } },
});
