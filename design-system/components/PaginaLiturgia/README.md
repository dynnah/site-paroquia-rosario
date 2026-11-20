# Liturgy page (`PaginaLiturgia`)

The "Liturgia" tab of the menu: the day's readings in the spotlight and, beside them, the saint of the day and today's Mass.

- **Desktop (≥ 1000px):** two columns (the reading column is wider than the default 1.6fr, `2.1fr`, for more text per line). The title and the date navigation share the first row (`‹ Ontem` ghost on the left, `Amanhã ›` secondary on the right); saint and Mass sit in the right column. The readings card **takes the height of the column beside it** (`contain: size`) and the **text scrolls inside the card**, with title, tabs and credit fixed. The minimum height follows the window: the card fills the screen below the title (`100dvh − 15rem`), at least 480px and at most 60rem, so there is plenty of room even when the saint of the day has little to say.
- **Phone:** one column in this order: title, readings, date navigation, saint, Mass. (`display: contents` releases the title and dates into the page grid just so they can be ordered.) People who arrive from WhatsApp want the Gospel first.
- The scrolling area becomes keyboard-reachable (`tabindex="0"`, `role="region"`) only when it really scrolls.
- When the day has more readings and prayers than fit, `ros-pagina__especiais` adds a note under the card.
- The `ros-pagina__in` content is capped at the site container width (`container-max`).
