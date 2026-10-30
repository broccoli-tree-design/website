"use client";
import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import CasePortal, { type PortalStep } from "./CasePortal";
import { CaseTail, MODULES } from "./CaseParts";
import GlassCarousel, { type GlassDeck } from "./GlassCarousel";

type ModuleKey = keyof typeof MODULES;

/** A client's workflow: a brief, then the modules it is built from */
type Client = {
  label: string;
  /** the screens' file prefix */
  prefix: "new-client" | "return-client";
  eyebrow: string;
  /** the heading's emphasised words: "For a <em>new client</em>" */
  em: string;
  title: string;
  desc: string;
  /** the brief's fill, solid: deep green for Sales, ivory for Planners */
  tint: string;
  dark: boolean;
  steps: [ModuleKey, string][];
};


const CLIENTS: Record<"new" | "return", Client> = {
  new: {
    label: "Sales’ demo",
    prefix: "new-client",
    eyebrow: "For new client",
    em: "prospective client",
    title: "Buddhist art exhibition campaign Spring 2027",
    desc: "A sample exhibition campaign, from ideation to channel",
    tint: "var(--green-800)",
    dark: true,
    steps: [
      [
        "ideation",
        "Frame the brief: ticket goal, core visitors, KPIs, budget and run dates.",
      ],
      [
        "opportunity",
        "Show where the exhibition can stand out against the season’s other shows.",
      ],
      [
        "audience",
        "Size the core visitor audience and set the communication strategy.",
      ],
      [
        "attention",
        "Calculate how much attention visitors need before they book.",
      ],
      ["channel", "Turn attention into a channel mix and budget split."],
    ],
  },
  return: {
    label: "Planners’ work",
    prefix: "return-client",
    eyebrow: "For returning client",
    em: "returning client",
    title: "Outdoor backpack\nFall 2027\nChannel Plan",
    desc: "An existing retail campaign that only needs tweaks",
    tint: "var(--neutral-100)",
    dark: false,
    steps: [
      [
        "attention",
        "Recalculate attention levels for a brand hikers now recognize.",
      ],
      [
        "channel",
        "Move budget into retail and outdoor placements near trailheads and gear stores.",
      ],
    ],
  },
};

/** the carousel's card sizes: the focused card 55% of the screen, the sides
 *  cut off on both sides */
const CARD_SIZES = { sm: 461, big: 770, gap: 29 };

type ClientKey = keyof typeof CLIENTS;
const CLIENT_KEYS = ["new", "return"] as const;

const screen = (c: Client, key: ModuleKey) => ({
  src: `/case2/screens/${c.prefix}-${key}.webp`,
  w: 2144,
  h: 1064,
  quality: 90,
});

/** Sales' demo's five modules, for the portal's cards to become */
const PORTAL_STEPS: PortalStep[] = CLIENTS.new.steps.map(([key, desc], i) => ({
  key,
  num: `0${i + 1}`,
  name: MODULES[key],
  desc,
  img: screen(CLIENTS.new, key),
}));

/** A client's cards: one per module */
function decksFor(c: Client): GlassDeck[] {
  return c.steps.map(([key, desc], i) => ({
    name: MODULES[key],
    num: `0${i + 1}`,
    desc,
    img: {
      src: `/case2/screens/${c.prefix}-${key}.webp`,
      w: 2144,
      h: 1064,
      quality: 90,
    },
    alt: `${MODULES[key]} module, ${c.title.replace(/\n/g, " ")}`,
  }));
}

export default function CaseModules({ brief }: { brief: ReactNode }) {
  const [view, setView] = useState<ClientKey>("new");
  // the card in focus per client, kept while switching tabs
  const [focus, setFocus] = useState({ new: 0, return: 0 });
  const tabs = useRef<Record<ClientKey, HTMLButtonElement | null>>({
    new: null,
    return: null,
  });

  // arrow keys (either axis, the tabs stack on desktop and sit in a row on
  // phones), Home and End move between the tabs and open the one they land on
  const onTabKey = (e: KeyboardEvent) => {
    const i = CLIENT_KEYS.indexOf(view);
    const to =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? (i + 1) % 2
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? (i + 1) % 2
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? 1
              : -1;
    if (to < 0) return;
    e.preventDefault();
    setView(CLIENT_KEYS[to]);
    tabs.current[CLIENT_KEYS[to]]?.focus();
  };

  const client = CLIENTS[view];
  const landing = (
    <div className="cm-landing">
      <div className="cm-nav">
        <div
          role="tablist"
          aria-label="Workflows"
          className="cm-tabs"
          onKeyDown={onTabKey}
        >
          {CLIENT_KEYS.map((k) => (
            <button
              key={k}
              ref={(el) => {
                tabs.current[k] = el;
              }}
              type="button"
              role="tab"
              id={`cm-tab-${k}`}
              className="cm-tab"
              aria-selected={k === view}
              aria-controls="cm-panel"
              tabIndex={k === view ? 0 : -1}
              onClick={() => setView(k)}
            >
              {CLIENTS[k].label}
            </button>
          ))}
        </div>
      </div>
      <div
        id="cm-panel"
        role="tabpanel"
        aria-labelledby={`cm-tab-${view}`}
        className="cm-panel"
      >
        <div className="cm-head">
          <h3 className="cm-title">
            For a <em className={`is-${view}`}>{client.em}</em>
          </h3>
          <p className="cm-lede">{client.desc.replace("\n", " ")}</p>
        </div>
        <GlassCarousel
          key={view}
          decks={decksFor(client)}
          ratio={2144 / 1064}
          focus={focus[view]}
          onFocus={(i) => setFocus((f) => ({ ...f, [view]: i }))}
          noun="module"
          zoomClass="gc-zoom gc-zoom-card"
          sizes={CARD_SIZES}
        />
      </div>
    </div>
  );

  return (
    <>
      <CasePortal
        steps={PORTAL_STEPS}
        landing={landing}
        onLanded={(on) => {
          // back to Sales' demo's first card for the portal's cards to take
          // over from
          if (!on) {
            setView("new");
            setFocus({ new: 0, return: 0 });
          }
        }}
      />

      <CaseTail className="mod-result" label="User base grew" stat="400%">
        {brief}
      </CaseTail>
    </>
  );
}
