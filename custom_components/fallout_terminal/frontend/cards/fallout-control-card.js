/*
  fallout-control-card — one interactive control that adapts to the entity's domain.

  Replaces the old suite's nine near-identical "INITIALIZE X" buttons. The rendered control matches
  what the entity actually is and calls the correct service:
    - toggleable (switch/fan/input_boolean/automation/humidifier/siren):         ON/OFF toggle
    - light:                                                                      ON/OFF + brightness slider
    - lock:                                                                       SEAL / UNSEAL
    - momentary (button/input_button/scene/script):                              EXECUTE press
    - numeric (input_number/number):                                             slider -> set_value
    - cover:                                                                      OPEN / STOP / CLOSE

  For full lighting control (colour temperature + colour presets) use fallout-light-card instead.

  config:
    type:    custom:fallout-control-card
    entity:  switch.xxx        (required)
    name:    "PERIMETER TURRET" (optional)
*/
(function () {
  const register = () => {
    if (!window.RobCoFallout) return;
    const { FalloutBaseCard, defineFalloutCard, defineFalloutEditor, escapeHtml, v } = window.RobCoFallout;

    const TOGGLEABLE = ["switch", "fan", "input_boolean", "automation", "humidifier", "siren"];
    const MOMENTARY = { button: "press", input_button: "press", scene: "turn_on", script: "turn_on" };

    class FalloutControlCard extends FalloutBaseCard {
      _validate(config) {
        if (!config.entity) throw new Error("fallout-control-card: 'entity' is required");
      }
      static getStubConfig() { return { type: "custom:fallout-control-card", entity: "" }; }
      static getConfigElement() { return document.createElement("fallout-control-card-editor"); }

      _domain() { return this._config.entity.split(".")[0]; }

      _render() {
        const cfg = this._config;
        const title = cfg.name || this.friendlyName(cfg.entity);
        const s = this.stateObj(cfg.entity);

        if (!s) {
          this.body.innerHTML =
            this.header(title, "missing") +
            `<div class="fallout-unavailable blink">&gt; NO LINK TO DEVICE</div>`;
          return;
        }

        const domain = this._domain();
        let controlHtml, attach;

        if (domain === "light") {
          // Lights get a brightness slider beneath the toggle when they support dimming. (Colour
          // temperature + colour presets live in the dedicated fallout-light-card.)
          const on = s.state === "on";
          const modes = s.attributes.supported_color_modes || [];
          const dimmable = modes.some((m) =>
            ["brightness", "color_temp", "hs", "rgb", "rgbw", "rgbww", "xy", "white"].includes(m));
          const briPct = s.attributes.brightness != null
            ? Math.round((s.attributes.brightness / 255) * 100) : (on ? 100 : 0);
          controlHtml = this._toggle(on) + (dimmable ? `
            <div style="margin-top:12px;">
              <div class="dim" style="font-size:0.72em;letter-spacing:2px;display:flex;justify-content:space-between;">
                <span>BRIGHTNESS</span><span>${on ? briPct : 0}%</span></div>
              <input type="range" class="fallout-range" min="1" max="100" step="1" value="${briPct < 1 ? 1 : briPct}"
                     style="width:100%;accent-color:${v("accent")};cursor:pointer;margin-top:6px;">
            </div>` : "");
          attach = () => {
            this.body.querySelector(".fallout-btn")
              .addEventListener("click", () => this.callService("light", "toggle", { entity_id: cfg.entity }));
            const r = this.body.querySelector("input[type=range]");
            if (r) r.addEventListener("change", (e) =>
              this.callService("light", "turn_on", { entity_id: cfg.entity, brightness_pct: Number(e.target.value) }));
          };
        } else if (TOGGLEABLE.includes(domain)) {
          const on = s.state === "on";
          controlHtml = this._toggle(on);
          attach = () => this.body.querySelector(".fallout-btn")
            .addEventListener("click", () => this.callService("homeassistant", "toggle", { entity_id: cfg.entity }));
        } else if (domain === "lock") {
          const locked = s.state === "locked";
          controlHtml = this._toggle(locked, "SEALED", "OPEN", locked ? "&gt; UNSEAL" : "&gt; SEAL");
          attach = () => this.body.querySelector(".fallout-btn")
            .addEventListener("click", () => this.callService("lock", locked ? "unlock" : "lock", { entity_id: cfg.entity }));
        } else if (MOMENTARY[domain]) {
          controlHtml = `<div style="text-align:center;padding:8px 0;">
              <button class="fallout-btn">&gt; EXECUTE</button>
            </div>`;
          attach = () => this.body.querySelector(".fallout-btn")
            .addEventListener("click", () => this.callService(domain, MOMENTARY[domain], { entity_id: cfg.entity }));
        } else if (domain === "input_number" || domain === "number") {
          const val = this.num(cfg.entity);
          const min = s.attributes.min != null ? s.attributes.min : 0;
          const max = s.attributes.max != null ? s.attributes.max : 100;
          const step = s.attributes.step != null ? s.attributes.step : 1;
          controlHtml = `
            <div style="text-align:center;font-size:1.8em;font-weight:bold;color:${v("accent")};">${val == null ? "--" : escapeHtml(val)}<span style="font-size:0.5em;opacity:0.7;"> ${escapeHtml(this.unit(cfg.entity))}</span></div>
            <input type="range" class="fallout-range" min="${min}" max="${max}" step="${step}" value="${val == null ? min : val}"
                   style="width:100%;accent-color:${v("accent")};cursor:pointer;margin-top:8px;">`;
          attach = () => this.body.querySelector("input").addEventListener("change", (e) =>
            this.callService(domain, "set_value", { entity_id: cfg.entity, value: Number(e.target.value) }));
        } else if (domain === "cover") {
          controlHtml = `<div style="display:flex;gap:8px;justify-content:center;padding:6px 0;">
              <button class="fallout-btn" data-act="open_cover">&gt; OPEN</button>
              <button class="fallout-btn" data-act="stop_cover">&#9632;</button>
              <button class="fallout-btn" data-act="close_cover">&gt; CLOSE</button>
            </div>`;
          attach = () => this.body.querySelectorAll(".fallout-btn").forEach((b) =>
            b.addEventListener("click", () => this.callService("cover", b.dataset.act, { entity_id: cfg.entity })));
        } else {
          // Unknown domain: best-effort toggle, clearly labelled.
          controlHtml = `<div style="text-align:center;padding:8px 0;">
              <button class="fallout-btn">&gt; TOGGLE</button>
              <div class="dim" style="font-size:0.7em;margin-top:6px;">DOMAIN: ${escapeHtml(domain)}</div>
            </div>`;
          attach = () => this.body.querySelector(".fallout-btn")
            .addEventListener("click", () => this.callService("homeassistant", "toggle", { entity_id: cfg.entity }));
        }

        this.body.innerHTML = this.header(title, escapeHtml(s.state.toUpperCase())) + controlHtml;
        attach();
      }

      _toggle(active, onText, offText, btnText) {
        const label = active ? (onText || "ONLINE") : (offText || "OFFLINE");
        const cls = active ? "ok" : "dim";
        return `
          <div style="text-align:center;margin-bottom:10px;font-size:1.1em;">
            &gt; <span class="${cls}">${label}</span>
          </div>
          <div style="text-align:center;">
            <button class="fallout-btn">${btnText || "&gt; TOGGLE"}</button>
          </div>`;
      }
    }

    defineFalloutEditor("fallout-control-card-editor", [
      { name: "entity", type: "entity", label: "Entity" },
      { name: "name", type: "text", label: "Title (optional)" },
    ]);

    defineFalloutCard("fallout-control-card", FalloutControlCard, {
      name: "RobCo Control",
      description: "Domain-adaptive control: toggle / lock / press / slider / cover.",
    });
  };

  if (window.RobCoFallout) register();
  else {
    const interval = setInterval(() => {
      if (window.RobCoFallout) {
        clearInterval(interval);
        register();
      }
    }, 50);
  }
})();
