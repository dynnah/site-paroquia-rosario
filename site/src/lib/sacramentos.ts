/**
 * Adapta um `sacramento` do Sanity às props do `CardPastoral`, que serve de
 * card de lista também aqui (nome, uma frase, informação útil e um botão).
 */
import { dataCompleta } from './formatacao.ts';
import type { Sacramento, Turma } from './sanity.tipos.ts';

/**
 * "Início em 12 de março de 2027 · até 28 de maio de 2027 · Sábados, 9h".
 * O "até" só aparece quando a turma termina em outro dia.
 */
export function descreverTurma(turma: Pick<Turma, 'inicio' | 'fim' | 'horario'>): string {
  const partes = [`Início em ${dataCompleta(turma.inicio)}`];
  if (turma.fim && turma.fim !== turma.inicio) partes.push(`até ${dataCompleta(turma.fim)}`);
  if (turma.horario) partes.push(turma.horario);
  return partes.join(' · ');
}

export function propsCardSacramento(sacramento: Sacramento) {
  const proxima = sacramento.proximasTurmas[0];
  return {
    familia: 'paroquial' as const,
    categoria: 'Sacramento',
    nome: sacramento.nome,
    descricao: sacramento.resumo,
    info: proxima
      ? [{ rotulo: 'Próxima turma', valor: `${proxima.nome} · ${descreverTurma(proxima)}` }]
      : [],
    acao: { rotulo: 'Ver requisitos', href: `/sacramentos/${sacramento.slug}` },
  };
}
