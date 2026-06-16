/*
  fallout-gauge-card — a Pip-Boy style meter for any numeric sensor.

  Binds to a real entity and renders its value as a big phosphor readout plus a segmented bar.
  Colour follows configurable thresholds (e.g. amber over 60, red over 85), so the card actually
  reflects the state of the thing it monitors.

  config:
    type:     custom:fallout-gauge-card
    entity:   sensor.xxx            (required, numeric)
    name:     "REACTOR OUTPUT"      (optional; defaults to friendly name)
    min:      0                     (optional, default 0)
    max:      100                   (optional, default 100)
    unit:     "%"                   (optional; defaults to the entity's unit)
    decimals: 1                     (optional, default 1)
    invert:   false                 (optional; true = lower values fill the bar)
    segments:                       (optional; first matching upper-bound wins)
      - { to: 60,  color: var(--fallout-accent) }
      - { to: 85,  color: var(--fallout-warn) }
      - { to: 100, color: var(--fallout-alert) }
*/
(function () {
  const register = () => {
    if (!window.RobCoFallout) return;
    const { FalloutBaseCard, defineFalloutCard, defineFalloutEditor, escapeHtml, v } = window.RobCoFallout;

    const SEGMENT_COUNT = 20;

    class FalloutGaugeCard extends FalloutBaseCard {
      _validate(config) {
        if (!config.entity) throw new Error("fallout-gauge-card: 'entity' is required");
      }

      static getStubConfig() {
        return { type: "custom:fallout-gauge-card", entity: "", min: 0, max: 100 };
      }
      static getConfigElement() {
        return document.createElement("fallout-gauge-card-editor");
      }

      /** Pick a colour for the current value from the configured segments. */
      _colorFor(value) {
        const segments = this._config.segments;
        if (!Array.isArray(segments) || segments.length === 0) return v("accent");
        for (const seg of segments) {
          if (value <= Number(seg.to)) return seg.color || v("accent");
        }
        return segments[segments.length - 1].color || v("accent");
      }

      _render() {
        const cfg = this._config;
        const title = cfg.name || this.friendlyName(cfg.entity);

        if (!this.isAvailable(cfg.entity)) {
          this.body.innerHTML =
            this.header(title, "no signal") +
            `<div class="fallout-unavailable blink">&gt; SIGNAL LOST</div>`;
          return;
        }

        const value = this.num(cfg.entity);
        const min = cfg.min != null ? Number(cfg.min) : 0;
        const max = cfg.max != null ? Number(cfg.max) : 100;
        const unit = cfg.unit != null ? cfg.unit : this.unit(cfg.entity);
        const decimals = cfg.decimals != null ? Number(cfg.decimals) : 1;

        let pct = value == null ? 0 : ((value - min) / (max - min)) * 100;
        pct = Math.max(0, Math.min(100, pct));
        const fillPct = cfg.invert ? 100 - pct : pct;

        const color = this._colorFor(value == null ? min : value);
        const filledSegments = Math.round((fillPct / 100) * SEGMENT_COUNT);

        let ticks = "";
        for (let i = 0; i < SEGMENT_COUNT; i++) {
          const on = i < filledSegments;
          ticks +=
            `<span style="flex:1;height:100%;background:${on ? color : "transparent"};` +
            `box-shadow:${on ? "0 0 6px " + color : "none"};"></span>`;
        }

        const display = value == null ? "--" : value.toFixed(decimals);

        this.body.innerHTML =
          this.header(title) +
          `<div style="display:flex;align-items:baseline;justify-content:center;gap:6px;margin:4px 0 12px;">
             <span style="font-size:2.6em;font-weight:bold;line-height:1;color:${color};text-shadow:0 0 10px ${color};">${escapeHtml(display)}</span>
             <span style="font-size:0.9em;opacity:0.7;">${escapeHtml(unit)}</span>
           </div>
           <div class="meter" style="display:flex;gap:2px;padding:2px;height:18px;cursor:pointer;" title="${escapeHtml(this.friendlyName(cfg.entity))}">${ticks}</div>
           <div style="display:flex;justify-content:space-between;font-size:0.7em;opacity:0.6;margin-top:4px;">
             <span>${escapeHtml(String(min))}</span><span>${escapeHtml(String(max))}</span>
           </div>`;

        const meter = this.body.querySelector(".meter");
        meter.addEventListener("click", () => this.moreInfo(cfg.entity));
      }
    }

    defineFalloutEditor("fallout-gauge-card-editor", [
      { name: "entity", type: "entity", label: "Entity", domains: ["sensor", "input_number", "number", "counter"] },
      { name: "name", type: "text", label: "Title (optional)" },
      { name: "min", type: "number", label: "Minimum", placeholder: "0" },
      { name: "max", type: "number", label: "Maximum", placeholder: "100" },
      { name: "unit", type: "text", label: "Unit override (optional)" },
      { name: "invert", type: "boolean", label: "Invert (lower is fuller)" },
    ]);

    defineFalloutCard("fallout-gauge-card", FalloutGaugeCard, {
      name: "RobCo Gauge",
      description: "Pip-Boy meter for any numeric sensor, with threshold colours.",
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
