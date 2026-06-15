// Verifies the re-render gate: cards must NOT repaint on unrelated hass ticks (which would restart
// animations and break mid-drag controls), and MUST repaint when a watched entity changes.
import { chromium } from "playwright";
import { resolve } from "path";

const root = resolve(import.meta.dirname, "..");
const scripts = [
  "cards/fallout-core.js", "assets/vault-boy-engine.js", "cards/fallout-gauge-card.js",
  "cards/fallout-control-card.js", "cards/fallout-vaultboy-card.js", "cards/fallout-stats-card.js",
].map((s) => "custom_components/fallout_terminal/frontend/" + s);

const b = await chromium.launch({ executablePath: "/usr/bin/chromium" });
const p = await b.newPage();
const errs = [];
p.on("pageerror", (e) => errs.push(e.message));
await p.setContent(`<body style="--fallout-accent:#9cff57;--fallout-warn:#e6c15a;--fallout-alert:#ff6b5e;--fallout-bg:#0b0f0a"></body>`, { waitUntil: "load" });
for (const s of scripts) await p.addScriptTag({ path: resolve(root, s) });

const result = await p.evaluate(() => {
  const mkState = (state, attrs = {}) => ({ state, attributes: attrs });
  const base = {
    "sensor.reactor": mkState("50", { unit_of_measurement: "%" }),
    "input_number.valve": mkState("40", { min: 0, max: 100, unit_of_measurement: "%" }),
    "sensor.rad": mkState("2"),
    "sensor.unrelated": mkState("1"),
    "sensor.body_weight": mkState("80", { unit_of_measurement: "kg" }),
    "sensor.body_fat": mkState("18", { unit_of_measurement: "%" }),
  };
  const hass = (states) => ({ states, callService() {} });

  function makeCard(cfg) {
    const el = document.createElement(cfg.type.replace("custom:", ""));
    el.setConfig(cfg);
    el._renderCount = 0;
    const orig = el._render.bind(el);
    el._render = () => { el._renderCount++; orig(); };
    document.body.appendChild(el);
    return el;
  }

  const gauge = makeCard({ type: "custom:fallout-gauge-card", entity: "sensor.reactor" });
  const control = makeCard({ type: "custom:fallout-control-card", entity: "input_number.valve" });
  const vaultboy = makeCard({ type: "custom:fallout-vaultboy-card", entity: "sensor.rad",
    default_animation: "idle", mappings: [{ above: 5, animation: "radiation" }] });
  const stats = makeCard({ type: "custom:fallout-stats-card", title: "T",
    weight_entity: "sensor.body_weight", stats: [{ label: "FAT", entity: "sensor.body_fat", min: 0, max: 40 }] });

  const cards = { gauge, control, vaultboy, stats };

  // 1) First assignment -> each renders once.
  let states = { ...base };
  for (const el of Object.values(cards)) el.hass = hass(states);
  const afterFirst = Object.fromEntries(Object.entries(cards).map(([k, el]) => [k, el._renderCount]));

  // Capture persistent child identities.
  const sliderBefore = control.shadowRoot.querySelector("input");
  const vbBefore = vaultboy.shadowRoot.querySelector("fallout-vault-boy");
  // Simulate a mid-drag slider value the user hasn't committed yet.
  sliderBefore.value = "77";

  // 2) Ten UNRELATED ticks (a different entity changes each time; HA gives a new hass + new state obj).
  for (let i = 0; i < 10; i++) {
    states = { ...states, "sensor.unrelated": { state: String(i), attributes: {} } };
    for (const el of Object.values(cards)) el.hass = hass(states);
  }
  const afterUnrelated = Object.fromEntries(Object.entries(cards).map(([k, el]) => [k, el._renderCount]));

  const sliderPersisted = control.shadowRoot.querySelector("input") === sliderBefore;
  const sliderValueKept = control.shadowRoot.querySelector("input").value === "77";
  const vbPersisted = vaultboy.shadowRoot.querySelector("fallout-vault-boy") === vbBefore;

  // 3) Change each card's WATCHED entity -> it must re-render.
  states = { ...states,
    "sensor.reactor": { state: "60", attributes: { unit_of_measurement: "%" } },
    "input_number.valve": { state: "55", attributes: { min: 0, max: 100, unit_of_measurement: "%" } },
    "sensor.rad": { state: "9", attributes: {} },
    "sensor.body_fat": { state: "25", attributes: { unit_of_measurement: "%" } },
  };
  for (const el of Object.values(cards)) el.hass = hass(states);
  const afterWatched = Object.fromEntries(Object.entries(cards).map(([k, el]) => [k, el._renderCount]));

  // vaultboy crossed threshold 5 -> pose should now be radiation
  const vbAnim = vaultboy.shadowRoot.querySelector("fallout-vault-boy").getAttribute("animation");

  return { afterFirst, afterUnrelated, afterWatched, sliderPersisted, sliderValueKept, vbPersisted, vbAnim };
});

await b.close();

const checks = [];
const ok = (name, cond) => checks.push([name, !!cond]);
ok("each card rendered once on first hass", Object.values(result.afterFirst).every((n) => n === 1));
ok("NO re-render on 10 unrelated ticks", JSON.stringify(result.afterUnrelated) === JSON.stringify(result.afterFirst));
ok("slider element persisted across unrelated ticks", result.sliderPersisted);
ok("mid-drag slider value kept across unrelated ticks", result.sliderValueKept);
ok("vault-boy element persisted across unrelated ticks", result.vbPersisted);
ok("every card re-rendered when its watched entity changed",
  Object.keys(result.afterWatched).every((k) => result.afterWatched[k] === result.afterFirst[k] + 1));
ok("vault-boy pose switched to radiation past threshold", result.vbAnim === "radiation");

let pass = true;
for (const [name, good] of checks) { console.log((good ? "PASS " : "FAIL ") + name); if (!good) pass = false; }
if (errs.length) { console.log("PAGE ERRORS:\n" + errs.join("\n")); pass = false; }
console.log("\nrenderCounts:", JSON.stringify(result.afterFirst), "->unrelated", JSON.stringify(result.afterUnrelated), "->watched", JSON.stringify(result.afterWatched));
process.exit(pass ? 0 : 1);
