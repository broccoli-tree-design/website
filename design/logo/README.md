# Logo

Every logo file comes from one source, `public/logo-text.svg` (the leaf in
`#609546` with the ivory eye). The nav shows that SVG as it is.
`render.mjs` makes everything else from it:

```sh
node design/logo/render.mjs
```

| File | What |
|---|---|
| `design/logo/logo-dark.png`, `logo-light.png` | 1024 × 1024, on `green-800` / `neutral-100` |
| `design/logo/logo-dark.gif`, `logo-light.gif` | 512 × 512, 5s loop: the eye glances left, right, back, then blinks |
| `public/favicon.svg` | the dark tile, still; the site's SVG icon (`layout.tsx`) |
| `app/favicon.ico` | the dark tile at 16, 32 and 48px, for browsers and search engines that want .ico |
| `app/apple-icon.png` | the dark tile at 180px |
| `public/logo.png` | the bare logo at 512px, transparent; named in the structured data |

The tiles set the logo at 150/180 of the side, centred. The GIFs move the
eye as `components/site/EyeTracker.tsx` does on the site: the pupil reaches
30% of the eye's width and 12% of its height, the almond clips it, and a
blink squashes the eye to 8% over 220ms.

The share images (`app/opengraph-image.jpg`, `twitter-image.jpg`) are
captures of the hero, so they are not made here. If the logo changes,
re-capture them or redraw the 26px nav mark at (28, 25).

The exports here are for use outside the site (profiles, decks, email). This
folder is listed in `.vercelignore`, so deployments leave it out.
