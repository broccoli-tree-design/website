"use client";
import { useEffect, useState, type ReactNode } from "react";
import BlackBox, { type BoxStep } from "./BlackBox";
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
      <div className="gc-carton">
        <span className="gc-fold" aria-hidden="true" />
        <span className="gc-tape" aria-hidden="true" />
        <div
          className="deck-dither"
          role="img"
          aria-label="Boston, Baltimore, Providence"
        >
          <DitherWord word="Boston" seed={21} />
          <DitherWord word="Baltimore" seed={7} />
          <DitherWord word="Providence" seed={42} />
        </div>
        <div className="gc-sticker">
          <span className="text-label gc-question">
            Why these campaign markets?
          </span>
        </div>
      </div>
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
  // prototype: the black box in place of the carousel; ?deck shows the
  // carousel with the carton deck again, to compare
  const [deck, setDeck] = useState(false);
  useEffect(() => {
    setDeck(new URLSearchParams(location.search).has("deck"));
  }, []);
  const deckView = (decks: GlassDeck[], bare = false) => (
    <GlassCarousel
      decks={decks}
      ratio={1440 / 926}
      focus={focus}
      onFocus={setFocus}
      noun="step"
      roomy
      bare={bare}
      zoomClass="gc-zoom gc-zoom-screen"
    />
  );
  return (
    <>
      {deck ? (
        deckView(DECKS)
      ) : (
        <BlackBox
          steps={STEPS}
          landing={deckView(DECKS.slice(1), true)}
          onLanded={(on) => !on && setFocus(0)}
        />
      )}

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
