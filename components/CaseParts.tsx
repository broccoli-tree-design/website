import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react";

/** Pieces shared by the two case studies (CaseDeck, CaseModules) */

/** A case's front item (no screenshot) or one of its steps */
export type CaseStep = {
  name: string;
  /** a module's key in MODULES */
  key?: string;
  color: string;
  fg: string;
  img?: string;
  w?: number;
  h?: number;
  /** next/image quality; must be listed in next.config's images.qualities */
  quality?: number;
  desc?: string;
};

/** Every module a client workflow can use, in workflow order (the
 *  architecture diagram lists them all; the last bleeds off its box to say
 *  there are more). Workflows pick modules by these keys. */
export const MODULES = {
  insights: "Insights",
  ideation: "Ideation",
  opportunity: "Opportunity",
  audience: "Audience",
  attention: "Attention",
  channel: "Channel",
  investment: "Investment",
  flight: "Flight",
  optimization: "Optimization",
} as const;

/** The case studies' tiers: up to 640px a phone (one card at a time, screens
 *  open full size in a dialog to be read); 641 to 899 a tablet (the carousel
 *  as on desktop, the text stacked, no scroll-driven portal); 900 and up the
 *  full version. The CSS media queries use the same 640 / 900 */
const DESKTOP = "(width > 640px)";

/** The page's phone breakpoint, the same 640px as the CSS media queries
 *  (Rings.tsx combines it with hover, as its inverse) */
export const PHONE = "(max-width: 640px)";

export function usePhone() {
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const mq = matchMedia(DESKTOP);
    const onChange = () => setPhone(!mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return phone;
}

/** Calls `measure` when any of these elements resizes, and once when
 *  watching starts. It waits until every ref holds an element; the refs
 *  are meant to be stable. */
function useResize(
  refs: RefObject<Element | null>[],
  measure: () => void,
) {
  const latest = useRef(measure);
  useEffect(() => {
    latest.current = measure;
  });
  useEffect(() => {
    const els = refs.map((r) => r.current);
    if (els.some((el) => !el)) return;
    const ro = new ResizeObserver(() => latest.current());
    els.forEach((el) => ro.observe(el!));
    // text can reflow without its box changing (webfonts arriving, balanced
    // wrapping), which moves what connectors measure
    const remeasure = () => latest.current();
    addEventListener("resize", remeasure);
    document.fonts?.ready.then(remeasure);
    return () => {
      ro.disconnect();
      removeEventListener("resize", remeasure);
    };
    // once: the refs never change
  }, []);
}

/** The step open full size in CaseZoom */
export function useZoom() {
  const ref = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState<CaseStep | null>(null);
  const open = (s: CaseStep) => {
    setStep(s);
    ref.current?.showModal();
  };
  return { ref, step, open, clear: () => setStep(null) };
}

/** Phones: one screen at full size, scrolled sideways. Closes itself when
 *  the window widens past the breakpoint */
export function CaseZoom({
  zoom,
  phone,
  noun,
  className,
}: {
  zoom: ReturnType<typeof useZoom>;
  phone: boolean;
  noun: string;
  className: string;
}) {
  const { ref, step, clear } = zoom;
  useEffect(() => {
    if (!phone) ref.current?.close();
  }, [phone, ref]);
  return (
    <dialog
      className={`case-zoom ${className}`}
      ref={ref}
      aria-label={step ? `${step.name} ${noun}, full size` : undefined}
      onClose={clear}
      onClick={(e) => e.target === e.currentTarget && ref.current?.close()}
    >
      <div className="case-zoom-bar">
        <span className="case-name">{step?.name}</span>
        <button
          type="button"
          className="case-zoom-close"
          onClick={() => ref.current?.close()}
          aria-label="Close"
        >
          ×
        </button>
      </div>
      {step?.img && (
        <div className="case-zoom-scroll">
          <Image
            src={step.img}
            alt={`${step.name} ${noun}, full size`}
            width={step.w}
            height={step.h}
            quality={step.quality}
            sizes="1440px"
          />
        </div>
      )}
      <p className="case-zoom-desc">{step?.desc}</p>
    </dialog>
  );
}

/** Step numbers: 01–04, none for the front item */
export const num = (i: number) => (i ? `0${i}` : "");

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
 *  opens as the line reaches it, then the bud (cases.css). */
export function FlowLine({ curve }: { curve: Curve }) {
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

/** True once the element has come into view (and stays true), so what's
 *  in it can play its entrance once */
export function useShown(ref: RefObject<Element | null>) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setShown(true);
        io.disconnect();
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return shown;
}

/** The horizontal middle of an element's text, in viewport px */
function textMid(el: Element) {
  const range = document.createRange();
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const rects: DOMRect[] = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent?.trim()) continue;
    range.selectNodeContents(n);
    rects.push(...range.getClientRects());
  }
  if (!rects.length) {
    const b = el.getBoundingClientRect();
    return b.left + b.width / 2;
  }
  const left = Math.min(...rects.map((r) => r.left));
  const right = Math.max(...rects.map((r) => r.right));
  return (left + right) / 2;
}

/** The connector from the Solution down to the result label: from the
 *  middle of the Solution's text (the brief sits just above) to the middle
 *  of the result's text, in px of its own box. */
function BriefFlow({
  result,
  shown,
}: {
  result: RefObject<HTMLElement | null>;
  shown: boolean;
}) {
  const svg = useRef<SVGSVGElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0, sx: 0, ex: 0 });
  useResize([svg, result], () => {
    const s = svg.current!.getBoundingClientRect();
    const solution =
      svg.current!.previousElementSibling?.querySelector(".case-solution p");
    if (!solution) return;
    setBox({
      w: s.width,
      h: s.height,
      sx: textMid(solution) - s.left,
      ex: textMid(result.current!) - s.left,
    });
  });
  const { w, h, sx, ex } = box;
  // the curve stops short so the bud, pointing on down, ends at the box's
  // bottom, just above the result
  const end = h - BUD_LENGTH;
  const curve: Curve = [
    [sx, 0],
    [sx, end * 0.6],
    [ex, end * 0.4],
    [ex, end],
  ];
  return (
    <svg
      ref={svg}
      aria-hidden="true"
      className={`case-flow case-brief-flow${shown ? " is-shown" : ""}`}
      viewBox={`0 0 ${w} ${h}`}
    >
      {w > 0 && <FlowLine curve={curve} />}
    </svg>
  );
}

/** A roman subtitle over the italic result number */
function CaseResult({
  label,
  stat,
  className,
  ref,
}: {
  label: string;
  stat: string;
  className: string;
  ref?: Ref<HTMLDivElement>;
}) {
  return (
    <div className={`case-result ${className}`} ref={ref}>
      <span className="text-sub result-label">{label}</span>
      <span className="text-stat result-stat">{stat}</span>
    </div>
  );
}

/** Everything under a case's frame: the Problem and Solution (children),
 *  the connector from the Solution, and the result */
export function CaseTail({
  children,
  ...result
}: { children: ReactNode } & Omit<ComponentProps<typeof CaseResult>, "ref">) {
  const ref = useRef<HTMLDivElement>(null);
  // the vine grows once the result is in view
  const shown = useShown(ref);
  return (
    <>
      <div className="grid case-brief">{children}</div>
      <BriefFlow result={ref} shown={shown} />
      <div className="grid">
        <CaseResult ref={ref} {...result} />
      </div>
    </>
  );
}
