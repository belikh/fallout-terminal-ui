// Pip-Boy STATS card - Fallout-style CRT readout for body composition sensors.
class PipboyStatsCard extends HTMLElement {
  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this.config = config;
    this._build();
  }

  _build() {
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

        :host {
          --pip-green: #33ff66;
          --pip-green-dim: #1a8033;
          --pip-amber: #ffb000;
          --pip-bg: #03110a;
          display: block;
          font-family: 'Share Tech Mono', 'Courier New', monospace;
        }
        .crt {
          position: relative;
          background: var(--pip-bg);
          color: var(--pip-green);
          border: 2px solid var(--pip-green-dim);
          border-radius: 14px;
          padding: 16px 20px;
          text-shadow: 0 0 4px rgba(51,255,102,0.65), 0 0 1px rgba(51,255,102,0.9);
          overflow: hidden;
          animation: flicker 6s infinite;
          box-shadow: inset 0 0 60px rgba(51,255,102,0.08), 0 0 20px rgba(0,0,0,0.6);
        }
        .crt::after {
          content: "";
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,0.25) 3px);
          pointer-events: none;
          mix-blend-mode: multiply;
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          48% { opacity: 1; }
          50% { opacity: 0.96; }
          52% { opacity: 1; }
        }
        .header {
          display: flex; justify-content: space-between; align-items: center;
          border-bottom: 1px solid var(--pip-green-dim);
          padding-bottom: 8px; margin-bottom: 12px;
          flex-wrap: wrap; gap: 8px;
        }
        .brand { font-size: 0.75em; letter-spacing: 2px; opacity: 0.8; }
        .clock { font-size: 0.75em; letter-spacing: 1px; opacity: 0.8; }
        .tabs { display: flex; gap: 10px; flex-wrap: wrap; }
        .tabs a {
          color: var(--pip-green-dim); text-decoration: none; letter-spacing: 2px;
          font-size: 0.85em; padding: 2px 8px; border: 1px solid transparent; border-radius: 3px;
        }
        .tabs a.active { color: var(--pip-green); border: 1px solid var(--pip-green); }
        .tabs a:hover { color: var(--pip-green); }

        /* Two column layout */
        .main-container {
          display: grid;
          grid-template-columns: 1fr 180px;
          gap: 20px;
          margin-bottom: 16px;
          min-height: 280px;
        }
        @media (max-width: 500px) {
          .main-container { grid-template-columns: 1fr; }
          .vault-boy-column { display: none; }
        }

        .left-column { 
          display: flex; 
          flex-direction: column; 
          justify-content: space-between;
        }

        .vitals { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 12px; flex-wrap: wrap; gap: 10px; }
        .vitals .name { font-size: 1.05em; letter-spacing: 3px; opacity: 0.9; width: 100%; border-bottom: 1px solid var(--pip-green-dim); margin-bottom: 8px; padding-bottom: 4px; }
        .vitals .weight { font-size: 2.6em; font-weight: bold; line-height: 1; }
        .vitals .weight small { font-size: 0.36em; letter-spacing: 2px; }
        .vitals .bmi { text-align: right; font-size: 0.9em; letter-spacing: 1px; }
        .vitals .bmi b { font-size: 1.3em; }

        .section-title { font-size: 0.8em; letter-spacing: 4px; opacity: 0.75; margin: 8px 0 8px; }

        .stats { display: flex; flex-direction: column; gap: 7px; margin-bottom: 16px; }
        .stat-row {
          display: grid; grid-template-columns: 100px 1fr 80px; align-items: center; gap: 10px;
          font-size: 0.85em; cursor: pointer;
        }
        .stat-row:hover .stat-label { color: #fff; text-shadow: 0 0 6px var(--pip-green); }
        .stat-label { letter-spacing: 1px; opacity: 0.9; text-transform: uppercase; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .stat-bar { height: 10px; background: rgba(51,255,102,0.08); border: 1px solid var(--pip-green-dim); position: relative; }
        .stat-fill { height: 100%; transition: width 0.6s ease; }
        .stat-value { text-align: right; font-variant-numeric: tabular-nums; }

        .vault-boy-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-left: 1px solid var(--pip-green-dim);
          padding-left: 20px;
          position: relative;
        }
        .vault-boy-wrapper {
          width: 160px;
          height: 160px;
          position: relative;
        }
        /* Fallback if fallout-vault-boy is not defined */
        fallout-vault-boy:not(:defined) {
          display: block;
          background: repeating-linear-gradient(45deg, var(--pip-green-dim), var(--pip-green-dim) 10px, transparent 10px, transparent 20px);
          opacity: 0.3;
        }

        .target { margin-bottom: 14px; font-size: 0.85em; }
        .target-label { margin-bottom: 4px; letter-spacing: 1px; opacity: 0.9; display: flex; justify-content: space-between; }
        .target-bar { position: relative; height: 14px; border: 1px solid var(--pip-green-dim); background: rgba(51,255,102,0.05); }
        .target-range { position: absolute; top: 0; bottom: 0; background: rgba(51,255,102,0.28); }
        .target-marker { position: absolute; top: -4px; bottom: -4px; width: 2px; background: var(--pip-amber); box-shadow: 0 0 6px var(--pip-amber); }

        .footer {
          display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;
          border-top: 1px solid var(--pip-green-dim); padding-top: 8px; font-size: 0.8em; letter-spacing: 1px;
        }
        .status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; vertical-align: middle; }
        .status-dot.ok { background: var(--pip-green); box-shadow: 0 0 6px var(--pip-green); }
        .status-dot.bad { background: var(--pip-amber); box-shadow: 0 0 6px var(--pip-amber); animation: blink 1s infinite; }
        @keyframes blink { 50% { opacity: 0.25; } }
      </style>
      <div class="crt">
        <div class="header">
          <div class="brand">ROBCO INDUSTRIES (TM) TERMLINK</div>
          <div class="tabs"></div>
          <div class="clock"></div>
        </div>
        
        <div class="main-container">
          <div class="left-column">
            <div class="vitals">
              <div class="name"></div>
              <div class="weight"></div>
              <div class="bmi"></div>
            </div>
            <div class="section-title">S.T.A.T.S.</div>
            <div class="stats"></div>
            <div class="target"></div>
          </div>
          
          <div class="vault-boy-column">
            <div class="vault-boy-wrapper">
              <fallout-vault-boy animation="idle"></fallout-vault-boy>
            </div>
          </div>
        </div>

        <div class="footer">
          <div class="status"></div>
          <div class="model">PIP-BOY 5000 MK IV</div>
        </div>
      </div>
    `;

    this._tabsEl = this.shadowRoot.querySelector(".tabs");
    this._clockEl = this.shadowRoot.querySelector(".clock");
    this._nameEl = this.shadowRoot.querySelector(".name");
    this._weightEl = this.shadowRoot.querySelector(".weight");
    this._bmiEl = this.shadowRoot.querySelector(".bmi");
    this._statsEl = this.shadowRoot.querySelector(".stats");
    this._targetEl = this.shadowRoot.querySelector(".target");
    this._statusEl = this.shadowRoot.querySelector(".status");
    this._vaultBoyEl = this.shadowRoot.querySelector("fallout-vault-boy");

    this._renderTabs();

    this._clockInterval = setInterval(() => this._updateClock(), 1000);
    this._updateClock();
  }

  connectedCallback() {
    if (!this._clockInterval) {
      this._clockInterval = setInterval(() => this._updateClock(), 1000);
      this._updateClock();
    }
  }

  disconnectedCallback() {
    clearInterval(this._clockInterval);
    this._clockInterval = null;
  }

  _updateClock() {
    if (!this._clockEl) return;
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    this._clockEl.textContent =
      `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())} ` +
      `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }

  _renderTabs() {
    const tabs = this.config.tabs || [];
    this._tabsEl.innerHTML = tabs
      .map((t) => `<a href="${t.path}" class="${t.active ? "active" : ""}">${t.label}</a>`)
      .join("");
  }

  _num(entityId) {
    if (!entityId) return null;
    const s = this._hass?.states?.[entityId];
    if (!s) return null;
    const v = parseFloat(s.state);
    return Number.isFinite(v) ? v : null;
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _isHealthy(cfg) {
    const value = this._num(cfg.entity);
    if (value == null) return true;
    const hMin = cfg.healthy_min ?? -Infinity;
    const hMax = cfg.healthy_max ?? Infinity;
    return value >= hMin && value <= hMax;
  }

  _renderBar(cfg) {
    const value = this._num(cfg.entity);
    const min = cfg.min ?? 0;
    const max = cfg.max ?? 100;
    let pct = value == null ? 0 : ((value - min) / (max - min)) * 100;
    if (cfg.invert) pct = 100 - pct;
    pct = Math.max(0, Math.min(100, pct));

    const healthy = this._isHealthy(cfg);
    const color = healthy ? "var(--pip-green)" : "var(--pip-amber)";

    const decimals = cfg.decimals ?? 1;
    const display = value == null ? "--" : value.toFixed(decimals);
    const unit = cfg.unit ? ` ${cfg.unit}` : "";

    return `
      <div class="stat-row" data-entity="${cfg.entity || ""}">
        <div class="stat-label">${cfg.label}</div>
        <div class="stat-bar"><div class="stat-fill" style="width:${pct}%; background:${color};"></div></div>
        <div class="stat-value">${display}${unit}</div>
      </div>
    `;
  }

  _render() {
    if (!this._hass) return;
    const c = this.config;

    // Vitals
    this._nameEl.textContent = c.title || "VAULT DWELLER";
    const weight = this._num(c.weight_entity);
    this._weightEl.innerHTML = weight == null
      ? "-- <small>KG</small>"
      : `${weight.toFixed(1)} <small>KG</small>`;
    const bmi = this._num(c.bmi_entity);
    this._bmiEl.innerHTML = `BMI<br><b>${bmi == null ? "--" : bmi.toFixed(1)}</b>`;

    // Stat bars
    this._statsEl.innerHTML = (c.stats || []).map((s) => this._renderBar(s)).join("");
    this._statsEl.querySelectorAll(".stat-row").forEach((row) => {
      row.addEventListener("click", () => {
        const entityId = row.getAttribute("data-entity");
        if (!entityId) return;
        const event = new Event("hass-more-info", { bubbles: true, composed: true });
        event.detail = { entityId };
        this.dispatchEvent(event);
      });
    });

    // Target weight range
    if (c.ideal_min_entity && c.ideal_max_entity) {
      const idealMin = this._num(c.ideal_min_entity);
      const idealMax = this._num(c.ideal_max_entity);
      const scaleMin = c.weight_scale_min ?? 40;
      const scaleMax = c.weight_scale_max ?? 110;
      const span = scaleMax - scaleMin;
      const toPct = (v) => Math.max(0, Math.min(100, ((v - scaleMin) / span) * 100));

      let rangeHtml = "";
      if (idealMin != null && idealMax != null) {
        const left = toPct(idealMin);
        const width = toPct(idealMax) - left;
        rangeHtml = `<div class="target-range" style="left:${left}%; width:${width}%;"></div>`;
      }
      let markerHtml = "";
      if (weight != null) {
        markerHtml = `<div class="target-marker" style="left:${toPct(weight)}%;"></div>`;
      }
      this._targetEl.innerHTML = `
        <div class="target-label">
          <span>TARGET WEIGHT RANGE</span>
          <span>${idealMin == null ? "--" : idealMin.toFixed(1)} - ${idealMax == null ? "--" : idealMax.toFixed(1)} KG</span>
        </div>
        <div class="target-bar">${rangeHtml}${markerHtml}</div>
      `;
    } else {
      this._targetEl.innerHTML = "";
    }

    // Vault Boy Animation Logic
    let animation = "idle";
    let statusText = "SYSTEM READY";
    let isAmber = false;

    // Check for unhealthy stats
    const anyUnhealthy = (c.stats || []).some(s => !this._isHealthy(s));
    
    if (c.stable_entity) {
      const stableState = this._hass.states?.[c.stable_entity]?.state;
      if (stableState === "on") {
        animation = anyUnhealthy ? "alert" : "thumbs_up";
        statusText = "READING STABLE";
        isAmber = anyUnhealthy;
      } else {
        animation = "thinking";
        statusText = "AWAITING READING";
        isAmber = true;
      }
    } else if (anyUnhealthy) {
      animation = "alert";
      isAmber = true;
    }

    if (this._vaultBoyEl) {
      this._vaultBoyEl.setAttribute("animation", animation);
      this._vaultBoyEl.setAttribute("color", isAmber ? "var(--pip-amber)" : "var(--pip-green)");
    }

    // Footer status
    const dotClass = isAmber ? "bad" : "ok";
    this._statusEl.innerHTML = `<span class="status-dot ${dotClass}"></span>${statusText}`;
  }

  getCardSize() {
    return 8;
  }
}

customElements.define("pipboy-stats-card", PipboyStatsCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "pipboy-stats-card",
  name: "Pip-Boy STATS",
  description: "Fallout Pip-Boy style CRT readout for body composition sensors",
});
