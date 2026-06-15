// Zoom render check: instantiate specific elements large and screenshot each.
// Usage: node test/zoom.mjs
import { chromium } from "playwright";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const f = (p) => "file://" + resolve(root, p);

const scripts = [
  "custom_components/fallout_terminal/frontend/cards/fallout-core.js",
  "custom_components/fallout_terminal/frontend/assets/vault-boy-engine.js",
  "custom_components/fallout_terminal/frontend/cards/fallout-gauge-card.js",
];

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium" });
const page = await browser.newPage({ viewport: { width: 900, height: 700 }, deviceScaleFactor: 2 });
const problems = [];
page.on("pageerror", (e) => problems.push(e.message));
page.on("console", (m) => { if (m.type() === "error") problems.push(m.text()); });

await page.setContent(`<!DOCTYPE html><html><head>
  <style>
    body { margin:0; background:#05080a; --fallout-accent:#9cff57; --fallout-accent-dim:#5f9c3a; --fallout-bg:#0b0f0a; }
    .row { display:flex; gap:24px; padding:24px; align-items:flex-start; }
    .gauge-wrap { width:340px; }
    .vb { width:170px; height:220px; background:#0b0f0a; border:1px solid #5f9c3a; }
    .vb-grid { display:flex; gap:16px; flex-wrap:wrap; padding:24px; }
    figcaption { color:#5f9c3a; font:11px monospace; letter-spacing:2px; margin-top:6px; text-align:center; }
  </style></head><body>
  <div class="row">
    <div class="gauge-wrap" id="g1"></div>
    <div class="gauge-wrap" id="g2"></div>
  </div>
  <div class="vb-grid" id="vbs"></div>
</body></html>`, { waitUntil: "load" });

for (const s of scripts) await page.addScriptTag({ path: resolve(root, s) });

await page.evaluate(() => {
  const hass = { states: {
    "sensor.reactor": { state: "73.4", attributes: { friendly_name: "Reactor Output", unit_of_measurement: "%" } },
    "sensor.water": { state: "12", attributes: { friendly_name: "Water Purity", unit_of_measurement: "%" } },
  }, callService() {} };
  const mk = (cfg) => { const el = document.createElement(cfg.type.replace("custom:", "")); el.setConfig(cfg); el.hass = hass; return el; };
  document.getElementById("g1").appendChild(mk({ type: "custom:fallout-gauge-card", entity: "sensor.reactor", name: "REACTOR OUTPUT",
    segments: [{ to: 60, color: "var(--fallout-accent)" }, { to: 85, color: "var(--fallout-warn)" }, { to: 100, color: "var(--fallout-alert)" }] }));
  document.getElementById("g2").appendChild(mk({ type: "custom:fallout-gauge-card", entity: "sensor.water", name: "WATER PURITY", min: 0, max: 100, invert: true,
    segments: [{ to: 20, color: "var(--fallout-alert)" }, { to: 50, color: "var(--fallout-warn)" }, { to: 100, color: "var(--fallout-accent)" }] }));
  const vbs = document.getElementById("vbs");
  for (const a of window.RobCoFallout.VAULT_BOY_STATES) {
    const fig = document.createElement("figure"); fig.style.margin = "0";
    const box = document.createElement("div"); box.className = "vb";
    const vb = document.createElement("fallout-vault-boy"); vb.setAttribute("animation", a); box.appendChild(vb);
    const cap = document.createElement("figcaption"); cap.textContent = a;
    fig.appendChild(box); fig.appendChild(cap); vbs.appendChild(fig);
  }
});
await page.waitForTimeout(400);
await page.screenshot({ path: resolve(__dirname, "zoom.png"), fullPage: true });
await browser.close();
console.log("wrote test/zoom.png", problems.length ? "PROBLEMS:\n" + problems.join("\n") : "(no errors)");
