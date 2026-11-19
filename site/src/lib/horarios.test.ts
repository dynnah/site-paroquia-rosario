import assert from 'node:assert/strict';
import { test } from 'node:test';
import { horaEmMinutos, linhasDeHoje, minutosEmHora, proximaMissa } from './horarios.ts';
import type { LinhaHorario } from './sanity.tipos.ts';

// Mesma tabela do seed. 17 de novembro de 2026 é uma terça-feira. São Paulo = UTC−3.
const missa: LinhaHorario[] = [
  { rotulo: 'Domingo', dias: [0], horas: ['07:00', '17:00'] },
  { rotulo: 'Segunda', dias: [1], horas: [], nota: 'Sem missa' },
  { rotulo: 'Terça', dias: [2], horas: ['17:00'] },
  { rotulo: 'Quarta a sexta', dias: [3, 4, 5], horas: ['17:00'] },
  { rotulo: 'Sábado', dias: [6], horas: ['17:00'] },
];

const em = (iso: string) => new Date(iso);

test('horaEmMinutos entende "07:00", "7h" e "8h40"; o resto é ignorado', () => {
  assert.equal(horaEmMinutos('07:00'), 420);
  assert.equal(horaEmMinutos('7h'), 420);
  assert.equal(horaEmMinutos('8h40'), 520);
  assert.equal(horaEmMinutos('25:00'), null);
  assert.equal(horaEmMinutos('de manhã'), null);
});

test('minutosEmHora devolve o formato da paróquia', () => {
  assert.equal(minutosEmHora(1020), '17h');
  assert.equal(minutosEmHora(520), '8h40');
});

test('terça às 16h: a próxima missa é hoje, às 17h', () => {
  assert.deepEqual(proximaMissa(missa, em('2026-11-17T19:00:00Z')), {
    quando: 'hoje',
    hora: '17h',
  });
});

test('terça às 18h: a missa de hoje já passou, a próxima é amanhã', () => {
  assert.deepEqual(proximaMissa(missa, em('2026-11-17T21:00:00Z')), {
    quando: 'amanhã',
    hora: '17h',
  });
});

test('a virada do dia usa o calendário de São Paulo, não o UTC', () => {
  // 23h30 de terça em SP já é quarta (02h30) em UTC: "hoje" ainda é terça
  assert.deepEqual(proximaMissa(missa, em('2026-11-18T02:30:00Z')), {
    quando: 'amanhã',
    hora: '17h',
  });
});

test('domingo cedo: a primeira missa do dia é hoje, às 7h', () => {
  // domingo 22 de novembro, 5h em SP
  assert.deepEqual(proximaMissa(missa, em('2026-11-22T08:00:00Z')), { quando: 'hoje', hora: '7h' });
});

test('sábado à noite: a próxima é a de domingo cedo', () => {
  assert.deepEqual(proximaMissa(missa, em('2026-11-22T00:30:00Z')), {
    quando: 'amanhã',
    hora: '7h',
  });
});

test('domingo à noite: segunda não tem missa, então a próxima é terça (pelo nome do dia)', () => {
  assert.deepEqual(proximaMissa(missa, em('2026-11-22T23:00:00Z')), {
    quando: 'terça-feira',
    hora: '17h',
  });
});

test('várias linhas no mesmo dia somam os horários, em ordem', () => {
  const linhas: LinhaHorario[] = [
    { rotulo: 'Terça', dias: [2], horas: ['19:00'] },
    { rotulo: 'Terça cedo', dias: [2], horas: ['06:30'] },
  ];
  assert.deepEqual(proximaMissa(linhas, em('2026-11-17T10:00:00Z')), {
    quando: 'hoje',
    hora: '19h',
  });
});

test('sem nenhum horário válido, não há próxima missa', () => {
  assert.equal(proximaMissa([], em('2026-11-17T19:00:00Z')), null);
  assert.equal(
    proximaMissa([{ rotulo: 'Todo dia', dias: [0, 1, 2, 3, 4, 5, 6], horas: ['em breve'] }]),
    null,
  );
});

test('linhasDeHoje filtra pelo dia da semana em São Paulo', () => {
  const hoje = linhasDeHoje(missa, em('2026-11-17T19:00:00Z'));
  assert.deepEqual(
    hoje.map((l) => l.rotulo),
    ['Terça'],
  );
  assert.deepEqual(
    linhasDeHoje(missa, em('2026-11-18T02:30:00Z')).map((l) => l.rotulo),
    ['Terça'],
  );
});

// A tabela real: no domingo há missas em duas capelas, e a observação da linha diz onde é cada uma.
const missaComLocal: LinhaHorario[] = [
  { rotulo: 'Domingo', dias: [0], horas: ['07:00', '17:00'], nota: 'Matriz' },
  { rotulo: 'Domingo', dias: [0], horas: ['09:00'], nota: 'Capela Sagrada Família' },
  { rotulo: 'Domingo', dias: [0], horas: ['10:00'], nota: 'Capela São Cristóvão' },
  { rotulo: 'Segunda', dias: [1], horas: [], nota: 'Sem missa' },
  { rotulo: 'Terça a sábado', dias: [2, 3, 4, 5, 6], horas: ['17:00'], nota: 'Matriz' },
];

test('a próxima missa diz onde é, e no domingo passa pelas capelas', () => {
  // domingo, 22 de novembro de 2026
  assert.deepEqual(proximaMissa(missaComLocal, em('2026-11-22T09:30:00Z')), {
    quando: 'hoje',
    hora: '7h',
    local: 'Matriz',
  }); // 6h30
  assert.deepEqual(proximaMissa(missaComLocal, em('2026-11-22T11:00:00Z')), {
    quando: 'hoje',
    hora: '9h',
    local: 'Capela Sagrada Família',
  }); // 8h
  assert.deepEqual(proximaMissa(missaComLocal, em('2026-11-22T12:30:00Z')), {
    quando: 'hoje',
    hora: '10h',
    local: 'Capela São Cristóvão',
  }); // 9h30
  assert.deepEqual(proximaMissa(missaComLocal, em('2026-11-22T13:30:00Z')), {
    quando: 'hoje',
    hora: '17h',
    local: 'Matriz',
  }); // 10h30
});

test('depois da missa das 17h de domingo, pula a segunda sem missa e vai para terça', () => {
  const proxima = proximaMissa(missaComLocal, em('2026-11-22T21:00:00Z')); // domingo, 18h
  assert.equal(proxima?.hora, '17h');
  assert.equal(proxima?.local, 'Matriz');
  assert.match(proxima?.quando ?? '', /terça/);
});

test('linhasDeHoje devolve as três linhas do domingo', () => {
  const domingo = linhasDeHoje(missaComLocal, em('2026-11-22T15:00:00Z'));
  assert.deepEqual(
    domingo.map((l) => l.nota),
    ['Matriz', 'Capela Sagrada Família', 'Capela São Cristóvão'],
  );
});
