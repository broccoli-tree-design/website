# Campaign case study: module screens

Sources for the product screens in the second case study
(`public/case2/*.webp`). They are HTML prototypes from the design
handoff. The site uses only the captured images, not these files.

Each `<name>.dc.html` here makes `public/case2/<name>.webp`:
`new-client-ideation`, `-opportunity`, `-audience`, `-attention` and
`-channel`, then `return-client-attention` and `-channel`.

## Editing a screen

1. Open the `.dc.html` file in a browser to see it. It needs `support.js`
   next to it. Copy and styles are inline on each element. Computed data,
   such as the channel wheel, is in the `class Component` block at the
   bottom. Its `ROT` constant turns the wheel: 21.5° for New client and
   −38.5° for Return client.
2. Recapture the images:

   ```sh
   npm i --no-save playwright-core
   node design/case2-screens/capture.mjs                     # all
   node design/case2-screens/capture.mjs new-client-channel  # one
   ```

   This saves the white card alone at 2× (2144×1064), with no outline
   or shadow, as WebP in `public/case2/`. Keep that size, because
   `CaseModules.tsx` sets the images' dimensions.

The Opportunity screen hotlinks two Raphael paintings (public domain,
Wikimedia Commons), so capturing it needs a connection. The captured
image already contains them, so the site doesn't hotlink anything.

This folder is listed in `.vercelignore`, so deployments leave it out.
