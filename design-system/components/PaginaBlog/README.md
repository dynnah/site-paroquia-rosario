# Blog page (`PaginaBlog`)

The "Blog" tab: columns by the parish priest and the youth, text or video, newest first.

- **Top:** title and one introductory sentence.
- **Filters** (`ros-filtros`): Tudo · Palavra do Pároco · Juventude · Vídeos, drawn like the liturgy tabs (text with a gold underline). On the phone they scroll sideways. Each filter is at least 44px wide, even the one-word "Tudo".
- **Featured:** the newest (or a pinned) post takes the full width. On desktop it has the video or photo on the left and the text on the right.
- **Grid:** the other posts in `ros-blog__grade`. Simple pagination at the end (`ros-paginacao`, see `Paginacao`).
- The content is capped at the site container width. On the home page, show the 3 newest posts in a grid.

**How to feed it.** Whoever writes should not touch code. The site reads the posts from Sanity (the Studio). Each post needs: column, title, author, date, summary, text and, if any, the YouTube link.
