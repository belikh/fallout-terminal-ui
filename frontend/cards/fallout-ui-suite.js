/* 
  ROBCO INDUSTRIES UI COMPONENT SUITE
  Version: 2287.4-EXT
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
  </style>
`;

const defineRobcoCard = (className, tagName, renderFn) => {
  class Card extends HTMLElement {
    set hass(hass) {
      this._hass = hass;
      if (!this.container) {
        this.innerHTML = FALLOUT_STYLES + '<div class="robco-card"></div>';
        this.container = this.querySelector('.robco-card');
      }
      this.container.innerHTML = renderFn(this.config, hass);
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
  ['RobcoSwitchCard', 'fallout-switch-card', 'TOGGLE'],
  ['RobcoButtonCard', 'fallout-button-card', 'EXECUTE'],
  ['RobcoSliderCard', 'fallout-slider-card', 'VALVE'],
  ['RobcoLockCard', 'fallout-lock-card', 'SECURITY SEAL'],
  ['RobcoModeCard', 'fallout-mode-card', 'LOGIC MODE'],
  ['RobcoSequenceCard', 'fallout-sequence-card', 'CMD SEQUENCE'],
  ['RobcoResetCard', 'fallout-reset-card', 'SYSTEM RESET'],
  ['RobcoEStopCard', 'fallout-estop-card', 'EMERGENCY STOP'],
  ['RobcoOverrideCard', 'fallout-override-card', 'MANUAL OVERRIDE'],
  ['RobcoCalibrateCard', 'fallout-calibrate-card', 'CALIBRATION']
].forEach(([cls, tag, title]) => {
  defineRobcoCard(cls, tag, (cfg, hass) => {
    return `
      <div class="header">${title}</div>
      <div style="display: flex; justify-content: center; padding: 10px;">
        <button style="background: none; border: 1px solid #9cff57; color: #9cff57; padding: 5px 15px; cursor: pointer; text-transform: uppercase;">
          INITIALIZE ${title}
        </button>
      </div>
    `;
  });
});

// 21-30: THEMATIC CARDS (VATS, PIP-BOY, ETC)
defineRobcoCard('RobcoVatsCard', 'fallout-vats-card', (cfg, hass) => `
  <div class="header">V.A.T.S. TARGETING SYSTEM</div>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
    <div>HEAD: 95%</div><div>TORSO: 80%</div>
    <div>L-ARM: 45%</div><div>R-ARM: 45%</div>
  </div>
`);

defineRobcoCard('RobcoSpecialCard', 'fallout-special-card', (cfg, hass) => `
  <div class="header">S.P.E.C.I.A.L. STATS</div>
  <div style="columns: 2; font-size: 0.9em;">
    S: 5 | P: 8 | E: 4<br>C: 6 | I: 10 | A: 7 | L: 9
  </div>
`);

// 31-40: ADVANCED LAYOUT & BOOT
defineRobcoCard('RobcoBootCard', 'fallout-boot-card', (cfg, hass) => `
  <div style="font-family: 'IBM Plex Mono', monospace; font-size: 0.85em;">
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
  <div style="height: 100px; border: 1px dashed #9cff57; display: flex; align-items: center; justify-content: center; position: relative;">
    <div style="position: absolute; top: 10px; left: 10px;">[N]</div>
    <div style="width: 10px; height: 10px; background: #9cff57; border-radius: 50%;" class="blink"></div>
    <div style="font-size: 0.7em; margin-top: 40px;">VAULT 111 ENTRANCE</div>
  </div>
`);

defineRobcoCard('RobcoVaultBoyStatusCard', 'fallout-vaultboy-status-card', (cfg, hass) => {
  const animation = cfg.animation || 'idle';
  const color = cfg.color || '#9cff57';
  return `
    <div class="header">VAULT BOY STATUS MONITOR</div>
    <div style="height: 120px; width: 100%; display: flex; justify-content: center;">
      <fallout-vault-boy animation="${animation}" color="${color}"></fallout-vault-boy>
    </div>
    <div style="text-align: center; margin-top: 5px;">> STATE: ${animation.toUpperCase()}</div>
  `;
});

// Refined Generic Generator for remaining cards
const specificLayouts = {
  'fallout-inventory-card': '> WEAPONS (3) | APPAREL (12) | AID (45)',
  'fallout-quest-card': '> [ACTIVE] FIND OVERSEER\n> [COMPLETED] ESCAPE VAULT',
  'fallout-radio-card': 'DIALING... 98.7 DIAMOND CITY RADIO',
  'fallout-camera-card': '[REC] FEED: ENTRANCE_CAM_01',
  'fallout-score-card': 'S.C.O.R.E. LEVEL: 76 [||||||---]',
  'fallout-cap-card': 'BALANCE: 12,450 CAPS',
  'fallout-workshop-card': 'POWER: 40 | WATER: 20 | DEFENSE: 150',
};

const moreTags = [
  'fallout-settlement-card', 'fallout-holotape-card', 'fallout-broadcast-card', 'fallout-message-card',
  'fallout-spark-card', 'fallout-bar-card', 'fallout-gauge-card', 'fallout-timeline-card',
  'fallout-dist-card', 'fallout-grid-card', 'fallout-header-card', 'fallout-divider-card',
  'fallout-tab-card', 'fallout-frame-card', 'fallout-scan-card', 'fallout-modal-card',
  'fallout-tip-card', 'fallout-bread-card', 'fallout-inventory-card', 'fallout-quest-card',
  'fallout-radio-card', 'fallout-camera-card', 'fallout-score-card', 'fallout-cap-card', 'fallout-workshop-card'
];

moreTags.forEach(tag => {
  if (customElements.get(tag)) return; 
  defineRobcoCard('RobcoGeneric'+tag.replace(/-/g, ''), tag, (cfg) => {
    const layout = specificLayouts[tag] || '> MODULE INITIALIZED\n> SCANNING DATA...';
    return `
      <div class="header">${tag.replace('fallout-', '').replace('-card', '').toUpperCase().replace(/-/g, ' ')}</div>
      <div style="white-space: pre-wrap;">${layout}</div>
      <div class="blink">_</div>
    `;
  });
});
