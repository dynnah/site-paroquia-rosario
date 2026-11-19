import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PAROQUIA, dadosDaParoquia, urlTelefone, urlWhatsApp } from './paroquia.ts';
import { propsCardPastoral } from './pastorais.ts';
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
  familia: 'mariano',
  categoria: 'Movimento',
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
  assert.deepEqual(card.acao, { rotulo: 'Saber mais', href: '/pastorais/pastoral-jovem' });
  assert.equal(card.familia, 'mariano');
});

test('card de pastoral sem encontros nem responsável não traz linhas vazias', () => {
  const card = propsCardPastoral({ ...pastoral, encontros: undefined, responsavel: undefined });
  assert.deepEqual(card.info, []);
});
