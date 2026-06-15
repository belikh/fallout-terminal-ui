/*
  fallout-header-card — Vault-Tec / RobCo terminal banner.

  The branded top strip every terminal opens with: Vault Boy mascot, terminal title + version,
  a live clock, the operator id, and an optional SYSTEM HEALTH line driven by real entities.

  config:
    type:     custom:fallout-header-card
    title:    "VAULT-TEC HOME ASSISTANT"   (optional)
    subtitle: "VAULT 001"                  (optional; small, after the title)
    user:     "ADMIN_JUPITER"              (optional)
    vault_boy: true                        (optional; show the mascot, default true)
    animation: thumbs_up                   (optional vault-boy pose)
    status:                                (optional SYSTEM HEALTH chips)
      - label: SYSTEM HEALTH
        entity: binary_sensor.energy_power_meter_grid_overload
        map: { "off": { label: OPTIMAL, level: ok }, "on": { label: OVERLOAD, level: alert } }
      - { label: CONNECTIVITY, text: SECURE, level: ok }
*/
(function () {
  const register = () => {
    if (!window.RobCoFallout) return;
    const { FalloutBaseCard, defineFalloutCard, defineFalloutEditor, escapeHtml, v } = window.RobCoFallout;

    class FalloutHeaderCard extends FalloutBaseCard {
      static getStubConfig() {
        return { type: "custom:fallout-header-card", title: "VAULT-TEC HOME ASSISTANT", subtitle: "VAULT 001" };
      }
      static getConfigElement() { return document.createElement("fallout-header-card-editor"); }
      getCardSize() { return 2; }

      _watchedEntities() {
        return (this._config && this._config.status || []).map((s) => s.entity).filter(Boolean);
      }

      connectedCallback() {
        if (super.connectedCallback) super.connectedCallback();
        this._tick = setInterval(() => this._paintClock(), 1000);
      }
      disconnectedCallback() {
        if (super.disconnectedCallback) super.disconnectedCallback();
        if (this._tick) clearInterval(this._tick);
      }

      _now() {
        const d = new Date();
        const p = (n) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
      }
      _paintClock() {
        const el = this.body && this.body.querySelector(".rc-clock");
        if (el) el.textContent = this._now();
      }

      _statusHtml() {
        const items = this._config.status || [];
        if (!items.length) return "";
        const parts = items.map((s) => {
          let val = s.text != null ? s.text : "";
          let level = s.level || "ok";
          if (s.entity) {
            const st = this.stateObj(s.entity);
            const raw = st ? st.state : "—";
            const map = s.map && s.map[raw];
            if (map) { val = map.label != null ? map.label : raw; level = map.level || level; }
            else { val = s.text != null ? s.text : raw; if (raw === "unavailable" || raw === "unknown") level = "alert"; }
          }
          const cls = level === "warn" ? "warn" : level === "alert" ? "alert" : "ok";
          return `<span class="rc-item">${escapeHtml(s.label || "")}: <span class="${cls}">${escapeHtml(String(val).toUpperCase())}</span></span>`;
        });
        return `<div class="rc-status">${parts.join('<span class="rc-sep">//</span>')}</div>`;
      }

      _render() {
        const c = this._config;
        const title = c.title || "VAULT-TEC HOME ASSISTANT";
        const sub = c.subtitle ? `<span class="rc-sub">${escapeHtml(c.subtitle)}</span>` : "";
        const user = c.user || "ADMIN";
        const vb = c.vault_boy === false ? ""
          : `<div class="rc-vb"><fallout-vault-boy animation="${escapeHtml(c.animation || "thumbs_up")}" color="${v("accent")}"></fallout-vault-boy></div>`;
        this.body.innerHTML = `
          <style>
            .rc-top { display:flex; align-items:center; gap:16px; }
            .rc-vb { width:44px; height:50px; flex:none; }
            .rc-title { flex:1; font-size:1.35em; font-weight:bold; letter-spacing:3px; text-transform:uppercase; color:${v("accent")}; line-height:1.1; }
            .rc-title .rc-sub { font-size:0.55em; opacity:0.7; letter-spacing:2px; margin-left:10px; white-space:nowrap; }
            .rc-meta { text-align:right; font-size:0.85em; letter-spacing:1px; line-height:1.5; white-space:nowrap; }
            .rc-clock { display:block; font-weight:bold; }
            .rc-user { opacity:0.75; }
            .rc-status { margin-top:8px; padding-top:7px; border-top:1px solid ${v("accent-dim")}; font-size:0.8em; letter-spacing:1px; text-transform:uppercase; display:flex; flex-wrap:wrap; gap:6px 10px; align-items:center; }
            .rc-sep { opacity:0.35; }
          </style>
          <div class="rc-top">
            ${vb}
            <div class="rc-title">${escapeHtml(title)}${sub}</div>
            <div class="rc-meta"><span class="rc-clock">${this._now()}</span><span class="rc-user">${escapeHtml(user)}</span></div>
          </div>
          ${this._statusHtml()}`;
      }
    }

    defineFalloutEditor("fallout-header-card-editor", [
      { name: "title", type: "text", label: "Title" },
      { name: "subtitle", type: "text", label: "Subtitle (optional)" },
      { name: "user", type: "text", label: "Operator id (optional)" },
    ]);

    defineFalloutCard("fallout-header-card", FalloutHeaderCard, {
      name: "RobCo Header",
      description: "Vault-Tec terminal banner: Vault Boy, live clock, operator + system health.",
    });
  };

  if (window.RobCoFallout) register();
  else {
    const interval = setInterval(() => {
      if (window.RobCoFallout) { clearInterval(interval); register(); }
    }, 50);
  }
})();
