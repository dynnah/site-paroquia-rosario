/**
 * Vídeos do YouTube em "fachada leve": a página mostra só a miniatura e o
 * player (youtube-nocookie.com) carrega quando a pessoa clica.
 */

const ID_VIDEO = /^[\w-]{11}$/;

/** Extrai o ID de um link do YouTube (watch, youtu.be, embed, shorts, live) ou de um ID solto. */
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

/** Miniatura 4:3 com tarjas; com `object-fit: cover` num quadro 16:9 as tarjas somem. */
export function miniaturaYouTube(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

/** Link comum para o vídeo: serve de alternativa quando o JavaScript não carrega. */
export function urlYouTube(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

/** Endereço do player sem cookies, já com reprodução automática (usado após o clique). */
export function urlPlayerYouTube(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
}
