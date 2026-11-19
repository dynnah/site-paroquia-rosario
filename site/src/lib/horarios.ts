/**
 * Cálculos sobre a tabela de horários (documento `horarios` do Sanity).
 * Tudo no fuso de São Paulo, nunca no do servidor de build.
 */
import { diaDaSemana, formatarHora, minutosDoDia, nomeDiaSemana } from './formatacao.ts';
import type { LinhaHorario } from './sanity.tipos.ts';

const HORA = /^(\d{1,2})[:h](\d{2})?$/;

/** "07:00" ou "7h" → minutos desde a meia-noite; formato desconhecido → null. */
export function horaEmMinutos(valor: string): number | null {
  const partes = HORA.exec(valor.trim());
  if (!partes) return null;
  const horas = Number(partes[1]);
  const minutos = partes[2] === undefined ? 0 : Number(partes[2]);
  if (horas > 23 || minutos > 59) return null;
  return horas * 60 + minutos;
}

/** 1020 → "17h"; 520 → "8h40". */
export function minutosEmHora(total: number): string {
  return formatarHora(`${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`);
}

export interface ProximaMissa {
  /** "hoje", "amanhã" ou o dia da semana ("domingo", "terça-feira"). */
  quando: string;
  /** "17h", "8h40" */
  hora: string;
  /** A observação da linha ("Matriz", "Capela São Cristóvão"): onde é a missa, se a tabela disser. */
  local?: string;
}

function rotuloQuando(passo: number, dia: number): string {
  if (passo === 0) return 'hoje';
  if (passo === 1) return 'amanhã';
  return nomeDiaSemana(dia);
}

interface HoraDoDia {
  minutos: number;
  local?: string;
}

/**
 * Horários (em minutos, ordenados) de um dia da semana, somando todas as linhas que o incluem,
 * cada um com a observação da sua linha (o local da missa, por exemplo).
 */
function horasDoDia(linhas: LinhaHorario[], dia: number): HoraDoDia[] {
  return linhas
    .filter((linha) => linha.dias.includes(dia))
    .flatMap((linha) =>
      linha.horas.map((hora) => ({ minutos: horaEmMinutos(hora), local: linha.nota })),
    )
    .filter((hora): hora is { minutos: number; local: string | undefined } => hora.minutos !== null)
    .sort((a, b) => a.minutos - b.minutos);
}

/**
 * A primeira missa depois de `agora`, olhando até uma semana à frente.
 * Linhas sem horário (como "Sem missa") não contam. Sem nenhuma missa, devolve null.
 */
export function proximaMissa(
  linhas: LinhaHorario[],
  agora: Date = new Date(),
): ProximaMissa | null {
  const hoje = diaDaSemana(agora);
  const minutosAgora = minutosDoDia(agora);

  for (let passo = 0; passo <= 7; passo++) {
    const dia = (hoje + passo) % 7;
    const horas = horasDoDia(linhas, dia);
    const escolhida = passo === 0 ? horas.find((hora) => hora.minutos > minutosAgora) : horas[0];
    if (escolhida !== undefined) {
      return {
        quando: rotuloQuando(passo, dia),
        hora: minutosEmHora(escolhida.minutos),
        ...(escolhida.local ? { local: escolhida.local } : {}),
      };
    }
  }
  return null;
}

/** As linhas que valem para o dia de `agora` (para o card "Missa de hoje"). */
export function linhasDeHoje(linhas: LinhaHorario[], agora: Date = new Date()): LinhaHorario[] {
  const hoje = diaDaSemana(agora);
  return linhas.filter((linha) => linha.dias.includes(hoje));
}
