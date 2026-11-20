# Hero

Opening of the home page: roman + italic title, the next Mass and the facade in an arch ("Arco com a fachada").

- **Background:** light (`fundo`) with two large arches (`ros-hero__fundo-arco`, tone mixed from `linha`) and a soft hill (`ros-hero__colina`, `fundo-afundado`). Decoration only: wrap it in `aria-hidden`. The left arch needs room, so it appears from 1280px of hero width; the right one from 900px.
- **The arch** (`ros-arco`): soft gold fill, a thin gold outline slightly outside, and a disc of light behind the facade. The hero's bottom edge cuts its base. It accepts the logo or a photo (`ros-arco--foto`, clipped by the arch, no outline).
- **Scales with the screen:** from 900px the hero is 36% of its width tall and the arch is 23.5% wide (as in the 1440px drawing), up to 560px. At 1440px or less the arch is the usual 340px.
- The content aligns with the site container (`container-max`, same side margins as `.container`).
- The title is the roman + italic pair of the posts: first line roman, second in italic `mariano` (`<em>`). 36px on phones, 56px from 900px, 64px from 1100px.
- The eyebrow gets a thin gold rule after the text that only takes what is left of the line (up to 200px), so the text never wraps because of it.
- "Próxima missa" comes from the schedule table; with no Mass today, show the next day ("Amanhã · 17h"). Recalculate it in the browser: the page is static.
- One primary action ("Ver horários") and at most one secondary.
- Below 600px the arch disappears: on the phone the time comes before the image.
