"use client";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { GlassCaption } from "./GlassCarousel";

/** Case 2's first view: the client portal, abstracted. A dark "Daily
 *  operations workspace" holds the thirteen apps as pills, joined by a dashed
 *  "Shared data" link to the "Client portal", whose stage columns hold the
 *  modules as skeleton cards. Only five carry names (the ones Sales' demo
 *  walks through), so it shows how many modules there are without giving the
 *  screens away.
 *
 *  Scrolling through the section opens it, the way BlackBox does (a tall
 *  section, a sticky stage, the page's own scroll, so it runs backwards when
 *  scrolled back): the workspace slides away, the unnamed cards fade, and the
 *  five named cards lift out of their columns and become the carousel's glass
 *  cards, measured from the carousel (`landing`) laid out, hidden, beneath
 *  them. Once they have landed the carousel takes over. Reduced motion, and
 *  phones for now, show the carousel with no portal. */

export type PortalStep = {
  /** a module's key in MODULES */
  key: string;
  num: string;
  name: string;
  desc: string;
  img: { src: string; w: number; h: number; quality?: number };
};

const APPS = [
  "Consumer insights app",
  "Audience data app",
  "Brand tracking app",
  "Cross channel planning app",
  "Cultural trends app",
  "Media consumption app",
  "Investment planning app",
  "Taxonomy app",
  "Optimization app",
  "Social listening app",
  "Creative library app",
  "Flighting app",
  "Budget management app",
];

/** The portal's campaign-stage columns and their cards: a module's key, or
 *  an unnamed skeleton */
const COLS: { name: string; cards: (string | null)[] }[] = [
  { name: "Pitch", cards: ["ideation", "opportunity", null] },
  { name: "Audience", cards: ["audience", null] },
  { name: "Plan", cards: ["attention", "channel"] },
  { name: "Activate", cards: [null, null, null] },
  { name: "Optimize", cards: [null] },
];
const COL_W = 130;
const COL_PITCH = 152;
const CARD_H = 82;
const CARD_PITCH = 98;
const COL_X = 570;

/** the motion plays out over the first 80% of the scroll; the carousel takes
 *  over a little after, so its cards can be used well before the section
 *  ends */
const RUN = 0.8;
const DONE = 0.84;

