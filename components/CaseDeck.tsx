"use client";
import { useState, type ReactNode } from "react";
import { CaseTail } from "./CaseParts";
import DitherWord from "./DitherWord";
import GlassCarousel, { type GlassDeck } from "./GlassCarousel";

/** Step screens: the whole 1440×926 app screen, captured at 3× so zooming
 *  in stays sharp */
const shot = (file: string) => ({
  src: `/case1/${file}.webp`,
  w: 4320,
  h: 2778,
  // small UI text: 75 smears it
  quality: 90,
});

const tint = (color: string, pct: number) =>
  `color-mix(in srgb, ${color} ${pct}%, transparent)`;

/** The black box first, then the three steps, as glass decks in a row */
const DECKS: GlassDeck[] = [
  {
    name: "Black box",
    num: "",
    tint: "var(--green-950)",
    solid: true,
    dark: true,
    body: (
      <>
        <div
          className="deck-dither"
          role="img"
          aria-label="Boston, Baltimore, Providence"
        >
          <DitherWord word="Boston" seed={21} />
          <DitherWord word="Baltimore" seed={7} />
          <DitherWord word="Providence" seed={42} />
        </div>
        <span className="text-label gc-question">
          Why these campaign markets?
        </span>
      </>
    ),
  },
  {
    name: "Confirm data",
    num: "01",
    desc: "Input client’s historical data to train the baseline model",
    tint: tint("var(--green-300)", 22),
    img: shot("confirm-data"),
  },
  {
    name: "Set parameters",
    num: "02",
    desc: "Map client knowledge to product language",
    tint: tint("var(--neutral-200)", 45),
    img: shot("set-parameters"),
  },
  {
    name: "Select markets",
    num: "03",
    desc: "Review key metrics with clients and select markets collaboratively",
    tint: tint("var(--orange-400)", 13),
    img: shot("select-markets"),
  },
].map((d) => ({
  ...d,
  alt: d.img ? `${d.name} step, GeoLift no-code experimentation workflow` : "",
}));

export default function CaseDeck({ brief }: { brief: ReactNode }) {
  const [focus, setFocus] = useState(0);
  return (
    <>
      <GlassCarousel
        className="deck-carousel"
        decks={DECKS}
        ratio={1440 / 926}
        focus={focus}
        onFocus={setFocus}
        noun="step"
        roomy
        zoomClass="gc-zoom gc-zoom-screen"
      />

      <CaseTail
        className="deck-result"
        label="Increase in funding after MVP delivery"
        stat="50%"
      >
        {brief}
      </CaseTail>
    </>
  );
}
