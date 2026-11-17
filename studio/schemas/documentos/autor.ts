import { UserIcon } from '@sanity/icons/User';
import { defineField, defineType } from 'sanity';

/** Quem assina os posts. Sem foto e sem contato: o dataset é público. */
export const autor = defineType({
  name: 'autor',
  title: 'Autor',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'nome',
      title: 'Nome',
      type: 'string',
      validation: (regra) => regra.required().max(80),
    }),
    defineField({
      name: 'funcao',
      title: 'Função',
      type: 'string',
      description: 'Ex.: Pároco, Juventude, Catequese.',
      validation: (regra) => regra.required().max(60),
    }),
  ],
  preview: { select: { title: 'nome', subtitle: 'funcao' } },
});
