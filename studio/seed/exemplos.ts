/**
 * Conteúdo de exemplo para ver o site funcionando antes do conteúdo real.
 *
 * - Todo texto inventado leva o marcador "[EXEMPLO]" (a Fase 8 troca tudo).
 * - Nomes de pessoas são genéricos de propósito: nada de nomes fictícios que
 *   possam ser confundidos com gente da paróquia.
 * - Os IDs não têm ponto: no Sanity, `_id` com ponto vira documento privado.
 * - Datas são relativas a "hoje" (fuso de São Paulo, UTC−3).
 * - Fatos históricos e litúrgicos usados aqui (Santa Isabel, 17 de novembro;
 *   Nossa Senhora do Rosário, 7 de outubro; São Francisco, 4 de outubro;
 *   igreja construída pelos franciscanos entre 1927 e 1929) são reais.
 *
 * TODO(paroquia): horários, telefone, WhatsApp, e-mail, chave Pix, requisitos
 * dos sacramentos e lista de pastorais vêm da secretaria; nada disso é inventado
 * como se fosse oficial.
 */

export type DocumentoSeed = { _id: string; _type: string; [campo: string]: unknown };

const MARCA = '[EXEMPLO]';
const DESLOCAMENTO_SP_MS = 3 * 60 * 60 * 1000;

/** Instante ISO (UTC) de `dias` a partir de hoje, no horário local de São Paulo. */
export function instante(agora: Date, dias: number, hora: number, minuto = 0): string {
  const sp = new Date(agora.getTime() - DESLOCAMENTO_SP_MS);
  const utc = Date.UTC(sp.getUTCFullYear(), sp.getUTCMonth(), sp.getUTCDate() + dias, hora, minuto);
  return new Date(utc + DESLOCAMENTO_SP_MS).toISOString();
}

/** "2026-11-17" de `dias` a partir de hoje, em São Paulo. */
export function dataEmDias(agora: Date, dias: number): string {
  return instante(agora, dias, 12).slice(0, 10);
}

let contador = 0;
const chave = () => `k${++contador}`;

function bloco(texto: string, estilo: 'normal' | 'h2' | 'h3' | 'blockquote' = 'normal') {
  return {
    _type: 'block',
    _key: chave(),
    style: estilo,
    markDefs: [],
    children: [{ _type: 'span', _key: chave(), text: texto, marks: [] }],
  };
}

function linha(rotulo: string, dias: number[], horas: string[], nota?: string) {
  return { _type: 'linhaHorario', _key: chave(), rotulo, dias, horas, ...(nota ? { nota } : {}) };
}

const referencia = (id: string) => ({ _type: 'reference', _ref: id });

const FORMULARIO = { rotulo: 'Quero participar', href: 'https://www.google.com/forms/about/' };
const VIDEO_ABERTO = 'https://www.youtube.com/watch?v=aqz-KE-bpKQ'; // Big Buck Bunny, vídeo aberto de demonstração

