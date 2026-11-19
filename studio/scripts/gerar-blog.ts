/**
 * Gera `studio/seed/blog.ndjson` (vídeos do canal da paróquia) para o `sanity dataset import`.
 * Não usa token: o import roda com o seu login do Sanity CLI.
 *
 *   npm run seed:blog -w studio
 *   cd studio && npx sanity dataset import seed/blog.ndjson production --replace
 *
 * `--replace` troca só os documentos com o mesmo _id (`blog-…`).
 */
import { writeFileSync } from 'node:fs';
import { gerarBlog } from '../seed/blog.ts';

const documentos = gerarBlog();
const saida = new URL('../seed/blog.ndjson', import.meta.url);

writeFileSync(saida, documentos.map((documento) => JSON.stringify(documento)).join('\n') + '\n');

console.log(`${documentos.length} documentos gravados em studio/seed/blog.ndjson`);
