import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  buscarLiturgia,
  converterLiturgia,
  evangelhoDoDia,
  interpretarCelebracao,
  leiturasDoCard,
  limparReferencia,
  linhaDaCelebracao,
  montarLeituras,
  paragrafos,
  textoIntegralLigado,
  tituloDaLiturgia,
  urlLiturgia,
} from './liturgia.ts';

// Texto das leituras é inventado de propósito: o oficial (CNBB) não entra no repositório.
const SEGREDO = 'TEXTO-DA-LEITURA';
const REFRAO = 'REFRAO-DO-SALMO';

const leituraComum = {
  primeiraLeitura: [{ referencia: 'Ap 4,1-11', titulo: 'Leitura…', texto: `1${SEGREDO} um` }],
  salmo: [{ referencia: 'Sl 150', refrao: REFRAO, texto: `– ${SEGREDO} dois` }],
  segundaLeitura: [],
  evangelho: [{ referencia: 'Lc 19,11-28', titulo: 'Proclamação…', texto: `11${SEGREDO} três` }],
  extras: [],
};

function resposta(sobrescrever: Record<string, unknown> = {}) {
  return {
    data: '18/11/2026',
    liturgia: '4ª feira da 33ª Semana do Tempo Comum',
    cor: 'Verde',
    oracoes: { coleta: `${SEGREDO} coleta`, oferendas: '', comunhao: '', extras: [] },
    leituras: leituraComum,
    antifonas: { entrada: `${SEGREDO} antífona`, comunhao: '' },
    ...sobrescrever,
  };
}

// ── interpretarCelebracao: os nomes reais que a API devolve ─────────────────────

test('dia comum: separa o dia da semana e a semana do tempo litúrgico', () => {
  assert.deepEqual(interpretarCelebracao('4ª feira da 33ª Semana do Tempo Comum'), {
    nome: '4ª feira',
    semana: '33ª Semana do Tempo Comum',
    tempo: 'Tempo Comum',
    grau: undefined,
  });
  assert.equal(interpretarCelebracao('Sábado da 34ª Semana do Tempo Comum').nome, 'Sábado');
});

test('semanas do Advento, da Quaresma e da Páscoa', () => {
  const advento = interpretarCelebracao('3ª feira da 1ª Semana do Advento');
  assert.equal(advento.semana, '1ª Semana do Advento');
  assert.equal(advento.tempo, 'Advento');
  const quaresma = interpretarCelebracao('4ª feira da 3ª Semana da Quaresma');
  assert.equal(quaresma.semana, '3ª Semana da Quaresma');
  assert.equal(quaresma.tempo, 'Quaresma');
  const pascoa = interpretarCelebracao('2ª feira da 3ª Semana da Páscoa');
  assert.equal(pascoa.semana, '3ª Semana da Páscoa');
  assert.equal(pascoa.tempo, 'Páscoa');
});

test('memória, festa e solenidade: o grau sai do nome', () => {
  assert.deepEqual(interpretarCelebracao('Santo André, Apóstolo, Festa'), {
    nome: 'Santo André, Apóstolo',
    tempo: undefined,
    grau: 'festa',
  });
  assert.equal(interpretarCelebracao('São Barnabé, Apóstolo, Memória').grau, 'memoria');
  assert.equal(
    interpretarCelebracao('Nosso Senhor Jesus Cristo, Rei do Universo, Solenidade').nome,
    'Nosso Senhor Jesus Cristo, Rei do Universo',
  );
});

test('nome com várias vírgulas: só o grau do final é cortado', () => {
  const sao_jose = interpretarCelebracao(
    'São José, esposo da Bem-Aventurada Virgem Maria, Padroeiro da Igreja Universal, Solenidade',
  );
  assert.equal(
    sao_jose.nome,
    'São José, esposo da Bem-Aventurada Virgem Maria, Padroeiro da Igreja Universal',
  );
  assert.equal(sao_jose.grau, 'solenidade');
});

test('memória facultativa (v3 usa ponto antes do grau)', () => {
  const l = interpretarCelebracao(
    'Dedicação das basílicas dos Santos Pedro e Paulo, apóstolos. Memória Facultativa',
  );
  assert.equal(l.grau, 'memoria-facultativa');
  assert.equal(l.nome, 'Dedicação das basílicas dos Santos Pedro e Paulo, apóstolos');
});

