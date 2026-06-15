/*
  fallout-stats-card — Pip-Boy STATS readout for body-composition (or any grouped) sensors.

  Ported from the original pipboy-stats-card (the one genuinely entity-bound card in the old suite),
  now on the shared base/tokens and the live Vault Boy engine. Bars colour amber when a value leaves
  its healthy range; the mascot reacts (thumbs_up when all healthy, alert otherwise).

  config:
    type:  custom:fallout-stats-card
    title: "VAULT DWELLER"
    weight_entity: sensor.body_weight     (optional, headline number)
    bmi_entity:    sensor.bmi             (optional)
    stable_entity: binary_sensor.scale    (optional; "on" = fresh reading)
    stats:
      - { label: "BODY FAT", entity: sensor.body_fat, min: 0, max: 40, healthy_max: 22, unit: "%" }
      - { label: "MUSCLE",   entity: sensor.muscle,   min: 0, max: 60, healthy_min: 35, unit: "%" }
    ideal_min_entity / ideal_max_entity   (optional; draws a target weight range)
*/
(function () {
  const { FalloutBaseCard, defineFalloutCard, defineFalloutEditor, escapeHtml, v } = window.RobCoFallout;

  class FalloutStatsCard extends FalloutBaseCard {
    static getStubConfig() { return { type: "custom:fallout-stats-card", title: "VAULT DWELLER", stats: [] }; }
    static getConfigElement() { return document.createElement("fallout-stats-card-editor"); }
    getCardSize() { return 8; }

    _watchedEntities() {
      const c = this._config || {};
      const ids = [c.weight_entity, c.bmi_entity, c.stable_entity, c.ideal_min_entity, c.ideal_max_entity];
      for (const s of c.stats || []) ids.push(s.entity);
      return ids.filter(Boolean);
    }

    _healthy(stat) {
      const value = this.num(stat.entity);
      if (value == null) return true;
      const lo = stat.healthy_min != null ? stat.healthy_min : -Infinity;
      const hi = stat.healthy_max != null ? stat.healthy_max : Infinity;
      return value >= lo && value <= hi;
    }

    _bar(stat) {
      const value = this.num(stat.entity);
      const min = stat.min != null ? stat.min : 0;
      const max = stat.max != null ? stat.max : 100;
      let pct = value == null ? 0 : ((value - min) / (max - min)) * 100;
      if (stat.invert) pct = 100 - pct;
      pct = Math.max(0, Math.min(100, pct));
      const color = this._healthy(stat) ? v("accent") : v("warn");
      const decimals = stat.decimals != null ? stat.decimals : 1;
      const display = value == null ? "--" : value.toFixed(decimals);
      const unit = stat.unit ? ` ${escapeHtml(stat.unit)}` : "";
      return `
        <div class="stat-row" data-entity="${escapeHtml(stat.entity || "")}">
          <div class="stat-label">${escapeHtml(stat.label || stat.entity || "")}</div>
          <div class="meter"><div class="fill" style="width:${pct}%;background:${color};box-shadow:0 0 8px ${color};"></div></div>
          <div class="stat-value">${escapeHtml(display)}${unit}</div>
        </div>`;
    }

    _render() {
      const c = this._config;
      const weight = this.num(c.weight_entity);
      const bmi = this.num(c.bmi_entity);
      const stats = c.stats || [];
      const anyUnhealthy = stats.some((s) => !this._healthy(s));

      let animation = "idle", statusText = "SYSTEM READY", level = "ok";
      if (c.stable_entity) {
        const stable = this.stateObj(c.stable_entity);
        if (stable && stable.state === "on") {
          animation = anyUnhealthy ? "alert" : "thumbs_up";
          statusText = "READING STABLE";
          level = anyUnhealthy ? "alert" : "ok";
        } else {
          animation = "idle"; statusText = "AWAITING READING"; level = "warn";
        }
      } else if (anyUnhealthy) {
        animation = "alert"; statusText = "OUT OF RANGE"; level = "alert";
      }
      const vbColor = level === "alert" ? v("alert") : level === "warn" ? v("warn") : v("accent");

      this.body.innerHTML = `
        <style>
          .stats-grid { display:grid; grid-template-columns:1fr 150px; gap:18px; }
          @media (max-width:480px) { .stats-grid { grid-template-columns:1fr; } .vb-col { display:none; } }
          .vitals { display:flex; justify-content:space-between; align-items:flex-end; border-bottom:1px solid ${v("accent-dim")}; padding-bottom:6px; margin-bottom:12px; }
          .vitals .weight { font-size:2.4em; font-weight:bold; line-height:1; color:${v("accent")}; }
          .vitals .weight small { font-size:0.35em; letter-spacing:2px; opacity:0.7; }
          .vitals .bmi { text-align:right; font-size:0.85em; opacity:0.85; }
          .vitals .bmi b { font-size:1.5em; }
          .section { font-size:0.75em; letter-spacing:3px; opacity:0.7; margin:6px 0 8px; }
          .stat-row { display:grid; grid-template-columns:90px 1fr 70px; align-items:center; gap:10px; font-size:0.85em; margin-bottom:8px; cursor:pointer; }
          .stat-label { letter-spacing:1px; text-transform:uppercase; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
          .stat-value { text-align:right; font-variant-numeric:tabular-nums; }
          .vb-col { display:flex; align-items:center; justify-content:center; border-left:1px solid ${v("accent-dim")}; }
          .vb-col > div { width:130px; height:150px; }
          .target { margin-top:10px; font-size:0.8em; }
          .target-bar { position:relative; height:14px; border:1px solid ${v("accent-dim")}; background:${v("accent-soft")}; margin-top:4px; }
          .target-range { position:absolute; top:0; bottom:0; background:${v("accent-soft")}; }
          .target-marker { position:absolute; top:-3px; bottom:-3px; width:2px; background:${v("warn")}; box-shadow:0 0 6px ${v("warn")}; }
          .foot { display:flex; justify-content:space-between; border-top:1px solid ${v("accent-dim")}; margin-top:14px; padding-top:8px; font-size:0.75em; letter-spacing:1px; }
          .dot { display:inline-block; width:8px; height:8px; border-radius:50%; margin-right:6px; }
        </style>
        ${this.header(c.title || "VAULT DWELLER", "S.T.A.T.S.")}
        <div class="stats-grid">
          <div>
            <div class="vitals">
              <div class="weight">${weight == null ? "--" : weight.toFixed(1)} <small>${escapeHtml(this.unit(c.weight_entity) || "KG")}</small></div>
              <div class="bmi">BMI<br><b>${bmi == null ? "--" : bmi.toFixed(1)}</b></div>
            </div>
            <div class="section">VITAL SIGNS</div>
            <div class="stat-list">${stats.map((s) => this._bar(s)).join("")}</div>
            ${this._targetHtml(weight)}
          </div>
          <div class="vb-col"><div><fallout-vault-boy animation="${animation}" color="${vbColor}"></fallout-vault-boy></div></div>
        </div>
        <div class="foot">
          <div><span class="dot ${level}" style="background:${vbColor};box-shadow:0 0 6px ${vbColor};"></span>${escapeHtml(statusText)}</div>
          <div class="dim">PIP-BOY 5000 MK IV</div>
        </div>`;

      this.body.querySelectorAll(".stat-row").forEach((row) =>
        row.addEventListener("click", () => this.moreInfo(row.getAttribute("data-entity"))));
    }

    _targetHtml(weight) {
      const c = this._config;
      if (!c.ideal_min_entity || !c.ideal_max_entity) return "";
      const lo = this.num(c.ideal_min_entity), hi = this.num(c.ideal_max_entity);
      const sMin = c.weight_scale_min != null ? c.weight_scale_min : 40;
      const sMax = c.weight_scale_max != null ? c.weight_scale_max : 110;
      const toPct = (x) => Math.max(0, Math.min(100, ((x - sMin) / (sMax - sMin)) * 100));
      const range = lo != null && hi != null
        ? `<div class="target-range" style="left:${toPct(lo)}%;width:${toPct(hi) - toPct(lo)}%;"></div>` : "";
      const marker = weight != null ? `<div class="target-marker" style="left:${toPct(weight)}%;"></div>` : "";
      return `<div class="target">
          <div style="display:flex;justify-content:space-between;"><span>TARGET RANGE</span>
            <span>${lo == null ? "--" : lo.toFixed(1)} - ${hi == null ? "--" : hi.toFixed(1)}</span></div>
          <div class="target-bar">${range}${marker}</div>
        </div>`;
    }
  }

  defineFalloutEditor("fallout-stats-card-editor", [
    { name: "title", type: "text", label: "Title" },
    { name: "weight_entity", type: "entity", label: "Headline value (optional)" },
    { name: "bmi_entity", type: "entity", label: "BMI / secondary (optional)" },
    { name: "stable_entity", type: "entity", label: "Reading-stable sensor (optional)" },
  ]);

  defineFalloutCard("fallout-stats-card", FalloutStatsCard, {
    name: "RobCo Stats (Pip-Boy)",
    description: "Pip-Boy STATS panel with healthy-range bars and a reactive mascot.",
  });

  // Backwards-compat alias for the original tag name.
  if (!customElements.get("pipboy-stats-card")) {
    customElements.define("pipboy-stats-card", class extends FalloutStatsCard {});
  }
})();
