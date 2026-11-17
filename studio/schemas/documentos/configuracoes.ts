import { CogIcon } from '@sanity/icons/Cog';
import { defineField, defineType } from 'sanity';
import { validarInstagram, validarWhatsApp } from '../validacoes';

/** Documento único: dados da paróquia usados no cabeçalho, rodapé e contato. */
export const configuracoes = defineType({
  name: 'configuracoes',
  title: 'Configurações da paróquia',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({
      name: 'nome',
      title: 'Nome da paróquia',
      type: 'string',
      validation: (regra) => regra.required().max(80),
    }),
    defineField({
      name: 'assinatura',
      title: 'Assinatura ao lado do logo',
      type: 'string',
      description: 'Texto curto. Ex.: "Igreja do Rosário".',
      validation: (regra) => regra.max(40),
    }),
    defineField({
      name: 'endereco',
      title: 'Endereço',
      type: 'object',
      options: { columns: 2 },
      fields: [
        defineField({ name: 'rua', title: 'Rua e número', type: 'string' }),
        defineField({ name: 'bairro', title: 'Bairro', type: 'string' }),
        defineField({ name: 'cidade', title: 'Cidade', type: 'string' }),
        defineField({
          name: 'uf',
          title: 'UF',
          type: 'string',
          validation: (regra) => regra.length(2).uppercase(),
        }),
      ],
    }),
    defineField({
      name: 'mapaUrl',
      title: 'Link do Google Maps',
      type: 'url',
      description: 'Abra o local no Google Maps, clique em Compartilhar e cole o link aqui.',
      validation: (regra) => regra.uri({ scheme: ['https'] }),
    }),
    defineField({
      name: 'telefone',
      title: 'Telefone da secretaria',
      type: 'string',
      description: 'Apenas o telefone institucional, com DDD. Ex.: (83) 3222-0000.',
      validation: (regra) =>
        regra
          .regex(/^[\d\s()+-]{8,20}$/, { name: 'telefone', invert: false })
          .error('Use só números, espaços, parênteses e hífen.'),
    }),
    defineField({
      name: 'whatsapp',
      title: 'WhatsApp da secretaria',
      type: 'string',
      description: 'Somente dígitos, com 55 e o DDD. Exemplo: 5583999999999.',
      validation: (regra) => regra.custom(validarWhatsApp),
    }),
    defineField({
      name: 'email',
      title: 'E-mail da secretaria',
      type: 'string',
      validation: (regra) => regra.email(),
    }),
    defineField({
      name: 'instagram',
      title: 'Instagram',
      type: 'string',
      description: 'Só o nome de usuário. Ex.: paroquiadorosariojp.',
      validation: (regra) => regra.custom(validarInstagram),
    }),
    defineField({
      name: 'youtube',
      title: 'Canal do YouTube',
      type: 'url',
      validation: (regra) => regra.uri({ scheme: ['https'] }),
    }),
    defineField({
      name: 'pixChave',
      title: 'Chave Pix',
      type: 'string',
      description: 'A chave oficial da paróquia. Ela fica pública no site.',
      validation: (regra) => regra.max(140),
    }),
    defineField({
      name: 'pixTitular',
      title: 'Titular do Pix',
      type: 'string',
      description: 'Nome que aparece ao pagar, para quem doa conferir.',
      validation: (regra) => regra.max(80),
    }),
  ],
  preview: {
    select: { title: 'nome' },
    prepare: ({ title }) => ({ title: title ?? 'Configurações' }),
  },
});