const clamp = (v: number) => Math.min(1, Math.max(0, v));
/** 0→1 as p goes from a to b, eased in and out */
const span = (p: number, a: number, b: number) => {
  const t = clamp((p - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** a length in the artboard's units */
const u = (n: number) => `calc(${n} * var(--u))`;

type Rect = { x: number; y: number; w: number; h: number };
type End = Rect & { r: number; far: boolean };

function Skeleton({ name }: { name?: string }) {
  return (
    <>
      <div className="cp-top">
        <span className="cp-ico" />
        {name ? <b>{name}</b> : <span className="cp-bar is-name" />}
      </div>
      <div className="cp-bars">
        <span className="cp-bar" style={{ width: "82%" }} />
        <span className="cp-bar" style={{ width: "54%" }} />
      </div>
    </>
  );
}

export default function CasePortal({
  steps,
  landing,
  onLanded,
}: {
  /** the five modules of Sales' demo, in order */
  steps: PortalStep[];
  /** the glass carousel of the same steps, for the cards to land in */
  landing: ReactNode;
  /** called as the carousel takes over (true) and hands back (false) */
  onLanded?: (landed: boolean) => void;
}) {
  const section = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const land = useRef<HTMLDivElement>(null);
  const slots = useRef<Record<string, HTMLDivElement | null>>({});
  const flyers = useRef<(HTMLDivElement | null)[]>([]);
  const [landed, setLanded] = useState(false);
  const cb = useRef(onLanded);
  useEffect(() => {
    cb.current = onLanded;
  });

  useEffect(() => {
    const sec = section.current!;
    const stg = stage.current!;
    const still = matchMedia("(prefers-reduced-motion: reduce)");
    const narrow = matchMedia("(max-width: 899.98px)");
    const flat = () => still.matches || narrow.matches;

    let shown = 0;
    let raf = 0;
    let running = false;
    // unknown until the first draw, so it sets the stage's state afresh
    let done: boolean | null = null;
    let starts: Rect[] = [];
    let ends: End[] = [];

    const rel = (r: DOMRect, o: DOMRect): Rect => ({
      x: r.left - o.left,
      y: r.top - o.top,
      w: r.width,
      h: r.height,
    });

    // where each card starts (its column) and where it lands (the carousel's
    // glass cards, laid out but hidden until they have)
    const measure = () => {
      const o = stg.getBoundingClientRect();
      starts = steps.map((s) => {
        const el = slots.current[s.key];
        return el ? rel(el.getBoundingClientRect(), o) : { x: 0, y: 0, w: 0, h: 0 };
      });
      const decks = land.current?.querySelectorAll<HTMLElement>(".gc-deck");
      ends = [...(decks ?? [])].map((d) => {
        const g = d.querySelector<HTMLElement>(".gc-glass") ?? d;
        return {
          ...rel(g.getBoundingClientRect(), o),
          r: parseFloat(getComputedStyle(g).borderTopLeftRadius) || 0,
          far:
            d.classList.contains("is-far") &&
            getComputedStyle(d).opacity === "0",
        };
      });
    };

    const target = () => {
      if (flat()) return 1;
      const r = sec.getBoundingClientRect();
      const run = r.height - innerHeight;
      return run > 0 ? clamp(-r.top / run) : 1;
    };

    const draw = (raw: number) => {
      const p = clamp(raw / RUN);
      if (!done) measure();
      const light = span(p, 0.5, 0.78);
      // the workspace slides away, the rest of the portal lets go
      stg.style.setProperty("--ws", String(span(p, 0.04, 0.4)));
      stg.style.setProperty("--link", String(span(p, 0.04, 0.24)));
      stg.style.setProperty("--rest", String(span(p, 0.14, 0.5)));
      stg.style.setProperty("--panel", String(span(p, 0.4, 0.72)));
      stg.style.setProperty("--cue", String(1 - span(p, 0, 0.05)));
      stg.style.setProperty("--chrome", String(span(p, 0.74, 0.96)));
      stg.classList.add("is-ready");
      stg.classList.toggle("is-moving", p > 0.05);

      steps.forEach((_, i) => {
        const el = flyers.current[i];
        const a = starts[i];
        const b = ends[i];
        if (!el || !a || !b) return;
        const t = span(p, 0.2 + 0.035 * i, 0.74);
        const lift = Math.sin(Math.PI * t) * 22;
        el.style.transform = `translate(${mix(a.x, b.x, t)}px, ${mix(a.y, b.y, t) - lift}px)`;
        el.style.width = `${mix(a.w, b.w, t)}px`;
        el.style.height = `${mix(a.h, b.h, t)}px`;
        el.style.borderRadius = `${mix(8, b.r, t)}px`;
        el.style.setProperty("--light", String(light));
        // a card the carousel keeps out of sight fades on its way there
        el.style.opacity = b.far ? String(1 - span(p, 0.4, 0.66)) : "";
      });

      if (done !== raw >= DONE) {
        done = raw >= DONE;
        stg.classList.toggle("is-landed", done);
        setLanded(done);
        if (!done) {
          const gc = land.current?.querySelector(".gc");
          if (gc) gc.scrollLeft = 0;
        }
        cb.current?.(done);
      }
    };

    const tick = () => {
      const p = target();
      shown += (p - shown) * (flat() ? 1 : 0.14);
      if (Math.abs(p - shown) < 0.0005) shown = p;
      draw(shown);
      raf = running ? requestAnimationFrame(tick) : 0;
    };

    // run only while the section is on screen
    const io = new IntersectionObserver(([e]) => {
      running = e.isIntersecting;
      if (running && !raf) raf = requestAnimationFrame(tick);
    });
    io.observe(sec);
    shown = target();
    draw(shown);
    const onResize = () => {
      shown = target();
      draw(shown);
    };
    addEventListener("resize", onResize);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      removeEventListener("resize", onResize);
    };
  }, [steps]);

  const openPortal = () => {
    const r = section.current!.getBoundingClientRect();
    scrollTo({
      top: scrollY + r.top + r.height - innerHeight,
      behavior: "smooth",
    });
  };

  return (
    <div ref={section} className="cm-scene">
      <div ref={stage} className="cm-stage">
        <div ref={land} className="cm-view" inert={!landed}>
          {landing}
        </div>

        <div className="cm-portal" aria-hidden="true">
          <div className="cp">
            <div className="cp-ws">
              <span className="cp-tag">Daily operations workspace</span>
              {APPS.map((name, i) => {
                const right = i % 2 === 1;
                return (
                  <span
                    key={name}
                    className="cp-chip"
                    style={{
                      left: u(right ? 200 : 16),
                      top: u(64 + Math.floor(i / 2) * 58 + (right ? 29 : 0)),
                    }}
                  >
                    {name}
                  </span>
                );
              })}
            </div>
            <div className="cp-link">
              <span className="cp-link-label">Shared data</span>
            </div>
            <div className="cp-panel">
              <span className="cp-tag">Client portal</span>
            </div>
            {COLS.map((c, ci) => (
              <span
                key={c.name}
                className="cp-head"
                style={{ left: u(COL_X + ci * COL_PITCH), width: u(COL_W) }}
              >
                {c.name}
              </span>
            ))}
            {COLS.flatMap((c, ci) =>
              c.cards.map((key, ri) => (
                <div
                  key={`${ci}-${ri}`}
                  ref={(el) => {
                    if (key) slots.current[key] = el;
                  }}
                  className={`cp-card${key ? " is-named" : ""}`}
                  style={{
                    left: u(COL_X + ci * COL_PITCH),
                    top: u(110 + ri * CARD_PITCH),
                    width: u(COL_W),
                    height: u(CARD_H),
                  }}
                >
                  <Skeleton
                    name={steps.find((s) => s.key === key)?.name}
                  />
                </div>
              )),
            )}
          </div>
        </div>

        <div className="cm-flyers" aria-hidden="true">
          {steps.map((s, i) => (
            <div
              key={s.key}
              ref={(el) => {
                flyers.current[i] = el;
              }}
              className={`gc-glass cp-fly${i === 0 ? " is-first" : ""}`}
              style={{ "--light": 0 } as CSSProperties}
            >
              <div className="gc-shot">
                <Image
                  src={s.img.src}
                  alt=""
                  width={s.img.w}
                  height={s.img.h}
                  quality={s.img.quality}
                  sizes="(min-width: 900px) 40vw, 90vw"
                />
              </div>
              <div className="cp-skel">
                <Skeleton name={s.name} />
              </div>
              <div className="cp-cap">
                <GlassCaption num={s.num} name={s.name} desc={s.desc} />
              </div>
            </div>
          ))}
        </div>

        <p className="cm-sr">
          The client portal, abstracted: a daily operations workspace of
          thirteen apps and a client portal of modules in the stages Pitch,
          Audience, Plan, Activate and Optimize, joined by shared data. Scrolling
          opens the portal into Sales’ demo and Planners’ work, below.
        </p>
        <div className="cm-cue">
          <button type="button" onClick={openPortal}>
            Scroll to open
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 9l7 7 7-7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
