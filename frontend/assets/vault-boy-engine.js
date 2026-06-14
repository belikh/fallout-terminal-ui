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
    const animations = {
      idle: `
        <svg viewBox="0 0 100 100">
          <g class="body" stroke="${color}" fill="none" stroke-width="2">
            <circle cx="50" cy="40" r="20" class="head" />
            <path d="M50 60 L50 85 M50 65 L30 75 M50 65 L70 75 M50 85 L35 95 M50 85 L65 95" />
          </g>
          <style>
            @keyframes breathe {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-2px); }
            }
            .head { animation: breathe 3s ease-in-out infinite; transform-origin: 50% 60%; }
          </style>
        </svg>
      `,
      walking: `
        <svg viewBox="0 0 100 100">
          <g stroke="${color}" fill="none" stroke-width="2">
            <circle cx="50" cy="35" r="18" />
            <path d="M50 53 L50 75" />
            <path class="arm-l" d="M50 58 L30 70" />
            <path class="arm-r" d="M50 58 L70 70" />
            <path class="leg-l" d="M50 75 L40 90" />
            <path class="leg-r" d="M50 75 L60 90" />
          </g>
          <style>
            @keyframes walk-l { 0%, 100% { d: path('M50 75 L40 90'); } 50% { d: path('M50 75 L60 90'); } }
            @keyframes walk-r { 0%, 100% { d: path('M50 75 L60 90'); } 50% { d: path('M50 75 L40 90'); } }
            .leg-l { animation: walk-l 1s infinite; }
            .leg-r { animation: walk-r 1s infinite; }
          </style>
        </svg>
      `,
      thumbs_up: `
        <svg viewBox="0 0 100 100">
          <g stroke="${color}" fill="none" stroke-width="2">
            <circle cx="50" cy="35" r="18" />
            <path d="M50 53 L50 85" />
            <path d="M50 58 L70 45 L80 35" /> <!-- Thumbs up arm -->
            <path d="M80 35 L85 35 M80 35 L80 30" /> <!-- Thumb detail -->
            <path d="M50 58 L30 70" />
            <path d="M50 85 L40 95 M50 85 L60 95" />
          </g>
          <style>
            @keyframes glow { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
            svg { animation: glow 2s ease-in-out infinite; }
          </style>
        </svg>
      `,
      alert: `
        <svg viewBox="0 0 100 100">
          <g stroke="${color}" fill="none" stroke-width="2">
            <circle cx="50" cy="35" r="18" />
            <path d="M50 53 L50 85" />
            <path class="arm" d="M50 58 L80 75" />
            <path class="arm" d="M50 58 L20 75" />
            <path d="M50 85 L40 95 M50 85 L60 95" />
          </g>
          <style>
            @keyframes shake { 0%, 100% { transform: translate(0,0); } 25% { transform: translate(-2px, 1px); } 75% { transform: translate(2px, -1px); } }
            svg { animation: shake 0.1s infinite; }
          </style>
        </svg>
      `
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
