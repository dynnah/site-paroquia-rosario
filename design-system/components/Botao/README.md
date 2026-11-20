# Button (`Botao`)

Buttons with a verb, at least 44px tall, in four variants.

- **Primary** (`ros-btn--primario`, `acao`: medium brown): the main action of the screen. One per screen.
- **Secondary** (`ros-btn--secundario`, outlined Marian blue): supporting actions.
- **Ghost** (`ros-btn--fantasma`): "learn more" links inside cards and section headers. It uses the site's thin underline (see below).
- **Light** (`ros-btn--claro`, cream): only on `marrom` backgrounds.
- `ros-btn--bloco` fills the width. Use it on the phone when the button is the last thing in a card.
- Optional icon on the left, 18px, 1.75px stroke.

**Text links.** Plain links in running text (no class), `ros-btn--fantasma` and `ros-santo__link` share one underline: thin (1.5px), set off from the text, in the link's own colour at 45%. On hover or focus it lights up to full colour and moves a little further away. Links with their own class (menu, cards, buttons) keep what their component defines. The reduced-motion setting turns the transition off.
