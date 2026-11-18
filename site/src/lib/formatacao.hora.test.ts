import assert from 'node:assert/strict';
import { test } from 'node:test';
import { horaLocal, minutosDoDia } from './formatacao.ts';

test('minutosDoDia lê a hora em São Paulo, não a do servidor', () => {
  assert.equal(minutosDoDia(new Date('2026-11-17T20:00:00Z')), 17 * 60);
  assert.equal(minutosDoDia(new Date('2026-11-17T03:00:00Z')), 0); // meia-noite em SP
  assert.equal(minutosDoDia(new Date('2026-11-17T02:59:00Z')), 23 * 60 + 59);
});

test('minutosDoDia aceita instante em texto ISO', () => {
  assert.equal(minutosDoDia('2026-11-17T11:40:00.000Z'), 8 * 60 + 40);
});

test('horaLocal usa o formato da paróquia', () => {
  assert.equal(horaLocal('2026-11-17T20:00:00.000Z'), '17h');
  assert.equal(horaLocal('2026-11-17T11:40:00.000Z'), '8h40');
  assert.equal(horaLocal('2026-11-17T03:00:00.000Z'), '0h');
});

test('data inválida lança erro claro', () => {
  assert.throws(() => minutosDoDia('isso não é data'), RangeError);
});
