// Captures each step screen as the image the case study shows: the
// whole 1440×926 app screen at 2×, saved as WebP in public/case1/. The
// site rounds its corners and adds the drop shadow in CSS (.deck-figure).
//
//   npm i --no-save playwright-core
//   node design/case1-screens/capture.mjs                (all screens)
//   node design/case1-screens/capture.mjs select-markets (one)
//
// Uses the installed Google Chrome; set CHROME to another browser binary.
import { chromium } from "playwright-core";
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "../../public/case1");

/** each <name>.dc.html here becomes public/case1/<name>.webp */
const SCREENS = ["confirm-data", "set-parameters", "select-markets"];

const only = process.argv.slice(2);
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME ??
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const page = await browser.newPage({
  viewport: { width: 1600, height: 1100 },
  deviceScaleFactor: 2,
});

for (const name of SCREENS) {
  if (only.length && !only.includes(name)) continue;
  await page.goto("file://" + path.join(HERE, name + ".dc.html"), {
    waitUntil: "networkidle",
  });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800); // chart layout
  const png = await page
    .locator('div[style*="width: 1440px"]')
    .first()
    .screenshot();
  await sharp(png)
    .webp({ quality: 86, smartSubsample: true })
    .toFile(path.join(OUT, name + ".webp"));
  console.log("saved", name + ".webp");
}
await browser.close();
