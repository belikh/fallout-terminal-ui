class FalloutVaultBoy extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['animation', 'color'];
  }

  attributeChangedCallback() {
    this.render();
  }

  set animation(val) { this.setAttribute('animation', val); }
  get animation() { return this.getAttribute('animation') || 'idle'; }

  set color(val) { this.setAttribute('color', val); }
  get color() { return this.getAttribute('color') || '#9cff57'; }

  render() {
    const color = this.color;
    
    // Core SVG Templates
    const head = `<circle cx="50" cy="35" r="18" stroke="${color}" fill="none" stroke-width="2" />`;
    const torso = `<path d="M50 53 L50 85" stroke="${color}" fill="none" stroke-width="2" />`;
    const defaultLegs = `<path d="M50 85 L40 95 M50 85 L60 95" stroke="${color}" fill="none" stroke-width="2" />`;
    
    const animations = {
      idle: `
        <svg viewBox="0 0 100 100">
          <g class="breathe">
            ${head}
            ${torso}
            <path d="M50 58 L30 70 M50 58 L70 70" stroke="${color}" fill="none" stroke-width="2" />
            ${defaultLegs}
          </g>
          <style>
            @keyframes breathe { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-1.5px); } }
            .breathe { animation: breathe 3s ease-in-out infinite; }
          </style>
        </svg>
      `,
      walking: `
        <svg viewBox="0 0 100 100">
          ${head}
          ${torso}
          <path d="M50 58 L30 70 M50 58 L70 70" stroke="${color}" fill="none" stroke-width="2" />
          <path class="leg-l" d="M50 85 L40 95" stroke="${color}" fill="none" stroke-width="2" />
          <path class="leg-r" d="M50 85 L60 95" stroke="${color}" fill="none" stroke-width="2" />
          <style>
            @keyframes walk-l { 0%, 100% { d: path('M50 85 L40 95'); } 50% { d: path('M50 85 L55 95'); } }
            @keyframes walk-r { 0%, 100% { d: path('M50 85 L60 95'); } 50% { d: path('M50 85 L45 95'); } }
            .leg-l { animation: walk-l 0.8s infinite; }
            .leg-r { animation: walk-r 0.8s infinite; }
          </style>
        </svg>
      `,
      thumbs_up: `
        <svg viewBox="0 0 100 100">
          ${head}
          ${torso}
          <path d="M50 58 L70 45 L80 35 M80 35 L85 35 M80 35 L80 30" stroke="${color}" fill="none" stroke-width="2" />
          <path d="M50 58 L30 70" stroke="${color}" fill="none" stroke-width="2" />
          ${defaultLegs}
          <style>
            @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
            svg { animation: pulse 2s infinite; }
          </style>
        </svg>
      `,
      alert: `
        <svg viewBox="0 0 100 100">
          <g class="shake">
            ${head}
            ${torso}
            <path d="M50 58 L80 75 M50 58 L20 75" stroke="${color}" fill="none" stroke-width="2" />
            ${defaultLegs}
          </g>
          <style>
            @keyframes shake { 0% { transform: translate(1px, 1px); } 20% { transform: translate(-1px, -1px); } 40% { transform: translate(1px, -1px); } 60% { transform: translate(-1px, 1px); } 80% { transform: translate(1px, 1px); } 100% { transform: translate(0,0); } }
            .shake { animation: shake 0.15s infinite; }
          </style>
        </svg>
      `,
      radiation: `
        <svg viewBox="0 0 100 100">
          ${head}
          ${torso}
          <path class="glow" d="M50 35 M20 35 L10 35 M80 35 L90 35 M50 5 L50 15 M50 90 L50 95" stroke="${color}" fill="none" stroke-width="2" />
          <path d="M50 58 L30 75 M50 58 L70 75" stroke="${color}" fill="none" stroke-width="2" />
          ${defaultLegs}
          <style>
            @keyframes rad-glow { 0%, 100% { opacity: 1; stroke-width: 2; } 50% { opacity: 0.3; stroke-width: 4; } }
            .glow { animation: rad-glow 1s infinite; }
          </style>
        </svg>
      `,
      combat: `
        <svg viewBox="0 0 100 100">
          ${head}
          ${torso}
          <path d="M50 58 L75 55 M75 55 L85 50" stroke="${color}" fill="none" stroke-width="3" /> <!-- Gun/Tool -->
          <path d="M50 58 L35 65" stroke="${color}" fill="none" stroke-width="2" />
          <path d="M50 85 L35 98 L65 98" stroke="${color}" fill="none" stroke-width="2" /> <!-- Crouched -->
        </svg>
      `,
      crafting: `
        <svg viewBox="0 0 100 100">
          ${head}
          ${torso}
          <path class="hammer" d="M50 58 L70 40 M70 40 L80 30" stroke="${color}" fill="none" stroke-width="2" />
          <path d="M50 58 L30 70" stroke="${color}" fill="none" stroke-width="2" />
          <rect x="30" y="85" width="40" height="10" stroke="${color}" fill="none" stroke-width="2" /> <!-- Workbench -->
          <style>
            @keyframes hammer-swing { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-30deg); } }
            .hammer { animation: hammer-swing 0.5s infinite; transform-origin: 50% 58%; }
          </style>
        </svg>
      `,
      running: `
        <svg viewBox="0 0 100 100">
          <g class="tilt">
            ${head}
            ${torso}
            <path class="arm-l" d="M50 58 L25 75" stroke="${color}" fill="none" stroke-width="2" />
            <path class="arm-r" d="M50 58 L75 75" stroke="${color}" fill="none" stroke-width="2" />
            <path class="leg-l" d="M50 85 L30 98" stroke="${color}" fill="none" stroke-width="2" />
            <path class="leg-r" d="M50 85 L70 98" stroke="${color}" fill="none" stroke-width="2" />
          </g>
          <style>
            .tilt { transform: rotate(15deg); transform-origin: 50% 85%; }
            @keyframes run-leg { 0%, 100% { transform: rotate(-20deg); } 50% { transform: rotate(20deg); } }
            .leg-l, .leg-r { animation: run-leg 0.4s infinite; transform-origin: 50% 85%; }
            .leg-r { animation-delay: 0.2s; }
          </style>
        </svg>
      `,
      sleeping: `
        <svg viewBox="0 0 100 100">
          <g transform="rotate(90 50 50)">
            ${head}
            ${torso}
            <path d="M50 58 L30 70 M50 58 L70 70" stroke="${color}" fill="none" stroke-width="2" />
            ${defaultLegs}
          </g>
          <text x="70" y="30" fill="${color}" font-family="monospace" class="zzz">Z</text>
          <style>
            @keyframes zzz { 0% { opacity: 0; transform: translate(0,0); } 50% { opacity: 1; } 100% { opacity: 0; transform: translate(10px, -20px); } }
            .zzz { animation: zzz 2s infinite; font-size: 15px; }
          </style>
        </svg>
      `,
      dead: `
        <svg viewBox="0 0 100 100">
          <g transform="translate(0, 30) rotate(-10 50 50)">
            <circle cx="50" cy="35" r="18" stroke="${color}" fill="none" stroke-width="2" />
            <path d="M42 30 L48 38 M48 30 L42 38 M52 30 L58 38 M58 30 L52 38" stroke="${color}" stroke-width="2" /> <!-- X eyes -->
            ${torso}
            <path d="M50 58 L20 65 M50 58 L80 65" stroke="${color}" fill="none" stroke-width="2" />
            ${defaultLegs}
          </g>
        </svg>
      `,
      strength: `<svg viewBox="0 0 100 100">${head}${torso}<path d="M50 58 L30 40 L20 30 M50 58 L70 40 L80 30" stroke="${color}" fill="none" stroke-width="4" />${defaultLegs}</svg>`,
      perception: `<svg viewBox="0 0 100 100">${head}${torso}<circle cx="50" cy="35" r="22" stroke="${color}" fill="none" stroke-dasharray="2,2" />${defaultLegs}</svg>`,
      endurance: `<svg viewBox="0 0 100 100">${head}${torso}<path d="M30 40 Q50 20 70 40" stroke="${color}" fill="none" stroke-width="2" />${defaultLegs}</svg>`,
      charisma: `<svg viewBox="0 0 100 100">${head}${torso}<path d="M40 70 Q50 85 60 70" stroke="${color}" fill="none" stroke-width="2" />${defaultLegs}</svg>`,
      intelligence: `<svg viewBox="0 0 100 100">${head}${torso}<path d="M40 20 Q50 5 60 20" stroke="${color}" fill="none" stroke-width="2" />${defaultLegs}</svg>`,
      agility: `<svg viewBox="0 0 100 100" class="jump">${head}${torso}${defaultLegs}<style>@keyframes jump { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } } .jump { animation: jump 0.5s infinite; }</style></svg>`,
      luck: `<svg viewBox="0 0 100 100">${head}${torso}<path d="M50 10 L60 30 L80 30 L65 45 L75 70 L50 55 L25 70 L35 45 L20 30 L40 30 Z" stroke="${color}" fill="none" />${defaultLegs}</svg>`,
      hacking: `<svg viewBox="0 0 100 100">${head}${torso}<rect x="30" y="55" width="40" height="25" stroke="${color}" fill="none" /><path d="M40 65 L60 65 M40 70 L60 70" stroke="${color}" />${defaultLegs}</svg>`,
      lockpicking: `<svg viewBox="0 0 100 100">${head}${torso}<path d="M50 58 L70 58 M70 58 L80 50" stroke="${color}" /><circle cx="75" cy="58" r="5" stroke="${color}" fill="none" />${defaultLegs}</svg>`,
      healing: `<svg viewBox="0 0 100 100">${head}${torso}<path d="M50 58 L30 70 M50 58 L70 70" stroke="${color}" /><path d="M40 10 L60 10 M50 0 L50 20" stroke="${color}" stroke-width="3" />${defaultLegs}</svg>`,
      trading: `<svg viewBox="0 0 100 100">${head}${torso}<circle cx="75" cy="65" r="8" stroke="${color}" fill="none" /><text x="72" y="69" fill="${color}" font-size="10">$</text>${defaultLegs}</svg>`,
      scavenging: `<svg viewBox="0 0 100 100">${head}${torso}<path d="M30 85 L70 85 L70 95 L30 95 Z" stroke="${color}" fill="none" /><path d="M50 58 L40 85" stroke="${color}" />${defaultLegs}</svg>`,
      repairing: `<svg viewBox="0 0 100 100">${head}${torso}<path d="M70 60 L85 50 M85 50 L80 45" stroke="${color}" stroke-width="3" />${defaultLegs}</svg>`,
      drinking: `<svg viewBox="0 0 100 100">${head}<path d="M50 53 L50 85" stroke="${color}" /><path d="M50 58 L70 45 M70 45 L75 35" stroke="${color}" /><rect x="72" y="25" width="8" height="15" stroke="${color}" fill="none" />${defaultLegs}</svg>`,
      eating: `<svg viewBox="0 0 100 100">${head}${torso}<path d="M50 58 L40 45" stroke="${color}" /><circle cx="35" cy="40" r="5" stroke="${color}" fill="none" />${defaultLegs}</svg>`,
      chems: `<svg viewBox="0 0 100 100">${head}${torso}<path d="M50 58 L75 58" stroke="${color}" /><rect x="75" y="53" width="15" height="10" stroke="${color}" fill="none" />${defaultLegs}</svg>`,
      heavy_weapons: `<svg viewBox="0 0 100 100">${head}${torso}<rect x="40" y="55" width="50" height="15" stroke="${color}" fill="none" /><path d="M50 58 L40 58" stroke="${color}" />${defaultLegs}</svg>`,
      energy_weapons: `<svg viewBox="0 0 100 100">${head}${torso}<path d="M50 58 L85 58" stroke="${color}" /><path d="M85 53 L85 63" stroke="${color}" />${defaultLegs}</svg>`,
      explosives: `<svg viewBox="0 0 100 100">${head}${torso}<circle cx="75" cy="65" r="8" stroke="${color}" fill="none" /><path d="M80 58 L85 50" stroke="${color}" />${defaultLegs}</svg>`,
      stealth: `<svg viewBox="0 0 100 100" opacity="0.4">${head}${torso}${defaultLegs}</svg>`,
      speech: `<svg viewBox="0 0 100 100">${head}${torso}<path d="M70 30 Q85 30 85 45 Q85 60 70 60 L60 60 L50 70 L60 60 Z" stroke="${color}" fill="none" />${defaultLegs}</svg>`,
      science: `<svg viewBox="0 0 100 100">${head}${torso}<path d="M70 55 L80 85 L60 85 Z" stroke="${color}" fill="none" />${defaultLegs}</svg>`,
      swimming: `<svg viewBox="0 0 100 100"><g class="swim">${head}${torso}<path d="M30 60 L70 60" stroke="${color}" /></g><path d="M10 80 Q30 70 50 80 T90 80" stroke="${color}" fill="none" /><style>@keyframes swim { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(5px); } } .swim { animation: swim 2s infinite; }</style></svg>`,
      flying: `<svg viewBox="0 0 100 100" class="fly">${head}${torso}<path d="M30 50 L10 40 M70 50 L90 40" stroke="${color}" />${defaultLegs}<style>@keyframes fly { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-30px); } } .fly { animation: fly 3s ease-in-out infinite; }</style></svg>`
    };

    this.shadowRoot.innerHTML = (animations[this.animation] || animations.idle) + `
      <style>
        :host { display: block; width: 100%; height: 100%; }
        svg { width: 100%; height: 100%; }
      </style>
    `;
  }
}

customElements.define('fallout-vault-boy', FalloutVaultBoy);
