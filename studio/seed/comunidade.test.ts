import assert from 'node:assert/strict';
import { test } from 'node:test';
import { COMUNIDADE, gerarComunidade } from './comunidade.ts';

const documentos = gerarComunidade();

test('são 13 pastorais, movimentos e grupos, todos com Instagram e botão', () => {
  assert.equal(documentos.length, 13);
  for (const d of documentos) {
    assert.equal(d._type, 'pastoral');
    const link = d.link as { rotulo: string; href: string };
    assert.match(link.href, /^https:\/\/www\.instagram\.com\/[\w.]+\/$/);
    assert.match(String(d.contato), /^Instagram @[\w.]+$/);
  }
});

test('IDs e endereços são únicos, sem ponto no _id e só com letras minúsculas, números e hífen', () => {
  const ids = documentos.map((d) => d._id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.match(id, /^comunidade-[a-z0-9-]+$/);
  const slugs = COMUNIDADE.map((e) => e.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const slug of slugs) assert.match(slug, /^[a-z0-9]+(-[a-z0-9]+)*$/);
});

test('o tipo é válido, há as quatro seções e toda descrição cabe no limite do Studio', () => {
  const tipos = new Set(COMUNIDADE.map((e) => e.tipo));
  assert.deepEqual([...tipos].sort(), ['grupo', 'ministerio', 'movimento', 'pastoral', 'projeto']);
  for (const d of documentos) {
    assert.ok(String(d.descricao).length > 0, `${d._id} sem descrição`);
    assert.ok(String(d.descricao).length <= 250, `${d._id}: descrição acima de 250`);
    assert.ok(String(d.categoria ?? '').length <= 30, `${d._id}: categoria acima de 30`);
  }
});

test('nada de dado pessoal: só o Instagram institucional dos grupos', () => {
  const texto = JSON.stringify(documentos);
  assert.ok(!/\d{4}[- ]?\d{4}/.test(texto), 'parece haver telefone');
  assert.ok(!/@[\w.-]+\.\w{2,}/.test(texto), 'parece haver e-mail');
});
