# Liturgia do dia: de onde vem e o que o site publica

Decisão da Fase 5, revisada em 19/11/2026. Resumo: o site lê duas fontes, uma vez por dia, no build.

- **Leituras:** a API aberta `liturgia-diaria` (v2) dá o nome da celebração, a cor litúrgica, as referências e o **texto** (Lecionário da CNBB). **O site publica a passagem inteira, dentro do próprio card, sem mandar o fiel para outro site.** Nada precisa ser configurado.
- **Santo do dia:** o feed do **Evangelizo.org** dá todos os santos do dia, com função, época e, na maioria, a biografia. Ver "Santo do dia" abaixo.

**Decisão da paróquia (19/11/2026):** o texto integral fica no ar. O risco de direitos autorais (ver "Riscos", item 1) foi explicado e assumido; **pedir a autorização da CNBB continua pendente** e é o jeito de regularizar. Se a CNBB pedir para retirar, defina `LITURGIA_OCULTAR_TEXTO=true` (ver "Tirar o texto do ar").

## O que aparece no site

| Onde | O quê |
|---|---|
| `/liturgia` | Leituras do dia: semana do tempo litúrgico, dia, cor, referências e o texto integral (1ª leitura, salmo, 2ª leitura, Evangelho), dentro do card. Santo do dia e missa de hoje ao lado. |
| `/liturgia/ontem`, `/liturgia/amanha` | O mesmo para o dia anterior e o seguinte, com a navegação "‹ Ontem · Amanhã ›". |
| Início | Resumo de uma linha: "Evangelho de hoje · Lc 19,11-28". |

Tudo no fuso `America/Sao_Paulo`. As páginas são estáticas e se renovam no rebuild diário (Fase 8).

## A fonte escolhida

