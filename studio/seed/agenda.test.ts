import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AGENDA, gerarAgenda, horaSP } from './agenda.ts';

const documentos = gerarAgenda();

test('horaSP: 8h em São Paulo são 11h UTC; meia-noite, 3h UTC', () => {
  assert.equal(horaSP('2026-12-06', 8), '2026-12-06T11:00:00.000Z');
  assert.equal(horaSP('2027-10-07', 0), '2027-10-07T03:00:00.000Z');
  assert.equal(horaSP('2027-06-13', 23, 59), '2027-06-14T02:59:00.000Z');
});

test('IDs e endereços são únicos; o ID não tem ponto', () => {
  const ids = documentos.map((d) => d._id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.match(id, /^(agenda|exemplo-agenda)-[a-z0-9-]+$/);
  const slugs = AGENDA.map((e) => e.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const slug of slugs) assert.match(slug, /^[a-z0-9]+(-[a-z0-9]+)*$/);
});

test('título, destaque e término respeitam as regras do Studio', () => {
  for (const d of documentos) {
    assert.ok(String(d.titulo).length <= 90, d._id);
    if (d.destaque) assert.ok(String(d.titulo).includes(String(d.destaque)), d._id);
    if (d.fim) assert.ok(String(d.fim) > String(d.inicio), `${d._id}: término antes do início`);
    assert.ok(['padrao', 'festa', 'mariano', 'franciscano'].includes(String(d.categoria)));
  }
});

test('só os eventos de Nossa Senhora têm o tom mariano (azul)', () => {
  const marianos = documentos.filter((d) => d.categoria === 'mariano').map((d) => d._id);
  assert.deepEqual(marianos.sort(), [
    'exemplo-agenda-dia-de-nossa-senhora-do-rosario',
    'exemplo-agenda-festa-do-rosario',
  ]);
});

test('só o torneio tem horário (8h); os outros são "sem horário definido", sem hora inventada', () => {
  for (const d of documentos) {
    if (d._id === 'agenda-torneio-juventude') {
      assert.equal(d.semHorario, undefined);
      assert.equal(d.inicio, '2026-12-06T11:00:00.000Z');
      assert.equal(d.local, 'Ginásio Poliesportivo do EEPAC - Jaguaribe');
    } else {
      assert.equal(d.semHorario, true, d._id);
    }
  }
});

test('as datas de 2027 são as mesmas da paróquia; a Semana Santa termina na Páscoa (28/03/2027)', () => {
  const por = (id: string) => documentos.find((d) => d._id === id)!;
  assert.equal(por('exemplo-agenda-trezena-santo-antonio').inicio, horaSP('2027-06-01', 0));
  assert.equal(por('exemplo-agenda-festa-do-rosario').fim, horaSP('2027-10-06', 23, 59));
  assert.equal(por('exemplo-agenda-perdao-de-assis').inicio, horaSP('2027-08-02', 0));
  assert.equal(por('exemplo-agenda-semana-santa').fim, horaSP('2027-03-28', 23, 59));
  // Páscoa de 2027 cai num domingo
  assert.equal(new Date('2027-03-28T12:00:00Z').getUTCDay(), 0);
});
