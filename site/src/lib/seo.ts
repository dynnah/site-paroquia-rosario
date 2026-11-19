/**
 * SEO: descrições para buscadores, endereços absolutos e dados estruturados
 * (schema.org). Tudo aqui é função pura, testada em `seo.test.ts`.
 *
 * Os dados estruturados descrevem só o que a paróquia já publica no site (endereço,
 * telefone, Instagram, horário da secretaria, eventos da agenda); nada é inventado.
 */
import { dataISO } from './formatacao.ts';
import type { DadosParoquia } from './paroquia.ts';
import { urlInstagram } from './paroquia.ts';
import type { Evento, GrupoHorarios } from './sanity.tipos.ts';

/** O que uma página pode pedir ao layout, além de título e descrição. Passa por todos os layouts. */
export interface PropsSeo {
  /** O título já é o completo: não acrescenta " · Paróquia Nossa Senhora do Rosário". */
  semSufixo?: boolean;
  /** Pede aos buscadores que não listem a página (a 404). */
  noindex?: boolean;
  /** Dados estruturados (schema.org) da página: um objeto ou uma lista deles. */
  jsonLd?: object | object[];
  /** Tipo do Open Graph: `article` para posts do blog. Padrão: `website`. */
  tipoOg?: 'website' | 'article';
  /** Imagem do Open Graph (caminho do site, ex.: "/og-padrao.png"). Padrão: a fachada. */
  imagem?: string;
}

/** Tamanho em que os buscadores costumam cortar a descrição. */
export const LIMITE_DESCRICAO = 160;

/**
 * Descrição de uma página para buscadores e redes sociais: uma linha só, cortada em
 * uma palavra inteira (nunca no meio dela) e terminada em reticências quando passa
 * do limite. Sem texto, devolve `undefined` para o layout usar a descrição padrão.
 */
export function descricaoCurta(
  texto: string | undefined | null,
  limite: number = LIMITE_DESCRICAO,
): string | undefined {
  const limpo = texto?.replace(/\s+/g, ' ').trim();
  if (!limpo) return undefined;
  if (limpo.length <= limite) return limpo;

  const corte = limpo.slice(0, limite - 1);
  const ultimoEspaco = corte.lastIndexOf(' ');
  // Se não há espaço perto do fim (palavra enorme), corta onde dá.
  const base = ultimoEspaco > limite * 0.6 ? corte.slice(0, ultimoEspaco) : corte;
  return `${base.replace(/[\s,;:.\-–—]+$/u, '')}…`;
}

/**
 * Endereço absoluto de um caminho do site ("/horarios" → "https://…/horarios").
 * Sem `site` configurado, devolve o caminho como veio (relativo).
 */
export function urlAbsoluta(caminho: string, site: URL | string | undefined): string {
  if (!site) return caminho;
  return new URL(caminho, site).href;
}

/**
 * JSON para dentro de um `<script type="application/ld+json">`. Troca `<`, `>`, `&` e
 * os separadores de linha do Unicode por escapes, para que um texto vindo do Studio
 * nunca consiga fechar a tag `<script>` nem quebrar o JavaScript.
 */
