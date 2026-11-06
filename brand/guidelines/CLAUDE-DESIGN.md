# Guidance for Claude Design

How to design new boards for Broccoli Tree Design (the "Website as a song"
canvas, or any new design) so they can ship without being redrawn. The
system itself is in `DESIGN.md` beside this page, and its values come from
`brand/tokens.json` (colour, logo) and `app/tokens.css` (everything else). This page covers what to do with them.

## Before you start

- Ask which section the board is for. Its theme follows from that: hero,
  about and the CTA are **dark**; case studies and services are **light**;
  Recent thoughts (the question) is the deep-orange **bridge**. If a
  component appears on more than one, show it on each of those themes.
- Work at 1440 wide (the column cap) and check at 375 (phone). If a board
  touches the case studies, also check below 900, where they stack. If it
  touches the hero or case 2's portal, also check a short phone (375 × 667)
  and a tall window (such as 1000 × 1100): both follow the screen's shape.

## Do

- **Colour by role, not hex:** `--bg`, `--ink`, `--muted`, `--accent`,
  `--warm`, `--button`. Annotate with the role name so it maps straight to
  code.
- **Type from the classes:** `.text-display`, `.text-stat`, `.text-sub`,
  `.text-title`, `.text-label` and `.body`. Sizes come from `--text-xs…lg` or
  `--display-0…8`. Bodoni Moda for anything display, Montserrat for UI and
  body. Montserrat Alternates is for the wordmark only.
- **Use italic for emphasis:** an italic word in the accent (or warm, in the
  CTA) inside a roman headline, as in "*efficiency*" in the hero.
- **Let display type be a poster:** it can bleed past the gutters, overlap a
  neighbour and zigzag across the 12 columns. Keep body copy on the grid,
  `--muted`, 16px, leading 1.7.
- **Draw from the existing motifs:** leaf (`--leaf-radius`), growth rings,
  the eye, the vine (1.25px accent stroke, one outlined leaf, filled bud),
  and liquid glass for product screens.
- **Spec motion with the house curve:** `cubic-bezier(0.2, 0.7, 0.2, 1)`.
  Things grow, rise or fade in, once. Always say what the still version
  looks like under reduced motion.
- **Mark decoration:** say which parts are decorative (`aria-hidden`, no
  pointer events) and give interactive parts a 44px hit area on phones.

## Don't

- Don't add a colour, font, radius or easing that isn't in `tokens.css`. If
  a board truly needs one, call it out as a **new token** with a name and
  a value for every theme (dark, light, bridge), so it can be added on
  purpose.
- Don't use pure white or black for text or grounds. Product screens inside
  glass cards are the exception.
- Don't use hard-cornered panels, drop-shadowed cards on the page ground,
  or icons as decoration.
- Don't use the old V1 system: Work Sans, Source Serif, IBM Plex Mono,
  terracotta `#c4562a`, botanical `#5b8c42` as an accent, or a 1140px max
  width. The logo's green, `green-500` (`#609546`), is for the logo and graphics that sit on both grounds, never text.
- Don't let the warm orange compete with the button: use it for eyebrows,
  text links and the odd number, never for large fills. The one exception is
  the bridge, a whole section of deep `orange-600`; don't add a second.

## Handoff

Export a component as a folder in `design/<component>/` with a `README.md`
spec, as `design/leaf-connector/` does:

1. **Scope:** what it replaces and what is out of scope.
2. **Anatomy:** a table of each part, its shape, and its paint by role.
3. **Geometry:** reference coordinates, plus which parts are computed from
   the layout.
4. **Theming and states:** every theme it appears on, hover/focus, reduced motion, and
   `aria`.
5. **Done when:** checks at desktop, below 900 and on phone.

Include a reference drawing (`.svg`, light theme, 1×). Screen prototypes
follow `design/case1-screens/` and `design/case2-screens/`: a `.dc.html`
source and a `capture.mjs` that writes WebP into `public/`.

## Keeping this current

When `brand/tokens.json` changes, run `npm run brand` (it regenerates the
colour tables in `DESIGN.md`). When `tokens.css` or `base.css` changes, update
`DESIGN.md` and this page in the same commit. Either way, refresh the "Broccoli Tree Design" design system
(https://claude.ai/artifact/U16yBPDVbDVmimqBSmrQs6: its `README.md`,
`tokens.json` and component cards) so Claude Design reads the current values.
