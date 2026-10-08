---
"creance": minor
"creance-tokens": minor
---

New visual language: frosted glass, neutral greys and one blue, in light and dark themes. Blue is for the one action that answers a request; ink (near-black in light, off-white in dark) marks what needs you and what is selected; red is only for failure and refusal. Titles and the interface use the system face (SF Pro on Apple devices, Inter elsewhere), commands SF Mono or JetBrains Mono. Buttons are glass capsules, 44px by default.

Four public glass layers: `.cr-window`, `.cr-surface` (tile), `.cr-glass` (sheet) and `.cr-popover`. All turn solid with no blur under `prefers-reduced-transparency`, `prefers-contrast: more` or `data-transparency="reduce"`.

New `FleetSky` organism and `skyAgent(run)` selector: your agents as birds on lines back to you; an agent that needs you flies back on a taut line. Name tags are real buttons, arrivals are announced, and nothing moves under `prefers-reduced-motion`.

Token changes in `creance-tokens` (breaking for anyone reading these variables directly):

- The `slate` primitive palette is now `gray`; new `blue` primitives; `red` gains `300`, `400` and `500`.
- `--cr-glass-opacity` and `--cr-glass-filter` are replaced by per-layer tokens: `--cr-glass-opacity-{window,tile,sheet,popover,control}` and `--cr-glass-filter-{window,sheet}`.
- `--cr-color-accent-*` is now blue (the primary action). The previous ink accent is `--cr-color-ink-*`.
- New: `--cr-color-glass-{window,tile,sheet,popover,control,edge,highlight}`, `--cr-color-text-secondary`, `--cr-color-danger-text`, `--cr-control-height-{md,sm}`, `--cr-radius-2xl`, `--cr-shadow-sheet`, `--cr-shadow-accent`, `--cr-font-size-4xl`, `--cr-font-weight-bold`.
