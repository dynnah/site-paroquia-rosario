# Cabeçalho

Barra do topo com logo, assinatura, menu e o botão "Horários", que fica visível em qualquer largura.

- Abaixo de 960px de largura do contêiner, os links somem e aparece o botão **Menu**, que abre uma gaveta em tela cheia com os mesmos links em `subtitulo`.
- O subtítulo "Paróquia Nossa Senhora do Rosário" aparece a partir de 520px.
- Página atual: `aria-current="page"` mostra o fundo `fundo-afundado` e um filete `ouro` embaixo.
- Em telas de celular, o cabeçalho pode ser fixo (`position: sticky; top: 0`).
- Quem usa fornece: o logo (`assets/Logos/logo-fachada-transparente.png`), os links e o JavaScript da gaveta (alternar `aria-expanded`).
