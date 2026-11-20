# Saint of the day (`SantoDoDia`)

Text-only card with the saint of the day: name, rank of the celebration and a short biography. No image, no icon (no saint pictures downloaded from the internet).

- **Order:** "Santo do dia" label in `texto-suave` → serif name (surname or title in italic) → one metadata line → bio → "Ler a história" link.
- **Metadata:** rank (Memória, Festa, Solenidade) · family · life dates, separated by "·". The family is the only touch of colour: `terracota` for Franciscan saints (St Francis, St Clare, St Anthony, St Elizabeth of Hungary); with `ros-santo--mariano`, `mariano` for Our Lady. The others stay uncoloured. Dates use `ros-santo__datas` so they never break across lines.
- **Bio:** 2 or 3 sentences written by the parish, at most `medida-texto` wide. The full story lives on its own page.
- **Automatic feed:** when the Studio has no saint for the day, the card shows the feed's saint, with "Também hoje" (`ros-santo__outros`) listing the other saints and a credit line (`ros-santo__fonte`, the same line as the readings card). A saint written in the Studio always replaces the feed.
- Same look as the liturgy card (`fundo-elevado` background, `linha` border, no shadow), so the two sit side by side.
