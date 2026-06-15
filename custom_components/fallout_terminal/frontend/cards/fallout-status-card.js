/*
  fallout-status-card — terminal-style status readout for any entity.

  Maps the entity's state to a label + severity ([OK]/[WARN]/[ALERT]) so the card reflects what the
  thing is actually doing. Sensible defaults for binary_sensor device_class=problem; fully
  overridable per state.

  config:
    type:   custom:fallout-status-card
    entity: binary_sensor.xxx       (required)
    name:   "HULL INTEGRITY"        (optional)
    states:                         (optional; per-state label + level)
      on:  { label: "BREACH", level: "alert" }
      off: { label: "SEALED", level: "ok" }
*/
(function () {
  const { FalloutBaseCard, defineFalloutCard, defineFalloutEditor, escapeHtml } = window.RobCoFallout;

  // Defaults so the card is useful with zero per-state config.
  const PROBLEM_CLASSES = ["problem", "safety", "smoke", "gas", "moisture", "tamper", "co"];

  class FalloutStatusCard extends FalloutBaseCard {
    _validate(config) {
      if (!config.entity) throw new Error("fallout-status-card: 'entity' is required");
    }
    static getStubConfig() { return { type: "custom:fallout-status-card", entity: "" }; }
    static getConfigElement() { return document.createElement("fallout-status-card-editor"); }

    _resolve(stateObj) {
      const cfg = this._config;
      const raw = stateObj.state;
      const map = (cfg.states && cfg.states[raw]) || null;
      if (map) return { label: map.label || raw, level: map.level || "ok" };

      // Defaults: unavailable/unknown -> alert; problem-class binary_sensor on -> alert.
      if (raw === "unavailable" || raw === "unknown") return { label: "OFFLINE", level: "alert" };
      const dc = stateObj.attributes.device_class;
      if (PROBLEM_CLASSES.includes(dc)) {
        return raw === "on"
          ? { label: "DETECTED", level: "alert" }
          : { label: "CLEAR", level: "ok" };
      }
      const level = raw === "on" || raw === "open" || raw === "unlocked" || raw === "home" ? "ok" : "dim";
      return { label: raw, level };
    }

    _render() {
      const cfg = this._config;
      const title = cfg.name || this.friendlyName(cfg.entity);
      const s = this.stateObj(cfg.entity);

      if (!s) {
        this.body.innerHTML =
          this.header(title, "missing") +
          `<div class="fallout-unavailable blink">&gt; ENTITY NOT FOUND</div>`;
        return;
      }

      const { label, level } = this._resolve(s);
      const cls = level === "dim" ? "dim" : level;
      const when = s.last_changed ? new Date(s.last_changed).toLocaleString() : "";

      this.body.innerHTML =
        this.header(title, escapeHtml(cfg.entity)) +
        `<div style="font-size:1.2em;letter-spacing:1px;cursor:pointer;" class="line">
           &gt; STATUS: [ <span class="${cls}">${escapeHtml(String(label).toUpperCase())}</span> ]
         </div>
         <div class="dim" style="font-size:0.7em;margin-top:10px;border-top:1px dashed ${window.RobCoFallout.v("accent-soft")};padding-top:6px;">
           LAST CHANGE: ${escapeHtml(when)}
         </div>`;

      this.body.querySelector(".line").addEventListener("click", () => this.moreInfo(cfg.entity));
    }
  }

  defineFalloutEditor("fallout-status-card-editor", [
    { name: "entity", type: "entity", label: "Entity" },
    { name: "name", type: "text", label: "Title (optional)" },
  ]);

  defineFalloutCard("fallout-status-card", FalloutStatusCard, {
    name: "RobCo Status",
    description: "Terminal status readout with [OK]/[WARN]/[ALERT] severity.",
  });
})();
