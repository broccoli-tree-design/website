"use client";
import { useEffect, useRef } from "react";

/** "see" whose two "e"s look back: each counter (the arch above the
 *  crossbar) is filled with the letter's colour and holds the logo's pupil.
 *  EyeTracker.tsx moves and blinks it like any other [data-eye].
 *
 *  The arch isn't a simple shape, so it is measured off the rendered glyph:
 *  draw "e" on a canvas, flood-fill the outside, and what's left unfilled is
 *  the counter. That becomes a mask image, sized in em so it scales with the
 *  headline. */

type Socket = { l: number; t: number; w: number; h: number; url: string };

const R = 400; // render size of the glyph on the canvas, px
const PAD = 40;
const SPREAD = 8; // grow the counter well under the glyph's soft edge, px
const cache = new Map<string, Socket>();

function measure(font: string): Socket {
  const hit = cache.get(font);
  if (hit) return hit;
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  // draw at the headline's own size, scaled up, so Bodoni's optical size
  // axis gives the counter the page shows
  const size = parseFloat(font.match(/([\d.]+)px/)![1]);
  const k = R / size;
  ctx.font = font;
  const W = Math.ceil(ctx.measureText("e").width * k + PAD * 2);
  const H = R + PAD * 3;
  c.width = W;
  c.height = H;
  ctx.scale(k, k);
  ctx.font = font;
  ctx.fillText("e", PAD / k, R / k);

  const d = ctx.getImageData(0, 0, W, H).data;
  const clear = (i: number) => d[i * 4 + 3] <= 24;
  const out = new Uint8Array(W * H);
  const stack = [0];
  out[0] = 1;
  while (stack.length) {
    const i = stack.pop()!;
    const x = i % W;
    for (const j of [
      x > 0 ? i - 1 : -1,
      x < W - 1 ? i + 1 : -1,
      i - W,
      i + W < W * H ? i + W : -1,
    ])
      if (j >= 0 && !out[j] && clear(j)) {
        out[j] = 1;
        stack.push(j);
      }
  }
  const inCounter = (i: number) => !out[i] && clear(i);

  let x0 = W,
    y0 = H,
    x1 = -1,
    y1 = -1;
  for (let i = 0; i < W * H; i++)
    if (inCounter(i)) {
      const x = i % W,
        y = (i / W) | 0;
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
    }
  x0 -= SPREAD;
  y0 -= SPREAD;
  x1 += SPREAD;
  y1 += SPREAD;
  const bw = x1 - x0 + 1,
    bh = y1 - y0 + 1;

  // opaque wherever a counter pixel is within SPREAD, but never outside the
  // letter, so the fill meets the arch with no hairline gap
  const m = document.createElement("canvas");
  m.width = bw;
  m.height = bh;
  const mc = m.getContext("2d")!;
  const img = mc.createImageData(bw, bh);
  for (let y = 0; y < bh; y++)
    for (let x = 0; x < bw; x++) {
      const gx = x0 + x,
        gy = y0 + y;
      if (out[gy * W + gx]) continue;
      search: for (let oy = -SPREAD; oy <= SPREAD; oy++)
        for (let ox = -SPREAD; ox <= SPREAD; ox++) {
          if (ox * ox + oy * oy > SPREAD * SPREAD) continue;
          const nx = gx + ox,
            ny = gy + oy;
          if (
            nx >= 0 &&
            ny >= 0 &&
            nx < W &&
            ny < H &&
            inCounter(ny * W + nx)
          ) {
            img.data[(y * bw + x) * 4 + 3] = 255;
            break search;
          }
        }
    }
  mc.putImageData(img, 0, 0);

  const s = {
    l: (x0 - PAD) / R,
    t: (y0 - R) / R, // from the baseline
    w: bw / R,
    h: bh / R,
    url: `url(${m.toDataURL()})`,
  };
  cache.set(font, s);
  return s;
}

export default function SeeEyes() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const em = ref.current;
    if (!em) return;
    let raf = 0;
    const layout = () => {
      raf = 0;
      const cs = getComputedStyle(em);
      const fs = parseFloat(cs.fontSize);
      const s = measure(
        `${cs.fontStyle} ${cs.fontWeight} ${fs}px ${cs.fontFamily}`,
      );
      em.querySelectorAll<HTMLElement>(".see-e").forEach((e) => {
        const base = e.querySelector(".see-base")!.getBoundingClientRect();
        const top = (base.bottom - e.getBoundingClientRect().top) / fs + s.t;
        const sock = e.querySelector<HTMLElement>("[data-eye]")!;
        Object.assign(sock.style, {
          left: `${s.l}em`,
          top: `${top}em`,
          width: `${s.w}em`,
          height: `${s.h}em`,
          maskImage: s.url,
          webkitMaskImage: s.url,
          visibility: "visible",
        });
        // the logo's pupil, 2:5, as tall as the arch allows
        const ph = Math.min(s.h * 0.72, s.w * 1.2);
        const pupil = sock.querySelector<HTMLElement>("[data-pupil]")!;
        pupil.style.width = `${ph * 0.4}em`;
        pupil.style.height = `${ph}em`;
      });
      // let EyeTracker aim the pupils now they have a size
      dispatchEvent(new Event("eyes:layout"));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(layout);
    };
    // a canvas drawn before the web font loads measures the fallback's "e"
    const cs = getComputedStyle(em);
    document.fonts
      .load(`${cs.fontWeight} 100px ${cs.fontFamily}`)
      .then(() => document.fonts.ready)
      .then(schedule);
    addEventListener("resize", schedule);
    return () => {
      removeEventListener("resize", schedule);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <em ref={ref}>
      s
      {[0, 1].map((i) => (
        <span className="see-e" key={i}>
          e
          <span className="see-base" />
          <span className="see-eye" data-eye="" aria-hidden="true">
            <span className="see-pupil" data-pupil="">
              <span className="see-lid" data-lid="" />
            </span>
          </span>
        </span>
      ))}
    </em>
  );
}
