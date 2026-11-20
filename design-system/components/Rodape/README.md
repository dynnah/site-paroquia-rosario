# Footer (`Rodape`)

Footer with the parish identity, address, navigation, institutional links and contacts.

- **Container queries:** one column on the phone, two from 640px, four (`1.4fr 1fr 1fr 1fr`) from 1024px. The footer answers to its own width.
- **Identity column:** logo + only the parish name (same two-line treatment as the header), the address (`<address>`) and a "Como chegar" link that opens the map in a new tab (say so in its `aria-label`).
- **Columns:** *Navegue* (the menu), *A paróquia* (Horários, Nossa história, Contribua) and *Fale com a gente* (contacts and social networks; only the ones the parish has appear). Each `nav` is labelled by its heading.
- Links are 44px tall **and wide** ("Início" and "Blog" are only 37px and 34px of text) and use the site's thin underline; the underline follows the text.
- Bottom bar with the copyright, separated by a thin rule. Background `fundo-afundado`, text `texto-suave`.
- With the phone bar (`BarraMobile`) fixed to the bottom, the page reserves its height so it never covers the footer.
