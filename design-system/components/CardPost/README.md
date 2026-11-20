# Post card (`CardPost`)

Card for a blog column, text or video, for the list and for the home page.

- **Column** (the first line, small bold) says who writes: `ros-coluna--paroco` in `terracota` ("Palavra do Pároco"), `ros-coluna--juventude` in `mariano` ("Juventude"). New columns, such as Catequese or Pastoral Social, use `ros-coluna` with no colour.
- **Text:** column → serif title → one or two sentences of summary → author · date · reading time.
- **Video:** the 16:9 YouTube thumbnail on top, with a light play button and the duration; below, column → title → author · date · "vídeo". The summary is optional.
- The whole card is a link. No author picture, no category icons.
- In a `ros-blog__grade`: 1 column on the phone, 2 on the tablet, 3 on desktop.

**YouTube video (`ros-video`).** Show only the thumbnail (`https://i.ytimg.com/vi/<ID>/hqdefault.jpg`) and load the player on click, swapping the block for an `<iframe>` with the `ros-video__player` class (`ros-video__player--grande` on the post page). Without JavaScript the thumbnail is a link to YouTube. The page opens fast on the phone and YouTube does not track people who did not click. The post only needs the video link; the ID and the thumbnail come from it.
