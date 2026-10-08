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

22 components across four Atomic Design levels, plus a typed event model and a run simulator. [`docs/ATOMIC.md`](docs/ATOMIC.md) explains where each one sits and why.

| Level | Components |
|---|---|
| **Atoms** (9) | Button, IconButton, Badge, Spinner, Kbd, Code, ProgressBar, Avatar, Tooltip |
| **Molecules** (6) | StatusBadge ("Running · 12s"), ToolCallHeader, RiskLabel, BudgetMeter, DiffLine, KeyboardHint |
| **Organisms** (6) | **ApprovalPrompt**, **ToolCallCard**, **RunTimeline**, **DiffReview**, **NeedsYouInbox**, **AgentHandoffBanner** |
| **Template** (1) | AgentRunLayout |
| **Page** | `apps/demo`, wired to the simulator |

| Package | What it is |
|---|---|
| [`creance-tokens`](packages/tokens) | Design tokens in JSON, built with Style Dictionary into CSS custom properties (light, dark, reduced motion) and a typed JS export |
| [`creance`](packages/react) | The components, the event model, `useAgentRun`, selectors, and `creance/simulator` |
| [`apps/docs`](apps/docs) | Storybook: usage guidelines for every organism, a Tokens page, live stories |
| [`apps/demo`](apps/demo) | A Vite app that runs one full scenario, consuming the built package like any app would |

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

## Key decisions and trade-offs

**Plain CSS on tokens, not CSS-in-JS or Tailwind.** Every component has a co-located `.css` file using only `--cr-*` custom properties; the build concatenates them into one `styles.css`. No runtime cost, works with any framework and with server rendering, and theming is overriding variables. Class names are a public, stable API (`.cr-approval__actions`) with variants in `data-*` attributes, instead of CSS Modules' hashed names, so consumers can target parts. The cost is global class names, managed with a `cr-` prefix. A lint step rejects any raw colour in component CSS.

**Two token tiers.** Primitives (`--cr-blue-600`) and semantic tokens (`--cr-color-status-running-fg`); components use only semantic colours. I left out a third, per-component tier until someone needs to theme one component in isolation.

**Headless where it is hard, hand-built where the platform helps.** Radix provides the Tooltip and the inbox Dialog (positioning, focus trapping, dismissal). Everything else uses native elements: `<details>` for collapsible JSON, `<progress>` for the budget, `<ins>`/`<del>` for diffs, nested `<ol>` for the timeline. Those are the only two runtime dependencies.

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

The automated checks caught real problems during development: rejected diff hunks dimmed with opacity failed contrast in both themes, headings skipped a level in the demo and template, and a shared stylesheet with the screen-reader-only class was being tree-shaken out of the Storybook bundle. Automated checks don't replace testing with assistive technology; I haven't yet run a structured screen-reader pass (VoiceOver and NVDA) on every organism, and that is the next accessibility task.

## Testing and quality gates

All of these run in GitHub Actions on every push and pull request (`.github/workflows/ci.yml`):

| Gate | Tooling | Scope |
|---|---|---|
| Types | TypeScript (strict, `noUncheckedIndexedAccess`) | All packages and apps |
| Lint | ESLint (typescript-eslint, react-hooks, jsx-a11y), Atomic import-direction rules, raw-colour check on CSS | Repo |
| Unit and interaction | Vitest + React Testing Library | Reducer, selectors, simulator, codemod, keyboard and focus behaviour of each organism (35 tests) |
| Accessibility | Storybook addon-vitest + axe, violations fail the build | Every story, in light **and** dark (92 stories, 184 runs) |
| Visual regression | Playwright screenshots, Linux baselines from the Playwright Docker image | 14 key stories × light and dark (28 screenshots) |
| End to end | Playwright + axe | The demo: the full scenario, and the deny path |
| Bundle size | size-limit | All components 9 kB, ApprovalPrompt alone 2.5 kB, CSS 4 kB, simulator 2.5 kB (brotli) |
| Release | Changesets status + `pnpm publish --dry-run` | Both packages |

On `main`, a final job deploys Storybook and the demo to GitHub Pages.

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
pnpm storybook          # docs on http://localhost:6006
pnpm --filter demo dev  # the demo app
```

Checks: `pnpm typecheck`, `pnpm lint`, `pnpm test` (unit and story axe tests), `pnpm test:e2e`, `pnpm --filter creance size`. Visual regression runs in Docker so it matches CI: `pnpm test:visual:docker`, or `pnpm test:visual:update` to refresh baselines.

## Status

Version 0.2.0. Not yet published to npm (`pnpm release:dry-run` shows what would go out). The scenario is simulated: no real agent is connected. Built as a portfolio project; there are no production users.

[`docs/PLAN.md`](docs/PLAN.md) has the original plan and architecture notes.

## Licence

MIT
