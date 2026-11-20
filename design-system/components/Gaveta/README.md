# Drawer (`Gaveta`)

The phone menu: a full-screen native `<dialog>` opened with `showModal()` from the header's **Menu** button.

- Top bar with the title "Menu" and a **Fechar** button (44px). The links are big (20px, 56px tall) and separated by thin rules.
- The current page uses the same cue as the desktop menu: `fundo-afundado` + a gold rule.
- Focus moves into the drawer when it opens, `Esc` closes it and focus returns to the Menu button. The page behind does not scroll while it is open.
- If the window grows to the desktop menu width (960px), the drawer closes by itself.
- In this preview the dialog is shown static (`position: relative`); in the site it is `position: fixed; inset: 0`.
