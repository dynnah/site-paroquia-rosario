import assert from 'node:assert/strict';
import { test } from 'node:test';
import { dataISO, instanteDoDia, partesData, somarDias } from './formatacao.ts';

test('dataISO usa o dia de São Paulo, não o do servidor (UTC)', () => {
  // 18/11 02:30 UTC ainda é 17/11 23:30 em São Paulo (UTC−3).
  assert.equal(dataISO(new Date('2026-11-18T02:30:00Z')), '2026-11-17');
  assert.equal(dataISO(new Date('2026-11-18T03:00:00Z')), '2026-11-18');
});

test('dataISO aceita um dia já no formato AAAA-MM-DD', () => {
  assert.equal(dataISO('2026-11-18'), '2026-11-18');
});

test('somarDias: dia seguinte e anterior', () => {
  assert.equal(somarDias('2026-11-18', 1), '2026-11-19');
  assert.equal(somarDias('2026-11-18', -1), '2026-11-17');
  assert.equal(somarDias('2026-11-18', 0), '2026-11-18');
});

test('somarDias vira mês e ano, e respeita ano bissexto', () => {
  assert.equal(somarDias('2026-11-30', 1), '2026-12-01');
  assert.equal(somarDias('2026-12-31', 1), '2027-01-01');
  assert.equal(somarDias('2027-01-01', -1), '2026-12-31');
  assert.equal(somarDias('2028-02-28', 1), '2028-02-29');
  assert.equal(somarDias('2027-02-28', 1), '2027-03-01');
});

test('somarDias recusa o que não for AAAA-MM-DD', () => {
  assert.throws(() => somarDias('18/11/2026', 1), RangeError);
  assert.throws(() => somarDias('2026-11-18T10:00:00Z', 1), RangeError);
});

test('instanteDoDia cai no meio do dia de São Paulo, qualquer que seja o fuso do servidor', () => {
  const instante = instanteDoDia('2026-11-18');
  assert.equal(dataISO(instante), '2026-11-18');
  assert.deepEqual(partesData(instante), { ano: 2026, mes: 11, dia: 18, diaSemana: 3 });
  assert.equal(instante.toISOString(), '2026-11-18T15:00:00.000Z');
});

test('instanteDoDia recusa o que não for AAAA-MM-DD', () => {
  assert.throws(() => instanteDoDia('hoje'), RangeError);
});
