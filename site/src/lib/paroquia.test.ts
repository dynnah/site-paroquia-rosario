import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  PAROQUIA,
  dadosDaParoquia,
  enderecoDoLocal,
  linksDeContatoDoRodape,
  locaisDaParoquia,
  urlMapa,
  urlMapaDoLocal,
  urlTelefone,
  urlWhatsApp,
} from './paroquia.ts';
import { propsCardPastoral, secoesDaComunidade, sobrelinhaDaPastoral } from './pastorais.ts';
import type { Pastoral } from './sanity.tipos.ts';

test('sem configuração no Sanity, usa os dados de reserva', () => {
  assert.equal(dadosDaParoquia(null), PAROQUIA);
  assert.equal(dadosDaParoquia(undefined), PAROQUIA);
});

test('campos preenchidos no painel vencem; os vazios caem na reserva', () => {
  const dados = dadosDaParoquia({
    nome: 'Paróquia Nossa Senhora do Rosário',
    instagram: '@paroquiadorosariojp',
    whatsapp: '5583999990000',
    endereco: { rua: 'Rua Nova, 10' },
  });
  assert.equal(dados.instagram, 'paroquiadorosariojp');
  assert.equal(dados.whatsapp, '5583999990000');
  assert.equal(dados.endereco.rua, 'Rua Nova, 10');
  // bairro não veio do painel: mantém o da reserva
  assert.equal(dados.endereco.bairro, 'Jaguaribe');
  assert.equal(dados.assinatura, PAROQUIA.assinatura);
  assert.equal(dados.email, undefined);
});

test('urlWhatsApp aceita o número com ou sem o 55 e com a pontuação do telefone', () => {
  assert.equal(urlWhatsApp('558332411433'), 'https://wa.me/558332411433');
  assert.equal(urlWhatsApp('5583999990000'), 'https://wa.me/5583999990000');
  assert.equal(urlWhatsApp('(83) 3241-1433'), 'https://wa.me/558332411433');
  assert.equal(urlWhatsApp('(83) 99999-0000'), 'https://wa.me/5583999990000');
  assert.equal(urlWhatsApp(undefined), undefined);
  assert.equal(urlWhatsApp('  '), undefined);
});

test('urlTelefone mantém só dígitos e o +', () => {
  assert.equal(urlTelefone('(83) 3333-4444'), 'tel:8333334444');
  assert.equal(urlTelefone('+55 83 99999-0000'), 'tel:+5583999990000');
  assert.equal(urlTelefone(undefined), undefined);
  assert.equal(urlTelefone('  '), undefined);
});

const pastoral: Pastoral = {
  _id: 'x',
  slug: 'pastoral-jovem',
  nome: 'Pastoral da Juventude',
  tipo: 'movimento',
  categoria: 'Jovens',
  descricao: 'Encontros e formação para jovens.',
  encontros: 'Sábados, 19h',
  responsavel: 'Coordenação da juventude',
  contato: 'secretaria',
};

test('card de pastoral: encontros e responsável viram linhas de informação', () => {
  const card = propsCardPastoral(pastoral);
  assert.deepEqual(card.info, [
    { rotulo: 'Encontros', valor: 'Sábados, 19h' },
    { rotulo: 'Responsável', valor: 'Coordenação da juventude' },
  ]);
  assert.deepEqual(card.acao, { rotulo: 'Saber mais', href: '/nossa-comunidade/pastoral-jovem' });
  assert.equal(card.categoria, 'Jovens');
});

test('o tom do filete: pastoral no marrom escuro; os demais tipos no mais claro', () => {
  assert.equal(propsCardPastoral({ ...pastoral, tipo: 'pastoral' }).tom, 'pastoral');
  assert.equal(propsCardPastoral({ ...pastoral, tipo: 'movimento' }).tom, 'movimento');
  assert.equal(propsCardPastoral({ ...pastoral, tipo: 'grupo' }).tom, 'movimento');
  assert.equal(propsCardPastoral({ ...pastoral, tipo: 'ministerio' }).tom, 'movimento');
  assert.equal(propsCardPastoral({ ...pastoral, tipo: 'projeto' }).tom, 'movimento');
});

test('sem categoria, a sobrelinha do card é o tipo', () => {
  assert.equal(propsCardPastoral({ ...pastoral, categoria: undefined }).categoria, 'Movimento');
  assert.equal(propsCardPastoral({ ...pastoral, tipo: 'grupo', categoria: '' }).categoria, 'Grupo');
});

test('a sobrelinha não repete o tipo que o nome já diz', () => {
  const base = { nome: 'Pastoral da Crisma', tipo: 'pastoral' as const, categoria: undefined };
  assert.equal(sobrelinhaDaPastoral(base), undefined);
  assert.equal(
    sobrelinhaDaPastoral({ ...base, nome: 'Grupo de Adoração Jovem', tipo: 'grupo' }),
    undefined,
  );
  assert.equal(sobrelinhaDaPastoral({ ...base, nome: 'Atuemos', tipo: 'grupo' }), 'Grupo');
  assert.equal(
    sobrelinhaDaPastoral({
      ...base,
      nome: 'Atuemos',
      tipo: 'grupo',
      categoria: 'Ministério de teatro',
    }),
    'Ministério de teatro',
  );
});

test('uma pastoral sem descrição não quebra o card', () => {
  const card = propsCardPastoral({ ...pastoral, descricao: undefined });
  assert.equal(card.descricao, undefined);
});

