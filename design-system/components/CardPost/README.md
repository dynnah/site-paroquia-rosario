# Card de post

Card de uma coluna do blog, de texto ou de vídeo, para a listagem e para a página inicial.

- **Coluna** (a primeira linha, em negrito pequeno) diz quem escreve: `ros-coluna--paroco` em `terracota` ("Palavra do Pároco"), `ros-coluna--juventude` em `mariano` ("Juventude"). Novas colunas, como Catequese ou Pastoral Social, usam `ros-coluna` sem cor.
- **Texto:** coluna → título em serifa → resumo de uma ou duas frases → autor · data · tempo de leitura.
- **Vídeo:** a miniatura do YouTube em 16:9 no topo, com um botão de play claro e a duração; embaixo, coluna → título → autor · data · "vídeo". O resumo é opcional.
- O card inteiro é um link. Sem imagem de autor, sem ícones de categoria.
- Em grade `ros-blog__grade`: 1 coluna no celular, 2 no tablet, 3 no desktop.

**Vídeo do YouTube (`ros-video`).** Mostre só a miniatura (`https://i.ytimg.com/vi/<ID>/hqdefault.jpg`) e carregue o player ao clicar, trocando o bloco por um `<iframe>` de `https://www.youtube-nocookie.com/embed/<ID>?autoplay=1`. Assim a página abre rápido no celular e o YouTube não rastreia quem não clicou. O cadastro do post só precisa do link do vídeo; o ID e a miniatura saem dele.
