class FalloutStatPanel extends HTMLElement {
  set hass(hass) {
    this._hass = hass;
    if (!this.content) {
      this.innerHTML = `
        <style>
          ha-card.fallout-stat-panel {
            background: rgba(9, 16, 10, 0.94);
            color: #9cff57;
            border: 1px solid rgba(156, 255, 87, 0.25);
            border-radius: 4px;
            padding: 8px;
            font-family: 'IBM Plex Mono', monospace;
            text-transform: uppercase;
          }
        </style>
        <ha-card class="fallout-stat-panel">
          <div id="content"></div>
        </ha-card>
      `;
      this.content = this.querySelector('#content');
    }

    const entityId = this.config.entity;
    const state = hass.states[entityId];
    this.content.innerHTML = `
      <div>${this.config.name || entityId}</div>
      <div style="font-size: 1.5em; font-weight: bold;">${state ? state.state : 'N/A'} ${state ? state.attributes.unit_of_measurement || '' : ''}</div>
    `;
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You must specify an operational entity');
    }
    this.config = config;
  }
}

customElements.define('fallout-stat-panel', FalloutStatPanel);
