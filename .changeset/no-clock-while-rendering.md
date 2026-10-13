---
'@creance-ui/react': patch
---

StatusBadge, RelativeTimeCard, NeedsYouInbox and Calendar read the current time after they mount instead of while rendering, so they prerender in Next.js 16 with `cacheComponents` (its default for new apps) and no longer risk a hydration mismatch. Until mounted, an open-ended StatusBadge and the inbox's "waiting" time are left out, RelativeTimeCard shows the exact UTC time, and a Calendar with no value, `defaultMonth` or `today` waits to draw its month.
