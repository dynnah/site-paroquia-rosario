# Qualidade: SEO, acessibilidade, desempenho e estatísticas

Resultado da Fase 6, medido em 19/11/2026 sobre o `site/dist` (32 páginas), com Chrome 155 e conteúdo `[EXEMPLO]`. Para repetir as medições, veja "Como conferir" no fim.

## Resumo

| Item | Resultado |
|---|---|
| Acessibilidade (axe-core, WCAG 2.0/2.1 A e AA + boas práticas) | **0 problemas** em 32 páginas × 360, 768 e 1280 px |
| Teclado | todo elemento que recebe o foco mostra contorno visível; a gaveta do menu abre, prende o foco, fecha com Esc e devolve o foco ao botão |
| Lighthouse mobile, desempenho | Início **100** · Liturgia **100** · Blog **98** · Horários 100 · Contato 100 |
| Lighthouse mobile, acessibilidade · boas práticas · SEO | **100 · 100 · 100** nas cinco páginas |
| JSON-LD | `CatholicChurch` em Início e Contato; `Event` em cada evento da agenda |
| `sitemap-index.xml` e `robots.txt` | gerados no build (precisam de `SITE_URL`, ver abaixo) |

Medidas do Lighthouse (mobile, 4G simulada): Início FCP/LCP 1,0 s, TBT 20 ms, CLS 0,06 · Liturgia FCP/LCP 0,9 s, TBT 20 ms, CLS 0,03 · Blog FCP 0,9 s, LCP 2,4 s, TBT 0 ms, CLS 0,05.

O que o Lighthouse ainda aponta é só efeito do servidor de teste local (sem HTTP/2 nem compressão) ou de coisa de fora: miniaturas do YouTube (10 KiB a menos se fossem servidas por nós, mas vêm de `i.ytimg.com`) e o runtime do Vue (68 KB, 26 KB comprimido), que as ilhas interativas usam.

## SEO

- **Título e descrição por página.** O `BaseLayout` monta `<title>` ("Página · Paróquia Nossa Senhora do Rosário"; a página inicial usa o título inteiro, sem sufixo) e `<meta name="description">`. A descrição é cortada em até **160 caracteres, sempre numa palavra inteira** (`descricaoCurta` em `lib/seo.ts`), então um resumo longo de post não vira texto truncado no Google. Sem descrição, vale a padrão do site.
- **Canônico e Open Graph.** Cada página tem `<link rel="canonical">`, `og:title`, `og:description`, `og:url`, `og:image` (1200 × 630), `og:locale pt_BR`, `og:site_name` e `twitter:card summary_large_image`. Posts do blog usam `og:type article`. A 404 sai com `noindex` e sem canônico.
- **Imagem padrão:** `site/public/og-padrao.png`, o logo da fachada (sem recolorir) sobre o creme do design system. Gerada por `npm run og`. **Quando a paróquia mandar uma foto boa da fachada**, basta substituir o arquivo (mesmo nome, 1200 × 630). Cada página pode pedir outra imagem com a prop `imagem`.
- **`sitemap-index.xml`** (`@astrojs/sitemap`) com 24 endereços: fora ficam a 404 e `/liturgia/ontem` e `/liturgia/amanha` (mudam de conteúdo todo dia; a página `/liturgia` é a que vale).
- **`robots.txt`** (`pages/robots.txt.ts`): libera tudo e aponta para o sitemap.
- **`SITE_URL`:** canônico, Open Graph, sitemap e robots precisam do endereço final. Ele vem da variável `SITE_URL` (em `site/.env` ou no Cloudflare Pages). **Sem ela o build usa `http://localhost:4321` e avisa no terminal.** Pendência `TODO(paroquia)`: definir quando o domínio `.org.br` existir (Fase 8).

### Dados estruturados (schema.org)

Só descrevem o que o site já publica; nada é inventado. Tudo passa por `serializarJsonLd`, que escapa `<`, `>` e `&`, então um texto escrito no Studio nunca consegue fechar a tag `<script>`.

- **`CatholicChurch`** (um tipo de `Church`, mais preciso para uma paróquia) em Início e Contato: nome, endereço, telefone (+55 83 3241-1433), Instagram em `sameAs`, link do mapa, imagem e **horário de funcionamento da secretaria**. Só entram horários cadastrados como período (`08:00-12:00`); horário solto como "17:00" é missa ou confissão, que começa mas não tem hora de fechar. Os horários das missas não vão como `openingHoursSpecification` pelo mesmo motivo.
- **`Event`** em `/agenda/[slug]`: nome, início, fim (se existir), local, organizadora, status e modo presencial. O `location.name` é o local escrito no Studio ("Salão paroquial"); o **endereço é sempre o da paróquia**. Se algum dia houver evento em outro lugar, o endereço ficará impreciso: aí vale um campo de endereço no tipo `evento`.
- Faltam o e-mail e o canal do YouTube (`TODO(paroquia)`): entram sozinhos quando forem preenchidos no Studio.

## Acessibilidade

Auditoria automática em todas as páginas, nas três larguras (`npm run auditar`). Achou e corrigi:

