// Renders every logo file from public/logo-text.svg. Run from the repo root:
//   node design/logo/render.mjs
// sharp comes with Next, so nothing needs installing.
import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";

const SRC = readFileSync("public/logo-text.svg", "utf8");
const OUT = "design/logo";
const DARK = "#173f35"; // --green-800
const LIGHT = "#efeede"; // --neutral-100

// the eye: the almond (the ivory path) and the pupil ellipse inside it
const ALMOND = SRC.match(/<path d="([^"]+)" fill="#EFEEDE"\/>/)[1];
const PUPIL = SRC.match(/<ellipse [^>]+\/>/)[0];
const CX = 200;
const CY = 84.375;
const EYE_W = 62; // almond, 169 → 231
const EYE_H = 31.25; // almond, 68.75 → 100

/** The logo's inner SVG with the pupil moved by (dx, dy), as fractions of
 *  EyeTracker.tsx's reach (30% of the eye's width, 12% of its height), and
 *  the eye squashed to `open` of its height, as its blink does. */
function logo(dx = 0, dy = 0, open = 1) {
  const eye =
    `<clipPath id="almond"><path d="${ALMOND}"/></clipPath>` +
    `<g transform="translate(${CX} ${CY}) scale(1 ${open}) translate(${-CX} ${-CY})">` +
    `<path d="${ALMOND}" fill="#EFEEDE"/>` +
    `<g clip-path="url(#almond)"><g transform="translate(${dx * EYE_W * 0.3} ${dy * EYE_H * 0.12})">${PUPIL}</g></g>` +
    `</g>`;
  return SRC.replace(/^<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .replace(`<path d="${ALMOND}" fill="#EFEEDE"/>`, "")
    .replace(PUPIL, eye);
}

/** A square tile: the logo at 150/180 of the side, centred on `bg`, as the
 *  apple icon has always been. No `bg` = the bare logo, transparent. */
function tile(bg, dx, dy, open) {
  const body = bg
    ? `<rect width="300" height="300" fill="${bg}"/><g transform="translate(25 25) scale(${150 / 180})">${logo(dx, dy, open)}</g>`
    : logo(dx, dy, open);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">${body}</svg>`;
}

const png = (svg, size) =>
  sharp(Buffer.from(svg), { density: (72 * size * 2) / 300 }).resize(size, size).png().toBuffer();

// ── the look: a few glances and a blink, about 5s, looping ──
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const KEYS = [
  // [ms, dx, dy]: glide between keys, hold where two keys share a pose
  [0, 0, 0.3],
  [700, 0, 0.3],
  [1300, -1, 0.2],
  [1900, -1, 0.2],
  [2700, 1, -0.1],
  [3300, 1, -0.1],
  [3800, 0, 0.3],
  [5000, 0, 0.3],
];
const BLINK_AT = 3900;
const BLINK_MS = 220;
const STEP = 40; // ms per frame (GIF delays are in 10ms steps)

function pose(ms) {
  let i = 0;
  while (i < KEYS.length - 2 && ms >= KEYS[i + 1][0]) i++;
  const [t0, x0, y0] = KEYS[i];
  const [t1, x1, y1] = KEYS[i + 1];
  const t = ease(Math.min(1, Math.max(0, (ms - t0) / (t1 - t0))));
  // the blink: shut to 8% at its middle and open again, ease-in-out
  const b = (ms - BLINK_AT) / BLINK_MS;
  const open = b > 0 && b < 1 ? 1 - 0.92 * ease(1 - Math.abs(2 * b - 1)) : 1;
  return [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, open];
}

async function gif(bg, size, file) {
  // consecutive identical frames merge into one longer frame
  const frames = [];
  for (let ms = 0; ms < KEYS.at(-1)[0]; ms += STEP) {
    const key = pose(ms).map((n) => n.toFixed(3)).join();
    if (frames.length && frames.at(-1).key === key) frames.at(-1).delay += STEP;
    else frames.push({ key, pose: pose(ms), delay: STEP });
  }
  const bufs = await Promise.all(frames.map((f) => png(tile(bg, ...f.pose), size)));
  await sharp(bufs, { join: { animated: true } })
    .gif({ delay: frames.map((f) => f.delay), loop: 0, effort: 10 })
    .toFile(`${OUT}/${file}`);
  console.log(`${file}: ${frames.length} frames`);
}

/** A .ico of PNG images, one per size. */
async function ico(svg, sizes, file) {
  const imgs = await Promise.all(sizes.map((s) => png(svg, s)));
  const head = Buffer.alloc(6 + 16 * sizes.length);
  head.writeUInt16LE(1, 2); // type: icon
  head.writeUInt16LE(sizes.length, 4);
  let offset = head.length;
  sizes.forEach((s, i) => {
    const e = 6 + 16 * i;
    head.writeUInt8(s % 256, e); // 256 is written as 0
    head.writeUInt8(s % 256, e + 1);
    head.writeUInt16LE(1, e + 4); // planes
    head.writeUInt16LE(32, e + 6); // bits per pixel
    head.writeUInt32LE(imgs[i].length, e + 8);
    head.writeUInt32LE(offset, e + 12);
    offset += imgs[i].length;
  });
  writeFileSync(file, Buffer.concat([head, ...imgs]));
}

// exports: still and moving, on both grounds
writeFileSync(`${OUT}/logo-dark.png`, await png(tile(DARK), 1024));
writeFileSync(`${OUT}/logo-light.png`, await png(tile(LIGHT), 1024));
await gif(DARK, 512, "logo-dark.gif");
await gif(LIGHT, 512, "logo-light.gif");

// the site's icons: the dark tile, still
writeFileSync("public/favicon.svg", tile(DARK) + "\n");
await ico(tile(DARK), [16, 32, 48], "app/favicon.ico");
writeFileSync("app/apple-icon.png", await png(tile(DARK), 180));
// the bare logo, for structured data
writeFileSync("public/logo.png", await png(tile(), 512));
console.log("done");
