import { ClockIcon } from '@sanity/icons/Clock';
import { defineField, defineType } from 'sanity';

/** Documento único: tabelas de horários da semana. */
export const horarios = defineType({
  name: 'horarios',
  title: 'Horários',
  type: 'document',
  icon: ClockIcon,
  fields: [
    defineField({
      name: 'missa',
      title: 'Santa Missa',
      type: 'grupoHorarios',
      description: 'Todos os dias da semana devem aparecer, mesmo os sem missa.',
    }),
    defineField({ name: 'confissao', title: 'Confissões', type: 'grupoHorarios' }),
    defineField({ name: 'adoracao', title: 'Adoração', type: 'grupoHorarios' }),
    defineField({ name: 'rosario', title: 'Santo Rosário', type: 'grupoHorarios' }),
    defineField({ name: 'secretaria', title: 'Secretaria', type: 'grupoHorarios' }),
  ],
  preview: { prepare: () => ({ title: 'Horários' }) },
});
