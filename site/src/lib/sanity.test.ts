/**
 * Roda as consultas GROQ de verdade (groq-js, em memória) contra o conteúdo de
 * exemplo do Studio. Assim uma consulta quebrada ou um campo renomeado no
 * schema aparece aqui, sem precisar de rede nem de projeto no Sanity.
 */
import assert from 'node:assert/strict';
import { mock, test } from 'node:test';
import { evaluate, parse } from 'groq-js';
// Teste lê o seed do outro workspace de propósito: é a fonte única dos exemplos.
import { gerarComunidade } from '../../../studio/seed/comunidade.ts';
import { gerarDocumentos } from '../../../studio/seed/exemplos.ts';
import { gerarHistoria } from '../../../studio/seed/historia.ts';
import {
  buscarNoSanity,
  criarConteudo,
  dataISO,
  mesDia,
  minutosDeLeitura,
  type Buscar,
} from './sanity.ts';

// Terça, 17 de novembro de 2026, 10h em São Paulo.
const AGORA = new Date('2026-11-17T13:00:00Z');
const documentos = [...gerarDocumentos(AGORA), ...gerarComunidade(), ...gerarHistoria()];

function fonteEmMemoria(): Buscar {
  return async <T>(consulta: string, params: Record<string, unknown>) => {
    const arvore = parse(consulta, { params });
    const valor = await evaluate(arvore, { dataset: documentos, params });
    return (await valor.get()) as T;
  };
}

const conteudo = criarConteudo(fonteEmMemoria(), () => AGORA);
const ids = (lista: { _id: string }[]) => lista.map((item) => item._id);

test('configuracoes devolve os dados institucionais', async () => {
  const c = await conteudo.configuracoes();
  assert.equal(c?.nome, 'Paróquia Nossa Senhora do Rosário');
  assert.equal(c?.endereco?.bairro, 'Jaguaribe');
  assert.equal(c?.instagram, 'paroquiadorosariojp');
  assert.ok(c?.pixChave?.startsWith('[EXEMPLO]'));
});

test('horarios traz os quatro grupos, com horas sempre presentes', async () => {
  const h = await conteudo.horarios();
  assert.ok(h);
  for (const tipo of ['missa', 'confissao', 'adoracao', 'secretaria'] as const) {
    assert.ok(Array.isArray(h[tipo].linhas), tipo);
    for (const linha of h[tipo].linhas) assert.ok(Array.isArray(linha.horas), linha.rotulo);
  }
  const segunda = h.missa.linhas.find((l) => l.rotulo === 'Segunda');
  assert.deepEqual(segunda?.horas, []);
  assert.equal(segunda?.nota, 'Sem missa');
  assert.deepEqual(h.missa.linhas.find((l) => l.rotulo === 'Domingo')?.horas, ['07:00', '17:00']);
});

test('avisosAtivos só traz avisos dentro do período', async () => {
  const avisos = await conteudo.avisosAtivos();
  assert.deepEqual(ids(avisos), ['exemplo-aviso-semana']);
  assert.deepEqual(avisos[0].link, { rotulo: 'Ver horários', href: '/horarios' });
});

test('avisosAtivos aparece quando a data entra no período', async () => {
  const futuro = criarConteudo(fonteEmMemoria(), () => new Date('2026-12-10T12:00:00Z'));
  assert.deepEqual(ids(await futuro.avisosAtivos()), ['exemplo-aviso-festa']);
});

test('eventosProximos ordena por data e ignora os que já passaram', async () => {
  const eventos = await conteudo.eventosProximos(10);
  assert.deepEqual(ids(eventos), [
    'exemplo-evento-padrao',
    'exemplo-evento-festa',
    'exemplo-evento-franciscano',
  ]);
  assert.equal(eventos[1].slug, 'exemplo-festa-de-nossa-senhora-do-rosario');
  assert.equal(eventos[1].destaque, 'do Rosário');
  assert.deepEqual(ids(await conteudo.eventosProximos(2)), [
    'exemplo-evento-padrao',
    'exemplo-evento-festa',
  ]);
});

test('evento por slug traz a descrição; slug desconhecido dá null', async () => {
  const evento = await conteudo.evento('exemplo-encontro-de-formacao');
  assert.equal(evento?.local, 'Salão paroquial');
  assert.ok((evento?.descricao?.length ?? 0) > 0);
  assert.equal(await conteudo.evento('nao-existe'), null);
});

