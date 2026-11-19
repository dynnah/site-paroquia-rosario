import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  validarCep,
  slugificar,
  validarDuracao,
  validarHora,
  validarMesDia,
  validarYouTube,
} from '../schemas/validacoes.ts';
import { dataEmDias, gerarDocumentos, instante } from './exemplos.ts';

// Terça, 17 de novembro de 2026, 10h em São Paulo (13h UTC).
const AGORA = new Date('2026-11-17T13:00:00Z');
const documentos = gerarDocumentos(AGORA);
const doTipo = (tipo: string) => documentos.filter((d) => d._type === tipo);

const TIPOS = [
  'configuracoes',
  'horarios',
  'aviso',
  'evento',
  'sacramento',
  'autor',
  'post',
  'santo',
  'pagina',
];

test('todos os tipos do modelo têm ao menos um exemplo', () => {
  for (const tipo of TIPOS) assert.ok(doTipo(tipo).length > 0, `sem exemplo de ${tipo}`);
});

test('IDs são únicos e não têm ponto (ponto torna o documento privado)', () => {
  const ids = documentos.map((d) => d._id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.ok(!id.includes('.'), `ID com ponto: ${id}`);
});

test('documentos únicos usam o nome do tipo como _id', () => {
  assert.equal(doTipo('configuracoes')[0]._id, 'configuracoes');
  assert.equal(doTipo('horarios')[0]._id, 'horarios');
});

test('todo conteúdo inventado carrega o marcador [EXEMPLO]', () => {
  const semMarca = documentos.filter((d) => {
    if (['configuracoes', 'horarios', 'pagina', 'santo'].includes(d._type)) return false;
    return !JSON.stringify(d).includes('[EXEMPLO]');
  });
  assert.deepEqual(
    semMarca.map((d) => d._id),
    [],
  );
});

test('slugs seguem o formato gerado pelo Studio', () => {
  for (const d of documentos) {
    const slug = (d.slug as { current: string } | undefined)?.current;
    if (slug) assert.equal(slug, slugificar(slug), `slug inválido em ${d._id}`);
  }
});

test('referências de post apontam para autores que existem', () => {
  const autores = new Set(doTipo('autor').map((a) => a._id));
  for (const p of doTipo('post')) {
    assert.ok(autores.has((p.autor as { _ref: string })._ref), `autor ausente em ${p._id}`);
  }
});

test('limites de tamanho dos schemas são respeitados', () => {
  for (const p of doTipo('post')) assert.ok(String(p.resumo).length <= 220, p._id);
  for (const a of doTipo('aviso')) assert.ok(String(a.texto).length <= 160, a._id);
  for (const s of doTipo('sacramento')) assert.ok(String(s.resumo).length <= 200, s._id);
  for (const s of doTipo('santo')) assert.ok(String(s.bio).length <= 320, s._id);
});

test('santos, posts de vídeo e horários passam nas validações dos campos', () => {
  for (const s of doTipo('santo')) assert.equal(validarMesDia(s.dia as string), true, s._id);
  for (const p of doTipo('post')) {
    assert.equal(validarYouTube(p.youtube as string | undefined), true, p._id);
    assert.equal(validarDuracao(p.duracaoVideo as string | undefined), true, p._id);
  }
  const grupos = doTipo('horarios')[0];
  for (const tipo of ['missa', 'confissao', 'adoracao', 'rosario', 'secretaria']) {
    const { linhas } = grupos[tipo] as {
      linhas: { rotulo: string; dias: number[]; horas: string[]; nota?: string }[];
    };
    for (const l of linhas) {
      assert.ok(l.dias.length > 0, `${tipo}/${l.rotulo} sem dias`);
      for (const h of l.horas) assert.equal(validarHora(h), true, `${tipo}/${l.rotulo}: ${h}`);
      if (l.horas.length === 0)
        assert.ok(l.nota, `${tipo}/${l.rotulo}: sem horário exige observação`);
    }
  }
});

test('a tabela de missas cobre os sete dias da semana', () => {
  const { linhas } = doTipo('horarios')[0].missa as { linhas: { dias: number[] }[] };
  assert.deepEqual([...new Set(linhas.flatMap((l) => l.dias))].sort(), [0, 1, 2, 3, 4, 5, 6]);
});

test('há santo cadastrado para a data de hoje', () => {
  const hoje = dataEmDias(AGORA, 0).slice(5);
  assert.equal(hoje, '11-17');
  assert.ok(doTipo('santo').some((s) => s.dia === hoje));
});

test('instante respeita o fuso de São Paulo (UTC−3)', () => {
  assert.equal(instante(AGORA, 0, 17), '2026-11-17T20:00:00.000Z');
  assert.equal(instante(AGORA, 1, 7, 30), '2026-11-18T10:30:00.000Z');
  // 00h30 em São Paulo ainda é "ontem" em UTC: o dia local manda.
  assert.equal(dataEmDias(new Date('2026-11-18T03:30:00Z'), 0), '2026-11-18');
});

test('os CEPs das configurações (matriz e capelas) são válidos', () => {
  const { endereco } = doTipo('configuracoes')[0] as unknown as { endereco: { cep?: string } };
  assert.equal(validarCep(endereco.cep), true);
  assert.ok(endereco.cep);
});

test('as capelas das configurações têm nome, rua e CEP válido', () => {
  const { capelas } = doTipo('configuracoes')[0] as unknown as {
    capelas: { _key: string; nome: string; rua: string; uf: string; cep?: string }[];
  };
  assert.ok(capelas.length > 0);
  for (const c of capelas) {
    assert.ok(c._key && c.nome && c.rua);
    assert.equal(c.uf, 'PB');
    assert.equal(validarCep(c.cep), true, c.nome);
  }
  assert.equal(new Set(capelas.map((c) => c._key)).size, capelas.length, 'chaves repetidas');
});
