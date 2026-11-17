# Igreja do Rosário

Design system do site da **Paróquia Nossa Senhora do Rosário**, em Jaguaribe, João Pessoa (PB). A igreja foi erguida pelos frades franciscanos a partir de 1927 e é um prédio neoclássico. A comunidade é de bairro e atende muita gente idosa, jovens do EJC e da catequese, famílias do projeto de cestas básicas. Tudo aqui parte do que a paróquia já mostra no Instagram (@paroquiadorosariojp): o logo da fachada em marrom e creme, títulos em serifa com itálico, azul mariano nas festas de Nossa Senhora, ouro do altar e o marrom do hábito franciscano.

O site é **celular primeiro**. A maioria das visitas vem de um link no Instagram ou no WhatsApp, num celular, procurando um horário. Tudo é desenhado para 360px e cresce a partir daí.

## Princípios

1. **O horário primeiro.** Missa, confissão e secretaria aparecem acima da dobra em qualquer tela. Ninguém precisa abrir um menu para saber a que horas é a missa de domingo.
2. **Legível para a vovó.** Corpo de texto nunca abaixo de 16px no celular (o token `corpo` é 17px), contraste AA em tudo, alvos de toque de `toque-min` (44px).
3. **Delicado, nunca duro.** Fundo creme como papel de folheto, texto em marrom suave (não preto), cores de destaque em tons claros com o texto colorido por cima. Cor cheia e escura só no logo. Sem degradês, sem vidro, sem sombras pesadas.
4. **Romano + itálico.** O gesto tipográfico da paróquia: uma linha em Playfair Display reta, a outra em itálico ("Nossa Senhora / *do Rosário*", "O Perdão / *de Assis*").

## Voz

- Acolhedora e direta: "Venha participar", "Fale com a secretaria".
- Datas e horários no formato dos posts: **17h**, **8h40**, **02 de novembro**, **Dom · 22 de agosto**.
- Nomes de festa e de santos por extenso, com maiúsculas: "Festa de Nossa Senhora do Rosário".
- Sem jargão de marketing, sem excesso de exclamações. Um "rogai por nós!" é bem-vindo; três seguidos não.
- Botões com verbo: "Ver horários", "Quero participar", "Copiar chave Pix".

## Cores

Os tokens são semânticos e têm dois temas, `claro` (padrão) e `escuro`.

| Papel | Token | Onde usar |
|---|---|---|
| Fundo | `fundo`, `fundo-elevado`, `fundo-afundado` | Página, cards, faixas alternadas |
| Texto | `texto`, `texto-suave` | Todo texto. `texto-suave` para datas e legendas |
| Identidade | `marrom` + `creme` | Só o logo e blocos grandes de identidade (rodapé, capa). Texto sobre marrom é `sobre-marrom` (creme) |
| Ação | `acao` + `sobre-acao` | Botão primário: um marrom médio, mais leve que o do logo |
| Mariano | `mariano`, `mariano-suave` | Links, foco, botão secundário, festas de Nossa Senhora |
| Ouro | `ouro`, `ouro-suave`, `ouro-texto` | Contas do terço, filetes, molduras; `ouro-suave` no fundo de avisos de festa. `ouro` nunca é texto: use `ouro-texto` |
| Franciscano | `terracota`, `terracota-suave` | Conteúdo franciscano: 100 anos dos frades, São Francisco, Perdão de Assis |
| Estado | `verde`, `alerta` | "Aberto agora" e erros/mudanças de horário. Só para estado |
| Litúrgico | `liturgico-*` | **Só** no selo de cor litúrgica do dia |

Regra prática: numa tela, **um** botão `acao` (a ação principal), o resto `mariano` contornado ou fantasma. Destaques usam o par **fundo suave + texto colorido** (`mariano-suave` + `mariano`, `terracota-suave` + `terracota`, `ouro-suave` + `ouro-texto`), nunca o fundo cheio com texto claro. Ouro ocupa no máximo um décimo da tela.

## Tipografia

Duas famílias do Google Fonts:

- **Playfair Display** (`serif`): títulos. Peso 600 reto, 500 itálico.
- **Nunito Sans** (`sans`): todo o resto. 400, 600 e 700. Traço arredondado e aberto, mais suave que uma sans geométrica, e confortável em parágrafos longos como as leituras.

Escala responsiva: `display` (56px) só a partir de `bp-desktop`. No celular o título do hero é `titulo-1` (36px). Em CSS: `font-size: clamp(36px, 6vw, 56px)`. A `sobrelinha` (13px, caixa alta, 0.16em) vem acima de títulos de evento, como em "02 DE NOVEMBRO · DIA DE".

## Layout responsivo

| Faixa | A partir de | Colunas | Margem lateral | Entre seções |
|---|---|---|---|---|
| Celular | `bp-celular` (0) | 1 | `espaco-4` (16px) | `espaco-12` (48px) |
| Tablet | `bp-tablet` (640px) | 2 | `espaco-6` (24px) | `espaco-12` |
| Desktop | `bp-desktop` (1024px) | 3 (ou 2 + 1 lateral) | `espaco-8` (32px) | `espaco-16` (64px) |
| Largo | `bp-largo` (1280px) | o container trava em `container-max` (1200px) | auto | `espaco-16` |

