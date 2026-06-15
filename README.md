# Fallout Terminal UI — RobCo Industries Design System for Home Assistant

A retro-CRT Fallout-themed design system for Home Assistant Lovelace. Every card binds to **your own
entities** and re-skins through a single set of design tokens, so one theme switch repaints the whole
suite in phosphor green, New Vegas amber, or Fallout 76 blue.

> This is a focused set of real, entity-bound cards — not a padded catalogue. Each card does a
> genuine job and reflects the state of the thing it monitors.

---

## Features

- **6 entity-bound cards** — gauge, status, control, Vault Boy, stats (Pip-Boy), terminal.
- **One domain-adaptive control card** — renders the right control (toggle / lock / press / slider /
  cover) for whatever entity you give it, instead of a separate card per action.
- **Themed via design tokens** — three themes drive `--fallout-*` CSS variables that all cards
  consume; cards fall back to phosphor green when no Fallout theme is active.
- **CRT atmosphere** — scanlines, phosphor flicker, glass-curvature vignette, glowing text.
- **Animated Vault Boy mascot** — a hand-drawn `<fallout-vault-boy>` web component with 5 genuinely
  distinct, state-driven poses: `idle`, `thumbs_up`, `alert`, `radiation`, `sleeping`. (A
  higher-fidelity art set may replace these later without changing card configs.)
- **Per-card visual editors** — each card exposes exactly its own options in the dashboard UI.
- **No fake entities** — the integration only serves the frontend and registers the cards.

---

## Installation

### HACS (recommended)
1. HACS → Integrations → top-right menu → **Custom repositories**.
2. Add this repo URL and select **Integration**.
3. Install, then **restart Home Assistant**.
4. Add the integration (Settings → Devices & Services → **Add Integration** → "Fallout Terminal UI").
   It registers the cards and Vault Boy engine automatically — nothing to add to your Lovelace
   resources by hand.

### Manual
1. Copy `custom_components/fallout_terminal` into your HA `custom_components` directory.
2. Restart Home Assistant and add the integration as above.

---

## Themes

Three themes live in `frontend/themes/fallout_retro.yaml`. Select one per-dashboard or in your user
profile:

- `fallout_retro_green` — classic high-contrast phosphor green
- `fallout_retro_amber` — warm New Vegas amber
- `fallout_retro_blue` — cool Fallout 76 blue

Each theme sets both the standard Home Assistant variables and the `--fallout-*` design tokens, so
switching it re-skins the whole card suite.

---

## Cards

All cards take `type: custom:<name>`. Most options are optional; only `entity` is usually required.

### `fallout-gauge-card`
Pip-Boy meter for any numeric sensor, with threshold colours.
```yaml
type: custom:fallout-gauge-card
entity: sensor.reactor_output
name: REACTOR OUTPUT      # optional
min: 0                    # optional (default 0)
max: 100                  # optional (default 100)
unit: "%"                 # optional (defaults to the entity's unit)
invert: false             # optional (true = lower values fill the bar)
segments:                 # optional; first matching upper-bound wins
  - { to: 60,  color: "var(--fallout-accent)" }
  - { to: 85,  color: "var(--fallout-warn)" }
  - { to: 100, color: "var(--fallout-alert)" }
```

### `fallout-status-card`
Terminal status readout that maps an entity's state to a label + severity (`[OK]` / `[WARN]` /
`[ALERT]`). Sensible defaults for `binary_sensor` `device_class: problem`.
```yaml
type: custom:fallout-status-card
entity: binary_sensor.hull_breach
name: HULL INTEGRITY      # optional
states:                   # optional per-state label + level (ok | warn | alert)
  on:  { label: BREACH DETECTED, level: alert }
  off: { label: SEALED,          level: ok }
```

### `fallout-control-card`
One control that adapts to the entity's domain:
- toggleable (`switch`/`light`/`fan`/`input_boolean`/`automation`/`humidifier`/`siren`) → ON/OFF toggle
- `lock` → SEAL / UNSEAL
- momentary (`button`/`input_button`/`scene`/`script`) → EXECUTE press
- numeric (`input_number`/`number`) → slider
- `cover` → OPEN / STOP / CLOSE
```yaml
type: custom:fallout-control-card
entity: switch.perimeter_turret
name: TURRET              # optional
```

### `fallout-vaultboy-card`
Drives the Vault Boy mascot from an entity's state. First matching rule wins.
```yaml
type: custom:fallout-vaultboy-card
entity: sensor.radiation          # optional; omit for a static pose
name: VAULT MONITOR               # optional
default_animation: thumbs_up      # optional (default idle)
mappings:                         # optional
  - { state: "on", animation: alert, level: alert }
  - { above: 5,    animation: radiation, level: warn }
  - { below: 1,    animation: sleeping, level: ok }
```
Valid animations: `idle`, `thumbs_up`, `alert`, `radiation`, `sleeping`
(see `window.RobCoFallout.VAULT_BOY_STATES`).

### `fallout-stats-card`
Pip-Boy S.T.A.T.S. panel for grouped sensors, with healthy-range bars and a reactive mascot.
Backwards-compatible alias: `pipboy-stats-card`.
```yaml
type: custom:fallout-stats-card
title: VAULT DWELLER
weight_entity: sensor.body_weight   # optional headline value
bmi_entity:    sensor.bmi           # optional
stable_entity: binary_sensor.scale  # optional ("on" = fresh reading)
stats:
  - { label: BODY FAT, entity: sensor.body_fat, min: 0, max: 40, healthy_max: 22, unit: "%" }
  - { label: MUSCLE,   entity: sensor.muscle,   min: 0, max: 60, healthy_min: 35, unit: "%" }
ideal_min_entity: sensor.ideal_weight_min   # optional; draws a target weight range
ideal_max_entity: sensor.ideal_weight_max
```

### `fallout-terminal-card`
Terminal-style diagnostic readout for one entity, optionally listing its attributes.
```yaml
type: custom:fallout-terminal-card
entity: switch.perimeter_turret
title: DEVICE LOG        # optional
show_attributes: true    # optional
```

---

## Example dashboard

See [`demo_dashboard.yaml`](demo_dashboard.yaml) for a full example using your own entities. Minimal
version:

```yaml
title: TERMINAL
views:
  - title: SYSTEM
    theme: fallout_retro_green
    type: sections
    sections:
      - title: DIAGNOSTICS
        cards:
          - type: custom:fallout-gauge-card
            entity: sensor.cpu_temperature
            name: CORE TEMP
          - type: custom:fallout-vaultboy-card
            entity: binary_sensor.front_door
            mappings:
              - { state: "on", animation: alert, level: alert }
            default_animation: thumbs_up
```

---

## Development

`test/test-harness.html` renders every card against a mock `hass` with no Home Assistant required.
`node test/screenshot.mjs` produces a headless screenshot for visual verification.

---

*RobCo Industries Unified Operating System — design system v4.0.0*
