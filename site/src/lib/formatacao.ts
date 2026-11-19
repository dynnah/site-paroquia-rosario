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

export function capitalizar(texto: string): string {
  return texto.charAt(0).toLocaleUpperCase('pt-BR') + texto.slice(1);
}

/** "Terça-feira, 17 de novembro" */
export function dataLonga(entrada?: string | Date): string {
  const { dia, mes, diaSemana } = partesData(entrada);
  return `${capitalizar(nomeDiaSemana(diaSemana))}, ${dia} de ${MESES[mes - 1]}`;
}

/** "17 de novembro de 2026" */
export function dataCompleta(entrada?: string | Date): string {
  const { dia, mes, ano } = partesData(entrada);
  return `${dia} de ${MESES[mes - 1]} de ${ano}`;
}

/** "6 de outubro" */
export function diaDeMes(entrada?: string | Date): string {
  const { dia, mes } = partesData(entrada);
  return `${dia} de ${MESES[mes - 1]}`;
}

/** "2 de agosto", "1 a 13 de junho" (mesmo mês) ou "28 de setembro a 6 de outubro". */
export function periodo(inicio: string | Date, fim: string | Date): string {
  const a = partesData(inicio);
  const b = partesData(fim);
  if (a.ano === b.ano && a.mes === b.mes && a.dia === b.dia) return diaDeMes(inicio);
  if (a.ano === b.ano && a.mes === b.mes) return `${a.dia} a ${b.dia} de ${MESES[b.mes - 1]}`;
  return `${diaDeMes(inicio)} a ${diaDeMes(fim)}`;
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

/** "07:00" → "7h", "08:40" → "8h40"; formato desconhecido → null. */
function horaSimples(texto: string): string | null {
  const partes = /^(\d{1,2})[:h](\d{2})?$/.exec(texto.trim());
  if (!partes) return null;

  const horas = Number(partes[1]);
  const minutos = partes[2];
  if (horas > 23 || (minutos !== undefined && Number(minutos) > 59)) return null;

  return !minutos || minutos === '00' ? `${horas}h` : `${horas}h${minutos}`;
}

/**
 * Horário no formato da paróquia: "07:00" → "7h", "08:40" → "8h40", "17h" → "17h".
 * Um período vira "8h às 12h" ("08:00-12:00"). O que não for reconhecido volta como veio.
 */
export function formatarHora(valor: string): string {
  const texto = valor.trim();
  const periodo = /^([^-]+)-([^-]+)$/.exec(texto);
  if (periodo) {
    const inicio = horaSimples(periodo[1] ?? '');
    const fim = horaSimples(periodo[2] ?? '');
    return inicio && fim ? `${inicio} às ${fim}` : texto;
  }
  return horaSimples(texto) ?? texto;
}

const formatadorHoraSP = new Intl.DateTimeFormat('en-GB', {
  timeZone: FUSO,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/** Minutos desde a meia-noite, no fuso de São Paulo (padrão: agora). */
export function minutosDoDia(entrada: string | Date = new Date()): number {
  const data = typeof entrada === 'string' ? new Date(entrada) : entrada;
  if (Number.isNaN(data.getTime())) {
    throw new RangeError(`Data inválida: ${String(entrada)}`);
  }
  const partes = Object.fromEntries(
    formatadorHoraSP.formatToParts(data).map((p) => [p.type, p.value]),
  );
  return (Number(partes.hour) % 24) * 60 + Number(partes.minute);
}

/** "17h" ou "8h40": a hora de um instante, vista em São Paulo. */
export function horaLocal(entrada: string | Date): string {
  const total = minutosDoDia(entrada);
  return formatarHora(`${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`);
}

const doisDigitos = (n: number) => String(n).padStart(2, '0');

/** "2026-11-17": o dia de calendário em São Paulo (padrão: agora). */
export function dataISO(entrada: string | Date = new Date()): string {
  const { ano, mes, dia } = partesData(entrada);
  return `${ano}-${doisDigitos(mes)}-${doisDigitos(dia)}`;
}

/**
 * Soma (ou subtrai) dias de calendário a um dia "AAAA-MM-DD". É aritmética de
 * calendário, sem fuso: "2026-12-31" + 1 = "2027-01-01".
 */
export function somarDias(iso: string, dias: number): string {
  if (!SO_DATA.test(iso)) throw new RangeError(`Dia inválido (esperado AAAA-MM-DD): ${iso}`);
  const { ano, mes, dia } = partesData(iso);
  const data = new Date(Date.UTC(ano, mes - 1, dia + dias));
  return `${data.getUTCFullYear()}-${doisDigitos(data.getUTCMonth() + 1)}-${doisDigitos(data.getUTCDate())}`;
}

/**
 * Um instante que cai no meio do dia "AAAA-MM-DD" em São Paulo (12h; 15h UTC).
 * Serve para chamar as funções que recebem `Date` (santo do dia, horários de
 * missa) para um dia específico sem risco de virar o dia por causa do fuso.
 */
export function instanteDoDia(iso: string): Date {
  if (!SO_DATA.test(iso)) throw new RangeError(`Dia inválido (esperado AAAA-MM-DD): ${iso}`);
  const { ano, mes, dia } = partesData(iso);
  return new Date(Date.UTC(ano, mes - 1, dia, 15));
}
