import type { SchemaTypeDefinition } from 'sanity';
import { autor } from './documentos/autor';
import { aviso } from './documentos/aviso';
import { configuracoes } from './documentos/configuracoes';
import { evento } from './documentos/evento';
import { horarios } from './documentos/horarios';
import { pagina } from './documentos/pagina';
import { pastoral } from './documentos/pastoral';
import { post } from './documentos/post';
import { sacramento } from './documentos/sacramento';
import { santo } from './documentos/santo';
import { grupoHorarios, linhaHorario } from './objetos/horarios';
import { linkSimples } from './objetos/linkSimples';
import { textoRico } from './objetos/textoRico';
import { turma } from './objetos/turma';

/**
 * Dataset público (plano Free): nenhum tipo guarda dado pessoal de fiéis.
 * Inscrições e contatos de participantes ficam no Google Forms.
 */
export const schemaTypes: SchemaTypeDefinition[] = [
  // documentos
  configuracoes,
  horarios,
  aviso,
  evento,
  pastoral,
  sacramento,
  autor,
  post,
  santo,
  pagina,
  // objetos reutilizáveis
  textoRico,
  linkSimples,
  linhaHorario,
  grupoHorarios,
  turma,
];