test('domingos e dias sem semana numerada ficam com o nome inteiro', () => {
  assert.equal(interpretarCelebracao('1º Domingo do Advento').nome, '1º Domingo do Advento');
  assert.equal(interpretarCelebracao('1º Domingo do Advento').semana, undefined);
  assert.equal(interpretarCelebracao('5º Dia na Oitava de Natal').tempo, 'Natal');
  assert.equal(interpretarCelebracao('3ª feira na Oitava da Páscoa').tempo, 'Páscoa');
  assert.equal(interpretarCelebracao('Quarta-feira de Cinzas').tempo, 'Quaresma');
  assert.equal(
    interpretarCelebracao('5ª feira do Tempo do Natal depois da Epifania').semana,
    undefined,
  );
});

test('sem palavra que diga o tempo, o tempo fica indefinido (não se adivinha)', () => {
  assert.equal(interpretarCelebracao('Domingo de Pentecostes, Solenidade').tempo, undefined);
  assert.equal(interpretarCelebracao('Comemoração de Todos os Fiéis Defuntos').tempo, undefined);
});

test('título e linha da celebração para o card', () => {
  const comum = {
    ...interpretarCelebracao('4ª feira da 33ª Semana do Tempo Comum'),
    cor: 'verde',
  } as const;
  assert.equal(tituloDaLiturgia(comum), '33ª Semana do Tempo Comum');
  assert.equal(linhaDaCelebracao(comum), '4ª feira');

  const festa = {
    ...interpretarCelebracao('Santo André, Apóstolo, Festa'),
    cor: 'vermelho',
  } as const;
  assert.equal(tituloDaLiturgia(festa), 'Santo André, Apóstolo');
  assert.equal(linhaDaCelebracao(festa), 'Festa');

  const domingo = { ...interpretarCelebracao('1º Domingo do Advento'), cor: 'roxo' } as const;
  assert.equal(linhaDaCelebracao(domingo), 'Cor litúrgica: roxo');
});

// ── Referências e texto ─────────────────────────────────────────────────────────

test('limparReferencia tira complementos e arruma o espaço depois da vírgula', () => {
  assert.equal(limparReferencia('Lc 2, 22-40 (mais longo)'), 'Lc 2,22-40');
  assert.equal(limparReferencia('Mc 1,7-11 (Jesus batizado por João)'), 'Mc 1,7-11');
  assert.equal(
    limparReferencia('Sl 28(29),1a.2.3ac-4.3b.9b-10 (R. 11b)'),
    'Sl 28(29),1a.2.3ac-4.3b.9b-10',
  );
  assert.equal(limparReferencia('Ex 14, 15–15, 1'), 'Ex 14,15–15,1');
  assert.equal(
    limparReferencia('Cânt.: Lc 1,46-47.48-49 (R. 49 ou: Bendita sejais, ó Virgem!)'),
    'Cânt.: Lc 1,46-47.48-49',
  );
});

test('limparReferencia mantém o que vem colado ao número', () => {
  assert.equal(limparReferencia('Sl 118(119)'), 'Sl 118(119)');
  assert.equal(limparReferencia('Sl 70(71); 12(13)'), 'Sl 70(71); 12(13)');
  assert.equal(limparReferencia('Sl 18(19A)'), 'Sl 18(19A)');
});

test('paragrafos tira o número de versículo colado e separa por quebra de linha', () => {
  assert.deepEqual(paragrafos('Eu, João, 1vi uma porta. 2Imediatamente\n\n3“Eis o servo'), [
    'Eu, João, vi uma porta. Imediatamente',
    '“Eis o servo',
  ]);
  assert.deepEqual(paragrafos('41quando ele veio'), ['quando ele veio']);
});

test('paragrafos não apaga ordinais nem números soltos', () => {
  assert.deepEqual(paragrafos('Na 5ª feira, 12 homens e 3 mulheres'), [
    'Na 5ª feira, 12 homens e 3 mulheres',
  ]);
});

// ── montarLeituras ──────────────────────────────────────────────────────────────

test('com a flag desligada, nenhum texto nem refrão sai do adaptador', () => {
  const { leituras } = montarLeituras(leituraComum, false);
  assert.deepEqual(
    leituras.map((l) => [l.id, l.rotulo, l.referencia]),
    [
      ['l1', '1ª Leitura', 'Ap 4,1-11'],
      ['sl', 'Salmo', 'Sl 150'],
      ['ev', 'Evangelho', 'Lc 19,11-28'],
    ],
  );
  const serializado = JSON.stringify(leituras);
  assert.ok(!serializado.includes(SEGREDO), 'o texto da leitura vazou');
  assert.ok(!serializado.includes(REFRAO), 'o refrão vazou');
});

