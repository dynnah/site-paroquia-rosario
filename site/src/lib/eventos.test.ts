import assert from 'node:assert/strict';
import { test } from 'node:test';
import { jaAconteceu, propsCardEvento, quandoAcontece } from './eventos.ts';
import type { Evento } from './sanity.tipos.ts';

// 28 de novembro de 2026 é sábado; 20h UTC = 17h em São Paulo.
const festa: Evento = {
  _id: 'e1',
  slug: 'festa-da-padroeira',
  titulo: 'Festa de Nossa Senhora',
  destaque: 'do Rosário',
  inicio: '2026-11-28T20:00:00.000Z',
  local: 'Matriz',
  categoria: 'festa',
};

test('props do card: dia da semana + categoria, hora + local, link da agenda', () => {
  assert.deepEqual(propsCardEvento(festa), {
    href: '/agenda/festa-da-padroeira',
    data: '2026-11-28T20:00:00.000Z',
    sobrelinha: 'Sábado · Festa',
    titulo: 'Festa de Nossa Senhora',
    destaque: 'do Rosário',
    meta: '17h · Matriz',
    variante: 'festa',
  });
});

test('evento comum não ganha rótulo de categoria e sem local mostra só a hora', () => {
  const card = propsCardEvento({ ...festa, categoria: 'padrao', local: undefined });
  assert.equal(card.sobrelinha, 'Sábado');
  assert.equal(card.meta, '17h');
  assert.equal(card.variante, 'padrao');
});

test('evento franciscano', () => {
  assert.equal(
    propsCardEvento({ ...festa, categoria: 'franciscano' }).sobrelinha,
    'Sábado · Franciscano',
  );
});

test('quandoAcontece: dia por extenso e hora; com fim no mesmo dia, mostra o intervalo', () => {
  assert.equal(quandoAcontece(festa), 'Sábado, 28 de novembro · 17h');
  assert.equal(
    quandoAcontece({ ...festa, fim: '2026-11-28T22:00:00.000Z' }),
    'Sábado, 28 de novembro · 17h às 19h',
  );
  // termina no dia seguinte: não repete "às"
  assert.equal(
    quandoAcontece({ ...festa, fim: '2026-11-29T22:00:00.000Z' }),
    'Sábado, 28 de novembro · 17h',
  );
});

test('jaAconteceu usa o fim, se houver, e senão o início', () => {
  const durante = new Date('2026-11-28T21:00:00Z');
  assert.equal(jaAconteceu(festa, durante), true);
  assert.equal(jaAconteceu({ ...festa, fim: '2026-11-28T22:00:00.000Z' }, durante), false);
  assert.equal(jaAconteceu(festa, new Date('2026-11-20T12:00:00Z')), false);
});
