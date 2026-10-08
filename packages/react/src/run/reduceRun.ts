import type { AgentEvent, AgentInfo, Budget, DiffHunk, NextAction } from '../events';
import type { ApprovalDecision } from '../organisms/ApprovalPrompt';
import type { Risk } from '../molecules/RiskLabel';
import type { ToolCallStatus } from '../molecules/ToolCallHeader';

export interface Step {
  id: string;
  parentId?: string;
  title: string;
  status: 'running' | 'done' | 'failed';
  startedAt: number;
  endedAt?: number;
  error?: string;
  childIds: string[];
  toolCallIds: string[];
}

export interface ToolCallAttempt {
  attempt: number;
  startedAt: number;
  endedAt?: number;
  error?: string;
}

export interface ToolCall {
  id: string;
  stepId: string;
  tool: string;
  input: unknown;
  status: ToolCallStatus;
  attempt: number;
  startedAt: number;
  endedAt?: number;
  output?: unknown;
  error?: string;
  retryable?: boolean;
  /** Every attempt, oldest first, including the current one. */
  attempts: ToolCallAttempt[];
}

export interface Approval {
  id: string;
  stepId?: string;
  action: string;
  target?: string;
  risk: Risk;
  reason: string;
  requestedAt: number;
  decision?: ApprovalDecision;
  resolvedAt?: number;
}

export interface Diff {
  id: string;
  stepId?: string;
  file: string;
  hunks: DiffHunk[];
  proposedAt: number;
  resolution?: { accepted: string[]; rejected: string[]; resolvedAt: number };
}

export type RunStatus = 'idle' | 'running' | 'waiting' | 'completed' | 'failed';

export interface RunState {
  runId?: string;
  status: RunStatus;
  agent?: AgentInfo;
  goal?: string;
  budget?: Budget;
  startedAt?: number;
  endedAt?: number;
  error?: string;
  /** Top-level steps in order. Children hang off `Step.childIds`. */
  rootStepIds: string[];
  steps: Record<string, Step>;
  toolCalls: Record<string, ToolCall>;
  /** In request order. */
  approvals: Approval[];
  diffs: Diff[];
  usage: { tokens: number; costUsd: number };
  handoff?: { summary: string; nextActions: NextAction[]; at: number };
  /** The time of the latest event: a stable "now" for anything derived from the stream. */
  updatedAt?: number;
}

export const initialRunState: RunState = {
  status: 'idle',
  rootStepIds: [],
  steps: {},
  toolCalls: {},
  approvals: [],
  diffs: [],
  usage: { tokens: 0, costUsd: 0 },
};

/** 'waiting' whenever a human decision is open, otherwise 'running'. */
function settle(state: RunState): RunState {
  if (state.status !== 'running' && state.status !== 'waiting') return state;
  const open =
    state.approvals.some((a) => !a.decision) || state.diffs.some((d) => !d.resolution);
  return { ...state, status: open ? 'waiting' : 'running' };
}

function patch<T>(record: Record<string, T>, id: string, change: Partial<T>): Record<string, T> {
  const current = record[id];
  return current ? { ...record, [id]: { ...current, ...change } } : record;
}

/**
 * Pure reducer from one event to the next state.
 * Events for another run, or that reference unknown steps or calls, are ignored rather than thrown:
 * a live UI must survive a flaky or out-of-order stream.
 */
