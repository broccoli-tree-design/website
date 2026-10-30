"use client";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { GlassCaption } from "./GlassCarousel";
import CaseWorkspace, { u } from "./CaseWorkspace";

/** Case 2's first view: the client portal, abstracted. A dark "Daily
 *  operations workspace" holds the apps and the loose work around them,
 *  joined by two dotted arcs ("Shared data") to the "Client portal", whose
 *  stage columns hold the modules as skeleton cards. Only five carry names (the ones Sales' demo
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

/** The portal's campaign-stage columns and their cards: a module's key, or
 *  an unnamed skeleton */
const COLS: { name: string; cards: (string | null)[] }[] = [
  { name: "Brief", cards: ["ideation", "opportunity", null] },
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

/** the motion plays out over the first 80% of the scroll (RUN); its own
 *  progress p runs 0→1 over that. The cards are in place by 0.7 and the
 *  carousel crossfades in over them at DONE, so there is no stretch of
 *  finished-looking cards that cannot be used */
const RUN = 0.8;
const DONE = 0.72;
/** how far into its opening the pointer carries the portal */
const PEEK = 0.16;

const clamp = (v: number) => Math.min(1, Math.max(0, v));
/** 0→1 as p goes from a to b, eased in and out */
const span = (p: number, a: number, b: number) => {
  const t = clamp((p - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

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

/** The portal as a still picture, stacked, for phones and tablets (and
 *  reduced motion): the workspace, the shared data joining it, and the
 *  portal's stages as rows of cards. Hidden on desktop, where the scroll
 *  opens the real one. */
function PortalStill({ steps }: { steps: PortalStep[] }) {
  return (
    <div className="cps" aria-hidden="true">
      <div className="cps-ws">
        <span className="cp-tag">Daily operations workspace</span>
        <CaseWorkspace />
      </div>
      <div className="cps-link">
        <svg viewBox="0 0 60 88">
          <path d="M24 0C6 24 6 64 24 88" />
          <path d="M38 0C20 24 20 64 38 88" />
        </svg>
        <span>Shared data</span>
      </div>
      <div className="cps-panel">
        <span className="cps-tag">Client portal</span>
        {COLS.map((c) => (
          <div className="cps-stage" key={c.name}>
            <span className="cps-head">{c.name}</span>
            <div className="cps-row">
              {c.cards.map((key, i) => (
                <div className="cps-card" key={i}>
                  <Skeleton name={steps.find((s) => s.key === key)?.name} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
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
  const slotsPhone = useRef<Record<string, HTMLDivElement | null>>({});
  const flyers = useRef<(HTMLDivElement | null)[]>([]);
  const hovered = useRef(false);
  const [landed, setLanded] = useState(false);
  const cb = useRef(onLanded);
  useEffect(() => {
    cb.current = onLanded;
  });

  useEffect(() => {
    const sec = section.current!;
    const stg = stage.current!;
    const still = matchMedia("(prefers-reduced-motion: reduce)");
    // phones have the portal stacked, with its own cards to start from
    const phone = matchMedia("(max-width: 640px)");
    const flat = () => still.matches;

    let shown = 0;
    let peek = 0; // the pointer on the portal, easing 0→1
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
        const el = (phone.matches ? slotsPhone.current : slots.current)[s.key];
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
      // under the pointer the portal plays the first stretch of its opening,
      // and settles back; the cue and the stage's state follow the scroll alone
      const base = clamp(raw / RUN);
      const p = Math.max(base, peek * PEEK);
      if (!done) measure();
      const light = span(p, 0.4, 0.7);
      // the workspace slides away, the rest of the portal lets go
      stg.style.setProperty("--ws", String(span(p, 0.04, 0.4)));
      stg.style.setProperty("--link", String(span(p, 0.04, 0.24)));
      stg.style.setProperty("--rest", String(span(p, 0.14, 0.5)));
      stg.style.setProperty("--panel", String(span(p, 0.4, 0.72)));
      stg.style.setProperty("--cue", String(1 - span(base, 0, 0.05)));
      stg.style.setProperty("--chrome", String(span(p, 0.5, 0.7)));
      stg.classList.add("is-ready");
      stg.classList.toggle("is-moving", base > 0.05);

      steps.forEach((_, i) => {
        const el = flyers.current[i];
        const a = starts[i];
        const b = ends[i];
        if (!el || !a || !b) return;
        const t = span(p, 0.12 + 0.03 * i, 0.58 + 0.015 * i);
        const lift = Math.sin(Math.PI * t) * 22;
        el.style.transform = `translate(${mix(a.x, b.x, t)}px, ${mix(a.y, b.y, t) - lift}px)`;
        el.style.width = `${mix(a.w, b.w, t)}px`;
        el.style.height = `${mix(a.h, b.h, t)}px`;
        el.style.borderRadius = `${mix(8, b.r, t)}px`;
        el.style.setProperty("--light", String(light));
        // a card the carousel keeps out of sight fades on its way there
        el.style.opacity = b.far ? String(1 - span(p, 0.4, 0.66)) : "";
      });

      if (done !== p >= DONE) {
        done = p >= DONE;
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
      peek += ((hovered.current && shown < 0.04 ? 1 : 0) - peek) * 0.12;
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
      <PortalStill steps={steps} />
      <div ref={stage} className="cm-stage">
        <div ref={land} className="cm-view" inert={!landed}>
          {landing}
        </div>

        <div className="cm-portal" aria-hidden="true">
          <div
            className="cp"
            onPointerEnter={() => (hovered.current = true)}
            onPointerLeave={() => (hovered.current = false)}
          >
            {/* first, so the arcs tuck in behind the workspace and the panel */}
            <div className="cp-link">
              <span className="cp-link-label">Shared data</span>
              <svg viewBox="0 0 264 160">
                <path d="M32 140A100 120 0 0 1 232 140" />
                <path d="M32 154A100 120 0 0 1 232 154" />
              </svg>
            </div>
            <div className="cp-ws">
              <span className="cp-tag">Daily operations workspace</span>
              <CaseWorkspace />
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
          <div className="cpp">
            <div className="cpp-ws">
              <span className="cp-tag">Daily operations workspace</span>
              <CaseWorkspace />
            </div>
            <div className="cpp-link">
              <svg viewBox="0 0 60 56">
                <path d="M24 0C10 16 10 40 24 56" />
                <path d="M38 0C24 16 24 40 38 56" />
              </svg>
              <span>Shared data</span>
            </div>
            <div className="cpp-panel">
              <span className="cp-tag">Client portal</span>
              {COLS.map((c) => (
                <div className="cpp-stage" key={c.name}>
                  <span className="cpp-head">{c.name}</span>
                  <div className="cpp-row">
                    {c.cards.map((key, i) => (
                      <div
                        key={i}
                        ref={(el) => {
                          if (key) slotsPhone.current[key] = el;
                        }}
                        className={`cpp-card${key ? " is-named" : ""}`}
                      >
                        <Skeleton
                          name={steps.find((s) => s.key === key)?.name}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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
          The client portal, abstracted: a messy daily operations workspace of
          apps, emails, notes and files, and a client portal of modules in the stages Brief,
          Audience, Plan, Activate and Optimize, joined by shared data. Scrolling
          opens the portal into Sales’ demo and Planners’ work, below.
        </p>
        <div className="cm-cue">
          <button type="button" onClick={openPortal}>
            Scroll to view client portal
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 9l7 7 7-7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
