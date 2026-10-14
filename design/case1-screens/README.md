# GeoLift case study: step screens

Sources for the product screens in the first case study
(`public/case1/*.webp`). They are HTML prototypes from the design
handoff. The site uses only the captured images, not these files.

Each `<name>.dc.html` here makes `public/case1/<name>.webp`:
`confirm-data`, `set-parameters` and `select-markets`.

## Editing a screen

1. Open the `.dc.html` file in a browser to see it. It needs `support.js`
   and `vendor/` next to it; some browsers block the scripts over
   `file://`, so serve the folder (`python3 -m http.server`) if it stays
   blank. Copy and styles are inline on each element. Computed data,
   such as the charts, is in the `class Component` block at the bottom.
2. Recapture the images:

   ```sh
   npm i --no-save playwright-core
   node design/case1-screens/capture.mjs                 # all
   node design/case1-screens/capture.mjs select-markets  # one
   ```

   This saves the whole 1440×926 screen at 3× (4320×2778) as WebP in
   `public/case1/`. Keep that size, because `CaseDeck.tsx` sets the
   images' dimensions. Visitors normally get a smaller copy; the full
   file loads only once they zoom in, so the screen stays sharp. The
   10px corners and the drop shadow are added by `.deck-figure img` in
   `app/cases.css`, so they stay the same size as the case 2 screens'
   however small the screen is shown.

This folder is listed in `.vercelignore`, so deployments leave it out.
