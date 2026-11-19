import { defineField, defineType } from 'sanity';
import { validarHora } from '../validacoes';

const DIAS_DA_SEMANA = [
  { title: 'Domingo', value: 0 },
  { title: 'Segunda', value: 1 },
  { title: 'Terça', value: 2 },
  { title: 'Quarta', value: 3 },
  { title: 'Quinta', value: 4 },
  { title: 'Sexta', value: 5 },
  { title: 'Sábado', value: 6 },
];

/** Uma linha da tabela: "Quarta a sexta · 17h". Dias com o mesmo horário ficam juntos. */
export const linhaHorario = defineType({
  name: 'linhaHorario',
  title: 'Linha de horário',
  type: 'object',
  fields: [
    defineField({
      name: 'rotulo',
      title: 'Nome da linha',
      type: 'string',
      description: 'Como aparece no site: "Domingo", "Quarta a sexta".',
      validation: (regra) => regra.required().max(40),
    }),
    defineField({
      name: 'dias',
      title: 'Dias da semana',
      type: 'array',
      of: [{ type: 'number' }],
      description: 'Serve para destacar o "hoje" no site.',
      options: { list: DIAS_DA_SEMANA, layout: 'grid' },
      validation: (regra) => regra.required().min(1).unique(),
    }),
    defineField({
      name: 'horas',
      title: 'Horários',
      type: 'array',
      of: [{ type: 'string' }],
      description:
        'Um por linha, no formato 07:00 ou 17:00. Para um período, 08:00-12:00 (aparece "8h às 12h"). Se não houver horário nesse dia, deixe vazio e escreva "Sem missa" na observação: o dia nunca some da tabela.',
      validation: (regra) =>
        regra.custom((horas) => {
          for (const hora of (horas as string[] | undefined) ?? []) {
            const resultado = validarHora(hora);
            if (resultado !== true) return `${hora}: ${resultado}`;
          }
          return true;
        }),
    }),
    defineField({
      name: 'nota',
      title: 'Observação',
      type: 'string',
      description: 'Ex.: "Missa da comunidade", "Sem missa".',
      validation: (regra) =>
        regra.max(80).custom((nota, contexto) => {
          const horas = (contexto.parent as { horas?: string[] } | undefined)?.horas ?? [];
          return horas.length === 0 && !nota
            ? 'Sem horários? Escreva uma observação, como "Sem missa".'
            : true;
        }),
    }),
  ],
  preview: {
    select: { title: 'rotulo', horas: 'horas', nota: 'nota' },
    prepare: ({ title, horas, nota }) => ({
      title,
      subtitle: [(horas as string[] | undefined)?.join(' · '), nota].filter(Boolean).join(' — '),
    }),
  },
});

/** Lista de linhas de um tipo (Missa, Confissão, Adoração, Secretaria) + observação geral. */
export const grupoHorarios = defineType({
  name: 'grupoHorarios',
  title: 'Grupo de horários',
  type: 'object',
  fields: [
    defineField({
      name: 'linhas',
      title: 'Linhas',
      type: 'array',
      of: [{ type: 'linhaHorario' }],
    }),
    defineField({
      name: 'observacao',
      title: 'Observação geral',
      type: 'text',
      rows: 2,
      description: 'Aparece abaixo da tabela. Ex.: "Em dias de festa os horários podem mudar."',
      validation: (regra) => regra.max(200),
    }),
  ],
});
