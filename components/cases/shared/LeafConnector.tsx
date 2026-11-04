import type { CSSProperties } from "react";

/** A connector's cubic Bézier: start, two controls, end */
export type Curve = [
  [number, number],
  [number, number],
  [number, number],
  [number, number],
];

/** The `d` of a connector curve */
function curvePath([a, b, c, e]: Curve) {
  const f = (p: number[]) => p.map((v) => +v.toFixed(1)).join(" ");
  return `M ${f(a)} C ${f(b)}, ${f(c)}, ${f(e)}`;
}

/** A point on a curve at parameter t, and the heading there in degrees */
function curveAt([a, b, c, e]: Curve, t: number) {
  const u = 1 - t;
  const at = (k: 0 | 1) =>
    u ** 3 * a[k] + 3 * u * u * t * b[k] + 3 * u * t * t * c[k] + t ** 3 * e[k];
  const slope = (k: 0 | 1) =>
    3 * u * u * (b[k] - a[k]) +
    6 * u * t * (c[k] - b[k]) +
    3 * t * t * (e[k] - c[k]);
  return {
    x: at(0),
    y: at(1),
    heading: (Math.atan2(slope(1), slope(0)) * 180) / Math.PI,
  };
}

/** A transform that puts a local shape (axis along +x) on the curve */
function placeAt(curve: Curve, t: number, turn = 0, scale = 1) {
  const { x, y, heading } = curveAt(curve, t);
  return {
    transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${(
      heading + turn
    ).toFixed(1)}deg)${scale === 1 ? "" : ` scale(${scale})`}`,
  } as CSSProperties;
}

/** A leaf, base at the origin, 24 long and 13.5 wide */
const LEAF = "M 0 0 C 5 -9, 17 -9, 24 0 C 17 9, 5 9, 0 0 Z";
/** The bud: a teardrop the leaf's size, base at the origin */
const BUD = "M 0 0 q 13 13.5 24 0 q -11 -13.5 -24 0 z";
/** Leaf and bud, scaled down to sit lightly on the stem */
const SCALE = 0.75;
/** How far the bud reaches past the curve's end, px */
export const BUD_LENGTH = 24 * SCALE;
/** The leaves: where each sits on the curve (a fraction of the parameter)
 *  and how far its tip leans away from the stem, degrees; one each side */
const LEAVES = [
  [0.25, -50],
  [0.65, 50],
];

/** How long the stem takes to draw, s; the leaves and bud follow its tip */
const DRAW = 0.9;

/** A vine, to go inside an <svg>: the curve, two outlined leaves, and a
 *  filled bud at the end pointing on along the curve. Once its <svg> is
 *  `.is-shown` it grows from the curve's start: the stem draws, each leaf
 *  opens as the line reaches it, then the bud (shared.css). */
export function LeafConnector({ curve }: { curve: Curve }) {
  const delay = (d: number) => ({ "--d": `${d.toFixed(2)}s` }) as CSSProperties;
  return (
    <>
      <path className="vine-stem" d={curvePath(curve)} pathLength={1} />
      {LEAVES.map(([t, lean]) => (
        <g key={t} style={placeAt(curve, t, lean, SCALE)}>
          <path
            className="case-leaf vine-grow"
            d={LEAF}
            style={delay(t * DRAW)}
          />
        </g>
      ))}
      <g style={placeAt(curve, 1, 0, SCALE)}>
        <path className="case-bud vine-grow" d={BUD} style={delay(DRAW)} />
      </g>
    </>
  );
}
