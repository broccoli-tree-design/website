"use client";
import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";
import DitherWord from "./DitherWord";
import { GlassCaption } from "./GlassCarousel";

/** The black box: a cartoon carton, flat-shaded like the logo, three black
 *  faces with the cities it picked and the question printed on its front.
 *  Scrolling through the section takes it apart: the faces pull away from
 *  each other, flatten, and light gets in, each one turning into a glass
 *  card (a bare GlassCarousel deck's) holding a step's screen, its caption
 *  fading in below. The front is 01, the lid 02, the side 03.
 *
 *  The faces land where the carousel (`landing`) lays its decks out,
 *  measured from the page, so phones and desktops get the same motion. Once
 *  they have, the carousel takes over and its arrows and swiping work;
 *  scrolling back up hands back to the faces.
 *
 *  The trigger is the page's own scroll (the stage is sticky, the section
 *  tall), so it needs no new gesture and runs backwards when scrolled back.
 *  Its affordances: the faces part a little under the pointer, a "Scroll to
 *  open" cue under the box, and the cue's button (keyboard, a click) scrolls
 *  to the end. Reduced motion shows the carousel, with no box. */

export type BoxStep = {
  num: string;
  name: string;
  desc: string;
  img: { src: string; w: number; h: number; quality?: number };
  alt: string;
};

/** The carton, in its edge S: front width, side depth, height */
const FRONT = 1.5;
const DEPTH = 0.85;
const TALL = 1;
/** the gap between faces and their corners' radius, in S */
const SEAM = 0.07;
const ROUND = 0.13;
/** the whole carton leans a little, like the logo's tree */
const LEAN = (-4 * Math.PI) / 180;
/** how far through the scroll the carousel takes over */
const DONE = 0.985;

const C30 = Math.cos(Math.PI / 6);
type V = [number, number];
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1]];
const scale = (a: V, k: number): V => [a[0] * k, a[1] * k];
const len = (a: V) => Math.hypot(a[0], a[1]);
const lean = (a: V): V => [
  a[0] * Math.cos(LEAN) - a[1] * Math.sin(LEAN),
  a[0] * Math.sin(LEAN) + a[1] * Math.cos(LEAN),
];

/** The axes on screen: along the front (down to the right), along the side
 *  (up to the right), and up */
const ALONG: V = [C30, 0.5];
const BACK: V = [C30, -0.5];
const DOWN: V = [0, 1];

/** Each face as a corner o and the card's top edge e1 and left edge e2, in
 *  S, from the front top corner; in step order: front, lid, side */
const LEFT: V = scale(ALONG, -FRONT);
const FACES: { o: V; e1: V; e2: V; out: V; shade: string }[] = [
  {
    o: LEFT,
    e1: scale(ALONG, FRONT),
    e2: scale(DOWN, TALL),
    out: [-C30, 0.5],
    shade: "front",
  },
  {
    o: LEFT,
    e1: scale(BACK, DEPTH),
    e2: scale(ALONG, FRONT),
    out: [0, -1],
    shade: "lid",
  },
  {
    o: [0, 0],
    e1: scale(BACK, DEPTH),
    e2: scale(DOWN, TALL),
    out: [C30, 0.5],
    shade: "side",
  },
];
/** the carton's outline, to centre it */
const CORNERS: V[] = (
  [[0, 0], LEFT, add(LEFT, scale(BACK, DEPTH)), scale(BACK, DEPTH)] as V[]
).flatMap((p): V[] => [p, add(p, scale(DOWN, TALL))]);
const xs = CORNERS.map((p) => p[0]);
const ys = CORNERS.map((p) => p[1]);
const BOX_W = Math.max(...xs) - Math.min(...xs);
const BOX_H = Math.max(...ys) - Math.min(...ys);
const MID: V = [
  (Math.max(...xs) + Math.min(...xs)) / 2,
  (Math.max(...ys) + Math.min(...ys)) / 2,
];

