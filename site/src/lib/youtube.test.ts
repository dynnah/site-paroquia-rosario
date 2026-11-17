import assert from 'node:assert/strict';
import { test } from 'node:test';
import { extrairIdYouTube, miniaturaYouTube, urlPlayerYouTube } from './youtube.ts';

const ID = 'dQw4w9WgXcQ';

test('extrai o ID dos formatos comuns de link', () => {
  const links = [
    `https://www.youtube.com/watch?v=${ID}`,
    `https://youtube.com/watch?v=${ID}&t=42s`,
    `https://m.youtube.com/watch?v=${ID}`,
    `https://youtu.be/${ID}`,
    `https://youtu.be/${ID}?si=abc`,
    `https://www.youtube.com/embed/${ID}`,
    `https://www.youtube-nocookie.com/embed/${ID}`,
    `https://www.youtube.com/shorts/${ID}`,
    `https://www.youtube.com/live/${ID}`,
    `youtube.com/watch?v=${ID}`,
    ID,
  ];
  for (const link of links) {
    assert.equal(extrairIdYouTube(link), ID, link);
  }
});

test('recusa o que não é vídeo do YouTube', () => {
  assert.equal(extrairIdYouTube(''), null);
  assert.equal(extrairIdYouTube('https://example.com/watch?v=' + ID), null);
  assert.equal(extrairIdYouTube('https://www.youtube.com/watch?v=curto'), null);
  assert.equal(extrairIdYouTube('https://www.youtube.com/@paroquia'), null);
  assert.equal(extrairIdYouTube('não é um link'), null);
});

test('monta miniatura e player sem cookies', () => {
  assert.equal(miniaturaYouTube(ID), `https://i.ytimg.com/vi/${ID}/hqdefault.jpg`);
  assert.match(
    urlPlayerYouTube(ID),
    /^https:\/\/www\.youtube-nocookie\.com\/embed\/dQw4w9WgXcQ\?autoplay=1/,
  );
});
