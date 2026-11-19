import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PAROQUIA } from './paroquia.ts';
import type { GrupoHorarios } from './sanity.tipos.ts';
import {
  descricaoCurta,
  horarioDeFuncionamento,
  jsonLdEvento,
  jsonLdIgreja,
  LIMITE_DESCRICAO,
  serializarJsonLd,
  telefoneInternacional,
  urlAbsoluta,
} from './seo.ts';

// ── descrição ───────────────────────────────────────────────────────────────────

test('descricaoCurta junta as linhas e deixa passar o que cabe', () => {
  assert.equal(descricaoCurta('  Missas \n e   horários  '), 'Missas e horários');
});

test('descricaoCurta sem texto devolve undefined (o layout usa a descrição padrão)', () => {
  assert.equal(descricaoCurta(undefined), undefined);
  assert.equal(descricaoCurta(null), undefined);
  assert.equal(descricaoCurta('   \n '), undefined);
});

test('descricaoCurta corta em palavra inteira, com reticências, dentro do limite', () => {
  const texto = 'Encontros de formação e oração para os jovens da paróquia. '.repeat(6);
  const curta = descricaoCurta(texto) as string;
  assert.ok(curta.length <= LIMITE_DESCRICAO, `tem ${curta.length} caracteres`);
  assert.ok(curta.endsWith('…'));
  assert.ok(!/[\s,;:.]…$/u.test(curta), 'não deixa pontuação solta antes das reticências');
  // a última palavra antes das reticências existe no texto original, inteira
  const ultima = curta.slice(0, -1).split(' ').pop() as string;
  assert.ok(texto.split(' ').includes(ultima), `"${ultima}" não é uma palavra inteira`);
});

test('descricaoCurta com uma palavra enorme corta onde dá, sem estourar o limite', () => {
  const curta = descricaoCurta('a'.repeat(400)) as string;
  assert.equal(curta.length, LIMITE_DESCRICAO);
});

test('descricaoCurta respeita um limite diferente', () => {
  const curta = descricaoCurta('um dois três quatro cinco seis sete', 20) as string;
  assert.ok(curta.length <= 20);
  assert.equal(curta, 'um dois três quatro…');
});

// ── endereços ───────────────────────────────────────────────────────────────────

test('urlAbsoluta junta o caminho ao site; sem site, mantém o caminho', () => {
  assert.equal(
    urlAbsoluta('/horarios', 'https://exemplo.org.br'),
    'https://exemplo.org.br/horarios',
  );
  assert.equal(
    urlAbsoluta('/blog/post', new URL('https://exemplo.org.br/')),
    'https://exemplo.org.br/blog/post',
  );
  assert.equal(urlAbsoluta('/', 'https://exemplo.org.br'), 'https://exemplo.org.br/');
  assert.equal(urlAbsoluta('/horarios', undefined), '/horarios');
});

test('telefoneInternacional põe o +55 e rejeita o que não é telefone', () => {
  assert.equal(telefoneInternacional('(83) 3241-1433'), '+558332411433');
  assert.equal(telefoneInternacional('(83) 99999-0000'), '+5583999990000');
  assert.equal(telefoneInternacional('558332411433'), '+558332411433');
  assert.equal(telefoneInternacional('123'), undefined);
  assert.equal(telefoneInternacional(undefined), undefined);
});

// ── JSON-LD ─────────────────────────────────────────────────────────────────────

test('serializarJsonLd não deixa um texto fechar a tag <script>', () => {
  const saida = serializarJsonLd({ nome: '</script><script>alert(1)</script> & \u2028' });
  assert.ok(!saida.includes('<'));
  assert.ok(!saida.includes('>'));
  assert.ok(!saida.includes('&'));
  assert.ok(!saida.includes('\u2028'));
  // e continua sendo o mesmo JSON
  assert.deepEqual(JSON.parse(saida), { nome: '</script><script>alert(1)</script> & \u2028' });
});

const secretaria: GrupoHorarios = {
  linhas: [
    { rotulo: 'Terça a sexta', dias: [2, 3, 4, 5], horas: ['08:00-12:00', '14:00-17:00'] },
    { rotulo: 'Sábado', dias: [6], horas: ['08:00-12:00'] },
    { rotulo: 'Domingo', dias: [0], horas: ['17:00'], nota: 'não é um período' },
    { rotulo: 'Segunda', dias: [1], horas: [], nota: 'Fechada' },
  ],
};

