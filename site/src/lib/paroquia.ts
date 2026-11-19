/**
 * Dados institucionais usados no cabeçalho, no rodapé, na barra do celular e
 * na página de contato. A fonte é o documento `configuracoes` do Sanity
 * (`dadosDaParoquia`); `PAROQUIA` guarda só o que já está confirmado e serve
 * de reserva para qualquer campo que ainda esteja vazio no painel.
 */
import type { Configuracoes } from './sanity.tipos.ts';
import type { LinkSimples } from './tipos.ts';

/** Um lugar onde a paróquia celebra e atende: a matriz ou uma capela. */
export interface LocalParoquia {
  /** "Matriz", "Capela São Cristóvão". */
  nome: string;
  rua: string;
  bairro: string;
  cidade: string;
  uf: string;
  /** "58015-310". Só aparece se a paróquia informar. */
  cep?: string;
  /** Link exato do Google Maps, se houver. Senão, a busca pelo endereço. */
  mapaUrl?: string;
}

export interface DadosParoquia {
  nome: string;
  /** Assinatura curta ao lado do logo. */
  assinatura: string;
  /** Endereço da matriz (o que aparece no rodapé e nos dados estruturados). */
  endereco: { rua: string; bairro: string; cidade: string; uf: string; cep?: string };
  /** Capelas, além da matriz. */
  capelas: LocalParoquia[];
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
  endereco: {
    rua: 'Rua Frei Martinho, s/n',
    bairro: 'Jaguaribe',
    cidade: 'João Pessoa',
    uf: 'PB',
    cep: '58014-430',
  },
  // Endereço da capela informado pela paróquia em 19/11/2026. As outras capelas das missas
  // (Sagrada Família, São Francisco e Santa Clara) entram quando a paróquia passar o endereço.
  capelas: [
    {
      nome: 'Capela São Cristóvão',
      rua: 'R. São Cristóvão, 211',
      bairro: 'Jaguaribe',
      cidade: 'João Pessoa',
      uf: 'PB',
      cep: '58015-310',
    },
  ],
  instagram: 'paroquiadorosariojp',
  // TODO(paroquia): canal do YouTube, e-mail e link do Maps.
  youtube: undefined,
  // O mesmo número atende por ligação e por WhatsApp (informado pela paróquia).
  whatsapp: '558332411433',
  telefone: '(83) 3241-1433',
  email: undefined,
  mapaUrl: undefined,
};

/** "Rua Frei Martinho, s/n · Jaguaribe · João Pessoa – PB" (a matriz) */
export function enderecoEmLinhas(p: DadosParoquia): [string, string] {
  const { rua, bairro, cidade, uf } = p.endereco;
  return [rua, `${bairro} · ${cidade} – ${uf}`];
}

/** A matriz como um local, no mesmo formato das capelas. */
export function matriz(p: DadosParoquia): LocalParoquia {
  return { nome: 'Matriz', ...p.endereco, ...(p.mapaUrl ? { mapaUrl: p.mapaUrl } : {}) };
}

/** Todos os locais, a matriz primeiro. */
export function locaisDaParoquia(p: DadosParoquia): LocalParoquia[] {
  return [matriz(p), ...p.capelas];
}

/** As linhas do endereço de um local: rua, "Bairro · Cidade – UF" e, se houver, "CEP …". */
export function enderecoDoLocal(local: LocalParoquia): string[] {
  const linhas = [local.rua, `${local.bairro} · ${local.cidade} – ${local.uf}`];
  if (local.cep) linhas.push(`CEP ${local.cep}`);
  return linhas;
}

/**
 * Link do "Como chegar" de um local: o do Maps, se a paróquia tiver, ou uma busca pelo
 * endereço. `nome` é o que se procura no mapa (a paróquia, para a matriz).
 */