test('pastorais vêm em ordem alfabética do português, sem separar maiúsculas nem acentos', async () => {
  const fonte = [
    { slug: 'a', nome: 'Pastoral Familiar' },
    { slug: 'b', nome: 'Pastoral da Crisma' },
    { slug: 'c', nome: 'Élohim' },
    { slug: 'd', nome: 'Abba' },
  ];
  const ordenadas = await criarConteudo((async () => fonte) as never).pastorais();
  assert.deepEqual(
    ordenadas.map((p) => p.nome),
    ['Abba', 'Élohim', 'Pastoral da Crisma', 'Pastoral Familiar'],
  );
});

test('pastorais vêm em ordem alfabética, com tipo e botão', async () => {
  const lista = await conteudo.pastorais();
  assert.equal(lista.length, 13);
  assert.deepEqual(
    lista.map((p) => p.nome),
    [...lista.map((p) => p.nome)].sort((a, b) => a.localeCompare(b, 'pt-BR')),
  );
  const ejc = lista.find((p) => p.slug === 'ejc-rosario');
  assert.equal(ejc?.tipo, 'movimento');
  assert.deepEqual([...new Set(lista.map((p) => p.tipo))].sort(), [
    'grupo',
    'ministerio',
    'movimento',
    'pastoral',
    'projeto',
  ]);
  assert.equal(ejc?.categoria, 'Encontro de Jovens com Cristo');
  assert.equal(ejc?.link?.rotulo, 'Seguir no Instagram');
  assert.equal(ejc?.link?.href, 'https://www.instagram.com/ejcrosariojp/');
  const detalhe = await conteudo.pastoral('ejc-rosario');
  assert.equal(detalhe?.nome, 'EJC Rosário');
  assert.ok(!detalhe?.sobre, 'sem texto próprio, a página mostra só o contato');
});

test('sacramentos seguem a posição e escondem turmas que já passaram', async () => {
  const lista = await conteudo.sacramentos();
  assert.deepEqual(
    lista.map((s) => s.slug),
    ['exemplo-batismo', 'exemplo-primeira-eucaristia', 'exemplo-crisma', 'exemplo-matrimonio'],
  );
  assert.equal(lista[0].proximasTurmas.length, 1);
  assert.deepEqual(lista[1].requisitos.length, 1);
  assert.deepEqual(lista[1].proximasTurmas, []);

  const depois = criarConteudo(fonteEmMemoria(), () => new Date('2027-01-01T12:00:00Z'));
  const batismo = (await depois.sacramentos()).find((s) => s.slug === 'exemplo-batismo');
  assert.deepEqual(batismo?.proximasTurmas, []);
  const detalhe = await depois.sacramento('exemplo-crisma');
  assert.equal(detalhe?.proximasTurmas.length, 1);
});

test('posts: só aprovados e já publicados, do mais novo para o mais antigo', async () => {
  const { posts, total } = await conteudo.posts();
  assert.equal(total, 4);
  assert.deepEqual(ids(posts), [
    'exemplo-post-video',
    'exemplo-post-paroco',
    'exemplo-post-juventude',
    'exemplo-post-outra',
  ]);
  assert.ok(!ids(posts).includes('exemplo-post-em-revisao'));
  assert.ok(!ids(posts).includes('exemplo-post-agendado'));
});

test('posts trazem autor resolvido, nome da coluna e palavras', async () => {
  const { posts } = await conteudo.posts();
  const porId = Object.fromEntries(posts.map((p) => [p._id, p]));
  assert.equal(porId['exemplo-post-paroco'].colunaNome, 'Palavra do Pároco');
  assert.equal(porId['exemplo-post-juventude'].colunaNome, 'Juventude');
  assert.equal(porId['exemplo-post-outra'].colunaNome, 'Catequese');
  assert.equal(porId['exemplo-post-paroco'].autor.funcao, 'Pároco');
  assert.ok(porId['exemplo-post-paroco'].palavras > 0);
  assert.equal(porId['exemplo-post-video'].palavras, 0);
  assert.equal(porId['exemplo-post-video'].duracaoVideo, '6:40');
  assert.ok(porId['exemplo-post-video'].youtube?.includes('aqz-KE-bpKQ'));
});

