import assert from 'node:assert/strict';
import { test } from 'node:test';
import { dataCompleta } from './formatacao.ts';
import type { Sacramento } from './sanity.tipos.ts';
import { descreverTurma, propsCardSacramento } from './sacramentos.ts';

const batismo: Sacramento = {
  _id: 's1',
  slug: 'batismo',
  nome: 'Batismo',
  resumo: 'A porta da vida cristã.',
  requisitos: [],
  documentos: [],
  proximasTurmas: [{ nome: 'Turma de março', inicio: '2027-03-13', horario: 'Sábados, 9h' }],
};

test('dataCompleta traz o ano', () => {
  assert.equal(dataCompleta('2027-03-13'), '13 de março de 2027');
  assert.equal(dataCompleta(new Date('2026-11-17T20:00:00Z')), '17 de novembro de 2026');
});

test('descreverTurma com e sem horário', () => {
  assert.equal(
    descreverTurma({ inicio: '2027-03-13', horario: 'Sábados, 9h' }),
    'Início em 13 de março de 2027 · Sábados, 9h',
  );
  assert.equal(descreverTurma({ inicio: '2027-03-13' }), 'Início em 13 de março de 2027');
});

test('descreverTurma mostra "até" só quando a turma termina em outro dia', () => {
  assert.equal(
    descreverTurma({ inicio: '2027-03-13', fim: '2027-05-28', horario: 'Sábados, 9h' }),
    'Início em 13 de março de 2027 · até 28 de maio de 2027 · Sábados, 9h',
  );
  assert.equal(
    descreverTurma({ inicio: '2027-03-13', fim: '2027-03-13' }),
    'Início em 13 de março de 2027',
  );
});

test('card de sacramento mostra a próxima turma e leva aos requisitos', () => {
  const card = propsCardSacramento(batismo);
  assert.equal(card.categoria, 'Sacramento');
  assert.equal(card.descricao, 'A porta da vida cristã.');
  assert.deepEqual(card.info, [
    {
      rotulo: 'Próxima turma',
      valor: 'Turma de março · Início em 13 de março de 2027 · Sábados, 9h',
    },
  ]);
  assert.deepEqual(card.acao, { rotulo: 'Ver requisitos', href: '/sacramentos/batismo' });
});

test('sem turma futura, o card não mostra linha de informação', () => {
  assert.deepEqual(propsCardSacramento({ ...batismo, proximasTurmas: [] }).info, []);
});
