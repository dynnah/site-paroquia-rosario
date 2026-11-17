import assert from 'node:assert/strict';
import { test } from 'node:test';
import { estaAtivo } from './navegacao.ts';

test('o início só está ativo em "/"', () => {
  assert.equal(estaAtivo('/', '/'), true);
  assert.equal(estaAtivo('/', '/blog'), false);
});

test('seções incluem as próprias subpáginas', () => {
  assert.equal(estaAtivo('/blog', '/blog'), true);
  assert.equal(estaAtivo('/blog', '/blog/'), true);
  assert.equal(estaAtivo('/blog', '/blog/coluna/juventude'), true);
  assert.equal(estaAtivo('/blog', '/blog-antigo'), false);
  assert.equal(estaAtivo('/agenda', '/blog'), false);
});
