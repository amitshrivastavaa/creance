# Creance

**An open-source React UI kit for supervising AI agents.** It covers the screens where a person approves what an agent wants to do, watches it work, reviews its changes and takes back control when it is done.

![The demo: an agent fixes a failing deploy, asks to install a package, proposes a config diff, and hands back](docs/images/demo.gif)

*The demo app, built only from the kit, plays a simulated agent run: a tool call fails and is retried, the agent asks to install a dependency, proposes a config change for review, then hands back.*

> In falconry, a *creance* is the long line tied to a bird in training. The bird flies and hunts on its own; the falconer can always bring it back.

---

## The problem

Most agent UI work goes into chat: message bubbles, streaming text, prompt boxes. That is well covered already. Once an agent can run commands, edit files and spend money, the harder interface problem is **control and trust**:

- *What exactly is it about to do, and how risky is that?* Approving one specific action, not "continue?".
- *What did it actually do?* Every tool call, input and error, including the ones it retried.
- *Do I accept this change?* Reviewing a diff hunk by hunk before it lands.
- *What is waiting on me?* One place for everything blocked on a person, across agents.
- *Is it finished?* A clear point where the agent hands control back.

Creance is a design system for those screens. It deliberately has no chat components.

## What's in it

90 components across four Atomic Design levels, plus a typed event model and a run simulator. The general-purpose set covers the same ground as Vercel's Geist component list (built in Creance's own style, not copied); the agent-specific organisms are Creance's own. [`docs/ATOMIC.md`](docs/ATOMIC.md) explains where each one sits and why.

| Level | Components |
|---|---|
| **Atoms** (23) | Button, IconButton, Toggle, Badge, StatusDot, Spinner, LoadingDots, Skeleton, Kbd, Code, ProgressBar, Gauge, Avatar, Tooltip, Input, Textarea, Select, Checkbox, Radio, Switch, Separator, MiddleTruncate, ErrorMessage |
| **Molecules** (54) | Forms: Field, RadioGroup, Choicebox, ClearableInput, SearchInput, Combobox, MultiSelect, Calendar, Slider, ToggleGroup, ThemeSwitcher, Feedback. Actions: SplitButton, CopyButton, TextWithCopy, LoadMoreButton, ShowMore. Navigation: Tabs, Menu, ContextMenu, DotsMenu, CommandMenu, Breadcrumbs, Pagination, Scroller, Collapse. Overlays: Dialog, Sheet, DestructiveActionModal, ContextCard, RelativeTimeCard, Toast. Data: Table, FileTree, JsonView, Snippet, Entity, Description, EmptyState, Card. Feedback and media: Alert, Banner, ProjectBanner, ErrorCard, BrowserFrame, PhoneFrame, Video. Agent: StatusBadge ("Running · 12s"), ToolCallHeader, RiskLabel, BudgetMeter, ConfidenceMeter, DiffLine, KeyboardHint |
| **Organisms** (12) | **ApprovalPrompt**, **ToolCallCard**, **RunTimeline**, **DiffReview**, **NeedsYouInbox**, **AgentHandoffBanner**, **FleetSky**, **PlanEditor**, **QuestionCard**, **KillSwitch**, **CheckpointRewind**, **PermissionLedger** |
| **Template** (1) | AgentRunLayout |
| **Page** | `apps/demo`, wired to the simulator |

| Package | What it is |
|---|---|
| [`creance-tokens`](packages/tokens) | Design tokens in JSON, built with Style Dictionary into CSS custom properties (light, dark, solid surfaces for reduced transparency, reduced motion) and a typed JS export |
| [`creance`](packages/react) | The components, the event model, `useAgentRun`, selectors, and `creance/simulator` |
| [`apps/docs`](apps/docs) | Storybook: usage guidelines for every organism, a Tokens page, live stories |
| [`apps/site`](apps/site) | The project site: an overview, guides, and every component running live with code you can edit, plus props and keyboard tables generated from the types |
| [`apps/demo`](apps/demo) | A Vite app that runs one full scenario, consuming the built package like any app would |
| [`apps/next`](apps/next) | A Next.js App Router app that renders all 90 components, used to test server rendering and hydration |

## How it works

```
your agent backend ──┐
                     ├─► AgentEvent stream ─► useAgentRun(events) ─► RunState ─► selectors ─► components (plain props)
creance/simulator ───┘
```

```tsx
const run = useAgentRun(events); // events from SSE, a WebSocket, a log replay or the simulator
const approval = run.approvals.find((a) => !a.decision);

<RunTimeline steps={timelineSteps(run)} />
{approval && (
  <ApprovalPrompt action={approval.action} target={approval.target} risk={approval.risk} reason={approval.reason}
    onAllow={(scope) => respond(approval.id, scope)} onDeny={() => respond(approval.id, 'deny')} />
)}
```

