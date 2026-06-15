# Fallout Terminal UI — RobCo Industries Design System for Home Assistant

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=for-the-badge)](https://github.com/hacs/integration)
![Version](https://img.shields.io/badge/Version-4.0.1-9cff57.svg?style=for-the-badge)

A high-fidelity, retro-CRT design system for Home Assistant. Inspired by the RobCo Industries Unified Operating System (Pip-Boy 3000 MK IV / Fallout 4/76), this suite provides a set of highly functional, entity-bound cards that bring the wasteland's iconic aesthetic to your smart home.

Every card is built with **"Honesty First" engineering**: no mock data, no facades. They bind directly to your real Home Assistant entities and react instantly to state changes.

---

## ☢️ Features

- **📺 Authentic CRT Atmosphere** — Dynamic scanlines, phosphor flicker, glass-curvature vignette, and glowing interactive elements.
- **🎨 Design Token Architecture** — Centralized CSS variables (`--fallout-*`) allow the entire suite to re-skin instantly via Home Assistant themes.
- **✨ Animated Vault Boy Mascot** — Hand-drawn SVG engine with state-driven poses: `idle`, `thumbs_up`, `alert`, `radiation`, and `sleeping`.
- **🛠️ Domain-Adaptive Controls** — A single "RobCo Control" card that automatically renders the correct UI (toggle, slider, execute, or cover controls) based on the entity's domain.
- **📊 Precision Monitoring** — Segmented gauges, S.T.A.T.S. panels for body composition, and terminal-style diagnostic readouts.
- **🖱️ Visual Editors** — Full support for the Lovelace card editor with schema-validated fields.

---

## 📦 Installation

### HACS (Recommended)
1. Open **HACS** in your Home Assistant instance.
2. Click the three dots in the top-right corner and select **Custom repositories**.
3. Paste the URL of this repository and select **Integration** as the category.
4. Click **Install**, then **Restart Home Assistant**.
5. Go to **Settings** → **Devices & Services** → **Add Integration**.
6. Search for **"Fallout Terminal UI"** and add it. This automatically registers all resources.

### Manual Installation
1. Download the latest release.
2. Copy the `custom_components/fallout_terminal` folder into your Home Assistant's `custom_components` directory.
3. Restart Home Assistant.
4. Add the integration via the UI as described above.

---

## 🎨 Themes

The integration includes three signature themes located in `frontend/themes/fallout_retro.yaml`. These themes set the standard HA variables and the custom `--fallout-*` tokens.

| Theme | Description |
| :--- | :--- |
| `fallout_retro_green` | Classic high-contrast phosphor green (Default). |
| `fallout_retro_amber` | Warm New Vegas / Fallout 3 amber. |
| `fallout_retro_blue` | Cool Fallout 76 / Vault-Tec blue. |

**To apply:** Select the theme in your User Profile or Dashboard settings.

---

## 🧩 Cards Reference

All cards use the `custom:` prefix. Most options are optional, falling back to sensible defaults.

### 1. RobCo Gauge (`fallout-gauge-card`)
A Pip-Boy style meter for numeric sensors with threshold-based color segments.

```yaml
type: custom:fallout-gauge-card
entity: sensor.cpu_temperature
name: CORE TEMP              # Optional title override
min: 0                       # Optional (Default: 0)
max: 100                     # Optional (Default: 100)
unit: "°C"                   # Optional (Default: entity unit)
decimals: 1                  # Optional (Default: 1)
invert: false                # Optional (true = lower values fill the bar)
segments:                    # Optional thresholds (first match wins)
  - { to: 60,  color: "var(--fallout-accent)" }
  - { to: 85,  color: "var(--fallout-warn)" }
  - { to: 100, color: "var(--fallout-alert)" }
```

### 2. RobCo Control (`fallout-control-card`)
The "One Card to Rule Them All." It adapts its interface based on the entity domain:
- **Toggle:** `switch`, `light`, `fan`, `input_boolean`, `automation`, `siren`.
- **Seal/Unseal:** `lock`.
- **Execute:** `button`, `input_button`, `scene`, `script`.
- **Valve/Slider:** `number`, `input_number`.
- **Containment:** `cover` (Open/Stop/Close).

```yaml
type: custom:fallout-control-card
entity: lock.front_door
name: BLAST DOOR
```

### 3. Vault Boy Mascot (`fallout-vaultboy-card`)
Drives the animated mascot from entity states or numeric ranges.

```yaml
type: custom:fallout-vaultboy-card
entity: sensor.radiation_level
name: VAULT MONITOR
default_animation: idle      # idle, thumbs_up, alert, radiation, sleeping
mappings:                    # Threshold rules (first match wins)
  - { state: "on", animation: alert, level: alert }
  - { above: 10,   animation: radiation, level: warn }
  - { below: 1,    animation: sleeping, level: ok }
```

### 4. S.T.A.T.S. Panel (`fallout-stats-card`)
A comprehensive vitals readout for grouped sensors (e.g., body composition).
*Backwards-compatible alias: `pipboy-stats-card`.*

```yaml
type: custom:fallout-stats-card
title: VAULT DWELLER
weight_entity: sensor.body_weight
bmi_entity: sensor.bmi
stable_entity: binary_sensor.scale_stable # Shows "READING STABLE" when on
stats:
  - { label: BODY FAT, entity: sensor.body_fat, min: 0, max: 40, healthy_max: 22, unit: "%" }
  - { label: MUSCLE, entity: sensor.muscle_mass, min: 0, max: 60, healthy_min: 35, unit: "%" }
ideal_min_entity: sensor.target_weight_min
ideal_max_entity: sensor.target_weight_max
weight_scale_min: 40         # Optional (Default: 40)
weight_scale_max: 110        # Optional (Default: 110)
```

### 5. Terminal Status (`fallout-status-card`)
A clean diagnostic status line. Automatically maps `binary_sensor` problem classes.

```yaml
type: custom:fallout-status-card
entity: binary_sensor.perimeter_breach
name: SECURITY GRID
states:
  "on": { label: BREACH DETECTED, level: alert }
  "off": { label: SECURE, level: ok }
```

### 6. RobCo Terminal (`fallout-terminal-card`)
Detailed entity log, showing state and raw attributes in a terminal scroll.

```yaml
type: custom:fallout-terminal-card
entity: sun.sun
title: SOLAR TELEMETRY
show_attributes: true
```

---

## 🔧 Design Tokens

Customize the aesthetic by overriding these variables in your theme or via `card-mod`:

- `--fallout-accent`: Primary phosphor color (lines, borders, highlights).
- `--fallout-text`: Standard text color.
- `--fallout-bg`: CRT background color.
- `--fallout-warn`: Threshold warning color (Amber).
- `--fallout-alert`: Threshold alert color (Red).
- `--fallout-glow`: Text-shadow and glow intensity.
- `--fallout-scanline-opacity`: Intensity of the CRT scanlines.

---

## 🛠️ Development & Testing

This project uses a dedicated test harness for rapid frontend iteration without needing a live Home Assistant instance.

1. Open `test/test-harness.html` in any browser to see all cards rendered with mock data.
2. Run `node test/screenshot.mjs` to generate a visual verification snapshot.

---

## 📜 License

Distributed under the MIT License. Homage to the Fallout series by Bethesda Game Studios.

*RobCo Industries Unified Operating System — Version 4.0.1*
