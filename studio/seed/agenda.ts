/**
 * Agenda com as datas que a paróquia mandou.
 *
 * - O 1º Torneio da Juventude é o único com data de 2026 (6 de dezembro, 8h).
 * - Os demais eram de 2026 e já passaram. Para a agenda mostrar algo, estão na próxima ocorrência
 *   (2027), com os mesmos dias: são datas fixas todo ano, exceto a Semana Santa, calculada pela
 *   Páscoa de 2027 (28 de março). Viram exemplo até a paróquia confirmar o calendário de 2027
 *   (`exemplo-agenda-…`).
 * - Nenhum horário foi inventado: onde a paróquia não informou, o evento é "sem horário definido".
 * TODO(paroquia): confirmar as datas e a programação de 2027, e o local de cada evento.
 */
import type { DocumentoSeed } from './exemplos.ts';

const DESLOCAMENTO_SP_MS = 3 * 60 * 60 * 1000;

/** Instante ISO (UTC) de "AAAA-MM-DD" às `hora`h`minuto` no horário de São Paulo (UTC−3). */
export function horaSP(dia: string, hora: number, minuto = 0): string {
  const utc = Date.parse(`${dia}T00:00:00Z`) + (hora * 60 + minuto) * 60_000 + DESLOCAMENTO_SP_MS;
  return new Date(utc).toISOString();
}

let contador = 0;
const chave = () => `ag${++contador}`;

function bloco(texto: string) {
  return {
    _type: 'block',
    _key: chave(),
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: chave(), text: texto, marks: [] }],
  };
}

interface Entrada {
  id: string;
  slug: string;
  titulo: string;
  destaque?: string;
  categoria: 'padrao' | 'festa' | 'mariano' | 'franciscano';
  /** Dia "AAAA-MM-DD" do início. */
  dia: string;
  /** Hora de início; sem ela, o evento é "sem horário definido". */
  hora?: [number, number?];
  /** Último dia "AAAA-MM-DD", para eventos de vários dias. */
  ate?: string;
  local?: string;
  descricao?: string[];
}

export const AGENDA: Entrada[] = [
  {
    id: 'agenda-torneio-juventude',
    slug: 'torneio-da-juventude-rosario',
    titulo: '1º Torneio da Juventude Rosário',
    categoria: 'padrao',
    dia: '2026-12-06',
    hora: [8],
    local: 'Ginásio Poliesportivo do EEPAC - Jaguaribe',
  },
  {
    id: 'exemplo-agenda-semana-santa',
    slug: 'semana-santa',
    titulo: 'Semana Santa',
    categoria: 'padrao',
    dia: '2027-03-21',
    ate: '2027-03-28',
  },
  {
    id: 'exemplo-agenda-trezena-santo-antonio',
    slug: 'trezena-de-santo-antonio',
    titulo: 'Trezena de Santo Antônio',
    destaque: 'Santo Antônio',
    categoria: 'festa',
    dia: '2027-06-01',
    ate: '2027-06-13',
    descricao: [
      'De 1 a 13 de junho, estaremos em oração e fraternidade celebrando esse santo intercessor da nossa Paróquia!',
      'Santa Missa: dias de semana, às 19h; fins de semana (sábado e domingo), às 17h.',
      'Quermesse: dias 1, 2, 5, 6, 7, 9, 11, 12 e 13 de junho.',
      'Atrações musicais: dias 5, 6, 7, 11, 12 e 13 de junho.',
    ],
  },
  {
    id: 'exemplo-agenda-perdao-de-assis',
    slug: 'perdao-de-assis',
    titulo: 'Perdão de Assis',
    categoria: 'franciscano',
    dia: '2027-08-02',
  },
  {
    id: 'exemplo-agenda-festa-do-rosario',
    slug: 'festa-do-rosario',
    titulo: 'Festa do Rosário',
    destaque: 'do Rosário',
    categoria: 'mariano',
    dia: '2027-09-28',
    ate: '2027-10-06',
  },
  {
    id: 'exemplo-agenda-dia-de-nossa-senhora-do-rosario',
    slug: 'dia-de-nossa-senhora-do-rosario',
    titulo: 'Dia de Nossa Senhora do Rosário',
    destaque: 'do Rosário',
    categoria: 'mariano',
    dia: '2027-10-07',
    descricao: ['Dia de Nossa Senhora do Rosário e encerramento da Festa do Rosário.'],
  },
];

export function gerarAgenda(): DocumentoSeed[] {
  return AGENDA.map((e) => {
    const semHorario = !e.hora;
    return {
      _id: e.id,
      _type: 'evento',
      titulo: e.titulo,
      ...(e.destaque ? { destaque: e.destaque } : {}),
      slug: { _type: 'slug', current: e.slug },
      inicio: semHorario ? horaSP(e.dia, 0) : horaSP(e.dia, e.hora![0], e.hora![1] ?? 0),
      // Sem horário, o término é o fim do último dia (23h59), para o evento valer até lá.
      ...(e.ate ? { fim: horaSP(e.ate, 23, 59) } : {}),
      ...(semHorario ? { semHorario: true } : {}),
      ...(e.local ? { local: e.local } : {}),
      categoria: e.categoria,
      ...(e.descricao ? { descricao: e.descricao.map(bloco) } : {}),
    };
  });
}
