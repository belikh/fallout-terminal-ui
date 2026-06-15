// Headless render check for the card suite.
// Usage: node test/screenshot.mjs [out.png]
// Loads test-harness.html, captures console errors/warnings, and writes a screenshot.
import { chromium } from "playwright";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const harness = "file://" + resolve(__dirname, "test-harness.html");
const out = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : resolve(__dirname, "harness.png");

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium" });
const page = await browser.newPage({ viewport: { width: 1400, height: 1600 }, deviceScaleFactor: 2 });

const problems = [];
page.on("console", (m) => {
  if (m.type() === "error" || m.type() === "warning") problems.push(`[${m.type()}] ${m.text()}`);
});
page.on("pageerror", (e) => problems.push(`[pageerror] ${e.message}`));

await page.goto(harness, { waitUntil: "networkidle" });
await page.waitForFunction("window.__harnessReady === true", { timeout: 5000 }).catch(() => {});
await page.waitForTimeout(400);
await page.screenshot({ path: out, fullPage: true });
await browser.close();

console.log("screenshot:", out);
if (problems.length) {
  console.log("\nconsole problems (" + problems.length + "):");
  for (const p of problems) console.log("  " + p);
} else {
  console.log("no console errors/warnings");
}
