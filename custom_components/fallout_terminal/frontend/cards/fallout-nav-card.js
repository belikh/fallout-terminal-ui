/*
  fallout-nav-card — terminal function-key navigation bar.

  The strip across the bottom of a terminal: [1] SYSTEM  [2] ENVIRONMENTAL ... Each entry navigates
  to a dashboard path (internal /lovelace path) or opens an external URL. The entry matching the
  current path is highlighted, like the active console tab.

  config:
    type:  custom:fallout-nav-card
    links:
      - { key: 1, label: MAIN,    path: /main-floor/main }
      - { key: 2, label: OFFICE,  path: /office-command/office }
      - { key: 3, label: JUPITER, path: /jupiter-room/quarters }
      - { key: 4, label: ROBBIE,  path: /robert-room/quarters }
      - { key: P, label: POWER,   path: /power-bill/power-bill }
*/
(function () {
  const register = () => {
    if (!window.RobCoFallout) return;
    const { FalloutBaseCard, defineFalloutCard, defineFalloutEditor, escapeHtml, v } = window.RobCoFallout;

    class FalloutNavCard extends FalloutBaseCard {
      static getStubConfig() { return { type: "custom:fallout-nav-card", links: [] }; }
      static getConfigElement() { return document.createElement("fallout-nav-card-editor"); }
      getCardSize() { return 1; }
      _watchedEntities() { return []; }

      _go(path) {
        if (!path) return;
        if (/^https?:\/\//.test(path)) { window.open(path, "_blank"); return; }
        history.pushState(null, "", path);
        window.dispatchEvent(new CustomEvent("location-changed", { bubbles: true, composed: true }));
      }

      _render() {
        const links = this._config.links || [];
        const cur = window.location.pathname;
        const html = links.map((l, i) => {
          const key = l.key != null ? l.key : i + 1;
          const path = l.path || "";
          const active = path && (cur === path || cur.endsWith(path)) ? " active" : "";
          return `<button class="rc-key${active}" data-path="${escapeHtml(path)}">[${escapeHtml(String(key))}] ${escapeHtml(l.label || "")}</button>`;
        }).join("");
        this.body.innerHTML = `
          <style>
            .rc-nav { display:flex; flex-wrap:wrap; gap:4px 14px; justify-content:center; align-items:center; }
            .rc-key { background:none; border:1px solid transparent; color:${v("accent")}; font-family:${v("font")};
              text-shadow:0 0 4px ${v("glow")}; text-transform:uppercase; letter-spacing:1px; font-size:0.95em;
              cursor:pointer; padding:3px 8px; }
            .rc-key:hover { background:${v("accent-soft")}; }
            .rc-key.active { border-color:${v("accent")}; background:${v("accent-soft")}; }
          </style>
          <div class="rc-nav">${html}</div>`;
        this.body.querySelectorAll(".rc-key").forEach((b) =>
          b.addEventListener("click", () => this._go(b.dataset.path)));
      }
    }

    defineFalloutEditor("fallout-nav-card-editor", [
      { name: "title", type: "text", label: "Links are configured in YAML (links:)" },
    ]);

    defineFalloutCard("fallout-nav-card", FalloutNavCard, {
      name: "RobCo Nav",
      description: "Terminal function-key navigation bar between dashboards/views.",
    });
  };

  if (window.RobCoFallout) register();
  else {
    const interval = setInterval(() => {
      if (window.RobCoFallout) { clearInterval(interval); register(); }
    }, 50);
  }
})();
