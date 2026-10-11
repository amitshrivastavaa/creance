---
"creance": minor
---

Next.js App Router support. The 51 modules that use state, effects, Radix or their own event handlers now start with `"use client"`, so they can be imported directly into a server component; the other 54, including Button, Input, Badge, Alert and the event reducer, stay free of client-only code. A new `apps/next` app renders all 90 components with Next.js 16, and a Playwright suite checks that the server sends them, that they hydrate without errors and that they respond.

The unit tests now also run on React 18 in CI, the oldest version the peer dependency allows.
