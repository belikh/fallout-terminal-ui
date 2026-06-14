# Fallout Terminal UI & Integration System for Home Assistant

Welcome to the **RobCo Industries Unified Operating System v2.0**. This project provides a comprehensive, high-fidelity retro-CRT interface for Home Assistant, inspired by the iconic terminals and Pip-Boys of the Fallout universe.

## 🚀 Features (Version 2.0)

*   **High-Fidelity Vault Boy Animation Engine:** Features 34 distinct CSS-animated, high-detail vector SVG states (S.P.E.C.I.A.L. attributes, combat, status effects, etc.).
*   **50+ Specialized UI Cards:** A massive library of RobCo-styled cards for diagnostics, controls, thematic views (V.A.T.S., S.P.E.C.I.A.L., Map), and miscellaneous utilities.
*   **Interactive Controls:** Fully functional buttons and switches that trigger actual Home Assistant services directly from the terminal cards.
*   **Authentic CRT Atmosphere:** Pervasive phosphor flicker, scanlines, radial curvature, and glowing text shadows (`text-shadow`, `drop-shadow`).
*   **Typewriter Text Effects:** Animated terminal boot-up and data loading headers.
*   **Multi-Color Themes:** Support for classic Phosphor Green, New Vegas Amber, and Fallout 76 Blue.
*   **Vault Mainframe Integration:** A custom Python component generating a simulated Vault Diagnostic sensor.

---

## 🛠️ Installation

### Option 1: HACS (Recommended)
This repository is fully HACS-compliant as an **Integration**. You no longer need to add it twice!
1. Open HACS in Home Assistant.
2. Go to **Integrations** -> Top right menu -> **Custom repositories**.
3. Add this repository URL (`https://github.com/belikh/fallout-terminal-ui`) and select **Integration**.
4. Install the integration.
5. **Restart Home Assistant.**
6. *That's it!* The Python integration will automatically serve the UI files and register them to your Lovelace dashboards.

### Option 2: Manual
1. Copy the `custom_components/fallout_terminal` folder to your Home Assistant `custom_components` directory.
2. Restart Home Assistant.

---

## 🎨 Visual Editor Support

All 50+ cards now feature full **Visual Editor** support in Home Assistant. 
When editing a dashboard, simply click "Add Card" and search for "RobCo" or scroll down to the Custom section. You'll get a user-friendly UI to select your entities, override domains/services, and preview the Vault Boy animations in real-time.

---

## 🎨 Themes

The suite includes three distinct color profiles. Select them in your Home Assistant profile or set them per-dashboard/view:

*   **`fallout_retro_green`**: The classic, high-contrast phosphor green.
*   **`fallout_retro_amber`**: The warm, degraded amber of New Vegas.
*   **`fallout_retro_blue`**: The cool, modern cyan of Fallout 76.

---

## 🏃‍♂️ Vault Boy Animation Engine

The `<fallout-vault-boy>` custom web component supports 34 unique animations. You can integrate it directly into your own cards or use the included `fallout-vaultboy-status-card`.

**Available States:**
`idle`, `walking`, `thumbs_up`, `alert`, `radiation`, `combat`, `crafting`, `running`, `sleeping`, `dead`, `strength`, `perception`, `endurance`, `charisma`, `intelligence`, `agility`, `luck`, `hacking`, `lockpicking`, `healing`, `trading`, `scavenging`, `repairing`, `drinking`, `eating`, `chems`, `heavy_weapons`, `energy_weapons`, `explosives`, `stealth`, `speech`, `science`, `swimming`, `flying`.

---

## 🗂️ Component Library

This package provides over 50 specific custom elements registered in your Lovelace UI. 

### Diagnostic Cards (Read-only)
Prefix: `custom:fallout-[type]-card`
Types: `mainframe`, `power`, `water`, `food`, `defense`, `rad`, `temp`, `humid`, `o2`, `hull`.

### Control Cards (Interactive)
Prefix: `custom:fallout-[type]-card`
Types: `switch`, `button`, `slider`, `lock`, `mode`, `sequence`, `reset`, `estop`, `override`, `calibrate`.
*Note: Ensure you pass the `entity` parameter in the card configuration to bind it to a real HA entity.*

### Thematic & Layout Cards
Types: `custom:fallout-vats-card`, `custom:fallout-special-card`, `custom:fallout-boot-card`, `custom:fallout-map-card`, `custom:fallout-stat-panel`.

### Miscellaneous
Types: `quest`, `inventory`, `workshop`, `radio`, `cap`, `camera`, `settlement`, `broadcast`, `holotape`, `message`.

---

## ⚙️ Example Dashboard Configuration

Check the `demo_dashboard.yaml` file in this repository for a massive, multi-theme showcase. Here is a minimal example:

```yaml
title: "TERMINAL"
theme: "fallout_retro_green"
views:
  - title: "SYSTEM"
    type: "sections"
    sections:
      - title: "DIAGNOSTICS"
        cards:
          - type: "custom:fallout-vaultboy-status-card"
            animation: "thumbs_up"
          - type: "custom:fallout-mainframe-card"
            entity: "sensor.vault_mainframe_core_status"
      - title: "CONTROLS"
        cards:
          - type: "custom:fallout-switch-card"
            entity: "switch.my_smart_plug"
```

---
*RobCo Industries Unified Operating System - Copyright 2075-2077*
