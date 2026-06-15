/*
  fallout-vaultboy-card — drives the <fallout-vault-boy> mascot from an entity's state.

  Picks an animation (and accent colour) from the first matching rule, so the mascot reacts to real
  state — radiation pose when rads are high, alert when a breach trips, etc. With no entity it just
  shows a static animation.

  config:
    type:    custom:fallout-vaultboy-card
    entity:  sensor.radiation          (optional)
    name:    "VAULT MONITOR"           (optional)
    default_animation: thumbs_up       (optional, default "idle")
    animation: idle                    (optional static override when no entity)
    mappings:                          (optional; first match wins)
      - { state: "on", animation: "alert", level: "alert" }
      - { above: 5,    animation: "radiation", level: "warn" }
      - { below: 1,    animation: "sleeping", level: "ok" }

  Valid animations come from window.RobCoFallout.VAULT_BOY_STATES.
*/
(function () {
  const register = () => {
    if (!window.RobCoFallout) return;
    const { FalloutBaseCard, defineFalloutCard, defineFalloutEditor, escapeHtml, v } = window.RobCoFallout;

    const LEVEL_COLOR = {
      ok: v("accent"),
      warn: v("warn"),
      alert: v("alert"),
    };

    class FalloutVaultboyCard extends FalloutBaseCard {
      static getStubConfig() { return { type: "custom:fallout-vaultboy-card", default_animation: "thumbs_up" }; }
      static getConfigElement() { return document.createElement("fallout-vaultboy-card-editor"); }
      getCardSize() { return 4; }

      _pick() {
        const cfg = this._config;
        const fallbackAnim = cfg.default_animation || cfg.animation || "idle";

        if (!cfg.entity) return { animation: fallbackAnim, level: "ok", label: fallbackAnim };
        const s = this.stateObj(cfg.entity);
        if (!s) return { animation: "alert", level: "alert", label: "no signal" };

        const numeric = this.num(cfg.entity);
        for (const rule of cfg.mappings || []) {
          let match = false;
          if (rule.state != null) match = String(s.state) === String(rule.state);
          else if (rule.above != null && numeric != null) match = numeric > Number(rule.above);
          else if (rule.below != null && numeric != null) match = numeric < Number(rule.below);
          if (match) return { animation: rule.animation || fallbackAnim, level: rule.level || "ok", label: s.state };
        }
        return { animation: fallbackAnim, level: "ok", label: s.state };
      }

      _render() {
        const cfg = this._config;
        const { animation, level, label } = this._pick();
        const color = LEVEL_COLOR[level] || v("accent");

        // Build the structure once, then update in place. Recreating <fallout-vault-boy> (or
        // re-setting its attributes to the same value) would restart its animation on every
        // sensor tick, even when the pose hasn't changed.
        let vb = this.body.querySelector("fallout-vault-boy");
        if (!vb) {
          const title = cfg.name || (cfg.entity ? this.friendlyName(cfg.entity) : "VAULT BOY");
          this.body.innerHTML =
            this.header(title, escapeHtml(cfg.entity || "")) +
            `<div style="height:180px;display:flex;justify-content:center;align-items:center;background:rgba(0,0,0,0.25);border-radius:4px;">
               <div style="width:150px;height:170px;"><fallout-vault-boy></fallout-vault-boy></div>
             </div>
             <div class="vb-status" style="text-align:center;margin-top:10px;letter-spacing:1px;">&gt; <span></span></div>`;
          vb = this.body.querySelector("fallout-vault-boy");
          if (cfg.entity) vb.addEventListener("click", () => this.moreInfo(cfg.entity));
        }
        if (vb.getAttribute("animation") !== animation) vb.setAttribute("animation", animation);
        if (vb.getAttribute("color") !== color) vb.setAttribute("color", color);
        const span = this.body.querySelector(".vb-status span");
        span.className = level;
        span.textContent = String(label).toUpperCase();
      }
    }

    defineFalloutEditor("fallout-vaultboy-card-editor", [
      { name: "entity", type: "entity", label: "Entity (optional)" },
      { name: "name", type: "text", label: "Title (optional)" },
      { name: "default_animation", type: "text", label: "Default animation", placeholder: "idle, thumbs_up, alert, radiation, sleeping" },
    ]);

    defineFalloutCard("fallout-vaultboy-card", FalloutVaultboyCard, {
      name: "RobCo Vault Boy",
      description: "Animated vault mascot driven by an entity's state.",
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