test('com a flag ligada, o texto e o refrão do salmo entram', () => {
  const { leituras } = montarLeituras(leituraComum, true);
  assert.deepEqual(leituras[0]?.texto, [`${SEGREDO} um`]);
  const salmo = leituras.find((l) => l.id === 'sl');
  assert.equal(salmo?.refrao, REFRAO);
  assert.equal(leituras.find((l) => l.id === 'l1')?.refrao, undefined);
});

test('opções da mesma leitura (forma longa e breve) viram "A ou B"', () => {
  const { leituras, temLeiturasEspeciais } = montarLeituras(
    {
      evangelho: [
        { referencia: 'Lc 2, 22-40 (mais longo)', texto: 'longo' },
        { referencia: 'Lc 2, 22.39-40 (mais breve)', texto: 'breve' },
      ],
    },
    false,
  );
  assert.equal(leituras[0]?.referencia, 'Lc 2,22-40 ou Lc 2,22.39-40');
  assert.equal(temLeiturasEspeciais, false);
});

test('com a flag ligada e duas opções, cada texto vem depois da própria referência', () => {
  const { leituras } = montarLeituras(
    {
      evangelho: [
        { referencia: 'Lc 2, 22-40', texto: 'longo' },
        { referencia: 'Lc 2, 22.39-40', texto: 'breve' },
      ],
    },
    true,
  );
  assert.deepEqual(leituras[0]?.texto, ['Lc 2,22-40', 'longo', 'Lc 2,22.39-40', 'breve']);
});

test('referência repetida não vira "A ou A"', () => {
  const { leituras } = montarLeituras(
    {
      evangelho: [
        { referencia: 'Lc 19,11-28', texto: 'a' },
        { referencia: 'Lc 19,11-28', texto: 'b' },
      ],
    },
    false,
  );
  assert.equal(leituras[0]?.referencia, 'Lc 19,11-28');
});

test('mais de 4 opções (Vigília Pascal tem 8 salmos): mostra a primeira e avisa', () => {
  const salmos = Array.from({ length: 8 }, (_, i) => ({ referencia: `Sl ${i + 1}`, texto: 'x' }));
  const { leituras, temLeiturasEspeciais } = montarLeituras({ salmo: salmos }, false);
  assert.equal(leituras[0]?.referencia, 'Sl 1');
  assert.equal(temLeiturasEspeciais, true);
});

test('leituras extras com referência marcam o dia como especial; sem referência, não', () => {
  const extra = montarLeituras({ extras: [{ tipo: 'Epístola', referencia: 'Rm 6,3-11' }] }, false);
  assert.equal(extra.temLeiturasEspeciais, true);
  const exulte = montarLeituras({ extras: [{ titulo: 'Proclamação da Páscoa (Exulte)' }] }, false);
  assert.equal(exulte.temLeiturasEspeciais, false);
});

test('leitura que falta na resposta (Vigília sem "evangelho") simplesmente não aparece', () => {
  const { leituras } = montarLeituras({ primeiraLeitura: [{ referencia: 'Gn 1,1-2,2' }] }, false);
  assert.deepEqual(
    leituras.map((l) => l.id),
    ['l1'],
  );
});

test('item sem referência, lixo e formas inesperadas são ignorados sem lançar erro', () => {
  assert.deepEqual(montarLeituras(undefined, false).leituras, []);
  assert.deepEqual(montarLeituras('texto', false).leituras, []);
  assert.deepEqual(montarLeituras([], false).leituras, []);
  const { leituras } = montarLeituras(
    {
      primeiraLeitura: [null, 7, { texto: 'sem referência' }, { referencia: '   ' }],
      salmo: 'não é lista',
      evangelho: [{ referencia: 'Lc 1,1-4' }],
    },
    false,
  );
  assert.deepEqual(
    leituras.map((l) => l.id),
    ['ev'],
  );
});

// ── converterLiturgia ───────────────────────────────────────────────────────────

test('converte a resposta completa da v2', () => {
  const l = converterLiturgia(resposta(), '2026-11-18');
  assert.ok(l);
  assert.equal(l.data, '2026-11-18');
  assert.equal(l.nome, '4ª feira');
  assert.equal(l.semana, '33ª Semana do Tempo Comum');
  assert.equal(l.tempo, 'Tempo Comum');
  assert.equal(l.cor, 'verde');
  assert.equal(l.leituras.length, 3);
});

