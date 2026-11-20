# Igreja do Rosário: design system

Visual language of the site of **Paróquia Nossa Senhora do Rosário** (Jaguaribe, João Pessoa). It starts from what the parish already shows on Instagram: the facade logo in brown and cream, serif titles with an italic pair, Marian blue, altar gold and the brown of the Franciscan habit.

**Phone first.** Most visits come from an Instagram or WhatsApp link, on a phone, looking for a time. Everything is designed for 360px and grows from there.

## Files

| File | What it is |
|---|---|
| `tokens.css`, `tokens.json` | Design tokens (CSS variables, light and dark theme). Keep the two in sync |
| `components/bundle.css` | Every `ros-*` class, reset and base styles. No JavaScript needed for the visuals |
| `components/<Name>/preview.html` | Reference markup for the component. Copy it, do not invent another structure |
| `components/<Name>/README.md` | Usage rules for the component |
| `assets/Logos/` | The facade logo (original and transparent), see its README |

**Language.** Docs, comments and labels are English. Identifiers stay Portuguese because the site depends on them: token names (`--fundo`), classes (`ros-evento`) and folder names (`Cabecalho`). Sample copy in the previews is Portuguese on purpose: it is the site's real voice.

## Principles

1. **The time comes first.** Mass, confession and the secretary's hours show above the fold on any screen.
2. **Readable by older people.** Body text never below 16px on phones (`corpo` is 17px), AA contrast everywhere, touch targets of `toque-min` (44px) in height **and** width, visible focus.
3. **Delicate, never harsh.** Cream background, soft brown text, highlights as a soft fill with coloured text on top. A solid dark colour only on the logo and the primary button. No gradients, glass, heavy shadows, emoji or category icons.
4. **Roman + italic.** One line in upright Playfair Display, the next in italic: "Nossa Senhora / *do Rosário*".

## Tokens at a glance

| Role | Tokens | Use |
|---|---|---|
| Background | `fundo`, `fundo-elevado`, `fundo-afundado` | Page, cards, alternating bands and footer |
| Text | `texto`, `texto-suave` | All text; `texto-suave` for dates and captions |
| Identity | `marrom`, `creme` | Logo and large identity blocks only |
| Action | `acao`, `sobre-acao` | The primary button: **one per screen** |
| Marian | `mariano`, `mariano-suave` | Links, focus, secondary button, Our Lady's feasts |
| Gold | `ouro`, `ouro-suave`, `ouro-texto` | Beads, rules, frames. Never text: use `ouro-texto` |
| Franciscan | `terracota`, `terracota-suave` | Franciscan content |
| State | `verde`, `alerta` | "Open now", errors, schedule changes only |
| Liturgical | `liturgico-*` | The liturgical colour badge only |

Highlights are always **soft fill + coloured text** (`mariano-suave` + `mariano`, `terracota-suave` + `terracota`, `ouro-suave` + `ouro-texto`). Type: **Playfair Display** (titles) and **Nunito Sans** (everything else). Spacing `espaco-*`, radii `raio-*`, one barely visible shadow `sombra-card`.

## Layout

- Breakpoints `640px` and `1024px`; the container stops at `container-max` (1200px) with side margins of 16 / 24 / 32px (`.container`). Sections are 48px apart on phones, 64px on desktop. Paragraphs are limited to `medida-texto` (68ch).
- Components use **container queries**: a card lays itself out by the width it has, not the screen's. Grids use `repeat(auto-fill, minmax(280px, 1fr))`.
- **Phone:** header with the "Horários" and "Menu" buttons (drawer menu) plus a fixed bottom bar (Horários · Como chegar · WhatsApp). **Desktop (≥ 960px):** logo icon, menu and "Horários" centred as one group.

## Shapes

- **The arch.** The facade's windows are arches: the date block, the hero arch and the background arches round only their top corners (`raio-arco`).
- **The rosary.** The section divider is a row of gold beads: five small, one large, five small. Never inside cards.
- Icons: 1.75px stroke, rounded, `currentColor` (Lucide). The logo is never recoloured; on the dark theme it sits on a `creme` square.

## Voice

Welcoming and direct, in Brazilian Portuguese. Times as **7h**, **17h**, **8h40**; dates as "17 de novembro". Buttons start with a verb: "Ver horários", "Quero participar", "Copiar chave".

## Components

| Folder | What it is |
|---|---|
| `Cabecalho`, `Gaveta`, `BarraMobile`, `Rodape` | Header, phone drawer menu, phone shortcut bar, footer |
| `Hero` | Home opening: title, next Mass, the facade in an arch |
| `Botao`, `Aviso`, `SeloLiturgico`, `DivisorTerco` | Buttons and text links, notices, liturgical badge, rosary divider |
| `SecaoPagina`, `Paginacao`, `EstadoVazio` | Section header, pagination and date navigation, empty state |
| `Horarios`, `Evento`, `Pastoral`, `DoacaoPix` | Schedule cards and grid, agenda card, community card, Pix donation |
| `LiturgiaDoDia`, `SantoDoDia` | Readings card (sequence, text size), saint of the day |
| `CardPost` | Blog post card, text or YouTube video |
| `PaginaLiturgia`, `PaginaBlog`, `PaginaPost` | Page compositions |

Not part of the design system, kept in `site/src/styles/global.css`: the skip link, the footer-at-the-bottom layout, scroll padding under the sticky header and the page-transition animation.