test('a página separa a lista nas quatro seções, mantendo a ordem', () => {
  const lista: Pastoral[] = [
    { ...pastoral, slug: 'a', tipo: 'grupo' },
    { ...pastoral, slug: 'b', tipo: 'pastoral' },
    { ...pastoral, slug: 'c', tipo: 'movimento' },
    { ...pastoral, slug: 'd', tipo: 'pastoral' },
    { ...pastoral, slug: 'e', tipo: 'projeto' },
    { ...pastoral, slug: 'f', tipo: 'ministerio' },
  ];
  const secoes = secoesDaComunidade(lista);
  const slugs = (itens: Pastoral[]) => itens.map((p) => p.slug);
  assert.deepEqual(slugs(secoes.pastorais), ['b', 'd']);
  assert.deepEqual(slugs(secoes.gruposEMovimentos), ['a', 'c']);
  assert.deepEqual(slugs(secoes.ministerios), ['f']);
  assert.deepEqual(slugs(secoes.projetos), ['e']);
});

// ── locais: matriz e capelas ────────────────────────────────────────────────────

test('a matriz vem primeiro, seguida da Capela São Cristóvão com o endereço informado', () => {
  const locais = locaisDaParoquia(PAROQUIA);
  assert.deepEqual(
    locais.map((l) => l.nome),
    ['Matriz', 'Capela São Cristóvão'],
  );
  assert.deepEqual(enderecoDoLocal(locais[0]!), [
    'Rua Frei Martinho, s/n',
    'Jaguaribe · João Pessoa – PB',
    'CEP 58014-430',
  ]);
  assert.deepEqual(enderecoDoLocal(locais[1]!), [
    'R. São Cristóvão, 211',
    'Jaguaribe · João Pessoa – PB',
    'CEP 58015-310',
  ]);
});

test('o "Como chegar" de cada local procura o endereço dele; o da matriz não mudou', () => {
  const [matriz, capela] = locaisDaParoquia(PAROQUIA);
  const consulta = (url: string) =>
    decodeURIComponent(new URL(url).searchParams.get('query') ?? '');
  assert.equal(
    consulta(urlMapa(PAROQUIA)),
    'Paróquia Nossa Senhora do Rosário, Rua Frei Martinho, Jaguaribe, João Pessoa - PB, 58014-430',
  );
  assert.equal(
    consulta(urlMapaDoLocal(capela!, capela!.nome)),
    'Capela São Cristóvão, R. São Cristóvão, 211, Jaguaribe, João Pessoa - PB, 58015-310',
  );
  assert.equal(
    urlMapaDoLocal({ ...matriz!, mapaUrl: 'https://maps.app.goo.gl/x' }, 'x'),
    'https://maps.app.goo.gl/x',
  );
});

test('capelas do painel substituem a reserva; as incompletas são ignoradas', () => {
  const dados = dadosDaParoquia({
    nome: 'Paróquia',
    capelas: [
      { nome: ' Capela Sagrada Família ', rua: 'Rua Exemplo, 10', cep: '58015-000' },
      { nome: 'Sem rua' },
      { rua: 'Sem nome, 1' },
    ],
  });
  assert.equal(dados.capelas.length, 1);
  assert.deepEqual(dados.capelas[0], {
    nome: 'Capela Sagrada Família',
    rua: 'Rua Exemplo, 10',
    // o que ficou vazio herda da matriz
    bairro: 'Jaguaribe',
    cidade: 'João Pessoa',
    uf: 'PB',
    cep: '58015-000',
  });
});

test('sem capela válida no painel, vale a reserva do código', () => {
  assert.deepEqual(dadosDaParoquia({ nome: 'Paróquia', capelas: [] }).capelas, PAROQUIA.capelas);
  assert.deepEqual(
    dadosDaParoquia({ nome: 'Paróquia', capelas: [{ nome: 'Só o nome' }] }).capelas,
    PAROQUIA.capelas,
  );
});

test('rodapé: WhatsApp e ligação são dois links, cada um com o número da secretaria', () => {
  const links = linksDeContatoDoRodape(PAROQUIA);
  assert.deepEqual(links, [
    { rotulo: 'WhatsApp · (83) 3241-1433', href: 'https://wa.me/558332411433' },
    { rotulo: 'Ligar · (83) 3241-1433', href: 'tel:8332411433' },
  ]);
});

test('rodapé: WhatsApp em outro número não mostra o número do telefone; e-mail entra por último', () => {
  const links = linksDeContatoDoRodape({
    telefone: '(83) 3241-1433',
    whatsapp: '5583999990000',
    email: 'secretaria@exemplo.org',
  });
  assert.deepEqual(links, [
    { rotulo: 'WhatsApp', href: 'https://wa.me/5583999990000' },
    { rotulo: 'Ligar · (83) 3241-1433', href: 'tel:8332411433' },
    { rotulo: 'secretaria@exemplo.org', href: 'mailto:secretaria@exemplo.org' },
  ]);
});

test('rodapé: sem WhatsApp cadastrado, o telefone ainda abre a conversa; sem nada, sem links', () => {
  assert.deepEqual(
    linksDeContatoDoRodape({ telefone: '(83) 3241-1433' }).map((l) => l.href),
    ['https://wa.me/558332411433', 'tel:8332411433'],
  );
  assert.deepEqual(linksDeContatoDoRodape({}), []);
});
