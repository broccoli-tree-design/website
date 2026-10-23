"use client";
import { useState, type ReactNode } from "react";
import CaseArchitecture from "./CaseArchitecture";
import { CaseTail, MODULES } from "./CaseParts";
import GlassCarousel, { type GlassDeck } from "./GlassCarousel";

const tint = (color: string, pct: number) =>
  `color-mix(in srgb, ${color} ${pct}%, transparent)`;

/** Each module's glass tint, wherever it is used: the same colour in both
 *  workflows and on the board */
const MODULE_TINT = {
  ideation: tint("var(--neutral-200)", 45),
  opportunity: tint("var(--green-600)", 22),
  audience: tint("var(--green-300)", 28),
  attention: tint("var(--green-800)", 22),
  channel: tint("var(--orange-400)", 16),
};
type ModuleKey = keyof typeof MODULE_TINT;

/** A client's workflow: a brief, then the modules it is built from */
type Client = {
  label: string;
  /** the screens' file prefix */
  prefix: "new-client" | "return-client";
  eyebrow: string;
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
    title: "Buddhist art exhibition campaign Spring 2027",
    desc: "Sales walks a prospective museum client through a sample exhibition campaign, from brief to channel mix.",
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
    title: "Outdoor backpack\nFall 2027\nChannel Plan",
    desc: "A backpack brand returns after its spring campaign with results in hand.\nThe strategy and audience are already set, so Planners update attention targets and rebalance channels for the next flight.",
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

type ClientKey = keyof typeof CLIENTS;
type View = "arch" | ClientKey;
const VIEWS: [View, string][] = [
  ["arch", "Architecture"],
  ["new", CLIENTS.new.label],
  ["return", CLIENTS.return.label],
];

/** A client's decks: the brief in front, then a deck per module */
function decksFor(c: Client): GlassDeck[] {
  return [
    {
      name: c.label,
      num: "",
      tint: c.tint,
      dark: c.dark,
      body: (
        <div className="gc-client">
          <span className="text-label">{c.eyebrow}</span>
          <span className="text-title gc-client-title">{c.title}</span>
          <p className="gc-client-desc">{c.desc}</p>
        </div>
      ),
    },
    ...c.steps.map(([key, desc], i) => ({
      name: MODULES[key],
      num: `0${i + 1}`,
      desc,
      tint: MODULE_TINT[key],
      img: {
        src: `/case2/screens/${c.prefix}-${key}.webp`,
        w: 2144,
        h: 1064,
        quality: 90,
      },
      alt: `${MODULES[key]} module, ${c.title.replace(/\n/g, " ")}`,
    })),
  ];
}

export default function CaseModules({ brief }: { brief: ReactNode }) {
  const [view, setView] = useState<View>("arch");
  // the deck in focus per client, kept while switching tabs
  const [focus, setFocus] = useState({ new: 0, return: 0 });

  const open = (client: ClientKey, deck: number) => {
    setFocus((f) => ({ ...f, [client]: deck }));
    setView(client);
  };

  return (
    <>
      <div className="view-tabs" role="tablist" aria-label="Case study views">
        {VIEWS.map(([v, label]) => (
          <button
            key={v}
            type="button"
            role="tab"
            id={`view-tab-${v}`}
            className="view-tab"
            aria-selected={v === view}
            aria-controls="view-panel"
            onClick={() => setView(v)}
          >
            {label}
          </button>
        ))}
      </div>

      <div
        id="view-panel"
        role="tabpanel"
        aria-labelledby={`view-tab-${view}`}
        className="gc-panel"
      >
        {view === "arch" ? (
          <CaseArchitecture
            rows={(["new", "return"] as const).map((k) => ({
              label: CLIENTS[k].label,
              onOpen: () => open(k, 0),
              steps: CLIENTS[k].steps.map(([key], i) => ({
                key,
                name: MODULES[key],
                thumb: `/case2/thumbs/${CLIENTS[k].prefix}-${key}.webp`,
                tint: MODULE_TINT[key],
                onOpen: () => open(k, i + 1),
              })),
            }))}
          />
        ) : (
          <GlassCarousel
            key={view}
            className="mod-carousel"
            decks={decksFor(CLIENTS[view])}
            ratio={2144 / 1064}
            focus={focus[view]}
            onFocus={(i) => setFocus((f) => ({ ...f, [view]: i }))}
            noun="module"
            roomy
            zoomClass="gc-zoom gc-zoom-card"
          />
        )}
      </div>

      <CaseTail className="mod-result" label="User base grew" stat="400%">
        {brief}
      </CaseTail>
    </>
  );
}
