/**
 * Gera `studio/seed/agenda.ndjson` (eventos da agenda) para o `sanity dataset import`.
 * Não usa token: o import roda com o seu login do Sanity CLI.
 *
 *   npm run seed:agenda -w studio
 *   cd studio && npx sanity dataset import seed/agenda.ndjson production --replace
 */
import { writeFileSync } from 'node:fs';
import { gerarAgenda } from '../seed/agenda.ts';

const documentos = gerarAgenda();
const saida = new URL('../seed/agenda.ndjson', import.meta.url);

writeFileSync(saida, documentos.map((documento) => JSON.stringify(documento)).join('\n') + '\n');

console.log(`${documentos.length} documentos gravados em studio/seed/agenda.ndjson`);