test('horarioDeFuncionamento usa só os períodos e traduz os dias', () => {
  assert.deepEqual(horarioDeFuncionamento(secretaria), [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '12:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '14:00',
      closes: '17:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Saturday'],
      opens: '08:00',
      closes: '12:00',
    },
  ]);
  assert.deepEqual(horarioDeFuncionamento(undefined), []);
});

test('jsonLdIgreja descreve a paróquia com o que o site já publica', () => {
  const ld = jsonLdIgreja(PAROQUIA, {
    url: 'https://exemplo.org.br/',
    imagem: 'https://exemplo.org.br/og-padrao.png',
    mapa: 'https://maps.example/x',
    secretaria,
  });
  assert.equal(ld['@context'], 'https://schema.org');
  assert.equal(ld['@type'], 'CatholicChurch');
  assert.equal(ld.name, 'Paróquia Nossa Senhora do Rosário');
  assert.equal(ld.telephone, '+558332411433');
  assert.deepEqual(ld.address, {
    '@type': 'PostalAddress',
    streetAddress: 'Rua Frei Martinho, s/n, Jaguaribe',
    addressLocality: 'João Pessoa',
    addressRegion: 'PB',
    postalCode: '58014-430',
    addressCountry: 'BR',
  });
  assert.deepEqual(ld.sameAs, ['https://www.instagram.com/paroquiadorosariojp/']);
  assert.equal(ld.openingHoursSpecification?.length, 3);
});

test('jsonLdIgreja omite o que a paróquia ainda não informou', () => {
  const ld = jsonLdIgreja(
    { ...PAROQUIA, telefone: undefined, instagram: undefined, email: undefined },
    { url: 'https://exemplo.org.br/' },
  );
  for (const campo of [
    'telephone',
    'email',
    'sameAs',
    'image',
    'hasMap',
    'openingHoursSpecification',
  ]) {
    assert.ok(!(campo in ld), `"${campo}" não devia aparecer`);
  }
});

test('jsonLdEvento traz nome, início, local e organizadora', () => {
  const ld = jsonLdEvento(
    {
      titulo: 'Festa da padroeira',
      inicio: '2026-10-07T21:00:00Z',
      fim: '2026-10-07T23:00:00Z',
      local: 'Salão paroquial',
    },
    PAROQUIA,
    { url: 'https://exemplo.org.br/agenda/festa', site: 'https://exemplo.org.br/' },
  );
  assert.equal(ld['@type'], 'Event');
  assert.equal(ld.name, 'Festa da padroeira');
  assert.equal(ld.startDate, '2026-10-07T21:00:00Z');
  assert.equal(ld.endDate, '2026-10-07T23:00:00Z');
  assert.equal(ld.location.name, 'Salão paroquial');
  assert.equal(ld.location.address.addressLocality, 'João Pessoa');
  assert.equal(ld.organizer.name, 'Paróquia Nossa Senhora do Rosário');
  assert.equal(ld.eventStatus, 'https://schema.org/EventScheduled');
});

test('jsonLdEvento sem local e sem fim: o evento é na igreja e não inventa a hora de acabar', () => {
  const ld = jsonLdEvento({ titulo: 'Missa solene', inicio: '2026-12-08T21:00:00Z' }, PAROQUIA, {
    url: 'https://exemplo.org.br/agenda/missa',
  });
  assert.equal(ld.location.name, 'Paróquia Nossa Senhora do Rosário');
  assert.ok(!('endDate' in ld));
  assert.ok(!('image' in ld));
});

test('jsonLdEvento sem horário: só a data, sem inventar uma hora', () => {
  const ld = jsonLdEvento(
    {
      titulo: 'Trezena de Santo Antônio',
      inicio: '2027-06-01T03:00:00.000Z',
      fim: '2027-06-14T02:59:00.000Z',
      semHorario: true,
    },
    PAROQUIA,
    { url: 'https://exemplo.org/agenda/trezena/' },
  );
  assert.equal(ld.startDate, '2027-06-01');
  assert.equal(ld.endDate, '2027-06-13');
});
