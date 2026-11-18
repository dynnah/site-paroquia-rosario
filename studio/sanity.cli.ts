import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'sem-projeto',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  // Studio publicado em https://paroquia-do-rosario.sanity.studio (npm run deploy).
  // O appId é público; evita a pergunta de id do app nos próximos deploys.
  deployment: {
    appId: 'p9bfkppag1vd22v9nozaigfu',
  },
});