- **Ordem dos títulos** (`heading-order`) em Horários, Agenda, Blog (as quatro listas) e Contribua (Nossa Comunidade tem um `h2` visível por seção): o card do design system tem título `h3`, e ele vinha logo depois do `h1`. Cada uma ganhou um `h2` só para leitor de tela (`.sr-only`), sem mudar nada no visual nem no design system.
- **Botão de vídeo** (`label-content-name-mismatch`): o nome acessível era "Assistir ao vídeo: título" e o texto visível era a duração. Agora o nome inclui "duração 6:40".

Conferido e já correto:

- **Abas da liturgia:** o card tem um `nav` "Ir para a leitura" com links e `aria-current`; cada leitura é uma `section` com título para leitor de tela. O botão "Aa" avisa a mudança de tamanho por `role="status"`.
- **Menu do celular:** `<dialog>` nativo (foco preso, Esc fecha), `aria-expanded` no botão.
- Um `h1` por página, sem rolagem horizontal, foco visível em todos os elementos.

**Decisão a tomar (Fase 7): largura dos links do menu.** O projeto pede alvos de toque de 44 px. Os links de uma palavra do cabeçalho ("Início" 37 px, "Blog" 34 px), o filtro "Tudo" (36 px) e o botão "Menu" (41 px) têm **44 px de altura** mas largura menor, com espaço entre eles. Isso cumpre o WCAG 2.2 AA (critério 2.5.8, mínimo de 24 px), mas fica abaixo do 44 × 44 do projeto na largura. O script lista isso como **aviso**, não como erro. Mudar exige mexer nos componentes do design system (Cabeçalho, Filtros), então fica para a revisão de layout: pedir antes de alterar.

## Desempenho

O que mais pesava e foi resolvido (Início foi de 97 para 100; Blog, de 86 para 98):

1. **Fontes do Google bloqueavam a renderização** (1,2 a 1,6 s estimados). Agora a folha de estilo das fontes entra por `preload` e vira estilo quando termina (`onload`), com `<noscript>` de reserva. O texto aparece na fonte do sistema e troca quando as fontes chegam (`font-display: swap`).
2. **CSS dentro de cada página** (`build.inlineStylesheets: 'always'`): menos uma requisição no primeiro acesso, que é o caso comum de quem vem do Instagram ou do WhatsApp.
3. **Logo em WebP pelo `astro:assets`:** o PNG de 447 px (67 KB) aparecia a 48 px no cabeçalho e no rodapé. Agora o `<Image>` gera versões de 1,4 a 11 KB e um `srcset` para telas 2x. O `scripts/sync-design-system.mjs` copia o logo para `site/src/assets/` (não mais para `public/`).
4. **Blog:** a miniatura do vídeo em destaque (o maior elemento da tela) carregava com `loading="lazy"`. O primeiro card agora carrega já, com `fetchpriority="high"` (`prioritario` no `CardPost`).
5. **Cache no Cloudflare Pages** (`site/public/_headers`): arquivos de `/_astro/` (com hash no nome) ficam um ano no cache; ícones e a imagem do Open Graph, um dia.

Pendente: quando houver **fotos reais** (fachada, altar, eventos), usar `<Image>`/`<Picture>` do `astro:assets` para gerar AVIF e WebP em vários tamanhos. As miniaturas do YouTube vêm de fora (`i.ytimg.com`) e não passam por esse pipeline.

## Estatísticas sem cookies

Opção escolhida: **Cloudflare Web Analytics**, que não usa cookies nem guarda dados pessoais (não precisa de aviso de cookies). Duas maneiras, sem custo:

1. **Pelo painel (sem código):** em *Workers & Pages → o projeto → Metrics → Web Analytics → Enable*. Funciona assim que o site estiver no Cloudflare Pages (Fase 8).
2. **Pelo código:** criar o site em *Web Analytics*, copiar o token e definir `PUBLIC_CF_ANALYTICS_TOKEN`. O `BaseLayout` então inclui o `beacon.min.js`. Sem a variável, nada é carregado.

Use só uma das duas, para não contar a visita em dobro. O Umami ficou de fora porque exigiria hospedar um servidor e um banco.

## Como conferir

```bash
npm run build -w site                                  # com SITE_URL definido, p. ex. SITE_URL=http://localhost:4322
python3 -m http.server 4322 -d site/dist &             # qualquer servidor estático serve
BASE=http://localhost:4322 npm run auditar             # axe + teclado + gaveta, em todas as páginas e larguras
npx lighthouse http://localhost:4322/ --only-categories=performance,accessibility,best-practices,seo --chrome-flags="--headless=new"
npm run og                                             # regera a imagem do Open Graph (logo ou fundo mudou)
```

`npm run auditar` sai com código 1 se achar qualquer problema, então serve para rodar de novo ao fim da Fase 7 (revisão de layout). O Lighthouse local não tem HTTP/2 nem compressão: os avisos "cache", "latência do documento" e "HTTP moderno" somem no Cloudflare Pages. Para medir o site no ar, rode o Lighthouse no endereço final.
