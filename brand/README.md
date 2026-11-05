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

## What `npm run brand` writes

| Output | What |
|---|---|
| `app/brand.css` | The palette, the theme roles ThemeGates.tsx swaps (dark and light), their `@property` registrations, and the pupil's size for the site's eyes |
| `app/brand.ts` | The browser-bar colour (`layout.tsx`) and the pupil's height (`SeeEyes.tsx`) |
| `public/logo-text.svg` | The nav logo |
| `public/favicon.svg`, `app/favicon.ico`, `app/apple-icon.png` | The dark tile, still: SVG icon, .ico at 16/32/48px, 180px apple icon |
| `public/logo.png` | The bare logo at 512px, transparent; named in the structured data |
| `exports/logo-dark.png`, `logo-light.png` | 1024 × 1024 tiles on the dark and light grounds |
| `exports/logo-dark.gif`, `logo-light.gif` | 512 × 512, 5s loop: the eye glances left, right, back, then blinks, as `EyeTracker.tsx` moves it on the site |
| `exports/linkedin-company-cover.png`, `.svg` | The company page cover, 2256 × 382 (LinkedIn's 1128 × 191 at 2×): the vine with connector leaves, buds and the logo's eye |
| `guidelines/DESIGN.md` | The palette, roles, contrast and logo blocks |

It also checks every pair in `tokens.json` → `contrast` on both themes and
exits with an error if one drops below its minimum (4.5:1 for text, 3:1 for
graphics), so a colour change can't quietly break legibility.

## What it can't update

- **Share images** (`app/opengraph-image.jpg`, `twitter-image.jpg`) are
  captures of the hero. Re-capture them after a ground or logo change.
- **The Claude Design system** ("Broccoli Tree Design",
  https://claude.ai/artifact/U16yBPDVbDVmimqBSmrQs6) and the design canvases
  live on claude.ai. Refresh the design system from this folder after a
  change so new boards use the current values.

This folder is in `.vercelignore`: the site only needs the generated files in
`app/` and `public/`, which are committed.
