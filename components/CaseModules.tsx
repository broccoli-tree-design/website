"use client";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import CaseArchitecture from "./CaseArchitecture";
import {
  CaseResult,
  CaseRings,
  num,
  PhoneFlow,
  type CaseStep,
} from "./CaseParts";

/** Each module's tab colours, wherever it is used */
const MODULE = {
  ideation: {
    name: "Ideation",
    color: "var(--neutral-200)",
    fg: "var(--green-900)",
  },
  opportunity: {
    name: "Opportunity",
    color: "var(--green-600)",
    fg: "var(--neutral-100)",
  },
  audience: {
    name: "Audience",
    color: "var(--green-300)",
    fg: "var(--green-900)",
  },
  attention: {
    name: "Attention",
    color: "var(--green-800)",
    fg: "var(--neutral-100)",
  },
  channel: {
    name: "Channel",
    color: "var(--orange-400)",
    fg: "var(--green-900)",
  },
};
type ModuleKey = keyof typeof MODULE;

/** The client view in front, then the modules its workflow is built from */
type Client = {
  label: string;
  eyebrow: string;
  title: string;
  desc: string;
  /** the item open on first view: 0 is the client view */
  open: number;
  steps: CaseStep[];
};

const CLIENT_VIEW = {
  name: "Client view",
  color: "var(--neutral-100)",
  fg: "var(--green-900)",
};

/** Module screens: the 1072×532 product card, captured at 2× */
function steps(
  prefix: string,
  mods: [ModuleKey, string][],
): CaseStep[] {
  return [
    CLIENT_VIEW,
    ...mods.map(([key, desc]) => ({
      ...MODULE[key],
      img: `/case2/${prefix}-${key}.webp`,
      w: 2144,
      h: 1064,
      desc,
    })),
  ];
}

