# Daily liturgy (`LiturgiaDoDia`)

The Mass readings in a clean card: date, week, celebration and the readings **one after the other, as in the missal**.

- **Top:** three lines. Date in `texto-suave`, week of the liturgical season in serif, and the day's celebration with a dot in the liturgical colour.
- **Tabs** (`ros-aba`): plain links (1ª Leitura · Salmo · 2ª Leitura · Evangelho) that jump to a reading; the one on screen has `aria-current` (`texto` + a Marian-blue underline). The 2ª Leitura only exists on Sundays and solemnities. On the phone the tabs scroll sideways. Without JavaScript they are ordinary anchors. The line under the tabs is drawn beneath them (1px, no border) so the underline sits exactly on it.
- **Aa** at the end of the bar (`ros-aa`) raises the text size; the choice lives in `data-tamanho` (1–3) on the card.
- **Four sizes move together**, so the hierarchy survives when the reader enlarges the text: `--lt-texto` (reading), `--lt-anuncio` (announcement, smaller), `--lt-ref` (reference, bigger: it marks where each reading starts) and `--lt-linha` (line height). Phone: 17px by default (the project floor is 16px). Wide card (≥ 640px): 15px so more fits on screen.
- **Reading:** the reference in Marian blue, bold; then the announcement (`ros-leitura__abertura`, small italic) and, for the Gospel, the people's answer in bold; psalm refrain `ros-leitura__refrao`; closing "— Palavra do Senhor. **— Graças a Deus.**" in `ros-leitura__fecho`. No rule between readings: the bigger gap and the blue reference separate them. Give each section a `position: relative` (already in the CSS) so the hidden `<h3 class="sr-only">` stays inside a scrolling area.
- **Credit:** a small line at the foot of the card (`ros-liturgia__fonte`), with a thin rule above.
- **Summary** (`ros-liturgia-resumo`): one-line version for the home page, pointing to the Liturgy tab.
- **Fallback** (`ros-liturgia__reserva`): when the readings cannot be loaded, the card says where to read them.

**Where the content comes from.** The official Brazilian translation of the readings belongs to the CNBB, which holds the rights. The parish decided to show the full text and assumed the copyright risk; the CNBB's authorization is still pending. Text in the previews is placeholder, not the official text.
