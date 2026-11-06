# Broccoli Tree Design: design system

The visual language of broccolitree.design as it ships today (V6,
`v6_case_study_animation`; see `VERSIONS.md`). The code is the source of
truth: colours and the logo come from `brand/tokens.json` (the tables below
marked `brand:` are generated from it by `npm run brand`), everything else
from `app/tokens.css` and `app/base.css`, whose comments explain the
reasoning in place. If this page and the code disagree, the code wins.

Guidance for designing new boards in Claude Design is in
`brand/guidelines/CLAUDE-DESIGN.md`. Claude Design reads the same system from the
"Broccoli Tree Design" design system
(https://claude.ai/artifact/U16yBPDVbDVmimqBSmrQs6), which mirrors this page
with live component previews.

## Principles

- **Poster, not template.** Display type is set big enough to bleed off the
  edges, overlaps its neighbours on purpose and zigzags across the grid.
  Body copy stays calm and on the columns.
- **Botanical, never geometric.** Shapes come from the leaf, the eye, growth
  rings and vines. There are no hard-cornered panels and no icons for
  decoration.
- **Two themes and a bridge, one page.** The page fades between a dark forest
  theme and a light ivory theme as you scroll, with one deep-orange bridge
  (Recent thoughts) between the case studies and services, like the bridge
  of a song. Every colour is a role that works on all three.
- **Quiet motion.** Things grow, rise and fade in with one ease-out curve.
  Under reduced motion, everything is still and complete.

## Files

| File | What it holds |
|---|---|
| `app/tokens.css` | Palette, theme roles, radii, gutter, motion and type tokens. It also names the cascade layers `tokens, base, site, cases` |
| `app/base.css` | Reset, links and focus ring, the 1440 column, the 12-column grid, the type classes |
| `components/site/site.css` | Page sections: nav, hero, about, question, services, case studies header, CTA |
| `components/cases/shared/shared.css` | Case section spacing, result and vine, glass carousel, screen dialog |
| `components/cases/{blackbox,client_portal}/*.css` | Each case study's own animated scene |
| `app/layout.tsx` | Fonts (`next/font/google`) and the browser bar colour |
| `design/` | Prototype sources for the case study screens, and component specs exported from Claude Design |

## Colour

### Palette

Every colour on the page, in three families: green, neutral and orange. The
number is a lightness step shared across families, so the same number reads
about as light in any family (green-600 and orange-600 are both OKLCH L 0.50).
The steps are not evenly spaced: each value is tuned for a contrast pair below.
Use roles (next section) in components, never palette values directly.

<!-- brand:palette -->
| Token | Hex | Used for |
|---|---|---|
| `--green-950` | `#050d0a` | near-black: the black box's faces, darkest strokes |
| `--green-900` | `#102e27` | button ink on dark, shadow tint |
| `--green-800` | `#0e372d` | dark ground, light ink, browser bar, logo tile and pupil |
| `--green-600` | `#476f33` | light-theme accent |
| `--green-500` | `#609546` | the logo; any graphic that sits on both grounds |
| `--green-300` | `#a8cf8a` | dark-theme accent, text selection |
| `--neutral-700` | `#3c4a3f` | light-theme muted text |
| `--neutral-200` | `#d7dccb` | dark-theme muted text |
| `--neutral-100` | `#f6f5e5` | light ground, dark ink, eye white |
| `--orange-800` | `#742f15` | light-theme button hover |
| `--orange-600` | `#9e4220` | light-theme warm and button |
| `--orange-400` | `#fb7e4f` | dark-theme warm and button |
| `--orange-300` | `#fd976f` | dark-theme button hover |
<!-- /brand:palette -->

<!-- brand:logo -->
The logo is drawn in `green-500` (`#609546`), with a `neutral-100` eye and a `green-800` pupil (rx 6.25, ry 13: 83.2% of the eye's height). The tile is `green-800`.
<!-- /brand:logo -->

It is the one green that holds 3:1 on both grounds, since the nav logo stays
on screen through both themes; use it for any graphic that must too. All logo
files are made from `brand/logo/logo.svg` (see `brand/README.md`). The share
images are hero captures and need re-capturing after a logo or ground change.

### Roles and themes

`ThemeGates.tsx` sets `<html data-theme>` from the `data-gate` of whichever
section has crossed 55% of the viewport. The roles fade in 1.1s; the button
roles fade in 0.3s, so the button's ink never sits on the wrong colour.

<!-- brand:roles -->
| Role | Dark (default) | Light | Bridge | Used for |
|---|---|---|---|---|
| `--bg` | green-800 | neutral-100 | orange-600 | page ground |
| `--ink` | neutral-100 | green-800 | neutral-100 | headlines, nav, captions |
| `--muted` | neutral-200 | neutral-700 | neutral-200 | body copy, descriptions |
| `--accent` | green-300 | green-600 | neutral-200 | links, italic emphasis, stats, rings, vines, focus ring |
| `--warm` | orange-400 | orange-600 | neutral-100 | eyebrows, alternate service numbers, text links, the CTA's emphasis |
| `--button` | orange-400 | orange-600 | green-800 | the Let's chat button |
| `--button-hover` | orange-300 | orange-800 | green-950 | the button on hover |
| `--button-ink` | green-900 | neutral-100 | neutral-100 | text on the button |
| `--logo-tile` | green-800 | neutral-100 | green-800 | the tile behind the nav logo: the ground itself on dark and light, so it only shows on the bridge |
<!-- /brand:roles -->

Section themes, top to bottom: hero and about **dark** → case studies
**light** → the question (Recent thoughts) **bridge** → services **light** →
CTA footer **dark**. On the bridge the nav turns orange too: its button goes
`green-800` with ivory ink, and the logo sits on its `green-800` tile
(`--logo-tile`, invisible on the other themes), since the green leaf alone is
under 3:1 on orange.

Contrast, checked by every `npm run brand` (it fails below a minimum):

<!-- brand:contrast -->
| Check | Dark | Light | Bridge | Minimum |
|---|---|---|---|---|
| Ink on ground | 11.92 | 11.92 | 5.87 | 4.5 |
| Muted text | 9.35 | 8.52 | 4.61 | 4.5 |
| Accent | 7.46 | 5.32 | 4.61 | 4.5 |
| Warm | 5.11 | 5.87 | 5.87 | 4.5 |
| Button label | 5.69 | 5.87 | 11.92 | 4.5 |
| Button hover | 6.82 | 8.85 | 17.89 | 4.5 |
| Logo on its tile | 3.67 | 3.25 | 3.67 | 3 |
<!-- /brand:contrast -->

The two grounds were pushed apart on 2026-11-05 (green-800 from `#173f35`,
neutral-100 from `#efeede`) to raise every pair.

## Typography

### Families

| Variable | Family | Weights | Role |
|---|---|---|---|
| `--serif` | Bodoni Moda (opsz axis, roman and italic) | 500–700 | all display text, titles, numbers |
| `--sans` | Montserrat | 400, 500, 600 | body, UI, labels, nav |
| `--display` | Montserrat Alternates | 600 | the "Broccoli Tree Design" wordmark only |

### Type classes (`base.css`)

Each class sets the font, weight, spacing and leading. Each use sets only its
size (a token) and, where needed, its colour.

| Class | Setting | Use |
|---|---|---|
| `.text-display` | serif 600, leading 0.85, −0.04em | roman headlines; `em` inside goes 700 in the accent |
| `.text-stat` | serif italic 700, leading 0.85, −0.04em, accent, no wrap | big numbers and giant words ("Aiqi", "Case") |
| `.text-sub` | serif italic 500 at `--display-1`, leading 1.1 | sub-headlines and ledes |
| `.text-title` | serif 600, leading 1.1, −0.025em | card titles at `--title-card` |
| `.text-label` | sans 500, 14px, uppercase, +0.03em | eyebrows and small labels (colour per use) |
| `.body` | sans 16px, leading 1.7, muted | body copy |

### Sizes

UI text uses four even sizes: `--text-xs` 12, `--text-sm` 14, `--text-md` 16
and `--text-lg` 18. Card titles use `--title-card`: `clamp(20px, 2cqw, 32px)`.

Display text sits on a √2 scale in column widths (`cqw` of the 1440 column):

| Token | Desktop | Phone (≤ 640px) | Example |
|---|---|---|---|
| `--display-0` | 2.5cqw | 6vw | hero slogan |
| `--display-1` | 3.5cqw | 6vw | `.text-sub` |
| `--display-2` | 5cqw | 9vw | service number |
| `--display-3` | 7cqw | 13vw | "Hi, I'm", "legal tech teams" |
| `--display-4` | 10cqw | 14vw | CTA, result stat |
| `--display-5` | 14cqw | — | "Where I help", "studies" |
| `--display-6` | 20cqw | — | |
| `--display-7` | 28cqw | 38vw | hero name |
| `--display-8` | 40cqw | — | "Case" |

Phones enlarge the smallest steps. The biggest words already span the screen.

## Layout

- **Column:** `.column` caps at 1440px and is an inline-size container, so
  most display sizes are `cqw` of it.
- **Grid:** `.grid` has 12 columns with a `2cqw` gap. Body copy, cards and
  results sit on it. Display headlines stay off it so they can bleed.
- **Gutter:** `--gutter` is 28px, or 24px on phones and in stacked case
  studies.
- **Breakpoints:** media queries can't read tokens, so these are written out:
  - `max-width: 640px`: phone layout and the phone display scale.
  - `width < 900px`: the case studies stack. Between 640 and 900px only the
    case sections are stacked, on purpose.
  - Two layouts also follow the screen's shape. The phone hero needs a tall
    screen (aspect ratio 2/3 or narrower); a phone-width window that isn't
    tall keeps the wide hero. Case 2's portal is stacked under 900px and on
    any portrait screen.
- **Rhythm:** sections are tall and airy and are measured in viewport units
  (for example services is `190vh`, the question `95vh`, and case padding is
  `20vh` on top). Service cards zigzag across the grid with staggered `vh`
  offsets; the hero's four lines zigzag the same way.
- **Case artboard:** the case studies are laid out on a 1384-unit artboard,
  where `--u` is one unit. Case 2's portal board is 1328 × 520.

## Shape and motif

| Motif | How it's made | Where |
|---|---|---|
| **Leaf** | `--leaf-radius: 4px 62% 4px 62% / 4px 62% 4px 62%` | hero portrait (tilted −3°) |
| **Growth rings** | four 1px accent outlines in the leaf shape, opacity 0.6 → 0.16, inner to outer | around the hero portrait |
| **Eye** | the logo's almond (`/eye.svg` mask) with a round pupil that follows the pointer (`EyeTracker.tsx`) | the logo, the counters of "see", before the question label |
| **Vine** | 1.25px accent stroke with round caps; one outlined leaf and a filled teardrop bud at the end | Solution → result in both cases (`LeafConnector.tsx`), the CTA up to the nav button |
| **Liquid glass** | 34% white with blur(14px) saturate(1.4), a 1px white ring, a lit rim and a green-900-tinted shadow, `--radius-md` | case study screen cards and carousel arrows |

Radii: `--radius-xs` 4 (defined, not used yet), `--radius-sm` 8 (small
portal cards), `--radius-md` 10 (glass cards and screens) and `--radius-lg`
24 (the button).

## Components

- **Nav:** fixed, on `--bg`. It has the logo mark with a live eye, the
  Montserrat Alternates wordmark, 14px links in `--ink` (hover: accent) and
  the **Let's chat** button: pill, `--button` fill, 600 weight,
  `--button-shadow`.
- **Text link:** `.text-label` in `--warm` with a 1px underline, 4px below.
- **Service card:** an italic `.text-stat` number (alternating `--display-4`
  in accent and `--display-2` in warm), a `.text-title`, and a 14px muted
  description. Cards sit on a subgrid.
- **Case study:** a warm `.text-label` eyebrow, a `.text-display` title, then
  Problem and Solution labels with body copy. A vine leads to the result:
  a roman `.text-sub` label over an italic accent number at `--display-4`.
- **Glass carousel:** the focused card is centred and wide (965 units), the
  side cards are 590, and arrows sit on the card's edges. On phones one card
  shows at a time and the next peeks in. Captions have a serif-700 number and
  a name in `--ink` and a description in `--muted`. Selecting a screen opens
  it full size.
- **Case scenes:** case 1's black box carton opens on scroll; case 2's
  client portal opens on scroll. Both fall back to a still picture under
  reduced motion. Stacked, the portal sits between the nav and the scroll
  cue, at least 24px from each: the workspace takes the height that's left
  (up to its full size), and on screens under 800px tall the cards drop to
  a name and one line.

## Motion

- One curve, `--ease-out: cubic-bezier(0.2, 0.7, 0.2, 1)`, for entrances and
  layout moves. `Rings.tsx` repeats it, since the Web Animations API can't
  read custom properties.
- Theme fade: 1.1s ease for the roles, 0.3s ease-out for the button.
- Hero entrance: the photo scales in, then the rings go inner to outer 110ms
  apart, then the name rises and the slogan fades.
- Vines draw their stem in 0.9s, then the leaf and bud open from their base.
- The one playful exception is the hero photo's springy hover wiggle,
  `cubic-bezier(0.3, 1.6, 0.5, 1)`.
- Every animation sits behind `prefers-reduced-motion: no-preference`, or
  checks it in script. Under reduce, nothing moves and nothing is hidden.

## Accessibility

- One focus ring for links and buttons: 2px accent, 3px offset (readable on
  both themes).
- Text colours keep at least 4.5:1 contrast on their theme's ground (5:1 or
  more on dark and light; muted and accent are 4.61:1 on the bridge).
- On phones, small controls get invisible hit areas up to 44px.
- Decorative SVG (vines, rings) is `aria-hidden` and `pointer-events: none`.

## Changing the system

1. **Colour or logo:** edit `brand/tokens.json` (or the logo's shape in
   `brand/logo/logo.svg`), then run `npm run brand`. It rewrites
   `app/brand.css`, `app/brand.ts`, the logo and icon files, the exports in
   `brand/exports/` (logo PNG/GIFs, LinkedIn cover) and the generated tables on
   this page, and fails if a contrast check drops below its minimum.
2. **Anything else:** change the value in `app/tokens.css` (or the class in
   `app/base.css`) and update this page and `brand/guidelines/CLAUDE-DESIGN.md`.
3. If the hero's look changed, re-capture the share images
   (`app/opengraph-image.jpg`, `twitter-image.jpg`) with `npm run
   brand:share` while `npm run dev` is running.
