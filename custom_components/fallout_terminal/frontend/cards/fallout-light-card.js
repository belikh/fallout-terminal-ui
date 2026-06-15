/*
  fallout-light-card — a first-class lighting panel for the most-used control in the house.

  fallout-control-card treats a light as a bare ON/OFF toggle (a light is "toggleable"), which throws
  away everything that makes a light a light. This card binds the actual capabilities the entity
  reports and shows ONLY the controls it supports:
    - power:        ON/OFF toggle (always)
    - brightness:   percentage readout + CRT meter + slider   (any non-onoff color mode)
    - colour temp:  WARM <-> COOL slider in kelvin             (supported_color_modes includes color_temp)
    - colour:       RobCo preset swatches -> rgb_color         (hs / rgb / rgbw / rgbww / xy)

  Capabilities come from `supported_color_modes`, so a plain on/off smart plug masquerading as a light
  degrades cleanly to just the toggle.

  config:
    type:     custom:fallout-light-card
    entity:   light.xxx              (required)
    name:     "OVERHEAD"             (optional)
    presets:  [{ name: "AMBER", rgb: [255,176,0] }, ...]   (optional; overrides default swatches)
*/
(function () {
  const register = () => {
    if (!window.RobCoFallout) return;
    const { FalloutBaseCard, defineFalloutCard, defineFalloutEditor, escapeHtml, v } = window.RobCoFallout;

    // Colour modes that carry a brightness channel (everything except plain on/off).
    const BRIGHTNESS_MODES = ["brightness", "color_temp", "hs", "rgb", "rgbw", "rgbww", "xy", "white"];
    const COLOUR_MODES = ["hs", "rgb", "rgbw", "rgbww", "xy"];

    // RobCo-issue mood palette — actual colours, terminal-flavoured names.
    const DEFAULT_PRESETS = [
      { name: "WARM",  rgb: [255, 197, 143] },
      { name: "AMBER", rgb: [255, 176, 0] },
      { name: "GREEN", rgb: [60, 255, 120] },
      { name: "BLUE",  rgb: [90, 170, 255] },
      { name: "RED",   rgb: [255, 70, 60] },
    ];

    class FalloutLightCard extends FalloutBaseCard {
      _validate(config) {
        if (!config.entity) throw new Error("fallout-light-card: 'entity' is required");
        if (config.entity.split(".")[0] !== "light")
          throw new Error("fallout-light-card: 'entity' must be a light");
      }
      static getStubConfig() { return { type: "custom:fallout-light-card", entity: "" }; }
      static getConfigElement() { return document.createElement("fallout-light-card-editor"); }

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

        const on = s.state === "on";
        const a = s.attributes || {};
        const modes = a.supported_color_modes || [];
        const hasBrightness = modes.some((m) => BRIGHTNESS_MODES.includes(m));
        const hasColourTemp = modes.includes("color_temp");
        const hasColour = modes.some((m) => COLOUR_MODES.includes(m));

        const briPct = a.brightness != null ? Math.round((a.brightness / 255) * 100) : (on ? 100 : 0);
        const accent = v("accent");

        let html = this.header(title, on ? `${briPct}%` : "OFF");

        // ---- power line ------------------------------------------------------
        html += `
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;">
            <span style="font-size:1.05em;">&gt; <span class="${on ? "ok" : "dim"}">${on ? "ONLINE" : "OFFLINE"}</span></span>
            <button class="fallout-btn" data-act="power">${on ? "&gt; OFF" : "&gt; ON"}</button>
          </div>`;

        // ---- brightness ------------------------------------------------------
        if (hasBrightness) {
          html += `
            <div class="fl-section">
              <div class="fl-label"><span>BRIGHTNESS</span><span class="${on ? "ok" : "dim"}">${briPct}%</span></div>
              <div class="meter"><div class="fill" style="width:${on ? briPct : 0}%;"></div></div>
              <input type="range" class="fallout-range" data-act="brightness" min="1" max="100" step="1"
                     value="${briPct < 1 ? 1 : briPct}"
                     style="width:100%;accent-color:${accent};cursor:pointer;margin-top:8px;">
            </div>`;
        }

        // ---- colour temperature ---------------------------------------------
        if (hasColourTemp) {
          const minK = a.min_color_temp_kelvin || 2000;
          const maxK = a.max_color_temp_kelvin || 6500;
          const curK = a.color_temp_kelvin != null ? a.color_temp_kelvin : Math.round((minK + maxK) / 2);
          html += `
            <div class="fl-section">
              <div class="fl-label"><span>COLOUR TEMP</span><span class="dim">${curK}K</span></div>
              <input type="range" class="fallout-range" data-act="temp" min="${minK}" max="${maxK}" step="50"
                     value="${curK}"
                     style="width:100%;cursor:pointer;background:linear-gradient(90deg,#ffb46e,#fff,#9ec7ff);height:6px;border-radius:3px;appearance:none;-webkit-appearance:none;">
              <div class="fl-ends"><span>WARM</span><span>COOL</span></div>
            </div>`;
        }

        // ---- colour presets --------------------------------------------------
        if (hasColour) {
          const presets = Array.isArray(cfg.presets) && cfg.presets.length ? cfg.presets : DEFAULT_PRESETS;
          const cur = a.rgb_color;
          const swatches = presets.map((p, i) => {
            const rgb = Array.isArray(p.rgb) ? p.rgb : [255, 255, 255];
            const active = cur && cur[0] === rgb[0] && cur[1] === rgb[1] && cur[2] === rgb[2];
            return `<button class="fl-swatch${active ? " active" : ""}" data-act="colour" data-i="${i}"
                       title="${escapeHtml(p.name || "")}"
                       style="background:rgb(${rgb[0]},${rgb[1]},${rgb[2]});"></button>`;
          }).join("");
          html += `
            <div class="fl-section">
              <div class="fl-label"><span>COLOUR</span></div>
              <div class="fl-swatches">${swatches}</div>
            </div>`;
          this._presets = presets;
        }

        html += this._styles();
        this.body.innerHTML = html;
        this._attach(cfg.entity);
      }

      _attach(entity) {
        const turnOn = (data) => this.callService("light", "turn_on", Object.assign({ entity_id: entity }, data));
        const q = (sel) => this.body.querySelector(sel);

        const power = q('[data-act="power"]');
        if (power) power.addEventListener("click", () => this.callService("light", "toggle", { entity_id: entity }));

        const bri = q('[data-act="brightness"]');
        if (bri) bri.addEventListener("change", (e) => turnOn({ brightness_pct: Number(e.target.value) }));

        const temp = q('[data-act="temp"]');
        if (temp) temp.addEventListener("change", (e) => turnOn({ color_temp_kelvin: Number(e.target.value) }));

        this.body.querySelectorAll('[data-act="colour"]').forEach((b) =>
          b.addEventListener("click", () => {
            const p = this._presets[Number(b.dataset.i)];
            if (p && Array.isArray(p.rgb)) turnOn({ rgb_color: p.rgb });
          })
        );
      }

      _styles() {
        return `<style>
          .fl-section { margin-top: 14px; }
          .fl-label { display:flex; justify-content:space-between; align-items:baseline;
            font-size:0.78em; letter-spacing:2px; text-transform:uppercase; margin-bottom:6px; opacity:0.95; }
          .fl-ends { display:flex; justify-content:space-between; font-size:0.62em;
            letter-spacing:1px; opacity:0.55; margin-top:4px; }
          .fl-swatches { display:flex; gap:8px; flex-wrap:wrap; }
          .fl-swatch { width:34px; height:26px; border:1px solid ${v("accent-dim")}; border-radius:3px;
            cursor:pointer; padding:0; transition:transform 0.08s, box-shadow 0.08s; }
          .fl-swatch:hover { transform:translateY(-1px); }
          .fl-swatch.active { border:2px solid ${v("accent")}; box-shadow:0 0 8px ${v("glow")}; }
        </style>`;
      }
    }

    defineFalloutEditor("fallout-light-card-editor", [
      { name: "entity", type: "entity", label: "Light", domains: ["light"] },
      { name: "name", type: "text", label: "Title (optional)" },
    ]);

    defineFalloutCard("fallout-light-card", FalloutLightCard, {
      name: "RobCo Light",
      description: "Full lighting control: power, brightness, colour temperature, and colour presets.",
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
