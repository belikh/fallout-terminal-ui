/* 
  ROBCO INDUSTRIES UI COMPONENT SUITE
  Version: 2287.4-EXT-ULTRA
  Contains: Diagnostic, Control, Layout, and Thematic Cards
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

const defineRobcoCard = (className, tagName, renderFn, attachEventsFn = null) => {
  class Card extends HTMLElement {
    set hass(hass) {
      this._hass = hass;
      if (!this.container) {
        this.innerHTML = FALLOUT_STYLES + '<div class="robco-card"></div>';
        this.container = this.querySelector('.robco-card');
        this.container.innerHTML = renderFn(this.config, hass);
        if (attachEventsFn) attachEventsFn(this.container, this.config, hass);
      } else {
        // Update content if needed, but preserve event listeners by checking innerHTML logic.
        // For simplicity in this suite, we re-render and re-attach.
        this.container.innerHTML = renderFn(this.config, hass);
        if (attachEventsFn) attachEventsFn(this.container, this.config, hass);
      }
    }
    setConfig(config) { this.config = config; }
    getCardSize() { return 2; }
  }
  customElements.define(tagName, Card);
};

// 1-10: DIAGNOSTIC CARDS
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
    return `
      <div class="header">${title}</div>
      <div style="font-size: 1.1em;">> MONITORING... [ <span class="${statusClass}">${state.state}</span> ]</div>
      <div class="meta">
        <div>UUID: ${cfg.entity || '0x0000'}</div>
        <div>LINK: SECURE_V6_LINE</div>
      </div>
    `;
  });
});

// 11-20: CONTROL CARDS
[
  ['RobcoSwitchCard', 'fallout-switch-card', 'TOGGLE', 'switch', 'toggle'],
  ['RobcoButtonCard', 'fallout-button-card', 'EXECUTE', 'button', 'press'],
  ['RobcoSliderCard', 'fallout-slider-card', 'VALVE', 'input_number', 'set_value'],
  ['RobcoLockCard', 'fallout-lock-card', 'SECURITY SEAL', 'lock', 'toggle'],
  ['RobcoModeCard', 'fallout-mode-card', 'LOGIC MODE', 'input_select', 'select_next'],
  ['RobcoSequenceCard', 'fallout-sequence-card', 'CMD SEQUENCE', 'script', 'turn_on'],
  ['RobcoResetCard', 'fallout-reset-card', 'SYSTEM RESET', 'homeassistant', 'restart'],
  ['RobcoEStopCard', 'fallout-estop-card', 'EMERGENCY STOP', 'homeassistant', 'stop'],
  ['RobcoOverrideCard', 'fallout-override-card', 'MANUAL OVERRIDE', 'input_boolean', 'toggle'],
  ['RobcoCalibrateCard', 'fallout-calibrate-card', 'CALIBRATION', 'homeassistant', 'update_entity']
].forEach(([cls, tag, title, defaultDomain, defaultService]) => {
  defineRobcoCard(cls, tag, (cfg, hass) => {
    return `
      <div class="header"><div class="typewriter">${title}</div></div>
      <div style="display: flex; justify-content: center; padding: 10px;">
        <button class="interactive-btn action-btn">
          INITIALIZE ${title}
        </button>
      </div>
    `;
  }, (container, cfg, hass) => {
    const btn = container.querySelector('.action-btn');
    btn.addEventListener('click', () => {
      // Provide audio feedback if possible
      try { const audio = new Audio('/local/sounds/terminal_click.mp3'); audio.play().catch(e => {}); } catch(e) {}
      
      const domain = cfg.domain || defaultDomain;
      const service = cfg.service || defaultService;
      if (cfg.entity) {
        hass.callService(domain, service, { entity_id: cfg.entity });
      } else {
        hass.callService(domain, service, {});
      }
    });
  });
});


// 21-30: THEMATIC CARDS
defineRobcoCard('RobcoVatsCard', 'fallout-vats-card', (cfg, hass) => `
  <div class="header">V.A.T.S. TARGETING</div>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.9em;">
    <div>[HEAD] 95%</div><div>[TORSO] 80%</div>
    <div>[L-ARM] 45%</div><div>[R-ARM] 45%</div>
    <div>[L-LEG] 60%</div><div>[R-LEG] 60%</div>
  </div>
`);

defineRobcoCard('RobcoSpecialCard', 'fallout-special-card', (cfg, hass) => `
  <div class="header">S.P.E.C.I.A.L.</div>
  <div style="columns: 2; font-size: 1.1em; line-height: 1.6;">
    STR: 05 | PER: 08<br>END: 04 | CHA: 06<br>INT: 10 | AGI: 07<br>LUK: 09
  </div>
`);

// 31-40: ADVANCED LAYOUT & BOOT
defineRobcoCard('RobcoBootCard', 'fallout-boot-card', (cfg, hass) => `
  <div style="font-family: 'IBM Plex Mono', monospace; font-size: 0.85em; padding: 10px; background: #000; border: 1px solid #9cff57;">
    <div>BOOTING ROBCO INDUSTRIES (TM) TERMLINK...</div>
    <div>COPYRIGHT 2075-2077 ROBCO INDUSTRIES</div>
    <div>- SERVER 6 -</div>
    <div style="margin-top: 10px;">> LOAD KERNEL... [OK]</div>
    <div>> INIT VIRTUAL V6... [OK]</div>
    <div>> MOUNT DISK 0... [OK]</div>
    <div class="blink" style="margin-top: 10px;">_</div>
  </div>
`);

defineRobcoCard('RobcoMapCard', 'fallout-map-card', (cfg, hass) => `
  <div class="header">LOCAL AREA MAP</div>
  <div style="height: 120px; border: 1px dashed rgba(156, 255, 87, 0.4); display: flex; align-items: center; justify-content: center; position: relative; background: rgba(0,0,0,0.3);">
    <div style="position: absolute; top: 5px; left: 10px; font-size: 0.8em;">[N]</div>
    <div style="width: 12px; height: 12px; background: #9cff57; border-radius: 50%; box-shadow: 0 0 10px #9cff57;" class="blink"></div>
    <div style="font-size: 0.7em; margin-top: 50px;">VAULT 111 ENTRANCE</div>
    <div style="position: absolute; bottom: 5px; right: 10px; font-size: 0.6em;">COORD: 42.3601, -71.0589</div>
  </div>
`);

defineRobcoCard('RobcoVaultBoyStatusCard', 'fallout-vaultboy-status-card', (cfg, hass) => {
  const animation = cfg.animation || 'idle';
  const color = cfg.color || '#9cff57';
  return `
    <div class="header">VAULT BOY MONITOR</div>
    <div style="height: 150px; width: 100%; display: flex; justify-content: center; background: rgba(0,0,0,0.2); border-radius: 8px;">
      <fallout-vault-boy animation="${animation}" color="${color}"></fallout-vault-boy>
    </div>
    <div style="text-align: center; margin-top: 10px; font-weight: bold; letter-spacing: 1px;">> STATE: ${animation.toUpperCase()}</div>
  `;
});

// 41-50: MISC UTILITY
const miscTags = [
  'fallout-quest-card', 'fallout-inventory-card', 'fallout-workshop-card', 'fallout-radio-card',
  'fallout-cap-card', 'fallout-camera-card', 'fallout-settlement-card', 'fallout-broadcast-card',
  'fallout-holotape-card', 'fallout-message-card'
];

const specificLayouts = {
  'fallout-inventory-card': '> WEAPONS (3)\n> APPAREL (12)\n> AID (45)\n> MISC (102)',
  'fallout-quest-card': '> [ACTIVE] FIND OVERSEER\n> [COMPLETED] ESCAPE VAULT',
  'fallout-radio-card': 'DIALING...\n98.7 DIAMOND CITY RADIO\n[ SIGNAL STRENGTH: 88% ]',
  'fallout-camera-card': '[REC] FEED: ENTRANCE_CAM_01\nBUFFERING... [OK]',
  'fallout-cap-card': 'BALANCE: 12,450 CAPS\nDAILY CHANGE: +450',
  'fallout-workshop-card': 'POWER: 40 | WATER: 20\nDEFENSE: 150 | BEDS: 12',
  'fallout-settlement-card': 'POPULATION: 12\nHAPPINESS: 85%\nRESOURCES: STABLE',
  'fallout-broadcast-card': 'EMERGENCY BROADCAST SYSTEM\nALL CLEAR IN SECTOR 7',
  'fallout-holotape-card': 'READING HOLOTAPE...\nTITLE: OVERSEER LOG 01\nLENGTH: 02:45',
  'fallout-message-card': '1 NEW MESSAGE\nFROM: VAULT-TEC CENTRAL\nPRIORITY: URGENT'
};

miscTags.forEach(tag => {
  if (customElements.get(tag)) return; 
  defineRobcoCard('RobcoGeneric'+tag.replace(/-/g, ''), tag, (cfg) => {
    const layout = specificLayouts[tag] || '> MODULE INITIALIZED\n> SCANNING DATA...';
    return `
      <div class="header"><div class="typewriter">${tag.replace('fallout-', '').replace('-card', '').toUpperCase().replace(/-/g, ' ')}</div></div>
      <div style="white-space: pre-wrap; font-size: 0.9em; line-height: 1.4;">${layout}</div>
      <div class="blink" style="margin-top: 5px;">_</div>
    `;
  });
});
