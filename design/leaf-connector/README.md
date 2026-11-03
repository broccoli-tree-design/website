# Leaf connector (vine → bud)

Replaces the current Solution → result connector (`FlowLine` in
`components/CaseParts.tsx`) in both case studies. Exported from the
"Website as a song" Design canvas (Logo motifs board, Ripple · first version).
Only the connector is in scope: no rings, layout or copy changes.

Reference drawing: `leaf-connector.svg` (light theme colour, 1× = 106 × 160).

## Anatomy

| Part | Shape | Paint |
|---|---|---|
| Stem | one cubic Bézier, a → b → c → e | stroke `var(--accent)`, 1.25px, round caps |
| Leaf | one leaf, outlined, base on the stem | stroke only, `fill: none` (as `.case-leaf` today) |
| Bud | teardrop at the stem's end, pointing along the end tangent | **filled** `var(--accent)`, no stroke needed |

Differences from today's `FlowLine`: one leaf instead of three, and a new
filled bud at the end. The bud sits just above the result label/number, so the
vine visibly "lands" on the metric.

## Geometry (reference coordinates)

- Stem: `a (40,0) b (30,60) c (110,70) e (120,130)`. In code, keep computing
  the curve from the layout (Solution → result) as `FlowLine` does; these
  numbers fix the *character* (an S that leaves steeply, swings right, then
  drops nearly straight into the bud).
- Leaf: at `t = 0.39` (replace `LEAVES = [0.3, 0.55, 0.8]` with `[0.39]`),
  lean −50° from the heading (`LEAF_LEAN` already 50; use the negative side).
  Size: ≈28 long. The existing leaf path
  `M 0 0 C 5 -9, 17 -9, 24 0 C 17 9, 5 9, 0 0 Z` is close enough; scale 1.15
  to match the drawing.
- Bud: at `t = 1`, rotated to the end tangent. Local path, axis along +x:
  `M 0 0 q 14 10 26 0 q -12 -10 -26 0 z` (asymmetric teardrop, ≈26 long,
  ≈10 wide). Base on the stem's end, tip toward the number.

## Theming and states

- Colour only via `var(--accent)` (green-600 light / green-300 dark), so it
  follows `ThemeGates`.
- Stroke widths stay 1.25px at every size (`vector-effect: non-scaling-stroke`
  if the SVG is scaled).
- Decorative: `aria-hidden="true"`, `pointer-events: none`.
- Motion (optional): draw the stem, then fade/scale the leaf, then the bud,
  with the house easing `cubic-bezier(0.2, 0.7, 0.2, 1)`, only under
  `prefers-reduced-motion: no-preference`. Static otherwise.

## Done when

- Both cases show stem → one outlined leaf → filled bud above the result.
- Same connector in case 1 (50%) and case 2 (400%).
- Phone (`< 900px` stacked) still draws from Solution to result; the bud stays
  above the label.
