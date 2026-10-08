# creance

React components for supervising AI agents: approvals, tool calls, run timelines, diff review, an inbox of everything waiting on a person, and handoffs. Not chat.

```sh
npm install creance creance-tokens
```

```tsx
import 'creance-tokens/tokens.css';
import 'creance/styles.css';
import { ApprovalPrompt } from 'creance';

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

Drive everything from an event stream with `useAgentRun(events)`, or try it with no backend using `creance/simulator`. Components take plain props and work on their own.

React 18 or later. Plain CSS on `--cr-*` custom properties; no CSS-in-JS runtime. MIT licence.

See the repository README and the Storybook for docs, usage guidelines and accessibility notes.