- **`AgentEvent`** is a discriminated union: `run.started`, `step.started`, `tool.call.failed`, `approval.requested`, `diff.proposed`, `handoff` and so on. It is the only contract a backend has to meet.
- **`reduceRun`** is a pure reducer from events to `RunState`. It ignores events for unknown steps, other runs or duplicates instead of throwing, because a live UI has to survive a flaky stream.
- **Components take plain props.** None of them imports the event model; a lint rule enforces it. Use `ToolCallCard` with data from anywhere.
- **The simulator** plays a scripted run as real events with realistic timing. Approval and diff steps block until a person answers through `respond()`, and a denial takes a different branch. The live Storybook stories and the demo both use it.

## Frameworks

Creance is a React library. What has been tested:

| | Status |
|---|---|
| React 19 and React 18 | Tested. Developed on 19; the unit suite also runs on 18 in CI. |
| Vite | Tested. The demo app and Storybook run on it. |
| Next.js 16, App Router | Tested in [`apps/next`](apps/next): every component is rendered by the server and hydrates without errors. |
| Next.js Pages Router, React Router, Remix, Astro | Not tested. Plain React, so expected to work. |
| Vue, Svelte, Angular, Solid | Not supported. Only `creance-tokens` (plain CSS variables) is usable there. |

For the App Router, the 51 modules that use state, effects, Radix or their own event handlers start with `"use client"`, so they can be imported straight into a server component. The other 54, including Button, Input, Badge, Alert and the event reducer, have no client-only code and can run on the server alone. A lint step (`scripts/check-use-client.mjs`) fails if a file needs the directive and lacks it, or if the build drops it. A component that takes a callback, such as `onAllow`, has to be used from a client file, because a server component cannot pass a function as a prop.

## Key decisions and trade-offs

**Plain CSS on tokens, not CSS-in-JS or Tailwind.** Every component has a co-located `.css` file using only `--cr-*` custom properties; the build concatenates them into one `styles.css`. No runtime cost, no CSS imported from JavaScript (which Next.js needs), and theming is overriding variables. Class names are a public, stable API (`.cr-approval__actions`) with variants in `data-*` attributes, instead of CSS Modules' hashed names, so consumers can target parts. The cost is global class names, managed with a `cr-` prefix. A lint step rejects any raw colour in component CSS.

**Two token tiers.** Primitives (`--cr-blue-600`) and semantic tokens (`--cr-color-status-running-fg`); components use only semantic colours. I left out a third, per-component tier until someone needs to theme one component in isolation.

**Headless where it is hard, hand-built where the platform helps.** Ten Radix packages provide the widgets with difficult focus, positioning and dismissal: dialogs, menus, tabs, popovers, tooltips, sliders, toasts, toggle groups and accordions. Checkboxes, radios, switches, selects and progress bars are native elements, as are `<details>` for collapsible JSON, `<ins>`/`<del>` for diffs and nested `<ol>` for the timeline. The combobox, calendar and file tree are hand-built to the ARIA patterns because Radix has no equivalent. Radix is the only runtime dependency.

**Event-model-driven, but not event-model-coupled.** Driving the organisms from one event stream keeps them consistent (a step with an open approval shows as "waiting" everywhere). Keeping the components on plain props means teams with their own state management don't have to adopt it. Adapters like `timelineSteps(run)` sit in between.

**ApprovalPrompt is not a modal.** People usually need to read the timeline before allowing something, so the prompt is an inline, labelled group that takes focus when it appears, instead of trapping it. High-risk actions hide "Always allow" by default.

**Simulated, not connected.** The kit ships with a simulator instead of a real agent integration, so the components can be built, tested and demoed deterministically. Connecting a real backend means emitting `AgentEvent`s; that adapter is not part of this repo.

## Accessibility

The target is WCAG 2.2 AA. What is in place, and how it's checked:

- **Semantics first:** headings, lists, regions and native controls; ARIA only where HTML has no equivalent (`aria-pressed` on hunk decisions, `aria-keyshortcuts`, `aria-current`).
- **Keyboard:** every action works by keyboard. Shortcuts (A / Shift+A / D to allow or deny; J / K / Y / N to review a diff) only work while focus is inside the component and never with Ctrl, Alt or ⌘, so the kit never takes over page keys.
- **Focus:** ApprovalPrompt and AgentHandoffBanner move focus to themselves when they appear (and can be told not to); after a decision, focus moves to the outcome instead of falling to `<body>`. Visible `:focus-visible` rings everywhere.
- **Announcements:** polite live regions announce transitions that need a person (an approval requested, a tool call failed, the run handed back), not every tick, so screen-reader users aren't flooded during a long run.
- **Motion:** all durations come from tokens that drop to `0ms` under `prefers-reduced-motion`; the spinner and pulsing badge stop, and "Jump to latest" scrolls instantly.
- **Not colour alone:** every status and risk level has an icon and text.

The automated checks caught real problems during development: rejected diff hunks dimmed with opacity failed contrast in both themes, headings skipped a level in the demo and template, and a shared stylesheet with the screen-reader-only class was being tree-shaken out of the Storybook bundle. Building the full library surfaced more: two red-on-tint combinations at 4.29:1 and 4.16:1, two unnamed `search` landmarks on one page, two controls whose visible text was missing from their accessible name, and a FleetSky canvas that stayed blank under reduced motion. Bundle measurement also showed the single-file build kept every component for any import; the package now ships one module per source file, and importing only ApprovalPrompt costs 1.87 kB. Automated checks don't replace testing with assistive technology; I haven't yet run a structured screen-reader pass (VoiceOver and NVDA) on every organism, and that is the next accessibility task.

