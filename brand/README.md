# Brand

Everything that makes Broccoli Tree Design look like itself, in one place.
Change a colour or the logo here once, run one command, and the site, the
logo files, the icons, the LinkedIn cover and the guidelines all follow.

```sh
npm run brand
```

## What's here

| Path | What | Edit it? |
|---|---|---|
| `tokens.json` | **The source.** Palette (green, neutral, orange), the theme roles, the contrast checks, the logo's colours and pupil, the LinkedIn cover's settings | Yes |
| `logo/logo.svg` | The logo's shape, with `{logo.…}` placeholders for its colours and pupil | Only to change the drawing |
| `build.mjs` | Makes every output below from the two files above | Only to add an output |
| `guidelines/DESIGN.md` | The design system: principles, colour, type, layout, motion, components. Its `<!-- brand:… -->` tables are generated | Yes, outside the generated tables |
| `guidelines/CLAUDE-DESIGN.md` | How to design new boards in Claude Design so they ship as drawn | Yes |
| `exports/` | Files for use outside the site (profiles, decks, email, LinkedIn). Generated | No |
| `signature/gmail-signature.html` | The Gmail signature, hand-written with inline colours from the dark theme (email ignores stylesheets); its photo is `public/signature-photo.png`. After a palette change, update its hexes by hand | Yes |

## What `npm run brand` writes

| Output | What |
|---|---|
| `app/brand.css` | The palette, the theme roles ThemeGates.tsx swaps (dark, light and the orange bridge), their `@property` registrations, and the pupil's size for the site's eyes |
| `app/brand.ts` | The browser-bar colour (`layout.tsx`) and the pupil's height (`SeeEyes.tsx`) |
| `public/logo-text.svg` | The nav logo |
| `public/favicon.svg`, `app/favicon.ico`, `app/apple-icon.png` | The dark tile, still: SVG icon, .ico at 16/32/48px, 180px apple icon |
| `public/logo.png` | The bare logo at 512px, transparent; named in the structured data |
| `exports/logo-dark.png`, `logo-light.png` | 1024 × 1024 tiles on the dark and light grounds |
| `exports/logo-dark.gif`, `logo-light.gif` | 512 × 512, 5s loop: the eye glances left, right, back, then blinks, as `EyeTracker.tsx` moves it on the site |
| `exports/linkedin-company-cover.png`, `.svg` | The company page cover, 2256 × 382 (LinkedIn's 1128 × 191 at 2×): the vine with connector leaves, buds (one in `warmBud` orange) and the logo's eye |
| `guidelines/DESIGN.md` | The palette, roles, contrast and logo blocks |

It also checks every pair in `tokens.json` → `contrast` on both themes and
exits with an error if one drops below its minimum (4.5:1 for text, 3:1 for
graphics), so a colour change can't quietly break legibility.

## Share images

`app/opengraph-image.jpg` and `twitter-image.jpg` are 1200 × 630 captures of
the hero (nav links hidden; the logo and the orange Let's chat button stay), so they need the site running. After
a colour or logo change:

```sh
npm run dev            # in one terminal
npm run brand:share    # in another; uses Google Chrome, headless
```

## What it can't update

- **The Claude Design system** ("Broccoli Tree Design",
  https://claude.ai/artifact/U16yBPDVbDVmimqBSmrQs6) and the design canvases
  live on claude.ai. After a change, update the design system's
  `tokens.json` (palette values and role usages) and its Logos group from
  this folder, then re-copy its `tokens.json` into each canvas's
  `project/ds/broccoli-tree-design/` so the canvases' Theme menu offers the
  current values. Canvas boards themselves are past explorations and keep
  the colours they were drawn in.

This folder is in `.vercelignore`: the site only needs the generated files in
`app/` and `public/`, which are committed.
