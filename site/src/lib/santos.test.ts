import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  buscarSantos,
  decodificar,
  ehSanto,
  interpretarSanto,
  lerBiografia,
  lerSantos,
  resumir,
  urlDaBiografia,
} from './santos.ts';

const ID = 'd58af964-a722-49cc-a4ef-ebfe2d57fd11';

// Resposta real do feed (`type=saint`, 19/11/2026), com os mesmos espaços e quebras.
const FEED_19_11 = `
            <a href="/v2/display_saint.php?id=${ID}&amp;language=PT"
           target="_blank">S. Roque Gonzales e comp., mártires, +1628</a>
                <a href="/v2/display_saint.php?id=fc57d95c-5ae1-435c-a2e2-7fd76ce5f175&amp;language=PT"
           target="_blank">Santa Inês de Assis, religiosa, +1253</a>
                S. Crispim, bispo, séc. V
                S. Rafael Kalinowski, presbítero, +1907
`;

// Texto da biografia inventado de propósito; só a estrutura do HTML é a do Evangelizo.
const PAGINA_BIOGRAFIA = `<html><head><title>x</title><style>p{}</style></head><body>
<table><tr><td><center><i></i><h3>S. Fulano de Tal, mártir, +1628</h3></center></td></tr>
<tr><td><img src="https://files.exemplo/imagem.jpg" align="right">
<p><span><strong>S. Fulano de Tal e companheiros</strong></span></p>
<p><span><strong>Fulano de Tal</strong>, <a href="x">SJ</a>, (Cidade, 1576 &mdash; Outra Cidade, 15 de novembro de 1628) foi um religioso que serviu aos povos da regi&atilde;o com muita dedica&ccedil;&atilde;o. Foi canonizado em 1988.</span></p>
<p>Ele fundou comunidades crist&atilde;s e escreveu cartas aos superiores da ordem, que hoje &eacute; lembrada nas escolas da cidade onde morreu.</p>
</td></tr></table></body></html>`;

function respostaDe(corpo: string, status = 200) {
  return new Response(corpo, { status });
}

// ── Lista de santos ──────────────────────────────────────────────────────────────

test('lerSantos separa os santos, expande as abreviações e guarda o código da biografia', () => {
  const santos = lerSantos(FEED_19_11);
  assert.equal(santos.length, 4);
  assert.deepEqual(santos[0], {
    nome: 'São Roque Gonzales e companheiros',
    funcao: 'mártires',
    epoca: '† 1628',
    id: ID,
  });
  assert.equal(santos[1]?.nome, 'Santa Inês de Assis');
  assert.equal(santos[1]?.id, 'fc57d95c-5ae1-435c-a2e2-7fd76ce5f175');
  // Sem link: sem código de biografia.
  assert.deepEqual(santos[2], { nome: 'São Crispim', funcao: 'bispo', epoca: 'século V' });
  assert.equal(santos[3]?.nome, 'São Rafael Kalinowski');
});

test('interpretarSanto: época, função composta e abreviações no meio do texto', () => {
  assert.deepEqual(interpretarSanto('Santa Catarina de Alexandria, virgem, mártir, +305'), {
    nome: 'Santa Catarina de Alexandria',
    funcao: 'virgem, mártir',
    epoca: '† 305',
  });
  assert.deepEqual(interpretarSanto('Santa Cecília, virgem, mártir, séc. III ou IV'), {
    nome: 'Santa Cecília',
    funcao: 'virgem, mártir',
    epoca: 'século III ou IV',
  });
  assert.deepEqual(interpretarSanto('Filémon e Ápia, amigos de S. Paulo'), {
    nome: 'Filémon e Ápia',
    funcao: 'amigos de São Paulo',
    epoca: undefined,
  });
  assert.equal(interpretarSanto('   '), null);
});

test('ehSanto deixa de fora solenidades e festas do Senhor e de Nossa Senhora', () => {
  for (const nome of [
    'Santíssimo Rei do Universo',
    'Santíssima Trindade',
    'Sagrado Coração de Jesus',
    'Nossa Senhora Aparecida',
    'Santa Maria, Mãe de Deus',
    'Todos os Santos',
    'Conversão de São Paulo',
    'Santa Maria, na memória da sua Apresentação',
  ]) {
    assert.equal(ehSanto({ nome }), false, nome);
  }
  for (const nome of [
    'Santa Maria Madalena',
    'Santa Maria Goretti',
    'São José',
    'Filémon e Ápia',
  ]) {
    assert.equal(ehSanto({ nome }), true, nome);
  }
});

test('ehSanto deixa de fora a festa da dedicação das basílicas (feed de 18/11)', () => {
  const dedicacao = interpretarSanto('São Pedro e São Paulo, na dedicação das suas basílicas');
  assert.ok(dedicacao);
  assert.equal(dedicacao.nome, 'São Pedro e São Paulo');
  assert.equal(ehSanto(dedicacao), false);
  // o mesmo santo, sem ser a dedicação, continua valendo
  assert.equal(ehSanto({ nome: 'São Pedro', funcao: 'apóstolo' }), true);
});

// ── Biografia ────────────────────────────────────────────────────────────────────

test('decodificar entende entidades nomeadas e numéricas', () => {
  assert.equal(
    decodificar('Assun&ccedil;&atilde;o &mdash; Caibat&eacute; &#8212; &#x2014; &amp;'),
    'Assunção — Caibaté — — &',
  );
  assert.equal(decodificar('&desconhecida;'), '&desconhecida;');
});

