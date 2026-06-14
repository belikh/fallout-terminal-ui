/* 
  ROBCO INDUSTRIES UI COMPONENT SUITE
  Version: 3.0.0
  Contains: Diagnostic, Control, Layout, and Unique Thematic Cards
*/

const FALLOUT_STYLES = `
  <style>
    .robco-card {
      background: #0b0f0a;
      color: var(--primary-text-color, #b8ff9a);
      border: 2px solid rgba(156, 255, 87, 0.4);
      box-shadow: 0 0 20px rgba(156, 255, 87, 0.1), inset 0 0 15px rgba(0,0,0,0.9);
      border-radius: 10% / 2%;
      padding: 20px;
      position: relative;
      overflow: hidden;
      text-transform: uppercase;
      font-family: 'IBM Plex Mono', monospace;
    }
    .robco-card::after {
      content: "";
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      background: radial-gradient(circle, transparent 70%, rgba(0,0,0,0.4) 100%);
      pointer-events: none;
      z-index: 100;
    }
    .header { 
      border-bottom: 2px solid rgba(156, 255, 87, 0.5); 
      margin-bottom: 15px; 
      font-weight: 900; 
      font-size: 1.2em;
      letter-spacing: 2px;
      display: flex;
      justify-content: space-between;
    }
    .header::before { content: "[ "; }
    .header::after { content: " ]"; }
    .status-ok { color: #9cff57; text-shadow: 0 0 5px #9cff57; }
    .status-warn { color: #e6c15a; text-shadow: 0 0 5px #e6c15a; }
    .status-alert { color: #ff6b5e; text-shadow: 0 0 8px #ff6b5e; }
    .meta { font-size: 0.7em; color: rgba(156, 255, 87, 0.5); margin-top: 10px; border-top: 1px dashed rgba(156, 255, 87, 0.2); padding-top: 5px; }
    .blink { animation: blink 1s step-end infinite; }
    @keyframes blink { 50% { opacity: 0; } }
    
    .typewriter {
      overflow: hidden;
      white-space: nowrap;
      margin: 0;
      animation: typing 1.5s steps(40, end);
    }
    @keyframes typing {
      from { width: 0; }
      to { width: 100%; }
    }
    .interactive-btn {
      background: none; 
      border: 2px solid var(--primary-text-color, #9cff57); 
      color: var(--primary-text-color, #9cff57); 
      padding: 10px 20px; 
      cursor: pointer; 
      text-transform: uppercase; 
      font-family: 'IBM Plex Mono'; 
      font-weight: bold; 
      box-shadow: 0 0 10px rgba(156,255,87,0.2);
      transition: all 0.1s;
    }
    .interactive-btn:active {
      background: var(--primary-text-color, #9cff57);
      color: #000;
    }
  </style>
`;

