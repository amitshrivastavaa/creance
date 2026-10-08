# creance-tokens

Design tokens for Creance: colour, spacing, type, radius, motion and shadow.

```css
@import 'creance-tokens/tokens.css';
```

- `--cr-*` CSS custom properties. Light by default; dark follows `prefers-color-scheme`, and `data-theme="light"` or `data-theme="dark"` on `<html>` forces either.
- Motion durations drop to `0ms` under `prefers-reduced-motion: reduce`.
- `import { tokens, values } from 'creance-tokens'`: `tokens` holds the `var(--cr-…)` references, `values` the resolved light values, both fully typed.

Built from JSON with Style Dictionary. MIT licence.
