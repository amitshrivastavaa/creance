# Plan: Creance

A React UI kit for **human-in-the-loop agent interfaces**: approvals, tool calls, run progress, review and handoffs. No chat UI.

Name: **Creance**, npm packages `creance` (components) and `creance-tokens` (unscoped; the `@creance` org is taken), CSS prefix `cr-`. A creance is the long line a falconer keeps on a bird in training: the bird flies on its own, the human can always bring it back.

---

## 1. Architecture

```
 agent backend (any)          simulator (scripted)
        │                            │
        └──── AgentEvent stream ─────┘        typed union in events.ts
                     │
             useAgentRun(events)              pure reducer → RunState
                     │
        ┌────────────┼──────────────┐
   organisms take plain props (no knowledge of events or the hook)
```

Three rules hold the design together:

1. **Components are dumb.** Every component takes plain props and callbacks. None of them imports the event model, the reducer or the simulator. You can use `ToolCallCard` with data from anywhere.
2. **The event model is the integration seam.** `events.ts` defines a discriminated union. `reduceRun(state, event)` is a pure function; `useAgentRun(events)` is a thin `useReducer` wrapper around it. Any backend that can emit these events gets the whole kit.
3. **Styling is plain CSS on token variables.** No runtime styling cost, works with any framework or SSR setup, and consumers can theme by overriding CSS custom properties.

### Styling decision: plain CSS files with an `cr-` prefix, not CSS Modules

CSS Modules hash class names, which makes it hard for consumers to override a style or target a part. A design system ships a public, stable class API instead: `.cr-button`, `.cr-button[data-variant="primary"]`, `.cr-approval__actions`. Variants and states go in `data-*` attributes, not modifier classes, so the CSS mirrors the props. Each component has a co-located `.css` file. The build concatenates them into one `creance/styles.css`. Every value is a `var(--cr-*)` token; a lint script fails the build on any raw hex colour in component CSS.

### Theming

Tokens build into:

```css
:root { /* light */ }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { /* dark */ } }
:root[data-theme="dark"] { /* dark */ }
```

So the OS setting works by default and `data-theme` forces either theme.

Token tiers: **primitive** (`--cr-blue-600`, `--cr-space-4`) → **semantic** (`--cr-color-bg-surface`, `--cr-color-status-running`). Components use only semantic tokens. I'm skipping a third tier of component tokens; add it if consumers ask to theme one component in isolation.

---

## 2. Package layout

```
creance/
├─ packages/
│  ├─ tokens/                      creance-tokens
│  │  ├─ src/                      JSON: color.json, space.json, type.json, radius.json, motion.json, dark.json
│  │  ├─ style-dictionary.config.mjs
│  │  └─ dist/                     tokens.css, index.js, index.d.ts (generated)
│  └─ react/                       creance
│     ├─ src/
│     │  ├─ atoms/                 one folder per component: Button/Button.tsx, Button.css, Button.test.tsx, index.ts
│     │  ├─ molecules/
│     │  ├─ organisms/
│     │  ├─ templates/
│     │  ├─ internal/              VisuallyHidden, useReducedMotion, formatDuration (not exported)
│     │  ├─ events.ts              AgentEvent union
│     │  ├─ run/                   reduceRun.ts, useAgentRun.ts, reduceRun.test.ts
│     │  ├─ simulator/             createSimulator.ts, scenarios/deployFix.ts   → subpath export
│     │  └─ index.ts
│     └─ codemods/                 (milestone 6) onApprove-to-onAllow.mjs
├─ apps/
│  ├─ docs/                        Storybook; stories live next to the docs here, grouped Atoms/Molecules/Organisms/Templates
│  └─ demo/                        Vite app, one page, wired to the simulator
├─ tests/visual/                   Playwright screenshot specs against built Storybook
├─ docs/                           PLAN.md, ATOMIC.md, MIGRATIONS.md
├─ .changeset/
└─ .github/workflows/ci.yml
```

Package exports for `creance`:

| Entry | Contents |
|---|---|
| `creance` | components, `useAgentRun`, `reduceRun`, event types |
| `creance/simulator` | `createSimulator` and the sample scenario (kept out of the main bundle) |
| `creance/styles.css` | all component CSS (imports nothing; the app also imports `creance-tokens/tokens.css`) |

Build: Vite library mode (ESM only) plus `tsc --emitDeclarationOnly` for types. `react`, `react-dom` and Radix are peer/externals.

Stories: in `apps/docs/stories/**`, not inside the package, so the package source stays free of Storybook types and the docs app owns MDX pages.

---

## 3. Components by Atomic Design level

Pragmatic placement; `docs/ATOMIC.md` will justify each one.