class FalloutCardEditor extends HTMLElement {
  constructor() { super(); }
  setConfig(config) {
    this._config = Object.assign({}, config);
    this.render();
  }
  set hass(hass) {
    this._hass = hass;
    this.render();
  }
  render() {
    if (!this._hass || !this._config || this._rendered) return;
    this.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <ha-entity-picker label="Entity (Optional for some cards)"></ha-entity-picker>
        <ha-textfield label="Custom Title (Optional)"></ha-textfield>
        <ha-textfield label="Animation (for Vault Boy)" placeholder="idle, alert, walking..."></ha-textfield>
        <ha-textfield label="Color Override" placeholder="#9cff57"></ha-textfield>
        <ha-textfield label="Domain Override" placeholder="switch, light..."></ha-textfield>
        <ha-textfield label="Service Override" placeholder="toggle, turn_on..."></ha-textfield>
      </div>
    `;
    
    const entityPicker = this.querySelector('ha-entity-picker');
    entityPicker.hass = this._hass;
    entityPicker.value = this._config.entity || '';
    entityPicker.addEventListener('value-changed', (e) => {
      this._config = { ...this._config, entity: e.detail.value };
      this.fireEvent();
    });

    const inputs = this.querySelectorAll('ha-textfield');
    const fields = ['title', 'animation', 'color', 'domain', 'service'];
    inputs.forEach((input, index) => {
      input.value = this._config[fields[index]] || '';
      input.addEventListener('input', (e) => {
        if (e.target.value) {
          this._config[fields[index]] = e.target.value;
        } else {
          delete this._config[fields[index]];
        }
        this.fireEvent();
      });
    });

    this._rendered = true;
  }
  fireEvent() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true
    }));
  }
}
customElements.define('fallout-card-editor', FalloutCardEditor);

const defineRobcoCard = (className, tagName, renderFn, attachEventsFn = null) => {
  class Card extends HTMLElement {
    static getConfigElement() { return document.createElement('fallout-card-editor'); }
    static getStubConfig() { return { type: 'custom:' + tagName, entity: '' }; }
    
    set hass(hass) {
      this._hass = hass;
      if (!this.container) {
        this.innerHTML = FALLOUT_STYLES + '<div class="robco-card"></div>';
        this.container = this.querySelector('.robco-card');
        this.container.innerHTML = renderFn(this.config, hass);
        if (attachEventsFn) attachEventsFn(this.container, this.config, hass);
      } else {
        this.container.innerHTML = renderFn(this.config, hass);
        if (attachEventsFn) attachEventsFn(this.container, this.config, hass);
      }
    }
    setConfig(config) { this.config = config; }
    getCardSize() { return 2; }
  }
  customElements.define(tagName, Card);
  
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: tagName,
    name: "RobCo " + tagName.replace('fallout-', '').replace('-card', '').replace(/-/g, ' ').toUpperCase(),
    preview: true,
    description: "RobCo Industries Component"
  });
};

// ==========================================
// 1-10: DIAGNOSTIC CARDS
// ==========================================
[
  ['RobcoMainframeCard', 'fallout-mainframe-card', 'MAINFRAME'],
  ['RobcoPowerCard', 'fallout-power-card', 'POWER GRID'],
  ['RobcoWaterCard', 'fallout-water-card', 'PURIFICATION'],
  ['RobcoFoodCard', 'fallout-food-card', 'NUTRIENT RECYCLER'],
  ['RobcoDefenseCard', 'fallout-defense-card', 'PERIMETER DEFENSE'],
  ['RobcoRadCard', 'fallout-rad-card', 'GEIGER COUNTER'],
  ['RobcoTempCard', 'fallout-temp-card', 'THERMAL SENSOR'],
  ['RobcoHumidCard', 'fallout-humid-card', 'HYGROMETER'],
  ['RobcoO2Card', 'fallout-o2-card', 'OXYGEN SCRUBBER'],
  ['RobcoHullCard', 'fallout-hull-card', 'STRUCTURAL INTEGRITY']
].forEach(([cls, tag, title]) => {
  defineRobcoCard(cls, tag, (cfg, hass) => {
    const state = hass.states[cfg.entity] || { state: 'OFFLINE', attributes: {} };
    const statusClass = state.state === 'OFFLINE' ? 'status-alert' : 'status-ok';
    return \`
      <div class="header"><div class="typewriter">\${title}</div></div>
      <div style="font-size: 1.1em;">> MONITORING... [ <span class="\${statusClass}">\${state.state}</span> ]</div>
      <div class="meta">
        <div>UUID: \${cfg.entity || '0x0000'}</div>
        <div>LINK: SECURE_V6_LINE</div>
      </div>
    \`;
  });
});

// ==========================================
// 11-20: CONTROL CARDS (INTERACTIVE)
// ==========================================
defineRobcoCard('RobcoSliderCard', 'fallout-slider-card', (cfg, hass) => {
  const val = hass.states[cfg.entity] ? hass.states[cfg.entity].state : 50;
  return \`
    <div class="header"><div class="typewriter">\${cfg.title || 'VALVE CONTROL'}</div></div>
    <div style="text-align: center; font-size: 1.5em; font-weight: bold; margin-bottom: 10px;">\${val}%</div>
    <input type="range" min="0" max="100" value="\${val}" class="robco-slider" style="width: 100%; accent-color: #9cff57; cursor: pointer;">
    <style>
      .robco-slider { -webkit-appearance: none; background: rgba(156,255,87,0.2); height: 8px; border-radius: 4px; }
      .robco-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 24px; background: #9cff57; cursor: pointer; border-radius: 2px; }
    </style>
  \`;
}, (container, cfg, hass) => {
  const slider = container.querySelector('input');
  slider.addEventListener('change', (e) => {
    if(cfg.entity) hass.callService('input_number', 'set_value', { entity_id: cfg.entity, value: e.target.value });
  });
});

[
  ['RobcoSwitchCard', 'fallout-switch-card', 'TOGGLE', 'switch', 'toggle'],
  ['RobcoButtonCard', 'fallout-button-card', 'EXECUTE', 'button', 'press'],
  ['RobcoLockCard', 'fallout-lock-card', 'SECURITY SEAL', 'lock', 'toggle'],
  ['RobcoSequenceCard', 'fallout-sequence-card', 'CMD SEQUENCE', 'script', 'turn_on'],
  ['RobcoResetCard', 'fallout-reset-card', 'SYSTEM RESET', 'homeassistant', 'restart'],
  ['RobcoEStopCard', 'fallout-estop-card', 'EMERGENCY STOP', 'homeassistant', 'stop'],
  ['RobcoOverrideCard', 'fallout-override-card', 'MANUAL OVERRIDE', 'input_boolean', 'toggle'],
  ['RobcoCalibrateCard', 'fallout-calibrate-card', 'CALIBRATION', 'homeassistant', 'update_entity'],
  ['RobcoModeCard', 'fallout-mode-card', 'LOGIC MODE', 'input_select', 'select_next']
].forEach(([cls, tag, title, defaultDomain, defaultService]) => {
  defineRobcoCard(cls, tag, (cfg, hass) => \`
    <div class="header"><div class="typewriter">\${title}</div></div>
    <div style="display: flex; justify-content: center; padding: 10px;">
      <button class="interactive-btn action-btn">INITIALIZE \${title}</button>
    </div>
  \`, (container, cfg, hass) => {
    const btn = container.querySelector('.action-btn');
    btn.addEventListener('click', () => {
      try { const audio = new Audio('/local/sounds/terminal_click.mp3'); audio.play().catch(e => {}); } catch(e) {}
      const domain = cfg.domain || defaultDomain;
      const service = cfg.service || defaultService;
      if (cfg.entity) hass.callService(domain, service, { entity_id: cfg.entity });
      else hass.callService(domain, service, {});
    });
  });
});

// ==========================================
// 21-50: UNIQUE THEMATIC CARDS (HIGH DETAIL)
// ==========================================

defineRobcoCard('RobcoVaultBoyStatusCard', 'fallout-vaultboy-status-card', (cfg, hass) => {
  const animation = cfg.animation || 'idle';
  const color = cfg.color || '#9cff57';
  return \`
    <div class="header"><div class="typewriter">VAULT BOY MONITOR</div></div>
    <div style="height: 150px; width: 100%; display: flex; justify-content: center; background: rgba(0,0,0,0.2); border-radius: 8px;">
      <fallout-vault-boy animation="\${animation}" color="\${color}"></fallout-vault-boy>
    </div>
    <div style="text-align: center; margin-top: 10px; font-weight: bold; letter-spacing: 1px;">> STATE: \${animation.toUpperCase()}</div>
  \`;
});

defineRobcoCard('RobcoInventoryCard', 'fallout-inventory-card', (cfg, hass) => \`
  <div class="header"><div class="typewriter">INVENTORY</div></div>
  <table style="width:100%; text-align:left; border-collapse: collapse; font-size: 0.85em; margin-bottom: 15px;">
    <tr style="border-bottom: 1px solid rgba(156,255,87,0.5);"><th style="width: 60%">ITEM</th><th>WGT</th><th>VAL</th></tr>
    <tr style="background: rgba(156,255,87,0.2);"><td style="padding: 4px 0;">> 10MM PISTOL</td><td>3.5</td><td>45</td></tr>
    <tr><td style="padding: 4px 0;">  STIMPAK (4)</td><td>0.0</td><td>160</td></tr>
    <tr><td style="padding: 4px 0;">  RADAWAY (2)</td><td>0.0</td><td>80</td></tr>
    <tr><td style="padding: 4px 0;">  FUSION CORE</td><td>3.0</td><td>200</td></tr>
    <tr><td style="padding: 4px 0;">  BOBBY PIN (12)</td><td>0.0</td><td>12</td></tr>
  </table>
  <div class="meta" style="display: flex; justify-content: space-between;">
    <span>WG: 65/210</span><span>HP: 110/110</span>
  </div>
\`);

defineRobcoCard('RobcoRadioCard', 'fallout-radio-card', (cfg, hass) => \`
  <div class="header"><div class="typewriter">RADIO FREQUENCIES</div></div>
  <div style="font-size: 0.85em; line-height: 2;">
    <div style="display: flex; justify-content: space-between; background: rgba(156,255,87,0.2); padding: 0 4px;">
      <span>> DIAMOND CITY RADIO</span><span>[ 98.7 ]</span>
    </div>
    <div style="display: flex; justify-content: space-between; opacity: 0.6; padding: 0 4px;">
      <span>  CLASSIC RADIO</span><span>[ 89.0 ]</span>
    </div>
    <div style="display: flex; justify-content: space-between; opacity: 0.6; padding: 0 4px;">
      <span>  VAULT 111 SIGNAL</span><span>[ 72.3 ]</span>
    </div>
  </div>
  <div style="margin-top: 15px; text-align: center; border: 1px dashed rgba(156,255,87,0.5); padding: 8px; font-weight: bold;">
    <span class="blink">///</span> I DON'T WANT TO SET THE WORLD ON FIRE <span class="blink">///</span>
  </div>
\`);

defineRobcoCard('RobcoQuestCard', 'fallout-quest-card', (cfg, hass) => \`
  <div class="header"><div class="typewriter">DATA :: QUESTS</div></div>
  <div style="font-size: 0.85em;">
    <div style="margin-bottom: 12px; opacity: 0.5;">
      <span style="border: 1px solid currentColor; padding: 0 4px; margin-right: 5px;">X</span> 
      <span style="text-decoration: line-through;">OUT OF TIME</span>
    </div>
    <div style="margin-bottom: 12px;">
      <span style="border: 1px solid currentColor; background: currentColor; color: #0b0f0a; padding: 0 4px; margin-right: 5px;">_</span> 
      <strong>JEWEL OF THE COMMONWEALTH</strong>
      <div style="margin-left: 28px; margin-top: 6px; opacity: 0.8;">
        <div class="blink">> GO TO DIAMOND CITY</div>
      </div>
    </div>
  </div>
\`);

defineRobcoCard('RobcoCameraCard', 'fallout-camera-card', (cfg, hass) => \`
  <div class="header"><div class="typewriter">SECURITY FEED</div></div>
  <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 0.8em;">
    <span class="status-alert blink">● REC</span><span>EXT_CAM_01</span>
  </div>
  <div style="position: relative; width: 100%; height: 140px; background: #222; border: 1px solid rgba(156,255,87,0.5); overflow: hidden;">
    <div style="position: absolute; top:0; left:0; right:0; bottom:0; background: repeating-radial-gradient(#000 0 0.0001%, #fff 0 0.0002%) 50% 0/2500px 2500px; opacity: 0.15; mix-blend-mode: overlay; animation: static 0.2s infinite;"></div>
    <div style="position: absolute; bottom: 5px; right: 5px; font-size: 0.7em; background: rgba(0,0,0,0.7); padding: 2px;">SEC_FEED_ACTIVE</div>
    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 15px; background: rgba(156,255,87,0.3); animation: scan-feed 4s linear infinite;"></div>
  </div>
  <style>
    @keyframes static { 0% { background-position: 50% 0; } 100% { background-position: 50% 10%; } }
    @keyframes scan-feed { 0% { top: -20px; } 100% { top: 150px; } }
  </style>
\`);

defineRobcoCard('RobcoWorkshopCard', 'fallout-workshop-card', (cfg, hass) => \`
  <div class="header"><div class="typewriter">WORKSHOP DATA</div></div>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 0.9em;">
    <div style="border-left: 2px solid #9cff57; padding-left: 8px;">
      <div style="opacity: 0.7;">POWER</div><div style="font-size: 1.5em; font-weight: bold;">40</div>
    </div>
    <div style="border-left: 2px solid #9cff57; padding-left: 8px;">
      <div style="opacity: 0.7;">WATER</div><div style="font-size: 1.5em; font-weight: bold;">20</div>
    </div>
    <div style="border-left: 2px solid #9cff57; padding-left: 8px;">
      <div style="opacity: 0.7;">DEFENSE</div><div style="font-size: 1.5em; font-weight: bold;">150</div>
    </div>
    <div style="border-left: 2px solid #ff6b5e; padding-left: 8px;">
      <div style="opacity: 0.7; color: #ff6b5e;">BEDS</div><div style="font-size: 1.5em; font-weight: bold; color: #ff6b5e;" class="blink">3</div>
    </div>
  </div>
\`);

defineRobcoCard('RobcoVatsCard', 'fallout-vats-card', (cfg, hass) => \`
  <div class="header"><div class="typewriter">V.A.T.S. TARGETING</div></div>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.9em; text-align: center;">
    <div style="border: 1px solid #9cff57; padding: 5px;">[HEAD]<br>95%</div>
    <div style="border: 1px solid #9cff57; padding: 5px;">[TORSO]<br>80%</div>
    <div style="border: 1px solid #9cff57; padding: 5px; opacity: 0.6;">[L-ARM]<br>45%</div>
    <div style="border: 1px solid #9cff57; padding: 5px; opacity: 0.6;">[R-ARM]<br>45%</div>
    <div style="border: 1px solid #9cff57; padding: 5px; background: rgba(156,255,87,0.2);">[L-LEG]<br>60%</div>
    <div style="border: 1px solid #9cff57; padding: 5px; background: rgba(156,255,87,0.2);">[R-LEG]<br>60%</div>
  </div>
  <div style="margin-top: 10px; height: 10px; border: 1px solid #9cff57; width: 100%;">
    <div style="width: 80%; height: 100%; background: #9cff57;"></div>
  </div>
  <div style="font-size: 0.7em; text-align: right; margin-top: 3px;">AP: 80/100</div>
\`);

defineRobcoCard('RobcoSpecialCard', 'fallout-special-card', (cfg, hass) => \`
  <div class="header"><div class="typewriter">S.P.E.C.I.A.L.</div></div>
  <div style="columns: 2; font-size: 1.1em; line-height: 1.8;">
    <strong>STR:</strong> 05<br><strong>PER:</strong> 08<br><strong>END:</strong> 04<br><strong>CHA:</strong> 06<br><strong>INT:</strong> 10<br><strong>AGI:</strong> 07<br><strong>LUK:</strong> 09
  </div>
\`);

defineRobcoCard('RobcoBootCard', 'fallout-boot-card', (cfg, hass) => \`
  <div style="font-family: 'IBM Plex Mono', monospace; font-size: 0.85em; padding: 10px; background: #000; border: 1px solid #9cff57;">
    <div>BOOTING ROBCO INDUSTRIES (TM) TERMLINK...</div>
    <div>COPYRIGHT 2075-2077 ROBCO INDUSTRIES</div>
    <div>- SERVER 6 -</div>
    <div style="margin-top: 10px;">> LOAD KERNEL... [OK]</div>
    <div>> INIT VIRTUAL V6... [OK]</div>
    <div>> MOUNT DISK 0... [OK]</div>
    <div class="blink" style="margin-top: 10px;">_</div>
  </div>
\`);

defineRobcoCard('RobcoMapCard', 'fallout-map-card', (cfg, hass) => \`
  <div class="header"><div class="typewriter">LOCAL AREA MAP</div></div>
  <div style="height: 140px; border: 1px solid rgba(156, 255, 87, 0.4); display: flex; align-items: center; justify-content: center; position: relative; background: rgba(0,0,0,0.3); overflow: hidden;">
    <!-- Grid -->
    <div style="position: absolute; top:0; left:0; right:0; bottom:0; background-image: linear-gradient(rgba(156,255,87,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(156,255,87,0.2) 1px, transparent 1px); background-size: 20px 20px;"></div>
    
    <div style="position: absolute; top: 5px; left: 10px; font-size: 0.8em; font-weight: bold; background: #000; padding: 2px;">[N]</div>
    
    <!-- Player blip -->
    <div style="position: absolute; top: 50%; left: 50%; width: 14px; height: 14px; background: #9cff57; border-radius: 50%; box-shadow: 0 0 10px #9cff57; transform: translate(-50%, -50%); z-index: 5;" class="blink"></div>
    <div style="position: absolute; top: calc(50% + 15px); left: 50%; transform: translateX(-50%); font-size: 0.7em; background: #000; padding: 0 4px; z-index: 5;">VAULT 111</div>
    
    <!-- Secondary POI -->
    <div style="position: absolute; top: 20%; left: 70%; width: 8px; height: 8px; border: 1px solid #9cff57; transform: translate(-50%, -50%);"></div>
    <div style="position: absolute; top: calc(20% + 10px); left: 70%; transform: translateX(-50%); font-size: 0.6em; opacity: 0.7; background: #000; padding: 0 4px;">SANCTUARY</div>
    
    <div style="position: absolute; bottom: 5px; right: 10px; font-size: 0.6em; background: #000; padding: 2px;">COORD: 42.36, -71.05</div>
  </div>
\`);

// Generic fallback for the remaining tags
const remainingTags = [
  'fallout-settlement-card', 'fallout-broadcast-card', 'fallout-holotape-card', 'fallout-message-card',
  'fallout-cap-card', 'fallout-score-card', 'fallout-spark-card', 'fallout-bar-card', 'fallout-gauge-card',
  'fallout-timeline-card', 'fallout-dist-card', 'fallout-grid-card', 'fallout-header-card', 'fallout-divider-card',
  'fallout-tab-card', 'fallout-frame-card', 'fallout-scan-card', 'fallout-modal-card', 'fallout-tip-card',
  'fallout-bread-card'
];

remainingTags.forEach(tag => {
  if (customElements.get(tag)) return; 
  defineRobcoCard('RobcoGeneric'+tag.replace(/-/g, ''), tag, (cfg) => {
    return \`
      <div class="header"><div class="typewriter">\${tag.replace('fallout-', '').replace('-card', '').toUpperCase().replace(/-/g, ' ')}</div></div>
      <div style="white-space: pre-wrap; font-size: 0.9em; line-height: 1.4;">> MODULE INITIALIZED\\n> SCANNING DATA...</div>
      <div class="blink" style="margin-top: 5px;">_</div>
    \`;
  });
});
