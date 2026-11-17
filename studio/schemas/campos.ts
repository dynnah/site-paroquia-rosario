import { defineField } from 'sanity';
import { slugificar } from './validacoes';

/** Campo `slug` padrão: gerado do título, sem acentos. */
export function campoSlug(origem = 'titulo') {
  return defineField({
    name: 'slug',
    title: 'Endereço da página',
    type: 'slug',
    description:
      'Clique em "Gerar" para criar a partir do título. É a parte final do endereço; evite mudar depois de publicar.',
    options: { source: origem, maxLength: 80, slugify: slugificar },
    validation: (regra) => regra.required().error('Gere o endereço da página.'),
  });
}
