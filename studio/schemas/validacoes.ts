/**
 * Validações e utilitários puros (sem importar o Sanity), para poderem ser
 * testados com `npm run test -w studio`.
 */

type Resultado = true | string;

/** Links aceitos nos campos de endereço. Caminhos relativos ("/horarios") também. */
export const ESQUEMAS_LINK = ['http', 'https', 'mailto', 'tel'];

const HORA_24 = '(?:[01]\\d|2[0-3]):[0-5]\\d';
const HORA = new RegExp(`^(${HORA_24})(?:-(${HORA_24}))?$`);

/**
 * "07:00", em 24 horas, ou um período "08:00-12:00" (a secretaria, por exemplo, atende
 * "das 8h às 12h"). O fim do período tem de ser depois do começo.
 */
export function validarHora(valor: string | undefined): Resultado {
  if (!valor) return true;
  const partes = HORA.exec(valor);
  if (!partes) {
    return 'Use o formato 07:00 (24 horas), por exemplo 17:00. Para um período, 08:00-12:00.';
  }
  const [, inicio, fim] = partes;
  return fim && fim <= (inicio as string) ? 'O fim do período tem de ser depois do começo.' : true;
}

const DIAS_NO_MES = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** "MM-DD", aceitando 02-29 (santos celebrados em ano bissexto). */
export function validarMesDia(valor: string | undefined): Resultado {
  if (!valor) return true;
  const partes = /^(\d{2})-(\d{2})$/.exec(valor);
  if (!partes) return 'Use o formato MM-DD, por exemplo 11-17 para 17 de novembro.';
  const mes = Number(partes[1]);
  const dia = Number(partes[2]);
  if (mes < 1 || mes > 12 || dia < 1 || dia > DIAS_NO_MES[mes - 1]) {
    return 'Essa data não existe no calendário.';
  }
  return true;
}

const ID_VIDEO = /^[\w-]{11}$/;

/**
 * Extrai o ID de um link do YouTube (watch, youtu.be, embed, shorts, live).
 * Mantenha igual a `extrairIdYouTube` em site/src/lib/youtube.ts.
 */
export function extrairIdYouTube(entrada: string): string | null {
  const texto = entrada.trim();
  if (ID_VIDEO.test(texto)) return texto;

  let url: URL;
  try {
    url = new URL(/^https?:\/\//.test(texto) ? texto : `https://${texto}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^(www\.|m\.|music\.)/, '');
  let id: string | null = null;

  if (host === 'youtu.be') {
    id = url.pathname.split('/')[1] ?? null;
  } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (url.pathname === '/watch') {
      id = url.searchParams.get('v');
    } else {
      id = /^\/(?:embed|shorts|live|v)\/([\w-]{11})/.exec(url.pathname)?.[1] ?? null;
    }
  }

  return id && ID_VIDEO.test(id) ? id : null;
}

export function validarYouTube(valor: string | undefined): Resultado {
  if (!valor) return true;
  return extrairIdYouTube(valor)
    ? true
    : 'Cole o link de um vídeo do YouTube (youtube.com/watch?v=… ou youtu.be/…).';
}

const DURACAO = /^(\d{1,2}:)?[0-5]?\d:[0-5]\d$/;

/** "6:40" ou "1:02:15". */
export function validarDuracao(valor: string | undefined): Resultado {
  return !valor || DURACAO.test(valor) ? true : 'Use o formato 6:40 (minutos:segundos).';
}

/** Só dígitos, com 55 e DDD: 5583999999999. */
/** "58015-310" (o traço é opcional). */
export function validarCep(valor: string | undefined): Resultado {
  return !valor || /^\d{5}-?\d{3}$/.test(valor.trim()) ? true : 'Use o formato 58015-310.';
}

export function validarWhatsApp(valor: string | undefined): Resultado {
  return !valor || /^55\d{10,11}$/.test(valor)
    ? true
    : 'Somente dígitos, com 55 e o DDD. Exemplo: 5583999999999.';
}

/** Usuário do Instagram, com ou sem @. */
export function validarInstagram(valor: string | undefined): Resultado {
  return !valor || /^@?[A-Za-z0-9._]{1,30}$/.test(valor)
    ? true
    : 'Só o nome de usuário, sem link. Exemplo: paroquiadorosariojp.';
}

/** Slug sem acentos: "Evangelização" → "evangelizacao". */
export function slugificar(entrada: string): string {
  return entrada
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