test('filtros do blog: coluna e vídeos', async () => {
  assert.deepEqual(ids((await conteudo.posts('paroco')).posts), [
    'exemplo-post-video',
    'exemplo-post-paroco',
  ]);
  assert.deepEqual(ids((await conteudo.posts('juventude')).posts), ['exemplo-post-juventude']);
  assert.deepEqual(ids((await conteudo.posts('outra')).posts), ['exemplo-post-outra']);
  const videos = await conteudo.posts('videos');
  assert.deepEqual(ids(videos.posts), ['exemplo-post-video']);
  assert.equal(videos.total, 1);
});

test('paginação do blog calcula páginas e corrige página fora do limite', async () => {
  const primeira = await conteudo.posts('tudo', 1, 3);
  assert.equal(primeira.posts.length, 3);
  assert.equal(primeira.totalPaginas, 2);
  const segunda = await conteudo.posts('tudo', 2, 3);
  assert.equal(segunda.posts.length, 1);
  assert.equal(segunda.pagina, 2);
  const alem = await conteudo.posts('tudo', 99, 3);
  assert.equal(alem.pagina, 2);
  const vazio = await conteudo.posts('videos', 1, 3);
  assert.equal(vazio.totalPaginas, 1);
});

test('post por slug traz o texto; rascunho, em revisão e agendado dão null', async () => {
  const post = await conteudo.post('exemplo-palavra-do-paroco');
  assert.equal(post?.corpo?.length, 3);
  assert.equal(await conteudo.post('exemplo-post-em-revisao'), null);
  assert.equal(await conteudo.post('exemplo-post-agendado'), null);
  assert.equal(await conteudo.post('nao-existe'), null);
});

test('post agendado aparece depois da data de publicação', async () => {
  const depois = criarConteudo(fonteEmMemoria(), () => new Date('2026-11-23T12:00:00Z'));
  assert.ok((await depois.post('exemplo-post-agendado')) !== null);
});

test('santosDoDia usa o dia de São Paulo', async () => {
  const hoje = await conteudo.santosDoDia();
  assert.ok(hoje.some((s) => s.nome === 'Santa Isabel' && s.grau === 'memoria'));
  assert.ok(hoje.every((s) => s.dia === '11-17'));

  const noite = new Date('2026-10-05T02:30:00Z'); // 4 de outubro, 23h30 em São Paulo
  const [francisco] = await conteudo.santosDoDia(noite);
  assert.equal(francisco.destaque, 'de Assis');
  assert.equal(francisco.grau, 'festa');
  assert.deepEqual(await conteudo.santosDoDia(new Date('2026-03-03T15:00:00Z')), []);
});

test('pagina por slug', async () => {
  const pagina = await conteudo.pagina('nossa-historia');
  assert.equal(pagina?.titulo, 'Nossa história');
  assert.ok((pagina?.corpo.length ?? 0) > 0);
  assert.equal(await conteudo.pagina('nao-existe'), null);
});

test('slugs para getStaticPaths: posts só os publicáveis, o resto todos', async () => {
  assert.equal((await conteudo.slugs('post')).length, 4);
  assert.equal((await conteudo.slugs('evento')).length, 4);
  assert.equal((await conteudo.slugs('pastoral')).length, 13);
  assert.equal((await conteudo.slugs('sacramento')).length, 4);
  assert.deepEqual(await conteudo.slugs('pagina'), ['nossa-historia']);
});

test('minutosDeLeitura', () => {
  assert.equal(minutosDeLeitura(0), 1);
  assert.equal(minutosDeLeitura(undefined), 1);
  assert.equal(minutosDeLeitura(200), 1);
  assert.equal(minutosDeLeitura(201), 2);
  assert.equal(minutosDeLeitura(1000), 5);
});

test('dataISO e mesDia usam o fuso de São Paulo', () => {
  const quaseMeiaNoite = new Date('2026-11-18T02:00:00Z'); // 23h de 17/11 em São Paulo
  assert.equal(dataISO(quaseMeiaNoite), '2026-11-17');
  assert.equal(mesDia(quaseMeiaNoite), '11-17');
  assert.equal(mesDia(new Date('2026-01-01T03:00:00Z')), '01-01');
});

test('sem projeto configurado, o dev recebe o valor vazio e um aviso', async () => {
  const aviso = mock.method(console, 'warn', () => {});
  assert.deepEqual(await buscarNoSanity('*[_type == "x"]', {}, []), []);
  assert.equal(await buscarNoSanity('*[0]', {}, null), null);
  assert.equal(aviso.mock.callCount(), 1); // avisa uma vez só
  aviso.mock.restore();
});