| Level | Component | Notes |
|---|---|---|
| **Atom** | Button | variants: primary, secondary, danger, ghost; sizes sm/md |
| | IconButton | requires `label` (becomes `aria-label`); TS makes it mandatory |
| | Badge | `status`: running, waiting, blocked, done, failed. Colour + icon + text, never colour alone |
| | Spinner | `role="status"` optional; static under reduced motion |
| | Kbd | `<kbd>` |
| | Code | `inline` → `<code>`, `block` → `<pre><code>` with optional copy button |
| | ProgressBar | native `<progress>` styled, or `role="progressbar"` for indeterminate |
| | Avatar | agent identity: initials or icon, deterministic colour from name |
| | Tooltip | Radix Tooltip |
| **Molecule** | StatusBadge | Badge + elapsed time, "Running · 12s"; ticks once a second while running |
| | ToolCallHeader | tool name (Code) + StatusBadge + duration |
| | RiskLabel | low/medium/high; text label always visible |
| | BudgetMeter | ProgressBar + "18.2k / 50k tokens"; warning at 80%, danger at 100% |
| | DiffLine | one line of a diff: +/−/context, line numbers, screen-reader text "added"/"removed" |
| | KeyboardHint | Kbd group + label, "⌘ Enter Allow" |
| **Organism** | ApprovalPrompt | see §5 |
| | ToolCallCard | `<details>` for inputs JSON, lifecycle pending → running → success / error, retry |
| | RunTimeline | nested `<ol>`, live streaming, sticky auto-scroll, "Jump to latest" |
| | DiffReview | hunks with accept/reject, apply-all bar, `j`/`k` between hunks |
| | NeedsYouInbox | grouped by kind, sorted by urgency, counts in headings |
| | AgentHandoffBanner | summary + next actions; focus target when a run ends |
| **Template** | AgentRunLayout | header (Avatar, agent name, StatusBadge, BudgetMeter), timeline left, detail right, inbox in a Radix Dialog drawer |
| **Page** | `apps/demo` | AgentRunLayout wired to the simulator |

Hand-built where the platform covers it: `<details>`/`<summary>` for collapsibles, `<progress>`, `<kbd>`, `<ol>` for timelines. Radix only for **Tooltip** and **Dialog** (the drawer). The plan doesn't need Popover, so I'm leaving it out.

---

## 4. Event model

`packages/react/src/events.ts`. Every event has `type`, `runId` and `ts` (epoch ms).

```ts
type AgentEvent =
  | { type: 'run.started';         agent: AgentInfo; goal: string; budget?: Budget }
  | { type: 'step.started';        stepId: string; parentId?: string; title: string }
  | { type: 'step.completed';      stepId: string }
  | { type: 'step.failed';         stepId: string; error: string }
  | { type: 'tool.call.started';   callId: string; stepId: string; tool: string; input: unknown; attempt: number }
  | { type: 'tool.call.completed'; callId: string; output: unknown }
  | { type: 'tool.call.failed';    callId: string; error: string; retryable: boolean }
  | { type: 'approval.requested';  approvalId: string; action: string; target: string; risk: Risk; reason: string }
  | { type: 'approval.resolved';   approvalId: string; decision: 'allow-once' | 'always-allow' | 'deny' }
  | { type: 'diff.proposed';       diffId: string; file: string; hunks: Hunk[] }
  | { type: 'diff.resolved';       diffId: string; accepted: string[]; rejected: string[] }
  | { type: 'usage';               tokens: number; costUsd?: number }
  | { type: 'run.completed' }
  | { type: 'run.failed';          error: string }
  | { type: 'handoff';             summary: string; nextActions: NextAction[] }
  // each member also carries: runId: string; ts: number
```

Additions to your list: `step.failed`, `diff.resolved` (the run needs to know the review finished), and `usage` (feeds BudgetMeter).

`reduceRun(state, event) → RunState`:

```ts
interface RunState {
  status: 'idle' | 'running' | 'waiting' | 'completed' | 'failed';   // 'waiting' while an approval or diff is open
  agent?: AgentInfo; goal?: string; startedAt?: number; endedAt?: number;
  steps: Step[];                       // tree, built from parentId
  toolCalls: Record<string, ToolCall>; // includes attempts history
  approvals: Approval[]; diffs: Diff[];
  usage: { tokens: number; costUsd: number }; budget?: Budget;
  handoff?: Handoff;
}
```

Unknown or out-of-order events (for example `step.completed` for an unknown step) are ignored, not thrown: a UI must not crash on a flaky stream. Unit tests cover this.

`useAgentRun(events: AgentEvent[])` reduces the array and memoises incrementally (it only reduces the new tail). A `useAgentRun` that takes an array keeps it backend-agnostic: you append events from SSE, a WebSocket or the simulator.

### Simulator

```ts
const sim = createSimulator(scenario, { speed: 1 });
sim.subscribe(event => …); sim.start(); sim.pause(); sim.reset();
sim.respond({ type: 'approval.resolved', … });  // human actions go back in
```

A scenario is a list of `{ after: ms, event }` plus `{ waitFor: 'approval.resolved' | 'diff.resolved' }` gates, so the run genuinely blocks on the human. Uses `setTimeout` only; no dependency.

**Scenario "Fix the failing deploy"** (about 40 s at speed 1):
1. run.started → step "Investigate" → tool `read_file`, `run_tests` (fails: flaky network) → **retry**, attempt 2 succeeds
2. step "Install missing dependency" → **approval.requested** `npm install zod`, risk medium → waits for you
3. step "Patch config" → **diff.proposed**, two hunks → waits for you
4. step "Verify" → `run_tests` succeeds → run.completed → **handoff** with summary and next actions (open PR, view logs)

