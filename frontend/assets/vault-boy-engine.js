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
    
    // AUTHENTIC VAULT BOY ANATOMY (Complex Paths)
    const HAIR = `
      <path d="M40 15 C45 10 55 10 60 15 C65 20 65 30 60 35 C58 38 52 35 50 32 C48 35 42 38 40 35 C35 30 35 20 40 15" fill="none" stroke="${color}" stroke-width="2" />
      <path d="M50 15 Q60 5 75 15 T85 35 Q85 45 75 50" fill="none" stroke="${color}" stroke-width="1.5" /> <!-- Pompadour Swirl -->
    `;

    const FACE = `
      <path d="M35 35 C35 20 65 20 65 35 C65 55 58 65 50 65 C42 65 35 55 35 35 Z" fill="none" stroke="${color}" stroke-width="2.5" /> <!-- Jawline -->
      <path d="M42 38 Q45 35 48 38 M52 38 Q55 35 58 38" fill="none" stroke="${color}" stroke-width="2" /> <!-- Brows -->
      <circle cx="45" cy="45" r="2.5" fill="${color}" /> <!-- Eye L -->
      <circle cx="55" cy="45" r="2.5" fill="${color}" /> <!-- Eye R -->
      <path d="M42 55 Q50 62 58 55" fill="none" stroke="${color}" stroke-width="2" /> <!-- Signature Smile -->
      <path d="M35 40 C32 40 30 45 32 48 M65 40 C68 40 70 45 68 48" fill="none" stroke="${color}" stroke-width="1.5" /> <!-- Ears -->
    `;

    const SUIT = `
      <path d="M40 65 L35 70 L35 90 L65 90 L65 70 L60 65" fill="none" stroke="${color}" stroke-width="2.5" /> <!-- Torso -->
      <path d="M45 65 L50 72 L55 65" fill="none" stroke="${color}" stroke-width="2" /> <!-- Collar -->
      <path d="M40 75 L60 75 M40 82 L60 82" stroke="${color}" stroke-width="1" opacity="0.6" /> <!-- Suit Ridges -->
      <text x="44" y="86" fill="${color}" font-size="8" font-family="monospace" font-weight="bold">111</text>
    `;

    const animations = {
      idle: `
        <svg viewBox="0 0 100 100" class="crt-glow">
          <g class="breathe">
            ${HAIR}
            ${FACE}
            ${SUIT}
            <path d="M35 70 L20 85 C15 90 20 95 25 90 L35 80" fill="none" stroke="${color}" stroke-width="2.5" /> <!-- Arm L -->
            <path d="M65 70 L80 85 C85 90 80 95 75 90 L65 80" fill="none" stroke="${color}" stroke-width="2.5" /> <!-- Arm R -->
            <path d="M40 90 L35 105 M60 90 L65 105" stroke="${color}" stroke-width="3" /> <!-- Legs -->
          </g>
          <style>
            @keyframes breathe { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-2px) scale(1.01); } }
            .breathe { animation: breathe 3.5s ease-in-out infinite; transform-origin: center 90%; }
            .crt-glow { filter: drop-shadow(0 0 4px ${color}); }
          </style>
        </svg>
      `,
      thumbs_up: `
        <svg viewBox="0 0 100 100" class="crt-glow">
          ${HAIR}
          ${FACE}
          ${SUIT}
          <path d="M35 70 L20 85" fill="none" stroke="${color}" stroke-width="2.5" /> <!-- Arm L -->
          <g class="thumb-action">
            <path d="M65 70 L85 55" stroke="${color}" stroke-width="3" fill="none" />
            <path d="M85 55 C90 55 95 50 92 45 C90 40 85 42 85 50" fill="${color}" /> <!-- High Detail Thumb -->
            <circle cx="85" cy="55" r="4" fill="none" stroke="${color}" stroke-width="1" /> <!-- Hand base -->
          </g>
          <path d="M40 90 L38 105 M60 90 L62 105" stroke="${color}" stroke-width="3" />
          <style>
            @keyframes wink { 0%, 90%, 100% { opacity: 1; } 95% { opacity: 0; } }
            @keyframes swagger { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
            .thumb-action { animation: swagger 1.5s ease-in-out infinite; transform-origin: 65% 70%; }
            .crt-glow { filter: drop-shadow(0 0 6px ${color}); }
          </style>
        </svg>
      `,
      walking: `
        <svg viewBox="0 0 100 100" class="crt-glow">
          <g class="bob">
            ${HAIR}
            ${FACE}
            ${SUIT}
          </g>
          <path class="arm-l" d="M35 70 L25 90" stroke="${color}" stroke-width="2.5" fill="none" />
          <path class="arm-r" d="M65 70 L75 90" stroke="${color}" stroke-width="2.5" fill="none" />
          <path class="leg-l" d="M40 90 L30 105" stroke="${color}" stroke-width="3.5" />
          <path class="leg-r" d="M60 90 L70 105" stroke="${color}" stroke-width="3.5" />
          <style>
            @keyframes bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(2px); } }
            @keyframes swing { 0%, 100% { transform: rotate(-20deg); } 50% { transform: rotate(20deg); } }
            .bob { animation: bob 0.6s ease-in-out infinite; }
            .leg-l { animation: swing 0.6s infinite; transform-origin: 40% 90%; }
            .leg-r { animation: swing 0.6s infinite reverse; transform-origin: 60% 90%; }
            .arm-l { animation: swing 0.6s infinite reverse; transform-origin: 35% 70%; }
            .arm-r { animation: swing 0.6s infinite; transform-origin: 65% 70%; }
          </style>
        </svg>
      `,
      alert: `
        <svg viewBox="0 0 100 100" class="crt-glow">
          <g class="vibrate">
            <path d="M50 15 C35 15 30 25 30 40 C30 55 35 60 50 60 C65 60 70 55 70 40 C70 25 65 15 50 15 Z" fill="none" stroke="#ff6b5e" stroke-width="3" />
            <path d="M40 40 L45 45 M45 40 L40 45 M55 40 L60 45 M60 40 L55 45" stroke="#ff6b5e" stroke-width="3" /> <!-- X Eyes -->
            <path d="M45 55 Q50 65 55 55" fill="none" stroke="#ff6b5e" stroke-width="2" /> <!-- Frown -->
            ${SUIT.replace(color, '#ff6b5e')}
            <path d="M35 70 L10 55 M65 70 L90 55" stroke="#ff6b5e" stroke-width="3" /> <!-- Panic Arms -->
            <path d="M40 90 L25 105 M60 90 L75 105" stroke="#ff6b5e" stroke-width="3" />
          </g>
          <style>
            @keyframes vibrate { 0% { transform: translate(1px, 1px); } 20% { transform: translate(-2px, 0px); } 40% { transform: translate(2px, -1px); } 60% { transform: translate(-1px, 2px); } 80% { transform: translate(1px, -2px); } 100% { transform: translate(0,0); } }
            .vibrate { animation: vibrate 0.1s infinite; }
            .crt-glow { filter: drop-shadow(0 0 12px #ff6b5e); }
          </style>
        </svg>
      `
    };

    const currentAnim = animations[this.animation] || `
      <svg viewBox="0 0 100 100" class="crt-glow">
        ${HAIR}
        ${FACE}
        ${SUIT}
        <path d="M35 70 L20 85 M65 70 L80 85" stroke="${color}" stroke-width="2.5" fill="none" />
        <path d="M40 90 L35 105 M60 90 L65 105" stroke="${color}" stroke-width="3" fill="none" />
        <text x="50" y="8" text-anchor="middle" fill="${color}" font-family="monospace" font-size="5" opacity="0.8">[GENERIC_RENDER: ${this.animation.toUpperCase()}]</text>
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
        :host { display: block; width: 100%; height: 100%; overflow: hidden; background: #0b0f0a; border-radius: 12% / 4%; position: relative; border: 2px solid rgba(156, 255, 87, 0.1); }
        .monitor-housing { width: 100%; height: 100%; position: relative; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 0 30px rgba(0,0,0,1); }
        .content { width: 80%; height: 80%; z-index: 5; }
        .scanlines {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.3) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03));
          background-size: 100% 3px, 3px 100%;
          z-index: 10; pointer-events: none;
        }
        .flicker {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(156, 255, 87, 0.015);
          opacity: 0; z-index: 11; pointer-events: none;
          animation: flicker 0.1s infinite;
        }
        @keyframes flicker {
          0% { opacity: 0.05; } 10% { opacity: 0.15; } 20% { opacity: 0.05; } 50% { opacity: 0.2; } 100% { opacity: 0.05; }
        }
        svg { width: 100%; height: 100%; overflow: visible; }
      </style>
    `;
  }
}

customElements.define('fallout-vault-boy', FalloutVaultBoy);
