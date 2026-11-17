/**
 * Datas e horários no formato da paróquia.
 *
 * Todo cálculo usa o fuso de São Paulo, não o do servidor de build nem o do
 * visitante. Datas "só dia" ("2026-11-17") são tratadas como dia de calendário,
 * sem conversão de fuso (senão virariam o dia anterior ao serem lidas como UTC).
 */

export const FUSO = 'America/Sao_Paulo';

const DIAS_SEMANA = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
] as const;

const MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
] as const;

const MESES_CURTOS = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
] as const;

const SEMANA_EN: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};
const SO_DATA = /^(\d{4})-(\d{2})-(\d{2})$/;

const formatadorSP = new Intl.DateTimeFormat('en-US', {
  timeZone: FUSO,
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  weekday: 'short',
});

export interface PartesData {
  ano: number;
  /** 1 a 12 */
  mes: number;
  dia: number;
  /** 0 = domingo … 6 = sábado */
  diaSemana: number;
}

/** Ano, mês, dia e dia da semana no fuso de São Paulo (padrão: agora). */
export function partesData(entrada: string | Date = new Date()): PartesData {
  if (typeof entrada === 'string') {
    const so = SO_DATA.exec(entrada);
    if (so) {
      const ano = Number(so[1]);
      const mes = Number(so[2]);
      const dia = Number(so[3]);
      return { ano, mes, dia, diaSemana: new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay() };
    }
  }

  const data = typeof entrada === 'string' ? new Date(entrada) : entrada;
  if (Number.isNaN(data.getTime())) {
    throw new RangeError(`Data inválida: ${String(entrada)}`);
  }

  const partes = Object.fromEntries(formatadorSP.formatToParts(data).map((p) => [p.type, p.value]));
  return {
    ano: Number(partes.year),
    mes: Number(partes.month),
    dia: Number(partes.day),
    diaSemana: SEMANA_EN[partes.weekday ?? ''] ?? 0,
  };
}

/** Dia da semana em São Paulo: 0 = domingo … 6 = sábado. */
export function diaDaSemana(entrada?: string | Date): number {
  return partesData(entrada).diaSemana;
}

/** "terça-feira" */
export function nomeDiaSemana(dia: number): string {
  return DIAS_SEMANA[dia] ?? '';
}

function capitalizar(texto: string): string {
  return texto.charAt(0).toLocaleUpperCase('pt-BR') + texto.slice(1);
}

/** "Terça-feira, 17 de novembro" */
export function dataLonga(entrada?: string | Date): string {
  const { dia, mes, diaSemana } = partesData(entrada);
  return `${capitalizar(nomeDiaSemana(diaSemana))}, ${dia} de ${MESES[mes - 1]}`;
}

/** "17 nov" */
export function dataCurta(entrada?: string | Date): string {
  const { dia, mes } = partesData(entrada);
  return `${dia} ${MESES_CURTOS[mes - 1]}`;
}

/** { dia: "07", mes: "out" }, para o bloco de data em arco dos eventos. */
export function diaEMes(entrada?: string | Date): { dia: string; mes: string } {
  const { dia, mes } = partesData(entrada);
  return { dia: String(dia).padStart(2, '0'), mes: MESES_CURTOS[mes - 1] ?? '' };
}

/**
 * Horário no formato da paróquia: "07:00" → "7h", "08:40" → "8h40", "17h" → "17h".
 * O que não for reconhecido volta como veio.
 */
export function formatarHora(valor: string): string {
  const texto = valor.trim();
  const partes = /^(\d{1,2})[:h](\d{2})?$/.exec(texto);
  if (!partes) return texto;

  const horas = Number(partes[1]);
  const minutos = partes[2];
  if (horas > 23 || (minutos !== undefined && Number(minutos) > 59)) return texto;

  return !minutos || minutos === '00' ? `${horas}h` : `${horas}h${minutos}`;
}
