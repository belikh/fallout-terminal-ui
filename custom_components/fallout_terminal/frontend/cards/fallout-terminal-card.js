/*
  fallout-terminal-card — RobCo terminal readout for a single entity.

  A diagnostic "log" view: shows the entity's current state and, optionally, its attributes, in
  terminal style. Entity-bound (the original version was too, and is kept on the new base).

  config:
    type:   custom:fallout-terminal-card
    entity: switch.xxx          (required)
    title:  "DEVICE LOG"        (optional; defaults to "DEVICE: <name>")
    show_attributes: true       (optional; list the entity's attributes)
*/
(function () {
  const register = () => {
    if (!window.RobCoFallout) return;
    const { FalloutBaseCard, defineFalloutCard, defineFalloutEditor, escapeHtml } = window.RobCoFallout;

    class FalloutTerminalCard extends FalloutBaseCard {
      _validate(config) {
        if (!config.entity) throw new Error("fallout-terminal-card: 'entity' is required");
      }
      static getStubConfig() { return { type: "custom:fallout-terminal-card", entity: "" }; }
      static getConfigElement() { return document.createElement("fallout-terminal-card-editor"); }

      _render() {
        const cfg = this._config;
        const s = this.stateObj(cfg.entity);
        const name = this.friendlyName(cfg.entity);
        const title = cfg.title || `DEVICE: ${name}`;
        const stateStr = s ? s.state : "UNKNOWN";
        const stateCls = !s || stateStr === "unavailable" || stateStr === "unknown" ? "alert" : "ok";

        let attrs = "";
        if (cfg.show_attributes && s) {
          attrs = Object.keys(s.attributes)
            .map((k) => `<div>&gt;&gt; ${escapeHtml(k.toUpperCase())}: ${escapeHtml(formatAttr(s.attributes[k]))}</div>`)
            .join("");
        }

        this.body.innerHTML =
          this.header(title, "termlink") +
          `<div style="line-height:1.5;cursor:pointer;" class="log">
             <div class="dim">&gt; INITIALIZING MONITORING MATRIX...</div>
             <div>&gt; CURRENT STATUS: [ <span class="${stateCls}">${escapeHtml(stateStr.toUpperCase())}</span> ]</div>
             ${attrs}
             <div class="blink">_</div>
           </div>`;

        this.body.querySelector(".log").addEventListener("click", () => this.moreInfo(cfg.entity));
      }
    }

    function formatAttr(value) {
      if (Array.isArray(value)) return value.join(", ");
      if (value && typeof value === "object") return JSON.stringify(value);
      return String(value);
    }

    defineFalloutEditor("fallout-terminal-card-editor", [
      { name: "entity", type: "entity", label: "Entity" },
      { name: "title", type: "text", label: "Title (optional)" },
      { name: "show_attributes", type: "boolean", label: "Show attributes" },
    ]);

    defineFalloutCard("fallout-terminal-card", FalloutTerminalCard, {
      name: "RobCo Terminal",
      description: "Terminal-style diagnostic readout for one entity.",
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
