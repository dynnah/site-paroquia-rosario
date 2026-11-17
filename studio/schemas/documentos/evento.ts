import { CalendarIcon } from '@sanity/icons/Calendar';
import { defineField, defineType } from 'sanity';
import { campoSlug } from '../campos';
import { ESQUEMAS_LINK } from '../validacoes';

export const evento = defineType({
  name: 'evento',
  title: 'Evento',
  type: 'document',
  icon: CalendarIcon,
  fields: [
    defineField({
      name: 'titulo',
      title: 'Título',
      type: 'string',
      validation: (regra) => regra.required().max(90),
    }),
    defineField({
      name: 'destaque',
      title: 'Parte do título em itálico',
      type: 'string',
      description:
        'Opcional. Ex.: no título "Festa de Nossa Senhora do Rosário", destaque "do Rosário".',
      validation: (regra) =>
        regra.max(40).custom((destaque, contexto) => {
          const titulo = (contexto.document as { titulo?: string } | undefined)?.titulo ?? '';
          return destaque && !titulo.includes(destaque)
            ? 'O destaque precisa ser um trecho do título.'
            : true;
        }),
    }),
    campoSlug(),
    defineField({
      name: 'inicio',
      title: 'Data e hora',
      type: 'datetime',
      description: 'Horário de Brasília.',
      validation: (regra) => regra.required(),
    }),
    defineField({
      name: 'fim',
      title: 'Término (opcional)',
      type: 'datetime',
      validation: (regra) =>
        regra.custom((fim, contexto) => {
          const inicio = (contexto.document as { inicio?: string } | undefined)?.inicio;
          return fim && inicio && fim <= inicio ? 'O término precisa ser depois do início.' : true;
        }),
    }),
    defineField({
      name: 'local',
      title: 'Local',
      type: 'string',
      description: 'Ex.: "Igreja Matriz", "Salão paroquial".',
      validation: (regra) => regra.max(100),
    }),
    defineField({
      name: 'categoria',
      title: 'Categoria',
      type: 'string',
      description: 'Festa: solenidades e padroeira. Franciscano: datas dos frades.',
      options: {
        list: [
          { title: 'Padrão', value: 'padrao' },
          { title: 'Festa', value: 'festa' },
          { title: 'Franciscano', value: 'franciscano' },
        ],
        layout: 'radio',
      },
      initialValue: 'padrao',
      validation: (regra) => regra.required(),
    }),
    defineField({
      name: 'descricao',
      title: 'Descrição',
      type: 'textoRico',
    }),
    defineField({
      name: 'inscricaoUrl',
      title: 'Link de inscrição',
      type: 'url',
      description: 'Link do Google Forms. Nunca guarde inscrições aqui: o dataset é público.',
      validation: (regra) => regra.uri({ scheme: ESQUEMAS_LINK }),
    }),
  ],
  orderings: [
    {
      title: 'Data (mais próximos)',
      name: 'inicioAsc',
      by: [{ field: 'inicio', direction: 'asc' }],
    },
    {
      title: 'Data (mais distantes)',
      name: 'inicioDesc',
      by: [{ field: 'inicio', direction: 'desc' }],
    },
  ],
  preview: {
    select: { title: 'titulo', inicio: 'inicio', local: 'local' },
    prepare: ({ title, inicio, local }) => ({
      title,
      subtitle: [
        inicio
          ? new Date(inicio).toLocaleString('pt-BR', {
              dateStyle: 'short',
              timeStyle: 'short',
              timeZone: 'America/Sao_Paulo',
            })
          : 'sem data',
        local,
      ]
        .filter(Boolean)
        .join(' · '),
    }),
  },
});
