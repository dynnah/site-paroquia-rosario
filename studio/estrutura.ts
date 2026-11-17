import { BellIcon } from '@sanity/icons/Bell';
import { CalendarIcon } from '@sanity/icons/Calendar';
import { CogIcon } from '@sanity/icons/Cog';
import { ComposeIcon } from '@sanity/icons/Compose';
import { HomeIcon } from '@sanity/icons/Home';
import { StarIcon } from '@sanity/icons/Star';
import { UsersIcon } from '@sanity/icons/Users';
import type { StructureBuilder, StructureResolver } from 'sanity/structure';

function documentoUnico(S: StructureBuilder, tipo: string, titulo: string, icone: typeof CogIcon) {
  return S.listItem()
    .id(tipo)
    .title(titulo)
    .icon(icone)
    .child(S.document().schemaType(tipo).documentId(tipo).title(titulo));
}

/** Menu lateral do Studio: Início · Agenda · Comunidade · Blog · Liturgia · Configurações. */
export const estrutura: StructureResolver = (S) =>
  S.list()
    .title('Conteúdo')
    .items([
      S.listItem()
        .title('Início')
        .icon(HomeIcon)
        .child(
          S.list()
            .title('Início')
            .items([
              S.documentTypeListItem('aviso').title('Avisos').icon(BellIcon),
              documentoUnico(S, 'horarios', 'Horários', CalendarIcon),
            ]),
        ),

      S.listItem()
        .title('Agenda')
        .icon(CalendarIcon)
        .child(
          S.list()
            .title('Agenda')
            .items([
              S.listItem()
                .title('Próximos eventos')
                .child(
                  S.documentList()
                    .title('Próximos eventos')
                    .schemaType('evento')
                    .filter('_type == "evento" && coalesce(fim, inicio) >= now()')
                    .defaultOrdering([{ field: 'inicio', direction: 'asc' }]),
                ),
              S.listItem()
                .title('Eventos passados')
                .child(
                  S.documentList()
                    .title('Eventos passados')
                    .schemaType('evento')
                    .filter('_type == "evento" && coalesce(fim, inicio) < now()')
                    .defaultOrdering([{ field: 'inicio', direction: 'desc' }]),
                ),
            ]),
        ),

      S.listItem()
        .title('Comunidade')
        .icon(UsersIcon)
        .child(
          S.list()
            .title('Comunidade')
            .items([
              S.documentTypeListItem('pastoral').title('Pastorais e movimentos'),
              S.documentTypeListItem('sacramento').title('Sacramentos'),
              S.documentTypeListItem('pagina').title('Páginas de texto'),
            ]),
        ),

      S.listItem()
        .title('Blog')
        .icon(ComposeIcon)
        .child(
          S.list()
            .title('Blog')
            .items([
              S.listItem()
                .title('Em revisão')
                .child(
                  S.documentList()
                    .title('Posts em revisão')
                    .schemaType('post')
                    .filter('_type == "post" && statusRevisao == "em-revisao"')
                    .defaultOrdering([{ field: 'data', direction: 'desc' }]),
                ),
              S.listItem()
                .title('Rascunhos')
                .child(
                  S.documentList()
                    .title('Rascunhos')
                    .schemaType('post')
                    .filter('_type == "post" && statusRevisao == "rascunho"')
                    .defaultOrdering([{ field: 'data', direction: 'desc' }]),
                ),
              S.listItem()
                .title('Aprovados')
                .child(
                  S.documentList()
                    .title('Posts aprovados')
                    .schemaType('post')
                    .filter('_type == "post" && statusRevisao == "aprovado"')
                    .defaultOrdering([{ field: 'data', direction: 'desc' }]),
                ),
              S.divider(),
              S.documentTypeListItem('post').title('Todos os posts'),
              S.documentTypeListItem('autor').title('Autores'),
            ]),
        ),

      S.listItem()
        .title('Liturgia')
        .icon(StarIcon)
        .child(
          S.list()
            .title('Liturgia')
            .items([
              S.listItem()
                .title('Santos do dia')
                .child(
                  S.documentTypeList('santo')
                    .title('Santos do dia')
                    .defaultOrdering([{ field: 'dia', direction: 'asc' }]),
                ),
            ]),
        ),

      S.divider(),
      documentoUnico(S, 'configuracoes', 'Configurações', CogIcon),
    ]);