export function reduceRun(state: RunState, event: AgentEvent): RunState {
  if (event.type === 'run.started') {
    return {
      ...initialRunState,
      runId: event.runId,
      status: 'running',
      agent: event.agent,
      goal: event.goal,
      ...(event.budget && { budget: event.budget }),
      startedAt: event.ts,
      updatedAt: event.ts,
    };
  }
  if (!state.runId || event.runId !== state.runId) return state;

  const s: RunState = { ...state, updatedAt: event.ts };

  switch (event.type) {
    case 'step.started': {
      if (s.steps[event.stepId]) return s;
      const step: Step = {
        id: event.stepId,
        title: event.title,
        status: 'running',
        startedAt: event.ts,
        childIds: [],
        toolCallIds: [],
        ...(event.parentId && { parentId: event.parentId }),
      };
      const parent = event.parentId ? s.steps[event.parentId] : undefined;
      const steps = { ...s.steps, [step.id]: step };
      if (parent) steps[parent.id] = { ...parent, childIds: [...parent.childIds, step.id] };
      return {
        ...s,
        steps,
        rootStepIds: parent ? s.rootStepIds : [...s.rootStepIds, step.id],
      };
    }
    case 'step.completed':
      return { ...s, steps: patch(s.steps, event.stepId, { status: 'done', endedAt: event.ts }) };
    case 'step.failed':
      return {
        ...s,
        steps: patch(s.steps, event.stepId, { status: 'failed', endedAt: event.ts, error: event.error }),
      };

    case 'tool.call.started': {
      const step = s.steps[event.stepId];
      if (!step) return s;
      const existing = s.toolCalls[event.callId];
      const attempt: ToolCallAttempt = { attempt: event.attempt, startedAt: event.ts };
      const call: ToolCall = {
        id: event.callId,
        stepId: event.stepId,
        tool: event.tool,
        input: event.input,
        status: 'running',
        attempt: event.attempt,
        startedAt: event.ts,
        attempts: [...(existing?.attempts ?? []), attempt],
      };
      return {
        ...s,
        toolCalls: { ...s.toolCalls, [call.id]: call },
        steps: existing ? s.steps : patch(s.steps, step.id, { toolCallIds: [...step.toolCallIds, call.id] }),
      };
    }
    case 'tool.call.completed':
    case 'tool.call.failed': {
      const call = s.toolCalls[event.callId];
      if (!call) return s;
      const failed = event.type === 'tool.call.failed';
      const attempts = call.attempts.map((a, i) =>
        i === call.attempts.length - 1
          ? { ...a, endedAt: event.ts, ...(failed && { error: event.error }) }
          : a,
      );
      const next: ToolCall = failed
        ? { ...call, status: 'error', endedAt: event.ts, error: event.error, retryable: event.retryable, attempts }
        : { ...call, status: 'success', endedAt: event.ts, output: event.output, attempts };
      if (!failed) {
        delete next.error;
        delete next.retryable;
      }
      return { ...s, toolCalls: { ...s.toolCalls, [call.id]: next } };
    }

    case 'approval.requested': {
      if (s.approvals.some((a) => a.id === event.approvalId)) return s;
      const approval: Approval = {
        id: event.approvalId,
        action: event.action,
        risk: event.risk,
        reason: event.reason,
        requestedAt: event.ts,
        ...(event.stepId && { stepId: event.stepId }),
        ...(event.target && { target: event.target }),
      };
      return settle({ ...s, approvals: [...s.approvals, approval] });
    }
    case 'approval.resolved':
      return settle({
        ...s,
        approvals: s.approvals.map((a) =>
          a.id === event.approvalId ? { ...a, decision: event.decision, resolvedAt: event.ts } : a,
        ),
      });

    case 'diff.proposed': {
      if (s.diffs.some((d) => d.id === event.diffId)) return s;
      const diff: Diff = {
        id: event.diffId,
        file: event.file,
        hunks: event.hunks,
        proposedAt: event.ts,
        ...(event.stepId && { stepId: event.stepId }),
      };
      return settle({ ...s, diffs: [...s.diffs, diff] });
    }
    case 'diff.resolved':
      return settle({
        ...s,
        diffs: s.diffs.map((d) =>
          d.id === event.diffId
            ? { ...d, resolution: { accepted: event.accepted, rejected: event.rejected, resolvedAt: event.ts } }
            : d,
        ),
      });

    case 'usage':
      return { ...s, usage: { tokens: event.tokens, costUsd: event.costUsd ?? s.usage.costUsd } };

    case 'run.completed':
      return { ...s, status: 'completed', endedAt: event.ts };
    case 'run.failed':
      return { ...s, status: 'failed', endedAt: event.ts, error: event.error };
    case 'handoff':
      return { ...s, handoff: { summary: event.summary, nextActions: event.nextActions, at: event.ts } };
  }
}
