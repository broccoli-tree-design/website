import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type MouseEvent,
  type Ref,
} from "react";

/** Pieces shared by the two case studies (CaseDeck, CaseModules) */

/** A case's front item (no screenshot) or one of its steps */
export type CaseStep = {
  name: string;
  color: string;
  fg: string;
  img?: string;
  w?: number;
  h?: number;
  /** next/image quality; must be listed in next.config's images.qualities */
  quality?: number;
  desc?: string;
};

/** The four steps' tab colours, in order, after each case's front item */
export const STEP_COLORS = [
  { color: "var(--green-300)", fg: "var(--green-900)" },
  { color: "var(--orange-400)", fg: "var(--green-900)" },
  { color: "var(--neutral-200)", fg: "var(--green-900)" },
  { color: "var(--green-800)", fg: "var(--neutral-100)" },
];

/** The case frames' breakpoint: below it they stack, and screens open full
 *  size in a dialog to be read */
export const DESKTOP = "(min-width: 900px)";

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

/** True once the viewer zooms in, by pinching (the visual viewport scales)
 *  or with browser zoom (the pixel ratio rises); it stays true */
function useZoomedIn() {
  const [zoomedIn, setZoomedIn] = useState(false);
  useEffect(() => {
    const vv = window.visualViewport;
    const base = devicePixelRatio;
    const stop = () => {
      vv?.removeEventListener("resize", check);
      removeEventListener("resize", check);
    };
    function check() {
      if ((vv?.scale ?? 1) > 1.05 || devicePixelRatio > base * 1.05) {
        setZoomedIn(true);
        stop();
      }
    }
    vv?.addEventListener("resize", check);
    addEventListener("resize", check);
    return stop;
  }, []);
  return zoomedIn;
}

/** A step's screen over its one-line description. On phones the screen is
 *  a button that opens it full size (useZoom, CaseZoom) */
export function CaseFigure({
  step,
  alt,
  sizes,
  phone,
  onEnlarge,
  className,
  shown = true,
}: {
  step: CaseStep;
  alt: string;
  sizes: string;
  phone: boolean;
  onEnlarge: (e: MouseEvent<HTMLButtonElement>) => void;
  className: string;
  /** false for a screen mostly hidden (a deck's back cards), which keeps
   *  its smaller copy: a full file decodes to ~48 MB */
  shown?: boolean;
}) {
  // a copy sized to the screen at first; the full file once zoomed in
  const full = useZoomedIn() && shown;
  const img = (
    <Image
      src={step.img!}
      alt={alt}
      width={step.w}
      height={step.h}
      quality={step.quality}
      sizes={phone ? "100vw" : sizes}
      unoptimized={full}
    />
  );
  return (
    <figure className={className}>
      {phone ? (
        <button
          type="button"
          className="case-enlarge"
          onClick={onEnlarge}
          aria-haspopup="dialog"
        >
          {img}
          <span className="case-enlarge-hint">Tap to enlarge</span>
        </button>
      ) : (
        img
      )}
      <figcaption className="case-desc">{step.desc}</figcaption>
    </figure>
  );
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

/** Growth rings around a case frame; Rings.tsx animates them by data-ring */
export function CaseRings() {
  return [1, 0].map((i) => (
    <div
      key={i}
      className={`case-ring case-ring-${i}`}
      data-ring={i}
      aria-hidden="true"
    />
  ));
}

/** A connector's cubic Bézier: start, two controls, end */
export type Curve = [
  [number, number],
  [number, number],
  [number, number],
  [number, number],
];

/** The `d` of a connector curve */
export function curvePath([a, b, c, e]: Curve) {
  const f = (p: number[]) => p.map((v) => +v.toFixed(1)).join(" ");
  return `M ${f(a)} C ${f(b)}, ${f(c)}, ${f(e)}`;
}

/** Leaf positions along the curve (fractions of the parameter) */
const LEAVES = [0.3, 0.55, 0.8];
/** How far a leaf's tip leans away from the stem, degrees */
const LEAF_LEAN = 50;

/** Three small leaves on a connector, alternating sides. Each sits on the
 *  curve, base on the stem, and CSS transitions the transform alongside
 *  the path's `d` when the curve moves. */
export function FlowLeaves({ curve }: { curve: Curve }) {
  const [a, b, c, e] = curve;
  return LEAVES.map((t, i) => {
    const u = 1 - t;
    const at = (k: 0 | 1) =>
      u ** 3 * a[k] +
      3 * u * u * t * b[k] +
      3 * u * t * t * c[k] +
      t ** 3 * e[k];
    const slope = (k: 0 | 1) =>
      3 * u * u * (b[k] - a[k]) +
      6 * u * t * (c[k] - b[k]) +
      3 * t * t * (e[k] - c[k]);
    const heading = (Math.atan2(slope(1), slope(0)) * 180) / Math.PI;
    const lean = i % 2 ? -LEAF_LEAN : LEAF_LEAN;
    return (
      <path
        key={t}
        className="case-leaf"
        d="M 0 0 C 5 -9, 17 -9, 24 0 C 17 9, 5 9, 0 0 Z"
        style={
          {
            transform: `translate(${at(0).toFixed(1)}px, ${at(1).toFixed(
              1,
            )}px) rotate(${(heading + lean).toFixed(1)}deg)`,
          } as CSSProperties
        }
      />
    );
  });
}

/** A connector's curve and the leaves along it, to go inside an <svg>.
 *  `glide` also sets the path's CSS `d`, so CSS can transition the curve
 *  when it moves (the desktop connectors). */
export function FlowLine({ curve, glide }: { curve: Curve; glide?: boolean }) {
  const d = curvePath(curve);
  return (
    <>
      <path
        d={d}
        style={glide ? ({ d: `path("${d}")` } as CSSProperties) : undefined}
      />
      <FlowLeaves curve={curve} />
    </>
  );
}

/** A connector in its own <svg>, which takes the usual svg props */
export function Flow({
  curve,
  glide,
  ...svg
}: { curve: Curve; glide?: boolean } & ComponentProps<"svg">) {
  return (
    <svg aria-hidden="true" {...svg}>
      <FlowLine curve={curve} glide={glide} />
    </svg>
  );
}

/** Phone connector, in px of the 90px-tall SVG under a stacked case frame
 *  (y = 0 is the frame's bottom edge): from the bottom-most card's or row's
 *  bottom border, `from` of the way across, down to the result label's left
 *  edge at `ex`. */
export function PhoneFlow({
  width,
  ex,
  from = 0.5,
}: {
  width: number;
  ex: number;
  from?: number;
}) {
  const x = width * from;
  const curve: Curve = [
    [x, 0],
    [x, 50],
    [ex, 40],
    [ex, 90],
  ];
  return (
    <Flow
      curve={curve}
      className="case-flow case-flow-mobile"
      viewBox={`0 0 ${width} 90`}
    />
  );
}

/** A roman subtitle over the italic result number */
export function CaseResult({
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
