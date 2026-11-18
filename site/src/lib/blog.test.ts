import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FILTROS_BLOG, SLUGS_RESERVADOS_BLOG, hrefBlog, propsCardPost } from './blog.ts';
import type { PostResumo } from './sanity.tipos.ts';

const texto: PostResumo = {
  _id: 'p1',
  slug: 'palavra-do-paroco',
  coluna: 'paroco',
  colunaNome: 'Palavra do Pároco',
  titulo: 'Uma reflexão',
  resumo: 'Resumo curto.',
  autor: { nome: 'Autor de exemplo', funcao: 'Pároco' },
  data: '2026-11-13T12:00:00.000Z',
  palavras: 900,
};

test('hrefBlog: primeira página sem sufixo, as demais em /pagina/N', () => {
  assert.equal(hrefBlog('tudo'), '/blog');
  assert.equal(hrefBlog('tudo', 2), '/blog/pagina/2');
  assert.equal(hrefBlog('paroco'), '/blog/coluna/paroco');
  assert.equal(hrefBlog('juventude', 3), '/blog/coluna/juventude/pagina/3');
  assert.equal(hrefBlog('videos'), '/blog/videos');
  assert.equal(hrefBlog('videos', 2), '/blog/videos/pagina/2');
});

test('os filtros seguem o plano: Tudo · Palavra do Pároco · Juventude · Vídeos', () => {
  assert.deepEqual(
    FILTROS_BLOG.map((f) => f.rotulo),
    ['Tudo', 'Palavra do Pároco', 'Juventude', 'Vídeos'],
  );
});

test('os segmentos fixos das rotas não podem ser slug de post', () => {
  for (const segmento of ['coluna', 'videos', 'pagina']) {
    assert.ok(SLUGS_RESERVADOS_BLOG.includes(segmento));
  }
});

test('post de texto: tempo de leitura e nada de vídeo', () => {
  const card = propsCardPost(texto);
  assert.equal(card.href, '/blog/palavra-do-paroco');
  assert.equal(card.coluna, 'Palavra do Pároco');
  assert.equal(card.colunaTipo, 'paroco');
  assert.equal(card.autor, 'Autor de exemplo');
  assert.equal(card.minutosLeitura, 5);
  assert.equal(card.video, undefined);
});

test('post de vídeo: traz o id do YouTube e a duração, sem tempo de leitura', () => {
  const card = propsCardPost({
    ...texto,
    youtube: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    duracaoVideo: '6:40',
  });
  assert.deepEqual(card.video, { id: 'aqz-KE-bpKQ', duracao: '6:40' });
  assert.equal(card.minutosLeitura, undefined);
});

test('link do YouTube inválido não quebra: o post é tratado como texto', () => {
  const card = propsCardPost({ ...texto, youtube: 'https://exemplo.com/video' });
  assert.equal(card.video, undefined);
  assert.equal(card.minutosLeitura, 5);
});
