"use client";
import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";
import { GlassCaption } from "./GlassCarousel";

/** The black box: a cartoon carton, flat-shaded like the logo, three black
 *  faces with the cities it picked and the question printed on its front.
 *  Scrolling through the section takes it apart: the faces pull away from
 *  each other, flatten, and light gets in, each one turning into a glass
 *  card (a GlassCarousel one) holding a step's screen, its caption
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

/** The carton, as in the B4 design: an 880×560 board with the box a 540×330
 *  slab, 180 deep, turned -18° about x and -26° about y and seen through a
 *  perspective of 1500. Each face is a rect on one of the slab's planes, set
 *  in about 3px from its neighbours; points are in the slab's own px, from
 *  its top-left-front corner. */
const BOARD_W = 880;
const BOARD_H = 560;
const TURN_X = (-18 * Math.PI) / 180;
const TURN_Y = (-26 * Math.PI) / 180;
const EYE = 1500;
/** the slab's centre and the vanishing point, from the board's centre */
const SLAB_AT: V = [0, 5];
const VANISH: V = [0, -56];
const SLAB_MID: P3 = [270, 165, 0];
/** how far a face parts from the box, at most (the slab's height) */
const PART = 330;
/** how far through the scroll the carousel takes over */
const DONE = 0.985;

type V = [number, number];
type P3 = [number, number, number];

/** Each face as its top-left corner and the card's top edge e1 and left edge
 *  e2 on the slab, the way it faces, its two lengths and its corners'
 *  radius; in step order: front, lid, side */
const FACES: {
  tl: P3;
  e1: P3;
  e2: P3;
  out: P3;
  lx: number;
  ly: number;
  r: number;
  shade: string;
}[] = [
  {
    tl: [3, 13, 90],
    e1: [534, 0, 0],
    e2: [0, 304, 0],
    out: [0, 0, 1],
    lx: 534,
    ly: 304,
    r: 22,
    shade: "front",
  },
  {
    tl: [3, 10, 86],
    e1: [0, 0, -172],
    e2: [534, 0, 0],
    out: [0, -1, 0],
    lx: 172,
    ly: 534,
    r: 30,
    shade: "lid",
  },
  {
    tl: [540, 13, 86],
    e1: [0, 0, -172],
    e2: [0, 304, 0],
    out: [1, 0, 0],
    lx: 172,
    ly: 304,
    r: 30,
    shade: "side",
  },
];

/** a point on the slab, on screen, from the board's centre, in the board's px */
const project = ([x, y, z]: P3): V => {
  const px = x - SLAB_MID[0];
  const py = y - SLAB_MID[1];
  const [cy, sy] = [Math.cos(TURN_Y), Math.sin(TURN_Y)];
  const [cx, sx] = [Math.cos(TURN_X), Math.sin(TURN_X)];
  const x1 = px * cy + z * sy;
  const z1 = -px * sy + z * cy;
  const y2 = py * cx - z1 * sx;
  const z2 = py * sx + z1 * cx;
  const s = EYE / (EYE - z2);
  return [
    VANISH[0] + (SLAB_AT[0] + x1 - VANISH[0]) * s,
    VANISH[1] + (SLAB_AT[1] + y2 - VANISH[1]) * s,
  ];
};
/** a face's corners on screen (top-left, top-right, bottom-right,
 *  bottom-left), the face moved out of the box by d */
const corners = (f: (typeof FACES)[number], d = 0): V[] =>
  (
    [
      [0, 0, 0],
      f.e1,
      [f.e1[0] + f.e2[0], f.e1[1] + f.e2[1], f.e1[2] + f.e2[2]],
      f.e2,
    ] as P3[]
  ).map((o) =>
    project([
      f.tl[0] + o[0] + f.out[0] * d,
      f.tl[1] + o[1] + f.out[1] * d,
      f.tl[2] + o[2] + f.out[2] * d,
    ]),
  );
const cs = FACES.flatMap((f) => corners(f));
const EXT_W =
  Math.max(...cs.map((c) => c[0])) - Math.min(...cs.map((c) => c[0]));
const EXT_H =
  Math.max(...cs.map((c) => c[1])) - Math.min(...cs.map((c) => c[1]));

/** The CSS matrix that lays a w×h card on four corners (top-left, top-right,
 *  bottom-right, bottom-left): a homography, so the perspective holds */
const quad = (c: V[], w: number, h: number) => {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = c;
  const dx1 = x1 - x2;
  const dx2 = x3 - x2;
  const dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2;
  const dy2 = y3 - y2;
  const dy3 = y0 - y1 + y2 - y3;
  let g = 0;
  let k = 0;
  if (Math.abs(dx3) > 1e-9 || Math.abs(dy3) > 1e-9) {
    const den = dx1 * dy2 - dx2 * dy1;
    g = (dx3 * dy2 - dx2 * dy3) / den;
    k = (dx1 * dy3 - dx3 * dy1) / den;
  }
  const a = x1 - x0 + g * x1;
  const b = x3 - x0 + k * x3;
  const d = y1 - y0 + g * y1;
  const e = y3 - y0 + k * y3;
  return `matrix3d(${[a / w, d / w, 0, g / w, b / h, e / h, 0, k / h, 0, 0, 1, 0, x0, y0, 0, 1].join(", ")})`;
};

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
  /** the glass carousel of the same steps, for the faces to land in */
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
      // the board's px on this stage: 1 at 880×560, a phone's fit to its width
      const sw = stg.clientWidth;
      const sh = stg.clientHeight;
      const k =
        sw < 640
          ? Math.min((sw * 0.8) / EXT_W, (sh * 0.5) / EXT_H)
          : Math.min(sw / BOARD_W, sh / BOARD_H);
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
        // on the carton, parted by the pointer and the scroll, then the
        // corners slide to the deck's: the matrix follows them
        const out = PART * (0.05 * peek + 0.28 * apart) * (1 - flat);
        const deck: V[] = [
          [end.x, end.y],
          [end.x + end.w, end.y],
          [end.x + end.w, end.y + end.h],
          [end.x, end.y + end.h],
        ];
        const at = corners(f, out).map(
          ([x, y], j): V => [
            mix(x * k, deck[j][0], flat),
            mix(y * k, deck[j][1], flat),
          ],
        );
        el.style.transform = quad(at, end.w, end.h);
        el.style.width = `${end.w}px`;
        el.style.height = `${end.h}px`;
        // the carton's corner radius, the deck's own once flat
        el.style.borderRadius = `${mix((f.r * end.w) / f.lx, end.r, flat)}px / ${mix((f.r * end.h) / f.ly, end.r, flat)}px`;
        // what is printed on the face keeps its own shape on the card
        el.style.setProperty("--sx", String(end.w / f.lx));
        el.style.setProperty("--sy", String(end.h / f.ly));
        el.style.setProperty("--light", String(light));
        // a deck the carousel keeps out of sight fades on its way there
        el.style.opacity = end.far ? String(1 - span(p, 0.4, 0.66)) : "";
      });

      // the carton's shadow on the ground
      const sd = shadow.current;
      if (sd) {
        sd.style.width = `${580 * k}px`;
        sd.style.height = `${56 * k}px`;
        sd.style.transform = `translate(${(10 - 290) * k}px, ${(188 - 28) * k}px)`;
        sd.style.opacity = String(1 - apart);
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
                <div className="bb-print" aria-hidden="true">
                  <span className="bb-city">Boston</span>
                  <span className="bb-city">Baltimore</span>
                  <span className="bb-city">Providence</span>
                  <span className="bb-question text-label">
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