test('com a flag desligada nada do texto (nem orações e antífonas) aparece no resultado', () => {
  const l = converterLiturgia(resposta(), '2026-11-18', false);
  assert.ok(!JSON.stringify(l).includes(SEGREDO));
  assert.ok(!JSON.stringify(l).includes(REFRAO));
});

test('data diferente da pedida: descarta (não publica a liturgia de outro dia)', () => {
  assert.equal(converterLiturgia(resposta({ data: '17/11/2026' }), '2026-11-18'), null);
  assert.equal(converterLiturgia(resposta({ data: undefined }), '2026-11-18'), null);
});

test('resposta fora do formato: null', () => {
  assert.equal(converterLiturgia(null, '2026-11-18'), null);
  assert.equal(converterLiturgia('oi', '2026-11-18'), null);
  assert.equal(converterLiturgia([], '2026-11-18'), null);
  assert.equal(converterLiturgia(resposta({ liturgia: '' }), '2026-11-18'), null);
  assert.equal(
    converterLiturgia({ erro: 'Não encontramos', data: '18/11/2026' }, '2026-11-18'),
    null,
  );
});

test('cor desconhecida cai em branco; cores conhecidas aceitam qualquer caixa', () => {
  assert.equal(converterLiturgia(resposta({ cor: 'Azul' }), '2026-11-18')?.cor, 'branco');
  assert.equal(converterLiturgia(resposta({ cor: undefined }), '2026-11-18')?.cor, 'branco');
  assert.equal(converterLiturgia(resposta({ cor: 'ROXO' }), '2026-11-18')?.cor, 'roxo');
  assert.equal(converterLiturgia(resposta({ cor: 'Rosa' }), '2026-11-18')?.cor, 'rosa');
});

test('dia sem leituras ainda devolve a celebração (a página decide o que mostrar)', () => {
  const l = converterLiturgia(resposta({ leituras: {} }), '2026-11-18');
  assert.ok(l);
  assert.deepEqual(l.leituras, []);
});

test('urlLiturgia monta dia, mês e ano', () => {
  assert.equal(
    urlLiturgia('2026-11-08'),
    'https://liturgia.up.railway.app/v2/?dia=08&mes=11&ano=2026',
  );
});

// ── buscarLiturgia ──────────────────────────────────────────────────────────────

const json = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), { status, headers: { 'content-type': 'application/json' } });

function simulador(...respostas: Array<Response | Error>) {
  const chamadas: string[] = [];
  const avisos: string[] = [];
  const fetcher = (async (url: string | URL | Request) => {
    chamadas.push(String(url));
    const proxima = respostas[Math.min(chamadas.length, respostas.length) - 1];
    if (proxima instanceof Error) throw proxima;
    return proxima!.clone();
  }) as typeof fetch;
  return {
    chamadas,
    avisos,
    opcoes: { fetcher, esperaMs: 0, aviso: (m: string) => avisos.push(m) },
  };
}

test('buscarLiturgia: resposta boa na primeira tentativa', async () => {
  const sim = simulador(json(resposta()));
  const l = await buscarLiturgia('2026-11-18', sim.opcoes);
  assert.equal(l?.semana, '33ª Semana do Tempo Comum');
  assert.equal(sim.chamadas.length, 1);
  assert.deepEqual(sim.avisos, []);
});

test('buscarLiturgia: 404 é "sem liturgia nesse dia" e não repete a chamada', async () => {
  const sim = simulador(json({ erro: 'Não encontramos', data: '01/02/2080' }, 404));
  assert.equal(await buscarLiturgia('2080-02-01', sim.opcoes), null);
  assert.equal(sim.chamadas.length, 1);
});

test('buscarLiturgia: 500 e depois sucesso (tenta de novo)', async () => {
  const sim = simulador(json({}, 502), json(resposta()));
  const l = await buscarLiturgia('2026-11-18', sim.opcoes);
  assert.ok(l);
  assert.equal(sim.chamadas.length, 2);
});

test('buscarLiturgia: erro de rede e timeout também repetem', async () => {
  const sim = simulador(new TypeError('fetch failed'), new Error('timeout'), json(resposta()));
  assert.ok(await buscarLiturgia('2026-11-18', sim.opcoes));
  assert.equal(sim.chamadas.length, 3);
});