export function gerarDocumentos(agora: Date = new Date()): DocumentoSeed[] {
  contador = 0;
  const dia = (n: number) => dataEmDias(agora, n);
  const hora = (n: number, h: number, m = 0) => instante(agora, n, h, m);
  const mmdd = (n: number) => dia(n).slice(5);

  return [
    // ── Configurações e horários (documentos únicos: _id = nome do tipo) ──────────
    {
      _id: 'configuracoes',
      _type: 'configuracoes',
      nome: 'Paróquia Nossa Senhora do Rosário',
      assinatura: 'Igreja do Rosário',
      endereco: {
        rua: 'Rua Frei Martinho, s/n',
        bairro: 'Jaguaribe',
        cidade: 'João Pessoa',
        uf: 'PB',
      },
      instagram: 'paroquiadorosariojp',
      pixChave: `${MARCA} chave-pix@exemplo.com`,
      pixTitular: `${MARCA} Titular da conta`,
    },
    {
      _id: 'horarios',
      _type: 'horarios',
      missa: {
        linhas: [
          linha('Domingo', [0], ['07:00', '17:00']),
          linha('Segunda', [1], [], 'Sem missa'),
          linha('Terça', [2], ['17:00']),
          linha('Quarta a sexta', [3, 4, 5], ['17:00']),
          linha('Sábado', [6], ['17:00'], 'Missa da comunidade'),
        ],
        observacao: `${MARCA} Horários de exemplo. Confirmar com a secretaria.`,
      },
      confissao: {
        linhas: [
          linha('Terça a sexta', [2, 3, 4, 5], ['16:00']),
          linha('Sábado', [6], ['15:00', '16:30']),
        ],
        observacao: `${MARCA} Horários de exemplo.`,
      },
      adoracao: {
        linhas: [linha('Quinta', [4], ['18:00'], 'Adoração ao Santíssimo')],
        observacao: `${MARCA} Horário de exemplo.`,
      },
      secretaria: {
        linhas: [
          linha('Segunda a sexta', [1, 2, 3, 4, 5], ['08:00', '16:00']),
          linha('Sábado e domingo', [6, 0], [], 'Fechada'),
        ],
        observacao: `${MARCA} Horário de exemplo.`,
      },
    },

    // ── Avisos ────────────────────────────────────────────────────────────────────
    {
      _id: 'exemplo-aviso-semana',
      _type: 'aviso',
      titulo: `${MARCA} Aviso da semana`,
      texto: 'Texto curto do aviso, em uma frase.',
      tipo: 'informativo',
      inicio: hora(-1, 8),
      fim: hora(7, 23, 59),
      link: { rotulo: 'Ver horários', href: '/horarios' },
    },
    {
      _id: 'exemplo-aviso-festa',
      _type: 'aviso',
      titulo: `${MARCA} Novena da padroeira`,
      texto: 'Aviso de festa que só começa a aparecer mais adiante.',
      tipo: 'festa',
      inicio: hora(20, 6),
      fim: hora(30, 23, 59),
    },
    {
      _id: 'exemplo-aviso-encerrado',
      _type: 'aviso',
      titulo: `${MARCA} Aviso já encerrado`,
      texto: 'Não deve aparecer no site.',
      tipo: 'mudanca',
      inicio: hora(-10, 8),
      fim: hora(-1, 23, 59),
    },

    // ── Eventos ───────────────────────────────────────────────────────────────────
    {
      _id: 'exemplo-evento-festa',
      _type: 'evento',
      titulo: `${MARCA} Festa de Nossa Senhora do Rosário`,
      destaque: 'do Rosário',
      slug: { _type: 'slug', current: 'exemplo-festa-de-nossa-senhora-do-rosario' },
      inicio: hora(10, 17),
      local: 'Igreja Matriz',
      categoria: 'festa',
      descricao: [bloco('Missa solene da festa da padroeira. Texto de exemplo.')],
    },
    {
      _id: 'exemplo-evento-franciscano',
      _type: 'evento',
      titulo: `${MARCA} Celebração franciscana`,
      slug: { _type: 'slug', current: 'exemplo-celebracao-franciscana' },
      inicio: hora(25, 18, 30),
      local: 'Igreja Matriz',
      categoria: 'franciscano',
      descricao: [bloco('Data dos frades. Texto de exemplo.')],
    },
    {
      _id: 'exemplo-evento-padrao',
      _type: 'evento',
      titulo: `${MARCA} Encontro de formação`,
      slug: { _type: 'slug', current: 'exemplo-encontro-de-formacao' },
      inicio: hora(3, 19),
      fim: hora(3, 21),
      local: 'Salão paroquial',
      categoria: 'padrao',
      descricao: [bloco('Encontro aberto à comunidade. Texto de exemplo.')],
      inscricaoUrl: 'https://www.google.com/forms/about/',
    },
    {
      _id: 'exemplo-evento-passado',
      _type: 'evento',
      titulo: `${MARCA} Evento que já passou`,
      slug: { _type: 'slug', current: 'exemplo-evento-que-ja-passou' },
      inicio: hora(-10, 19),
      local: 'Salão paroquial',
      categoria: 'padrao',
    },

    // ── Pastorais ─────────────────────────────────────────────────────────────────
    {
      _id: 'exemplo-pastoral-jovem',
      _type: 'pastoral',
      nome: `${MARCA} Pastoral Jovem`,
      slug: { _type: 'slug', current: 'exemplo-pastoral-jovem' },
      familia: 'mariano',
      categoria: 'Movimento',
      descricao: 'Encontros e retiros para jovens ao longo do ano.',
      encontros: 'sábados, 19h',
      contato: 'secretaria paroquial',
      link: FORMULARIO,
      sobre: [bloco('Texto de exemplo sobre a pastoral.')],
    },
    {
      _id: 'exemplo-pastoral-social',
      _type: 'pastoral',
      nome: `${MARCA} Pastoral Social`,
      slug: { _type: 'slug', current: 'exemplo-pastoral-social' },
      familia: 'social',
      categoria: 'Ação social',
      descricao: 'Acompanha famílias do bairro com ações ao longo do ano.',
      encontros: 'primeiro sábado do mês',
      link: { rotulo: 'Como ajudar', href: 'https://www.google.com/forms/about/' },
    },
    {
      _id: 'exemplo-pastoral-catequese',
      _type: 'pastoral',
      nome: `${MARCA} Catequese`,
      slug: { _type: 'slug', current: 'exemplo-catequese' },
      familia: 'paroquial',
      categoria: 'Formação',
      descricao: 'Preparação para a Primeira Eucaristia e a Crisma.',
      encontros: 'sábados, 15h',
      link: { rotulo: 'Venha ser catequista', href: 'https://www.google.com/forms/about/' },
    },
    {
      _id: 'exemplo-pastoral-franciscana',
      _type: 'pastoral',
      nome: `${MARCA} Fraternidade franciscana`,
      slug: { _type: 'slug', current: 'exemplo-fraternidade-franciscana' },
      familia: 'franciscano',
      categoria: 'Movimento',
      descricao: 'Encontros de espiritualidade na tradição de São Francisco.',
      encontros: 'último domingo do mês',
    },

    // ── Sacramentos ───────────────────────────────────────────────────────────────
    {
      _id: 'exemplo-sacramento-batismo',
      _type: 'sacramento',
      nome: `${MARCA} Batismo`,
      slug: { _type: 'slug', current: 'exemplo-batismo' },
      ordem: 1,
      resumo: 'Porta de entrada da vida cristã. Texto de exemplo.',
      sobre: [bloco('Texto de exemplo sobre o sacramento.')],
      requisitos: [`${MARCA} Requisito do curso de preparação`],
      documentos: [`${MARCA} Documento de identificação`],
      proximasTurmas: [
        {
          _type: 'turma',
          _key: chave(),
          nome: `${MARCA} Curso de batismo`,
          inicio: dia(14),
          fim: dia(14),
          horario: 'sábado, 15h',
          inscricaoUrl: 'https://www.google.com/forms/about/',
        },
      ],
      contato: 'secretaria paroquial',
    },
    {
      _id: 'exemplo-sacramento-eucaristia',
      _type: 'sacramento',
      nome: `${MARCA} Primeira Eucaristia`,
      slug: { _type: 'slug', current: 'exemplo-primeira-eucaristia' },
      ordem: 2,
      resumo: 'Preparação pela catequese. Texto de exemplo.',
      requisitos: [`${MARCA} Requisito da catequese`],
      contato: 'secretaria paroquial',
    },
    {
      _id: 'exemplo-sacramento-crisma',
      _type: 'sacramento',
      nome: `${MARCA} Crisma`,
      slug: { _type: 'slug', current: 'exemplo-crisma' },
      ordem: 3,
      resumo: 'Plenitude do Batismo. Texto de exemplo.',
      requisitos: [`${MARCA} Requisito da preparação`],
      proximasTurmas: [
        {
          _type: 'turma',
          _key: chave(),
          nome: `${MARCA} Turma de Crisma`,
          inicio: dia(60),
          horario: 'sábados, 16h',
        },
      ],
      contato: 'secretaria paroquial',
    },
    {
      _id: 'exemplo-sacramento-matrimonio',
      _type: 'sacramento',
      nome: `${MARCA} Matrimônio`,
      slug: { _type: 'slug', current: 'exemplo-matrimonio' },
      ordem: 4,
      resumo: 'Aliança entre homem e mulher. Texto de exemplo.',
      documentos: [`${MARCA} Documentos dos noivos`],
      contato: 'secretaria paroquial',
    },

    // ── Autores e posts ───────────────────────────────────────────────────────────
    {
      _id: 'exemplo-autor-paroco',
      _type: 'autor',
      nome: `${MARCA} Autor do pároco`,
      funcao: 'Pároco',
    },
    {
      _id: 'exemplo-autor-juventude',
      _type: 'autor',
      nome: `${MARCA} Autor da juventude`,
      funcao: 'Juventude',
    },
    {
      _id: 'exemplo-post-video',
      _type: 'post',
      statusRevisao: 'aprovado',
      coluna: 'paroco',
      titulo: `${MARCA} Reflexão do Evangelho em vídeo`,
      slug: { _type: 'slug', current: 'exemplo-reflexao-em-video' },
      autor: referencia('exemplo-autor-paroco'),
      data: hora(-1, 9),
      resumo: 'Uma conversa curta sobre o Evangelho da semana.',
      youtube: VIDEO_ABERTO,
      duracaoVideo: '6:40',
    },
    {
      _id: 'exemplo-post-paroco',
      _type: 'post',
      statusRevisao: 'aprovado',
      coluna: 'paroco',
      titulo: `${MARCA} Palavra do pároco`,
      slug: { _type: 'slug', current: 'exemplo-palavra-do-paroco' },
      autor: referencia('exemplo-autor-paroco'),
      data: hora(-5, 9),
      resumo: 'Resumo de exemplo de uma reflexão do pároco.',
      corpo: [
        bloco('Primeiro parágrafo de exemplo.'),
        bloco('Um subtítulo', 'h2'),
        bloco('Segundo parágrafo de exemplo.'),
      ],
    },
    {
      _id: 'exemplo-post-juventude',
      _type: 'post',
      statusRevisao: 'aprovado',
      coluna: 'juventude',
      titulo: `${MARCA} Texto da juventude`,
      slug: { _type: 'slug', current: 'exemplo-texto-da-juventude' },
      autor: referencia('exemplo-autor-juventude'),
      data: hora(-9, 9),
      resumo: 'Resumo de exemplo de um texto escrito pelos jovens.',
      corpo: [bloco('Parágrafo de exemplo.')],
    },
    {
      _id: 'exemplo-post-outra',
      _type: 'post',
      statusRevisao: 'aprovado',
      coluna: 'outra',
      colunaNome: 'Catequese',
      titulo: `${MARCA} Texto de outra coluna`,
      slug: { _type: 'slug', current: 'exemplo-texto-de-outra-coluna' },
      autor: referencia('exemplo-autor-paroco'),
      data: hora(-12, 9),
      resumo: 'Resumo de exemplo de uma coluna que não é do pároco nem da juventude.',
      corpo: [bloco('Parágrafo de exemplo.')],
    },
    {
      _id: 'exemplo-post-em-revisao',
      _type: 'post',
      statusRevisao: 'em-revisao',
      coluna: 'juventude',
      titulo: `${MARCA} Post em revisão (não deve aparecer)`,
      slug: { _type: 'slug', current: 'exemplo-post-em-revisao' },
      autor: referencia('exemplo-autor-juventude'),
      data: hora(-1, 9),
      resumo: 'Só aparece depois de aprovado.',
      corpo: [bloco('Parágrafo de exemplo.')],
    },
    {
      _id: 'exemplo-post-agendado',
      _type: 'post',
      statusRevisao: 'aprovado',
      coluna: 'paroco',
      titulo: `${MARCA} Post agendado (não deve aparecer ainda)`,
      slug: { _type: 'slug', current: 'exemplo-post-agendado' },
      autor: referencia('exemplo-autor-paroco'),
      data: hora(5, 9),
      resumo: 'Só aparece depois da data de publicação.',
      corpo: [bloco('Parágrafo de exemplo.')],
    },

    // ── Santos do dia ─────────────────────────────────────────────────────────────
    {
      _id: 'exemplo-santo-isabel',
      _type: 'santo',
      dia: '11-17',
      nome: 'Santa Isabel',
      destaque: 'da Hungria',
      grau: 'memoria',
      familia: 'franciscana',
      datasDeVida: '1207–1231',
      bio: `${MARCA} Princesa húngara, ficou viúva cedo e deixou a corte para cuidar de pobres e doentes. Viveu a espiritualidade de São Francisco.`,
    },
    {
      _id: 'exemplo-santo-rosario',
      _type: 'santo',
      dia: '10-07',
      nome: 'Nossa Senhora',
      destaque: 'do Rosário',
      grau: 'solenidade',
      familia: 'mariana',
      bio: `${MARCA} Padroeira da paróquia. Texto de exemplo sobre a devoção ao Rosário.`,
    },
    {
      _id: 'exemplo-santo-francisco',
      _type: 'santo',
      dia: '10-04',
      nome: 'São Francisco',
      destaque: 'de Assis',
      grau: 'festa',
      familia: 'franciscana',
      datasDeVida: '1181–1226',
      bio: `${MARCA} Fundador da Ordem dos Frades Menores. Texto de exemplo.`,
    },
    {
      _id: 'exemplo-santo-do-dia',
      _type: 'santo',
      dia: mmdd(0),
      nome: `${MARCA} Santo de hoje`,
      grau: 'memoria',
      familia: 'nenhuma',
      bio: 'Garante que sempre haja um santo cadastrado para a data de hoje durante os testes.',
    },

    // ── Páginas de texto ──────────────────────────────────────────────────────────
    {
      _id: 'exemplo-pagina-nossa-historia',
      _type: 'pagina',
      titulo: 'Nossa história',
      slug: { _type: 'slug', current: 'nossa-historia' },
      resumo: 'A igreja neoclássica construída pelos frades franciscanos entre 1927 e 1929.',
      corpo: [
        bloco(
          `${MARCA} A igreja foi construída pelos frades franciscanos entre 1927 e 1929, em estilo neoclássico.`,
        ),
        bloco('Frei Martinho e a campanha do centavo', 'h2'),
        bloco(`${MARCA} Texto da história a ser fornecido pela paróquia.`),
      ],
    },
    {
      _id: 'exemplo-pagina-contribua',
      _type: 'pagina',
      titulo: 'Contribua',
      slug: { _type: 'slug', current: 'contribua' },
      corpo: [bloco(`${MARCA} Como contribuir com a paróquia. Texto de exemplo.`)],
    },
  ];
}
