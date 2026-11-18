/**
 * Adapta um `evento` do Sanity às props dos componentes e às páginas de agenda.
 */
import {
  capitalizar,
  dataLonga,
  diaDaSemana,
  horaLocal,
  nomeDiaSemana,
  partesData,
} from './formatacao.ts';
import type { CategoriaEvento, Evento } from './sanity.tipos.ts';

const ROTULO_CATEGORIA: Record<CategoriaEvento, string | undefined> = {
  padrao: undefined,
  festa: 'Festa',
  franciscano: 'Franciscano',
};

/** Props do `CardEvento`: "Quarta-feira · Festa" · título · "17h · Matriz". */
export function propsCardEvento(evento: Evento) {
  const dia = capitalizar(nomeDiaSemana(diaDaSemana(evento.inicio)));
  return {
    href: `/agenda/${evento.slug}`,
    data: evento.inicio,
    sobrelinha: [dia, ROTULO_CATEGORIA[evento.categoria]].filter(Boolean).join(' · '),
    titulo: evento.titulo,
    destaque: evento.destaque,
    meta: [horaLocal(evento.inicio), evento.local].filter(Boolean).join(' · '),
    variante: evento.categoria,
  };
}

function mesmoDia(a: string, b: string): boolean {
  const x = partesData(a);
  const y = partesData(b);
  return x.ano === y.ano && x.mes === y.mes && x.dia === y.dia;
}

/** "Sábado, 28 de novembro · 17h" (e " às 19h" se terminar no mesmo dia). */
export function quandoAcontece(evento: Pick<Evento, 'inicio' | 'fim'>): string {
  const inicio = `${dataLonga(evento.inicio)} · ${horaLocal(evento.inicio)}`;
  if (evento.fim && mesmoDia(evento.inicio, evento.fim)) {
    return `${inicio} às ${horaLocal(evento.fim)}`;
  }
  return inicio;
}

/** O evento já terminou (ou, sem horário de fim, já começou) em relação a `agora`? */
export function jaAconteceu(
  evento: Pick<Evento, 'inicio' | 'fim'>,
  agora: Date = new Date(),
): boolean {
  return new Date(evento.fim ?? evento.inicio).getTime() < agora.getTime();
}
