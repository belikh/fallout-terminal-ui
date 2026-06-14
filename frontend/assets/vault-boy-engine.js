class FalloutVaultBoy extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() { return ['animation', 'color']; }
  attributeChangedCallback() { this.render(); }

  set animation(val) { this.setAttribute('animation', val); }
  get animation() { return this.getAttribute('animation') || 'idle'; }

  set color(val) { this.setAttribute('color', val); }
  get color() { return this.getAttribute('color') || '#9cff57'; }

  render() {
    const color = this.color;
    
    // HIGH FIDELITY CHARACTER PRIMITIVES
    const HEAD_COMPLEX = `
      <path d="M50 15 C35 15 30 25 30 40 C30 55 35 60 50 60 C65 60 70 55 70 40 C70 25 65 15 50 15 Z" fill="none" stroke="${color}" stroke-width="2.5" />
      <path d="M35 25 C30 20 40 10 55 12 C65 15 72 25 68 35" fill="none" stroke="${color}" stroke-width="2" /> <!-- Hair Swirl -->
      <circle cx="42" cy="40" r="2.5" fill="${color}" /> <!-- Eye L -->
      <circle cx="58" cy="40" r="2.5" fill="${color}" /> <!-- Eye R -->
      <path d="M45 50 Q50 55 55 50" fill="none" stroke="${color}" stroke-width="2" /> <!-- Smile -->
    `;

    const TORSO_COMPLEX = `
      <path d="M50 60 L50 85 M35 65 L65 65 L60 85 L40 85 Z" fill="none" stroke="${color}" stroke-width="2.5" /> <!-- Suit -->
      <path d="M48 65 L48 85 M52 65 L52 85" stroke="${color}" stroke-width="1" /> <!-- Suit Detail -->
      <text x="44" y="80" fill="${color}" font-size="8" font-family="monospace" font-weight="bold">111</text>
    `;

    const animations = {
      idle: `
        <svg viewBox="0 0 100 100" class="crt-glow">
          <g class="breathe">
            ${HEAD_COMPLEX}
            ${TORSO_COMPLEX}
            <path d="M35 65 L20 80 M65 65 L80 80" stroke="${color}" stroke-width="2.5" fill="none" /> <!-- Arms -->
            <path d="M40 85 L35 100 M60 85 L65 100" stroke="${color}" stroke-width="2.5" fill="none" /> <!-- Legs -->
          </g>
          <style>
            @keyframes breathe { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
            .breathe { animation: breathe 3s ease-in-out infinite; }
            .crt-glow { filter: drop-shadow(0 0 5px ${color}); }
          </style>
        </svg>
      `,
      thumbs_up: `
        <svg viewBox="0 0 100 100" class="crt-glow">
          ${HEAD_COMPLEX}
          ${TORSO_COMPLEX}
          <path d="M35 65 L20 80" stroke="${color}" stroke-width="2.5" fill="none" /> <!-- Arm L -->
          <g class="thumb-arm">
            <path d="M65 65 L85 50" stroke="${color}" stroke-width="2.5" fill="none" />
            <path d="M85 50 C90 50 95 45 92 40 C90 35 85 38 85 45" fill="${color}" /> <!-- High Detail Thumb -->
          </g>
          <path d="M40 85 L35 100 M60 85 L65 100" stroke="${color}" stroke-width="2.5" fill="none" />
          <style>
            @keyframes swagger { 0%, 100% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } }
            .thumb-arm { animation: swagger 2s ease-in-out infinite; transform-origin: 65% 65%; }
            .crt-glow { filter: drop-shadow(0 0 8px ${color}); }
          </style>
        </svg>
      `,
      walking: `
        <svg viewBox="0 0 100 100" class="crt-glow">
          ${HEAD_COMPLEX}
          ${TORSO_COMPLEX}
          <path class="arm-l" d="M35 65 L25 85" stroke="${color}" stroke-width="2.5" />
          <path class="arm-r" d="M65 65 L75 85" stroke="${color}" stroke-width="2.5" />
          <path class="leg-l" d="M40 85 L30 100" stroke="${color}" stroke-width="3" />
          <path class="leg-r" d="M60 85 L70 100" stroke="${color}" stroke-width="3" />
          <style>
            @keyframes walk-cycle { 0%, 100% { transform: rotate(-15deg); } 50% { transform: rotate(15deg); } }
            .leg-l { animation: walk-cycle 0.8s infinite; transform-origin: 50% 85%; }
            .leg-r { animation: walk-cycle 0.8s infinite reverse; transform-origin: 50% 85%; }
            .arm-l { animation: walk-cycle 0.8s infinite reverse; transform-origin: 35% 65%; }
            .arm-r { animation: walk-cycle 0.8s infinite; transform-origin: 65% 65%; }
          </style>
        </svg>
      `,
      alert: `
        <svg viewBox="0 0 100 100" class="shake crt-glow">
          <g>
            <path d="M50 15 C35 15 30 25 30 40 C30 55 35 60 50 60 C65 60 70 55 70 40 C70 25 65 15 50 15 Z" fill="none" stroke="${color}" stroke-width="2.5" />
            <path d="M38 35 L42 45 M42 35 L38 45 M58 35 L62 45 M62 35 L58 45" stroke="${color}" stroke-width="2.5" /> <!-- Panicked Eyes -->
            <circle cx="50" cy="52" r="5" stroke="${color}" fill="none" stroke-width="2" /> <!-- O-Mouth -->
            ${TORSO_COMPLEX}
            <path d="M35 65 L10 50 M65 65 L90 50" stroke="${color}" stroke-width="2.5" /> <!-- Flailing -->
            <path d="M40 85 L20 100 M60 85 L80 100" stroke="${color}" stroke-width="2.5" />
          </g>
          <style>
            @keyframes hard-shake { 0% { transform: translate(2px, 2px); } 25% { transform: translate(-2px, -2px); } 50% { transform: translate(2px, -2px); } 75% { transform: translate(-2px, 2px); } }
            .shake { animation: hard-shake 0.1s infinite; }
            .crt-glow { filter: drop-shadow(0 0 10px #ff6b5e); }
          </style>
        </svg>
      `,
      strength: `
        <svg viewBox="0 0 100 100" class="crt-glow">
          ${HEAD_COMPLEX}
          ${TORSO_COMPLEX}
          <g class="flex">
            <path d="M35 65 Q25 45 15 55" stroke="${color}" stroke-width="3" fill="none" />
            <path d="M65 65 Q75 45 85 55" stroke="${color}" stroke-width="3" fill="none" />
          </g>
          <path d="M40 85 L35 100 M60 85 L65 100" stroke="${color}" stroke-width="2.5" />
          <style>
            @keyframes flex { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
            .flex { animation: flex 1s ease-in-out infinite; transform-origin: 50% 65%; }
          </style>
        </svg>
      `,
      perception: `
        <svg viewBox="0 0 100 100" class="crt-glow">
          ${HEAD_COMPLEX}
          ${TORSO_COMPLEX}
          <circle class="radar" cx="50" cy="35" r="25" stroke="${color}" fill="none" stroke-width="1" stroke-dasharray="4,2" />
          <path d="M35 65 L20 80 M65 65 L80 80" stroke="${color}" stroke-width="2.5" />
          ${defaultLegs}
          <style>
            @keyframes scan { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            .radar { animation: scan 4s linear infinite; transform-origin: 50% 35%; }
          </style>
        </svg>
      `,
      endurance: `
        <svg viewBox="0 0 100 100" class="crt-glow">
          ${HEAD_COMPLEX}
          <path d="M50 60 L50 85 M30 65 L70 65 L65 85 L35 85 Z" fill="${color}" opacity="0.2" /> <!-- Solid Chest -->
          ${TORSO_COMPLEX}
          <path d="M35 65 L20 80 M65 65 L80 80" stroke="${color}" stroke-width="2.5" />
          ${defaultLegs}
        </svg>
      `,
      charisma: `
        <svg viewBox="0 0 100 100" class="crt-glow">
          ${HEAD_COMPLEX}
          ${TORSO_COMPLEX}
          <path class="wave" d="M75 30 Q85 35 75 40 M80 25 Q95 35 80 45" stroke="${color}" fill="none" stroke-width="2" />
          <path d="M35 65 L20 80 M65 65 L80 80" stroke="${color}" stroke-width="2.5" />
          ${defaultLegs}
          <style>
            @keyframes wave { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
            .wave { animation: wave 1.5s infinite; }
          </style>
        </svg>
      `,
      intelligence: `
        <svg viewBox="0 0 100 100" class="crt-glow">
          <g class="brain-glow">
            ${HEAD_COMPLEX}
          </g>
          ${TORSO_COMPLEX}
          <path d="M35 65 L20 80 M65 65 L80 80" stroke="${color}" stroke-width="2.5" />
          ${defaultLegs}
          <style>
            @keyframes brain { 0%, 100% { filter: drop-shadow(0 0 2px ${color}); } 50% { filter: drop-shadow(0 0 15px ${color}); } }
            .brain-glow { animation: brain 2s infinite; }
          </style>
        </svg>
      `,
      agility: `
        <svg viewBox="0 0 100 100" class="jump crt-glow">
          ${HEAD_COMPLEX}
          ${TORSO_COMPLEX}
          <path d="M35 65 L15 60 M65 65 L85 60" stroke="${color}" stroke-width="2.5" />
          <path d="M40 85 L30 95 M60 85 L70 95" stroke="${color}" stroke-width="2.5" />
          <style>
            @keyframes jump-high { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-25px) rotate(5deg); } }
            .jump { animation: jump-high 0.6s infinite ease-out; }
          </style>
        </svg>
      `,
      luck: `
        <svg viewBox="0 0 100 100" class="crt-glow">
          ${HEAD_COMPLEX}
          ${TORSO_COMPLEX}
          <path class="stars" d="M10 20 L12 25 L15 20 L12 18 Z M85 15 L87 20 L90 15 L87 13 Z M20 80 L22 85 L25 80 L22 78 Z" fill="${color}" />
          <path d="M35 65 L20 80 M65 65 L80 80" stroke="${color}" stroke-width="2.5" />
          ${defaultLegs}
          <style>
            @keyframes stars { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0; transform: scale(0.5); } }
            .stars { animation: stars 1s infinite; transform-origin: center; }
          </style>
        </svg>
      `,
      radiation: `
        <svg viewBox="0 0 100 100" class="crt-glow">
          <g class="rad-pulse">
            ${HEAD_COMPLEX}
            ${TORSO_COMPLEX}
          </g>
          <path class="rad-hazard" d="M50 5 L50 15 M50 90 L50 95 M10 50 L20 50 M90 50 L95 50" stroke="${color}" stroke-width="3" />
          ${defaultLegs}
          <style>
            @keyframes rad-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; filter: blur(2px); } }
            .rad-pulse { animation: rad-pulse 0.5s infinite; }
          </style>
        </svg>
      `,
      healing: `
        <svg viewBox="0 0 100 100" class="crt-glow">
          ${HEAD_COMPLEX}
          ${TORSO_COMPLEX}
          <path class="plus" d="M75 10 L85 10 M80 5 L80 15" stroke="${color}" stroke-width="3" />
          <path d="M35 65 L20 80 M65 65 L80 80" stroke="${color}" stroke-width="2.5" />
          ${defaultLegs}
          <style>
            @keyframes heal { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(-20px); opacity: 0; } }
            .plus { animation: heal 1s infinite; }
          </style>
        </svg>
      `,
      repairing: `
        <svg viewBox="0 0 100 100" class="crt-glow">
          ${HEAD_COMPLEX}
          ${TORSO_COMPLEX}
          <g class="wrench">
            <path d="M70 60 L85 45 M85 45 C90 40 95 45 90 50 L75 65" stroke="${color}" stroke-width="2.5" fill="none" />
          </g>
          <path d="M35 65 L20 80" stroke="${color}" stroke-width="2.5" />
          ${defaultLegs}
          <style>
            @keyframes wrench { 0%, 100% { transform: rotate(0); } 50% { transform: rotate(-45deg); } }
            .wrench { animation: wrench 0.5s infinite; transform-origin: 70% 60%; }
          </style>
        </svg>
      `,
      drinking: `
        <svg viewBox="0 0 100 100" class="crt-glow">
          ${HEAD_COMPLEX}
          ${TORSO_COMPLEX}
          <path d="M65 65 L75 45 M75 45 L85 45" stroke="${color}" stroke-width="2.5" /> <!-- Bottle -->
          <rect x="80" y="35" width="8" height="15" stroke="${color}" fill="none" />
          <path d="M35 65 L20 80" stroke="${color}" stroke-width="2.5" />
          ${defaultLegs}
        </svg>
      `,
      eating: `
        <svg viewBox="0 0 100 100" class="crt-glow">
          ${HEAD_COMPLEX}
          ${TORSO_COMPLEX}
          <path class="munch" d="M50 55 Q50 58 55 55" stroke="${color}" stroke-width="2" />
          <path d="M65 65 L75 55" stroke="${color}" stroke-width="2.5" />
          <circle cx="80" cy="50" r="5" stroke="${color}" fill="none" /> <!-- Food Paste -->
          <path d="M35 65 L20 80" stroke="${color}" stroke-width="2.5" />
          ${defaultLegs}
          <style>
            @keyframes munch { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.5); } }
            .munch { animation: munch 0.3s infinite; }
          </style>
        </svg>
      `,
      chems: `
        <svg viewBox="0 0 100 100" class="crt-glow">
          <g class="jitter">
            ${HEAD_COMPLEX}
            ${TORSO_COMPLEX}
            <path d="M35 65 L20 80 M65 65 L80 80" stroke="${color}" stroke-width="2.5" />
            <rect x="75" y="45" width="10" height="20" stroke="${color}" fill="none" /> <!-- Jet/Med-X -->
          </g>
          ${defaultLegs}
          <style>
            @keyframes jitter { 0% { transform: translate(1px,0); } 50% { transform: translate(-1px,1px); } 100% { transform: translate(0,0); } }
            .jitter { animation: jitter 0.05s infinite; }
          </style>
        </svg>
      `,
      hacking: `
        <svg viewBox="0 0 100 100" class="crt-glow">
          ${HEAD_COMPLEX}
          ${TORSO_COMPLEX}
          <path d="M35 65 L25 55 M65 65 L75 55" stroke="${color}" stroke-width="2.5" />
          <rect x="20" y="45" width="60" height="15" stroke="${color}" fill="none" /> <!-- Terminal Interface -->
          <path class="cursor" d="M30 52 L35 52" stroke="${color}" stroke-width="2" />
          ${defaultLegs}
          <style>
            @keyframes cursor { 50% { opacity: 0; } }
            .cursor { animation: cursor 0.5s step-end infinite; }
          </style>
        </svg>
      `,
      lockpicking: `
        <svg viewBox="0 0 100 100" class="crt-glow">
          ${HEAD_COMPLEX}
          ${TORSO_COMPLEX}
          <path class="pick" d="M65 65 L85 50 M85 50 L90 40" stroke="${color}" stroke-width="2" />
          <circle cx="85" cy="55" r="8" stroke="${color}" fill="none" /> <!-- Lock -->
          <path d="M35 65 L20 80" stroke="${color}" stroke-width="2.5" />
          ${defaultLegs}
          <style>
            @keyframes picking { 0%, 100% { transform: rotate(0); } 50% { transform: rotate(-10deg); } }
            .pick { animation: picking 0.2s infinite; transform-origin: 65% 65%; }
          </style>
        </svg>
      `,
      combat: `
        <svg viewBox="0 0 100 100" class="crt-glow">
          ${HEAD_COMPLEX}
          ${TORSO_COMPLEX}
          <path d="M35 65 L15 65 M65 65 L85 65" stroke="${color}" stroke-width="2.5" />
          <rect x="80" y="60" width="15" height="10" stroke="${color}" fill="none" stroke-width="2" /> <!-- Laser Pistol -->
          <path class="beam" d="M95 65 L120 65" stroke="#ff6b5e" stroke-width="2" opacity="0" />
          <path d="M40 85 L30 100 M60 85 L70 100" stroke="${color}" stroke-width="3" />
          <style>
            @keyframes shoot { 0% { opacity: 1; transform: translateX(0); } 100% { opacity: 0; transform: translateX(50px); } }
            .beam { animation: shoot 0.5s infinite; }
          </style>
        </svg>
      `,
      dead: `
        <svg viewBox="0 0 100 100" class="crt-glow">
          <g transform="translate(0,30) rotate(-15 50 50)">
            <path d="M50 15 C35 15 30 25 30 40 C30 55 35 60 50 60 C65 60 70 55 70 40 C70 25 65 15 50 15 Z" fill="none" stroke="${color}" stroke-width="2.5" />
            <path d="M40 35 L45 45 M45 35 L40 45 M55 35 L60 45 M60 35 L55 45" stroke="${color}" stroke-width="2.5" /> <!-- X Eyes -->
            ${TORSO_COMPLEX}
            <path d="M35 65 L10 75 M65 65 L90 75" stroke="${color}" stroke-width="2.5" />
            ${defaultLegs}
          </g>
        </svg>
      `,
      stealth: `
        <svg viewBox="0 0 100 100" class="crt-glow">
          <g opacity="0.3">
            ${HEAD_COMPLEX}
            ${TORSO_COMPLEX}
            <path d="M35 65 L20 80 M65 65 L80 80" stroke="${color}" stroke-width="2.5" />
            <path d="M40 85 L35 100 M60 85 L65 100" stroke="${color}" stroke-width="2.5" />
          </g>
          <path d="M40 10 Q50 0 60 10" stroke="${color}" stroke-width="1" stroke-dasharray="2,2" /> <!-- Hidden indicator -->
        </svg>
      `,
      sleeping: `
        <svg viewBox="0 0 100 100" class="crt-glow">
          <g transform="rotate(90 50 50) translate(20,0)">
            ${HEAD_COMPLEX}
            ${TORSO_COMPLEX}
            <path d="M35 65 L20 80 M65 65 L80 80" stroke="${color}" stroke-width="2.5" />
            ${defaultLegs}
          </g>
          <text x="70" y="30" fill="${color}" font-family="monospace" font-size="12" class="zzz">Z</text>
          <style>
            @keyframes zzz { 0% { opacity: 0; transform: translate(0,0) scale(0.5); } 50% { opacity: 1; } 100% { opacity: 0; transform: translate(15px, -30px) scale(1.2); } }
            .zzz { animation: zzz 2s infinite; }
          </style>
        </svg>
      `,
    };

    // Generic high-fidelity wrapper for missing animations
    const currentAnim = animations[this.animation] || `
      <svg viewBox="0 0 100 100" class="crt-glow">
        ${HEAD_COMPLEX}
        ${TORSO_COMPLEX}
        <path d="M35 65 L20 80 M65 65 L80 80" stroke="${color}" stroke-width="2.5" fill="none" />
        <path d="M40 85 L35 100 M60 85 L65 100" stroke="${color}" stroke-width="2.5" fill="none" />
        <text x="50" y="5" text-anchor="middle" fill="${color}" font-family="monospace" font-size="6">[DATA_UNAVAILABLE: ${this.animation.toUpperCase()}]</text>
      </svg>
    `;

    this.shadowRoot.innerHTML = `
      <div class="monitor-housing">
        <div class="scanlines"></div>
        <div class="flicker"></div>
        <div class="content">
          ${currentAnim}
        </div>
      </div>
      <style>
        :host { display: block; width: 100%; height: 100%; overflow: hidden; background: #0b0f0a; border-radius: 50% / 10%; position: relative; }
        .monitor-housing { width: 100%; height: 100%; position: relative; display: flex; align-items: center; justify-content: center; }
        .content { width: 85%; height: 85%; z-index: 5; }
        .scanlines {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.2) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.02), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.02));
          background-size: 100% 4px, 3px 100%;
          z-index: 10; pointer-events: none;
        }
        .flicker {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(156, 255, 87, 0.01);
          opacity: 0; z-index: 11; pointer-events: none;
          animation: flicker 0.15s infinite;
        }
        @keyframes flicker {
          0% { opacity: 0.1; } 5% { opacity: 0.2; } 10% { opacity: 0.1; } 15% { opacity: 0.3; } 
          20% { opacity: 0.1; } 25% { opacity: 0.2; } 30% { opacity: 0.1; } 100% { opacity: 0.1; }
        }
        svg { width: 100%; height: 100%; }
      </style>
    `;
  }
}

customElements.define('fallout-vault-boy', FalloutVaultBoy);
