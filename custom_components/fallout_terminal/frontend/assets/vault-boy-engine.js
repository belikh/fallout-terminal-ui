/*
  vault-boy-engine.js — <fallout-vault-boy> custom element.

  A stylised, hand-drawn vault mascot (an homage to the Fallout look — not the trademarked
  artwork). Honesty note: there are a small number of GENUINELY distinct poses, listed in
  FalloutVaultBoy.STATES, not a padded count. An unknown state falls back to `idle` rather than
  rendering a "generic" placeholder.

  Usage:
    <fallout-vault-boy animation="thumbs_up" color="#9cff57"></fallout-vault-boy>

  Attributes:
    animation  one of FalloutVaultBoy.STATES (default "idle")
    color      any CSS colour or var() (default var(--fallout-accent, #9cff57))
*/
(function () {
  // The reusable figure: head, face and suit are shared across poses; each pose supplies its own
  // arms/legs/extras and (optionally) recolours for danger states.
  function parts(color, bg) {
    return {
      head: `
        <ellipse cx="60" cy="46" rx="27" ry="29" fill="${bg}" stroke="${color}" stroke-width="3"/>
        <path d="M40 26 Q53 9 71 19 Q82 26 79 39 Q70 30 60 32 Q50 30 44 37 Q39 31 40 26 Z"
              fill="${color}" opacity="0.92"/>
        <ellipse cx="33" cy="50" rx="4" ry="6" fill="${bg}" stroke="${color}" stroke-width="2"/>`,
      face: `
        <path d="M47 38 q5 -3 10 0" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path d="M63 38 q5 -3 10 0" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round"/>
        <circle cx="52" cy="45" r="3" fill="${color}"/>
        <circle cx="68" cy="45" r="3" fill="${color}"/>
        <path d="M60 47 q3 6 -1 9" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path d="M46 57 q14 15 28 0" stroke="${color}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
      suit: `
        <path d="M44 73 Q60 67 76 73 L80 116 Q60 124 40 116 Z" fill="${bg}" stroke="${color}" stroke-width="3"/>
        <path d="M52 71 L60 81 L68 71" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M41 107 L79 107" stroke="${color}" stroke-width="2" opacity="0.7"/>
        <text x="60" y="101" fill="${color}" font-size="9" font-family="monospace" font-weight="bold" text-anchor="middle">111</text>`,
      legs: `
        <path d="M52 119 L50 147" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
        <path d="M68 119 L70 147" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
        <path d="M50 147 L41 149" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
        <path d="M70 147 L79 149" stroke="${color}" stroke-width="4" stroke-linecap="round"/>`,
    };
  }

  function svg(inner, glow, extraStyle) {
    return `
      <svg viewBox="0 0 120 160" class="figure">
        ${inner}
      </svg>
      <style>
        .figure { width: 100%; height: 100%; overflow: visible; filter: drop-shadow(0 0 ${glow}); }
        ${extraStyle || ""}
      </style>`;
  }

  const POSES = {
    // Standing, gentle breathing.
    idle(c, p) {
      return svg(
        `<g class="breathe">
           ${p.head}${p.face}${p.suit}
           <path d="M44 79 Q33 93 35 105" stroke="${c}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
           <path d="M76 79 Q87 93 85 105" stroke="${c}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
           ${p.legs}
         </g>`,
        `5px ${c}`,
        `@keyframes breathe { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
         .breathe { animation: breathe 3.5s ease-in-out infinite; transform-origin: 50% 90%; }`
      );
    },

    // The signature thumbs-up + wink.
    thumbs_up(c, p) {
      const face = `
        <path d="M47 38 q5 -3 10 0" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path d="M63 36 q5 -2 10 1" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round"/>
        <circle cx="52" cy="45" r="3" fill="${c}"/>
        <path d="M64 46 q4 1 8 0" stroke="${c}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M60 47 q3 6 -1 9" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path d="M46 57 q14 15 28 -2" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      return svg(
        `${p.head}${face}${p.suit}
         <path d="M44 80 Q36 96 44 104" stroke="${c}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
         <g class="swagger">
           <path d="M76 80 Q90 74 92 58" stroke="${c}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
           <path d="M92 58 q-2 -9 5 -10 q6 0 4 8 q5 -1 4 5 q4 1 0 6 l-9 2 q-6 -2 -4 -11 Z"
                 fill="${c}" stroke="${c}" stroke-width="1"/>
         </g>
         ${p.legs}`,
        `7px ${c}`,
        `@keyframes swagger { 0%,100% { transform: rotate(-4deg); } 50% { transform: rotate(4deg); } }
         .swagger { animation: swagger 1.6s ease-in-out infinite; transform-origin: 76% 80%; }`
      );
    },

    // Danger: red, arms up, X-eyes, shaking.
    alert(c, p) {
      const a = "#ff6b5e";
      const pr = parts(a, "var(--fallout-bg, #0b0f0a)");
      const face = `
        <path d="M48 42 l8 8 M56 42 l-8 8" stroke="${a}" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M64 42 l8 8 M72 42 l-8 8" stroke="${a}" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M48 62 q12 -10 24 0" stroke="${a}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      return svg(
        `<g class="shake">
           ${pr.head}${face}${pr.suit}
           <path d="M44 78 Q30 66 30 54" stroke="${a}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
           <path d="M76 78 Q90 66 90 54" stroke="${a}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
           ${pr.legs}
         </g>`,
        `12px ${a}`,
        `@keyframes shake { 0%{transform:translate(1px,0)} 25%{transform:translate(-2px,1px)} 50%{transform:translate(2px,-1px)} 75%{transform:translate(-1px,2px)} 100%{transform:translate(0,0)} }
         .shake { animation: shake 0.1s infinite; }`
      );
    },

    // Radiation exposure: trefoil + pulsing glow.
    radiation(c, p) {
      return svg(
        `${p.head}${p.face}${p.suit}
         <path d="M44 79 Q33 93 35 105" stroke="${c}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
         <path d="M76 79 Q87 93 85 105" stroke="${c}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
         ${p.legs}
         <g class="rad" transform="translate(60 92) scale(0.5)">
           <circle r="4" fill="${c}"/>
           <g fill="${c}">
             <path d="M0 0 L9 -16 A18 18 0 0 1 18 0 Z"/>
             <path d="M0 0 L9 -16 A18 18 0 0 1 18 0 Z" transform="rotate(120)"/>
             <path d="M0 0 L9 -16 A18 18 0 0 1 18 0 Z" transform="rotate(240)"/>
           </g>
         </g>`,
        `8px ${c}`,
        `@keyframes radpulse { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
         .rad { animation: radpulse 0.9s ease-in-out infinite; transform-origin: 60px 92px; }`
      );
    },

    // Low power / standby.
    sleeping(c, p) {
      const face = `
        <path d="M47 45 q5 2 10 0" stroke="${c}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M63 45 q5 2 10 0" stroke="${c}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M60 47 q3 6 -1 9" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path d="M50 58 q10 6 20 0" stroke="${c}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
      return svg(
        `<g class="snooze">
           ${p.head}${face}${p.suit}
           <path d="M44 79 Q33 93 35 105" stroke="${c}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
           <path d="M76 79 Q87 93 85 105" stroke="${c}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
           ${p.legs}
         </g>
         <text x="86" y="40" fill="${c}" font-family="monospace" font-size="11" class="z1">z</text>
         <text x="94" y="30" fill="${c}" font-family="monospace" font-size="14" class="z2">Z</text>`,
        `4px ${c}`,
        `@keyframes snooze { 0%,100% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } }
         .snooze { animation: snooze 4s ease-in-out infinite; transform-origin: 50% 90%; }
         @keyframes zfloat { 0% { opacity: 0; transform: translateY(6px); } 50% { opacity: 1; } 100% { opacity: 0; transform: translateY(-6px); } }
         .z1 { animation: zfloat 2.4s ease-in-out infinite; }
         .z2 { animation: zfloat 2.4s ease-in-out 0.6s infinite; }`
      );
    },
  };

  class FalloutVaultBoy extends HTMLElement {
    static get STATES() { return Object.keys(POSES); }
    static get observedAttributes() { return ["animation", "color"]; }

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }
    connectedCallback() { this.render(); }
    attributeChangedCallback() { this.render(); }

    get animation() { return this.getAttribute("animation") || "idle"; }
    set animation(v) { this.setAttribute("animation", v); }
    get color() { return this.getAttribute("color") || "var(--fallout-accent, #9cff57)"; }
    set color(v) { this.setAttribute("color", v); }

    render() {
      const color = this.color;
      const bg = "var(--fallout-bg, #0b0f0a)";
      const pose = POSES[this.animation] || POSES.idle;
      this.shadowRoot.innerHTML = `
        <div class="screen"><div class="scan"></div>${pose(color, parts(color, bg))}</div>
        <style>
          :host { display: block; width: 100%; height: 100%; }
          .screen { position: relative; width: 100%; height: 100%; display: flex;
                    align-items: center; justify-content: center; overflow: hidden; }
          .scan { position: absolute; inset: 0; z-index: 2; pointer-events: none;
                  background: linear-gradient(rgba(0,0,0,0) 50%, rgba(0,0,0,0.18) 51%);
                  background-size: 100% 3px; }
        </style>`;
    }
  }

  if (!customElements.get("fallout-vault-boy")) {
    customElements.define("fallout-vault-boy", FalloutVaultBoy);
  }
  window.RobCoFallout = window.RobCoFallout || {};
  window.RobCoFallout.VAULT_BOY_STATES = FalloutVaultBoy.STATES;
})();
