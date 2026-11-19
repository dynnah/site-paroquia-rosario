/**
 * Adapta uma `pastoral` do Sanity (pastoral, movimento ou grupo) às props do `CardPastoral`
 * e separa a lista nas duas seções da página Nossa Comunidade.
 */
import type { Pastoral, TipoPastoral } from './sanity.tipos.ts';

/** Sobrelinha do card quando a pastoral não tem uma categoria própria. */
export const ROTULO_DO_TIPO: Record<TipoPastoral, string> = {
  pastoral: 'Pastoral',
  movimento: 'Movimento',
  grupo: 'Grupo',
  ministerio: 'Ministério',
  projeto: 'Projeto',
};

/** Pastorais no marrom escuro; movimentos, grupos, ministérios e projetos num marrom mais claro. */
export function tomDoTipo(tipo: TipoPastoral): 'pastoral' | 'movimento' {
  return tipo === 'pastoral' ? 'pastoral' : 'movimento';
}

/**
 * Sobrelinha do card: a categoria escrita no Studio ou, sem ela, o tipo. Se o nome já começa pelo
 * tipo ("Pastoral da Crisma"), repetir "Pastoral" em cima não ajuda: o card fica sem sobrelinha.
 */
export function sobrelinhaDaPastoral(pastoral: Pick<Pastoral, 'nome' | 'tipo' | 'categoria'>) {
  if (pastoral.categoria) return pastoral.categoria;
  const rotulo = ROTULO_DO_TIPO[pastoral.tipo];
  return pastoral.nome.toLowerCase().startsWith(rotulo.toLowerCase()) ? undefined : rotulo;
}

/** O card lista "Encontros" e "Responsável" (só o nome); contato e link ficam na página da pastoral. */
export function propsCardPastoral(pastoral: Pastoral) {
  const info: { rotulo: string; valor: string }[] = [];
  if (pastoral.encontros) info.push({ rotulo: 'Encontros', valor: pastoral.encontros });
  if (pastoral.responsavel) info.push({ rotulo: 'Responsável', valor: pastoral.responsavel });

  return {
    tom: tomDoTipo(pastoral.tipo),
    categoria: sobrelinhaDaPastoral(pastoral),
    nome: pastoral.nome,
    descricao: pastoral.descricao,
    info,
    acao: { rotulo: 'Saber mais', href: `/nossa-comunidade/${pastoral.slug}` },
  };
}

/** As quatro seções da página, cada uma na ordem em que a lista veio (alfabética). */
export function secoesDaComunidade(lista: Pastoral[]) {
  const doTipo = (...tipos: TipoPastoral[]) => lista.filter((p) => tipos.includes(p.tipo));
  return {
    pastorais: doTipo('pastoral'),
    gruposEMovimentos: doTipo('movimento', 'grupo'),
    ministerios: doTipo('ministerio'),
    projetos: doTipo('projeto'),
  };
}
