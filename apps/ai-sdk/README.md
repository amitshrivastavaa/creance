# Creance with the Vercel AI SDK

A real model fixes a failing build, and Creance is the screen you supervise it from: each step and tool call
in `RunTimeline`, a package install waiting in `ApprovalPrompt`, a file edit shown first in `DiffReview`,
tokens in `BudgetMeter`, and a `KillSwitch` that stops it.

The model is real. The project it works on is not: a few files held in memory, rebuilt on every request.
Nothing reads or writes your disk, and nothing runs except the model call.

## Run it

From the root of this repo:

```sh
pnpm install
pnpm build                                  # builds @creance-ui/react, which the app uses
cp apps/ai-sdk/.env.example apps/ai-sdk/.env.local   # then add your ANTHROPIC_API_KEY
pnpm --filter ai-sdk-example dev            # http://localhost:6030
```

No key? `MOCK=1 pnpm --filter ai-sdk-example dev` runs the same page against a scripted model.

## How it fits together

| File | What it is |
|---|---|
| `app/agent.ts` | An ordinary AI SDK `ToolLoopAgent` with five tools. `install_package` and `write_file` use `toolApproval: 'user-approval'`. Nothing here knows about Creance. |
| `app/api/agent/route.ts` | A standard `createAgentUIStreamResponse` route. The model is one line; swap in any AI SDK provider. |
| `app/toAgentEvents.ts` | **The adapter, and the only Creance-specific glue.** It reads `useChat`'s messages and returns Creance `AgentEvent`s. Copy this file. |
| `app/AgentRun.tsx` | `useChat` → `toAgentEvents` → `useAgentRun` → the kit's components. Answers go back through the AI SDK: `addToolApprovalResponse` for approvals and diffs, `stop()` for the kill switch. |
| `app/project.ts` | The in-memory sample project and its two checks. |
| `app/mock.ts` | The scripted model behind `MOCK=1`, used by the end-to-end tests. |

How AI SDK tool parts become Creance events:

| AI SDK | Creance |
|---|---|
| `step-start` | a step in the timeline, titled from its first tool call |
| tool part, `input-available` / `output-available` / `output-error` | `tool.call.started` / `completed` / `failed` |
| tool part, `approval-requested` | `approval.requested`, or for `write_file`, `diff.proposed` against the file the agent last read |
| approval answered, `output-denied` | `approval.resolved` or `diff.resolved`, and the call fails as "Denied by you" |
| message metadata `tokens` | `usage` |
| status `ready` with nothing left to answer | `run.completed` and a `handoff` with the model's last message |

## Use it outside this repo

Copy `apps/ai-sdk` and change `"@creance-ui/react": "workspace:*"` and `"@creance-ui/tokens": "workspace:*"` in
`package.json` to the published versions.

## Before you point it at anything real

The tools here only touch the in-memory project. If yours change real files, spend money or call other services:

- Keep every such tool behind `toolApproval`.
- The AI SDK rebuilds the conversation from what the browser sends, so approvals arrive as client input. Use
  `experimental_toolApprovalSecret` so a crafted request cannot approve a call by itself (see the AI SDK's
  Tool Approvals guide).
- Give the run a real budget and stop condition.

## Tests

- `pnpm --filter ai-sdk-example test`: the adapter and its line diff.
- `pnpm test:ai-sdk` (from the root): the page end to end against the scripted model, including axe in both themes.
