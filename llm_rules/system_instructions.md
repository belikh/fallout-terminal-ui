# SYSTEM PROTOCOL: Generating for the RobCo Fallout Design System

When generating cards, themes, or dashboard YAML for this framework, follow these rules.

## 1. Honesty first
- Bind to **real entities**. Never hardcode fake game data (fixed inventories, made-up S.P.E.C.I.A.L.
  numbers, simulated readings) into a card. If there's no entity, show "no signal", not invented data.
- Don't pad. One good domain-adaptive card beats nine near-identical ones. Don't claim animations or
  cards that don't exist.

## 2. Theming via tokens
- Colour everything through `--fallout-*` tokens, referenced with a fallback:
  `var(--fallout-accent, #9cff57)`. In JS, use `RobCoFallout.v("accent")`.
- **Never** write a self-referential `:host` token block (`--x: var(--x, …)`) — CSS treats it as a
  cyclic dependency and collapses every colour to inherited black.
- Severity colours: ok → accent, warn → `--fallout-warn`, alert → `--fallout-alert`.

## 3. Card structure
- Extend `FalloutBaseCard`; implement `_render()`. The base provides the CRT shell, so don't re-draw
  scanlines/borders. Use `this.header(...)` and the entity helpers.
- Escape all interpolated config/state with `escapeHtml()`.
- Provide `getStubConfig()` + a per-card editor via `defineFalloutEditor()`.
- Register with `defineFalloutCard()`.

## 4. Visual style
- Monospace font (the token already sets it), uppercase headers, execution carets (`>`, `>>`,
  `[OK]/[WARN]/[ALERT]`).
- `text-shadow: 0 0 4px var(--fallout-glow)` for phosphor glow. `border-radius` ≤ 6px.
- No material blur, no decorative neon gradients, no full-colour icon groupings. Keep it CRT.

## 5. Verify
- Render via `test/test-harness.html` against a mock `hass` before claiming a card works. A card that
  hasn't been watched rendering isn't done.
