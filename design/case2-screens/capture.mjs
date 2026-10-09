// Captures each module screen as the image the case study shows:
// the white product card alone, at 2×, saved as WebP in public/case2/.
//
//   npm i --no-save playwright-core
//   node design/case2-screens/capture.mjs            (all screens)
//   node design/case2-screens/capture.mjs new-client-channel   (one)
//
// Uses the installed Google Chrome; set CHROME to another browser binary.
import { chromium } from "playwright-core";
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "../../public/case2");

/** each <name>.dc.html here becomes public/case2/<name>.webp */
const SCREENS = [
  "new-client-ideation",
  "new-client-opportunity",
  "new-client-audience",
  "new-client-attention",
  "new-client-channel",
  "return-client-attention",
  "return-client-channel",
];

const only = process.argv.slice(2);
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME ??
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const page = await browser.newPage({
  viewport: { width: 1400, height: 900 },
  deviceScaleFactor: 2,
});

for (const name of SCREENS) {
  if (only.length && !only.includes(name)) continue;
  await page.goto("file://" + path.join(HERE, name + ".dc.html"), {
    waitUntil: "networkidle",
  });
  // transparent page; the card without its outline and shadow
  await page.addStyleTag({
    content:
      "html,body{background:transparent!important}body{padding:100px!important}[data-screen-label]>div{box-shadow:none!important}",
  });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800); // hotlinked paintings, chart layout
  const png = await page
    .locator("[data-screen-label] > div")
    .first()
    .screenshot({ omitBackground: true });
  await sharp(png)
    .webp({ quality: 86, alphaQuality: 90, smartSubsample: true })
    .toFile(path.join(OUT, name + ".webp"));
  console.log("saved", name + ".webp");
}
await browser.close();
