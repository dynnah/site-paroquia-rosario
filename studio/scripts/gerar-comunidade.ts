/**
 * Gera `studio/seed/comunidade.ndjson` (pastorais, movimentos e grupos reais) para o
 * `sanity dataset import`. Não usa token: o import roda com o seu login do Sanity CLI.
 *
 *   npm run seed:comunidade -w studio
 *   cd studio && npx sanity dataset import seed/comunidade.ndjson production --replace
 *
 * `--replace` troca só os documentos com o mesmo _id (`comunidade-…`), então rodar de novo
 * atualiza o que mudou aqui. Se você já editou um deles no Studio, use `--missing`, que pula
 * os que existem.
 */
import { writeFileSync } from 'node:fs';
import { gerarComunidade } from '../seed/comunidade.ts';

const documentos = gerarComunidade();
const saida = new URL('../seed/comunidade.ndjson', import.meta.url);

writeFileSync(saida, documentos.map((documento) => JSON.stringify(documento)).join('\n') + '\n');

console.log(`${documentos.length} documentos gravados em studio/seed/comunidade.ndjson`);
