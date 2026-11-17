import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schemas';

// TODO(conta): criar o projeto em sanity.io/manage e preencher
// SANITY_STUDIO_PROJECT_ID em studio/.env (veja studio/.env.example).
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'sem-projeto';
const dataset = process.env.SANITY_STUDIO_DATASET || 'production';

export default defineConfig({
  name: 'rosario',
  title: 'Paróquia Nossa Senhora do Rosário',
  projectId,
  dataset,
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
});
