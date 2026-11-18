import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { BlocoTexto } from './sanity.tipos.ts';
import { linkSeguro, montarTexto } from './textoRico.ts';

let n = 0;
const span = (text: string, marks: string[] = []) => ({
  _type: 'span',
  _key: `s${++n}`,
  text,
  marks,
});
const bloco = (
  children: ReturnType<typeof span>[],
  extra: Partial<BlocoTexto> = {},
): BlocoTexto => ({
  _type: 'block',
  _key: `b${++n}`,
  style: 'normal',
  markDefs: [],
  children,
  ...extra,
});

test('parágrafos, títulos e citação viram nós com o tipo certo', () => {
  const nos = montarTexto([
    bloco([span('Abertura')]),
    bloco([span('Um título')], { style: 'h2' }),
    bloco([span('Um subtítulo')], { style: 'h3' }),
    bloco([span('Hoje a salvação entrou nesta casa.')], { style: 'blockquote' }),
  ]);
  assert.deepEqual(
    nos.map((no) => no.tipo),
    ['p', 'h2', 'h3', 'blockquote'],
  );
});

test('negrito, itálico e os dois juntos', () => {
  const [no] = montarTexto([
    bloco([span('a '), span('b', ['strong']), span(' c', ['em']), span('d', ['strong', 'em'])]),
  ]);
  assert.ok(no && 'trechos' in no);
  assert.deepEqual(no.trechos, [
    { texto: 'a ' },
    { texto: 'b', negrito: true },
    { texto: ' c', italico: true },
    { texto: 'd', negrito: true, italico: true },
  ]);
});

test('link: o endereço vem da definição da marca', () => {
  const [no] = montarTexto([
    bloco([span('ver '), span('horários', ['k1'])], {
      markDefs: [{ _key: 'k1', _type: 'link', href: '/horarios' }],
    }),
  ]);
  assert.ok(no && 'trechos' in no);
  assert.deepEqual(no.trechos[1], { texto: 'horários', href: '/horarios' });
});

test('link com esquema perigoso perde o endereço, mas o texto fica', () => {
  const [no] = montarTexto([
    bloco([span('clique', ['k1'])], {
      markDefs: [{ _key: 'k1', _type: 'link', href: 'javascript:alert(1)' }],
    }),
  ]);
  assert.ok(no && 'trechos' in no);
  assert.deepEqual(no.trechos, [{ texto: 'clique' }]);
});

test('linkSeguro aceita só http(s), mailto, tel, caminhos do site e âncoras', () => {
  assert.equal(linkSeguro('https://exemplo.org'), 'https://exemplo.org');
  assert.equal(linkSeguro('mailto:a@b.c'), 'mailto:a@b.c');
  assert.equal(linkSeguro('tel:+5583999999999'), 'tel:+5583999999999');
  assert.equal(linkSeguro('/contato'), '/contato');
  assert.equal(linkSeguro('#topo'), '#topo');
  assert.equal(linkSeguro('//outro-site.com'), undefined);
  assert.equal(linkSeguro('javascript:alert(1)'), undefined);
  assert.equal(linkSeguro('data:text/html,x'), undefined);
  assert.equal(linkSeguro(undefined), undefined);
});

test('itens de lista consecutivos formam uma lista só; trocar o tipo abre outra', () => {
  const nos = montarTexto([
    bloco([span('um')], { listItem: 'bullet' }),
    bloco([span('dois')], { listItem: 'bullet' }),
    bloco([span('primeiro')], { listItem: 'number' }),
    bloco([span('depois')]),
    bloco([span('outro')], { listItem: 'bullet' }),
  ]);
  assert.deepEqual(
    nos.map((no) => no.tipo),
    ['ul', 'ol', 'p', 'ul'],
  );
  const primeira = nos[0];
  assert.ok(primeira && 'itens' in primeira);
  assert.equal(primeira.itens.length, 2);
});

test('blocos vazios e tipos desconhecidos são ignorados', () => {
  const nos = montarTexto([
    bloco([span('   ')]),
    { _type: 'image', _key: 'i1' },
    bloco([span('fica')]),
  ]);
  assert.equal(nos.length, 1);
});

test('estilo desconhecido vira parágrafo; sem conteúdo, lista vazia', () => {
  const [no] = montarTexto([bloco([span('texto')], { style: 'h5' as never })]);
  assert.equal(no?.tipo, 'p');
  assert.deepEqual(montarTexto(undefined), []);
  assert.deepEqual(montarTexto(null), []);
});
