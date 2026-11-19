import assert from 'node:assert/strict';
import { test } from 'node:test';
import { extrairIdYouTube, validarDuracao, validarYouTube } from '../schemas/validacoes.ts';
import { gerarBlog, VIDEOS } from './blog.ts';

const documentos = gerarBlog();
const posts = documentos.filter((d) => d._type === 'post');

test('um autor (o canal) e um post para cada vídeo', () => {
  assert.equal(documentos.filter((d) => d._type === 'autor').length, 1);
  assert.equal(posts.length, 4);
  const autor = documentos.find((d) => d._type === 'autor')!;
  for (const p of posts) assert.equal((p.autor as { _ref: string })._ref, autor._id);
});

test('IDs e endereços são únicos, sem ponto no _id', () => {
  const ids = documentos.map((d) => d._id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.ok(!id.includes('.'), id);
  const slugs = VIDEOS.map((v) => v.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const slug of slugs) assert.match(slug, /^[a-z0-9]+(-[a-z0-9]+)*$/);
});

test('link, duração, título e data respeitam as regras do Studio', () => {
  for (const p of posts) {
    assert.equal(validarYouTube(String(p.youtube)), true, p._id);
    assert.ok(extrairIdYouTube(String(p.youtube)), p._id);
    assert.equal(validarDuracao(String(p.duracaoVideo)), true, p._id);
    assert.ok(String(p.titulo).length <= 120, p._id);
    assert.equal(p.statusRevisao, 'aprovado');
    assert.ok(!Number.isNaN(Date.parse(String(p.data))), p._id);
    assert.ok(Date.parse(String(p.data)) < Date.now(), `${p._id}: data no futuro esconde o post`);
  }
});

test('coluna "outra" sempre traz o nome da coluna', () => {
  for (const p of posts) {
    if (p.coluna === 'outra') assert.ok(String(p.colunaNome ?? '').length > 0, p._id);
  }
});
