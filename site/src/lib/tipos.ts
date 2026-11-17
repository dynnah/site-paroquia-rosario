/** Tipos compartilhados pelos componentes. */

export interface LinkSimples {
  rotulo: string;
  href: string;
}

/** Cor litúrgica do dia (só usada no selo litúrgico e na bolinha da liturgia). */
export type CorLiturgica = 'verde' | 'roxo' | 'branco' | 'vermelho' | 'rosa';

/** Família da pastoral: define a cor do filete no topo do card. */
export type FamiliaPastoral = 'paroquial' | 'mariano' | 'franciscano' | 'social';
