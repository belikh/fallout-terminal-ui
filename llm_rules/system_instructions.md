# SYSTEM PROTOCOL: LLM CODE GENERATION RULES FOR FALLOUT UI

When asked to generate Home Assistant themes, dashboard YAML, card-mod styles, or custom card components under this framework, you MUST strictly adhere to the following architectural dictates:

## 1. Geometric & Structural Constraints
* No modern fluid roundings. All `border-radius` parameters must be clamped between `0px` and `6px`.
* Containers must utilize sharp borders with high-contrast inner dropshadows to simulate physical cathode-ray tube (CRT) housings.
* Enforce hard dividing structures. Use `divider-color` attributes with transparent alphas (`rgba(156, 255, 87, 0.18)`) instead of white spaces or margins to break content sections.

## 2. Textual Rendering Protocol
* Transform all static titles, system headers, and raw states to **UPPERCASE** automatically within your generation loops.
* Typography must exclusive use mono-spaced font families. Do not allow `Roboto`, `Segoe UI`, or default system sans-serif injections.
* Prepend execution carets (`>`, `>>`, `[OK]`, `[WARN]`) to structural data lists and entity labels to maintain terminal immersion.

## 3. UI Inventory Structural Matrix
Map user layout requirements using the following structural component mapping matrix:

| Requested Component Type | Core Lovelace Mapping | Custom Layout Style Mandate |
| :--- | :--- | :--- |
| **Terminal Header** | `type: custom:mushroom-chips-card` | Strict horizontal chip alignment, no background pill shapes, glowing text shadows. |
| **Stat Panel** | `type: grid` / `columns: 4` | Compact numeric visualization with raw unit suffix transformations. |
| **List Panel** | `type: entities` | Remove individual icon backgrounds. Set line-height to explicit terminal bounds. |
| **Alert Panel** | `type: custom:card-mod` wrap | Set background state to `rgba(255, 107, 94, 0.08)`, override standard borders with radiation red. |

## 4. Anti-Patterns to Intercept and Correct
* **NEVER** inject smooth gradient color shifts, material blurs (`backdrop-filter: blur`), or decorative neon gradients.
* **NEVER** allow full-color icon groupings (e.g., standard blue for water, yellow for lights). Filter every icon color down through `var(--paper-item-icon-color)` or explicit monochrome variables matching the active theme color path.
* **NEVER** utilize complex smooth animation curves (`cubic-bezier`). If state changes require motion, use instant state step transitions or low-frequency square-wave flashing animations (`step-start`, `step-end`).
