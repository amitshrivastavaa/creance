---
"creance": minor
"creance-tokens": minor
---

New frosted-glass visual language. Cards, bars, menus and the drawer are translucent with a backdrop blur over a gradient canvas (`--cr-gradient-canvas`); controls are capsules; radii are larger; colours follow Apple's system palette, using the higher-contrast variants so text meets WCAG AA. New tokens: `--cr-color-glass-*`, `--cr-glass-opacity`, `--cr-glass-filter`, `--cr-shadow-glass`, `--cr-gradient-*`, `--cr-radius-xl`, `--cr-font-tracking-*`, `--cr-motion-easing-spring`. New public class `.cr-glass` for your own panels.

Glass turns solid with no blur under `prefers-reduced-transparency: reduce`, `prefers-contrast: more`, or `data-transparency="reduce"` on `<html>`. Apps should set `background: var(--cr-gradient-canvas), var(--cr-color-bg-canvas)` on the page for the full effect; AgentRunLayout does this itself.
