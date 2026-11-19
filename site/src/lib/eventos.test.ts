import assert from 'node:assert/strict';
import { test } from 'node:test';
import { jaAconteceu, propsCardEvento, quandoAcontece, separarDestaque } from './eventos.ts';
import type { Evento } from './sanity.tipos.ts';

// 28 de novembro de 2026 é sábado; 20h UTC = 17h em São Paulo.
const festa: Evento = {
  _id: 'e1',
  slug: 'festa-da-padroeira',
  titulo: 'Festa de Nossa Senhora do Rosário',
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

// ── sem horário e períodos ──────────────────────────────────────────────────────
// 2027-06-01 00h em São Paulo = 03h UTC; o término é 13/06, 23h59 = 14/06 02h59 UTC.
const trezena: Evento = {
  _id: 'e2',
  slug: 'trezena',
  titulo: 'Trezena de Santo Antônio',
  inicio: '2027-06-01T03:00:00.000Z',
  fim: '2027-06-14T02:59:00.000Z',
  semHorario: true,
  categoria: 'festa',
};

test('sem horário, o card não mostra hora; em vários dias, mostra até quando', () => {
  assert.equal(propsCardEvento(trezena).meta, 'até 13 de junho');
  assert.equal(propsCardEvento({ ...trezena, local: 'Matriz' }).meta, 'até 13 de junho · Matriz');
  assert.equal(propsCardEvento({ ...trezena, fim: undefined, local: 'Matriz' }).meta, 'Matriz');
  // com horário, nada muda: a hora continua no card
  assert.equal(propsCardEvento(festa).meta, '17h · Matriz');
});

test('quandoAcontece sem horário: o período ("1 a 13 de junho") ou o dia, sem hora', () => {
  assert.equal(quandoAcontece(trezena), '1 a 13 de junho');
  assert.equal(
    quandoAcontece({
      ...trezena,
      inicio: '2027-09-28T03:00:00.000Z',
      fim: '2027-10-07T02:59:00.000Z',
    }),
    '28 de setembro a 6 de outubro',
  );
  assert.equal(quandoAcontece({ ...trezena, fim: undefined }), 'Terça-feira, 1 de junho');
  assert.equal(
    quandoAcontece({ ...trezena, fim: '2027-06-02T02:59:00.000Z' }),
    'Terça-feira, 1 de junho',
  );
});

test('um evento de vários dias só "já aconteceu" depois do último dia', () => {
  assert.equal(jaAconteceu(trezena, new Date('2027-06-13T20:00:00-03:00')), false);
  assert.equal(jaAconteceu(trezena, new Date('2027-06-14T00:30:00-03:00')), true);
});

test('o destaque sai do título para não aparecer duas vezes', () => {
  assert.deepEqual(separarDestaque('Festa do Rosário', 'do Rosário'), {
    titulo: 'Festa',
    destaque: 'do Rosário',
  });
  assert.deepEqual(separarDestaque('Dia de Nossa Senhora do Rosário', 'do Rosário'), {
    titulo: 'Dia de Nossa Senhora',
    destaque: 'do Rosário',
  });
  // sem destaque, ou fora do final do título, ou o título inteiro: nada muda
  assert.deepEqual(separarDestaque('Perdão de Assis'), { titulo: 'Perdão de Assis' });
  assert.deepEqual(separarDestaque('Festa do Rosário 2027', 'do Rosário'), {
    titulo: 'Festa do Rosário 2027',
  });
  assert.deepEqual(separarDestaque('Rosário', 'Rosário'), { titulo: 'Rosário' });
});

test('Festa mariana: rótulo próprio e variante mariano (o azul só vale para Nossa Senhora)', () => {
  const card = propsCardEvento({ ...festa, categoria: 'mariano' });
  assert.equal(card.variante, 'mariano');
  assert.equal(card.sobrelinha, 'Sábado · Festa mariana');
  assert.equal(propsCardEvento({ ...festa, categoria: 'padrao' }).variante, 'padrao');
});

test('o card usa o título sem o trecho em destaque', () => {
  const card = propsCardEvento(festa);
  assert.equal(card.titulo, 'Festa de Nossa Senhora');
  assert.equal(card.destaque, 'do Rosário');
});
