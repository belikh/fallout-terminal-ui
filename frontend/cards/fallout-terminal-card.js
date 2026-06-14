class FalloutTerminalCard extends HTMLElement {
  set hass(hass) {
    this._hass = hass;
    if (!this.content) {
      this.innerHTML = `
        <style>
          ha-card.fallout-terminal {
            background: rgba(9, 16, 10, 0.94);
            color: #b8ff9a;
            border: 1px solid rgba(156, 255, 87, 0.25);
            box-shadow: 0 0 15px rgba(156, 255, 87, 0.1), inset 0 0 10px rgba(0,0,0,0.8);
            border-radius: 6px;
            font-family: 'IBM Plex Mono', 'Courier New', monospace;
            padding: 16px;
            position: relative;
            overflow: hidden;
          }
          ha-card.fallout-terminal::before {
            content: " ";
            display: block;
            position: absolute;
            top: 0; left: 0; bottom: 0; right: 0;
            background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
            z-index: 2;
            background-size: 100% 3px, 3px 100%;
            pointer-events: none;
          }
          .terminal-header {
            border-bottom: 1px solid rgba(156, 255, 87, 0.4);
            padding-bottom: 4px;
            margin-bottom: 12px;
            text-transform: uppercase;
            font-weight: bold;
            font-size: 1.1em;
            letter-spacing: 1px;
          }
          .terminal-content {
            line-height: 1.4;
          }
        </style>
        <ha-card class="fallout-terminal">
          <div class="terminal-header" id="title">ROBCO INDUSTRIES UNIFIED TERMINAL</div>
          <div class="terminal-content" id="content"></div>
        </ha-card>
      `;
      this.content = this.querySelector('#content');
      this.titleElement = this.querySelector('#title');
    }

    const entityId = this.config.entity;
    const state = hass.states[entityId];
    const stateStr = state ? state.state : 'UNKNOWN';
    const friendlyName = state && state.attributes.friendly_name ? state.attributes.friendly_name : entityId;

    this.titleElement.innerText = this.config.title || `DEVICE: ${friendlyName.toUpperCase()}`;
    this.content.innerHTML = `
      <div>> INITIALIZING MONITORING MATRIX...</div>
      <div>> CURRENT STATUS: <span style="color: #9cff57; font-weight: bold;">${stateStr.toUpperCase()}</span></div>
      ${this.config.show_attributes && state ? Object.keys(state.attributes).map(attr => `
        <div>>> ${attr.toUpperCase()}: ${state.attributes[attr]}</div>
      `).join('') : ''}
    `;
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You must specify an operational entity');
    }
    this.config = config;
  }

  getCardSize() {
    return 3;
  }
}

customElements.define('fallout-terminal-card', FalloutTerminalCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "fallout-terminal-card",
  name: "Fallout Terminal Monitor Card",
  preview: false,
  description: "A RobCo inspired diagnostic terminal card for tracking entity lifecycles."
});
