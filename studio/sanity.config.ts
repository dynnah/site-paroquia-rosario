import { ptBRLocale } from '@sanity/locale-pt-br';
import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { estrutura } from './estrutura';
import { schemaTypes } from './schemas';
import { ehSingleton } from './singletons';

// TODO(conta): criar o projeto em sanity.io/manage e preencher
// SANITY_STUDIO_PROJECT_ID em studio/.env (veja studio/.env.example).
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'sem-projeto';
const dataset = process.env.SANITY_STUDIO_DATASET || 'production';

export default defineConfig({
  name: 'rosario',
  title: 'Paróquia Nossa Senhora do Rosário',
  projectId,
  dataset,
  plugins: [ptBRLocale(), structureTool({ structure: estrutura }), visionTool()],
  schema: {
    types: schemaTypes,
    // Documentos únicos não aparecem em "Novo documento".
    templates: (modelos) => modelos.filter(({ schemaType }) => !ehSingleton(schemaType)),
  },
  document: {
    // Documentos únicos podem ser editados e publicados, mas não duplicados nem apagados.
    actions: (acoes, { schemaType }) =>
      ehSingleton(schemaType)
        ? acoes.filter(
            ({ action }) => action && ['publish', 'discardChanges', 'restore'].includes(action),
          )
        : acoes,
  },
});