export function urlMapaDoLocal(local: LocalParoquia, nome: string): string {
  if (local.mapaUrl) return local.mapaUrl;
  const rua = local.rua.replace(/,?\s*s\/n$/i, '');
  const consulta = [nome, rua, local.bairro, `${local.cidade} - ${local.uf}`, local.cep]
    .filter(Boolean)
    .join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(consulta)}`;
}

/** Link do "Como chegar" da matriz: o do Maps da paróquia ou uma busca pelo endereço. */
export function urlMapa(p: DadosParoquia): string {
  return urlMapaDoLocal(matriz(p), p.nome);
}

/**
 * Link do WhatsApp. Aceita o número como a paróquia o escreve: "5583999999999" ou
 * "(83) 3241-1433" (10 ou 11 dígitos, com DDD): nesse caso entra o 55 do Brasil.
 */
export function urlWhatsApp(numero: string | undefined): string | undefined {
  const digitos = numero?.replace(/\D/g, '');
  if (!digitos) return undefined;
  const comPais = digitos.length === 10 || digitos.length === 11 ? `55${digitos}` : digitos;
  return `https://wa.me/${comPais}`;
}

export function urlInstagram(usuario: string | undefined): string | undefined {
  return usuario ? `https://www.instagram.com/${usuario.replace(/^@/, '')}/` : undefined;
}

/** "(83) 3333-4444" → "tel:8333334444". Sem telefone, undefined. */
export function urlTelefone(telefone: string | undefined): string | undefined {
  const numero = telefone?.replace(/[^\d+]/g, '');
  return numero ? `tel:${numero}` : undefined;
}

/**
 * Links de contato do rodapé, cada um com uma ação só: "WhatsApp" abre a conversa e "Ligar"
 * disca. Quando o WhatsApp é o mesmo número do telefone, o número aparece nos dois.
 */
export function linksDeContatoDoRodape(
  p: Pick<DadosParoquia, 'telefone' | 'whatsapp' | 'email'>,
): LinkSimples[] {
  const links: LinkSimples[] = [];
  const doTelefone = urlWhatsApp(p.telefone);
  const whatsapp = urlWhatsApp(p.whatsapp) ?? doTelefone;
  if (whatsapp) {
    const mesmoNumero = Boolean(p.telefone) && whatsapp === doTelefone;
    links.push({ rotulo: mesmoNumero ? `WhatsApp · ${p.telefone}` : 'WhatsApp', href: whatsapp });
  }
  const ligar = urlTelefone(p.telefone);
  if (p.telefone && ligar) links.push({ rotulo: `Ligar · ${p.telefone}`, href: ligar });
  if (p.email) links.push({ rotulo: p.email, href: `mailto:${p.email}` });
  return links;
}

/**
 * Capelas cadastradas no Studio. Entra só a que tem nome e rua; bairro, cidade e UF vazios
 * herdam os da matriz. Sem nenhuma capela válida no painel, vale a reserva do código.
 */
function capelasDoPainel(
  doPainel: Configuracoes['capelas'],
  reserva: LocalParoquia[],
): LocalParoquia[] {
  const validas = (doPainel ?? []).flatMap((c) => {
    const nome = c.nome?.trim();
    const rua = c.rua?.trim();
    if (!nome || !rua) return [];
    const local: LocalParoquia = {
      nome,
      rua,
      bairro: c.bairro?.trim() || PAROQUIA.endereco.bairro,
      cidade: c.cidade?.trim() || PAROQUIA.endereco.cidade,
      uf: c.uf?.trim() || PAROQUIA.endereco.uf,
    };
    if (c.cep?.trim()) local.cep = c.cep.trim();
    if (c.mapaUrl) local.mapaUrl = c.mapaUrl;
    return [local];
  });
  return validas.length > 0 ? validas : reserva;
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
      cep: endereco.cep || PAROQUIA.endereco.cep,
    },
    instagram: config.instagram?.replace(/^@/, '') || PAROQUIA.instagram,
    youtube: config.youtube || PAROQUIA.youtube,
    whatsapp: config.whatsapp || PAROQUIA.whatsapp,
    telefone: config.telefone || PAROQUIA.telefone,
    email: config.email || PAROQUIA.email,
    mapaUrl: config.mapaUrl || PAROQUIA.mapaUrl,
    capelas: capelasDoPainel(config.capelas, PAROQUIA.capelas),
  };
}
