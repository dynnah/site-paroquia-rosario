import { UsersIcon } from '@sanity/icons/Users';
import { defineField, defineType } from 'sanity';
import { campoSlug } from '../campos';

export const pastoral = defineType({
  name: 'pastoral',
  title: 'Pastoral ou movimento',
  type: 'document',
  icon: UsersIcon,
  fields: [
    defineField({
      name: 'nome',
      title: 'Nome',
      type: 'string',
      validation: (regra) => regra.required().max(80),
    }),
    campoSlug('nome'),
    defineField({
      name: 'familia',
      title: 'Família',
      type: 'string',
      description: 'Define a cor do filete no topo do card.',
      options: {
        list: [
          { title: 'Paroquial', value: 'paroquial' },
          { title: 'Mariana', value: 'mariano' },
          { title: 'Franciscana', value: 'franciscano' },
          { title: 'Ação social', value: 'social' },
        ],
        layout: 'radio',
      },
      initialValue: 'paroquial',
      validation: (regra) => regra.required(),
    }),
    defineField({
      name: 'categoria',
      title: 'Categoria',
      type: 'string',
      description: 'Texto pequeno acima do nome. Ex.: "Movimento", "Ação social", "Formação".',
      validation: (regra) => regra.required().max(30),
    }),
    defineField({
      name: 'descricao',
      title: 'O que faz',
      type: 'text',
      rows: 3,
      description: 'Uma ou duas frases.',
      validation: (regra) => regra.required().max(200),
    }),
    defineField({
      name: 'encontros',
      title: 'Quando se reúne',
      type: 'string',
      description: 'Ex.: "sábados, 19h".',
      validation: (regra) => regra.max(100),
    }),
    defineField({
      name: 'contato',
      title: 'Contato',
      type: 'string',
      description:
        'Só contato institucional (Instagram ou WhatsApp da pastoral, secretaria). Não coloque telefone ou e-mail pessoal: este conteúdo é público.',
      validation: (regra) => regra.max(100),
    }),
    defineField({
      name: 'responsavel',
      title: 'Responsável (só o nome)',
      type: 'string',
      description: 'Apenas o nome, com a autorização da pessoa.',
      validation: (regra) => regra.max(80),
    }),
    defineField({
      name: 'link',
      title: 'Botão de ação',
      type: 'linkSimples',
      description: 'Ex.: "Quero participar" apontando para um Google Forms.',
    }),
    defineField({
      name: 'sobre',
      title: 'Sobre a pastoral (página própria)',
      type: 'textoRico',
    }),
  ],
  orderings: [{ title: 'Nome', name: 'nome', by: [{ field: 'nome', direction: 'asc' }] }],
  preview: { select: { title: 'nome', subtitle: 'categoria' } },
});
