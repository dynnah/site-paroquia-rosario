/** Tipos com um único documento, cujo `_id` é igual ao nome do tipo. */
export const SINGLETONS = ['configuracoes', 'horarios'] as const;

export function ehSingleton(tipo: string): boolean {
  return (SINGLETONS as readonly string[]).includes(tipo);
}
