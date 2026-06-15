/*
  ROBCO INDUSTRIES — FALLOUT DESIGN SYSTEM
  fallout-core.js — shared foundation for every card.

  Exposes a single global, window.RobCoFallout, so the rest of the suite can load as plain ordered
  scripts (no module/relative-URL resolution to depend on). The integration registers this file
  first; every other card script reads from window.RobCoFallout.

  Provides:
    - FALLOUT_STYLE:  design tokens (themed via --fallout-*) + CRT chrome + utility classes,
      injected into each card's shadow root.
    - FalloutBaseCard: base custom element. Subclasses implement _render(); the base owns the
      lifecycle, the CRT shell, entity helpers, sizing and Lovelace registration.
    - defineFalloutCard(): registers a card + its card-picker entry in one call.
    - defineFalloutEditor(): builds a per-card visual editor from a small field schema, so each
      card exposes exactly its own options (no shared editor guessing at fields).

  Design tokens default to classic phosphor green. Themes (fallout_retro.yaml) re-skin every card
  by overriding the --fallout-* variables; CSS custom properties inherit through shadow roots, so a
  single theme switch repaints the whole suite.
*/
(function () {
  "use strict";

  const FALLOUT_VERSION = "4.1.0";

  // Self-host the monofonto display face (Typodermic), served by the integration under
  // /fallout_terminal_ui/assets/. Registered once at the document level so the face is available
  // inside every card's shadow root (shadow roots inherit document-registered @font-face).
  (function injectFontFace() {
    if (typeof document === "undefined" || document.getElementById("robco-fallout-fontface")) return;
    const style = document.createElement("style");
    style.id = "robco-fallout-fontface";
    style.textContent =
      '@font-face{font-family:"monofonto";' +
      'src:url("/fallout_terminal_ui/assets/monofonto.otf") format("opentype");' +
      "font-weight:normal;font-style:normal;font-display:swap;}";
    (document.head || document.documentElement).appendChild(style);
  })();

  // Token defaults. A theme (fallout_retro.yaml) re-skins everything by setting these --fallout-*
  // vars on the document; they inherit through shadow roots. Consumers reference them WITH the
  // default as the var() fallback — never a self-referential :host block, which CSS treats as a
  // cyclic dependency (guaranteed-invalid) and silently collapses every colour to inherited black.
  const DEFAULTS = {
    accent: "#9cff57",
    "accent-dim": "#5f9c3a",
    "accent-soft": "rgba(156, 255, 87, 0.18)",
    text: "#b8ff9a",
    bg: "#0b0f0a",
    "bg-elev": "#11160f",
    warn: "#e6c15a",
    alert: "#ff6b5e",
    glow: "rgba(156, 255, 87, 0.55)",
    radius: "6px",
    font: `"monofonto", "Share Tech Mono", "IBM Plex Mono", "Courier New", monospace`,
    "scanline-opacity": "0.25",
    "flicker-opacity": "0.04",
  };

  /** Themeable token reference: v("accent") -> 'var(--fallout-accent, #9cff57)'. */
  function v(name) {
    return `var(--fallout-${name}, ${DEFAULTS[name]})`;
  }

  const FALLOUT_STYLE = `
    * { box-sizing: border-box; }

    .fallout-card {
      position: relative;
      background: ${v("bg")};
      color: ${v("text")};
      border: 1px solid ${v("accent-dim")};
      border-radius: ${v("radius")};
      padding: 16px 18px;
      font-family: ${v("font")};
      text-shadow: 0 0 4px ${v("glow")};
      box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.85), 0 0 16px rgba(0, 0, 0, 0.5);
      overflow: hidden;
    }

    /* Scanlines + subtle RGB shadow-mask, the way a CRT actually looks. */
    .fallout-card::before {
      content: "";
      position: absolute; inset: 0;
      background:
        linear-gradient(rgba(0,0,0,0) 50%, rgba(0,0,0,${v("scanline-opacity")}) 51%),
        linear-gradient(90deg, rgba(255,0,0,0.04), rgba(0,255,0,0.015), rgba(0,0,255,0.04));
      background-size: 100% 3px, 3px 100%;
      z-index: 4; pointer-events: none;
    }
    /* Phosphor flicker + edge vignette (the glass curvature falloff). */
    .fallout-card::after {
      content: "";
      position: absolute; inset: 0;
      background: radial-gradient(120% 120% at 50% 50%, transparent 60%, rgba(0,0,0,0.5) 100%);
      z-index: 5; pointer-events: none;
      animation: fallout-flicker 0.12s steps(2, end) infinite;
    }
    @keyframes fallout-flicker {
      0% { opacity: calc(${v("flicker-opacity")} * 1.4); }
      50% { opacity: calc(${v("flicker-opacity")} * 0.3); }
      100% { opacity: ${v("flicker-opacity")}; }
    }

    .fallout-body { position: relative; z-index: 6; }

    .fallout-header {
      display: flex; justify-content: space-between; align-items: baseline; gap: 12px;
      border-bottom: 1px solid ${v("accent-dim")};
      padding-bottom: 6px; margin-bottom: 12px;
      text-transform: uppercase; letter-spacing: 2px;
      font-weight: bold; font-size: 1.05em;
      color: ${v("accent")};
    }
    .fallout-header .sub { font-size: 0.6em; letter-spacing: 1px; opacity: 0.7; }

    .ok    { color: ${v("accent")}; }
    .warn  { color: ${v("warn")}; }
    .alert { color: ${v("alert")}; text-shadow: 0 0 8px ${v("alert")}; }
    .dim   { opacity: 0.6; }
    .blink { animation: fallout-blink 1s step-end infinite; }
    @keyframes fallout-blink { 50% { opacity: 0; } }

    .fallout-btn {
      background: none;
      border: 1px solid ${v("accent")};
      color: ${v("accent")};
      font-family: ${v("font")};
      text-transform: uppercase; letter-spacing: 2px; font-weight: bold;
      padding: 10px 18px; cursor: pointer;
      transition: background 0.08s, color 0.08s;
      text-shadow: 0 0 4px ${v("glow")};
    }
    .fallout-btn:hover { background: ${v("accent-soft")}; }
    .fallout-btn:active { background: ${v("accent")}; color: ${v("bg")}; }

    .meter { height: 12px; border: 1px solid ${v("accent-dim")}; background: ${v("accent-soft")}; position: relative; overflow: hidden; }
    .meter > .fill { height: 100%; background: ${v("accent")}; transition: width 0.5s ease; }

    .fallout-unavailable { color: ${v("alert")}; letter-spacing: 1px; }
  `;

  /** Escape user/config strings before injecting into innerHTML. */
  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  /**
   * Base element for every Fallout card.
   *
   * Lifecycle: Lovelace calls setConfig() then sets .hass repeatedly. We build the static CRT shell
   * once, then call the subclass _render() on every hass/config change to repaint the body.
   *
   * Subclasses implement:
   *   _render()         -> write this.body.innerHTML and (re)attach listeners.
   *   _validate(config) -> optional; throw to reject an invalid config.
   *   static getStubConfig / getConfigElement -> for the visual editor.
   */
  class FalloutBaseCard extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this._built = false;
    }

    setConfig(config) {
      if (!config) throw new Error("Invalid configuration");
      if (this._validate) this._validate(config);
      this._config = config;
      this._built = false; // structure may depend on config; rebuild shell
      if (this._hass) this._update();
    }

    set hass(hass) {
      this._hass = hass;
      this._update();
    }
    get hass() { return this._hass; }

    _update() {
      const hass = this._hass;
      if (!hass || !this._config) return;
      let firstBuild = false;
      if (!this._built) {
        this.shadowRoot.innerHTML =
          `<style>${FALLOUT_STYLE}</style>` +
          `<div class="fallout-card"><div class="fallout-body"></div></div>`;
        this.body = this.shadowRoot.querySelector(".fallout-body");
        this._built = true;
        firstBuild = true;
      }
      // Home Assistant assigns `.hass` on EVERY state change in the house, several times a
      // second. Re-rendering each time restarts CSS animations and rebuilds controls mid-
      // interaction (e.g. a slider snapping back while dragged). Only re-render when an entity
      // this card watches actually changed — HA replaces the state object on any change, so
      // identity comparison catches both state and attribute updates.
      if (firstBuild || this._watchedChanged(hass)) this._render();
      this._lastHass = hass;
    }

    /** Entities whose changes should trigger a re-render. Default: the card's `entity`. */
    _watchedEntities() {
      return this._config && this._config.entity ? [this._config.entity] : [];
    }

    _watchedChanged(hass) {
      const prev = this._lastHass;
      if (!prev) return true;
      for (const id of this._watchedEntities()) {
        if (prev.states[id] !== hass.states[id]) return true;
      }
      return false;
    }

    getCardSize() { return (this._config && this._config.card_size) || 3; }

    // ---- entity helpers -----------------------------------------------------
    /** Raw state object, or undefined. */
    stateObj(entityId) { return this._hass && this._hass.states[entityId]; }

    /** True when the entity exists and isn't unavailable/unknown. */
    isAvailable(entityId) {
      const s = this.stateObj(entityId);
      return !!s && s.state !== "unavailable" && s.state !== "unknown";
    }

    /** Numeric state, or null when missing / non-numeric. */
    num(entityId) {
      const s = this.stateObj(entityId);
      if (!s) return null;
      const v = parseFloat(s.state);
      return Number.isFinite(v) ? v : null;
    }

    friendlyName(entityId) {
      const s = this.stateObj(entityId);
      return (s && s.attributes.friendly_name) || entityId || "";
    }

    unit(entityId) {
      const s = this.stateObj(entityId);
      return (s && s.attributes.unit_of_measurement) || "";
    }

    callService(domain, service, data) {
      return this._hass.callService(domain, service, data);
    }

    /** Open Home Assistant's more-info dialog for an entity. */
    moreInfo(entityId) {
      if (!entityId) return;
      const ev = new Event("hass-more-info", { bubbles: true, composed: true });
      ev.detail = { entityId };
      this.dispatchEvent(ev);
    }

    /** Shared header markup. */
    header(title, sub) {
      const right = sub ? `<span class="sub">${escapeHtml(sub)}</span>` : "";
      return `<div class="fallout-header"><span>${escapeHtml(title)}</span>${right}</div>`;
    }
  }

  /**
   * Register a card element + its entry in the Lovelace card picker.
   */
  function defineFalloutCard(tag, cls, meta) {
    if (!customElements.get(tag)) customElements.define(tag, cls);
    window.customCards = window.customCards || [];
    if (!window.customCards.some((c) => c.type === tag)) {
      window.customCards.push({
        type: tag,
        name: (meta && meta.name) || tag,
        description: (meta && meta.description) || "RobCo Industries component",
        preview: true,
      });
    }
  }

  /**
   * Build a per-card visual editor from a field schema and register it.
   * Each entry: { name, type: "entity"|"text"|"number"|"boolean", label, placeholder?, domains? }
   *
   * The editor only reads/writes the fields the card actually uses, which keeps config and rendered
   * card in sync (the old shared editor wrote `title` while a card read `name`, silently dropping it).
   */
  function defineFalloutEditor(tag, schema) {
    if (customElements.get(tag)) return;
    class FalloutEditor extends HTMLElement {
      setConfig(config) {
        this._config = Object.assign({}, config);
        this._render();
      }
      set hass(hass) {
        this._hass = hass;
        this._render();
      }
      _render() {
        if (!this._hass || !this._config) return;
        if (!this._built) {
          this.innerHTML = `<div style="display:flex;flex-direction:column;gap:14px;"></div>`;
          this._root = this.firstElementChild;
          this._built = true;
          for (const field of schema) this._addField(field);
        } else {
          for (const el of this._root.children) {
            if ("hass" in el) el.hass = this._hass;
          }
        }
      }
      _addField(field) {
        let el;
        if (field.type === "entity") {
          el = document.createElement("ha-entity-picker");
          el.hass = this._hass;
          if (field.domains) el.includeDomains = field.domains;
          el.label = field.label;
          el.value = this._config[field.name] || "";
          el.addEventListener("value-changed", (e) => this._set(field.name, e.detail.value));
        } else if (field.type === "boolean") {
          el = document.createElement("ha-formfield");
          el.label = field.label;
          const sw = document.createElement("ha-switch");
          sw.checked = !!this._config[field.name];
          sw.addEventListener("change", (e) => this._set(field.name, e.target.checked));
          el.appendChild(sw);
        } else {
          el = document.createElement("ha-textfield");
          el.label = field.label;
          if (field.placeholder) el.placeholder = field.placeholder;
          if (field.type === "number") el.type = "number";
          el.value = this._config[field.name] == null ? "" : this._config[field.name];
          el.addEventListener("input", (e) => {
            let v = e.target.value;
            if (field.type === "number" && v !== "") v = Number(v);
            this._set(field.name, v);
          });
        }
        this._root.appendChild(el);
      }
      _set(name, value) {
        if (value === "" || value === undefined || value === null) delete this._config[name];
        else this._config[name] = value;
        this.dispatchEvent(
          new CustomEvent("config-changed", {
            detail: { config: this._config },
            bubbles: true,
            composed: true,
          })
        );
      }
    }
    customElements.define(tag, FalloutEditor);
  }

  window.RobCoFallout = Object.assign(window.RobCoFallout || {}, {
    VERSION: FALLOUT_VERSION,
    FALLOUT_STYLE,
    DEFAULTS,
    v, // v("accent") -> themeable 'var(--fallout-accent, #9cff57)' for inline card styles
    FalloutBaseCard,
    defineFalloutCard,
    defineFalloutEditor,
    escapeHtml,
  });

  console.info(
    `%c ROBCO FALLOUT UI %c v${FALLOUT_VERSION} `,
    "background:#0b0f0a;color:#9cff57;font-weight:bold;",
    "background:#9cff57;color:#0b0f0a;font-weight:bold;"
  );
})();
