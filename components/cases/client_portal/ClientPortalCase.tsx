"use client";
import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { CaseTail } from "../shared/CaseTail";
import GlassCarousel, { type GlassSlide } from "../shared/GlassCarousel";
import ClientPortal, { type PortalStep } from "./ClientPortal";
import { MODULES } from "./modules";

type ModuleKey = keyof typeof MODULES;

/** A client's workflow: a brief, then the modules it is built from */
type Client = {
  label: string;
  /** the screens' file prefix */
  prefix: "new-client" | "return-client";
  /** the heading's emphasised words: "For a <em>new client</em>" */
  em: string;
  title: string;
  desc: string;
  steps: [ModuleKey, string][];
};


const CLIENTS: Record<"new" | "return", Client> = {
  new: {
    label: "Sales’ demo",
    prefix: "new-client",
    em: "prospective client",
    title: "Buddhist art exhibition campaign Spring 2027",
    desc: "Sales demos a sample exhibition campaign, from ideation to channel",
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
    em: "returning client",
    title: "Outdoor backpack\nFall 2027\nChannel Plan",
    desc: "Planner tweaks an existing retail campaign based on performance",
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

/** the carousel's card sizes: the focused card 60% of the screen, the sides
 *  cut off on both sides */
const CARD_SIZES = { sm: 520, big: 860, gap: 32 };

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
function slidesFor(c: Client): GlassSlide[] {
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

export default function ClientPortalCase({ brief }: { brief: ReactNode }) {
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
          slides={slidesFor(client)}
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
      <ClientPortal
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

      <CaseTail className="cm-result" label="User base grew" stat="400%">
        {brief}
      </CaseTail>
    </>
  );
}
