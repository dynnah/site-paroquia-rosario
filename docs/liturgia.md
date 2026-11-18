# Liturgia do dia: de onde vem e o que o site publica

Decisão da Fase 5. Resumo: o site lê o **nome da celebração, a cor litúrgica e as referências das leituras** da API aberta `liturgia-diaria` (v2), uma vez por dia, no build. O **texto** das leituras não é publicado: quem quiser lê-lo vai à Liturgia Diária da CNBB pelo botão "Ler na Liturgia Diária".

## O que aparece no site

| Onde | O quê |
|---|---|
| `/liturgia` | Leituras do dia: semana do tempo litúrgico, dia, cor, referências (1ª leitura, salmo, 2ª leitura, Evangelho). Santo do dia (Sanity) e missa de hoje ao lado. |
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

## Riscos (e o que o código faz a respeito)

1. **A API não declara licença** (o GitHub mostra "sem licença") **nem de onde vêm os textos**; eles parecem a tradução da CNBB, que tem direitos sobre ela. Por isso o site publica só fatos do calendário (nome da celebração, cor, referências bíblicas) e **nunca o texto**, a menos que `LITURGIA_TEXTO_INTEGRAL=true`. Com a flag desligada, o adaptador descarta texto, refrão, orações e antífonas antes de montar a página; há testes para isso e uma varredura do `dist/` (ver "Como conferir").
2. **É um projeto individual, numa hospedagem gratuita, sem garantia de disponibilidade.** O build nunca quebra por causa dela: 3 tentativas com espera, timeout de 10 s, e em qualquer falha a página mostra a data e o link da liturgia oficial. A resposta de outro dia que não o pedido é descartada (melhor a reserva do que a liturgia errada).
3. **A v1 será desligada em 01/12/2026** (aviso do projeto). Usamos a v2.
4. Se a v2 sair do ar, é trocar `LITURGIA_API` e `converterLiturgia` em `site/src/lib/liturgia.ts`; o resto do site não conhece o formato da API.

## Como o adaptador lê a resposta

| Resposta da API | No site |
|---|---|
| `liturgia`: `"4ª feira da 33ª Semana do Tempo Comum"` | `nome` "4ª feira", `semana` "33ª Semana do Tempo Comum", `tempo` "Tempo Comum" |
| `liturgia`: `"Santo André, Apóstolo, Festa"` | `nome` "Santo André, Apóstolo", `grau` "festa" (memória, memória facultativa, festa, solenidade) |
| `cor`: `"Verde"` | `verde` (cor desconhecida cai em `branco`) |
| `leituras.primeiraLeitura`, `salmo`, `segundaLeitura`, `evangelho` | abas "1ª Leitura", "Salmo", "2ª Leitura", "Evangelho" |
| `referencia`: `"Lc 2, 22-40 (mais longo)"` | `Lc 2,22-40` (tira o complemento entre parênteses e o espaço depois da vírgula) |
| Várias opções na mesma leitura | `Lc 2,22-40 ou Lc 2,22.39-40` |
| `texto`, `refrao`, `oracoes`, `antifonas` | **ignorados**; `texto` e `refrao` só entram com a flag ligada |

O tempo litúrgico só é preenchido quando o nome diz a palavra ("Advento", "Quaresma", "Páscoa", "Tempo Comum", "Natal"). Festas, solenidades e memórias vêm **sem semana** na API, então o título do card é o nome da celebração.

### Casos que a API entrega de um jeito especial

- **Vigília Pascal:** vem sem Evangelho, com 8 salmos e 7 leituras em `extras`. O site mostra a primeira opção de cada aba e avisa "Neste dia há leituras ou orações próprias…" com o link oficial. A home não mostra o resumo do Evangelho nesse dia.
- **Mais de 4 opções** numa leitura (idem): mostra só a primeira e avisa.
- **Domingo de Ramos:** o Evangelho aparece como `Mc 11,1-10 ou Mc 14,1-15,47 ou Mc 15,1-39`; a primeira é a da procissão. Os complementos que explicavam isso são removidos.
- **Dado da fonte:** em 13/12/2026 o salmo vem como "Sl Lc 1" (o Magnificat). O site repete o que a API entrega.

## Ligar o texto integral (só com autorização)

1. Peça autorização à CNBB ou à Arquidiocese para publicar a tradução das leituras.
2. Com a resposta em mãos, defina `LITURGIA_TEXTO_INTEGRAL=true` (em `site/.env` para testar; em *Settings → Environment variables* no Cloudflare Pages para valer no ar).
3. Refaça o build. As abas passam a mostrar o texto (sem números de versículo, com o refrão do salmo na frente) e a linha "Texto: Liturgia Diária, CNBB" aparece no fim do card. Ajuste o crédito ao que a autorização pedir.

## Como conferir

```bash
npm run test -w site                         # inclui os testes do adaptador da liturgia
npm run build -w site                        # 32 páginas; busca ontem, hoje e amanhã
LITURGIA_TEXTO_INTEGRAL=true npm run build -w site -- --outDir dist-texto   # só para comparar; apague dist-texto depois
```

Para provar que nada do texto vaza com a flag desligada, procure trechos das leituras reais em todos os arquivos de `dist/` (foi feito na Fase 5: 81 trechos, 0 ocorrências; com a flag ligada, o mesmo teste achou 22).
