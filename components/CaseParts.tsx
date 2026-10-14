import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
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

/** A step's screen over its one-line description. On phones the screen is
 *  a button that opens it full size (useZoom, CaseZoom) */
export function CaseFigure({
  step,
  alt,
  sizes,
  phone,
  onEnlarge,
  className,
}: {
  step: CaseStep;
  alt: string;
  sizes: string;
  phone: boolean;
  onEnlarge: (e: MouseEvent<HTMLButtonElement>) => void;
  className: string;
}) {
  const img = (
    <Image
      src={step.img!}
      alt={alt}
      width={step.w}
      height={step.h}
      quality={step.quality}
      sizes={phone ? "100vw" : sizes}
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
  const x = (width * from).toFixed(1);
  const e = ex.toFixed(1);
  return (
    <svg
      className="case-flow case-flow-mobile"
      viewBox={`0 0 ${width} 90`}
      aria-hidden="true"
    >
      <path d={`M ${x} 0 C ${x} 50, ${e} 40, ${e} 90`} />
    </svg>
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
