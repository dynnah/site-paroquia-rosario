/**
 * Texto da página "Nossa história", enviado pela Dynnah em 20/11/2026.
 *
 * Só foram feitos ajustes de forma: tirados os números de nota de rodapé (`[ 2 ]`), os espaços
 * que sobraram antes da vírgula e do ponto, e as aspas retas viraram “ ”. A palavra "História" que
 * abria a seção não entrou, porque o título da página já é "Nossa história".
 *
 * No terceiro parágrafo, as aspas de “Deus sabe onde e de quem” só fechavam. A Dynnah confirmou em
 * 20/11/2026 que a citação começa em "Deus", e a abertura foi posta ali.
 *
 * O texto vem da Wikipédia (licença CC BY-SA 4.0), que exige crédito e o link da licença: por isso
 * a página termina com a linha de `CREDITO_HISTORIA`. Não tire essa linha sem trocar a fonte.
 *
 * O ID é fixo: importar de novo com `--replace` atualiza o mesmo documento.
 */
import type { DocumentoSeed } from './exemplos.ts';

export const PARAGRAFOS_HISTORIA = [
  'A Igreja e Convento de Nossa Senhora do Rosário é uma igreja e convento dedicados a Nossa Senhora do Rosário, localizados no bairro de Jaguaribe, no Centro Histórico de João Pessoa, capital do estado brasileiro da Paraíba. Destaca-se pela qualidade de sua arquitetura neoclássica.',

  'As pedras para a construção do convento e da igreja do Rosário foram encomendadas em várias cidades, em paróquias, no comércio. Frei Martinho dirigiu-se às feiras, ao povo simples e pediu “pelo amor de Deus”. Seu fiel assistente, Frei Amadeu, bateu às portas de seus amigos. As doações vieram através da campanha de centavos, festa popular, festa de telhas, leilões, sorteios, rifas e outros meios de arrecadação de fundos.',

  'O livro Frei Martinho – Uma herança viva da fé cristã também registra que as frequentes situações precárias que enfrentou revelavam a confiança filial de Frei Martinho na Divina Providência. “Ele tinha a confiança de um santo”, diziam seus confrades. “Eu sei, ó Pai, que muitas vezes me ouviste”, rezava sempre. Quando não havia mais nada a oferecer, ia de braços abertos à Rainha do Rosário, cujo santuário ali fora construído; a São José, Santo Antônio e às almas do purgatório. Na última hora, ele sempre recebia a quantia necessária, “Deus sabe onde e de quem”, diz o texto da coleta sobre o franciscano que viveu na Paraíba de 1911 a 1930. Uma circular do Arcebispo D. Adauto ajudou nas coletas que foram estendidas às Dioceses de Natal, Crato e Nazaré. A pedra fundamental foi lançada em 29 de junho de 1927, com a bênção de D. Adauto, com a presença de autoridades, do clero e de uma grande multidão.',

  'Eles ajudaram Frei Martinho na construção da nova igreja Frei Amadeu Laumann e Frei José Jost, carpinteiro, entre outros. Em 1º de novembro de 1928, pouco mais de um ano após a bênção da primeira pedra, serviços divinos já podiam ser celebrados em uma parte improvisada da nova construção. Em 2 de fevereiro de 1929, os frades foram transferidos da Igreja de São Pedro González para Nossa Senhora do Rosário. Antes, a Ordem Franciscana havia alugado uma casa onde ficavam durante o dia.',
];

export const ARTIGO_WIKIPEDIA =
  'https://en.wikipedia.org/wiki/Church_and_Convent_of_Our_Lady_of_the_Rosary_(Jo%C3%A3o_Pessoa)';
export const LICENCA_CC_BY_SA = 'https://creativecommons.org/licenses/by-sa/4.0/deed.pt-br';

/** Linha de crédito no fim da página: cada trecho com `href` vira um link. */
export const CREDITO_HISTORIA = [
  { texto: 'Texto traduzido e adaptado do artigo “' },
  { texto: 'Church and Convent of Our Lady of the Rosary (João Pessoa)', href: ARTIGO_WIKIPEDIA },
  { texto: '”, da Wikipédia, sob a licença ' },
  { texto: 'CC BY-SA 4.0', href: LICENCA_CC_BY_SA },
  { texto: '.' },
];

/** Chaves fixas (`h1`, `h2`…): importar de novo não troca as chaves dos blocos. */
function bloco(texto: string, indice: number) {
  return {
    _type: 'block',
    _key: `h${indice + 1}`,
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: `h${indice + 1}s`, text: texto, marks: [] }],
  };
}

function blocoCredito() {
  const ligacoes = CREDITO_HISTORIA.filter((t) => 'href' in t);
  return {
    _type: 'block',
    _key: 'hc',
    style: 'normal',
    markDefs: ligacoes.map((t, i) => ({ _type: 'link', _key: `hl${i + 1}`, href: t.href })),
    children: CREDITO_HISTORIA.map((t, i) => ({
      _type: 'span',
      _key: `hc${i + 1}`,
      text: t.texto,
      marks: 'href' in t ? [`hl${ligacoes.indexOf(t) + 1}`] : [],
    })),
  };
}

export function gerarHistoria(): DocumentoSeed[] {
  return [
    {
      _id: 'pagina-nossa-historia',
      _type: 'pagina',
      titulo: 'Nossa história',
      slug: { _type: 'slug', current: 'nossa-historia' },
      corpo: [...PARAGRAFOS_HISTORIA.map(bloco), blocoCredito()],
    },
  ];
}
