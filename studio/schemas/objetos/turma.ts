import { defineField, defineType } from 'sanity';
import { ESQUEMAS_LINK } from '../validacoes';

/** Próxima turma ou data de um curso de sacramento. Sem nomes nem contatos de fiéis. */
export const turma = defineType({
  name: 'turma',
  title: 'Turma',
  type: 'object',
  fields: [
    defineField({
      name: 'nome',
      title: 'Nome da turma',
      type: 'string',
      description: 'Ex.: "Curso de batismo de março".',
      validation: (regra) => regra.required().max(80),
    }),
    defineField({ name: 'inicio', title: 'Início', type: 'date', validation: (r) => r.required() }),
    defineField({
      name: 'fim',
      title: 'Fim',
      type: 'date',
      validation: (regra) =>
        regra.custom((fim, contexto) => {
          const inicio = (contexto.parent as { inicio?: string } | undefined)?.inicio;
          return fim && inicio && fim < inicio ? 'O fim não pode ser antes do início.' : true;
        }),
    }),
    defineField({
      name: 'horario',
      title: 'Dia e horário',
      type: 'string',
      description: 'Ex.: "sábados, 15h".',
      validation: (regra) => regra.max(80),
    }),
    defineField({
      name: 'inscricaoUrl',
      title: 'Link de inscrição',
      type: 'url',
      description: 'Link do Google Forms. Nunca guarde inscrições aqui: o dataset é público.',
      validation: (regra) => regra.uri({ scheme: ESQUEMAS_LINK }),
    }),
  ],
  preview: {
    select: { title: 'nome', subtitle: 'inicio' },
  },
});
