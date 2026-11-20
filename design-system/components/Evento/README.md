# Event (`Evento`)

Agenda card with the arched date block, eyebrow, serif title and place.

- **Date block tones** (soft fill, coloured number): **neutral by default** (`fundo-afundado` + `acao`); `ros-data--festa` (`ouro-suave`) for feasts and solemnities; `ros-data--franciscano` (`terracota-suave`) for the friars' dates; `ros-data--mariano` (`mariano-suave`, blue) **only** for Our Lady and the patron feast, so blue keeps its meaning.
- **The date block has three lines: day, month and year** (`<b>07</b><span>out</span><span>2026</span>`). The year keeps a list that crosses into the next year in a clear order ("dez" followed by "mar" looks out of order without it).
- Eyebrow: weekday · category or time, as in "Quarta-feira · Festa da padroeira".
- Serif title; the proper name of the saint or feast may go in italic (`<em>`).
- The whole card is a link. Show the next 3 to 6 events on the home page, in a `ros-grade`.
- **Equal height:** in a `ros-grade`, all rows take the height of the tallest card, so the cards line up.
