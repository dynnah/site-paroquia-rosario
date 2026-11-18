/**
 * Adapta uma `pastoral` do Sanity às props do `CardPastoral`.
 */
import type { Pastoral } from './sanity.tipos.ts';

/** O card lista "Encontros" e "Responsável" (só o nome); contato e link ficam na página da pastoral. */
export function propsCardPastoral(pastoral: Pastoral) {
  const info: { rotulo: string; valor: string }[] = [];
  if (pastoral.encontros) info.push({ rotulo: 'Encontros', valor: pastoral.encontros });
  if (pastoral.responsavel) info.push({ rotulo: 'Responsável', valor: pastoral.responsavel });

  return {
    familia: pastoral.familia,
    categoria: pastoral.categoria,
    nome: pastoral.nome,
    descricao: pastoral.descricao,
    info,
    acao: { rotulo: 'Saber mais', href: `/pastorais/${pastoral.slug}` },
  };
}
