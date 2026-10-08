/**
 * The event model: the one integration point between an agent backend and the kit.
 * Any backend that can emit these events (over SSE, a WebSocket, a log replay or the bundled simulator)
 * can drive every organism through `useAgentRun`. Components never import this file.
 */
import type { DiffLineType } from './molecules/DiffLine';
import type { ApprovalDecision } from './organisms/ApprovalPrompt';
import type { Risk } from './molecules/RiskLabel';

export interface AgentInfo {
  id: string;
  name: string;
}

export interface Budget {
  limit: number;
  unit: 'tokens' | 'usd';
}

export interface DiffHunkLine {
  type: DiffLineType;
  content: string;
  oldNumber?: number;
  newNumber?: number;
}

export interface DiffHunk {
  id: string;
  /** The `@@ -12,4 +12,6 @@` header. */
  header: string;
  lines: DiffHunkLine[];
}

export interface NextAction {
  id: string;
  label: string;
  primary?: boolean;
}

/** Event payloads without the envelope. Scenarios are written in this shape. */
export type AgentEventBody =
  | { type: 'run.started'; agent: AgentInfo; goal: string; budget?: Budget }
  | { type: 'step.started'; stepId: string; parentId?: string; title: string }
  | { type: 'step.completed'; stepId: string }
  | { type: 'step.failed'; stepId: string; error: string }
  | { type: 'tool.call.started'; callId: string; stepId: string; tool: string; input: unknown; attempt: number }
  | { type: 'tool.call.completed'; callId: string; output: unknown }
  | { type: 'tool.call.failed'; callId: string; error: string; retryable: boolean }
  | {
      type: 'approval.requested';
      approvalId: string;
      stepId?: string;
      action: string;
      target?: string;
      risk: Risk;
      reason: string;
    }
  | { type: 'approval.resolved'; approvalId: string; decision: ApprovalDecision }
  | { type: 'diff.proposed'; diffId: string; stepId?: string; file: string; hunks: DiffHunk[] }
  | { type: 'diff.resolved'; diffId: string; accepted: string[]; rejected: string[] }
  /** Cumulative usage so far, not a delta, so a replayed or duplicated event is harmless. */
  | { type: 'usage'; tokens: number; costUsd?: number }
  | { type: 'run.completed' }
  | { type: 'run.failed'; error: string }
  | { type: 'handoff'; summary: string; nextActions: NextAction[] };

/** Every event carries the run it belongs to and a timestamp (epoch ms). */
export type AgentEvent = AgentEventBody & { runId: string; ts: number };

export type AgentEventType = AgentEvent['type'];