Stories use the same scenario with `speed: 4` and a "Play" control. Visual regression stories use a frozen snapshot (events reduced up to a fixed point) so screenshots are deterministic.

---

## 5. Accessibility approach

- **Semantics first.** Real `<button>`, `<ol>`, `<details>`, `<progress>`, headings in every organism. ARIA only where HTML has no equivalent.
- **Focus.** `:focus-visible` ring from a token, 3:1 contrast against both themes. No focus traps outside the Radix Dialog.
- **ApprovalPrompt.** Rendered inline as a labelled `role="group"` (not a modal: the user should still be able to read the timeline before deciding). On mount it moves focus to itself (`autoFocus` prop, default true) and announces "Approval needed: npm install, medium risk" through a polite live region. Shortcuts `A` (allow once), `Shift+A` (always), `D` (deny) work **only while focus is inside the prompt**, so the kit never hijacks global keys. After a decision, focus moves to a caller-provided target or the prompt's result line.
- **Live regions.** Each organism owns one visually hidden `role="status"` region and announces **transitions only** (tool failed, approval requested, run completed), not every step, to avoid flooding screen-reader users.
- **Motion.** All transitions use `--cr-motion-duration-*` tokens, set to `0ms` under `prefers-reduced-motion: reduce`. Spinner becomes static, auto-scroll jumps instead of smooth-scrolling.
- **Colour.** Status is never colour alone: Badge always has icon + text. Token pairs are checked for WCAG AA contrast in a unit test.

---

## 6. Tooling and quality gates

| Gate | Tool | Runs on |
|---|---|---|
| Types | `tsc -b` (strict, project references) | every package/app |
| Lint | ESLint flat config: typescript-eslint, react-hooks, jsx-a11y | repo |
| Unit | Vitest + React Testing Library (jsdom) | reducer, simulator, key interactions (shortcuts, retry, hunk accept/reject, auto-scroll pause) |
| Axe on every story | Storybook `addon-a11y` + `addon-vitest` (runs every story as a browser test, a11y set to `error`) | all stories |
| Visual | Playwright screenshots of key stories, light + dark, against static Storybook build | key stories |
| Bundle | `size-limit` with a budget on `creance` (initial budget: 25 kB min+gz JS, excluding peers; tightened once measured) | react package |
| Release | Changesets for versions/changelogs; `pnpm publish -r --dry-run` in CI (`changeset publish` has no dry-run flag) | main |

Visual baselines: generated inside the official Playwright Docker image so local and CI rendering match. A `pnpm test:visual:update` script wraps the Docker call.

CI: one workflow, jobs in parallel (`types-lint-unit`, `storybook-a11y`, `visual`, `bundle`, `release-dry-run`), pnpm store cached, Node 24.

Dev dependencies I'll add (none ship to consumers): Style Dictionary, Vite, TypeScript, ESLint and plugins, Vitest, Testing Library, jsdom, Storybook and addons, Playwright, size-limit, Changesets.
Runtime/peer dependencies: `react`, `react-dom` (peer), `@radix-ui/react-tooltip`, `@radix-ui/react-dialog`. Nothing else without asking.

---

## 7. Milestones

Each ends with green local checks, one commit, and a stop for your review.

| # | Scope | Done when |
|---|---|---|
| 1 | git init, pnpm workspace, TS/ESLint config, tokens package (JSON → CSS vars light/dark + typed TS), Storybook running with a Tokens page, MIT licence, CI skeleton (types + lint) | `pnpm build` and `pnpm storybook` work; Tokens page renders scales in both themes |
| 2 | 9 atoms + 6 molecules with stories; a11y addon + vitest addon wired; axe passes on every story | `pnpm test:stories` green |
| 3 | `events.ts`, `reduceRun` + tests, `useAgentRun`, simulator + scenario, ApprovalPrompt, ToolCallCard, live stories, usage MDX for both | unit + story tests green |
| 4 | RunTimeline, DiffReview, NeedsYouInbox, AgentHandoffBanner, live stories, usage MDX, Introduction page | all organisms have live stories and docs |
| 5 | AgentRunLayout, demo app running the full scenario, Playwright visual tests (light/dark), size-limit budget, full CI | CI green on all jobs |
| 6 | Changesets, `onApprove` → `onAllow` deprecation with dev warning + MIGRATIONS.md + codemod, README case study with demo GIF, ATOMIC.md finalised, final gate check, resume summary | Definition of done met |

---

## 8. Decisions

1. ~~Name~~ Decided: **Creance**, unscoped packages `creance` and `creance-tokens`. Names are claimed on first publish. Note: `hitl-ui` on npm targets the same space; the README will position against it.
2. ~~Styling~~ Decided: plain CSS with the `cr-` prefix (§1).
3. ~~Hosting~~ Decided: Storybook and the demo deploy to GitHub Pages in milestone 5.
