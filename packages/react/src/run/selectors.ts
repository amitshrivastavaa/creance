// Adapters from RunState to the plain props the organisms take.
import type { SkyAgent } from '../organisms/FleetSky';
import type { InboxItem, InboxUrgency } from '../organisms/NeedsYouInbox';
import type { TimelineStep } from '../organisms/RunTimeline';
import type { RunState } from './reduceRun';

/** The step tree, with steps that have an open approval or diff marked as waiting. */
export function timelineSteps(state: RunState): TimelineStep[] {
  const waiting = new Set(
    [
      ...state.approvals.filter((a) => !a.decision).map((a) => a.stepId),
      ...state.diffs.filter((d) => !d.resolution).map((d) => d.stepId),
    ].filter(Boolean),
  );
  const toStep = (id: string): TimelineStep[] => {
    const s = state.steps[id];
    if (!s) return [];
    return [
      {
        id: s.id,
        title: s.title,
        status: waiting.has(s.id) && s.status === 'running' ? 'waiting' : s.status,
        startedAt: s.startedAt,
        endedAt: s.endedAt,
        error: s.error,
        toolCalls: s.toolCallIds.flatMap((cid) => {
          const c = state.toolCalls[cid];
          return c
            ? [{ id: c.id, tool: c.tool, status: c.status, startedAt: c.startedAt, endedAt: c.endedAt, attempt: c.attempt, error: c.error }]
            : [];
        }),
        children: s.childIds.flatMap(toStep),
      },
    ];
  };
  return state.rootStepIds.flatMap(toStep);
}

const riskUrgency: Record<string, InboxUrgency> = { high: 'high', medium: 'normal', low: 'low' };

/** What this run is waiting on a person for, as inbox items. */
export function inboxItems(state: RunState): InboxItem[] {
  const agentName = state.agent?.name ?? 'Agent';
  const items: InboxItem[] = [
    ...state.approvals
      .filter((a) => !a.decision)
      .map((a) => ({
        id: `${state.runId}:${a.id}`,
        kind: 'approval' as const,
        title: `Allow ${a.action}?`,
        detail: a.target,
        agentName,
        createdAt: a.requestedAt,
        urgency: riskUrgency[a.risk] ?? 'normal',
      })),
    ...state.diffs
      .filter((d) => !d.resolution)
      .map((d) => ({
        id: `${state.runId}:${d.id}`,
        kind: 'review' as const,
        title: `Review changes to ${d.file}`,
        detail: `${d.hunks.length} ${d.hunks.length === 1 ? 'hunk' : 'hunks'}`,
        agentName,
        createdAt: d.proposedAt,
        urgency: 'normal' as const,
      })),
  ];
  if (state.status === 'failed') {
    items.push({
      id: `${state.runId}:failed`,
      kind: 'failed-run',
      title: state.goal ?? 'Run failed',
      detail: state.error,
      agentName,
      createdAt: state.endedAt ?? 0,
      urgency: 'high',
    });
  }
  return items;
}

/** This run as one bird in a FleetSky. */
export function skyAgent(state: RunState): SkyAgent {
  const open = state.approvals.find((a) => !a.decision);
  const status = { idle: 'blocked', running: 'running', waiting: 'waiting', completed: 'done', failed: 'failed' } as const;
  return {
    id: state.runId ?? 'run',
    name: state.agent?.name ?? 'Agent',
    status: status[state.status],
    detail: open ? `wants to run ${open.action}` : state.diffs.some((d) => !d.resolution) ? 'has changes to review' : undefined,
  };
}
