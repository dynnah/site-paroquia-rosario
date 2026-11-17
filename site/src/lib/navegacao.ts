import type { LinkSimples } from './tipos';

/** Menu principal. "Nossa história" fica no rodapé. */
export const LINKS_PRINCIPAIS: LinkSimples[] = [
  { rotulo: 'Início', href: '/' },
  { rotulo: 'Liturgia', href: '/liturgia' },
  { rotulo: 'Agenda', href: '/agenda' },
  { rotulo: 'Pastorais', href: '/pastorais' },
  { rotulo: 'Blog', href: '/blog' },
  { rotulo: 'Sacramentos', href: '/sacramentos' },
  { rotulo: 'Contato', href: '/contato' },
];

/** Links institucionais, mostrados no rodapé. */
export const LINKS_INSTITUCIONAIS: LinkSimples[] = [
  { rotulo: 'Horários', href: '/horarios' },
  { rotulo: 'Nossa história', href: '/nossa-historia' },
  { rotulo: 'Contribua', href: '/contribua' },
];

function semBarraFinal(caminho: string): string {
  return caminho.length > 1 ? caminho.replace(/\/+$/, '') : caminho;
}

/** O link é a página atual? O início só vale para "/"; as demais incluem as subpáginas. */
export function estaAtivo(href: string, caminhoAtual: string): boolean {
  const alvo = semBarraFinal(href);
  const atual = semBarraFinal(caminhoAtual);
  if (alvo === '/') return atual === '/';
  return atual === alvo || atual.startsWith(`${alvo}/`);
}
