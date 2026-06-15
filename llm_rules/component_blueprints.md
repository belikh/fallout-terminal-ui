# Component Blueprints

The real components in this design system. Build on `fallout-core.js` (exposed as
`window.RobCoFallout`); don't invent cards that aren't here.

## Foundation: `fallout-core.js` → `window.RobCoFallout`
- `FalloutBaseCard` — base custom element. Subclass it; implement `_render()` (write `this.body.innerHTML`
  and attach listeners). The base owns the lifecycle, the CRT shell (scanlines/flicker/vignette), and
  entity helpers: `stateObj`, `isAvailable`, `num`, `friendlyName`, `unit`, `callService`, `moreInfo`,
  `header(title, sub)`.
- `FALLOUT_STYLE` — shared styles injected into each card's shadow root.
- `v(name)` — themeable token reference, e.g. `v("accent")` → `var(--fallout-accent, #9cff57)`. Use in
  inline card styles so colours theme correctly.
- `defineFalloutCard(tag, cls, meta)` — register a card + its Lovelace picker entry.
- `defineFalloutEditor(tag, schema)` — build a per-card visual editor from a field schema
  (`{name, type: entity|text|number|boolean, label, placeholder?, domains?}`).
- `escapeHtml(value)` — always escape config/state before injecting into innerHTML.

## Vault Boy engine: `<fallout-vault-boy>`
Hand-drawn mascot web component. Attributes: `animation`, `color`.
States (the only real ones — `window.RobCoFallout.VAULT_BOY_STATES`):
`idle`, `thumbs_up`, `alert`, `radiation`, `sleeping`. Unknown states fall back to `idle`.

## Cards
- `fallout-gauge-card` — numeric sensor → Pip-Boy meter with threshold colours.
- `fallout-status-card` — entity state → `[OK]/[WARN]/[ALERT]` readout.
- `fallout-control-card` — one card, domain-adaptive (toggle / lock / press / slider / cover). Lights gain a brightness slider when dimmable.
- `fallout-light-card` — dedicated lighting panel: power, brightness, colour temperature, colour presets — each shown only when the bulb's `supported_color_modes` reports it.
- `fallout-vaultboy-card` — entity state → Vault Boy pose + level colour.
- `fallout-stats-card` (alias `pipboy-stats-card`) — grouped sensors with healthy-range bars + mascot.
- `fallout-terminal-card` — single entity + optional attributes, terminal style.

See `README.md` for each card's full config options.
