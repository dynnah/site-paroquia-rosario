/**
 * Gera `studio/seed/historia.ndjson` (texto da página "Nossa história") para o `sanity dataset import`.
 * Não usa token: o import roda com o seu login do Sanity CLI.
 *
 *   npm run seed:historia -w studio
 *   cd studio && npx sanity dataset import seed/historia.ndjson production --replace
 *
 * `--replace` troca só o documento com o mesmo _id (`pagina-nossa-historia`).
 */
import { writeFileSync } from 'node:fs';
import { gerarHistoria } from '../seed/historia.ts';

const documentos = gerarHistoria();
const saida = new URL('../seed/historia.ndjson', import.meta.url);

writeFileSync(saida, documentos.map((documento) => JSON.stringify(documento)).join('\n') + '\n');

console.log(`${documentos.length} documento gravado em studio/seed/historia.ndjson`);
