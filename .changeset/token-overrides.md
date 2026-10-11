---
'creance-tokens': patch
---

A `:root` rule in your own stylesheet now overrides a token in dark mode too. The dark theme's selectors were more specific than `:root`, so overrides were ignored there. System requests for less transparency, more contrast or reduced motion now always win over a `:root` override.
