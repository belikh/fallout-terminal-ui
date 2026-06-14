class FalloutStatPanel extends HTMLElement {
  set hass(hass) {
    this._hass = hass;
    if (!this.content) {
      this.innerHTML = `
        <style>
          ha-card.fallout-stat-panel {
            background: #0b0f0a;
            color: #9cff57;
            border: 2px solid rgba(156, 255, 87, 0.3);
            border-radius: 4px;
            padding: 15px;
            font-family: 'IBM Plex Mono', monospace;
            text-transform: uppercase;
            box-shadow: inset 0 0 10px rgba(0,0,0,0.8);
            position: relative;
            overflow: hidden;
          }
          .stat-label { font-size: 0.8em; border-bottom: 1px solid rgba(156, 255, 87, 0.2); margin-bottom: 8px; }
          .stat-value { font-size: 1.8em; font-weight: 900; text-shadow: 0 0 8px rgba(156, 255, 87, 0.6); }
          .stat-unit { font-size: 0.6em; opacity: 0.7; margin-left: 4px; }
        </style>
        <ha-card class="fallout-stat-panel">
          <div id="content"></div>
        </ha-card>
      `;
      this.content = this.querySelector('#content');
    }

    const entityId = this.config.entity;
    const state = hass.states[entityId];
    const value = state ? state.state : '---';
    const unit = state ? state.attributes.unit_of_measurement || '' : '';
    const label = this.config.name || (state ? state.attributes.friendly_name : entityId);

    this.content.innerHTML = `
      <div class="stat-label">> ${label}</div>
      <div class="stat-value">${value}<span class="stat-unit">${unit}</span></div>
    `;
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You must specify an operational entity');
    }
    this.config = config;
  }
  static getConfigElement() { return document.createElement('fallout-card-editor'); }
  static getStubConfig() { return { type: 'custom:fallout-stat-panel', entity: '' }; }
}

customElements.define('fallout-stat-panel', FalloutStatPanel);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "fallout-stat-panel",
  name: "RobCo Stat Panel",
  preview: true,
  description: "A RobCo inspired stat panel."
});
