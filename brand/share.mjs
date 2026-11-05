// Captures the share images (app/opengraph-image.jpg, app/twitter-image.jpg)
// from the hero, 1200 × 630, with only the logo and wordmark in the nav.
// Needs the site running (npm run dev) and Google Chrome installed:
//   npm run brand:share            (captures http://localhost:3000)
//   npm run brand:share -- <url>
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const URL_ = process.argv[2] ?? "http://localhost:3000/";
const CHROME =
  process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9333;
const W = 1200;
const H = 630;
// the share image shows the hero as a poster: no nav links or button, no dev overlay
const HIDE = `.nav-links, nextjs-portal { display: none !important; }`;

const profile = mkdtempSync(join(tmpdir(), "brand-share-"));
const chrome = spawn(CHROME, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  "--hide-scrollbars",
  "--force-prefers-reduced-motion=0",
  "about:blank",
]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  let ws;
  for (let i = 0; i < 50 && !ws; i++) {
    await sleep(200);
    try {
      const tabs = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const page = tabs.find((t) => t.type === "page");
      if (page) ws = new WebSocket(page.webSocketDebuggerUrl);
    } catch {}
  }
  if (!ws) throw new Error("Chrome did not start");
  await new Promise((r, j) => ((ws.onopen = r), (ws.onerror = j)));

  let id = 0;
  const pending = new Map();
  const events = [];
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id && pending.has(msg.id)) {
      const { ok, ko } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? ko(new Error(msg.error.message)) : ok(msg.result);
    } else if (msg.method) events.push(msg.method);
  };
  const send = (method, params = {}) =>
    new Promise((ok, ko) => {
      pending.set(++id, { ok, ko });
      ws.send(JSON.stringify({ id, method, params }));
    });

  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: URL_ });
  for (let i = 0; i < 100 && !events.includes("Page.loadEventFired"); i++) await sleep(100);
  await send("Runtime.evaluate", {
    expression: `(() => { const s = document.createElement("style"); s.textContent = ${JSON.stringify(HIDE)}; document.head.append(s); return document.fonts.ready.then(() => true); })()`,
    awaitPromise: true,
  });
  await sleep(3500); // the hero's entrance: photo 1.1s, rings 1.6s + stagger, name 1.2s
  const { data } = await send("Page.captureScreenshot", { format: "jpeg", quality: 90, clip: { x: 0, y: 0, width: W, height: H, scale: 1 } });
  const buf = Buffer.from(data, "base64");
  writeFileSync("app/opengraph-image.jpg", buf);
  writeFileSync("app/twitter-image.jpg", buf);
  console.log(`share images: ${W} × ${H} from ${URL_}`);
  ws.close();
} finally {
  chrome.kill();
  await sleep(300);
  rmSync(profile, { recursive: true, force: true });
}
