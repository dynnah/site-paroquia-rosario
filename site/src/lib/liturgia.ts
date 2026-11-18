/**
 * Liturgia do dia. A Fase 5 acrescenta aqui a busca das leituras e o adaptador
 * tipado; por enquanto só existe o link da fonte oficial, que a página usa como
 * reserva quando não há leituras para mostrar (e sempre que
 * `LITURGIA_TEXTO_INTEGRAL` for "false", que é o padrão).
 */

/** Fonte oficial: o texto integral das leituras (tradução CNBB) não é publicado aqui sem autorização. */
export const LITURGIA_OFICIAL = {
  rotulo: 'Liturgia Diária',
  href: 'https://www.cnbb.org.br/liturgia-diaria/',
} as const;
