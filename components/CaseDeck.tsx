"use client";
import { useState, type ReactNode } from "react";
import BlackBox, { type BoxStep } from "./BlackBox";
import { CaseTail } from "./CaseParts";
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

/** The three steps, as glass cards in a row */
const DECKS: GlassDeck[] = [
  {
    name: "Confirm data",
    num: "01",
    desc: "Input client’s historical data to train the baseline model",
    img: shot("confirm-data"),
  },
  {
    name: "Set parameters",
    num: "02",
    desc: "Map client knowledge to product language",
    img: shot("set-parameters"),
  },
  {
    name: "Select markets",
    num: "03",
    desc: "Review key metrics with clients and select markets collaboratively",
    img: shot("select-markets"),
  },
].map((d) => ({
  ...d,
  alt: d.img ? `${d.name} step, GeoLift no-code experimentation workflow` : "",
}));

/** The three steps, for the black box's faces */
const STEPS: BoxStep[] = DECKS.filter((d) => d.img).map((d) => ({
  num: d.num,
  name: d.name,
  desc: d.desc ?? "",
  img: d.img!,
  alt: d.alt ?? "",
}));

export default function CaseDeck({ brief }: { brief: ReactNode }) {
  const [focus, setFocus] = useState(0);
  const deckView = (decks: GlassDeck[]) => (
    <GlassCarousel
      decks={decks}
      ratio={1440 / 926}
      focus={focus}
      onFocus={setFocus}
      noun="step"
      zoomClass="gc-zoom gc-zoom-screen"
    />
  );
  return (
    <>
      <BlackBox
        steps={STEPS}
        landing={deckView(DECKS)}
        onLanded={(on) => !on && setFocus(0)}
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
