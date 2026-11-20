# Pagination and date navigation (`Paginacao`)

Two small navigations that share one drawing: a **ghost** button on the left (back) and a **secondary** button on the right (forward).

- **Pagination** (`ros-paginacao`) at the end of a list: "← Colunas mais recentes" · "Página 2 de 3" · "Ver colunas anteriores →". It has a thin rule above and does not appear when there is only one page.
- **Date navigation** (`ros-datas`) on the Liturgy page: "‹ Ontem" · "Amanhã ›". No rule and no page count.
- Where a neighbour does not exist (yesterday has no "previous"), leave an empty `<span>`: it keeps the other button in its corner.
- Use `rel="prev"` / `rel="next"` on the links and give the `nav` an `aria-label`. The wrapper wraps on narrow screens.