const CLIENTS: Record<"new" | "return", Client> = {
  new: {
    label: "New client",
    eyebrow: "Product demo · Sales",
    title: "Raphael exhibition campaign Spring 2027",
    desc: "Sales walks a prospective museum client through a sample exhibition campaign, from brief to channel mix.",
    open: 2,
    steps: steps("new-client", [
      [
        "ideation",
        "Frame the brief: ticket goal, core visitors, KPIs, budget and run dates.",
      ],
      [
        "opportunity",
        "Show where the exhibition can stand out against the season's other shows.",
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
    ]),
  },
  return: {
    label: "Return client",
    eyebrow: "Campaign revisit · Planner",
    title: "Outdoor backpack\nFall 2027\nChannel Plan",
    desc: "A backpack brand returns after its spring campaign with results in hand.\nThe strategy and audience are already set, so Planners update attention targets and rebalance channels for the next flight.",
    open: 0,
    steps: steps("return-client", [
      [
        "attention",
        "Recalculate attention levels for a brand hikers now recognise.",
      ],
      [
        "channel",
        "Move budget into retail and outdoor placements near trailheads and gear stores.",
      ],
    ]),
  },
};

type View = "arch" | keyof typeof CLIENTS;
const VIEWS: [View, string][] = [
  ["arch", "Architecture"],
  ["new", CLIENTS.new.label],
  ["return", CLIENTS.return.label],
];

const DESKTOP = "(min-width: 900px)";
const TAB = 84; // collapsed tab width, matches .mod-item
const ARTBOARD = 1384; // the frame's width at the 1440 column

/** One curve from the open tab's centre (or the frame's, with no tabs)
 *  down to the result label's start. The centre comes from the layout rule
 *  (collapsed 84px, open tab takes the rest), so the path lands where the
 *  flex transition ends and CSS animates `d` there. */
function desktopFlow(w: number, ex: number, n: number, active: number) {
  const open = w - (n - 1) * TAB;
  const cx = (n ? Math.max(active, 0) * TAB + open / 2 : w / 2).toFixed(1);
  return `M ${cx} 0 C ${cx} 110, ${ex} 60, ${ex} 170`;
}

export default function CaseModules() {
  const [view, setView] = useState<View>("new");
  // the open item per client, kept while switching tabs
  const [openBy, setOpenBy] = useState({
    new: CLIENTS.new.open,
    return: CLIENTS.return.open,
  });
  const [width, setWidth] = useState(ARTBOARD);
  const [labelX, setLabelX] = useState(1000); // label's left edge in track space
  // phones open a screen full size to read it
  const [phone, setPhone] = useState(false);
  const [zoomed, setZoomed] = useState<CaseStep | null>(null);
  const track = useRef<HTMLDivElement>(null);
  const result = useRef<HTMLDivElement>(null);
  const zoom = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = track.current;
    const res = result.current;
    if (!el || !res) return;
    // the result block's width follows the 400% (and its font loading)
    const measure = () => {
      const t = el.getBoundingClientRect();
      setWidth(t.width);
      setLabelX(Math.round(res.getBoundingClientRect().left - t.left));
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    ro.observe(res);
    // desktop always has one item open
    const mq = matchMedia(DESKTOP);
    const onChange = () => {
      setPhone(!mq.matches);
      if (!mq.matches) return;
      zoom.current?.close();
      setOpenBy((o) => ({
        new: o.new < 0 ? 0 : o.new,
        return: o.return < 0 ? 0 : o.return,
      }));
    };
    setPhone(!mq.matches);
    mq.addEventListener("change", onChange);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", onChange);
    };
  }, []);

  const client = view === "arch" ? null : CLIENTS[view];
  const items = client?.steps ?? [];
  const active = view === "arch" ? -1 : openBy[view];
  const flow = desktopFlow(width, labelX, items.length, active);

  const enlarge = (m: CaseStep) => {
    setZoomed(m);
    zoom.current?.showModal();
  };

  // desktop opens; mobile toggles, so tapping the open row closes it
  const toggle = (i: number) => {
    if (view === "arch") return;
    setOpenBy((o) => ({
      ...o,
      [view]: o[view] === i && !matchMedia(DESKTOP).matches ? -1 : i,
    }));
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
        className="case-frame case-frame-2 mod-frame"
        id="view-panel"
        role="tabpanel"
        aria-labelledby={`view-tab-${view}`}
      >
        <CaseRings />
        <div
          className={`mod-track${client ? "" : " arch-track"}`}
          ref={track}
        >
          {!client && (
            <CaseArchitecture
              scale={width / ARTBOARD}
              rows={(["new", "return"] as const).map((v) => ({
                label: CLIENTS[v].label,
                steps: CLIENTS[v].steps,
                onOpen: () => setView(v),
              }))}
            />
          )}
          {client &&
            items.map((m, i) => {
              const open = i === active;
              return (
                <div
                  key={`${view}-${m.name}`}
                  className={`mod-item${open ? " is-open" : ""}${
                    m.img ? "" : " mod-client"
                  }`}
                  style={{ "--c": m.color, "--fg": m.fg } as CSSProperties}
                >
                  <button
                    type="button"
                    id={`mod-tab-${i}`}
                    className="case-tab mod-tab"
                    aria-expanded={open}
                    aria-controls={`mod-panel-${i}`}
                    onClick={() => toggle(i)}
                  >
                    <span className="text-num mod-num">{num(i)}</span>
                    <span className="case-name mod-name">{m.name}</span>
                    <span className="mod-sign" aria-hidden="true">
                      {open ? "–" : "+"}
                    </span>
                  </button>
                  <div
                    id={`mod-panel-${i}`}
                    className="mod-panel"
                    role="region"
                    aria-labelledby={`mod-tab-${i}`}
                    hidden={!open}
                  >
                    {m.img ? (
                      <div className="mod-stage">
                        <figure className="mod-figure">
                          {phone ? (
                            <button
                              type="button"
                              className="mod-enlarge"
                              onClick={() => enlarge(m)}
                              aria-haspopup="dialog"
                            >
                              <Image
                                src={m.img}
                                alt={`${m.name} module, ${client.title.replace(/\n/g, " ")}`}
                                width={m.w}
                                height={m.h}
                                sizes="100vw"
                              />
                              <span className="mod-enlarge-hint">
                                Tap to enlarge
                              </span>
                            </button>
                          ) : (
                            <Image
                              src={m.img}
                              alt={`${m.name} module, ${client.title.replace(/\n/g, " ")}`}
                              width={m.w}
                              height={m.h}
                              sizes="(min-width: 900px) 920px, 100vw"
                            />
                          )}
                          <figcaption className="mod-desc">{m.desc}</figcaption>
                        </figure>
                      </div>
                    ) : (
                      <div className="mod-client-view">
                        <div className="mod-client-head">
                          <span className="text-label">{client.eyebrow}</span>
                          <span className="text-title mod-client-title">
                            {client.title}
                          </span>
                          <p className="mod-client-desc">{client.desc}</p>
                        </div>
                        <ol className="mod-client-list">
                          {items.slice(1).map((s, j) => (
                            <li key={s.name}>
                              <span className="text-num">{num(j + 1)}</span>
                              {s.name}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* phones: one screen at full size, scrolled sideways */}
      <dialog
        className="mod-zoom"
        ref={zoom}
        aria-label={zoomed ? `${zoomed.name} module, full size` : undefined}
        onClose={() => setZoomed(null)}
        onClick={(e) => e.target === e.currentTarget && zoom.current?.close()}
      >
        <div className="mod-zoom-bar">
          <span className="case-name">{zoomed?.name}</span>
          <button
            type="button"
            className="mod-zoom-close"
            onClick={() => zoom.current?.close()}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        {zoomed?.img && (
          <div className="mod-zoom-scroll">
            <Image
              src={zoomed.img}
              alt={`${zoomed.name} module, full size`}
              width={zoomed.w}
              height={zoomed.h}
              sizes="1072px"
            />
          </div>
        )}
        <p className="mod-zoom-desc">{zoomed?.desc}</p>
      </dialog>

      <svg
        className="case-flow mod-flow-desktop"
        viewBox={`0 0 ${width} 170`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d={flow} style={{ d: `path("${flow}")` } as CSSProperties} />
      </svg>
      {/* the label starts mid-screen, so start right of it for a curve */}
      <PhoneFlow width={width} ex={labelX} from={0.75} />

      <CaseResult
        className="mod-result"
        ref={result}
        label="User base grew"
        stat="400%"
      />
    </>
  );
}
