# Post page (`PaginaPost`)

Reading a column, in a central strip at most 720px wide, with the YouTube video on top when there is one. The same layout serves plain text pages (Nossa história, Contribua), without author or media.

- **Order:** back to the Blog → column → serif title (32px on the phone, 44px on desktop) → author in bold · date → video or photo → text → footer with the author.
- **Video:** `ros-video ros-video--grande`, the same light facade as the card (thumbnail + play; the player loads on click), with a small caption below.
- **Text:** 19/32px, paragraphs with space, `h2` and `h3` subtitles in serif, lists with room between items, and a quote in italic serif `mariano`, no box or side bar. A reading block right after a subtitle can use `ros-artigo__texto--compacto` to skip the opening gap; `ros-artigo__subtitulo` is a standalone subtitle.
- **Summary** (`ros-artigo__resumo`): a lead paragraph under the title; **empty state** (`ros-artigo__vazio`): wrapper for the "being prepared" message.
- **Footer:** name and one line about the author (parish priest, youth coordinator…). No photo.
- Video-only posts may have just a line or two of text. Text posts may have a photo in place of the video, or nothing.
- The names in the examples (Frei Antônio, Ana Clara) are fictitious.
