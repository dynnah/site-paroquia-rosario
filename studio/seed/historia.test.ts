import assert from 'node:assert/strict';
import { test } from 'node:test';
import { slugificar } from '../schemas/validacoes.ts';
import {
  ARTIGO_WIKIPEDIA,
  CREDITO_HISTORIA,
  gerarHistoria,
  LICENCA_CC_BY_SA,
  PARAGRAFOS_HISTORIA,
} from './historia.ts';

const [pagina] = gerarHistoria();

test('um documento "Nossa história" com ID fixo, sem ponto e slug no formato do Studio', () => {
  assert.equal(gerarHistoria().length, 1);
  assert.equal(pagina._type, 'pagina');
  assert.equal(pagina._id, 'pagina-nossa-historia');
  assert.ok(!pagina._id.includes('.'));
  const slug = (pagina.slug as { current: string }).current;
  assert.equal(slug, 'nossa-historia');
  assert.equal(slug, slugificar(slug));
  assert.ok(String(pagina.titulo).length <= 90);
});

test('texto real: sem marcador [EXEMPLO] e sem números de nota de rodapé', () => {
  const texto = PARAGRAFOS_HISTORIA.join('\n');
  assert.ok(!texto.includes('[EXEMPLO]'));
  assert.doesNotMatch(texto, /\[\s*\d+\s*\]/);
});

test('sem espaço duplo nem espaço antes de vírgula, ponto ou ponto e vírgula', () => {
  for (const paragrafo of PARAGRAFOS_HISTORIA) {
    assert.doesNotMatch(paragrafo, / {2,}/);
    assert.doesNotMatch(paragrafo, / [,.;]/);
    assert.equal(paragrafo, paragrafo.trim());
  }
});

test('um bloco para cada parágrafo mais a linha de crédito, com chaves únicas', () => {
  const blocos = pagina.corpo as { _key: string; style: string; children: { _key: string }[] }[];
  assert.equal(blocos.length, PARAGRAFOS_HISTORIA.length + 1);
  const chaves = blocos.flatMap((b) => [b._key, ...b.children.map((c) => c._key)]);
  assert.equal(new Set(chaves).size, chaves.length);
  for (const b of blocos) assert.equal(b.style, 'normal');
});

test('os fatos da campanha estão no texto (1927, 1928, 1929)', () => {
  const texto = PARAGRAFOS_HISTORIA.join(' ');
  for (const trecho of [
    '29 de junho de 1927',
    '1º de novembro de 1928',
    '2 de fevereiro de 1929',
  ]) {
    assert.ok(texto.includes(trecho), trecho);
  }
});

test('aspas de abertura e de fechamento em igual número, em cada parágrafo', () => {
  for (const paragrafo of PARAGRAFOS_HISTORIA) {
    assert.equal(paragrafo.split('“').length, paragrafo.split('”').length, paragrafo.slice(0, 40));
    assert.ok(!paragrafo.includes('"'), 'aspas retas sobraram');
  }
});

test('a página termina com o crédito da Wikipédia e o link da licença CC BY-SA', () => {
  const blocos = pagina.corpo as {
    markDefs: { _key: string; _type: string; href: string }[];
    children: { text: string; marks: string[] }[];
  }[];
  const credito = blocos[blocos.length - 1];
  assert.deepEqual(
    credito.markDefs.map((d) => [d._type, d.href]),
    [
      ['link', ARTIGO_WIKIPEDIA],
      ['link', LICENCA_CC_BY_SA],
    ],
  );
  for (const d of credito.markDefs) assert.match(d.href, /^https:\/\//);
  // cada link marca o trecho certo, e os demais trechos ficam sem marca
  const comLink = credito.children.filter((c) => c.marks.length > 0).map((c) => c.text);
  assert.deepEqual(comLink, [
    'Church and Convent of Our Lady of the Rosary (João Pessoa)',
    'CC BY-SA 4.0',
  ]);
  for (const c of credito.children) {
    for (const marca of c.marks) assert.ok(credito.markDefs.some((d) => d._key === marca));
  }
  assert.equal(
    CREDITO_HISTORIA.map((t) => t.texto)
      .join('')
      .includes('CC BY-SA 4.0'),
    true,
  );
});
