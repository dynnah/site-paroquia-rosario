import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  extrairIdYouTube,
  slugificar,
  validarDuracao,
  validarHora,
  validarInstagram,
  validarMesDia,
  validarWhatsApp,
  validarYouTube,
} from './validacoes.ts';

test('validarHora aceita 24h com zero à esquerda', () => {
  assert.equal(validarHora('07:00'), true);
  assert.equal(validarHora('23:59'), true);
  assert.equal(validarHora(undefined), true);
  assert.notEqual(validarHora('7h'), true);
  assert.notEqual(validarHora('24:00'), true);
  assert.notEqual(validarHora('7:00'), true);
});

test('validarMesDia confere o calendário e aceita 29 de fevereiro', () => {
  assert.equal(validarMesDia('11-17'), true);
  assert.equal(validarMesDia('02-29'), true);
  assert.notEqual(validarMesDia('02-30'), true);
  assert.notEqual(validarMesDia('13-01'), true);
  assert.notEqual(validarMesDia('4-10'), true);
  assert.equal(validarMesDia(undefined), true);
});

test('validarYouTube aceita links do YouTube e recusa o resto', () => {
  assert.equal(validarYouTube('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), true);
  assert.equal(validarYouTube('https://youtu.be/dQw4w9WgXcQ'), true);
  assert.equal(validarYouTube(undefined), true);
  assert.notEqual(validarYouTube('https://vimeo.com/123456'), true);
  assert.notEqual(validarYouTube('https://www.youtube.com/@canal'), true);
});

test('extrairIdYouTube devolve o ID de shorts e embed', () => {
  assert.equal(extrairIdYouTube('https://www.youtube.com/shorts/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(extrairIdYouTube('https://www.youtube.com/embed/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(extrairIdYouTube('https://exemplo.com/watch?v=dQw4w9WgXcQ'), null);
});

test('validarDuracao', () => {
  assert.equal(validarDuracao('6:40'), true);
  assert.equal(validarDuracao('1:02:15'), true);
  assert.notEqual(validarDuracao('6min'), true);
  assert.notEqual(validarDuracao('6:70'), true);
});

test('validarWhatsApp exige 55 + DDD + número', () => {
  assert.equal(validarWhatsApp('5583999999999'), true);
  assert.equal(validarWhatsApp('558332221111'), true);
  assert.notEqual(validarWhatsApp('83999999999'), true);
  assert.notEqual(validarWhatsApp('+55 83 99999-9999'), true);
});

test('validarInstagram aceita só o usuário', () => {
  assert.equal(validarInstagram('paroquiadorosariojp'), true);
  assert.equal(validarInstagram('@paroquiadorosariojp'), true);
  assert.notEqual(validarInstagram('https://instagram.com/paroquiadorosariojp'), true);
});

test('slugificar tira acentos e pontuação', () => {
  assert.equal(slugificar('Evangelização e Catequese'), 'evangelizacao-e-catequese');
  assert.equal(slugificar('  Nossa história!  '), 'nossa-historia');
  assert.equal(slugificar('Missa às 17h'), 'missa-as-17h');
  assert.equal(slugificar('a'.repeat(120)).length, 80);
});
