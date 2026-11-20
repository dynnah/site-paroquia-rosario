# Phone bar (`BarraMobile`)

Three shortcuts for the person looking for a time: **Horários · Como chegar · WhatsApp**.

- Fixed to the bottom of the screen **below 1024px** (`ros-barra--fixa`, with `env(safe-area-inset-bottom)`); on desktop it disappears. Not fixed, it is an ordinary block.
- Each target is `toque-min + espaco-3` tall (56px) with a 22px Marian-blue icon above a 14px label.
- Without a WhatsApp number the shortcut is left out.
- `ros-barra-espaco` is an empty spacer with the bar's height, placed at the end of the page so the bar never covers the footer.
- In the site the bar has its own view-transition name, so it does not flicker between pages.
