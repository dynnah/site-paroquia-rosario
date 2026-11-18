/**
 * Converte o Portable Text do Sanity (campo `textoRico`) numa lista simples de
 * nós, que `TextoRico.astro` renderiza sem `set:html`. Assim nenhum HTML vindo
 * do painel chega ao navegador sem passar por aqui.
 *
 * Suporta o que o schema permite: parágrafo, título (h2), subtítulo (h3),
 * citação, listas (marcadores e numerada), negrito, itálico e link.
 * Listas aninhadas são achatadas num único nível.
 */
import type { BlocoTexto, TextoRico } from './sanity.tipos.ts';

export interface Trecho {
  texto: string;
  negrito?: true;
  italico?: true;
  /** Só endereços seguros (veja `linkSeguro`). */
  href?: string;
}

export type EstiloTexto = 'p' | 'h2' | 'h3' | 'blockquote';

export type NoTexto =
  { tipo: EstiloTexto; trechos: Trecho[] } | { tipo: 'ul' | 'ol'; itens: Trecho[][] };

const ESQUEMA_SEGURO = /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i;

/** Aceita http(s), mailto, tel e caminhos do próprio site. Qualquer outro esquema (javascript:, data:) é descartado. */
export function linkSeguro(href: string | undefined): string | undefined {
  const valor = href?.trim();
  return valor && ESQUEMA_SEGURO.test(valor) ? valor : undefined;
}

const ESTILOS: Record<string, EstiloTexto> = {
  normal: 'p',
  h2: 'h2',
  h3: 'h3',
  blockquote: 'blockquote',
};

function trechosDoBloco(bloco: BlocoTexto): Trecho[] {
  const definicoes = new Map(
    (bloco.markDefs ?? []).map((definicao) => [definicao._key, definicao]),
  );

  return (bloco.children ?? [])
    .filter((filho) => filho._type === 'span' && filho.text)
    .map((filho) => {
      const marcas = filho.marks ?? [];
      const trecho: Trecho = { texto: filho.text };
      if (marcas.includes('strong')) trecho.negrito = true;
      if (marcas.includes('em')) trecho.italico = true;
      const ligacao = marcas
        .map((marca) => definicoes.get(marca))
        .find((definicao) => definicao?._type === 'link');
      const href = linkSeguro(ligacao?.href);
      if (href) trecho.href = href;
      return trecho;
    });
}

export function montarTexto(blocos: TextoRico | null | undefined): NoTexto[] {
  const nos: NoTexto[] = [];

  for (const bloco of blocos ?? []) {
    if (bloco._type !== 'block') continue;

    const trechos = trechosDoBloco(bloco);
    if (!trechos.some((trecho) => trecho.texto.trim())) continue;

    if (bloco.listItem) {
      const tipo = bloco.listItem === 'number' ? 'ol' : 'ul';
      const ultimo = nos.at(-1);
      if (ultimo && ultimo.tipo === tipo) ultimo.itens.push(trechos);
      else nos.push({ tipo, itens: [trechos] });
      continue;
    }

    nos.push({ tipo: ESTILOS[bloco.style ?? 'normal'] ?? 'p', trechos });
  }

  return nos;
}
