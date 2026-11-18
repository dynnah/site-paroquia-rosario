/**
 * Dados institucionais usados no cabeçalho, no rodapé, na barra do celular e
 * na página de contato. A fonte é o documento `configuracoes` do Sanity
 * (`dadosDaParoquia`); `PAROQUIA` guarda só o que já está confirmado e serve
 * de reserva para qualquer campo que ainda esteja vazio no painel.
 */
import type { Configuracoes } from './sanity.tipos.ts';

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

/** "(83) 3333-4444" → "tel:8333334444". Sem telefone, undefined. */
export function urlTelefone(telefone: string | undefined): string | undefined {
  const numero = telefone?.replace(/[^\d+]/g, '');
  return numero ? `tel:${numero}` : undefined;
}

/** Junta o documento `configuracoes` com `PAROQUIA`: campo vazio no painel usa o valor de reserva. */
export function dadosDaParoquia(config: Configuracoes | null | undefined): DadosParoquia {
  if (!config) return PAROQUIA;
  const endereco = config.endereco ?? {};
  return {
    nome: config.nome || PAROQUIA.nome,
    assinatura: config.assinatura || PAROQUIA.assinatura,
    endereco: {
      rua: endereco.rua || PAROQUIA.endereco.rua,
      bairro: endereco.bairro || PAROQUIA.endereco.bairro,
      cidade: endereco.cidade || PAROQUIA.endereco.cidade,
      uf: endereco.uf || PAROQUIA.endereco.uf,
    },
    instagram: config.instagram?.replace(/^@/, '') || PAROQUIA.instagram,
    youtube: config.youtube || PAROQUIA.youtube,
    whatsapp: config.whatsapp || PAROQUIA.whatsapp,
    telefone: config.telefone || PAROQUIA.telefone,
    email: config.email || PAROQUIA.email,
    mapaUrl: config.mapaUrl || PAROQUIA.mapaUrl,
  };
}
