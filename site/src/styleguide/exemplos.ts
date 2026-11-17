/**
 * Dados de exemplo do /styleguide. Só são usados lá: as páginas reais leem do Sanity.
 * Nomes (Frei Antônio, Ana Clara), chave Pix e horários são fictícios.
 * TODO(paroquia): os horários de exemplo vêm de uma matéria de 2022; confirmar com a secretaria.
 */

/** Vídeo aberto de demonstração (Big Buck Bunny), só para mostrar a miniatura. */
export const VIDEO_EXEMPLO = { id: 'aqz-KE-bpKQ', duracao: '6:40' };

export const horariosMissa = [
  { rotulo: 'Domingo', dias: [0], horas: ['07:00', '17:00'] },
  { rotulo: 'Terça', dias: [2], horas: ['17:00'] },
  { rotulo: 'Quarta a sexta', dias: [3, 4, 5], horas: ['17:00'] },
  { rotulo: 'Sábado', dias: [6], horas: ['17:00'], nota: 'Missa da comunidade' },
  { rotulo: 'Segunda', dias: [1], horas: [], nota: 'Sem missa' },
];

export const horariosConfissao = [
  { rotulo: 'Terça a sexta', dias: [2, 3, 4, 5], horas: ['16:00'] },
  { rotulo: 'Sábado', dias: [6], horas: ['15:00', '16:30'] },
];

export const pastorais = [
  {
    familia: 'mariano' as const,
    categoria: 'Movimento',
    nome: 'EJC Rosário',
    descricao: 'Encontro de Jovens com Cristo. Fim de semana de retiro e grupos ao longo do ano.',
    info: [
      { rotulo: 'Encontros', valor: 'sábados, 19h' },
      { rotulo: 'Idade', valor: '17 a 30 anos' },
    ],
    acao: { rotulo: 'Quero participar', href: '#' },
  },
  {
    familia: 'social' as const,
    categoria: 'Ação social',
    nome: 'Projeto Cestas Básicas',
    descricao: 'Acompanha famílias do bairro com cestas mensais e ações nas datas especiais.',
    info: [
      { rotulo: 'Doações', valor: 'na secretaria ou por Pix' },
      { rotulo: 'Instagram', valor: '@projetocestasbasicas' },
    ],
    acao: { rotulo: 'Como ajudar', href: '#' },
  },
  {
    familia: 'paroquial' as const,
    categoria: 'Formação',
    nome: 'Catequese',
    descricao: 'Preparação para a Primeira Eucaristia e a Crisma, para crianças, jovens e adultos.',
    info: [
      { rotulo: 'Inscrições', valor: 'fevereiro' },
      { rotulo: 'Contato', valor: 'secretaria' },
    ],
    acao: { rotulo: 'Venha ser catequista', href: '#' },
  },
];

export const liturgia = {
  id: 'exemplo',
  data: '2026-11-17',
  semana: '33ª Semana do Tempo Comum',
  celebracao: 'Santa Isabel da Hungria · Memória',
  cor: 'branco' as const,
  fonte: { rotulo: 'Liturgia Diária, CNBB', href: '#' },
  linkOficial: '#',
  leiturasComTexto: [
    {
      id: 'l1' as const,
      rotulo: '1ª Leitura',
      referencia: 'Apocalipse 3,1-6.14-22',
      texto: ['[Texto integral da primeira leitura.]'],
      aclamacao: 'Palavra do Senhor.',
    },
    {
      id: 'sl' as const,
      rotulo: 'Salmo',
      referencia: 'Salmo 14(15)',
      texto: ['[Refrão]', '[Estrofes do salmo.]'],
    },
    {
      id: 'ev' as const,
      rotulo: 'Evangelho',
      referencia: 'Lucas 19,1-10',
      texto: ['[Texto integral do Evangelho, vindo da fonte oficial da liturgia.]'],
      aclamacao: 'Palavra da Salvação.',
    },
  ],
  /** Modo padrão do site: só a referência e o link da liturgia oficial. */
  leiturasSoReferencia: [
    { id: 'l1' as const, rotulo: '1ª Leitura', referencia: 'Apocalipse 3,1-6.14-22' },
    { id: 'sl' as const, rotulo: 'Salmo', referencia: 'Salmo 14(15)' },
    { id: 'ev' as const, rotulo: 'Evangelho', referencia: 'Lucas 19,1-10' },
  ],
};

export const santo = {
  nome: 'Santa Isabel',
  destaque: 'da Hungria',
  grau: 'Memória' as const,
  familia: 'franciscana' as const,
  datas: '1207–1231',
  bio: 'Princesa húngara, ficou viúva aos 20 anos e deixou a corte para cuidar de pobres e doentes em Marburgo. Viveu a espiritualidade de São Francisco e é padroeira da Ordem Franciscana Secular.',
  href: '#',
};

export const posts = {
  video: {
    href: '#',
    coluna: 'Palavra do Pároco',
    colunaTipo: 'paroco' as const,
    titulo: 'Reflexão do Evangelho: Zaqueu e o olhar de Jesus',
    resumo: 'Uma conversa curta sobre o Evangelho desta terça-feira.',
    autor: 'Frei Antônio',
    data: '2026-11-17',
    video: VIDEO_EXEMPLO,
  },
  paroco: {
    href: '#',
    coluna: 'Palavra do Pároco',
    colunaTipo: 'paroco' as const,
    titulo: 'O que a campanha do centavo ainda nos ensina',
    resumo:
      'Frei Martinho construiu esta igreja moeda por moeda. Uma reflexão sobre generosidade e paciência no nosso tempo.',
    autor: 'Frei Antônio',
    data: '2026-11-12',
    minutosLeitura: 4,
  },
  juventude: {
    href: '#',
    coluna: 'Juventude',
    colunaTipo: 'juventude' as const,
    titulo: 'Por que eu fiz o EJC',
    resumo: 'Três jovens contam o que mudou depois do fim de semana de encontro.',
    autor: 'Ana Clara',
    data: '2026-11-02',
    minutosLeitura: 5,
  },
};

export const pix = {
  chave: 'chave-pix-da-paroquia@exemplo.com',
  titular: 'Paróquia Nossa Senhora do Rosário',
};
