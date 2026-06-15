// Verify a theme re-skins the cards: read the real token values from fallout_retro.yaml,
// apply them as --fallout-* CSS vars, and render a few cards.
import { chromium } from "playwright";
import { readFileSync } from "fs";
import { resolve } from "path";

const root = resolve(import.meta.dirname, "..");
const themeName = process.argv[2] || "fallout_retro_amber";

// Tiny YAML pluck: grab the fallout-* keys under the requested theme block.
const yaml = readFileSync(resolve(root, "custom_components/fallout_terminal/frontend/themes/fallout_retro.yaml"), "utf8");
const block = yaml.split("\n").reduce((acc, line) => {
  if (/^\S/.test(line)) acc.cur = line.trim().replace(":", "");
  else if (acc.cur === themeName) {
    const m = line.match(/^\s+(fallout-[\w-]+):\s*"?([^"]+?)"?\s*$/);
    if (m) acc.vars[`--${m[1]}`] = m[2];
  }
  return acc;
}, { cur: "", vars: {} }).vars;

const rootStyle = Object.entries(block).map(([k, val]) => `${k}:${val}`).join(";");

const scripts = [
  "cards/fallout-core.js", "assets/vault-boy-engine.js", "cards/fallout-gauge-card.js",
  "cards/fallout-control-card.js", "cards/fallout-vaultboy-card.js",
].map((s) => "custom_components/fallout_terminal/frontend/" + s);

const b = await chromium.launch({ executablePath: "/usr/bin/chromium" });
const p = await b.newPage({ viewport: { width: 900, height: 360 }, deviceScaleFactor: 2 });
const errs = [];
p.on("pageerror", (e) => errs.push(e.message));
await p.setContent(`<body style="margin:0;background:#05080a;${rootStyle}">
  <div style="display:flex;gap:18px;padding:20px;align-items:flex-start;">
    <div id="a" style="width:260px"></div><div id="b" style="width:230px"></div><div id="c" style="width:200px"></div>
  </div></body>`, { waitUntil: "load" });
for (const s of scripts) await p.addScriptTag({ path: resolve(root, s) });
await p.evaluate(() => {
  const hass = { states: {
    "sensor.reactor": { state: "73.4", attributes: { friendly_name: "Reactor", unit_of_measurement: "%" } },
    "switch.turret": { state: "on", attributes: { friendly_name: "Turret" } },
    "sensor.rad": { state: "2", attributes: { friendly_name: "Rad" } },
  }, callService() {} };
  const mk = (el, cfg) => { const c = document.createElement(cfg.type.replace("custom:", "")); c.setConfig(cfg); c.hass = hass; document.getElementById(el).appendChild(c); };
  mk("a", { type: "custom:fallout-gauge-card", entity: "sensor.reactor", name: "REACTOR", segments: [{ to: 60, color: "var(--fallout-accent)" }, { to: 85, color: "var(--fallout-warn)" }, { to: 100, color: "var(--fallout-alert)" }] });
  mk("b", { type: "custom:fallout-control-card", entity: "switch.turret", name: "TURRET" });
  mk("c", { type: "custom:fallout-vaultboy-card", entity: "sensor.rad", name: "MONITOR", default_animation: "thumbs_up" });
});
await p.waitForTimeout(300);
await p.screenshot({ path: resolve(root, "test", `theme-${themeName}.png`), fullPage: true });
await b.close();
console.log(`wrote test/theme-${themeName}.png`, Object.keys(block).length, "tokens", errs.length ? "ERRORS:" + errs.join(";") : "(ok)");