test('resumir não corta "SJ." no meio e tira o que está entre parênteses', () => {
  const texto =
    'Roque Gonzales, S.J. (Assunção, 1576 — Caibaté, 1628) foi um religioso do Paraguai. Foi canonizado em 1988. Fundou aldeias. Escreveu cartas.';
  assert.equal(
    resumir(texto),
    'Roque Gonzales, S.J. foi um religioso do Paraguai. Foi canonizado em 1988. Fundou aldeias.',
  );
});

test('resumir respeita o limite, mas sempre entrega a primeira frase', () => {
  const frase = 'Foi um bispo muito querido pelo povo e pelos pobres da sua cidade.';
  assert.equal(resumir(`${frase} ${frase} ${frase}`, 100), `${frase}`);
  const longa = `${'palavra '.repeat(120)}fim.`;
  const resumo = resumir(longa, 100);
  assert.ok(resumo.endsWith('…'));
  assert.ok(resumo.length <= 101);
});

test('lerBiografia pega só texto corrido: sem título, sem imagem, sem parênteses', () => {
  const bio = lerBiografia(PAGINA_BIOGRAFIA);
  assert.ok(bio);
  assert.ok(bio.startsWith('Fulano de Tal, SJ, foi um religioso'), bio);
  assert.ok(bio.includes('dedicação'));
  assert.ok(!bio.includes('Cidade'));
  assert.ok(!bio.includes('<'));
  assert.ok(!bio.includes('S. Fulano de Tal e companheiros'));
  assert.equal(lerBiografia('<html><body><h3>Só título</h3></body></html>'), undefined);
});

// ── Busca ────────────────────────────────────────────────────────────────────────

const semEspera = { esperaMs: 0, aviso: () => {} } as const;

test('buscarSantos: pega o primeiro santo com a biografia e lista os outros', async () => {
  const pedidos: string[] = [];
  const fetcher = (async (url: string) => {
    pedidos.push(url);
    return url.includes('display_saint.php')
      ? respostaDe(PAGINA_BIOGRAFIA)
      : respostaDe(FEED_19_11);
  }) as unknown as typeof fetch;

  const resultado = await buscarSantos('2026-11-19', { ...semEspera, fetcher });
  assert.ok(resultado);
  assert.equal(resultado.principal.nome, 'São Roque Gonzales e companheiros');
  assert.ok(resultado.principal.biografia?.texto.startsWith('Fulano de Tal'));
  assert.equal(resultado.principal.biografia?.href, urlDaBiografia(ID));
  assert.deepEqual(
    resultado.outros.map((santo) => santo.nome),
    ['Santa Inês de Assis', 'São Crispim', 'São Rafael Kalinowski'],
  );
  assert.ok(pedidos[0]?.includes('date=20261119&type=saint&lang=PT'));
  assert.equal(pedidos.length, 2);
});

test('buscarSantos: se a biografia falhar, ainda mostra o santo; se o feed falhar, devolve null', async () => {
  const soFeed = (async (url: string) =>
    url.includes('display_saint.php')
      ? respostaDe('erro', 500)
      : respostaDe(FEED_19_11)) as unknown as typeof fetch;
  const resultado = await buscarSantos('2026-11-19', {
    ...semEspera,
    fetcher: soFeed,
    tentativas: 2,
  });
  assert.equal(resultado?.principal.nome, 'São Roque Gonzales e companheiros');
  assert.equal(resultado?.principal.biografia, undefined);

  const fora = (async () => {
    throw new Error('sem rede');
  }) as unknown as typeof fetch;
  assert.equal(
    await buscarSantos('2026-11-19', { ...semEspera, fetcher: fora, tentativas: 2 }),
    null,
  );
});

test('buscarSantos: dia só com solenidade do Senhor não vira "santo do dia"', async () => {
  const fetcher = (async () =>
    respostaDe(
      '<a href="/v2/display_saint.php?id=5592fb60-431c-4518-95c6-91ac9e7c8050&amp;language=PT">Santíssimo Rei do Universo</a>',
    )) as unknown as typeof fetch;
  assert.equal(await buscarSantos('2026-11-22', { ...semEspera, fetcher }), null);
});

test('buscarSantos: 404 não se repete', async () => {
  let chamadas = 0;
  const fetcher = (async () => {
    chamadas++;
    return respostaDe('nada', 404);
  }) as unknown as typeof fetch;
  assert.equal(await buscarSantos('2026-11-19', { ...semEspera, fetcher }), null);
  assert.equal(chamadas, 1);
});

test('lerBiografia tira o título colado ao primeiro parágrafo, mas não mexe em frase normal', () => {
  const pagina = (texto: string) => `<body><p>${texto}</p></body>`;
  const colado =
    'Santo André Dung Lac e companheiros, presbíteros, mártires vietnamitas, séc. XVIII e XIX No dia 9 de junho de 1988, o papa canonizou 116 mártires do Vietnã, entre eles muitos catequistas.';
  assert.ok(
    lerBiografia(pagina(colado), 'Santo André Dung Lac e companheiros')?.startsWith(
      'No dia 9 de junho de 1988',
    ),
  );

  const normal =
    'Santo Edmundo subiu ao trono de Inglaterra no Natal de 854. O seu reinado foi conturbado pelas invasões.';
  assert.ok(
    lerBiografia(pagina(normal), 'Santo Edmundo')?.startsWith('Santo Edmundo subiu ao trono'),
  );
});
