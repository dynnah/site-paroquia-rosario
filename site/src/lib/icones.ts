/**
 * Ícones em SVG inline: traço de 1.75px, cantos arredondados e `currentColor`.
 * Os desenhos vêm dos previews do design system. Nada de ícone de categoria:
 * aqui ficam só os de ação (relógio, mapa, copiar…).
 */

export interface DefinicaoIcone {
  /** Conteúdo interno do <svg> (viewBox 24×24). */
  corpo: string;
  /** Ícone sólido (sem traço), como o "play" do vídeo. */
  preenchido?: boolean;
}

export const ICONES = {
  relogio: { corpo: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>' },
  local: {
    corpo:
      '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  },
  copiar: {
    corpo: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>',
  },
  confirmar: { corpo: '<path d="M20 6 9 17l-5-5"/>' },
  info: { corpo: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>' },
  estrela: {
    corpo: '<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z"/>',
  },
  alerta: { corpo: '<path d="M12 3l9.5 17h-19z"/><path d="M12 10v4M12 17h.01"/>' },
  menu: { corpo: '<path d="M4 7h16M4 12h16M4 17h16"/>' },
  fechar: { corpo: '<path d="M18 6 6 18M6 6l12 12"/>' },
  livro: {
    corpo: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5M12 7v6M9 10h6"/>',
  },
  mensagem: { corpo: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>' },
  play: { corpo: '<path d="M7 4.5v15l13-7.5z"/>', preenchido: true },
} as const satisfies Record<string, DefinicaoIcone>;

export type NomeIcone = keyof typeof ICONES;

/** Atributos do <svg>, iguais para o Astro (Icone.astro) e para o Vue. */
export function atributosIcone(nome: NomeIcone): Record<string, string> {
  const base = { viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false' };
  if ((ICONES[nome] as DefinicaoIcone).preenchido) {
    return { ...base, fill: 'currentColor' };
  }
  return {
    ...base,
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '1.75',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  };
}
