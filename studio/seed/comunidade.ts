/**
 * Pastorais, grupos, movimentos, ministérios e projetos reais, com o que a paróquia mandou:
 * nome, descrição (texto dela, sem edição) e Instagram.
 *
 * Quando se reúne e quem coordena não foram escritos: entram pelo Studio (ou aqui) quando
 * os grupos enviarem.
 * TODO(paroquia): encontros e responsável de cada grupo.
 *
 * Os IDs são fixos (`comunidade-…`): importar de novo com `--replace` atualiza o mesmo documento.
 */
import type { DocumentoSeed } from './exemplos.ts';

interface Entrada {
  /** Parte final do endereço e do _id. */
  slug: string;
  nome: string;
  tipo: 'pastoral' | 'movimento' | 'grupo' | 'ministerio' | 'projeto';
  /** Texto pequeno acima do nome; vazio = o tipo. */
  categoria?: string;
  descricao?: string;
  /** Usuário do Instagram, sem o @. */
  instagram: string;
}

export const COMUNIDADE: Entrada[] = [
  {
    slug: 'crisma',
    nome: 'Pastoral da Crisma',
    tipo: 'pastoral',
    descricao:
      'Preparação de jovens para receber o Sacramento da Crisma, fortalecendo a fé, a vivência cristã e o compromisso com a Igreja e a comunidade.',
    instagram: 'crismarosario',
  },
  {
    slug: 'batismo',
    nome: 'Pastoral do Batismo',
    tipo: 'pastoral',
    descricao:
      'Serviço de acolhimento e preparação de pais e padrinhos para o Sacramento do Batismo, primeiro passo na caminhada de fé cristã.',
    instagram: 'batismorosariojp',
  },
  {
    slug: 'catequese-infantil',
    nome: 'Pastoral da Catequese Infantil',
    tipo: 'pastoral',
    descricao:
      'Evangelização e formação cristã de crianças, ajudando-as a conhecer Jesus, desenvolver a fé e crescer na vivência dos ensinamentos da Igreja.',
    instagram: 'catequeserosario',
  },
  {
    slug: 'catequese-de-adultos',
    nome: 'Pastoral da Catequese de Adultos',
    tipo: 'pastoral',
    descricao:
      'Caminhada de formação e aprofundamento da fé para adultos que desejam conhecer mais a doutrina católica e se preparar para receber os sacramentos da iniciação cristã.',
    instagram: 'catequesedeadultospnsr',
  },
  {
    slug: 'pastoral-familiar',
    nome: 'Pastoral Familiar',
    tipo: 'pastoral',
    descricao:
      'Evangelização, acolhimento e acompanhamento das famílias, promovendo a vivência dos valores cristãos e o fortalecimento da família como Igreja doméstica.',
    instagram: 'pasfamrosario',
  },
  {
    slug: 'ejc-rosario',
    nome: 'EJC Rosário',
    tipo: 'movimento',
    categoria: 'Encontro de Jovens com Cristo',
    descricao:
      'Movimento de evangelização que proporciona aos jovens uma experiência pessoal com Cristo, incentivando a espiritualidade, a fraternidade e o compromisso com a Igreja.',
    instagram: 'ejcrosariojp',
  },
  {
    slug: 'adoracao-jovem',
    nome: 'Grupo de Adoração Jovem',
    tipo: 'grupo',
    descricao:
      'Grupo dedicado à adoração ao Santíssimo Sacramento, reunindo jovens para momentos de oração, intimidade com Jesus e fortalecimento da espiritualidade.',
    instagram: 'adoracaojrosario',
  },
  {
    slug: 'atuemos',
    nome: 'Atuemos',
    tipo: 'ministerio',
    categoria: 'Ministério de teatro',
    descricao:
      'Ministério de evangelização por meio da arte teatral, utilizando o teatro como instrumento para transmitir a Palavra de Deus e tocar corações.',
    instagram: 'atuemosrosario',
  },
  {
    slug: 'elohim',
    nome: 'Elohim',
    tipo: 'ministerio',
    categoria: 'Ministério de teatro',
    descricao:
      'Ministério que utiliza a expressão artística e o teatro para evangelizar, anunciar o amor de Deus e proporcionar experiências de fé.',
    instagram: 'ministerio_elohim',
  },
  {
    slug: 'poverello',
    nome: 'Poverello',
    tipo: 'ministerio',
    categoria: 'Ministério de música',
    descricao:
      'Ministério dedicado à evangelização por meio da música, colocando os dons e talentos a serviço de Deus e da comunidade.',
    instagram: 'ministeriopoverello',
  },
  {
    slug: 'arcanjos',
    nome: 'Arcanjos',
    tipo: 'ministerio',
    categoria: 'Ministério de música',
    descricao:
      'Ministério de louvor e evangelização que, por meio da música, conduz a comunidade à oração, à adoração e ao encontro com Deus.',
    instagram: 'ministerioarcanjos',
  },
  {
    slug: 'cestas-basicas',
    nome: 'Cestas Básicas',
    tipo: 'projeto',
    descricao:
      'Iniciativa de solidariedade e caridade cristã que busca ajudar famílias em situação de vulnerabilidade social por meio da arrecadação e distribuição de alimentos.',
    instagram: 'projetocestasbasicas',
  },
  {
    slug: 'abba',
    nome: 'Abba',
    tipo: 'projeto',
    categoria: 'Pré-Catequese Infantil',
    descricao:
      'Iniciativa de evangelização voltada às crianças, proporcionando os primeiros passos na caminhada de fé por meio do conhecimento de Jesus, da Palavra de Deus e dos valores cristãos, de forma lúdica e acolhedora.',
    instagram: 'abbaprojeto',
  },
];

export function gerarComunidade(): DocumentoSeed[] {
  return COMUNIDADE.map((e) => ({
    _id: `comunidade-${e.slug}`,
    _type: 'pastoral',
    nome: e.nome,
    slug: { _type: 'slug', current: e.slug },
    tipo: e.tipo,
    ...(e.categoria ? { categoria: e.categoria } : {}),
    ...(e.descricao ? { descricao: e.descricao } : {}),
    contato: `Instagram @${e.instagram}`,
    link: { rotulo: 'Seguir no Instagram', href: `https://www.instagram.com/${e.instagram}/` },
  }));
}
