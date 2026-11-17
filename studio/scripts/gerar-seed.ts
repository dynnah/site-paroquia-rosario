/**
 * Gera `studio/seed/exemplos.ndjson` para o `sanity dataset import`.
 * Não usa token: o import roda com o seu login do Sanity CLI (`npx sanity login`).
 *
 *   npm run seed:gerar -w studio
 *   cd studio && npx sanity dataset import seed/exemplos.ndjson production --missing
 *
 * `--missing` pula documentos que já existem, então rodar de novo (ou depois de
 * preencher as configurações reais) não sobrescreve nada.
 */
import { writeFileSync } from 'node:fs';
import { gerarDocumentos } from '../seed/exemplos.ts';

const documentos = gerarDocumentos();
const saida = new URL('../seed/exemplos.ndjson', import.meta.url);

writeFileSync(saida, documentos.map((documento) => JSON.stringify(documento)).join('\n') + '\n');

console.log(`${documentos.length} documentos de exemplo gravados em studio/seed/exemplos.ndjson`);
console.log('Para importar:');
console.log('  cd studio && npx sanity dataset import seed/exemplos.ndjson production --missing');
