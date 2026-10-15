"use client";
import { useRef, useState, type CSSProperties } from "react";
import {
  CaseFigure,
  CaseResult,
  CaseRings,
  CaseZoom,
  Flow,
  num,
  PhoneFlow,
  STEP_COLORS,
  usePhone,
  useResize,
  useZoom,
  type CaseStep,
  type Curve,
} from "./CaseParts";
import DitherWord from "./DitherWord";

/** Step screens: the whole 1440×926 app screen, captured at 3× so zooming
 *  in (CaseFigure loads the full file then) stays sharp */
function step(
  name: string,
  file: string,
  desc: string,
  i: number,
): CaseStep {
  return {
    name,
    img: `/case1/${file}.webp`,
    w: 4320,
    h: 2778,
    // small UI text: 75 smears it
    quality: 90,
    desc,
    ...STEP_COLORS[i],
  };
}

/** The black box in front, then the three steps behind it */
const CARDS: CaseStep[] = [
  { name: "Black box", color: "var(--green-950)", fg: "var(--neutral-100)" },
  step(
    "Confirm data",
    "confirm-data",
    "Input client’s historical data to train the baseline model",
    0,
  ),
  step(
    "Set parameters",
    "set-parameters",
    "Map client knowledge to product language",
    2,
  ),
  step(
    "Select markets",
    "select-markets",
    "Review key metrics with clients and select markets collaboratively",
    1,
  ),
];
const N = CARDS.length;

/** Artboard units (1384-wide deck): each depth slot steps 56 right, 36 down.
 *  One curve from the bottom of the Select markets tab, wherever that card
 *  sits in the stack, to the result label's left edge. Drawn over the stack;
 *  CSS animates `d` alongside the cards. */
const EX = 480;
const MARKETS = N - 1;
function flow(d: number): Curve {
  const x = 952 + d * 56;
  const y = 640 + d * 36;
  return [
    [x, y],
    [x, y + 160],
    [EX, 830],
    [EX, 990],
  ];
}

/** Stacked (phones): the label starts 34.7% in */
const PHONE_EX = 0.347;

export default function CaseDeck() {
  const [active, setActive] = useState(0);
  const marketsFlow = flow((MARKETS - active + N) % N);
  const frame = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(350);
  // phones open a screen full size to read it
  const phone = usePhone();
  const zoom = useZoom();

  useResize([frame], () => setWidth(frame.current!.offsetWidth));

  // behind cards come forward; the front card hands over to the next step
  const pick = (i: number) => setActive((a) => (a === i ? (i + 1) % N : i));

  return (
    <>
      <div className="case-frame deck-frame" ref={frame}>
        <Flow
          curve={marketsFlow}
          glide
          className="case-flow deck-flow"
          viewBox="0 0 1384 990"
        />
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
                    <CaseFigure
                      className="deck-figure"
                      step={c}
                      alt={`${c.name} step, GeoLift no-code experimentation workflow`}
                      sizes="(min-width: 900px) 880px, 100vw"
                      phone={phone}
                      shown={front}
                      onEnlarge={(e) => {
                        // the card itself steps the deck on
                        e.stopPropagation();
                        zoom.open(c);
                      }}
                    />
                  ) : (
                    <div className="deck-face">
                      <div
                        className="deck-dither"
                        role="img"
                        aria-label="Boston, Baltimore, Providence"
                      >
                        <DitherWord word="Boston" seed={21} />
                        <DitherWord word="Baltimore" seed={7} />
                        <DitherWord word="Providence" seed={42} />
                      </div>
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
                  <span className="text-num">{num(i)}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <CaseZoom zoom={zoom} phone={phone} noun="step" className="deck-zoom" />

      <PhoneFlow width={width} ex={width * PHONE_EX} />

      <CaseResult
        className="deck-result"
        label="Increase in funding after MVP delivery"
        stat="50%"
      />
    </>
  );
}
