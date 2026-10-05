"use client";
import Image from "next/image";
import { useState, type CSSProperties } from "react";

/** The black box in front, then the four steps behind it */
const CARDS = [
  { name: "Black box", color: "var(--green-950)", fg: "var(--neutral-100)" },
  {
    name: "Set parameters",
    img: "/case1/parameter.png",
    w: 1293,
    h: 969,
    color: "var(--green-300)",
    fg: "var(--green-900)",
  },
  {
    name: "Generate",
    img: "/case1/loading.png",
    w: 1054,
    h: 544,
    color: "var(--orange-400)",
    fg: "var(--green-900)",
  },
  {
    name: "Compare reasoning",
    img: "/case1/reasoning.png",
    w: 1366,
    h: 734,
    color: "var(--neutral-200)",
    fg: "var(--green-900)",
  },
  {
    name: "Review summary",
    img: "/case1/summary.png",
    w: 1366,
    h: 1021,
    color: "var(--green-800)",
    fg: "var(--neutral-100)",
  },
];
const N = CARDS.length;
const num = (i: number) => (i ? `0${i}` : "");

/** Artboard units (1384-wide deck): each depth slot steps 56 right, 36 down.
 *  One curve from the bottom of the Review summary tab, wherever that card
 *  sits in the stack, to the result label's left edge. Drawn over the stack;
 *  CSS animates `d` alongside the cards. */
const EX = 480;
const SUMMARY = N - 1;
function flow(d: number) {
  const x = 952 + d * 56;
  const y = 600 + d * 36;
  return `M ${x} ${y} C ${x} ${y + 160}, ${EX} 826, ${EX} 986`;
}

/** three static curves, drawn on a 350-wide frame and stretched to fit */
const MOBILE_EX = (350 * EX) / 1384;
const MOBILE_FLOW = [
  [40, 50, 30],
  [175, 50, 40],
  [310, 40, 50],
].map(
  ([x, a, b]) =>
    `M ${x} 0 C ${x} ${a}, ${MOBILE_EX.toFixed(1)} ${b}, ${MOBILE_EX.toFixed(1)} 90`,
);

export default function CaseDeck() {
  const [active, setActive] = useState(0);
  const summaryFlow = flow((SUMMARY - active + N) % N);

  // behind cards come forward; the front card hands over to the next step
  const pick = (i: number) => setActive((a) => (a === i ? (i + 1) % N : i));

  return (
    <>
      <div className="case-frame deck-frame">
        <svg
          className="mod-flow deck-flow"
          viewBox="0 0 1384 986"
          aria-hidden="true"
        >
          <path
            d={summaryFlow}
            style={{ d: `path("${summaryFlow}")` } as CSSProperties}
          />
        </svg>
        <div
          className="case-ring case-ring-0"
          data-ring={0}
          aria-hidden="true"
        />
        <div
          className="case-ring case-ring-1"
          data-ring={1}
          aria-hidden="true"
        />
        <div className="deck-stack">
          {CARDS.map((c, i) => {
            const d = (i - active + N) % N;
            const front = d === 0;
            return (
              <div
                key={c.name}
                className={`deck-card${c.img ? "" : " deck-black"}${
                  front ? " is-front" : ""
                }`}
                style={
                  {
                    "--d": d,
                    "--c": c.color,
                    "--fg": c.fg,
                    zIndex: 10 - d,
                  } as CSSProperties
                }
                onClick={() => pick(i)}
              >
                <div className="deck-body">
                  {c.img ? (
                    <Image
                      src={c.img}
                      alt={`${c.name} step, GeoLift no-code experimentation workflow`}
                      width={c.w}
                      height={c.h}
                      sizes="(min-width: 900px) 900px, 100vw"
                    />
                  ) : (
                    <div className="deck-face">
                      <p className="text-title deck-face-title">
                        Milwaukee, Orlando, Daytona Beach, Melbourne
                      </p>
                      <span className="text-label">
                        Why these campaign locations?
                      </span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="deck-tab"
                  aria-label={
                    i ? `Show step ${num(i)}: ${c.name}` : `Show ${c.name}`
                  }
                  aria-pressed={front}
                >
                  <span className="deck-name">{c.name}</span>
                  <span className="text-num deck-num">{num(i)}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <svg
        className="mod-flow deck-flow-mobile"
        viewBox="0 0 350 90"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {MOBILE_FLOW.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </svg>

      <div className="deck-result">
        <span className="text-sub result-label">
          Increase in funding after MVP delivery
        </span>
        <span className="text-stat result-stat">50%</span>
      </div>
    </>
  );
}
