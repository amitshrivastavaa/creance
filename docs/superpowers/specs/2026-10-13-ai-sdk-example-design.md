# A real agent on Creance, with the Vercel AI SDK

Date: 2026-10-13. Status: approved in conversation (approach A); this spec is awaiting review.

## Why

Everything on the site today runs on the simulator, and the site says so. The first question a developer
asks is "does it work with a real agent?". This example answers it: a real model, real tool calls,
real approvals, driven by the AI SDK code people already write, with Creance as the UI.
It is also what the README video and the launch posts will show.

Success: someone who uses the AI SDK clones the repo, adds an API key, runs one command, and within a minute
sees a real model ask for approval in `ApprovalPrompt`, its tool calls in `RunTimeline`, a proposed file
change in `DiffReview`, its token use in `BudgetMeter`, and can stop it with `KillSwitch`. Reading the code,
they see that the only Creance-specific glue is one small adapter file.

## Constraints

- Local only. Nothing is deployed; there is no hosted key to abuse or pay for. The site links to the source
  and, later, to a recorded video.
- New dependencies live in the example app only, never in `@creance-ui/react`: `next`, `ai`, `@ai-sdk/react`,
  `@ai-sdk/anthropic`, `zod`. Versions are the current stable releases at implementation time, within the
  repo's minimum release age policy.
- Honest: the model is real, the project it works on is not. The README and the page both say so plainly.
- Nothing the agent does touches the developer's disk or network beyond the model API call.

## Where it lives

`apps/ai-sdk`, a Next.js App Router app in the workspace, depending on `@creance-ui/react` and
`@creance-ui/tokens` with `workspace:*`. Its README explains how to use it outside the monorepo
(swap `workspace:*` for the published version).

```
apps/ai-sdk/
  app/
    api/agent/route.ts     the AI SDK route: streamText, the model, the tools
    page.tsx               the page: useChat + useAgentRun + the kit's components
    toAgentEvents.ts       the adapter: AI SDK UI messages -> Creance AgentEvents
    toAgentEvents.test.ts
    project.ts             the in-memory sample project the tools work on
  README.md
  .env.example             ANTHROPIC_API_KEY=, MODEL= (default claude-sonnet-5-5)
```

## Server: `app/api/agent/route.ts`

A standard AI SDK route handler. `streamText` with the model from `@ai-sdk/anthropic` (one line to swap
provider), a system prompt that sets the task, multi-step tool use, and these tools over the sample project:

| Tool | Approval | What it does |
|---|---|---|
| `list_files` | no | Lists the sample project's files. |
| `read_file` | no | Returns one file's text. |
| `run_tests` | no | Runs a scripted check over the current file contents (for example, that `package.json` lists every imported package) and reports pass or fail with output. Deterministic, no processes. |
| `write_file` | yes (`needsApproval: true`) | Proposes new contents for a file. On approval it updates the in-memory project. |

The task mirrors the demo's story so the two read as one product: the sample project's build fails because a
package is imported but missing from `package.json`; the agent is asked to find and fix it.

The sample project is per request state rebuilt from the message history (the AI SDK route is stateless),
so `write_file` results are replayed from earlier approved tool outputs. No server memory, no database.

## Client: `app/page.tsx`

- `useChat` from `@ai-sdk/react`, pointed at `/api/agent`, sending automatically once every approval in the
  last message has an answer.
- `toAgentEvents(messages, status)` turns the messages into `AgentEvent[]`; `useAgentRun(events)` turns those
  into run state, exactly as the demo does with the simulator.
- Layout follows the demo: `AgentRunLayout` with `RunTimeline` (tool calls via `ToolCallCard`), the current
  `ApprovalPrompt`, `DiffReview` for proposed writes, `BudgetMeter` for tokens, `KillSwitch`, and the
  `AgentHandoffBanner` with the model's final summary.
- Answers flow back through the AI SDK, not around it: `ApprovalPrompt`'s allow and deny call `useChat`'s
  approval response for that tool call; `KillSwitch` calls `stop()`.
- A "Start" button sends the fixed task, so the first run needs no typing. A text box allows a follow-up.
- Without an API key the page says so and shows the one line to add, instead of failing.

## The adapter: `toAgentEvents.ts`

A pure function, about 100 lines, the part developers copy. From the assistant messages' parts:

| AI SDK | Creance event |
|---|---|
| first assistant message | `run.started` (agent "Claude", the task as goal, a token budget) |
| each step boundary | `step.started` / `step.completed` |
| tool part, input available | `tool.call.started` |
| tool part, output available | `tool.call.completed` |
| tool part, output error | `tool.call.failed` |
| tool part, approval requested | `approval.requested` (action and target from the input, risk from the tool) and, for `write_file`, `diff.proposed` with hunks computed against the current file |
| approval answered | `approval.resolved` (allow-once or deny) |
| message metadata usage | `usage` (cumulative tokens) |
| status ready after the last step | `run.completed`, then `handoff` with the final text |
| `stop()` or an error | `run.failed` ("Stopped by you" or the error) |

Event ids come from the AI SDK's tool call ids, and timestamps from message metadata, so re-running the
function over the same messages yields the same events; it is safe to call on every render.

The diff for `write_file` is a small line diff (longest common subsequence over lines), in the adapter's
file, no dependency.

## Errors

- Missing key: the route returns a clear 401-style message; the page shows setup instructions.
- Model or network error mid-run: `run.failed` with the message; the page offers "Try again".
- Denied write: the tool returns a denial the model sees; the run continues or ends as the model decides.
- Stopped: `KillSwitch` aborts the stream; the run shows as stopped; nothing further is sent.

## Testing

- `toAgentEvents.test.ts` (vitest): fixtures of AI SDK message arrays for a full run, a denied approval,
  a tool error and a stopped run, asserting the event sequence; plus the line diff.
- An end-to-end Playwright test that runs the page against the AI SDK's mock language model (selected when
  `MOCK=1`), so CI exercises the real route, `useChat`, the adapter and the components without a key:
  start, approve the write, see the diff applied, tests pass, handoff shown; and a second run stopped
  with `KillSwitch`.
- Axe on the page in light and dark, like the other apps.
- Typecheck and lint join the existing CI jobs. A real-model run is done by hand before release, not in CI.

## Out of scope (for later, if it proves itself)

- Shipping the adapter as `@creance-ui/react/ai-sdk`.
- Adapters for LangGraph or Mastra.
- A hosted version.
- Reading or writing the developer's real files.