**`liturgia-diaria` v2**, de Dancrf (<https://github.com/Dancrf/liturgia-diaria>), instância pública em `https://liturgia.up.railway.app/v2/`.

- `GET /v2/?dia=18&mes=11&ano=2026` devolve `{ data, liturgia, cor, oracoes, leituras, antifonas }`; sem liturgia no dia, HTTP 404.
- Respondeu em cerca de meio segundo e trouxe dados de 2026 a 2027 sem falha.
- Mantida: último push em 24/04/2026, repositório não arquivado, 222 estrelas.

### O que foi avaliado

Só a `liturgia-diaria` foi testada de verdade (chamadas reais, 46 datas do ano litúrgico, da Quaresma à Vigília Pascal). As outras foram descartadas pela descrição:

| Projeto | Por que não |
|---|---|
| `liturgia-diaria` v3 (beta) | Traz várias celebrações por dia (memória facultativa). A página do projeto a chama de beta; o que a v2 dá basta. Migrar depois é mudar só `converterLiturgia`. |
| Liturgical Calendar API, `romcal-api`, `church-calendar-api` | Calendário litúrgico (datas e graus), sem as leituras. |
| AELF | Liturgia das Horas em francês. |
| Catholic Readings API, Evangelium | A descrição não indica português. Não avaliadas. |
| Site da CNBB | É o destino do link oficial. Não avaliei se tem API. |
| **Evangelizo.org** (feed) | **Adotado para o santo do dia** (ver abaixo). Também traz as leituras, mas na tradução de Portugal (por exemplo "Anciãos", «aspas», "David"), diferente da que se ouve na missa no Brasil; por isso as leituras ficam na `liturgia-diaria`. Serve de alternativa para o texto se a CNBB não autorizar. |
| Wikipédia (API REST) | Licença clara (CC BY-SA), mas achar o santo certo pelo nome da celebração é adivinhação e erra com santos de nome comum. O Evangelizo já entrega a lista pronta. |
| Wikidata (data da festa) | Datas de festa desatualizadas (em 19/11 listou Santa Isabel da Hungria, que hoje é 17/11, e não o santo do dia). |
| `LiturgicalCalendarAPI` (litcal) | Respondeu 400 ao pedir o calendário do Brasil em português; só dá nomes, sem biografia. Não insisti. |

## Riscos (e o que o código faz a respeito)

1. **A API não declara licença** (o GitHub mostra "sem licença") **nem de onde vêm os textos**; eles parecem a tradução da CNBB, que tem direitos sobre ela. A paróquia decidiu publicar o texto mesmo assim, e assumiu o risco. Orações e antífonas continuam **fora** do site (só o texto das leituras, o salmo e o refrão). O adaptador sabe descartar o texto antes de montar a página (`LITURGIA_OCULTAR_TEXTO=true`), com testes e uma varredura do `dist/` (ver "Como conferir"), para o caso de a CNBB pedir a retirada.
2. **É um projeto individual, numa hospedagem gratuita, sem garantia de disponibilidade.** O build nunca quebra por causa dela: 3 tentativas com espera, timeout de 10 s, e em qualquer falha a página mostra a reserva (data e link da liturgia oficial; é o único lugar do card que aponta para a CNBB). A resposta de outro dia que não o pedido é descartada (melhor a reserva do que a liturgia errada).
3. **A v1 será desligada em 01/12/2026** (aviso do projeto). Usamos a v2.
4. Se a v2 sair do ar, é trocar `LITURGIA_API` e `converterLiturgia` em `site/src/lib/liturgia.ts`; o resto do site não conhece o formato da API.

## Como o adaptador lê a resposta

| Resposta da API | No site |
|---|---|
| `liturgia`: `"4ª feira da 33ª Semana do Tempo Comum"` | `nome` "4ª feira", `semana` "33ª Semana do Tempo Comum", `tempo` "Tempo Comum" |
| `liturgia`: `"Santo André, Apóstolo, Festa"` | `nome` "Santo André, Apóstolo", `grau` "festa" (memória, memória facultativa, festa, solenidade) |
| `cor`: `"Verde"` | `verde` (cor desconhecida cai em `branco`) |
| `leituras.primeiraLeitura`, `salmo`, `segundaLeitura`, `evangelho` | leituras "1ª Leitura", "Salmo", "2ª Leitura", "Evangelho", em sequência no card |
| `referencia`: `"Lc 2, 22-40 (mais longo)"` | `Lc 2,22-40` (tira o complemento entre parênteses e o espaço depois da vírgula) |
| Várias opções na mesma leitura | `Lc 2,22-40 ou Lc 2,22.39-40` |
| `texto`, `refrao` | viram o texto das leituras (somem com `LITURGIA_OCULTAR_TEXTO=true`) |
| `titulo` | vira o anúncio antes da leitura ("Leitura do livro…"); some junto com o texto |
| `oracoes`, `antifonas` | **ignorados** |

O tempo litúrgico só é preenchido quando o nome diz a palavra ("Advento", "Quaresma", "Páscoa", "Tempo Comum", "Natal"). Festas, solenidades e memórias vêm **sem semana** na API, então o título do card é o nome da celebração.

### Casos que a API entrega de um jeito especial

- **Vigília Pascal:** vem sem Evangelho, com 8 salmos e 7 leituras em `extras`. O site mostra a primeira opção de cada aba e avisa que a liturgia do dia tem mais leituras e orações próprias do que cabem ali (sem link para outro site; o texto do aviso manda perguntar na secretaria ou acompanhar pelo missal). A home não mostra o resumo do Evangelho nesse dia.
- **Mais de 4 opções** numa leitura (idem): mostra só a primeira e avisa.
- **Domingo de Ramos:** o Evangelho aparece como `Mc 11,1-10 ou Mc 14,1-15,47 ou Mc 15,1-39`; a primeira é a da procissão. Os complementos que explicavam isso são removidos.
- **Dado da fonte:** em 13/12/2026 o salmo vem como "Sl Lc 1" (o Magnificat). O site repete o que a API entrega.

## Santo do dia: o feed do Evangelizo

`site/src/lib/santos.ts`, testado em `santos.test.ts` e contra o feed ao vivo (14 dias seguidos).

- **Endpoint:** `GET https://feed.evangelizo.org/v2/reader.php?date=AAAAMMDD&type=saint&lang=PT`. A documentação do feed (a página de erro dele lista os tipos) diz que serve para "exibir a leitura diária, o santo do dia etc." em outros sites. Só aceita datas até 30 dias à frente, o que basta para ontem, hoje e amanhã.
- **O que devolve:** os santos do dia em ordem de importância ("S. Roque Gonzales e comp., mártires, +1628"). Alguns têm link para uma página de biografia (`display_saint.php?id=…`), que o adaptador lê (2 a 3 frases, sem o que está entre parênteses).
- **O que o site mostra:** o primeiro santo vira o card "Santo do dia" (nome, função, época, biografia); os outros entram em "Também hoje"; a linha "Fonte: Evangelizo.org" leva à biografia completa. Sem imagem de santo.
- **Santo do Studio vence:** se houver um `santo` do Sanity para o dia (`MM-DD`), o card é o dele e o feed nem é consultado. É assim que a paróquia corrige ou escreve a bio no tom da casa (santos franciscanos, por exemplo).
- **Filtros:** solenidades e festas do Senhor e de Nossa Senhora ("Santíssimo Rei do Universo", "Santa Maria, na memória da sua Apresentação") não são "santo do dia"; o card passa para o próximo da lista, ou some se não houver.
- **Falha:** 3 tentativas, timeout de 10 s; sem resposta, o card não aparece e o build segue. Biografia que falha deixa o card só com nome e dados.

### Ressalvas

1. **Termos de uso:** não achei os termos escritos do Evangelizo (o site só mostra "© Evangelizo.org 2001-2022"). O feed é documentado como feito para exibir leitura e santo do dia em outros sites, mas vale pedir confirmação por e-mail ao Evangelizo antes do lançamento (Fase 10).
2. **Português de Portugal:** meses com maiúscula ("2 de Maio"), "Vietname", e grafias como "Gonzales" (a celebração da liturgia diz "González"). Pode aparecer diferença entre o título das leituras e o nome do santo; o santo do Studio corrige.
3. **Santo errado no dia:** o feed segue o calendário romano geral em português; memórias próprias do Brasil podem não ser a primeira da lista. Quando isso incomodar, cadastre o santo no Studio.
4. **Biografias vêm do Evangelizo** (em boa parte de textos da Wikipédia, CC BY-SA); por isso o crédito e o link ficam sempre no card.

## Autorização da CNBB (pendente) e como tirar o texto do ar

1. **Pedir autorização** à CNBB ou à Arquidiocese para publicar a tradução das leituras no site. É o que regulariza o que já está no ar. Ajuste o crédito do card ("Conferência Nacional dos Bispos do Brasil © Todos os direitos reservados.", fixo no pé, em `LiturgiaDoDia.astro`) ao que a autorização pedir.
2. **Se a CNBB pedir a retirada**, ou se a paróquia mudar de ideia: defina `LITURGIA_OCULTAR_TEXTO=true` (em `site/.env` para testar; em *Settings → Environment variables* no Cloudflare Pages para valer no ar) e refaça o build. O site volta a mostrar só as referências, sem o texto.
3. **Alternativa sem a CNBB:** o texto do Evangelizo (tradução de Portugal, feed pensado para sites). Exigiria um segundo adaptador para as leituras.

O que o card faz hoje com o texto, no estilo da Canção Nova: as leituras aparecem **em sequência** (1ª Leitura, Salmo, 2ª Leitura quando há, Evangelho), sem trocar de aba. Cada leitura traz o **anúncio** antes ("Leitura do livro do Apocalipse de São João.", que vem do campo `titulo` da API) e a resposta do povo **depois** ("Palavra do Senhor. — Graças a Deus."; no Evangelho, "Palavra da Salvação. — Glória a vós, Senhor.", e "Glória a vós, Senhor." também logo depois do anúncio). O salmo abre com o refrão em negrito e não tem fecho. Os números de versículo ficam de fora. As abas do topo são atalhos: tocam e a tela vai até a leitura. No computador o texto rola por dentro do card (a coluna é mais larga que a do design system e a letra, menor); no celular rola a página. O crédito "Conferência Nacional dos Bispos do Brasil © Todos os direitos reservados." fica fixo no pé do card, sempre que há texto. Nenhum link do card leva a outro site; a única exceção é a reserva de quando a API falha. A página inicial leva o "Evangelho de hoje" direto ao trecho (`/liturgia#ev-hoje`).

## Como conferir

```bash
npm run test -w site                         # inclui os testes do adaptador da liturgia
npm run build -w site                        # 32 páginas; busca ontem, hoje e amanhã
LITURGIA_OCULTAR_TEXTO=true npm run build -w site -- --outDir dist-sem-texto   # só para comparar; apague dist-sem-texto depois
```

Para provar que a válvula funciona, procure trechos das leituras reais em todos os arquivos de `dist-sem-texto/` (0 ocorrências esperadas) e no `dist/` normal (esperadas). Para provar que a página não manda para a CNBB: `grep -c "cnbb.org" dist/liturgia/index.html` deve dar 0.
