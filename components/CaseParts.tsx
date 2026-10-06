import type { Ref } from "react";

/** Pieces shared by the two case studies (CaseDeck, CaseModules) */

/** A case's front item (no screenshot) or one of its steps */
export type CaseStep = {
  name: string;
  color: string;
  fg: string;
  img?: string;
  w?: number;
  h?: number;
};

/** The four steps' tab colours, in order, after each case's front item */
export const STEP_COLORS = [
  { color: "var(--green-300)", fg: "var(--green-900)" },
  { color: "var(--orange-400)", fg: "var(--green-900)" },
  { color: "var(--neutral-200)", fg: "var(--green-900)" },
  { color: "var(--green-800)", fg: "var(--neutral-100)" },
];

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
