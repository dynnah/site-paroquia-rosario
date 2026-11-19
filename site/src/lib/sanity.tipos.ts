/**
 * Formato dos dados devolvidos pelas consultas de `sanity.ts`.
 * Acompanham os schemas em studio/schemas: ao mudar um campo lá, mude aqui e na consulta.
 */

/** Bloco de Portable Text (campo `textoRico`). A renderização entra na Fase 4. */
export interface BlocoTexto {
  _type: string;
  _key: string;
  style?: 'normal' | 'h2' | 'h3' | 'blockquote';
  listItem?: 'bullet' | 'number';
  level?: number;
  markDefs?: { _key: string; _type: string; href?: string }[];
  children?: { _type: string; _key: string; text: string; marks?: string[] }[];
}
export type TextoRico = BlocoTexto[];

export interface Link {
  rotulo: string;
  href: string;
}

export interface Configuracoes {
  nome: string;
  assinatura?: string;
  endereco?: { rua?: string; bairro?: string; cidade?: string; uf?: string };
  mapaUrl?: string;
  telefone?: string;
  /** Somente dígitos, com 55 e DDD. */
  whatsapp?: string;
  email?: string;
  /** Usuário, com ou sem @. */
  instagram?: string;
  youtube?: string;
  pixChave?: string;
  pixTitular?: string;
}

export interface LinhaHorario {
  rotulo: string;
  /** 0 = domingo … 6 = sábado */
  dias: number[];
  /** "07:00". Vazio = sem horário (a `nota` explica). */
  horas: string[];
  nota?: string;
}

export interface GrupoHorarios {
  linhas: LinhaHorario[];
  observacao?: string;
}

export interface Horarios {
  missa: GrupoHorarios;
  confissao: GrupoHorarios;
  adoracao: GrupoHorarios;
  rosario: GrupoHorarios;
  secretaria: GrupoHorarios;
}

export interface Aviso {
  _id: string;
  titulo: string;
  texto?: string;
  tipo: 'informativo' | 'festa' | 'mudanca';
  link?: Link;
}

export type CategoriaEvento = 'padrao' | 'festa' | 'franciscano';

export interface Evento {
  _id: string;
  slug: string;
  titulo: string;
  destaque?: string;
  /** Instante ISO (UTC). */
  inicio: string;
  fim?: string;
  local?: string;
  categoria: CategoriaEvento;
  inscricaoUrl?: string;
}

export interface EventoDetalhe extends Evento {
  descricao?: TextoRico;
}

export type FamiliaPastoralSanity = 'paroquial' | 'mariano' | 'franciscano' | 'social';

export interface Pastoral {
  _id: string;
  slug: string;
  nome: string;
  familia: FamiliaPastoralSanity;
  categoria: string;
  descricao: string;
  encontros?: string;
  contato?: string;
  responsavel?: string;
  link?: Link;
}

export interface PastoralDetalhe extends Pastoral {
  sobre?: TextoRico;
}

export interface Turma {
  nome: string;
  /** "2026-11-17" */
  inicio: string;
  fim?: string;
  horario?: string;
  inscricaoUrl?: string;
}

export interface Sacramento {
  _id: string;
  slug: string;
  nome: string;
  resumo: string;
  requisitos: string[];
  documentos: string[];
  proximasTurmas: Turma[];
  contato?: string;
}

export interface SacramentoDetalhe extends Sacramento {
  sobre?: TextoRico;
}

export interface Autor {
  nome: string;
  funcao: string;
}

export type ColunaPost = 'paroco' | 'juventude' | 'outra';

export interface PostResumo {
  _id: string;
  slug: string;
  coluna: ColunaPost;
  /** "Palavra do Pároco", "Juventude" ou o nome da coluna. */
  colunaNome: string;
  titulo: string;
  resumo?: string;
  autor: Autor;
  /** Instante ISO (UTC). */
  data: string;
  /** Link do YouTube: use `extrairIdYouTube` para obter o ID. */
  youtube?: string;
  duracaoVideo?: string;
  /** Palavras do texto; use `minutosDeLeitura`. */
  palavras: number;
}

export interface Post extends PostResumo {
  corpo?: TextoRico;
}

/** Filtros do blog: Tudo · Palavra do Pároco · Juventude · Vídeos (e outras colunas). */
export type FiltroBlog = 'tudo' | 'paroco' | 'juventude' | 'outra' | 'videos';

export interface PaginaDePosts {
  posts: PostResumo[];
  total: number;
  pagina: number;
  totalPaginas: number;
  porPagina: number;
}

export interface Santo {
  _id: string;
  /** "11-17" */
  dia: string;
  nome: string;
  destaque?: string;
  grau: 'memoria' | 'festa' | 'solenidade';
  familia: 'franciscana' | 'mariana' | 'nenhuma';
  datasDeVida?: string;
  bio: string;
}

export interface SantoDetalhe extends Santo {
  historia?: TextoRico;
}

export interface Pagina {
  _id: string;
  slug: string;
  titulo: string;
  resumo?: string;
  corpo: TextoRico;
}
