# Liturgia do dia

Leituras da missa do dia num card limpo: data, semana, celebração e as leituras em abas de texto.

- **Topo:** três linhas só. Data em `texto-suave`, semana do tempo litúrgico em serifa e a celebração do dia com uma bolinha da cor litúrgica.
- **Abas:** texto simples (1ª Leitura · Salmo · 2ª Leitura · Evangelho), a ativa em `texto` com sublinhado `ouro`. O Evangelho abre marcado. A 2ª leitura só aparece aos domingos e solenidades. No celular, as abas rolam para o lado. Funciona sem JavaScript (`:has`).
- **Aa** no fim da barra: troca o tamanho da letra (o JavaScript que guarda a escolha fica com quem implementa).
- **Leitura:** a referência em `mariano`, o texto a 19/32px e a aclamação em itálico discreto. Nada de resumo, rótulo ou caixa em volta.
- **Fonte:** uma linha pequena no fim do card.
- **Resumo** (`ros-liturgia-resumo`): versão de uma linha para a página inicial, apontando para a aba de Liturgia.

**De onde vem o conteúdo.** A tradução oficial das leituras no Brasil é da CNBB, que tem direitos sobre o texto. Antes de publicar o texto integral, peça autorização à CNBB ou à Arquidiocese. A alternativa é publicar só as referências, o resumo e um link para a liturgia diária oficial. Para automatizar as referências e o calendário, há APIs abertas, como a `liturgia-diaria` (em português) e a Liturgical Calendar API (calendários nacionais). Os textos dos exemplos são marcadores, não o texto oficial.