- Grades de cards usam `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`, sem quebra manual.
- Os componentes usam **container queries** (`container-type: inline-size`): um card de horários se arruma pela largura que ele tem, não pela tela. O mesmo card funciona na coluna lateral do desktop e na tela cheia do celular.
- Menu: Início · Liturgia · Agenda · Pastorais · Blog · Sacramentos · Contato (Nossa história vai para o rodapé). Links completos a partir de `bp-desktop`; abaixo disso, botão "Menu" que abre uma gaveta. O botão "Horários" fica sempre visível no cabeçalho.
- No celular, uma barra fixa no rodapé com três atalhos (Horários · Como chegar · WhatsApp) é opcional e recomendada.
- Parágrafos limitados a `medida-texto` (68ch).

## Formas e motivos

- **O arco.** As janelas da fachada no logo são arcos. Molduras de foto e o bloco de data dos eventos têm só os cantos de cima arredondados com `raio-arco`. É o único lugar onde aparece um canto totalmente redondo.
- **As contas do terço.** O divisor de seções é uma fileira de contas em `ouro`: dez pequenas e uma maior, como uma dezena. Use entre grandes seções, nunca dentro de cards.
- Cantos: `raio-m` (8px) em botões e cards, `raio-g` (16px) em faixas grandes.
- Sombra: só `sombra-card`, quase imperceptível, e só em cards sobre `fundo`. Bordas de 1–1.5px.

## Logo e iconografia

- O logo é a **fachada da igreja** em marrom `#3f2610` com janelas em creme `#fbf8cd` (grupo *Logos*). Há a versão original (fundo branco) e uma com fundo transparente.
- Ao lado do logo, a assinatura "IGREJA DO ROSÁRIO" em Nunito Sans 700, caixa alta, 0.08em, com "Paróquia Nossa Senhora do Rosário" embaixo em `pequeno`.
- Área de respiro mínima ao redor do logo: metade da largura da cruz. Tamanho mínimo: 32px de altura.
- No tema escuro, o logo vai sobre um quadrado `creme` com `raio-m`. Não inverta as cores do logo.
- Ícones: traço de 1.75px, cantos arredondados, em `currentColor` (sugestão: Lucide). Nada de emoji na interface.

## O que o site deve ter (arquitetura sugerida)

1. **Início**: hero com próxima missa, cor litúrgica do dia, Evangelho de hoje, avisos da semana, próximos eventos, doação.
2. **Horários**: missas, confissões, adoração, secretaria. É também o destaque "Horários 2026" do Instagram.
3. **Liturgia**: leituras do dia em abas, santo do dia e a missa de hoje. Na página inicial aparece como um resumo de uma linha ("Evangelho de hoje").
4. **Agenda**: festa da padroeira (outubro), Semana Santa, Perdão de Assis, eventos da juventude.
5. **Pastorais e movimentos**: EJC, catequese, juventude, Projeto Cestas Básicas, reciclagem. Cada um com página própria.
6. **Sacramentos**: batismo, crisma, casamento, primeira eucaristia. Requisitos, documentos e cursos.
7. **Blog**: colunas do pároco e da juventude, em texto ou vídeo do YouTube, com filtros por coluna.
8. **Nossa história**: Frei Martinho, a "campanha do centavo", a construção (1927–1929), os 100 anos dos franciscanos.
9. **Contribua**: dízimo e doações por Pix, com prestação de contas.
10. **Secretaria e contato**: endereço (Rua Frei Martinho, s/n, Jaguaribe), mapa, WhatsApp, horários de atendimento.

## Componentes

Os componentes são classes CSS com prefixo `ros-` em `components/bundle.css`, sem JavaScript obrigatório. Cada um tem um preview e um guia:

- **Cabeçalho**: logo + assinatura, menu completo ou gaveta, botão "Horários" sempre visível.
- **Hero**: título romano + itálico, próxima missa, moldura em arco.
- **Botão**: primário (`acao`), secundário (mariano contornado), fantasma.
- **Horários**: lista de missas por dia, que vira grade em telas largas.
- **Evento**: bloco de data em arco + sobrelinha + título.
- **Pastoral**: card de movimento com encontro, responsável e ação.
- **Aviso**: faixa de comunicado (informativo, festa, mudança).
- **Selo litúrgico**: a cor litúrgica do dia.
- **Divisor terço**: fileira de contas entre seções.
- **Liturgia do dia**: card limpo com data, semana, celebração e leituras em abas de texto (Evangelho aberto); resumo de uma linha para a página inicial.
- **Santo do dia**: card só de texto (nome, grau, bio curta); a família franciscana ou mariana aparece só como cor na linha de metadados.
- **Página Liturgia**: a composição da aba, em duas colunas no desktop e uma no celular.
- **Card de post**: coluna do blog, de texto ou de vídeo (miniatura do YouTube que carrega o player ao clicar).
- **Página Blog**: filtros por coluna, post em destaque e grade.
- **Página do post**: leitura em faixa central, com vídeo no topo quando houver.
- **Doação Pix**: chave com botão de copiar.

Todo componente carrega `tokens.css` e `bundle.css`. As fontes vêm do Google Fonts pelo `@import` no topo de `bundle.css`.