const clamp = (v: number) => Math.min(1, Math.max(0, v));
/** 0→1 as p goes from a to b, eased in and out */
const span = (p: number, a: number, b: number) => {
  const t = clamp((p - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

type End = {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
  far: boolean;
};

export default function BlackBox({
  steps,
  landing,
  onLanded,
}: {
  steps: BoxStep[];
  /** the roomy glass carousel of the same steps, for the faces to land in */
  landing: ReactNode;
  /** called as the carousel takes over (true) and hands back (false) */
  onLanded?: (landed: boolean) => void;
}) {
  const section = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const shadow = useRef<HTMLSpanElement>(null);
  const land = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const hovered = useRef(false);
  const landed = useRef(onLanded);
  useEffect(() => {
    landed.current = onLanded;
  });

  useEffect(() => {
    const sec = section.current!;
    const stg = stage.current!;
    const scn = scene.current!;
    const still = matchMedia("(prefers-reduced-motion: reduce)");

    let shown = 0; // the progress drawn, easing toward the scroll's
    let peek = 0; // the faces parting under the pointer
    let raf = 0;
    let running = false;
    // unknown until the first draw, so it sets the stage's state afresh (a
    // remount mid-scroll can find the last mount's is-landed still on it)
    let done: boolean | null = null;
    let ends: End[] = [];

    // where the carousel's glass cards sit, from the scene's centre, in px
    // (the carousel is laid out, just hidden, until the faces land)
    const measure = () => {
      const o = scn.getBoundingClientRect();
      const decks = land.current?.querySelectorAll<HTMLElement>(".gc-deck");
      ends = [...(decks ?? [])].map((d) => {
        const g = d.querySelector<HTMLElement>(".gc-glass") ?? d;
        const r = g.getBoundingClientRect();
        return {
          x: r.left - o.left,
          y: r.top - o.top,
          w: r.width,
          h: r.height,
          r: parseFloat(getComputedStyle(g).borderTopLeftRadius) || 0,
          far:
            d.classList.contains("is-far") &&
            getComputedStyle(d).opacity === "0",
        };
      });
    };

    const target = () => {
      if (still.matches) return 1;
      const r = sec.getBoundingClientRect();
      const run = r.height - innerHeight;
      return run > 0 ? clamp(-r.top / run) : 1;
    };

    const draw = (p: number) => {
      if (!done) measure();
      // the carton's edge: as big as the stage allows, room left for the cue
      const S = Math.min(
        (stg.clientWidth * 0.72) / BOX_W,
        (stg.clientHeight * 0.52) / BOX_H,
      );
      // 1 · the faces pull apart
      const apart = span(p, 0.06, 0.3);
      // 2 · they flatten into cards and slide to the carousel's decks
      const flat = span(p, 0.2, 0.68);
      // 3 · light gets in: the black lifts off the glass
      const light = span(p, 0.42, 0.7);

      FACES.forEach((f, i) => {
        const el = cards.current[i];
        const end = ends[i];
        if (!el || !end) return;
        // on the carton, in px, centred, leaning, each face pulled in from
        // its neighbours by the seam
        const e1 = scale(f.e1, S * (1 - SEAM / len(f.e1)));
        const e2 = scale(f.e2, S * (1 - SEAM / len(f.e2)));
        const mid = add(f.o, scale(add(f.e1, f.e2), 0.5));
        const o = add(
          scale(add(mid, scale(MID, -1)), S),
          scale(add(e1, e2), -0.5),
        );
        const off = S * (0.05 * peek + 0.28 * apart) * (1 - flat);
        const [ox, oy] = lean(add(o, scale(f.out, off)));
        const [ax, ay] = lean(e1);
        const [bx, by] = lean(e2);
        const box = [ax / end.w, ay / end.w, bx / end.h, by / end.h, ox, oy];
        const deck = [1, 0, 0, 1, end.x, end.y];
        const m = box.map((v, j) => mix(v, deck[j], flat));
        el.style.transform = `matrix(${m.join(", ")})`;
        el.style.width = `${end.w}px`;
        el.style.height = `${end.h}px`;
        // chunky round corners on the carton, the deck's own once flat
        const r = ROUND * S;
        el.style.borderRadius = `${mix(r / (len(e1) / end.w), end.r, flat)}px / ${mix(r / (len(e2) / end.h), end.r, flat)}px`;
        el.style.setProperty("--light", String(light));
        // a deck the carousel keeps out of sight fades on its way there
        el.style.opacity = end.far ? String(1 - span(p, 0.4, 0.66)) : "";
      });

      // the carton's shadow on the ground
      const sh = shadow.current;
      if (sh) {
        sh.style.width = `${BOX_W * S * 0.9}px`;
        sh.style.height = `${S * 0.34}px`;
        sh.style.transform = `translate(-50%, ${(BOX_H / 2) * S - S * 0.2}px)`;
        sh.style.opacity = String(1 - apart);
      }
      stg.style.setProperty("--print", String(1 - span(p, 0.24, 0.44)));
      stg.style.setProperty("--cue", String(1 - span(p, 0, 0.05)));
      stg.classList.toggle("is-moving", p > 0.05);
      if (done !== p >= DONE) {
        done = p >= DONE;
        stg.classList.toggle("is-landed", done);
        if (!done) {
          // back to 01 for the faces to take over from
          const gc = land.current?.querySelector(".gc");
          if (gc) gc.scrollLeft = 0;
        }
        landed.current?.(done);
      }
    };

    const tick = () => {
      const p = target();
      shown += (p - shown) * (still.matches ? 1 : 0.14);
      if (Math.abs(p - shown) < 0.0005) shown = p;
      peek += ((hovered.current && p < 0.05 ? 1 : 0) - peek) * 0.12;
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
    const onResize = () => draw(shown);
    addEventListener("resize", onResize);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      removeEventListener("resize", onResize);
    };
  }, []);

  const openBox = () => {
    const r = section.current!.getBoundingClientRect();
    scrollTo({
      top: scrollY + r.top + r.height - innerHeight,
      behavior: "smooth",
    });
  };

  return (
    <div ref={section} className="bb">
      <div ref={stage} className="bb-stage">
        <div ref={land} className="bb-landing">
          {landing}
        </div>
        <div
          ref={scene}
          className="bb-scene"
          onPointerEnter={() => (hovered.current = true)}
          onPointerLeave={() => (hovered.current = false)}
        >
          <span ref={shadow} className="bb-shadow" aria-hidden="true" />
          {steps.map((s, i) => (
            <div
              key={s.name}
              ref={(el) => {
                cards.current[i] = el;
              }}
              className={`gc-glass bb-card is-${FACES[i].shade}`}
              aria-hidden="true"
            >
              <div className="gc-shot">
                <Image
                  src={s.img.src}
                  alt=""
                  width={s.img.w}
                  height={s.img.h}
                  quality={s.img.quality}
                  sizes={
                    i === 0
                      ? "(min-width: 900px) 60vw, 90vw"
                      : "(min-width: 900px) 30vw, 90vw"
                  }
                />
              </div>
              <span className="bb-skin" />
              <div className="bb-caption">
                <GlassCaption num={s.num} name={s.name} desc={s.desc} />
              </div>
              {i === 0 && (
                // printed on the front: the cities it picked, and the question
                <div className="bb-print">
                  <div className="deck-dither">
                    <DitherWord word="Boston" seed={21} />
                    <DitherWord word="Baltimore" seed={7} />
                    <DitherWord word="Providence" seed={42} />
                  </div>
                  <span className="bb-sticker text-label">
                    Why these campaign markets?
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="bb-sr">
          A black box, with Boston, Baltimore and Providence printed on it and
          the question: why these campaign markets? It opens into the three
          steps below.
        </p>
        <div className="bb-cue">
          <button type="button" onClick={openBox}>
            Scroll to open the box
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 9l7 7 7-7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
