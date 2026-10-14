"use client";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  CaseResult,
  CaseRings,
  num,
  PhoneFlow,
  STEP_COLORS,
  type CaseStep,
} from "./CaseParts";

/** The black box in front, then the three steps behind it */
const CARDS: CaseStep[] = [
  { name: "Black box", color: "var(--green-950)", fg: "var(--neutral-100)" },
  {
    name: "Confirm data",
    img: "/case1/parameter.png",
    w: 1293,
    h: 969,
    ...STEP_COLORS[0],
  },
  {
    name: "Set parameters",
    img: "/case1/loading.png",
    w: 1054,
    h: 544,
    ...STEP_COLORS[1],
  },
  {
    name: "Select markets",
    img: "/case1/reasoning.png",
    w: 1366,
    h: 734,
    ...STEP_COLORS[2],
  },
];
const N = CARDS.length;

/** Artboard units (1384-wide deck): each depth slot steps 56 right, 36 down.
 *  One curve from the bottom of the Select markets tab, wherever that card
 *  sits in the stack, to the result label's left edge. Drawn over the stack;
 *  CSS animates `d` alongside the cards. */
const EX = 480;
const MARKETS = N - 1;
function flow(d: number) {
  const x = 952 + d * 56;
  const y = 600 + d * 36;
  return `M ${x} ${y} C ${x} ${y + 160}, ${EX} 790, ${EX} 950`;
}

/** Stacked (phones): the label starts 34.7% in */
const PHONE_EX = 0.347;

export default function CaseDeck() {
  const [active, setActive] = useState(0);
  const marketsFlow = flow((MARKETS - active + N) % N);
  const frame = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(350);

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.offsetWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // behind cards come forward; the front card hands over to the next step
  const pick = (i: number) => setActive((a) => (a === i ? (i + 1) % N : i));

  return (
    <>
      <div className="case-frame deck-frame" ref={frame}>
        <svg
          className="case-flow deck-flow"
          viewBox="0 0 1384 950"
          aria-hidden="true"
        >
          <path
            d={marketsFlow}
            style={{ d: `path("${marketsFlow}")` } as CSSProperties}
          />
        </svg>
        <CaseRings />
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
                <div className="case-shot deck-body">
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
                        Washington DC, Detroit, Richmond
                      </p>
                      <span className="text-label">
                        Why these campaign markets?
                      </span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="case-tab deck-tab"
                  aria-label={
                    i ? `Show step ${num(i)}: ${c.name}` : `Show ${c.name}`
                  }
                  aria-pressed={front}
                >
                  <span className="case-name">{c.name}</span>
                  <span className="text-num deck-num">{num(i)}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <PhoneFlow width={width} ex={width * PHONE_EX} />

      <CaseResult
        className="deck-result"
        label="Increase in funding after MVP delivery"
        stat="50%"
      />
    </>
  );
}
