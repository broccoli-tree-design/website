"use client";
import { useEffect, useRef } from "react";

/** A word set in ivory dither for the black box card: the letters are
 *  rasterised small, softened, then ordered-dithered (Bayer) so they
 *  dissolve into the black. Deterministic grain (seeded), so every load
 *  looks the same. */

const ROWS = 24;
const PAD = 4;
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/** mulberry32 */
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function DitherWord({
  word,
  seed,
  className,
}: {
  word: string;
  seed: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d", { willReadFrequently: true });
    if (!cv || !ctx) return;
    let live = true;

    const draw = () => {
      if (!live) return;
      const family = getComputedStyle(cv).fontFamily;
      const font = `700 ${Math.round(ROWS * 0.86)}px ${family}`;
      ctx.font = font;
      const w = Math.ceil(ctx.measureText(word).width) + PAD * 2;
      cv.width = w;
      cv.height = ROWS;
      cv.style.setProperty("--cols", String(w));

      // the letters, softened so the dither has tones to work with
      ctx.clearRect(0, 0, w, ROWS);
      ctx.filter = "blur(0.4px)";
      ctx.font = font;
      ctx.fillStyle = "#fff";
      ctx.textBaseline = "alphabetic";
      // a stroke thickens the serif's hairlines (the e's bar) so they survive
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 0.7;
      ctx.strokeText(word, PAD, Math.round(ROWS * 0.8));
      ctx.fillText(word, PAD, Math.round(ROWS * 0.8));
      ctx.filter = "none";
      const src = ctx.getImageData(0, 0, w, ROWS).data;

      const rand = rng(seed);
      const out = ctx.createImageData(w, ROWS);
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < w; x++) {
          const u = x / (w - 1);
          // the ends crumble: the field thins toward both edges
          const ends = Math.min(1, u / 0.12, (1 - u) / 0.12);
          const f =
            Math.min(1, (src[(y * w + x) * 4 + 3] / 255) * 1.35) *
            (0.8 + 0.2 * ends);
          const th = (BAYER[y % 4][x % 4] + 0.5) / 16 + (rand() - 0.5) * 0.2;
          const i = (y * w + x) * 4;
          if (f > th) {
            out.data[i] = 0xef;
            out.data[i + 1] = 0xee;
            out.data[i + 2] = 0xde;
            out.data[i + 3] = 255;
          }
        }
      }
      ctx.clearRect(0, 0, w, ROWS);
      ctx.putImageData(out, 0, 0);
    };

    draw();
    // redraw once the serif has loaded
    document.fonts?.ready.then(draw);
    return () => {
      live = false;
    };
  }, [word, seed]);

  return <canvas ref={ref} className={className} height={ROWS} aria-hidden="true" />;
}
