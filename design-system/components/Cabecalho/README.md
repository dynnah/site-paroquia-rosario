# Header (`Cabecalho`)

Top bar with the logo, the parish name, the menu and the "Horários" button, which stays visible at every width.

- **Phone (< 960px of container width):** logo + parish name, the "Horários" button and a **Menu** button that opens the drawer (see `Gaveta`). The name takes at most two lines (three on the narrowest phones). Below 520px the gap tightens to `espaco-2`, so the 44px Menu button does not cost the name a line.
- **Very narrow phone (≤ 354px):** "Horários" shows only the clock; the text stays for screen readers (`.ros-header__horarios`). The phone bar already spells it out.
- **Desktop (≥ 960px):** the logo icon, the menu links and "Horários" form **one group centred in the window**. The parish name leaves the screen but stays in the logo link for screen readers.
- Only the parish name is shown, in normal letters (not uppercase). `ros-marca__sub` is an optional second line, hidden on desktop.
- Current page: `aria-current="page"` gives the `fundo-afundado` background and a gold rule underneath.
- Every target is 44px: the logo link, the menu links, and the Menu button (also 44px wide).
- `ros-header--fixo` makes it sticky at the top. Whoever uses it provides the logo (`assets/Logos/logo-fachada-transparente.png`), the links and the drawer's JavaScript.