## Testing and quality gates

All of these run in GitHub Actions on every push and pull request (`.github/workflows/ci.yml`):

| Gate | Tooling | Scope |
|---|---|---|
| Types | TypeScript (strict, `noUncheckedIndexedAccess`) | All packages and apps |
| Lint | ESLint (typescript-eslint, react-hooks, jsx-a11y), Atomic import-direction rules, raw-colour check on CSS | Repo |
| Unit and interaction | Vitest + React Testing Library | Reducer, selectors, simulator, codemod, keyboard and focus behaviour (88 tests) |
| React 18 | The same unit suite with React 18 installed (`pnpm test:react18`) | 88 tests; the package is developed on React 19 |
| Accessibility | Storybook addon-vitest + axe, violations fail the build | Every story, in light **and** dark (146 stories, 292 runs) |
| Visual regression | Playwright screenshots, Linux baselines from the Playwright Docker image | 46 key stories × light and dark (92 screenshots) |
| End to end | Playwright + axe | The demo: the full scenario, and the deny path |
| Next.js | Playwright on a Next.js 16 App Router app (`pnpm test:next`) | All 90 components: rendered by the server, hydrated without errors, interactive |
| Site | Playwright on the site (`pnpm test:site`) | All 99 pages and every live example render; editing an example updates its preview |
| Bundle size | size-limit | Budgets: all components 28 kB, ApprovalPrompt alone 2.5 kB, CSS 12 kB, simulator 2.5 kB (brotli, without React and Radix). Today: 25.8 kB, 1.87 kB, 10.9 kB, 2.2 kB |
| Release | Changesets status + `pnpm publish --dry-run` | Both packages |

On `main`, a final job deploys the site, Storybook (at `/storybook/`) and the demo (at `/demo/`) to GitHub Pages.

## Versioning and lifecycle

- **Changesets** for semantic versioning and changelogs. Every change to a published package comes with a changeset; `pnpm version-packages` bumps versions and writes [`packages/react/CHANGELOG.md`](packages/react/CHANGELOG.md).
- **A worked deprecation.** In 0.2.0 `ApprovalPrompt`'s `onApprove` became `onAllow`, so the prop matches the buttons people press. The old prop still works, is marked `@deprecated` in the types, and logs a one-time warning outside production. The changelog links to [`docs/MIGRATIONS.md`](docs/MIGRATIONS.md), which also states the deprecation policy, and the package ships a codemod that renames the prop on `<ApprovalPrompt>` only, using the TypeScript parser:

  ```sh
  npx creance-codemod-on-allow src --dry
  ```

  I ran the codemod on this repo's own demo, stories and tests to migrate them.

## What I'd do at team scale

This is a one-person project. With a team and real consumers, I'd add:

- **A contribution model.** A short RFC (problem, proposed API, accessibility plan, alternatives) for every new organism or breaking change, reviewed by design, engineering and accessibility. Atoms and fixes go through ordinary pull requests. A component isn't "done" until it has docs, stories, axe and interaction tests, and visual baselines; the CI gates above make that the default.
- **Ownership and triage.** A small core team owns the tokens and organisms; product teams contribute behind it. A public roadmap and a weekly triage of issues and requests.
- **Adoption metrics, measured rather than guessed.** Scan consuming repos for imports to see which components are used, which versions, and where teams rebuilt something the kit already has. Track deprecated-API usage to know when a removal is safe. Pair that with qualitative input: office hours, and asking teams why they detach or fork.
- **Release discipline.** Pre-releases for consumers to test, a deprecation window of at least one minor version, and a codemod for every mechanical breaking change.
- **Accessibility as a practice.** Regular manual screen-reader passes, an accessibility sign-off in the RFC, and testing with people who use assistive technology.

## Run it locally

Node 22 or later and pnpm 12.

```sh
pnpm install
pnpm build              # tokens and the component package
pnpm site               # the site, with live examples
pnpm storybook          # stories on http://localhost:6006
pnpm --filter demo dev  # the demo app
```

Checks: `pnpm typecheck`, `pnpm lint`, `pnpm test` (unit and story axe tests), `pnpm test:e2e`, `pnpm test:next` (builds the Next.js app and tests it), `pnpm test:site`, `pnpm test:react18`, `pnpm --filter creance size`. Visual regression runs in Docker so it matches CI: `pnpm test:visual:docker`, or `pnpm test:visual:update` to refresh baselines.

## Status

Version 0.2.0. Not yet published to npm (`pnpm release:dry-run` shows what would go out). The scenario is simulated: no real agent is connected. Built as a portfolio project; there are no production users.

[`docs/PLAN.md`](docs/PLAN.md) has the original plan and architecture notes.

## Licence

MIT