export function serializarJsonLd(dados: unknown): string {
  return JSON.stringify(dados)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

const DIAS_SCHEMA = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

const PERIODO = /^(\d{2}:\d{2})-(\d{2}:\d{2})$/;

export interface HorarioDeFuncionamento {
  '@type': 'OpeningHoursSpecification';
  dayOfWeek: string[];
  opens: string;
  closes: string;
}

/**
 * O horário de atendimento da secretaria no formato do schema.org. Só entram os
 * horários cadastrados como período ("08:00-12:00"): um horário solto ("17:00") é
 * uma missa ou uma confissão, que começa mas não tem hora de fechar.
 */
export function horarioDeFuncionamento(grupo: GrupoHorarios | undefined): HorarioDeFuncionamento[] {
  const especificacoes: HorarioDeFuncionamento[] = [];
  for (const linha of grupo?.linhas ?? []) {
    const dias = linha.dias.map((dia) => DIAS_SCHEMA[dia]).filter((dia) => dia !== undefined);
    if (dias.length === 0) continue;
    for (const hora of linha.horas) {
      const periodo = PERIODO.exec(hora.trim());
      if (!periodo) continue;
      especificacoes.push({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: dias,
        opens: periodo[1] as string,
        closes: periodo[2] as string,
      });
    }
  }
  return especificacoes;
}

/** "(83) 3241-1433" → "+558332411433". Número que não parece de telefone: `undefined`. */
export function telefoneInternacional(telefone: string | undefined): string | undefined {
  const digitos = telefone?.replace(/\D/g, '');
  if (!digitos) return undefined;
  if (digitos.length === 10 || digitos.length === 11) return `+55${digitos}`;
  if (digitos.length === 12 || digitos.length === 13) return `+${digitos}`;
  return undefined;
}

function enderecoPostal(paroquia: DadosParoquia) {
  const { rua, bairro, cidade, uf } = paroquia.endereco;
  return {
    '@type': 'PostalAddress',
    streetAddress: `${rua}, ${bairro}`,
    addressLocality: cidade,
    addressRegion: uf,
    ...(paroquia.endereco.cep ? { postalCode: paroquia.endereco.cep } : {}),
    addressCountry: 'BR',
  };
}

export interface OpcoesIgreja {
  /** Endereço absoluto da página (o canônico). */
  url: string;
  /** Endereço absoluto da imagem da paróquia. */
  imagem?: string;
  /** Link do "Como chegar". */
  mapa?: string;
  /** Horário da secretaria, para o horário de funcionamento. */
  secretaria?: GrupoHorarios;
}

/** A paróquia como `CatholicChurch` (um tipo de `Church`), para a busca e o Google Maps. */
export function jsonLdIgreja(paroquia: DadosParoquia, opcoes: OpcoesIgreja) {
  const telefone = telefoneInternacional(paroquia.telefone);
  const instagram = urlInstagram(paroquia.instagram);
  const redes = [instagram, paroquia.youtube].filter((link): link is string => Boolean(link));
  const horario = horarioDeFuncionamento(opcoes.secretaria);

  return {
    '@context': 'https://schema.org',
    '@type': 'CatholicChurch',
    name: paroquia.nome,
    url: opcoes.url,
    ...(opcoes.imagem ? { image: opcoes.imagem } : {}),
    address: enderecoPostal(paroquia),
    ...(telefone ? { telephone: telefone } : {}),
    ...(paroquia.email ? { email: paroquia.email } : {}),
    ...(opcoes.mapa ? { hasMap: opcoes.mapa } : {}),
    ...(redes.length > 0 ? { sameAs: redes } : {}),
    ...(horario.length > 0 ? { openingHoursSpecification: horario } : {}),
  };
}

export interface OpcoesEvento {
  /** Endereço absoluto da página do evento. */
  url: string;
  imagem?: string;
  /** Resumo em texto simples (opcional). */
  descricao?: string;
  /** Site da paróquia, como organizadora. */
  site?: string;
}

/**
 * Um evento da agenda como `Event`. O local é o que está escrito no Studio ("Salão
 * paroquial"); o endereço é o da paróquia, onde a agenda acontece. Sem local, o
 * evento é na própria igreja.
 */
export function jsonLdEvento(
  evento: Pick<Evento, 'titulo' | 'inicio' | 'fim' | 'local' | 'semHorario'>,
  paroquia: DadosParoquia,
  opcoes: OpcoesEvento,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: evento.titulo,
    // Sem horário definido, o Google recebe só a data (sem inventar uma hora).
    startDate: evento.semHorario ? dataISO(evento.inicio) : evento.inicio,
    ...(evento.fim ? { endDate: evento.semHorario ? dataISO(evento.fim) : evento.fim } : {}),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: evento.local || paroquia.nome,
      address: enderecoPostal(paroquia),
    },
    organizer: {
      '@type': 'Organization',
      name: paroquia.nome,
      ...(opcoes.site ? { url: opcoes.site } : {}),
    },
    url: opcoes.url,
    ...(opcoes.imagem ? { image: [opcoes.imagem] } : {}),
    ...(opcoes.descricao ? { description: opcoes.descricao } : {}),
  };
}
