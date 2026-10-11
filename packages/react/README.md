# @creance-ui/react

A React component library in a frosted-glass style: 95 components in light and dark. It has the general set an app needs (forms, navigation, overlays, tables, feedback) and a set for supervising AI agents: approvals, tool calls, run timelines, diff review, an inbox of everything waiting on a person, and handoffs. No chat components.

```sh
npm install @creance-ui/react @creance-ui/tokens
```

```tsx
import '@creance-ui/tokens/tokens.css';
import '@creance-ui/react/styles.css';
import { ApprovalPrompt } from '@creance-ui/react';

<ApprovalPrompt
  agentName="Deploy Fixer"
  action="npm install zod@3"
  target="web/package.json"
  risk="medium"
  reason="server/validate.ts imports zod, but it is missing from dependencies."
  onAllow={(scope) => allow(scope)}
  onDeny={deny}
/>;
```

Drive everything from an event stream with `useAgentRun(events)`, or try it with no backend using `@creance-ui/react/simulator`. Components take plain props and work on their own.

React 18 or later. Works in the Next.js App Router: modules that need the browser are marked `"use client"`. Plain CSS on `--cr-*` custom properties with no CSS-in-JS runtime; theme it by setting those properties in a `:root` rule. MIT licence.

See the repository README and the project site for docs, live examples, props and accessibility notes.
