import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  dataCurta,
  dataLonga,
  diaDaSemana,
  diaEMes,
  formatarHora,
  nomeDiaSemana,
  partesData,
} from './formatacao.ts';

test('data só com dia é tratada como dia de calendário, sem mudar de fuso', () => {
  assert.deepEqual(partesData('2026-11-17'), { ano: 2026, mes: 11, dia: 17, diaSemana: 2 });
  assert.deepEqual(partesData('2026-01-01'), { ano: 2026, mes: 1, dia: 1, diaSemana: 4 });
});

test('instantes são lidos no fuso de São Paulo (UTC-3)', () => {
  // 02:59 UTC ainda é 23:59 do dia anterior em São Paulo
  assert.equal(partesData(new Date('2026-11-17T02:59:59Z')).dia, 16);
  assert.equal(partesData(new Date('2026-11-17T03:00:00Z')).dia, 17);
  // 01:30 UTC de quarta é 22:30 de terça em São Paulo
  const terca = partesData(new Date('2026-11-18T01:30:00Z'));
  assert.equal(terca.dia, 17);
  assert.equal(terca.diaSemana, 2);
});

test('virada de ano respeita o fuso', () => {
  const ultimoDia = partesData(new Date('2027-01-01T02:00:00Z'));
  assert.deepEqual([ultimoDia.ano, ultimoDia.mes, ultimoDia.dia], [2026, 12, 31]);
});

test('diaDaSemana e nomeDiaSemana', () => {
  assert.equal(diaDaSemana('2026-11-15'), 0);
  assert.equal(nomeDiaSemana(0), 'domingo');
  assert.equal(nomeDiaSemana(6), 'sábado');
});

test('dataLonga, dataCurta e diaEMes seguem o padrão da paróquia', () => {
  assert.equal(dataLonga('2026-11-17'), 'Terça-feira, 17 de novembro');
  assert.equal(dataLonga('2026-03-01'), 'Domingo, 1 de março');
  assert.equal(dataCurta('2026-11-17'), '17 nov');
  assert.deepEqual(diaEMes('2026-10-07'), { dia: '07', mes: 'out' });
  assert.deepEqual(diaEMes('2026-12-06'), { dia: '06', mes: 'dez' });
});

test('data inválida lança erro claro', () => {
  assert.throws(() => partesData('amanhã'), RangeError);
});

test('formatarHora usa 7h, 17h e 8h40', () => {
  assert.equal(formatarHora('07:00'), '7h');
  assert.equal(formatarHora('7:00'), '7h');
  assert.equal(formatarHora('17:00'), '17h');
  assert.equal(formatarHora('08:40'), '8h40');
  assert.equal(formatarHora('17:30'), '17h30');
  assert.equal(formatarHora('19h'), '19h');
  assert.equal(formatarHora('8h40'), '8h40');
  assert.equal(formatarHora(' 07:00 '), '7h');
});

test('formatarHora escreve um período como "8h às 12h"', () => {
  assert.equal(formatarHora('08:00-12:00'), '8h às 12h');
  assert.equal(formatarHora('14:00-17:30'), '14h às 17h30');
  assert.equal(formatarHora(' 08:00-12:00 '), '8h às 12h');
});

test('formatarHora deixa passar período mal formado', () => {
  assert.equal(formatarHora('08:00-'), '08:00-');
  assert.equal(formatarHora('08:00-25:00'), '08:00-25:00');
  assert.equal(formatarHora('8h-meio-dia'), '8h-meio-dia');
});

test('formatarHora devolve o que não reconhece', () => {
  assert.equal(formatarHora('25:00'), '25:00');
  assert.equal(formatarHora('10:75'), '10:75');
  assert.equal(formatarHora('meio-dia'), 'meio-dia');
});
