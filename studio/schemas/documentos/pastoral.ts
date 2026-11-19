import { UsersIcon } from '@sanity/icons/Users';
import { defineField, defineType } from 'sanity';
import { campoSlug } from '../campos';

export const pastoral = defineType({
  name: 'pastoral',
  title: 'Pastoral, movimento ou grupo',
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
      name: 'tipo',
      title: 'O que é',
      type: 'string',
      description:
        'Define a seção em Nossa Comunidade e a cor do filete no topo do card: pastorais no marrom escuro; os demais num marrom mais claro. Movimento e Grupo aparecem juntos, em "Grupos e movimentos".',
      options: {
        list: [
          { title: 'Pastoral', value: 'pastoral' },
          { title: 'Movimento', value: 'movimento' },
          { title: 'Grupo', value: 'grupo' },
          { title: 'Ministério', value: 'ministerio' },
          { title: 'Projeto', value: 'projeto' },
        ],
        layout: 'radio',
      },
      initialValue: 'pastoral',
      validation: (regra) => regra.required(),
    }),
    defineField({
      name: 'categoria',
      title: 'Categoria (opcional)',
      type: 'string',
      description:
        'Texto pequeno acima do nome. Ex.: "Ministério de música", "Ação social". Se ficar vazio, aparece o tipo.',
      validation: (regra) => regra.max(30),
    }),
    defineField({
      name: 'descricao',
      title: 'O que faz (opcional)',
      type: 'text',
      rows: 3,
      description: 'Duas ou três frases. Pode ficar vazio até o grupo mandar o texto.',
      validation: (regra) => regra.max(250),
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
      title: 'Sobre (página própria)',
      type: 'textoRico',
    }),
  ],
  orderings: [{ title: 'Nome', name: 'nome', by: [{ field: 'nome', direction: 'asc' }] }],
  preview: { select: { title: 'nome', subtitle: 'categoria' } },
});
