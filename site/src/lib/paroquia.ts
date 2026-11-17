/**
 * Dados institucionais usados no cabeçalho, no rodapé e na barra do celular.
 * Na Fase 3 isto passa a vir do documento `configuracoes` do Sanity; até lá,
 * ficam aqui só os dados já confirmados. O resto aparece como TODO(paroquia).
 */

export interface DadosParoquia {
  nome: string;
  /** Assinatura curta ao lado do logo. */
  assinatura: string;
  endereco: { rua: string; bairro: string; cidade: string; uf: string };
  /** Usuário do Instagram, sem o @. */
  instagram?: string;
  /** Endereço completo do canal ou página no YouTube. */
  youtube?: string;
  /** Somente dígitos, com país e DDD (ex.: 5583999999999). */
  whatsapp?: string;
  telefone?: string;
  email?: string;
  /** Link exato do Google Maps, se a paróquia tiver um. Senão, a busca pelo endereço. */
  mapaUrl?: string;
}

export const PAROQUIA: DadosParoquia = {
  nome: 'Paróquia Nossa Senhora do Rosário',
  assinatura: 'Igreja do Rosário',
  endereco: { rua: 'Rua Frei Martinho, s/n', bairro: 'Jaguaribe', cidade: 'João Pessoa', uf: 'PB' },
  instagram: 'paroquiadorosariojp',
  // TODO(paroquia): canal do YouTube, WhatsApp da secretaria, telefone, e-mail e link do Maps.
  youtube: undefined,
  whatsapp: undefined,
  telefone: undefined,
  email: undefined,
  mapaUrl: undefined,
};

/** "Rua Frei Martinho, s/n · Jaguaribe · João Pessoa – PB" */
export function enderecoEmLinhas(p: DadosParoquia): [string, string] {
  const { rua, bairro, cidade, uf } = p.endereco;
  return [rua, `${bairro} · ${cidade} – ${uf}`];
}

/** Link do "Como chegar": o do Maps da paróquia ou uma busca pelo endereço. */
export function urlMapa(p: DadosParoquia): string {
  if (p.mapaUrl) return p.mapaUrl;
  const { rua, bairro, cidade, uf } = p.endereco;
  const consulta = `${p.nome}, ${rua.replace(/,?\s*s\/n$/i, '')}, ${bairro}, ${cidade} - ${uf}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(consulta)}`;
}

export function urlWhatsApp(numero: string | undefined): string | undefined {
  const digitos = numero?.replace(/\D/g, '');
  return digitos ? `https://wa.me/${digitos}` : undefined;
}

export function urlInstagram(usuario: string | undefined): string | undefined {
  return usuario ? `https://www.instagram.com/${usuario.replace(/^@/, '')}/` : undefined;
}
