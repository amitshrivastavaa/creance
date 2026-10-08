import { describe, expect, test } from 'vitest';
import type { AgentEvent, AgentEventBody } from '../events';
import { initialRunState, reduceRun, type RunState } from './reduceRun';

let ts = 1_000;
const e = (body: AgentEventBody, runId = 'r1'): AgentEvent => ({ ...body, runId, ts: (ts += 100) });
const run = (...events: AgentEvent[]): RunState => events.reduce(reduceRun, initialRunState);
const start = e({ type: 'run.started', agent: { id: 'a', name: 'Agent' }, goal: 'Fix it', budget: { limit: 100, unit: 'tokens' } });

describe('reduceRun', () => {
  test('run.started resets state and records the run', () => {
    const s = run(start);
    expect(s).toMatchObject({ runId: 'r1', status: 'running', goal: 'Fix it', startedAt: start.ts, budget: { limit: 100 } });
  });

  test('builds a nested step tree and tracks completion', () => {
    const s = run(
      start,
      e({ type: 'step.started', stepId: 's1', title: 'Verify' }),
      e({ type: 'step.started', stepId: 's1a', parentId: 's1', title: 'Tests' }),
      e({ type: 'step.completed', stepId: 's1a' }),
      e({ type: 'step.failed', stepId: 's1', error: 'Build broke' }),
    );
    expect(s.rootStepIds).toEqual(['s1']);
    expect(s.steps.s1).toMatchObject({ status: 'failed', error: 'Build broke', childIds: ['s1a'] });
    expect(s.steps.s1a).toMatchObject({ status: 'done', parentId: 's1' });
  });

  test('a failed tool call followed by a retry keeps the attempt history', () => {
    const s = run(
      start,
      e({ type: 'step.started', stepId: 's1', title: 'Investigate' }),
      e({ type: 'tool.call.started', callId: 'c1', stepId: 's1', tool: 'run_tests', input: {}, attempt: 1 }),
      e({ type: 'tool.call.failed', callId: 'c1', error: 'ECONNRESET', retryable: true }),
    );
    expect(s.toolCalls.c1).toMatchObject({ status: 'error', error: 'ECONNRESET', retryable: true });

    const retried = [
      e({ type: 'tool.call.started', callId: 'c1', stepId: 's1', tool: 'run_tests', input: {}, attempt: 2 }),
      e({ type: 'tool.call.completed', callId: 'c1', output: { passed: 3 } }),
    ].reduce(reduceRun, s);
    const call = retried.toolCalls.c1!;
    expect(call).toMatchObject({ status: 'success', attempt: 2, output: { passed: 3 } });
    expect(call.error).toBeUndefined();
    expect(call.attempts.map((a) => a.error)).toEqual(['ECONNRESET', undefined]);
    expect(retried.steps.s1!.toolCallIds).toEqual(['c1']);
  });

  test('status is waiting while an approval or diff is open', () => {
    const asked = run(start, e({ type: 'approval.requested', approvalId: 'a1', action: 'npm install zod', risk: 'medium', reason: 'Missing dep' }));
    expect(asked.status).toBe('waiting');

    const answered = reduceRun(asked, e({ type: 'approval.resolved', approvalId: 'a1', decision: 'allow-once' }));
    expect(answered.status).toBe('running');
    expect(answered.approvals[0]).toMatchObject({ decision: 'allow-once' });

    const diff = reduceRun(answered, e({ type: 'diff.proposed', diffId: 'd1', file: 'a.ts', hunks: [] }));
    expect(diff.status).toBe('waiting');
    const reviewed = reduceRun(diff, e({ type: 'diff.resolved', diffId: 'd1', accepted: ['h1'], rejected: [] }));
    expect(reviewed.status).toBe('running');
    expect(reviewed.diffs[0]!.resolution).toMatchObject({ accepted: ['h1'] });
  });

  test('completion, failure and handoff', () => {
    const done = run(start, e({ type: 'run.completed' }), e({ type: 'handoff', summary: 'Done', nextActions: [] }));
    expect(done).toMatchObject({ status: 'completed', handoff: { summary: 'Done' } });
    expect(run(start, e({ type: 'run.failed', error: 'Out of budget' }))).toMatchObject({ status: 'failed', error: 'Out of budget' });
  });

  test('usage is cumulative, so duplicates are harmless', () => {
    const u = e({ type: 'usage', tokens: 500 });
    expect(run(start, u, u).usage.tokens).toBe(500);
  });

  test('ignores events before run.started, for other runs, or for unknown ids', () => {
    const before = run(e({ type: 'step.started', stepId: 's1', title: 'x' }));
    expect(before).toEqual(initialRunState);

    const s = run(
      start,
      e({ type: 'step.started', stepId: 'x', title: 'Other run' }, 'r2'),
      e({ type: 'step.completed', stepId: 'missing' }),
      e({ type: 'tool.call.completed', callId: 'missing', output: null }),
      e({ type: 'tool.call.started', callId: 'c9', stepId: 'missing', tool: 't', input: null, attempt: 1 }),
      e({ type: 'approval.resolved', approvalId: 'missing', decision: 'deny' }),
    );
    expect(s.rootStepIds).toEqual([]);
    expect(s.toolCalls).toEqual({});
    expect(s.status).toBe('running');
  });

  test('a duplicated step.started does not duplicate the step', () => {
    const started = e({ type: 'step.started', stepId: 's1', title: 'Once' });
    expect(run(start, started, started).rootStepIds).toEqual(['s1']);
  });
});
