---
"creance": minor
"creance-tokens": minor
---

New visual language modelled on Apple's Liquid Glass. Glass is reserved for the functional layer that floats above content (buttons, tooltips, the run header, the diff toolbar, the drawer); content cards are solid `.cr-surface`s. The glass has a tinted, blurred fill, edge refraction (Chromium; an SVG displacement filter generated per element), a specular rim, and press feedback; AgentRunLayout adds a scroll edge effect under its floating header. Colours follow Apple's system palette in its higher-contrast variants, so text meets WCAG AA. New tokens include `--cr-color-glass-*`, `--cr-color-accent-glass`, `--cr-glass-*`, `--cr-gradient-rim`, `--cr-gradient-canvas`, `--cr-shadow-glass`, `--cr-shadow-card`, `--cr-radius-xl` and `--cr-motion-easing-spring`; new public classes `.cr-glass` (with `data-glass="clear"`) and `.cr-surface`.

Glass turns solid with no blur or refraction under `prefers-reduced-transparency: reduce`, `prefers-contrast: more`, or `data-transparency="reduce"` on `<html>`.