test('buscarLiturgia: falha em todas as tentativas devolve null e avisa, sem lançar', async () => {
  const sim = simulador(json({}, 503));
  const l = await buscarLiturgia('2026-11-18', { ...sim.opcoes, tentativas: 3 });
  assert.equal(l, null);
  assert.equal(sim.chamadas.length, 3);
  assert.equal(sim.avisos.length, 1);
  assert.match(sim.avisos[0]!, /2026-11-18/);
  assert.match(sim.avisos[0]!, /HTTP 503/);
});

test('buscarLiturgia: 429 repete; outros 4xx não', async () => {
  const limitada = simulador(json({}, 429), json(resposta()));
  assert.ok(await buscarLiturgia('2026-11-18', limitada.opcoes));
  assert.equal(limitada.chamadas.length, 2);

  const invalida = simulador(json({}, 400));
  assert.equal(await buscarLiturgia('2026-11-18', invalida.opcoes), null);
  assert.equal(invalida.chamadas.length, 1);
  assert.equal(invalida.avisos.length, 1);
});

test('buscarLiturgia: resposta de outro dia ou fora do formato: null, avisa e não repete', async () => {
  const outroDia = simulador(json(resposta({ data: '19/11/2026' })));
  assert.equal(await buscarLiturgia('2026-11-18', outroDia.opcoes), null);
  assert.equal(outroDia.chamadas.length, 1);
  assert.equal(outroDia.avisos.length, 1);
});

test('buscarLiturgia: corpo que não é JSON conta como falha, sem lançar', async () => {
  const sim = simulador(new Response('<html>erro</html>', { status: 200 }));
  assert.equal(await buscarLiturgia('2026-11-18', { ...sim.opcoes, tentativas: 2 }), null);
  assert.equal(sim.chamadas.length, 2);
});

test('buscarLiturgia respeita a flag do texto integral', async () => {
  const sem = await buscarLiturgia('2026-11-18', simulador(json(resposta())).opcoes);
  assert.ok(!JSON.stringify(sem).includes(SEGREDO));
  const com = await buscarLiturgia('2026-11-18', {
    ...simulador(json(resposta())).opcoes,
    textoIntegral: true,
  });
  assert.ok(JSON.stringify(com).includes(SEGREDO));
});

// ── ligação com os componentes ──────────────────────────────────────────────────

test('leiturasDoCard sem texto integral: só rótulo e referência, nada de texto', () => {
  const l = converterLiturgia(resposta(), '2026-11-18', false);
  const card = leiturasDoCard(l!.leituras);
  assert.deepEqual(card, [
    { id: 'l1', rotulo: '1ª Leitura', referencia: 'Ap 4,1-11', texto: undefined },
    { id: 'sl', rotulo: 'Salmo', referencia: 'Sl 150', texto: undefined },
    { id: 'ev', rotulo: 'Evangelho', referencia: 'Lc 19,11-28', texto: undefined },
  ]);
  assert.ok(!JSON.stringify(card).includes(SEGREDO));
});

test('leiturasDoCard com texto integral: o refrão abre o texto do salmo', () => {
  const l = converterLiturgia(resposta(), '2026-11-18', true);
  const salmo = leiturasDoCard(l!.leituras).find((x) => x.id === 'sl');
  // O texto do salmo na API começa com "– " (resposta do povo); o adaptador não mexe nisso.
  assert.deepEqual(salmo?.texto, [`R. ${REFRAO}`, `– ${SEGREDO} dois`]);
  const primeira = leiturasDoCard(l!.leituras).find((x) => x.id === 'l1');
  assert.deepEqual(primeira?.texto, [`${SEGREDO} um`]);
});

test('evangelhoDoDia acha o Evangelho e tolera a falta dele', () => {
  const l = converterLiturgia(resposta(), '2026-11-18');
  assert.equal(evangelhoDoDia(l)?.referencia, 'Lc 19,11-28');
  assert.equal(evangelhoDoDia(null), undefined);
  const semEvangelho = converterLiturgia(
    resposta({ leituras: { primeiraLeitura: [{ referencia: 'Gn 1,1-2,2' }] } }),
    '2026-11-18',
  );
  assert.equal(evangelhoDoDia(semEvangelho), undefined);
});

// ── flag ────────────────────────────────────────────────────────────────────────

test('textoIntegralLigado: só "true" liga; qualquer outra coisa é desligado', () => {
  assert.equal(textoIntegralLigado('true'), true);
  assert.equal(textoIntegralLigado(' TRUE '), true);
  for (const valor of ['false', '', '1', 'sim', 'yes', undefined]) {
    assert.equal(textoIntegralLigado(valor), false, `valor ${String(valor)}`);
  }
});
