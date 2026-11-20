# Schedule (`Horarios`)

Card with the week's times: a list on the phone, a grid of days from 640px of container width.

- **Today** is highlighted with `ros-horarios__dia--hoje`: footer-toned background (`fundo-afundado`), the time stays blue inside its blue outline, and the "hoje" tag (`ros-hoje`) is a quiet grey so blue belongs to the time only. Whoever uses it works out the day.
- Times in the parish format: **7h**, **17h**, **8h40**. Tabular numbers.
- Group equal days ("Quarta a sexta"). A day without Mass shows the note "Sem missa"; it never disappears.
- One card per kind: Santa Missa, Confissões, Adoração, Secretaria.
- The liturgical badge at the top is optional.
- **Grid of cards** (`ros-horarios-grade`): the cards have very different heights, and a row grid left holes under the short ones, so they flow in CSS columns (one on the phone, two from 640px) and each card rises to the one above. Reading order: down one column, then the next. On the schedule page at ≥1024px with five cards, add `--painel`: Mass on the left, Confession and Rosary on top, Secretary and Adoration below; each child sets its place in `--area`.
- The sample times come from a 2022 article and must be confirmed with the secretary's office.
