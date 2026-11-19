/**
 * Adapta um `evento` do Sanity às props dos componentes e às páginas de agenda.
 */
import {
  capitalizar,
  dataLonga,
  diaDaSemana,
  diaDeMes,
  horaLocal,
  nomeDiaSemana,
  partesData,
  periodo,
} from './formatacao.ts';
import type { CategoriaEvento, Evento } from './sanity.tipos.ts';

const ROTULO_CATEGORIA: Record<CategoriaEvento, string | undefined> = {
  padrao: undefined,
  festa: 'Festa',
  mariano: 'Festa mariana',
  franciscano: 'Franciscano',
};

function mesmoDia(a: string, b: string): boolean {
  const x = partesData(a);
  const y = partesData(b);
  return x.ano === y.ano && x.mes === y.mes && x.dia === y.dia;
}

/** Hora do evento; sem horário, só "até 6 de outubro" quando dura mais de um dia. */
function quandoNoCard(evento: Pick<Evento, 'inicio' | 'fim' | 'semHorario'>): string | undefined {
  if (!evento.semHorario) return horaLocal(evento.inicio);
  return evento.fim && !mesmoDia(evento.inicio, evento.fim)
    ? `até ${diaDeMes(evento.fim)}`
    : undefined;
}

/**
 * O destaque (itálico) é o final do título: "Festa do Rosário" + "do Rosário". Os componentes
 * mostram título e destaque um depois do outro, então o trecho sai do título para não repetir.
 * Se o destaque não for o final do título, o título fica inteiro e sem itálico.
 */
export function separarDestaque(
  titulo: string,
  destaque?: string,
): { titulo: string; destaque?: string } {
  const trecho = destaque?.trim();
  if (trecho && titulo.endsWith(trecho) && titulo.length > trecho.length) {
    return { titulo: titulo.slice(0, -trecho.length).trimEnd(), destaque: trecho };
  }
  return { titulo };
}

/** Props do `CardEvento`: "Quarta-feira · Festa" · título · "17h · Matriz". */
export function propsCardEvento(evento: Evento) {
  const dia = capitalizar(nomeDiaSemana(diaDaSemana(evento.inicio)));
  return {
    href: `/agenda/${evento.slug}`,
    data: evento.inicio,
    sobrelinha: [dia, ROTULO_CATEGORIA[evento.categoria]].filter(Boolean).join(' · '),
    ...separarDestaque(evento.titulo, evento.destaque),
    meta: [quandoNoCard(evento), evento.local].filter(Boolean).join(' · '),
    variante: evento.categoria,
  };
}

/**
 * "Sábado, 28 de novembro · 17h" (e " às 19h" se terminar no mesmo dia). Sem horário:
 * "Domingo, 2 de agosto" ou, em vários dias, "1 a 13 de junho".
 */
export function quandoAcontece(evento: Pick<Evento, 'inicio' | 'fim' | 'semHorario'>): string {
  if (evento.semHorario) {
    return evento.fim && !mesmoDia(evento.inicio, evento.fim)
      ? periodo(evento.inicio, evento.fim)
      : dataLonga(evento.inicio);
  }
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
